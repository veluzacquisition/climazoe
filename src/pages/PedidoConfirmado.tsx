import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { leerPedido, pedidoComoTexto, type Pedido } from '../lib/pagos';
import { precio as formatear } from '../lib/formato';
import { site } from '../lib/site.config';
import Seccion from '../components/Seccion';

/**
 * Confirmación del pedido.
 *
 * El pedido se lee del almacenamiento local, así que la página sobrevive a un
 * refresco y el cliente puede volver al enlace. Cuando exista la tabla
 * `pedidos` en Supabase, se consulta por código y esto queda como respaldo.
 */
export default function PedidoConfirmado() {
  const { codigo } = useParams();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [buscando, setBuscando] = useState(true);

  useEffect(() => {
    setPedido(codigo ? leerPedido(codigo) : null);
    setBuscando(false);
    window.scrollTo({ top: 0 });
  }, [codigo]);

  if (buscando) return null;

  if (!pedido) {
    return (
      <Seccion espaciado="amplio">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-3xl font-bold">No encontramos ese pedido</h1>
          <p className="mt-3 text-texto-medio">
            El código <span className="font-mono font-bold">{codigo}</span> no
            está guardado en este navegador. Si ya nos escribió, su pedido
            sigue en curso — consúltenos por WhatsApp con ese código.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={`https://wa.me/${site.contacto.whatsapp}?text=${encodeURIComponent(
                `Hola ${site.nombre}, consulto por mi pedido ${codigo}.`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-xl btn-primario"
            >
              Consultar por WhatsApp
            </a>
            <Link to="/catalogo" className="btn btn-xl btn-contorno">
              Volver al catálogo
            </Link>
          </div>
        </div>
      </Seccion>
    );
  }

  const reenviar = () =>
    window.open(
      `https://wa.me/${site.contacto.whatsapp}?text=${encodeURIComponent(pedidoComoTexto(pedido))}`,
      '_blank',
      'noopener',
    );

  return (
    <Seccion espaciado="amplio">
      <div className="mx-auto max-w-2xl">
        {/* --- Confirmación ------------------------------------------------ */}
        <div className="text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-marca text-marca-contraste">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
              className="size-8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m5 12 5 5L20 7" />
            </svg>
          </span>

          <h1 className="mt-6 text-2xl font-bold leading-[1.25] tracking-tight sm:text-[1.75rem]">
            ¡Pedido recibido!
          </h1>
          <p className="mt-3 text-lg text-texto-medio">
            Gracias {pedido.cliente.nombre}. Su pedido quedó registrado con el
            código:
          </p>
          <p className="mt-4 inline-block rounded-marca border border-marca-borde bg-marca-tenue px-5 py-2.5 font-mono text-xl font-bold text-marca-texto">
            {pedido.codigo}
          </p>
        </div>

        {/* --- Qué sigue ---------------------------------------------------- */}
        <div className="mt-10 rounded-marca-lg border border-borde bg-superficie p-6 sm:p-8">
          <h2 className="text-lg font-bold">Qué sigue</h2>
          <ol className="mt-5 space-y-4">
            {[
              pedido.requiereCotizacion
                ? 'Un asesor le confirma el precio final y el costo del envío.'
                : 'Un asesor le confirma disponibilidad y el costo del envío.',
              `Acordamos el pago por ${pedido.metodo.toLowerCase()}.`,
              'Despachamos y le compartimos la guía de seguimiento.',
            ].map((t, i) => (
              <li key={t} className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-marca text-xs font-bold text-marca-contraste">
                  {i + 1}
                </span>
                <span className="text-texto-medio">{t}</span>
              </li>
            ))}
          </ol>

          <button type="button" onClick={reenviar} className="btn btn-primario mt-7 w-full">
            Reenviar el pedido por WhatsApp
          </button>
          <p className="mt-3 text-center text-xs text-texto-suave">
            ¿No se abrió WhatsApp? Use este botón para enviarlo de nuevo.
          </p>
        </div>

        {/* --- Detalle ------------------------------------------------------ */}
        <div className="mt-6 rounded-marca-lg border border-borde bg-fondo p-6 sm:p-8">
          <h2 className="text-lg font-bold">Detalle del pedido</h2>

          <ul className="mt-5 divide-y divide-borde-suave">
            {pedido.items.map((i) => (
              <li key={i.id} className="flex items-center gap-4 py-4">
                <div className="size-14 shrink-0 overflow-hidden rounded-marca border border-borde bg-white">
                  {i.imagen && <img src={i.imagen} alt="" className="size-full object-contain p-1" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold">{i.nombre}</p>
                  <p className="text-xs text-texto-suave">Cantidad: {i.cantidad}</p>
                </div>
                <p className="shrink-0 text-sm font-bold">
                  {i.precio != null ? (
                    formatear(i.precio * i.cantidad)
                  ) : (
                    <span className="font-semibold text-texto-medio">A cotizar</span>
                  )}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2 border-t border-borde pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-texto-medio">Subtotal</dt>
              <dd className="font-semibold">
                {pedido.requiereCotizacion ? 'A confirmar' : formatear(pedido.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-texto-medio">Envío</dt>
              <dd className="font-semibold">A coordinar</dd>
            </div>
          </dl>

          <div className="mt-6 grid gap-6 border-t border-borde pt-6 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-texto-suave">
                Datos de contacto
              </h3>
              <p className="mt-2 text-sm text-texto-medio">
                {pedido.cliente.nombre} {pedido.cliente.apellido}
                <span className="block">{pedido.cliente.tipoDocumento} {pedido.cliente.documento}</span>
                <span className="block">{pedido.cliente.telefono}</span>
                <span className="block break-all">{pedido.cliente.email}</span>
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-texto-suave">
                Entrega
              </h3>
              <p className="mt-2 text-sm text-texto-medio">
                {pedido.entrega.direccion}
                {pedido.entrega.detalle && <span className="block">{pedido.entrega.detalle}</span>}
                <span className="block">{pedido.entrega.ciudad}, {pedido.entrega.departamento}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/catalogo" className="btn btn-xl btn-contorno">
            Seguir comprando
          </Link>
        </div>
      </div>
    </Seccion>
  );
}
