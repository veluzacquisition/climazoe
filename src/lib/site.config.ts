import type { ModoCompra, Segmento } from '../types/catalogo';

/**
 * Datos reales del negocio.
 *
 * Fuente: documento "PROYECTO CLIMA ZOE" y material comercial que pasó Juan
 * Felipe. Todo lo que sale en el sitio como dato de empresa se lee de acá,
 * así que corregir un teléfono o una dirección es tocar un solo archivo.
 */

/** Año en que ZOE BUSINESS SAS inicia actividad comercial (6 de junio de 2019). */
export const ANIO_INICIO_COMERCIAL = 2019;
/** Año de constitución de la sociedad (7 de marzo de 2017). */
export const ANIO_CONSTITUCION = 2017;
/** Matrícula mercantil, Cámara de Comercio de Bogotá (11 de abril de 2017). */
export const MATRICULA_MERCANTIL = '028044241';

/**
 * Los años de trayectoria se calculan, no se escriben.
 *
 * Un "7+" fijo en el código queda desactualizado sin que nadie lo note y
 * termina siendo un dato falso en el sitio. Se cuenta desde el inicio de la
 * actividad comercial, que es la cifra defendible frente a un cliente: la
 * sociedad existe desde 2017, pero vende energía solar desde 2019.
 */
export function aniosDeTrayectoria(desde = ANIO_INICIO_COMERCIAL): number {
  const hoy = new Date();
  // Junio es el mes de aniversario; antes de junio todavía no se cumplió.
  const cumplio = hoy.getMonth() >= 5;
  return hoy.getFullYear() - desde - (cumplio ? 0 : 1);
}

export const site = {
  nombre: 'Clima Zoe',
  razonSocial: 'ZOE BUSINESS SAS',
  nit: '901.087.273-6',
  marcaRegistrada: true,
  claim: 'Energía solar para la casa, el campo y el negocio',
  /** Eslogan propio, del documento de marca. */
  eslogan: '¿Qué puedo hacer yo? El cambio climático está en nuestras manos…',

  contacto: {
    /** Formato internacional sin '+' ni espacios, como lo pide wa.me. */
    whatsapp: '573223919801',
    telefono: '+57 322 391 9801',
    telefonoSecundario: '+57 320 804 6733',
    email: 'zoebusinesssas@gmail.com',
    direccion: 'Carrera 2 Este No. 4-12, Centro',
    ciudad: 'Mosquera, Cundinamarca',
    /** [PENDIENTE: confirmar con Don Carlos] */
    horario: null as string | null,
  },

  redes: {
    /** [PENDIENTE: URLs exactas de los perfiles] */
    instagram: null as string | null,
    facebook: null as string | null,
  },

  /**
   * Modo de compra por defecto. Ver lib/pagos.ts: cambiar a Bold o
   * contraentrega es tocar esta línea, no los componentes.
   */
  modoCompraPorDefecto: 'whatsapp' as ModoCompra,

  /** Segmento con el que abre el sitio un visitante nuevo. */
  segmentoPorDefecto: 'minorista' as Segmento,

  /**
   * Mientras no se cierren precios con el proveedor, el sitio muestra
   * "Cotizar" en vez de un número. Ver scraper/generar_catalogo_web.py.
   */
  ocultarPrecios: true,

  moneda: 'COP',
  locale: 'es-CO',
} as const;

/**
 * Misión y visión, textuales del documento de marca. No se reescriben: son
 * el texto que la empresa ya usa.
 */
export const identidad = {
  origenNombre:
    'Zoe quiere decir "vida". Su origen etimológico apunta al concepto de ' +
    '"nacer, dar vida"; los judíos alejandrinos lo tradujeron como Eva, la ' +
    'madre bíblica de todos los mortales, es decir, el símbolo de la vida.',

  /**
   * De dónde salió el nombre, en palabras del fundador. Es el fragmento más
   * humano del documento de marca y no se reescribe ni se pule: dicho así es
   * lo que separa una historia real de un texto de relleno.
   */
  origenPersonal:
    'Después de muchas noches oscuras… alguien muy allegado a mi corazón ' +
    'sugirió: "usted necesita un soplo de vida".',

  origenMarca:
    'La marca Clima Zoe nace de la inspiración que produjo el Acuerdo de ' +
    'París, la conferencia de diciembre de 2015 donde 195 países ' +
    'confirmaron que el cambio climático constituye la mayor amenaza ' +
    'medioambiental a la que se enfrenta la humanidad.',

  mision:
    'Clima Zoe quiere construir una sólida trayectoria comercializando ' +
    'productos y servicios con conciencia ecológica, capacitando y ' +
    'orientando a sus clientes en ahorro de energía usando fuentes limpias ' +
    'como el sol, el viento y el agua. Como organización cultivamos el ' +
    'desarrollo humano y profesional dentro de nuestros colaboradores y ' +
    'clientes, dispuestos a atender sus inquietudes y a cumplir sus ' +
    'expectativas.',

  vision:
    'Clima Zoe se convertirá en el mayor impulsador de un modelo energético ' +
    'sostenible, capaz de reducir las emisiones de CO₂. Buscaremos la ' +
    'participación de todos, porque trabajando unidos podemos construir un ' +
    'mundo mejor.',
} as const;

/**
 * Consignas propias de la marca. Son distintas de las citas: no son de
 * terceros sino la voz de Clima Zoe, y por eso van sin autor y en primera
 * persona. Salen del listado de frases del documento de marca.
 */
export const consignas = [
  '¿Cambio climático? ¿Qué puedo hacer? Usar las tres R: reduce, recicla, reutiliza.',
  'Tengo conciencia ecológica y pensamiento crítico. Soy persona ecológica: ahorro energía.',
  'Ten en mente que eres parte del medio ambiente. Por eso piensa y vive ecológicamente.',
] as const;

/**
 * Citas de terceros. Van SIEMPRE con autor: atribuirlas a la marca sería
 * apropiarse de palabras que no son suyas.
 */
export const frases: { texto: string; autor?: string }[] = [
  {
    texto:
      'La Tierra proporciona lo suficiente para satisfacer las necesidades ' +
      'de cada hombre, pero no la codicia de cada hombre.',
    autor: 'Gandhi',
  },
  {
    texto:
      'El cambio climático constituye la mayor amenaza medioambiental a la ' +
      'que se enfrenta la humanidad.',
    autor: 'Naciones Unidas',
  },
  {
    texto:
      'Todos tenemos una responsabilidad frente al cambio climático; tenemos ' +
      'que tomarlo en serio, creo que es algo con lo que no podemos bromear.',
    autor: 'Papa Francisco',
  },
];

/**
 * Líneas de producto que la empresa comercializa, según su material
 * comercial. No es lo mismo que el árbol de categorías del catálogo: esto es
 * lo que Clima Zoe dice que vende, aquello es lo que hay en inventario.
 */
export const lineasDeProducto = [
  {
    titulo: 'Módulos fotovoltaicos',
    detalle: 'Paneles solares para hogar, finca, comercio e industria.',
    categoria: 'paneles-solares',
  },
  {
    titulo: 'Baterías industriales',
    detalle: 'Abiertas y cerradas: litio, gel y AGM para respaldo y sistemas aislados.',
    categoria: 'baterias',
  },
  {
    titulo: 'Rectificadores e inversores',
    detalle: 'Tecnología MPPT y PWM, híbridos, on-grid y off-grid.',
    categoria: 'inversores-solphower',
  },
  {
    titulo: 'Iluminación solar',
    detalle: 'Alumbrado público solar, luminarias LED e iluminación de inducción AGE.',
    categoria: 'lamparas',
  },
  {
    titulo: 'Material eléctrico industrial',
    detalle: 'Protecciones AC/DC, cableado, conectores y estructuras de montaje.',
    categoria: 'protecciones',
  },
] as const;

/**
 * Sellos que aparecen en el material comercial de la empresa.
 *
 * Ojo con cómo se presentan: certifican los EQUIPOS que se comercializan, no
 * a Clima Zoe. Mostrarlos como certificaciones propias sería atribuirse algo
 * que no se tiene, así que en el sitio van rotulados como certificación de
 * producto.
 */
export const certificacionesDeProducto = [
  { sigla: 'CE', detalle: 'Conformidad Europea' },
  { sigla: 'IEC', detalle: 'Norma electrotécnica internacional' },
  { sigla: 'UL', detalle: 'Underwriters Laboratories' },
  { sigla: 'RETIE', detalle: 'Reglamento técnico colombiano' },
  { sigla: 'PV Cycle', detalle: 'Reciclaje de módulos fotovoltaicos' },
] as const;

/**
 * El modo de compra del producto gana sobre el global; así se puede tener la
 * mayoría del catálogo en WhatsApp y sólo algunos ítems en Bold.
 */
export function resolverModoCompra(modoDelProducto: ModoCompra | null): ModoCompra {
  return modoDelProducto ?? site.modoCompraPorDefecto;
}
