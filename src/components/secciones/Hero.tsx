import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { site } from '../../lib/site.config';

/**
 * Hero.
 *
 * Es el único bloque donde el negro trabaja a fondo: negro pleno, tipografía
 * enorme y el verde puesto en una sola palabra por slide. Antes el titular se
 * perdía porque el verde competía con un degradado que lavaba todo el fondo;
 * ahora el fondo es negro sólido y el resplandor queda confinado detrás de la
 * imagen, no detrás del texto.
 *
 * La mitad derecha está reservada a la fotografía: cuando lleguen las fotos
 * de instalaciones de Clima Zoe, la energía la va a poner el panel montado en
 * un techo, no un efecto de fondo. Por eso ocupa la mitad del hero desde ya.
 */

interface Slide {
  etiqueta: string;
  antes: string;
  destacado: string;
  despues?: string;
  texto: string;
  cta: { texto: string; a: string };
}

const SLIDES: Slide[] = [
  {
    etiqueta: 'Más de 7 años instalando en Colombia',
    antes: 'Energía solar que',
    destacado: 'se paga sola',
    texto:
      'Vendemos e instalamos el sistema completo: paneles, baterías e inversores. Deje de depender del recibo de luz.',
    cta: { texto: 'Ver catálogo', a: '/catalogo' },
  },
  {
    etiqueta: 'Para finca y zonas sin red',
    antes: 'Luz donde',
    destacado: 'no llega la red',
    texto:
      'Sistemas aislados con baterías de litio y gel para fincas, casas rurales y proyectos lejos del tendido eléctrico.',
    cta: { texto: 'Ver baterías', a: '/catalogo?categoria=baterias' },
  },
  {
    etiqueta: 'Para empresas y pymes',
    antes: 'Baje el costo de',
    destacado: 'su operación',
    texto:
      'Precios de mayorista para negocios, instaladores y proyectos grandes. Cambie a "Empresa" arriba para verlos.',
    cta: { texto: 'Ver inversores', a: '/catalogo?categoria=inversores-solphower' },
  },
];

const INTERVALO = 7000;

export default function Hero() {
  const [activo, setActivo] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (pausado) return;
    const t = setInterval(() => setActivo((i) => (i + 1) % SLIDES.length), INTERVALO);
    return () => clearInterval(t);
  }, [pausado]);

  const ir = (i: number) => setActivo((i + SLIDES.length) % SLIDES.length);
  const s = SLIDES[activo];

  return (
    <section
      className="relative overflow-hidden bg-zoe-black"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      aria-roledescription="carrusel"
      aria-label="Destacados de Clima Zoe"
    >
      <div className="contenedor relative grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-20">
        {/* --- Texto ------------------------------------------------------- */}
        <div>
          <p className="chip border border-marca-borde bg-marca-tenue text-marca">
            <span className="size-1.5 rounded-full bg-marca" />
            {s.etiqueta}
          </p>

          {/* El salto de opacidad va sobre el bloque de texto, no sobre toda
              la sección, para que los controles no parpadeen. */}
          <div key={activo} className="animate-[aparecer_.5s_ease-out]">
            <h1 className="mt-6 font-extrabold leading-[0.95] tracking-[-0.03em] text-zoe-white text-[2.75rem] sm:text-6xl lg:text-7xl">
              {s.antes}{' '}
              <span className="text-marca">{s.destacado}</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-texto-medio sm:text-xl">
              {s.texto}
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link to={s.cta.a} className="btn btn-xl btn-primario">
              {s.cta.texto}
            </Link>
            <a
              href={`https://wa.me/${site.contacto.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-xl btn-urgente"
            >
              <IconoWhatsApp />
              Asesoría gratis
            </a>
          </div>

          <p className="mt-5 text-sm text-texto-suave">
            Le respondemos por WhatsApp con precio, disponibilidad y tiempo de entrega.
          </p>

          {/* --- Controles --- */}
          <div className="mt-10 flex items-center gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => ir(activo - 1)}
                aria-label="Anterior"
                className="flex size-11 items-center justify-center rounded-full border border-borde text-texto-medio transition-colors hover:border-marca hover:text-marca"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => ir(activo + 1)}
                aria-label="Siguiente"
                className="flex size-11 items-center justify-center rounded-full border border-borde text-texto-medio transition-colors hover:border-marca hover:text-marca"
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
                    i === activo ? 'w-10 bg-marca' : 'w-3 bg-borde hover:bg-texto-suave'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* --- Fotografía --------------------------------------------------
            El resplandor vive acá detrás, confinado a la imagen: así aporta
            profundidad sin lavar el contraste del titular. */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-6 rounded-full opacity-30 blur-[100px]"
            style={{ background: 'var(--marca)' }}
          />
          <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-marca-lg border border-dashed border-borde bg-superficie px-8 text-center">
            <p className="text-sm text-texto-suave">
              [PENDIENTE: foto real de una instalación de Clima Zoe]
              <span className="mt-2 block text-xs">
                Va a ocupar todo este espacio, a sangre. Una por slide.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function IconoWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.43 12.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.08-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
    </svg>
  );
}
