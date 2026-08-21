import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { aniosDeTrayectoria, site } from '../../lib/site.config';
import { MEDIA_HERO, imagen, imagenSrcSet, posterDeVideo, video } from '../../lib/media';

/**
 * Hero con la imagen DENTRO y el texto encima, como los referentes del sector
 * (Trinity, Momentum, Solaris): la fotografía ocupa todo el bloque a sangre y
 * el contenido va superpuesto.
 *
 * Es el único punto oscuro del sitio, y la oscuridad la pone la imagen, no un
 * bloque de color: por eso el resto de la página es clara sin contradicción.
 *
 * El velo va fuerte del lado del texto y se abre hacia la derecha. Si tapara
 * todo el ancho, la fotografía dejaría de aportar y el hero volvería a ser un
 * rectángulo negro.
 */

type Media =
  | { tipo: 'imagen'; id: string; alt: string }
  | { tipo: 'video'; id: string; alt: string };

interface Slide {
  etiqueta: string;
  antes: string;
  destacado: string;
  texto: string;
  cta: { texto: string; a: string };
  media: Media;
}

const SLIDES: Slide[] = [
  {
    etiqueta: `${aniosDeTrayectoria()} años instalando en Colombia`,
    antes: 'Energía solar que',
    destacado: 'se paga sola',
    texto:
      'Vendemos e instalamos el sistema completo: paneles, baterías e inversores. Deje de depender del recibo de luz.',
    cta: { texto: 'Ver catálogo', a: '/catalogo' },
    media: {
      tipo: 'imagen',
      id: MEDIA_HERO.panelesTecho,
      alt: 'Arreglo de paneles solares instalado sobre un techo metálico, con montañas al fondo',
    },
  },
  {
    etiqueta: 'Venta e instalación',
    antes: 'Se lo dejamos',
    destacado: 'funcionando',
    texto:
      'No solo vendemos el equipo: lo montamos, lo conectamos y le enseñamos a operarlo. En casa, finca o negocio.',
    cta: { texto: 'Ver servicios', a: '/servicios' },
    media: {
      tipo: 'video',
      id: MEDIA_HERO.videoInstalacion,
      alt: 'Instalación de un sistema solar en cubierta',
    },
  },
  {
    etiqueta: 'Para finca y zonas sin red',
    antes: 'Luz donde',
    destacado: 'no llega la red',
    texto:
      'Sistemas aislados con baterías de litio y gel para fincas, casas rurales y proyectos lejos del tendido eléctrico.',
    cta: { texto: 'Ver baterías', a: '/catalogo?categoria=baterias' },
    media: {
      tipo: 'imagen',
      id: MEDIA_HERO.instalacion,
      alt: 'Técnico instalando paneles solares sobre una cubierta',
    },
  },
];

const INTERVALO = 7000;

export default function Hero() {
  const [activo, setActivo] = useState(0);
  const [pausado, setPausado] = useState(false);

  // Quien pidió menos movimiento no recibe ni carrusel automático ni video:
  // se queda en el primer slide con la foto fija.
  const [menosMovimiento, setMenosMovimiento] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const leer = () => setMenosMovimiento(mq.matches);
    leer();
    mq.addEventListener('change', leer);
    return () => mq.removeEventListener('change', leer);
  }, []);

  useEffect(() => {
    if (pausado || menosMovimiento) return;
    const t = setInterval(() => setActivo((i) => (i + 1) % SLIDES.length), INTERVALO);
    return () => clearInterval(t);
  }, [pausado, menosMovimiento]);

  const ir = (i: number) => setActivo((i + SLIDES.length) % SLIDES.length);
  const s = SLIDES[activo];

  return (
    <section
      className="tono-oscuro relative isolate overflow-hidden bg-zoe-black"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      aria-roledescription="carrusel"
      aria-label="Destacados de Clima Zoe"
    >
      {/* --- Media, a sangre. Se montan todas y se cruzan por opacidad para
          que el cambio de slide no muestre un hueco mientras carga. ------- */}
      {SLIDES.map((sl, i) => (
        <div
          key={i}
          aria-hidden={i !== activo}
          className={`absolute inset-0 -z-20 transition-opacity duration-700 ${
            i === activo ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {sl.media.tipo === 'video' ? (
            <VideoFondo
              id={sl.media.id}
              alt={sl.media.alt}
              activo={i === activo}
              congelado={menosMovimiento}
            />
          ) : (
            <img
              src={imagen(sl.media.id, 1600)}
              srcSet={imagenSrcSet(sl.media.id)}
              sizes="100vw"
              alt={sl.media.alt}
              // La primera es el elemento más grande de la primera pantalla:
              // se carga con prioridad y las demás no compiten con ella.
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'low'}
              decoding={i === 0 ? 'sync' : 'async'}
              className="size-full object-cover"
            />
          )}
        </div>
      ))}

      {/* --- Velo. Centrado y parejo, no en degradado lateral: el contenido
          ahora va al centro y necesita el mismo fondo a los dos lados. ---- */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/65" />

      {/* --- Contenido, centrado como en la referencia -------------------- */}
      <div className="contenedor relative flex min-h-[34rem] flex-col items-center justify-center py-20 text-center lg:min-h-[38rem] lg:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="chip border border-marca-borde bg-black/40 text-marca backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-marca" />
            {s.etiqueta}
          </p>

          <div key={activo} className="animate-[aparecer_.5s_ease-out]">
            <h1 className="mt-6 text-[2rem] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-4xl lg:text-[2.75rem]">
              {s.antes} <span className="text-marca">{s.destacado}</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/85">
              {s.texto}
            </p>
          </div>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={s.cta.a} className="btn btn-xl btn-primario">
              {s.cta.texto}
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

        {/* --- Controles ---------------------------------------------------- */}
        <div className="mt-14 flex items-center justify-center gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => ir(activo - 1)}
              aria-label="Anterior"
              className="flex size-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-marca hover:text-marca"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => ir(activo + 1)}
              aria-label="Siguiente"
              className="flex size-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-marca hover:text-marca"
            >
              ›
            </button>
          </div>

          <div className="flex gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => ir(i)}
                aria-label={`Ir al destacado ${i + 1}`}
                aria-current={i === activo}
                className={`h-1.5 rounded-full transition-all ${
                  i === activo ? 'w-10 bg-marca' : 'w-3 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Video de fondo: sin sonido, en bucle y en línea.
 *
 *  · `muted` no es decorativo: sin él los navegadores bloquean la
 *    reproducción automática y el slide se quedaría en el póster.
 *  · `playsInline` evita que iOS lo abra a pantalla completa.
 *  · Se pausa cuando su slide no está visible: un video corriendo detrás de
 *    otro slide gasta batería y datos sin que nadie lo vea.
 *  · Con "reducir movimiento" activo no se reproduce: se muestra el póster.
 */
function VideoFondo({
  id,
  alt,
  activo,
  congelado,
}: {
  id: string;
  alt: string;
  activo: boolean;
  congelado: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const poster = posterDeVideo(id);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (activo && !congelado) {
      // Puede fallar si el navegador bloquea el autoplay; el póster queda.
      void v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [activo, congelado]);

  if (congelado) {
    return <img src={poster} alt={alt} className="size-full object-cover" />;
  }

  return (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={alt}
      className="size-full object-cover"
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
