-- ===========================================================================
-- Clima Zoe — catálogo (migración inicial)
--
-- Decisiones que vale la pena tener presentes:
--
--  * El COSTO DEL PROVEEDOR no es legible por el público. El rol `anon` no
--    tiene ninguna política de SELECT sobre `productos`, así que con RLS
--    activo no puede leer esa tabla en absoluto. Lo único que puede leer es
--    la vista `catalogo_publico`, que corre con los privilegios de su dueño
--    (no `security_invoker`) y no expone `precio_proveedor`. Así el costo no
--    depende de que el frontend "se acuerde" de no pedirlo.
--
--  * Un producto se publica cuando tiene IMAGEN, no cuando tiene precio.
--    Clima Zoe vende por cotización: exigir precio dejaría el catálogo
--    entero apagado. Lo que no se admite es una imagen rota en producción.
--
--  * Mayorista/minorista son dos columnas y no una tabla `segmentos`: hoy la
--    única diferencia entre segmentos es el número. Si aparecen reglas
--    propias (mínimos, escalas por volumen), se migra a `producto_precios`.
--
--  * La reconciliación con el proveedor es por `slug_proveedor`, no por SKU:
--    el proveedor repite SKU entre productos distintos y deja 47 de 213 sin
--    SKU.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- --------------------------------------------------------------------------
-- categorías (árbol de 2-3 niveles: Baterías > Gel)
-- --------------------------------------------------------------------------
create table if not exists categorias (
  id             uuid primary key default gen_random_uuid(),
  nombre         text not null,
  slug           text not null unique,
  parent_id      uuid references categorias(id) on delete set null,
  descripcion    text,
  icono_url      text,
  orden          int not null default 0,
  activo         boolean not null default true,
  slug_proveedor text unique,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists categorias_parent_idx on categorias(parent_id);

-- --------------------------------------------------------------------------
-- productos
-- --------------------------------------------------------------------------
do $$ begin
  create type disponibilidad_t as enum ('in_stock', 'out_of_stock', 'pre_order');
exception when duplicate_object then null; end $$;

do $$ begin
  create type modo_compra_t as enum ('whatsapp', 'bold', 'contraentrega', 'cotizacion');
exception when duplicate_object then null; end $$;

create table if not exists productos (
  id                uuid primary key default gen_random_uuid(),
  nombre            text not null,
  slug              text not null unique,
  categoria_id      uuid references categorias(id) on delete set null,

  descripcion_corta text,
  descripcion_larga text,
  especificaciones  jsonb not null default '{}'::jsonb,

  -- Precios de venta de Clima Zoe. Se definen tras la llamada con el proveedor.
  precio_minorista  numeric(12,2),
  precio_mayorista  numeric(12,2),
  -- COSTO INTERNO. Nunca sale por la vista pública.
  precio_proveedor  numeric(12,2),
  moneda            text not null default 'COP',

  slug_proveedor    text unique,
  sku_proveedor     text,
  marca             text,
  unidad_venta      text,
  disponibilidad    disponibilidad_t not null default 'in_stock',
  modo_compra       modo_compra_t,

  activo            boolean not null default false,
  destacado         boolean not null default false,
  orden             int not null default 0,

  fichas_tecnicas   jsonb not null default '[]'::jsonb,
  videos            jsonb not null default '[]'::jsonb,
  fuente_url        text,
  creado_en         timestamptz not null default now(),
  actualizado_en    timestamptz not null default now()
);

create index if not exists productos_categoria_idx on productos(categoria_id);
create index if not exists productos_activo_idx    on productos(activo) where activo;
-- No único a propósito: ver el encabezado.
create index if not exists productos_sku_idx on productos(sku_proveedor)
  where sku_proveedor is not null;

-- Búsqueda por texto sobre nombre y descripción corta.
create index if not exists productos_busqueda_idx on productos
  using gin (to_tsvector('spanish', nombre || ' ' || coalesce(descripcion_corta, '')));

-- --------------------------------------------------------------------------
-- imágenes
-- --------------------------------------------------------------------------
create table if not exists producto_imagenes (
  id             uuid primary key default gen_random_uuid(),
  producto_id    uuid not null references productos(id) on delete cascade,
  -- Null mientras la imagen propia no esté subida; en ese caso se sirve
  -- `url_origen`. Ver la vista: usa coalesce entre las dos.
  url_cloudinary text,
  url_origen     text,
  alt            text,
  orden          int not null default 0,
  creado_en      timestamptz not null default now(),
  constraint imagen_con_alguna_url check (
    url_cloudinary is not null or url_origen is not null
  )
);

create index if not exists producto_imagenes_producto_idx
  on producto_imagenes(producto_id, orden);

-- --------------------------------------------------------------------------
-- No publicar productos sin imagen
-- --------------------------------------------------------------------------
create or replace function verificar_publicable() returns trigger
language plpgsql as $$
begin
  new.actualizado_en := now();

  -- Se exige imagen, no precio: el negocio vende por cotización y pedir
  -- precio dejaría el catálogo entero apagado.
  if new.activo and not exists (
    select 1 from producto_imagenes where producto_id = new.id
  ) then
    raise exception 'No se puede activar "%": no tiene ninguna imagen', new.nombre;
  end if;

  return new;
end;
$$;

drop trigger if exists productos_verificar_publicable on productos;
create trigger productos_verificar_publicable
  before insert or update on productos
  for each row execute function verificar_publicable();

-- --------------------------------------------------------------------------
-- Vista pública: lo ÚNICO que puede leer el sitio
--
-- Sin `security_invoker`, así que corre con los privilegios de su dueño y
-- puede leer `productos` aunque `anon` no tenga política sobre esa tabla.
-- Ese es justamente el mecanismo que protege `precio_proveedor`.
-- --------------------------------------------------------------------------
create or replace view catalogo_publico as
select
  p.slug                as id,
  p.nombre,
  p.sku_proveedor       as sku,
  cr.slug               as categoria,
  c.slug                as subcategoria,
  -- ['Baterías', 'Gel'] si la categoría tiene padre; ['Baterías'] si no.
  array_remove(array[cr.nombre, nullif(c.nombre, cr.nombre)], null) as ruta,
  p.descripcion_corta   as resumen,
  p.descripcion_larga   as descripcion,
  p.especificaciones    as specs,
  -- Sólo precios de VENTA. El costo no aparece.
  jsonb_strip_nulls(jsonb_build_object(
    'minorista', p.precio_minorista,
    'mayorista', p.precio_mayorista
  ))                    as precios,
  (p.disponibilidad <> 'out_of_stock') as disponible,
  p.unidad_venta        as unidad,
  coalesce((
    select jsonb_agg(coalesce(i.url_cloudinary, i.url_origen) order by i.orden)
    from producto_imagenes i where i.producto_id = p.id
  ), '[]'::jsonb)       as imagenes,
  p.videos,
  p.fichas_tecnicas     as fichas,
  p.destacado,
  p.orden
from productos p
left join categorias c  on c.id = p.categoria_id
left join categorias cr on cr.id = coalesce(c.parent_id, c.id)
where p.activo;

create or replace view categorias_publicas as
select
  c.slug,
  c.nombre,
  padre.slug as parent,
  (
    select count(*) from productos p
    join categorias pc on pc.id = p.categoria_id
    where p.activo and (pc.id = c.id or pc.parent_id = c.id)
  ) as conteo
from categorias c
left join categorias padre on padre.id = c.parent_id
where c.activo;

-- --------------------------------------------------------------------------
-- RLS y permisos
-- --------------------------------------------------------------------------
alter table categorias        enable row level security;
alter table productos         enable row level security;
alter table producto_imagenes enable row level security;

-- Ninguna política de SELECT para `anon` sobre `productos`: con RLS activo
-- eso significa denegado. El público entra por las vistas.
revoke all on productos         from anon, authenticated;
revoke all on producto_imagenes from anon, authenticated;
revoke all on categorias        from anon, authenticated;

grant select on catalogo_publico    to anon, authenticated;
grant select on categorias_publicas to anon, authenticated;

-- La escritura queda sólo para service_role (scripts de import y panel interno).
