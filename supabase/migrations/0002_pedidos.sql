-- ===========================================================================
-- Clima Zoe — pedidos (checkout propio)
--
-- El checkout ya captura todo esto en el navegador; estas tablas son el
-- destino cuando se conecte Supabase. Hasta entonces el pedido se guarda en
-- localStorage y se envía por WhatsApp.
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
--  * Nadie anónimo puede LEER pedidos: contienen cédula, dirección y
--    teléfono. Sólo se permite INSERT desde el sitio; la lectura es de
--    service_role (panel interno).
-- ===========================================================================

create type estado_pedido_t as enum (
  'nuevo', 'cotizado', 'confirmado', 'pagado', 'despachado', 'entregado', 'anulado'
);

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
  departamento    text not null,
  ciudad          text not null,
  direccion       text not null,
  detalle_direccion text,
  notas           text,

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
  nombre        text not null,
  sku           text,
  imagen_url    text,
  precio_unitario numeric(12,2),
  cantidad      int not null check (cantidad > 0),
  creado_en     timestamptz not null default now()
);

create index if not exists pedido_items_pedido_idx on pedido_items(pedido_id);

-- --------------------------------------------------------------------------
-- RLS: se puede crear un pedido, no leerlo
-- --------------------------------------------------------------------------
alter table pedidos      enable row level security;
alter table pedido_items enable row level security;

revoke all on pedidos      from anon, authenticated;
revoke all on pedido_items from anon, authenticated;

grant insert on pedidos      to anon, authenticated;
grant insert on pedido_items to anon, authenticated;

-- Sin política de SELECT: los datos personales no son legibles desde el
-- cliente. El panel interno entra con service_role.
drop policy if exists pedidos_crear on pedidos;
create policy pedidos_crear on pedidos
  for insert to anon, authenticated with check (true);

drop policy if exists pedido_items_crear on pedido_items;
create policy pedido_items_crear on pedido_items
  for insert to anon, authenticated with check (true);

create or replace function tocar_actualizado_en() returns trigger
language plpgsql as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

drop trigger if exists pedidos_tocar on pedidos;
create trigger pedidos_tocar before update on pedidos
  for each row execute function tocar_actualizado_en();
