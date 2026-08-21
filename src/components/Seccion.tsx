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
    tono === 'oscuro' ? 'tono-oscuro' : '',
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
        <h2 className="text-2xl font-bold leading-[1.25] tracking-tight sm:text-[1.75rem]">
          {titulo}
        </h2>
        {bajada && <p className="mt-3 max-w-2xl text-texto-medio">{bajada}</p>}
      </div>
      {accion}
    </div>
  );
}
