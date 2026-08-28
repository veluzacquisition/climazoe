/**
 * Envoltorio de sección que fija el TONO.
 *
 * Clima Zoe es una marca de fondo CLARO, así que el claro es el default y no
 * hace falta declararlo. El oscuro es la excepción: se reserva para el hero
 * —donde la oscuridad la pone la fotografía— y para una única franja de
 * cifras. Cambiar el tono no toca a los hijos: `.tono-oscuro` redefine las
 * variables semánticas y todo lo de adentro se adapta solo.
 */

interface Props {
  children: React.ReactNode;
  /** 'claro' = base blanca; 'oscuro' = negro de marca. */
  tono?: 'claro' | 'oscuro';
  /**
   * 'base'      — el fondo del tono.
   * 'alt'       — la superficie, para bandear.
   * 'degradado' — de blanco a superficie. Rompe el corte recto entre franjas:
   *               en una página larga, seis rectángulos de color plano uno
   *               tras otro se leen como un formulario, no como un sitio.
   */
  fondo?: 'base' | 'alt' | 'degradado';
  /** Espaciado vertical. 'none' cuando el hijo maneja el suyo. */
  espaciado?: 'normal' | 'amplio' | 'compacto' | 'none';
  /** Envuelve el contenido en `.contenedor`. */
  contenido?: boolean;
  /**
   * Manchas de color difuminadas detrás del contenido. Rompen el blanco
   * plano sin meter una imagen. Son decorativas: no llevan contenido y no
   * reciben el puntero.
   */
  resplandores?: React.ReactNode;
  className?: string;
  id?: string;
}

const ESPACIADO = {
  compacto: 'py-10',
  normal: 'py-16 lg:py-20',
  amplio: 'py-20 lg:py-28',
  none: '',
} as const;

export default function Seccion({
  children,
  tono = 'claro',
  fondo = 'base',
  espaciado = 'normal',
  contenido = true,
  className = '',
  resplandores,
  id,
}: Props) {
  const clases = [
    tono === 'oscuro' ? 'tono-oscuro' : '',
    fondo === 'alt'
      ? 'bg-superficie'
      : fondo === 'degradado'
        ? 'bg-[linear-gradient(to_bottom,var(--fondo),var(--superficie))]'
        : 'bg-fondo',
    ESPACIADO[espaciado],
    // `isolate` + `overflow-hidden` sólo cuando hay decoración: el
    // desenfoque de los resplandores se sale del borde y forzaría scroll
    // horizontal, y sin contexto de apilamiento taparían el contenido.
    resplandores ? 'relative isolate overflow-hidden' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section id={id} className={clases}>
      {resplandores && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {resplandores}
        </div>
      )}
      {contenido ? <div className="contenedor">{children}</div> : children}
    </section>
  );
}

/** Encabezado de sección: título grande, bajada y enlace opcional a la derecha. */
export function TituloSeccion({
  etiqueta,
  titulo,
  bajada,
  accion,
}: {
  /** Rótulo corto en verde sobre el título. Es la firma del referente y
   *  ordena la lectura sin sumar una frase entera. */
  etiqueta?: string;
  titulo: React.ReactNode;
  bajada?: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        {etiqueta && (
          /* El rótulo va precedido de una raya corta, como en el sitio de
             referencia. Ancla el bloque al margen izquierdo y da un punto de
             color antes de que empiece el texto. */
          <p className="mb-3 flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em] text-marca-texto">
            <span aria-hidden="true" className="h-0.5 w-7 rounded-full bg-marca" />
            {etiqueta}
          </p>
        )}
        <h2 className="text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[2.125rem]">
          {titulo}
        </h2>
        {bajada && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-texto-medio">{bajada}</p>
        )}
      </div>
      {accion}
    </div>
  );
}
