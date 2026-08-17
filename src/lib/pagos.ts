import type { ItemCarrito } from './carrito';
import { site } from './site.config';

/**
 * Métodos de pago.
 *
 * El punto de esta capa es que conectar Bold, Wompi o Mercado Pago sea
 * escribir UN objeto que cumpla `MetodoPago` y agregarlo a la lista: el
 * checkout no sabe nada de pasarelas, sólo pide métodos disponibles y llama
 * a `procesar()`.
 *
 * Hoy los tres métodos activos son manuales (el pedido se confirma por
 * WhatsApp) porque no hay pasarela contratada. El método `pasarela` queda
 * declarado pero deshabilitado, para que se vea el hueco en vez de tener que
 * adivinarlo.
 */

export interface DatosCliente {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  documento: string;
  tipoDocumento: 'CC' | 'NIT' | 'CE' | 'PP';
}

export interface DatosEntrega {
  departamento: string;
  ciudad: string;
  direccion: string;
  detalle: string;
  notas: string;
}

export interface Pedido {
  /** Código legible que el cliente puede citar por WhatsApp. */
  codigo: string;
  items: ItemCarrito[];
  cliente: DatosCliente;
  entrega: DatosEntrega;
  metodo: string;
  subtotal: number;
  /** null mientras el flete se cotiza aparte. */
  envio: number | null;
  total: number | null;
  requiereCotizacion: boolean;
  creado: string;
}

export interface ResultadoPago {
  ok: boolean;
  /** A dónde mandar al cliente después. */
  redirigirA?: string;
  /** URL externa (pasarela) que debe abrirse. */
  urlExterna?: string;
  mensaje?: string;
}

export interface MetodoPago {
  id: string;
  nombre: string;
  descripcion: string;
  /** false = se muestra en gris con el motivo. */
  disponible: boolean;
  motivoNoDisponible?: string;
  /** Requiere que todos los ítems tengan precio. */
  requierePrecio: boolean;
  procesar: (pedido: Pedido) => Promise<ResultadoPago>;
}

// ---------------------------------------------------------------------------
// Código de pedido
// ---------------------------------------------------------------------------

/**
 * CZ-260814-4F2A: prefijo, fecha y cuatro caracteres al azar.
 *
 * Se genera en el cliente porque todavía no hay backend que numere pedidos.
 * Cuando exista la tabla `pedidos`, el código lo asigna Postgres y esta
 * función desaparece.
 */
export function generarCodigoPedido(): string {
  const d = new Date();
  const fecha = [
    String(d.getFullYear()).slice(2),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('');
  const azar = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CZ-${fecha}-${azar}`;
}

// ---------------------------------------------------------------------------
// Mensaje de pedido
// ---------------------------------------------------------------------------

const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** El pedido completo en texto, para mandarlo por WhatsApp. */
export function pedidoComoTexto(p: Pedido): string {
  const l: string[] = [
    `*PEDIDO ${p.codigo}* — ${site.nombre}`,
    '',
    '*Productos*',
  ];

  for (const i of p.items) {
    const precio = i.precio != null ? formatoCOP.format(i.precio * i.cantidad) : 'a cotizar';
    l.push(`• ${i.cantidad} × ${i.nombre}${i.sku ? ` (${i.sku})` : ''} — ${precio}`);
  }

  l.push('');
  if (p.requiereCotizacion) {
    l.push('_Algunos productos van a cotización; el total se confirma por este medio._');
  } else {
    l.push(`*Subtotal:* ${formatoCOP.format(p.subtotal)}`);
    l.push(`*Envío:* ${p.envio == null ? 'a coordinar' : formatoCOP.format(p.envio)}`);
    if (p.total != null) l.push(`*Total:* ${formatoCOP.format(p.total)}`);
  }

  l.push(
    '',
    '*Cliente*',
    `${p.cliente.nombre} ${p.cliente.apellido}`,
    `${p.cliente.tipoDocumento} ${p.cliente.documento}`,
    p.cliente.telefono,
    p.cliente.email,
    '',
    '*Entrega*',
    p.entrega.direccion + (p.entrega.detalle ? `, ${p.entrega.detalle}` : ''),
    `${p.entrega.ciudad}, ${p.entrega.departamento}`,
  );

  if (p.entrega.notas) l.push('', `*Notas:* ${p.entrega.notas}`);
  l.push('', `*Pago:* ${p.metodo}`);

  return l.join('\n');
}

function enviarPorWhatsApp(p: Pedido): ResultadoPago {
  const url = `https://wa.me/${site.contacto.whatsapp}?text=${encodeURIComponent(
    pedidoComoTexto(p),
  )}`;
  window.open(url, '_blank', 'noopener');
  return { ok: true, redirigirA: `/pedido/${p.codigo}` };
}

// ---------------------------------------------------------------------------
// Métodos
// ---------------------------------------------------------------------------

export const METODOS_PAGO: MetodoPago[] = [
  {
    id: 'pasarela',
    nombre: 'Tarjeta, PSE o Nequi',
    descripcion: 'Pago en línea con confirmación inmediata.',
    disponible: false,
    motivoNoDisponible: 'Estamos activando la pasarela de pagos',
    requierePrecio: true,
    // --- HUECO DE LA PASARELA -------------------------------------------
    // Al contratar Bold/Wompi/Mercado Pago, esto pasa a crear la orden
    // contra su API y devolver { ok: true, urlExterna: respuesta.checkoutUrl }.
    // El checkout no cambia: sólo hay que poner `disponible: true`.
    procesar: async () => ({
      ok: false,
      mensaje: 'La pasarela de pagos todavía no está activa.',
    }),
  },
  {
    id: 'contraentrega',
    nombre: 'Contraentrega',
    descripcion: 'Paga cuando reciba el pedido. Sujeto a cobertura.',
    disponible: true,
    requierePrecio: false,
    procesar: async (p) => enviarPorWhatsApp(p),
  },
  {
    id: 'transferencia',
    nombre: 'Transferencia o consignación',
    descripcion: 'Le enviamos los datos bancarios para confirmar el pago.',
    disponible: true,
    requierePrecio: false,
    procesar: async (p) => enviarPorWhatsApp(p),
  },
  {
    id: 'coordinar',
    nombre: 'Coordinar por WhatsApp',
    descripcion: 'Un asesor le confirma precio, disponibilidad y forma de pago.',
    disponible: true,
    requierePrecio: false,
    procesar: async (p) => enviarPorWhatsApp(p),
  },
];

/**
 * Todos los métodos, con `disponible` resuelto según el estado del pedido.
 *
 * La pasarela NO se oculta cuando no se puede usar: se muestra en gris con el
 * motivo. Esconderla haría creer que la tienda no acepta pago en línea nunca,
 * y deja invisible el punto exacto donde se enchufa Bold o Wompi.
 */
export function metodosDisponibles(cobrable: boolean): MetodoPago[] {
  return METODOS_PAGO.map((m) => {
    if (m.disponible && m.requierePrecio && !cobrable) {
      return {
        ...m,
        disponible: false,
        motivoNoDisponible: 'Disponible cuando el pedido tenga precio confirmado',
      };
    }
    return m;
  });
}

// ---------------------------------------------------------------------------
// Persistencia local del pedido
// ---------------------------------------------------------------------------

const CLAVE = 'climazoe.pedidos.v1';

/**
 * Registra el pedido en Supabase.
 *
 * Entra por la función `crear_pedido`, no escribiendo en las tablas: un
 * pedido son dos tablas y el sitio no puede leer la cabecera insertada para
 * colgarle los ítems —los pedidos llevan cédula y dirección, así que la
 * lectura está prohibida—. La función hace las dos inserciones en una
 * transacción y devuelve sólo el código.
 *
 * Devuelve el código que asignó la base, o null si no se pudo registrar. Un
 * fallo acá NO cancela la venta: el pedido igual se guarda en el navegador y
 * se envía por WhatsApp, que es como se cierra hoy. Perder el registro es
 * malo; perder la venta es peor.
 */
export async function registrarPedidoEnSupabase(p: Pedido): Promise<string | null> {
  try {
    const { supabase } = await import('./supabase');
    if (!supabase) return null;

    const { data, error } = await supabase.rpc('crear_pedido', {
      datos: {
        nombre: p.cliente.nombre,
        apellido: p.cliente.apellido,
        email: p.cliente.email,
        telefono: p.cliente.telefono,
        tipo_documento: p.cliente.tipoDocumento,
        documento: p.cliente.documento,
        departamento: p.entrega.departamento,
        ciudad: p.entrega.ciudad,
        direccion: p.entrega.direccion,
        detalle_direccion: p.entrega.detalle || null,
        notas: p.entrega.notas || null,
        subtotal: p.subtotal || null,
        envio: p.envio,
        total: p.total,
        requiere_cotizacion: p.requiereCotizacion,
        metodo_pago: p.metodo,
        items: p.items.map((i) => ({
          producto_slug: i.id,
          nombre: i.nombre,
          sku: i.sku,
          imagen_url: i.imagen,
          precio_unitario: i.precio,
          cantidad: i.cantidad,
        })),
      },
    });

    if (error) {
      console.error('[pedido] no se pudo registrar en Supabase:', error.message);
      return null;
    }
    return typeof data === 'string' ? data : null;
  } catch (e) {
    console.error('[pedido] error al registrar:', e);
    return null;
  }
}

/**
 * Copia local del pedido, para poder mostrar la página de confirmación tras
 * recargar sin tener que leerlo del servidor (que no se permite).
 */
export function guardarPedido(p: Pedido): void {
  try {
    const previos: Pedido[] = JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
    localStorage.setItem(CLAVE, JSON.stringify([p, ...previos].slice(0, 20)));
  } catch {
    // Sin almacenamiento el pedido igual se envió; sólo se pierde el historial.
  }
}

export function leerPedido(codigo: string): Pedido | null {
  try {
    const previos: Pedido[] = JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
    return previos.find((p) => p.codigo === codigo) ?? null;
  } catch {
    return null;
  }
}

/** Departamentos de Colombia, para el selector de entrega. */
export const DEPARTAMENTOS = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.', 'Bolívar',
  'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó',
  'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira',
  'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío',
  'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
  'Valle del Cauca', 'Vaupés', 'Vichada',
] as const;
