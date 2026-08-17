import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCarrito } from '../lib/carrito';
import {
  DEPARTAMENTOS,
  generarCodigoPedido,
  guardarPedido,
  metodosDisponibles,
  registrarPedidoEnSupabase,
  type DatosCliente,
  type DatosEntrega,
  type Pedido,
} from '../lib/pagos';
import { precio as formatear } from '../lib/formato';
import { site } from '../lib/site.config';
import Logo from '../components/Logo';

/**
 * Checkout.
 *
 * Tres pasos con resumen fijo al lado, que es la forma que mejor convierte en
 * tienda: el cliente ve siempre qué está comprando mientras llena datos.
 *
 * Funciona en dos modos según haya precios cerrados o no:
 *
 *   · SIN precios (hoy) — se capturan los mismos datos y el pedido sale como
 *     solicitud en firme; el total lo confirma un asesor. No se finge un
 *     total ni se pide pagar algo que no tiene monto.
 *   · CON precios — aparecen subtotal y total, y se habilitan los métodos que
 *     requieren monto, incluida la pasarela.
 *
 * El paso de pago no conoce ninguna pasarela: pide métodos a lib/pagos.ts.
 */

type Paso = 1 | 2 | 3;

const PASOS: { n: Paso; titulo: string }[] = [
  { n: 1, titulo: 'Sus datos' },
  { n: 2, titulo: 'Entrega' },
  { n: 3, titulo: 'Pago' },
];

const CLIENTE_VACIO: DatosCliente = {
  nombre: '', apellido: '', email: '', telefono: '',
  documento: '', tipoDocumento: 'CC',
};

const ENTREGA_VACIA: DatosEntrega = {
  departamento: '', ciudad: '', direccion: '', detalle: '', notas: '',
};

export default function Checkout() {
  const { items, totales, vaciar } = useCarrito();
  const navegar = useNavigate();

  const [paso, setPaso] = useState<Paso>(1);
  const [cliente, setCliente] = useState<DatosCliente>(CLIENTE_VACIO);
  const [entrega, setEntrega] = useState<DatosEntrega>(ENTREGA_VACIA);
  const [metodoId, setMetodoId] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const metodos = useMemo(() => metodosDisponibles(totales.cobrable), [totales.cobrable]);

  const clienteOk =
    cliente.nombre.trim() && cliente.apellido.trim() &&
    /.+@.+\..+/.test(cliente.email) && cliente.telefono.trim().length >= 7 &&
    cliente.documento.trim();

  const entregaOk =
    entrega.departamento && entrega.ciudad.trim() && entrega.direccion.trim();

  if (items.length === 0) {
    return (
      <div className="contenedor py-24 text-center">
        <h1 className="text-3xl font-bold">Su carrito está vacío</h1>
        <p className="mt-3 text-texto-medio">
          Agregue productos al carrito para continuar con el pedido.
        </p>
        <Link to="/catalogo" className="btn btn-xl btn-primario mt-8">
          Ver el catálogo
        </Link>
      </div>
    );
  }

  const confirmar = async () => {
    const metodo = metodos.find((m) => m.id === metodoId);
    if (!metodo) {
      setError('Elija un método de pago para continuar.');
      return;
    }

    setEnviando(true);
    setError(null);

    const pedido: Pedido = {
      // Código provisional: si Supabase responde, manda el que asigna la base.
      codigo: generarCodigoPedido(),
      items,
      cliente,
      entrega,
      metodo: metodo.nombre,
      subtotal: totales.subtotal,
      // El flete depende de ciudad y volumen; no se inventa un número.
      envio: null,
      total: totales.cobrable ? totales.subtotal : null,
      requiereCotizacion: totales.hayACotizar,
      creado: new Date().toISOString(),
    };

    try {
      // Se registra ANTES de procesar el pago: si la pasarela cobra, el
      // pedido ya tiene que existir. Un fallo acá no frena la venta.
      const codigoServidor = await registrarPedidoEnSupabase(pedido);
      if (codigoServidor) pedido.codigo = codigoServidor;

      const r = await metodo.procesar(pedido);
      if (!r.ok) {
        setError(r.mensaje ?? 'No se pudo procesar el pedido. Intente de nuevo.');
        return;
      }
      guardarPedido(pedido);
      vaciar();
      if (r.urlExterna) {
        window.location.href = r.urlExterna;
        return;
      }
      navegar(r.redirigirA ?? `/pedido/${pedido.codigo}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-superficie">
      {/* Cabecera propia: en el checkout se quita la navegación del catálogo
          para no ofrecer salidas a mitad de la compra. */}
      <header className="border-b border-borde bg-fondo">
        <div className="contenedor flex items-center justify-between py-5">
          <Link to="/" aria-label={`${site.nombre} — inicio`}>
            <Logo className="h-11" />
          </Link>
          <span className="flex items-center gap-2 text-sm font-semibold text-texto-medio">
            <IconoCandado />
            Pedido seguro
          </span>
        </div>
      </header>

      <div className="contenedor grid gap-10 py-10 lg:grid-cols-[1fr_24rem] lg:py-14">
        {/* --- Formulario --------------------------------------------------- */}
        <div>
          <Pasos actual={paso} onIr={(n) => n < paso && setPaso(n)} />

          {totales.hayACotizar && (
            <div className="mt-6 rounded-marca-lg border border-acento/30 bg-acento-tenue px-5 py-4">
              <p className="text-sm font-bold text-acento-texto">
                Pedido con precio a confirmar
              </p>
              <p className="mt-1 text-sm text-texto-medio">
                Estamos actualizando la lista de precios. Complete el pedido y
                un asesor le confirma el total con envío antes de cobrar nada.
              </p>
            </div>
          )}

          <div className="mt-6 rounded-marca-lg border border-borde bg-fondo p-6 sm:p-8">
            {paso === 1 && (
              <PasoDatos cliente={cliente} onCambiar={setCliente} />
            )}
            {paso === 2 && (
              <PasoEntrega entrega={entrega} onCambiar={setEntrega} />
            )}
            {paso === 3 && (
              <PasoPago
                metodos={metodos}
                metodoId={metodoId}
                onElegir={setMetodoId}
                cobrable={totales.cobrable}
              />
            )}

            {error && (
              <p className="mt-5 rounded-marca border border-acento/40 bg-acento-tenue px-4 py-3 text-sm font-semibold text-acento-texto">
                {error}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
              {paso < 3 ? (
                <button
                  type="button"
                  disabled={paso === 1 ? !clienteOk : !entregaOk}
                  onClick={() => setPaso((p) => (p + 1) as Paso)}
                  className="btn btn-xl btn-primario flex-1 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!metodoId || enviando}
                  onClick={confirmar}
                  className="btn btn-xl btn-primario flex-1 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {enviando ? 'Enviando…' : 'Confirmar pedido'}
                </button>
              )}

              <button
                type="button"
                onClick={() => (paso === 1 ? navegar('/catalogo') : setPaso((p) => (p - 1) as Paso))}
                className="btn btn-xl btn-contorno"
              >
                {paso === 1 ? 'Seguir comprando' : 'Volver'}
              </button>
            </div>
          </div>
        </div>

        {/* --- Resumen ------------------------------------------------------ */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-marca-lg border border-borde bg-fondo p-6">
            <h2 className="text-lg font-bold">Su pedido</h2>

            <ul className="mt-5 space-y-4">
              {items.map((i) => (
                <li key={i.id} className="flex gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-marca border border-borde bg-white">
                    {i.imagen && (
                      <img src={i.imagen} alt="" className="size-full object-contain p-1" />
                    )}
                    <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-marca text-[10px] font-bold text-marca-contraste">
                      {i.cantidad}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold">{i.nombre}</p>
                    <p className="mt-1 text-sm font-bold">
                      {i.precio != null ? (
                        formatear(i.precio * i.cantidad)
                      ) : (
                        <span className="font-semibold text-texto-medio">A cotizar</span>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2.5 border-t border-borde pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-texto-medio">Subtotal</dt>
                <dd className="font-semibold">
                  {totales.cobrable ? formatear(totales.subtotal) : 'A confirmar'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-texto-medio">Envío</dt>
                <dd className="font-semibold">A coordinar</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-borde pt-3">
                <dt className="font-bold">Total</dt>
                <dd className="text-2xl font-bold text-marca-texto">
                  {totales.cobrable ? formatear(totales.subtotal) : '—'}
                </dd>
              </div>
            </dl>

            <Link
              to="/catalogo"
              className="mt-5 block text-center text-sm font-bold text-marca-texto hover:underline"
            >
              Agregar más productos
            </Link>
          </div>

          <p className="mt-4 px-2 text-xs leading-relaxed text-texto-suave">
            {site.razonSocial} · NIT {site.nit} · {site.contacto.ciudad}. Al
            confirmar acepta ser contactado para cerrar el pedido.
          </p>
        </aside>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pasos
// ---------------------------------------------------------------------------

function Pasos({ actual, onIr }: { actual: Paso; onIr: (n: Paso) => void }) {
  return (
    <ol className="flex items-center gap-2">
      {PASOS.map((p, idx) => {
        const hecho = p.n < actual;
        const activo = p.n === actual;
        return (
          <li key={p.n} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => onIr(p.n)}
              disabled={!hecho}
              className={`flex items-center gap-2 text-sm font-bold ${
                hecho ? 'cursor-pointer text-marca-texto' : activo ? 'text-texto' : 'text-texto-suave'
              }`}
            >
              <span
                className={`flex size-7 items-center justify-center rounded-full text-xs ${
                  hecho
                    ? 'bg-marca text-marca-contraste'
                    : activo
                      ? 'bg-texto text-fondo'
                      : 'border border-borde'
                }`}
              >
                {hecho ? '✓' : p.n}
              </span>
              <span className="hidden sm:inline">{p.titulo}</span>
            </button>
            {idx < PASOS.length - 1 && (
              <span className={`h-px flex-1 ${hecho ? 'bg-marca' : 'bg-borde'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

const campo =
  'mt-1.5 w-full rounded-marca border border-borde bg-fondo px-4 py-3 text-texto placeholder:text-texto-suave focus:border-marca focus:outline-none';

function PasoDatos({
  cliente,
  onCambiar,
}: {
  cliente: DatosCliente;
  onCambiar: (c: DatosCliente) => void;
}) {
  const set = (k: keyof DatosCliente, v: string) => onCambiar({ ...cliente, [k]: v });

  return (
    <div>
      <h2 className="text-xl font-bold">Sus datos</h2>
      <p className="mt-1.5 text-sm text-texto-medio">
        Los necesitamos para la factura y para coordinar la entrega.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold">Nombre</span>
          <input value={cliente.nombre} onChange={(e) => set('nombre', e.target.value)}
            autoComplete="given-name" className={campo} placeholder="Juan" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Apellido</span>
          <input value={cliente.apellido} onChange={(e) => set('apellido', e.target.value)}
            autoComplete="family-name" className={campo} placeholder="Pérez" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Correo</span>
          <input type="email" value={cliente.email} onChange={(e) => set('email', e.target.value)}
            autoComplete="email" className={campo} placeholder="su@correo.com" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Celular</span>
          <input type="tel" value={cliente.telefono} onChange={(e) => set('telefono', e.target.value)}
            autoComplete="tel" className={campo} placeholder="300 000 0000" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Tipo de documento</span>
          <select
            value={cliente.tipoDocumento}
            onChange={(e) => set('tipoDocumento', e.target.value)}
            className={campo}
          >
            <option value="CC">Cédula de ciudadanía</option>
            <option value="NIT">NIT</option>
            <option value="CE">Cédula de extranjería</option>
            <option value="PP">Pasaporte</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Número de documento</span>
          <input value={cliente.documento} onChange={(e) => set('documento', e.target.value)}
            className={campo} placeholder="1 000 000 000" />
        </label>
      </div>
    </div>
  );
}

function PasoEntrega({
  entrega,
  onCambiar,
}: {
  entrega: DatosEntrega;
  onCambiar: (e: DatosEntrega) => void;
}) {
  const set = (k: keyof DatosEntrega, v: string) => onCambiar({ ...entrega, [k]: v });

  return (
    <div>
      <h2 className="text-xl font-bold">¿Dónde lo entregamos?</h2>
      <p className="mt-1.5 text-sm text-texto-medio">
        Despachamos a todo el país. El costo del envío depende de la ciudad y
        del volumen, y se lo confirmamos antes de despachar.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold">Departamento</span>
          <select
            value={entrega.departamento}
            onChange={(e) => set('departamento', e.target.value)}
            className={campo}
          >
            <option value="">Seleccione…</option>
            {DEPARTAMENTOS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Ciudad o municipio</span>
          <input value={entrega.ciudad} onChange={(e) => set('ciudad', e.target.value)}
            autoComplete="address-level2" className={campo} placeholder="Mosquera" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold">Dirección</span>
          <input value={entrega.direccion} onChange={(e) => set('direccion', e.target.value)}
            autoComplete="street-address" className={campo} placeholder="Carrera 2 Este No. 4-12" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold">
            Apartamento, torre o indicaciones <span className="font-normal text-texto-suave">(opcional)</span>
          </span>
          <input value={entrega.detalle} onChange={(e) => set('detalle', e.target.value)}
            className={campo} placeholder="Torre 3, apto 502" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold">
            Notas para el pedido <span className="font-normal text-texto-suave">(opcional)</span>
          </span>
          <textarea value={entrega.notas} onChange={(e) => set('notas', e.target.value)} rows={3}
            className={`${campo} resize-y`}
            placeholder="Ej: necesito instalación, o entregar en horario de la mañana." />
        </label>
      </div>
    </div>
  );
}

function PasoPago({
  metodos,
  metodoId,
  onElegir,
  cobrable,
}: {
  metodos: ReturnType<typeof metodosDisponibles>;
  metodoId: string;
  onElegir: (id: string) => void;
  cobrable: boolean;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold">¿Cómo prefiere pagar?</h2>
      <p className="mt-1.5 text-sm text-texto-medio">
        {cobrable
          ? 'Elija el método con el que quiere completar la compra.'
          : 'Elija cómo prefiere cerrar el pedido; el total se confirma antes de cobrar.'}
      </p>

      <div className="mt-6 space-y-3">
        {metodos.map((m) => (
          <label
            key={m.id}
            className={`flex cursor-pointer items-start gap-4 rounded-marca-lg border p-5 transition-colors ${
              !m.disponible
                ? 'cursor-not-allowed border-borde bg-superficie opacity-60'
                : metodoId === m.id
                  ? 'border-marca bg-marca-tenue'
                  : 'border-borde hover:border-texto-suave'
            }`}
          >
            <input
              type="radio"
              name="metodo"
              value={m.id}
              checked={metodoId === m.id}
              disabled={!m.disponible}
              onChange={() => onElegir(m.id)}
              className="mt-1 size-4 accent-[var(--marca)]"
            />
            <span className="flex-1">
              <span className="block font-bold">{m.nombre}</span>
              <span className="mt-0.5 block text-sm text-texto-medio">{m.descripcion}</span>
              {!m.disponible && m.motivoNoDisponible && (
                <span className="mt-2 inline-block rounded-marca bg-acento-tenue px-2.5 py-1 text-xs font-bold text-acento-texto">
                  {m.motivoNoDisponible}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-texto-suave">
        Al confirmar se abre WhatsApp con su pedido para que un asesor lo
        cierre. Todavía no se hace ningún cobro en línea.
      </p>
    </div>
  );
}

function IconoCandado() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      className="size-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
