import { Link } from 'react-router-dom';
import { MEDIA_HERO, imagen, imagenSrcSet } from '../lib/media';

/**
 * Encabezado de página interna: título sobre fotografía.
 *
 * Es el patrón que usa el sitio de referencia en todas sus subpáginas y
 * resuelve dos cosas a la vez: ubica al visitante —qué sección es, cómo
 * llegó— y evita que las páginas internas arranquen con un título suelto
 * sobre blanco, que es lo que las hacía verse más pobres que la home.
 *
 * La imagen rota según la sección para que no todas se vean iguales, y el
 * velo está calculado para que el título blanco mantenga contraste sobre
 * cualquiera de las tres fotos.
 */

const FONDOS = {
  paneles: MEDIA_HERO.panelesTecho,
  instalacion: MEDIA_HERO.instalacion,
} as const;

export type FondoEncabezado = keyof typeof FONDOS;

interface Miga {
  texto: string;
  a?: string;
}

interface Props {
  etiqueta?: string;
  titulo: React.ReactNode;
  bajada?: string;
  /** Ruta de migas. La última entrada va sin enlace: es la página actual. */
  migas?: Miga[];
  fondo?: FondoEncabezado;
  /** Contenido extra bajo la bajada: botones, chips, un buscador. */
  children?: React.ReactNode;
  /** Compacto para listados largos, alto para páginas institucionales. */
  alto?: 'compacto' | 'normal';
}

export default function EncabezadoPagina({
  etiqueta,
  titulo,
  bajada,
  migas,
  fondo = 'paneles',
  children,
  alto = 'normal',
}: Props) {
  const id = FONDOS[fondo];

  return (
    <section className="tono-oscuro relative isolate overflow-hidden bg-zoe-black">
      <img
        src={imagen(id, 1600)}
        srcSet={imagenSrcSet(id)}
        sizes="100vw"
        alt=""
        aria-hidden="true"
        // No es el LCP de la home pero sí el de estas páginas: se pide con
        // prioridad para que el encabezado no aparezca en negro y luego salte.
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 -z-20 size-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/70" />

      <div
        className={`contenedor relative text-center ${
          alto === 'compacto' ? 'py-14 lg:py-16' : 'py-20 lg:py-24'
        }`}
      >
        {migas && migas.length > 0 && (
          <nav aria-label="Ruta" className="mb-5 text-sm text-white/60">
            {migas.map((m, i) => (
              <span key={m.texto}>
                {i > 0 && <span className="mx-2">/</span>}
                {m.a ? (
                  <Link to={m.a} className="transition-colors hover:text-marca">
                    {m.texto}
                  </Link>
                ) : (
                  <span className="text-white">{m.texto}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {etiqueta && (
          <p className="chip mx-auto border border-marca-borde bg-black/40 text-marca backdrop-blur-sm">
            {etiqueta}
          </p>
        )}

        <h1 className="mt-5 text-[2rem] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-4xl lg:text-[2.75rem]">
          {titulo}
        </h1>

        {bajada && (
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/85">
            {bajada}
          </p>
        )}

        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
