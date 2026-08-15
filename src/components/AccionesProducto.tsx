import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProductoWeb } from '../lib/catalogo';
import type { Segmento } from '../types/catalogo';
import { useCarrito } from '../lib/carrito';
import { site } from '../lib/site.config';
import { precio as formatear } from '../lib/formato';

/**
 * Acciones de compra de un producto.
 *
 * Tres acciones con jerarquía explícita, no tres botones iguales:
 *
 *   1. Añadir al carrito — la principal, en verde de marca.
 *   2. Comprar ahora     — salta el carrito y va directo al checkout.
 *   3. Preguntar por WhatsApp — separado y secundario. Antes el CTA de
 *      WhatsApp ERA el botón de compra; ahora es un canal de consulta, que es
 *      lo que realmente es.
 */

interface Props {
  producto: ProductoWeb;
  segmento: Segmento;
  /** 'ficha' muestra selector de cantidad; 'tarjeta' es la versión compacta. */
  variante?: 'ficha' | 'tarjeta';
}

export default function AccionesProducto({
  producto,
  segmento,
  variante = 'ficha',
}: Props) {
  const { agregar } = useCarrito();
  const navegar = useNavigate();
  const [cantidad, setCantidad] = useState(1);

  const comprarAhora = () => {
    agregar(producto, segmento, cantidad);
    navegar('/checkout');
  };

  if (variante === 'tarjeta') {
    return (
      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={() => agregar(producto, segmento)}
          className="btn btn-sm btn-primario w-full"
        >
          Añadir al carrito
        </button>
        <a
          href={enlaceConsulta(producto, segmento)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center justify-center gap-2 py-1.5 text-xs font-bold text-texto-medio transition-colors hover:text-marca-texto"
        >
          <IconoWhatsApp className="size-4" />
          Preguntar por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold">Cantidad</span>
        <div className="flex items-center rounded-marca border border-borde">
          <button
            type="button"
            onClick={() => setCantidad((n) => Math.max(1, n - 1))}
            disabled={cantidad <= 1}
            aria-label="Quitar una unidad"
            className="px-4 py-2.5 font-bold disabled:opacity-30"
          >
            −
          </button>
          <input
            type="number"
            value={cantidad}
            min={1}
            max={99}
            onChange={(e) => setCantidad(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
            aria-label="Cantidad"
            className="w-14 border-x border-borde bg-transparent py-2.5 text-center font-bold [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setCantidad((n) => Math.min(99, n + 1))}
            disabled={cantidad >= 99}
            aria-label="Agregar una unidad"
            className="px-4 py-2.5 font-bold disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => agregar(producto, segmento, cantidad)}
        className="btn btn-xl btn-primario w-full"
      >
        <IconoCarritoMas />
        Añadir al carrito
      </button>

      <button type="button" onClick={comprarAhora} className="btn btn-xl btn-contorno w-full">
        Comprar ahora
      </button>

      {/* El canal de consulta va abajo y sin peso de botón primario: es una
          alternativa, no la forma principal de comprar. */}
      <div className="border-t border-borde pt-4">
        <a
          href={enlaceConsulta(producto, segmento)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm font-bold text-texto-medio transition-colors hover:text-marca-texto"
        >
          <IconoWhatsApp className="size-5" />
          ¿Dudas? Pregunte por WhatsApp
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

/** Consulta sobre UN producto. No es un pedido: es una pregunta. */
export function mensajeConsulta(producto: ProductoWeb, segmento: Segmento): string {
  const valor = producto.precios[segmento] ?? producto.precios.minorista ?? null;
  const l = [`Hola ${site.nombre}, tengo una consulta sobre este producto:`, '', `• ${producto.nombre}`];
  if (producto.sku) l.push(`• Ref: ${producto.sku}`);
  if (valor) l.push(`• Precio en la web: ${formatear(valor)}`);
  if (segmento === 'mayorista') l.push('• Consulta como empresa / mayorista');
  if (!producto.disponible) l.push('• (Aparece agotado en la web)');

  const origen = typeof window !== 'undefined' ? window.location.origin : '';
  l.push('', `${origen}/producto/${producto.id}`);
  return l.join('\n');
}

export function enlaceConsulta(producto: ProductoWeb, segmento: Segmento): string {
  return `https://wa.me/${site.contacto.whatsapp}?text=${encodeURIComponent(
    mensajeConsulta(producto, segmento),
  )}`;
}

function IconoCarritoMas() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden="true"
    >
      <path d="M3 4h2l2.4 10.5a2 2 0 0 0 2 1.5h7.5a2 2 0 0 0 2-1.6L20.5 7H6" />
      <circle cx="10" cy="20" r="1.4" />
      <circle cx="17.5" cy="20" r="1.4" />
    </svg>
  );
}

export function IconoWhatsApp({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`fill-current ${className}`}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.43 12.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.08-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
    </svg>
  );
}
