import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MAX_POR_LINEA, useCarrito } from '../../lib/carrito';
import { precio as formatear } from '../../lib/formato';

/**
 * Panel lateral del carrito.
 *
 * Se abre solo al agregar un producto: en una tienda por catálogo, la
 * confirmación de "quedó agregado" es lo que evita que la gente agregue el
 * mismo ítem tres veces.
 */
export default function PanelCarrito() {
  const { items, totales, abierto, cerrar, quitar, cambiarCantidad } = useCarrito();
  const botonCerrar = useRef<HTMLButtonElement>(null);

  // Es un diálogo modal y le faltaban las tres cosas que eso implica: cerrar
  // con Escape, congelar el fondo y llevar el foco adentro. Sin lo primero el
  // panel se quedaba encima bloqueando la página entera —el buscador y el
  // menú lateral sí lo tenían, el carrito no—.
  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar();
    };
    document.addEventListener('keydown', alPulsar);
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    botonCerrar.current?.focus();
    return () => {
      document.removeEventListener('keydown', alPulsar);
      document.body.style.overflow = antes;
    };
  }, [abierto, cerrar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Carrito">
      <div className="absolute inset-0 bg-black/50" onClick={cerrar} aria-hidden="true" />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-fondo">
        {/* --- Cabecera --------------------------------------------------- */}
        <header className="flex items-center justify-between border-b border-borde px-5 py-4">
          <h2 className="text-lg font-bold">
            Su carrito
            {totales.unidades > 0 && (
              <span className="ml-2 text-sm font-normal text-texto-medio">
                {totales.unidades} {totales.unidades === 1 ? 'unidad' : 'unidades'}
              </span>
            )}
          </h2>
          <button
            ref={botonCerrar}
            type="button"
            onClick={cerrar}
            aria-label="Cerrar carrito"
            className="rounded-marca border border-borde px-3 py-1.5 text-sm transition-colors hover:border-texto-suave"
          >
            ✕
          </button>
        </header>

        {/* --- Contenido ---------------------------------------------------- */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-superficie text-texto-suave">
              <IconoCarrito className="size-7" />
            </span>
            <p className="mt-5 text-lg font-bold">Su carrito está vacío</p>
            <p className="mt-2 text-sm text-texto-medio">
              Agregue paneles, baterías o inversores y le armamos la cotización.
            </p>
            <Link to="/catalogo" onClick={cerrar} className="btn btn-primario mt-7">
              Ver el catálogo
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-borde-suave overflow-y-auto px-5">
              {items.map((i) => (
                <li key={i.id} className="flex gap-4 py-5">
                  <Link
                    to={`/producto/${i.id}`}
                    onClick={cerrar}
                    className="size-20 shrink-0 overflow-hidden rounded-marca border border-borde bg-white"
                  >
                    {i.imagen && (
                      <img
                        src={i.imagen}
                        alt={i.nombre}
                        loading="lazy"
                        className="size-full object-contain p-1.5"
                      />
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/producto/${i.id}`}
                      onClick={cerrar}
                      className="line-clamp-2 text-sm font-semibold transition-colors hover:text-marca-texto"
                    >
                      {i.nombre}
                    </Link>

                    {!i.disponible && (
                      <span className="mt-1 inline-block text-xs font-bold text-acento-texto">
                        Agotado — se confirma disponibilidad
                      </span>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Cantidad
                        valor={i.cantidad}
                        onCambiar={(n) => cambiarCantidad(i.id, n)}
                      />
                      <p className="text-sm font-bold">
                        {i.precio != null ? (
                          formatear(i.precio * i.cantidad)
                        ) : (
                          <span className="text-texto-medio">A cotizar</span>
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => quitar(i.id)}
                      className="mt-2 text-xs text-texto-suave underline transition-colors hover:text-acento-texto"
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* --- Pie ---------------------------------------------------- */}
            <footer className="border-t border-borde bg-superficie px-5 py-5">
              {totales.hayACotizar ? (
                <p className="rounded-marca border border-borde bg-fondo px-4 py-3 text-sm text-texto-medio">
                  Los precios de este catálogo se confirman al cotizar. Complete
                  el pedido y le pasamos el total con envío.
                </p>
              ) : (
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">Subtotal</span>
                  <span className="text-2xl font-bold text-marca-texto">
                    {formatear(totales.subtotal)}
                  </span>
                </div>
              )}

              <p className="mt-2 text-xs text-texto-suave">
                El envío se coordina según la ciudad de entrega.
              </p>

              <Link to="/checkout" onClick={cerrar} className="btn btn-primario mt-4 w-full">
                {totales.cobrable ? 'Finalizar compra' : 'Continuar con el pedido'}
              </Link>
              <button
                type="button"
                onClick={cerrar}
                className="mt-2 w-full py-2 text-sm font-semibold text-texto-medio transition-colors hover:text-marca-texto"
              >
                Seguir comprando
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

function Cantidad({
  valor,
  onCambiar,
}: {
  valor: number;
  onCambiar: (n: number) => void;
}) {
  return (
    <div className="flex items-center rounded-marca border border-borde">
      <button
        type="button"
        onClick={() => onCambiar(valor - 1)}
        disabled={valor <= 1}
        aria-label="Quitar una unidad"
        className="px-3 py-1.5 text-sm font-bold disabled:opacity-30"
      >
        −
      </button>
      <input
        type="number"
        value={valor}
        min={1}
        max={MAX_POR_LINEA}
        onChange={(e) => onCambiar(Number(e.target.value) || 1)}
        aria-label="Cantidad"
        className="w-10 border-x border-borde bg-transparent py-1.5 text-center text-sm font-bold [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onCambiar(valor + 1)}
        disabled={valor >= MAX_POR_LINEA}
        aria-label="Agregar una unidad"
        className="px-3 py-1.5 text-sm font-bold disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}

export function IconoCarrito({ className = 'size-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 4h2l2.4 10.5a2 2 0 0 0 2 1.5h7.5a2 2 0 0 0 2-1.6L20.5 7H6" />
      <circle cx="10" cy="20" r="1.4" />
      <circle cx="17.5" cy="20" r="1.4" />
    </svg>
  );
}
