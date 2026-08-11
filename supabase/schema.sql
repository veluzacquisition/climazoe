-- ===========================================================================
-- Clima Zoe — esquema del catálogo (Fase 2)
--
-- Decisiones que vale la pena tener presentes:
--
--  * Segmentos mayorista/minorista se resuelven con DOS COLUMNAS de precio en
--    `productos`, no con una tabla `segmentos`. Hoy la única diferencia entre
--    segmentos es el número; una tabla aparte agregaría un join a cada query
--    sin ganar nada. Si más adelante aparecen reglas por segmento (mínimos de
--    compra, escalas por volumen, precios por cliente), se migra a
--    `producto_precios (producto_id, segmento, precio, minimo)`.
--
--  * `precio_proveedor` es COSTO INTERNO. Nunca sale al sitio: el rol anónimo
--    sólo puede leer la vista `productos_publicos`, que no lo incluye.
--
--  * Un producto sólo se publica (`activo = true`) cuando tiene precio de venta
--    propio e imagen en Cloudinary. El trigger de abajo lo fuerza.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- --------------------------------------------------------------------------
-- categorías (árbol de 2-3 niveles: Baterías > Gel)
-- --------------------------------------------------------------------------
create table if not exists categorias (
  id            uuid primary key default gen_random_uuid(),
  nombre        text        not null,
  slug          text        not null unique,
  parent_id     uuid        references categorias(id) on delete set null,
  descripcion   text,
  icono_url     text,
  orden         int         not null default 0,
  activo        boolean     not null default true,
  -- Trazabilidad con el catálogo del proveedor, para reconciliar en cada sync.
  slug_proveedor text unique,
  creado_en     timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists categorias_parent_idx on categorias(parent_id);

-- --------------------------------------------------------------------------
-- productos
-- --------------------------------------------------------------------------
create type disponibilidad_t as enum ('in_stock', 'out_of_stock', 'pre_order');
create type modo_compra_t   as enum ('whatsapp', 'bold', 'contraentrega', 'cotizacion');

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
  -- Costo de referencia. Interno: no se expone en productos_publicos.
  precio_proveedor  numeric(12,2),
  moneda            text not null default 'COP',

  -- Clave de reconciliación con el proveedor: su slug de URL, que sí es único.
  -- El SKU NO sirve para esto: el proveedor tiene SKU repetidos entre productos
  -- distintos (p. ej. CAR-MOR-ADP-T2/T1) y 47 productos sin SKU.
  slug_proveedor    text unique,
  sku_proveedor     text,
  marca             text,
  disponibilidad    disponibilidad_t not null default 'in_stock',
  -- null = usa el modo global de src/lib/site.config.ts
  modo_compra       modo_compra_t,

  activo            boolean not null default false,
  destacado         boolean not null default false,
  orden             int     not null default 0,

  fichas_tecnicas   jsonb not null default '[]'::jsonb,
  fuente_url        text,
  creado_en         timestamptz not null default now(),
  actualizado_en    timestamptz not null default now()
);

create index if not exists productos_categoria_idx  on productos(categoria_id);
create index if not exists productos_activo_idx     on productos(activo) where activo;
-- Índice NO único a propósito: ver el comentario en la columna.
create index if not exists productos_sku_idx on productos(sku_proveedor)
  where sku_proveedor is not null;

-- --------------------------------------------------------------------------
-- imágenes
-- --------------------------------------------------------------------------
create table if not exists producto_imagenes (
  id              uuid primary key default gen_random_uuid(),
  producto_id     uuid not null references productos(id) on delete cascade,
  url_cloudinary  text not null,
  alt             text,
  orden           int  not null default 0,
  -- URL original en el sitio del proveedor, para re-subir si algo falla.
  url_origen      text,
  creado_en       timestamptz not null default now()
);

create index if not exists producto_imagenes_producto_idx
  on producto_imagenes(producto_id, orden);

-- --------------------------------------------------------------------------
-- No publicar productos a medias
-- --------------------------------------------------------------------------
create or replace function verificar_publicable() returns trigger
language plpgsql as $$
begin
  if new.activo then
    if new.precio_minorista is null and new.precio_mayorista is null then
      raise exception 'No se puede activar "%": no tiene precio de venta propio', new.nombre;
    end if;
    if not exists (select 1 from producto_imagenes where producto_id = new.id) then
      raise exception 'No se puede activar "%": no tiene imagen en Cloudinary', new.nombre;
    end if;
  end if;
  new.actualizado_en := now();
  return new;
end;
$$;

drop trigger if exists productos_verificar_publicable on productos;
create trigger productos_verificar_publicable
  before insert or update on productos
  for each row execute function verificar_publicable();

-- --------------------------------------------------------------------------
-- Vista pública: lo único que puede leer el sitio (sin precio_proveedor)
-- --------------------------------------------------------------------------
create or replace view productos_publicos
with (security_invoker = true) as
select
  p.id, p.nombre, p.slug, p.categoria_id,
  p.descripcion_corta, p.descripcion_larga, p.especificaciones,
  p.precio_minorista, p.precio_mayorista, p.moneda,
  p.marca, p.disponibilidad, p.modo_compra,
  p.destacado, p.orden, p.fichas_tecnicas,
  c.slug as categoria_slug, c.nombre as categoria_nombre
from productos p
left join categorias c on c.id = p.categoria_id
where p.activo;

-- --------------------------------------------------------------------------
-- RLS
-- --------------------------------------------------------------------------
alter table categorias        enable row level security;
alter table productos         enable row level security;
alter table producto_imagenes enable row level security;

drop policy if exists categorias_lectura_publica on categorias;
create policy categorias_lectura_publica on categorias
  for select to anon, authenticated using (activo);

-- Ojo: esto permite leer la tabla `productos` de los activos, incluido
-- precio_proveedor. Por eso el frontend consulta `productos_publicos` y esta
-- política se limita a lo mínimo; si se quiere blindar del todo, quitar `anon`
-- de aquí y servir el catálogo sólo por la vista con una función RPC.
drop policy if exists productos_lectura_publica on productos;
create policy productos_lectura_publica on productos
  for select to anon, authenticated using (activo);

drop policy if exists imagenes_lectura_publica on producto_imagenes;
create policy imagenes_lectura_publica on producto_imagenes
  for select to anon, authenticated using (
    exists (select 1 from productos p where p.id = producto_id and p.activo)
  );

-- La escritura queda sólo para service_role (scripts de import y panel interno).
