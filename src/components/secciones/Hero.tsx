import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { site } from '../../lib/site.config';
import { MEDIA_HERO, imagen, imagenSrcSet, posterDeVideo, video } from '../../lib/media';

/**
 * Hero.
 *
 * La foto va detrás de un degradado blanco que arranca opaco y se abre hacia
 * el centro: blanco puro arriba, 70% al medio, 90% abajo. Es el tratamiento
 * que pidió el dueño del sitio de referencia y hace dos cosas a la vez.
 *
 *   · Arriba no hay costura. El encabezado es blanco y el hero empieza en
 *     blanco puro, así que la barra de navegación y la sección se leen como
 *     una sola pieza en vez de dos bloques pegados.
 *   · La foto queda como marca de agua. Se ve de qué va el negocio sin que la
 *     imagen pelee con el titular, y el texto puede ir en el azul oscuro de
 *     la marca en lugar de blanco sobre un velo.
 *
 * El degradado NO es decorativo: es lo que garantiza el contraste. Sobre el
 * píxel más oscuro que puede tener la foto, el 70% de blanco deja el titular
 * en 7,9:1 — por encima del 4,5:1 que exige la norma.
 *
 * Para cambiar la foto por el video: poner MEDIA.tipo en 'video'.
 */

const MEDIA: { tipo: 'imagen' | 'video'; id: string; alt: string } = {
  tipo: 'imagen',
  id: MEDIA_HERO.marcaGlobo,
  alt: 'La Tierra iluminada por el sol, con el logotipo de Clima Zoe',
};

/** El degradado, en un solo sitio para que el hero y su borde no se separen. */
const VELO =
  'linear-gradient(to bottom, ' +
  'rgb(255 255 255) 0%, ' +
  'rgb(255 255 255 / 0.85) 25%, ' +
  'rgb(255 255 255 / 0.7) 50%, ' +
  'rgb(255 255 255 / 0.92) 100%)';

export default function Hero() {
  const [menosMovimiento, setMenosMovimiento] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const leer = () => setMenosMovimiento(mq.matches);
    leer();
    mq.addEventListener('change', leer);
    return () => mq.removeEventListener('change', leer);
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-fondo">
      {MEDIA.tipo === 'video' ? (
        <VideoFondo id={MEDIA.id} alt={MEDIA.alt} congelado={menosMovimiento} />
      ) : (
        <img
          src={imagen(MEDIA.id, 1600)}
          srcSet={imagenSrcSet(MEDIA.id)}
          sizes="100vw"
          alt={MEDIA.alt}
          // Es el elemento más grande de la primera pantalla: se pide con
          // prioridad para que no aparezca el fondo plano y luego salte.
          fetchPriority="high"
          decoding="sync"
          // Imagen completa, sin recortar.
          //
          // Ojo con lo que implica: la pieza trae su propio lettering "Clima
          // Zoe" a la derecha y cae detrás del titular. Para ver la versión
          // encuadrada sólo sobre el globo, cambiar esta línea por:
          //   absolute inset-y-0 left-0 -z-20 h-full w-[175%] max-w-none
          //   object-cover object-left
          className="absolute inset-0 -z-20 size-full object-cover"
        />
      )}

      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: VELO }} />

      <div className="contenedor relative flex min-h-[30rem] flex-col items-center justify-center py-20 text-center lg:min-h-[34rem] lg:py-24">
        <p className="chip entra-hero border border-marca-borde bg-marca-tenue text-marca-texto">
          <span className="size-1.5 rounded-full bg-marca" />
          Proyectos de energía solar
        </p>

        <h1
          className="entra-hero mx-auto mt-6 max-w-4xl text-[2rem] font-bold leading-[1.12] tracking-[-0.025em] sm:text-[2.6rem] lg:text-[3.25rem]"
          style={{ '--retraso': '80ms' } as React.CSSProperties}
        >
          Soluciones de <span className="text-marca-texto">energía solar</span>{' '}
          para hogar, empresas e industria
        </h1>

        <p
          className="entra-hero mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-texto-medio"
          style={{ '--retraso': '160ms' } as React.CSSProperties}
        >
          Construimos proyectos de energía fotovoltaica a su alcance y a la
          medida.
        </p>

        <div
          className="entra-hero mt-9 flex flex-col justify-center gap-3 sm:flex-row"
          style={{ '--retraso': '240ms' } as React.CSSProperties}
        >
          <Link to="/catalogo" className="btn btn-xl btn-primario">
            Explorar
          </Link>
          <a
            href={`https://wa.me/${site.contacto.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-xl btn-solar"
          >
            <IconoWhatsApp />
            Asesoría gratis
          </a>
        </div>

        {/* La calculadora salió de la barra de navegación —no cabía— así que
            su puerta de entrada es esta. Es una herramienta, no una sección:
            funciona mejor como invitación que como pestaña. */}
        <Link
          to="/calculadora"
          className="entra-hero group mt-7 inline-flex items-center gap-2 text-sm font-bold text-apoyo-texto transition-colors hover:text-apoyo-fuerte"
          style={{ '--retraso': '320ms' } as React.CSSProperties}
        >
          <IconoCalculadora />
          Calcule cuánto ahorraría con paneles
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
          >
            →
          </span>
        </Link>
      </div>
    </section>
  );
}

/**
 * Video de fondo: sin sonido, en bucle y en línea.
 *
 * `muted` no es decorativo — sin él los navegadores bloquean la reproducción
 * automática y quedaría el póster fijo. Con "reducir movimiento" activo no se
 * reproduce: se muestra un fotograma.
 */
function VideoFondo({
  id,
  alt,
  congelado,
}: {
  id: string;
  alt: string;
  congelado: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const poster = posterDeVideo(id);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (congelado) v.pause();
    else void v.play().catch(() => {});
  }, [congelado]);

  if (congelado) {
    return (
      <img src={poster} alt={alt} className="absolute inset-0 -z-20 size-full object-cover" />
    );
  }

  return (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      aria-label={alt}
      className="absolute inset-0 -z-20 size-full object-cover"
    >
      <source src={video(id)} type="video/mp4" />
    </video>
  );
}

function IconoWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.43 12.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.08-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
    </svg>
  );
}

function IconoCalculadora() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
      <path d="M8 6.5h8M8 11h.01M12 11h.01M16 11h.01M8 14.5h.01M12 14.5h.01M16 14.5h.01M8 18h.01M12 18h4" />
    </svg>
  );
}
