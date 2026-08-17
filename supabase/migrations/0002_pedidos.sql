-- ===========================================================================
-- Clima Zoe — pedidos (checkout propio)
--
-- Notas de diseño:
--
--  * Los ítems guardan nombre y precio CONGELADOS. Si mañana cambia el
--    catálogo, el pedido histórico debe seguir mostrando lo que el cliente
--    compró, no lo que el producto vale hoy.
--
--  * `total` es nullable a propósito: mientras no haya lista de precios
--    cerrada, un pedido entra como cotización sin monto. Fingir un total
--    sería peor que no tenerlo.
--
--  * El sitio NO escribe en las tablas directamente. Todo entra por la
--    función `crear_pedido`, y por dos razones:
--
--      1. Un pedido son dos tablas. Con permiso de INSERT suelto habría que
--         insertar la cabecera, leer su id y luego los ítems — pero leer
--         está prohibido (los pedidos tienen cédula, dirección y teléfono),
--         así que el flujo ni siquiera funcionaría. La función resuelve las
--         dos inserciones de una y devuelve sólo el código.
--
--      2. Si se corta a mitad, no queda un pedido sin ítems: la función es
--         una sola transacción.
--
--    Resultado: `anon` no tiene ningún permiso sobre las tablas, sólo puede
--    ejecutar la función. La lectura es de service_role (panel interno).
-- ===========================================================================

do $$ begin
  create type estado_pedido_t as enum (
    'nuevo', 'cotizado', 'confirmado', 'pagado', 'despachado', 'entregado', 'anulado'
  );
exception when duplicate_object then null; end $$;

create table if not exists pedidos (
  id              uuid primary key default gen_random_uuid(),
  -- Código legible que el cliente cita por WhatsApp (CZ-260814-4F2A).
  codigo          text not null unique,
  estado          estado_pedido_t not null default 'nuevo',

  -- Cliente
  nombre          text not null,
  apellido        text not null,
  email           text not null,
  telefono        text not null,
  tipo_documento  text not null,
  documento       text not null,

  -- Entrega
  departamento      text not null,
  ciudad            text not null,
  direccion         text not null,
  detalle_direccion text,
  notas             text,

  -- Dinero. Null mientras el pedido va como cotización.
  subtotal        numeric(12,2),
  envio           numeric(12,2),
  total           numeric(12,2),
  moneda          text not null default 'COP',
  requiere_cotizacion boolean not null default false,

  -- Pago
  metodo_pago     text not null,
  -- Referencia que devuelve la pasarela cuando se conecte.
  referencia_pago text,
  pagado_en       timestamptz,

  segmento        text not null default 'minorista',
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

create index if not exists pedidos_estado_idx on pedidos(estado, creado_en desc);
create index if not exists pedidos_email_idx  on pedidos(email);

create table if not exists pedido_items (
  id            uuid primary key default gen_random_uuid(),
  pedido_id     uuid not null references pedidos(id) on delete cascade,
  -- Referencia suelta al catálogo: si el producto se borra, el pedido queda.
  producto_slug text not null,
  -- Congelados al momento de la compra.
  nombre          text not null,
  sku             text,
  imagen_url      text,
  precio_unitario numeric(12,2),
  cantidad        int not null check (cantidad > 0),
  creado_en       timestamptz not null default now()
);

create index if not exists pedido_items_pedido_idx on pedido_items(pedido_id);

-- --------------------------------------------------------------------------
-- RLS: nadie anónimo toca estas tablas. Ni lectura ni escritura.
-- --------------------------------------------------------------------------
alter table pedidos      enable row level security;
alter table pedido_items enable row level security;

revoke all on pedidos      from anon, authenticated;
revoke all on pedido_items from anon, authenticated;

-- --------------------------------------------------------------------------
-- Alta de pedido: única puerta de entrada desde el sitio
-- --------------------------------------------------------------------------
create or replace function crear_pedido(datos jsonb)
returns text
language plpgsql
security definer
-- search_path fijo: sin esto, una función security definer puede ser
-- redirigida a objetos de otro esquema.
set search_path = public, pg_temp
as $$
declare
  nuevo_id     uuid;
  nuevo_codigo text;
  item         jsonb;
  n_items      int;
begin
  n_items := jsonb_array_length(coalesce(datos->'items', '[]'::jsonb));
  if n_items = 0 then
    raise exception 'El pedido no tiene ítems';
  end if;
  if n_items > 100 then
    raise exception 'Demasiados ítems en un pedido';
  end if;

  -- El código lo genera la base, no el cliente: así no se puede forzar uno
  -- repetido ni adivinar el de otro pedido.
  nuevo_codigo := 'CZ-' || to_char(now(), 'YYMMDD') || '-' ||
                  upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));

  insert into pedidos (
    codigo, nombre, apellido, email, telefono, tipo_documento, documento,
    departamento, ciudad, direccion, detalle_direccion, notas,
    subtotal, envio, total, requiere_cotizacion, metodo_pago, segmento
  ) values (
    nuevo_codigo,
    datos->>'nombre', datos->>'apellido', datos->>'email', datos->>'telefono',
    coalesce(datos->>'tipo_documento', 'CC'), datos->>'documento',
    datos->>'departamento', datos->>'ciudad', datos->>'direccion',
    datos->>'detalle_direccion', datos->>'notas',
    (datos->>'subtotal')::numeric, (datos->>'envio')::numeric,
    (datos->>'total')::numeric,
    coalesce((datos->>'requiere_cotizacion')::boolean, false),
    coalesce(datos->>'metodo_pago', 'sin definir'),
    coalesce(datos->>'segmento', 'minorista')
  )
  returning id into nuevo_id;

  for item in select * from jsonb_array_elements(datos->'items') loop
    insert into pedido_items (
      pedido_id, producto_slug, nombre, sku, imagen_url, precio_unitario, cantidad
    ) values (
      nuevo_id,
      item->>'producto_slug', item->>'nombre', item->>'sku', item->>'imagen_url',
      (item->>'precio_unitario')::numeric,
      greatest(1, coalesce((item->>'cantidad')::int, 1))
    );
  end loop;

  return nuevo_codigo;
end;
$$;

-- Lo único que puede hacer el público: crear un pedido.
revoke all on function crear_pedido(jsonb) from public;
grant execute on function crear_pedido(jsonb) to anon, authenticated;

-- --------------------------------------------------------------------------
create or replace function tocar_actualizado_en() returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

drop trigger if exists pedidos_tocar on pedidos;
create trigger pedidos_tocar before update on pedidos
  for each row execute function tocar_actualizado_en();
