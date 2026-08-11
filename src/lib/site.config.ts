import type { ModoCompra, Segmento } from '../types/catalogo';

/**
 * Configuración de negocio del sitio.
 *
 * Todo lo que Don Carlos puede querer cambiar sin tocar componentes vive aquí.
 * En particular el modo de compra: hoy arranca en WhatsApp (Fase 4, modo 2),
 * y pasar a Bold o contraentrega es cambiar una línea, no reescribir el CTA.
 */

export const site = {
  nombre: 'Clima Zoe',
  claim: 'Energía solar para la casa, el campo y el negocio',

  contacto: {
    /** Formato internacional sin '+' ni espacios, como lo pide wa.me. */
    whatsapp: '573223919801',
    telefono: '+57 322 391 9801',
    email: null as string | null,
    direccion: null as string | null,
    ciudad: null as string | null,
    horario: null as string | null,
  },

  redes: {
    instagram: null as string | null,
    facebook: null as string | null,
  },

  /**
   * Modo de compra por defecto. Un producto puede sobreescribirlo con su
   * columna `modo_compra`; ver resolverModoCompra().
   */
  modoCompraPorDefecto: 'whatsapp' as ModoCompra,

  /** Segmento con el que abre el sitio un visitante nuevo. */
  segmentoPorDefecto: 'minorista' as Segmento,

  /**
   * Mientras no se cierren precios con el proveedor, el sitio puede mostrar
   * "Cotizar" en vez de un número. Se apaga cuando la lista esté definida.
   */
  ocultarPrecios: true,

  moneda: 'COP',
  locale: 'es-CO',
} as const;

/**
 * El modo de compra del producto gana sobre el global; así se puede tener
 * la mayoría del catálogo en WhatsApp y sólo algunos ítems en Bold.
 */
export function resolverModoCompra(modoDelProducto: ModoCompra | null): ModoCompra {
  return modoDelProducto ?? site.modoCompraPorDefecto;
}
