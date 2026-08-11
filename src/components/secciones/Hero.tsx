import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { site } from '../../lib/site.config';

/**
 * Slideshow del hero, con la misma mecánica que el del sitio de referencia
 * (transición por fundido, flechas y puntos) pero resuelto con tipografía y
 * color en vez de banners: todavía no hay fotos propias de Clima Zoe y poner
 * imágenes de terceros en la primera pantalla sería justo lo que no queremos.
 *
 * Cuando lleguen las fotos, cada slide acepta una imagen de fondo sin cambiar
 * la estructura.
 */

interface Slide {
  etiqueta: string;
  titulo: React.ReactNode;
  texto: string;
  cta: { texto: string; a: string };
  secundario?: { texto: string; a: string };
}

const SLIDES: Slide[] = [
  {
    etiqueta: 'Más de 7 años instalando en Colombia',
    titulo: (
      <>
        Energía solar
        <br />
        que <span className="text-marca">se paga sola</span>
      </>
    ),
    texto:
      'Vendemos e instalamos el sistema completo: paneles, baterías, inversores y todo lo que necesita para dejar de depender del recibo de luz.',
    cta: { texto: 'Ver catálogo', a: '/catalogo' },
    secundario: { texto: 'Pedir asesoría', a: 'whatsapp' },
  },
  {
    etiqueta: 'Para finca y zonas sin red',
    titulo: (
      <>
        Luz donde
        <br />
        <span className="text-marca">no llega la red</span>
      </>
    ),
    texto:
      'Sistemas aislados con baterías de litio y gel para fincas, casas rurales y proyectos lejos del tendido eléctrico.',
    cta: { texto: 'Ver baterías', a: '/catalogo?categoria=baterias' },
    secundario: { texto: 'Hablar con un asesor', a: 'whatsapp' },
  },
  {
    etiqueta: 'Para empresas y pymes',
    titulo: (
      <>
        Baje el costo
        <br />
        de <span className="text-marca">su operación</span>
      </>
    ),
    texto:
      'Precios de mayorista para negocios, instaladores y proyectos grandes. Cambie a "Empresa" arriba para ver sus precios.',
    cta: { texto: 'Ver inversores', a: '/catalogo?categoria=inversores-solphower' },
    secundario: { texto: 'Cotizar proyecto', a: 'whatsapp' },
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

  return (
    <section
      className="relative overflow-hidden border-b border-borde-suave"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      aria-roledescription="carrusel"
      aria-label="Destacados de Clima Zoe"
    >
      {/* Resplandor verde de fondo: el único adorno, y va detrás del texto. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-1/2 size-[36rem] -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
        style={{ background: 'var(--marca)' }}
      />

      <div className="contenedor relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="relative min-h-[24rem]">
          {SLIDES.map((s, i) => (
            <div
              key={i}
              aria-hidden={i !== activo}
              className={`transition-opacity duration-700 ${
                i === activo
                  ? 'relative opacity-100'
                  : 'pointer-events-none absolute inset-0 opacity-0'
              }`}
            >
              <p className="inline-flex items-center gap-2 rounded-full border border-marca-borde bg-marca-tenue px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-marca">
                <span className="size-1.5 rounded-full bg-marca" />
                {s.etiqueta}
              </p>

              <h1 className="mt-7 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
                {s.titulo}
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-texto-medio">
                {s.texto}
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to={s.cta.a}
                  className="rounded-marca bg-marca px-6 py-3.5 font-semibold text-marca-contraste transition-colors hover:bg-marca-fuerte"
                >
                  {s.cta.texto}
                </Link>
                {s.secundario && (
                  <a
                    href={`https://wa.me/${site.contacto.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-marca border border-borde px-6 py-3.5 font-semibold text-texto transition-colors hover:border-marca-borde hover:text-marca"
                  >
                    {s.secundario.texto}
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* --- Controles --- */}
          <div className="mt-10 flex items-center gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => ir(activo - 1)}
                aria-label="Anterior"
                className="flex size-10 items-center justify-center rounded-full border border-borde text-texto-medio transition-colors hover:border-marca-borde hover:text-marca"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => ir(activo + 1)}
                aria-label="Siguiente"
                className="flex size-10 items-center justify-center rounded-full border border-borde text-texto-medio transition-colors hover:border-marca-borde hover:text-marca"
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
                    i === activo ? 'w-8 bg-marca' : 'w-3 bg-borde hover:bg-texto-suave'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex aspect-4/3 items-center justify-center rounded-marca-lg border border-dashed border-borde bg-superficie px-6 text-center text-sm text-texto-suave">
          [PENDIENTE: fotos reales de instalaciones de Clima Zoe — una por slide]
        </div>
      </div>
    </section>
  );
}
