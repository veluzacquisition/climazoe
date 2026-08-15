import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { aniosDeTrayectoria, site } from '../../lib/site.config';
import FondoHero from './FondoHero';

/**
 * Hero con la imagen DENTRO y el texto encima, como los referentes del sector
 * (Trinity, Momentum, Solaris): la fotografía ocupa todo el bloque a sangre y
 * el contenido va superpuesto.
 *
 * Es el único punto oscuro del sitio, y la oscuridad la pone la imagen, no un
 * bloque de color: por eso el resto de la página es clara sin contradicción.
 *
 * El velo sobre la foto está calculado, no puesto a ojo — hace falta un negro
 * al 62% en el lado del texto para que el titular blanco mantenga 4.5:1 sobre
 * cualquier foto, incluida una de mediodía. Se degrada hacia la derecha para
 * no tapar la imagen.
 *
 * Para poner la foto real: reemplazar <FondoHero /> por un <img> con las
 * mismas clases de posición. Nada más cambia.
 */

interface Slide {
  etiqueta: string;
  antes: string;
  destacado: string;
  texto: string;
  cta: { texto: string; a: string };
}

const SLIDES: Slide[] = [
  {
    etiqueta: `${aniosDeTrayectoria()} años instalando en Colombia`,
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
      className="tono-oscuro relative isolate overflow-hidden"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      aria-roledescription="carrusel"
      aria-label="Destacados de Clima Zoe"
    >
      {/* --- Imagen, a sangre -------------------------------------------- */}
      <FondoHero className="absolute inset-0 -z-20 size-full object-cover" />

      {/* --- Velo: fuerte donde va el texto, y se abre para dejar ver la
          imagen. Si el degradado tapa todo el ancho, la fotografía deja de
          aportar y el hero vuelve a ser un rectángulo negro. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/45 to-transparent"
      />

      {/* --- Contenido, encima -------------------------------------------- */}
      <div className="contenedor relative flex min-h-[34rem] flex-col justify-center py-16 lg:min-h-[40rem] lg:py-24">
        <div className="max-w-2xl">
          <p className="chip border border-marca-borde bg-black/40 text-marca backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-marca" />
            {s.etiqueta}
          </p>

          <div key={activo} className="animate-[aparecer_.5s_ease-out]">
            <h1 className="mt-6 text-[2.25rem] font-bold leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl lg:text-[3.25rem]">
              {s.antes} <span className="text-marca">{s.destacado}</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/85">
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

          <p className="mt-5 text-sm text-white/70">
            Le respondemos por WhatsApp con precio, disponibilidad y tiempo de entrega.
          </p>
        </div>

        {/* --- Controles ---------------------------------------------------- */}
        <div className="mt-12 flex items-center gap-4">
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

          <p className="ml-auto hidden max-w-64 rounded-marca bg-black/55 px-3 py-2 text-right text-xs text-white/70 backdrop-blur-sm lg:block">
            [PENDIENTE: este gráfico se reemplaza por la foto real de una
            instalación de Clima Zoe]
          </p>
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
