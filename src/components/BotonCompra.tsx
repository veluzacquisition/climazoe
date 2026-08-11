import type { ModoCompra, Segmento } from '../types/catalogo';
import type { ProductoWeb } from '../lib/catalogo';
import { resolverModoCompra, site } from '../lib/site.config';
import { precio as formatearPrecio } from '../lib/formato';

/**
 * Punto único donde el catálogo se convierte en una venta.
 *
 * Los tres modos de la Fase 4 (WhatsApp, Bold, contraentrega) viven detrás de
 * esta misma interfaz. Cambiar de modo es config —`site.modoCompraPorDefecto`—,
 * nunca tocar los componentes que usan este botón.
 */

interface Props {
  producto: ProductoWeb;
  segmento: Segmento;
  className?: string;
  tamano?: 'normal' | 'compacto';
}

function precioDelSegmento(producto: ProductoWeb, segmento: Segmento) {
  return producto.precios[segmento] ?? producto.precios.minorista ?? null;
}

/** Mensaje que le llega a Clima Zoe por WhatsApp, ya con el producto adentro. */
export function mensajeWhatsApp(producto: ProductoWeb, segmento: Segmento): string {
  const valor = precioDelSegmento(producto, segmento);
  const lineas = [
    `Hola ${site.nombre}, me interesa este producto:`,
    '',
    `• ${producto.nombre}`,
  ];
  if (producto.sku) lineas.push(`• Ref: ${producto.sku}`);
  if (valor) lineas.push(`• Precio en la web: ${formatearPrecio(valor)}`);
  if (segmento === 'mayorista') lineas.push('• Consulta como empresa / mayorista');
  if (!producto.disponible) lineas.push('• (Aparece agotado en la web)');

  const origen = typeof window !== 'undefined' ? window.location.origin : '';
  lineas.push('', `${origen}/producto/${producto.id}`);
  return lineas.join('\n');
}

export function enlaceWhatsApp(producto: ProductoWeb, segmento: Segmento): string {
  const texto = encodeURIComponent(mensajeWhatsApp(producto, segmento));
  return `https://wa.me/${site.contacto.whatsapp}?text=${texto}`;
}

const ETIQUETAS: Record<ModoCompra, string> = {
  whatsapp: 'Cotizar por WhatsApp',
  bold: 'Comprar ahora',
  contraentrega: 'Pedir contraentrega',
  cotizacion: 'Solicitar cotización',
};

export default function BotonCompra({
  producto,
  segmento,
  className = '',
  tamano = 'normal',
}: Props) {
  const modo = resolverModoCompra(null);
  const tienePrecio = precioDelSegmento(producto, segmento) != null;

  // Botón primario = verde con texto negro. Blanco sobre este verde da 2.05:1
  // y es ilegible; el negro da 10.24:1.
  const medida = tamano === 'compacto' ? 'btn-sm' : 'btn-xl';
  const clases = `btn ${medida} btn-primario w-full ${className}`;

  // Sin precio de venta definido, "Comprar ahora" mentiría: hasta que se
  // carguen los precios, todo cierra por cotización.
  const etiqueta = tienePrecio ? ETIQUETAS[modo] : ETIQUETAS.cotizacion;

  return (
    <a
      href={enlaceWhatsApp(producto, segmento)}
      target="_blank"
      rel="noopener noreferrer"
      className={clases}
    >
      <IconoWhatsApp />
      {etiqueta}
    </a>
  );
}

function IconoWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.08-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24z" />
    </svg>
  );
}
