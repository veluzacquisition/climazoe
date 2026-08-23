/**
 * Dimensionamiento solar aproximado.
 *
 * Es la calculadora del sitio de referencia, con su misma forma —mismos
 * campos, mismos cinco resultados— pero con los números corregidos. Tres
 * cosas de la suya no se copiaron:
 *
 *   1. Allá el departamento, el área y el tipo de instalación se piden y NO
 *      entran en ningún cálculo. En energía solar el departamento es
 *      justamente lo que más pesa: La Guajira recibe ~5,5 horas de sol pico
 *      al día y Chocó ~3,6, una diferencia del 50% en generación. Acá sí se
 *      usa.
 *   2. Su CO₂ sale de `paneles × 6 ton/año`, que para una casa de 400 kWh
 *      mensuales da 48 toneladas. Esa casa consume 4.800 kWh al año; ni
 *      quemando carbón puro se llega a eso. Acá se calcula con el factor de
 *      emisión real del sistema colombiano, que es bajo porque la red es
 *      mayoritariamente hidráulica.
 *   3. Allá on-grid e híbrido dan idéntico resultado. Un híbrido lleva banco
 *      de baterías y cuesta bastante más, así que el retorno no puede ser el
 *      mismo.
 *
 * Todo lo que sale de acá es una ESTIMACIÓN para que el visitante se haga una
 * idea y escriba. La cotización real la hace Clima Zoe mirando el recibo, el
 * techo y la instalación eléctrica.
 */

/**
 * Horas de sol pico (HSP): kWh/m² al día, promedio anual por departamento.
 *
 * Orden de magnitud del Atlas de Radiación Solar del IDEAM. Son promedios de
 * departamentos enteros —Cundinamarca incluye páramo y valle del Magdalena—
 * así que sirven para estimar, no para diseñar. El dimensionamiento real se
 * hace con la irradiación del punto exacto.
 */
export const HSP_POR_DEPARTAMENTO: Record<string, number> = {
  Amazonas: 4.2,
  Antioquia: 4.4,
  Arauca: 4.8,
  Atlántico: 5.2,
  Bogotá: 4.2,
  Bolívar: 5.0,
  Boyacá: 4.5,
  Caldas: 4.4,
  Caquetá: 4.1,
  Casanare: 4.7,
  Cauca: 4.3,
  Cesar: 5.0,
  Chocó: 3.6,
  Córdoba: 4.8,
  Cundinamarca: 4.3,
  Guainía: 4.5,
  Guaviare: 4.4,
  Huila: 4.7,
  'La Guajira': 5.5,
  Magdalena: 5.2,
  Meta: 4.5,
  Nariño: 4.2,
  'Norte de Santander': 4.6,
  Putumayo: 4.0,
  Quindío: 4.4,
  Risaralda: 4.4,
  'San Andrés y Providencia': 5.3,
  Santander: 4.5,
  Sucre: 4.9,
  Tolima: 4.6,
  'Valle del Cauca': 4.5,
  Vaupés: 4.2,
  Vichada: 5.0,
};

export const DEPARTAMENTOS_SOLAR = Object.keys(HSP_POR_DEPARTAMENTO).sort((a, b) =>
  a.localeCompare(b, 'es'),
);

export type TipoSistema = 'on-grid' | 'hibrido';

export const TIPOS_SISTEMA: { id: TipoSistema; nombre: string; detalle: string }[] = [
  {
    id: 'on-grid',
    nombre: 'Conexión a la red (On-Grid)',
    detalle:
      'El sistema trabaja con la red. Es el más económico, pero si se va la luz también se apaga.',
  },
  {
    id: 'hibrido',
    nombre: 'Híbrido, con respaldo de baterías',
    detalle:
      'Guarda energía para la noche y para los cortes. Cuesta más por el banco de baterías.',
  },
];

export const TIPOS_INSTALACION = [
  'Hogar',
  'Comercio',
  'Industria',
  'Finca o agropecuario',
  'Hotel',
] as const;

// --- Constantes técnicas ---------------------------------------------------

/**
 * Potencia del panel de referencia, en vatios. Es un panel real del catálogo
 * (Luxen LNCT-585ND), no un número inventado.
 */
export const POTENCIA_PANEL_W = 585;

/** Área que ocupa un panel con su separación de montaje, en m². */
export const AREA_PANEL_M2 = 2.8;

/**
 * Rendimiento global del sistema (performance ratio): lo que se pierde entre
 * el panel y el contador —temperatura, cableado, inversor, suciedad—. 0,78 es
 * el valor típico de una instalación bien hecha.
 */
export const RENDIMIENTO = 0.78;

/**
 * Factor de emisión del Sistema Interconectado Nacional, en kg de CO₂ por
 * kWh. Colombia genera la mayor parte con hidroeléctricas, así que es bajo
 * comparado con casi cualquier otro país; por eso el ahorro de CO₂ de un
 * sistema solar acá es modesto y el argumento fuerte es el del recibo.
 */
export const FACTOR_CO2_KG_KWH = 0.164;

/**
 * Costo instalado por kWp, en pesos.
 *
 * OJO: son valores de referencia del mercado colombiano, NO la lista de
 * precios de Clima Zoe. Cuando Don Carlos pase sus costos reales por kWp, se
 * cambian estos dos números y la calculadora queda calibrada al negocio.
 */
export const COSTO_POR_KWP: Record<TipoSistema, number> = {
  'on-grid': 4_500_000,
  hibrido: 7_500_000,
};

// --- Cálculo ---------------------------------------------------------------

export interface EntradaSolar {
  sistema: TipoSistema;
  /** Consumo mensual en kWh, del recibo de la luz. */
  consumo: number;
  /** Lo que paga por kWh, en pesos. */
  precioKwh: number;
  /** Área de techo o terreno disponible, en m². */
  area: number;
  /** Qué porcentaje del recibo quiere cubrir. */
  porcentaje: number;
  departamento: string;
}

export interface ResultadoSolar {
  paneles: number;
  potenciaKwp: number;
  /** Generación estimada al mes, en kWh. */
  generacionMensual: number;
  ahorroMensual: number;
  ahorroAnual: number;
  /** kg de CO₂ que se dejan de emitir al año. */
  co2AnualKg: number;
  inversion: number;
  /** Años para recuperar la inversión. `null` si no hay ahorro. */
  retorno: number | null;
  hsp: number;
  areaNecesaria: number;
  /** Cuántos paneles caben en el área declarada. */
  panelesQueCaben: number;
  /** El área no alcanza para cubrir el porcentaje pedido. */
  areaInsuficiente: boolean;
  /** Cobertura real del recibo, ya recortada por el área disponible. */
  coberturaReal: number;
}

export function calcularSolar(e: EntradaSolar): ResultadoSolar {
  const hsp = HSP_POR_DEPARTAMENTO[e.departamento] ?? 4.4;

  // Lo que genera UN panel al mes en ese departamento.
  const porPanelMes = (POTENCIA_PANEL_W / 1000) * hsp * 30 * RENDIMIENTO;

  const objetivoKwh = e.consumo * (e.porcentaje / 100);
  const idealmente = Math.ceil(objetivoKwh / porPanelMes);

  // El techo manda: no se pueden poner más paneles de los que caben.
  const panelesQueCaben = Math.floor(e.area / AREA_PANEL_M2);
  const paneles = Math.max(1, Math.min(idealmente, Math.max(panelesQueCaben, 1)));
  const areaInsuficiente = panelesQueCaben < idealmente;

  const generacionMensual = paneles * porPanelMes;
  // No se paga de más por generar más de lo que se consume: el ahorro se
  // topa en el recibo. Sin esto, un techo grande daría "ahorros" mayores
  // que la factura completa.
  const kwhAhorrados = Math.min(generacionMensual, e.consumo);

  const ahorroMensual = Math.round(kwhAhorrados * e.precioKwh);
  const ahorroAnual = ahorroMensual * 12;

  const potenciaKwp = (paneles * POTENCIA_PANEL_W) / 1000;
  const inversion = Math.round(potenciaKwp * COSTO_POR_KWP[e.sistema]);

  return {
    paneles,
    potenciaKwp: Math.round(potenciaKwp * 100) / 100,
    generacionMensual: Math.round(generacionMensual),
    ahorroMensual,
    ahorroAnual,
    co2AnualKg: Math.round(kwhAhorrados * 12 * FACTOR_CO2_KG_KWH),
    inversion,
    retorno: ahorroAnual > 0 ? Math.round((inversion / ahorroAnual) * 10) / 10 : null,
    hsp,
    areaNecesaria: Math.round(paneles * AREA_PANEL_M2),
    panelesQueCaben,
    areaInsuficiente,
    coberturaReal: Math.round((kwhAhorrados / e.consumo) * 100),
  };
}
