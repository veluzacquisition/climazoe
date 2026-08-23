import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { site } from '../../lib/site.config';
import { MEDIA_HERO, imagen, imagenSrcSet, posterDeVideo, video } from '../../lib/media';

/**
 * Hero estático.
 *
 * Era un carrusel de tres mensajes; ahora es uno solo. Un carrusel obliga al
 * visitante a esperar para leer y reparte la atención entre tres promesas: en
 * la primera pantalla conviene decir una cosa y decirla bien.
 *
 * La imagen ocupa el bloque a sangre y el contenido va centrado encima, como
 * en el sitio de referencia. El velo está calculado para que el titular
 * blanco mantenga contraste sobre cualquier zona de la foto.
 *
 * Para cambiar la foto por el video: poner MEDIA.tipo en 'video'.
 */

const MEDIA: { tipo: 'imagen' | 'video'; id: string; alt: string } = {
  tipo: 'imagen',
  id: MEDIA_HERO.panelesTecho,
  alt: 'Arreglo de paneles solares sobre un techo, con montañas al fondo',
};

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
    <section className="tono-oscuro relative isolate overflow-hidden bg-fondo">
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
          className="absolute inset-0 -z-20 size-full object-cover"
        />
      )}

      {/* Velo en azul de marca, no negro: tiñe la foto hacia el azul rey y
          deja el hero dentro de la paleta en vez de apagarlo a gris. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[#002452]/78"
      />

      <div className="contenedor relative flex min-h-[32rem] flex-col items-center justify-center py-20 text-center lg:min-h-[36rem] lg:py-28">
        <p className="chip border border-white/25 bg-white/10 text-white backdrop-blur-sm">
          <span className="size-1.5 rounded-full bg-marca" />
          Proyectos de energía solar
        </p>

        <h1 className="mx-auto mt-6 max-w-4xl text-[2rem] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-4xl lg:text-[2.75rem]">
          Soluciones de <span className="text-marca">energía solar</span> para
          hogar, empresas e industria
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
          Construimos proyectos de energía fotovoltaica a su alcance y a la
          medida.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
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
