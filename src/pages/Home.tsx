import { Link } from 'react-router-dom';
import { site } from '../lib/site.config';

/**
 * Home.
 *
 * Regla de color: el verde carga la marca (nombre, precios, botones
 * primarios, estados activos); el rojo aparece en acentos puntuales y el navy
 * sólo en bordes y fondos de tarjeta. El resto es negro y espacio negativo.
 *
 * Los bloques de historia, cifras y testimonios quedan marcados como
 * pendientes a propósito: ese contenido lo pasa Juan Felipe y no se inventa.
 */

const CATEGORIAS_HERO = [
  { slug: 'paneles-solares', nombre: 'Paneles solares', detalle: 'Monocristalinos de alta eficiencia' },
  { slug: 'baterias', nombre: 'Baterías', detalle: 'Litio, gel y AGM' },
  { slug: 'inversores', nombre: 'Inversores', detalle: 'Híbridos, on-grid y off-grid' },
  { slug: 'iluminacion', nombre: 'Iluminación LED', detalle: 'Lámparas y reflectores solares' },
  { slug: 'refrigeracion', nombre: 'Refrigeración solar', detalle: 'Neveras y congeladores' },
  { slug: 'bombeo', nombre: 'Bombeo de agua', detalle: 'Bombas solares para finca' },
];

export default function Home() {
  return (
    <>
      {/* --- Hero ------------------------------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="contenedor grid gap-14 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-marca-borde bg-marca-tenue px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-marca">
              <span className="size-1.5 rounded-full bg-marca" />
              Más de 7 años instalando en Colombia
            </p>

            <h1 className="mt-7 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              Energía solar
              <br />
              que <span className="text-marca">se paga sola</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-texto-medio">
              {site.claim}. Vendemos e instalamos el sistema completo: paneles,
              baterías, inversores y todo lo que necesita para dejar de
              depender del recibo de luz.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/catalogo"
                className="rounded-marca bg-marca px-6 py-3.5 font-semibold text-marca-contraste transition-colors hover:bg-marca-fuerte"
              >
                Ver catálogo
              </Link>
              <a
                href={`https://wa.me/${site.contacto.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-marca border border-borde px-6 py-3.5 font-semibold text-texto transition-colors hover:border-marca-borde hover:text-marca"
              >
                Pedir asesoría
              </a>
            </div>
          </div>

          <div className="flex aspect-4/3 items-center justify-center rounded-marca-lg border border-dashed border-borde bg-superficie px-6 text-center text-sm text-texto-suave">
            [PENDIENTE: foto real de una instalación de Clima Zoe]
          </div>
        </div>
      </section>

      <div className="contenedor"><div className="regla-tenue" /></div>

      {/* --- Categorías -------------------------------------------------- */}
      <section className="contenedor py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl">Qué vendemos</h2>
          <p className="mt-3 text-lg text-texto-medio">
            Equipos para hogar, finca y empresa. Si no sabe qué necesita,
            escríbanos y le armamos el sistema a la medida.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIAS_HERO.map((c) => (
            <Link
              key={c.slug}
              to={`/catalogo?categoria=${c.slug}`}
              className="group rounded-marca-lg border border-borde-suave bg-superficie p-6 transition-colors hover:border-marca-borde hover:bg-superficie-alta"
            >
              <h3 className="text-lg font-semibold transition-colors group-hover:text-marca">
                {c.nombre}
              </h3>
              <p className="mt-1.5 text-sm text-texto-medio">{c.detalle}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* --- Prueba social ----------------------------------------------- */}
      <section className="contenedor py-6">
        <div className="rounded-marca-lg border border-dashed border-acento/30 bg-acento-tenue p-8 text-center">
          <p className="text-sm font-semibold text-acento-texto">
            [PENDIENTE: contenido real de Clima Zoe]
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm text-texto-medio">
            Acá van proyectos realizados, número de instalaciones, fotos
            propias y testimonios. Juan Felipe pasa este material aparte.
          </p>
        </div>
      </section>

      {/* --- CTA final ----------------------------------------------------
          Tarjeta con tinte navy en vez de un bloque verde entero: el verde
          rinde más como acento concentrado que como superficie grande. */}
      <section className="contenedor py-20">
        <div className="overflow-hidden rounded-marca-lg border border-borde bg-superficie px-8 py-16 text-center sm:px-14">
          <h2 className="text-3xl font-bold sm:text-4xl">
            ¿Cuánto puede <span className="text-marca">ahorrar</span> con energía solar?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-texto-medio">
            Cuéntenos cuánto paga de luz al mes y le decimos qué sistema le
            sirve y en cuánto tiempo se paga.
          </p>
          <a
            href={`https://wa.me/${site.contacto.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-9 inline-flex rounded-marca bg-marca px-7 py-4 font-semibold text-marca-contraste transition-colors hover:bg-marca-fuerte"
          >
            Hablar con un asesor
          </a>
        </div>
      </section>
    </>
  );
}
