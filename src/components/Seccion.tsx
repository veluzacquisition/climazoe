/**
 * Envoltorio de sección que fija el TONO.
 *
 * El sitio alterna franjas claras y oscuras en vez de ser negro de punta a
 * punta: el blanco es color de marca —el "CLIMA" del logo es blanco— y una
 * página toda oscura se lee apagada para un negocio de energía. La regla de
 * reparto es ~65% claro / ~35% oscuro, con el oscuro reservado para los
 * momentos de fuerza: el hero, las cifras y los cierres.
 *
 * Cambiar el tono no toca a los hijos: `.tono-claro` redefine las variables
 * semánticas y todo lo de adentro se adapta solo.
 */

interface Props {
  children: React.ReactNode;
  /** 'claro' = base blanca; 'oscuro' = negro de marca. */
  tono?: 'claro' | 'oscuro';
  /** 'base' usa el fondo del tono; 'alt' usa la superficie, para bandear. */
  fondo?: 'base' | 'alt';
  /** Espaciado vertical. 'none' cuando el hijo maneja el suyo. */
  espaciado?: 'normal' | 'amplio' | 'compacto' | 'none';
  /** Envuelve el contenido en `.contenedor`. */
  contenido?: boolean;
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
  id,
}: Props) {
  const clases = [
    tono === 'claro' ? 'tono-claro' : '',
    fondo === 'alt' ? 'bg-superficie' : 'bg-fondo',
    ESPACIADO[espaciado],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section id={id} className={clases}>
      {contenido ? <div className="contenedor">{children}</div> : children}
    </section>
  );
}

/** Encabezado de sección: título grande, bajada y enlace opcional a la derecha. */
export function TituloSeccion({
  titulo,
  bajada,
  accion,
}: {
  titulo: React.ReactNode;
  bajada?: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem]">
          {titulo}
        </h2>
        {bajada && <p className="mt-4 text-lg leading-relaxed text-texto-medio">{bajada}</p>}
      </div>
      {accion}
    </div>
  );
}
