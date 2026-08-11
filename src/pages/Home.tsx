import { Link } from 'react-router-dom';
import { site } from '../lib/site.config';

/**
 * Home.
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
      <section className="bg-fondo-hondo">
        <div className="contenedor grid gap-12 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <p className="inline-flex rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80">
              Más de 7 años instalando en Colombia
            </p>
            <h1 className="mt-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Energía solar que se paga sola
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/70">
              {site.claim}. Vendemos e instalamos el sistema completo: paneles,
              baterías, inversores y todo lo que necesita para dejar de
              depender del recibo de luz.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/catalogo"
                className="rounded-marca bg-accion px-6 py-3.5 font-semibold text-accion-contraste transition-colors hover:bg-accion-fuerte"
              >
                Ver catálogo
              </Link>
              <a
                href={`https://wa.me/${site.contacto.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-marca border border-white/25 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Pedir asesoría
              </a>
            </div>
          </div>

          <div className="flex aspect-4/3 items-center justify-center rounded-marca-lg border border-dashed border-white/20 text-center text-sm text-white/50">
            [PENDIENTE: foto real de una instalación de Clima Zoe]
          </div>
        </div>
      </section>

      {/* --- Categorías -------------------------------------------------- */}
      <section className="contenedor py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl">Qué vendemos</h2>
          <p className="mt-3 text-lg text-tinta-media">
            Equipos para hogar, finca y empresa. Si no sabe qué necesita,
            escríbanos y le armamos el sistema a la medida.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIAS_HERO.map((c) => (
            <Link
              key={c.slug}
              to={`/catalogo?categoria=${c.slug}`}
              className="group rounded-marca-lg border border-borde bg-fondo p-6 transition-all hover:border-marca hover:shadow-marca"
            >
              <h3 className="text-lg font-semibold transition-colors group-hover:text-marca">
                {c.nombre}
              </h3>
              <p className="mt-1.5 text-sm text-tinta-media">{c.detalle}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* --- Prueba social ----------------------------------------------- */}
      <section className="border-y border-borde bg-fondo-alt">
        <div className="contenedor py-16">
          <div className="rounded-marca-lg border border-dashed border-alerta/40 bg-alerta/5 p-8 text-center">
            <p className="text-sm font-semibold text-alerta">
              [PENDIENTE: contenido real de Clima Zoe]
            </p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-tinta-media">
              Acá van proyectos realizados, número de instalaciones, fotos
              propias y testimonios. Juan Felipe pasa este material aparte.
            </p>
          </div>
        </div>
      </section>

      {/* --- CTA final ---------------------------------------------------- */}
      <section className="contenedor py-20">
        <div className="rounded-marca-lg bg-marca px-8 py-14 text-center sm:px-14">
          <h2 className="text-3xl font-bold text-marca-contraste sm:text-4xl">
            ¿Cuánto puede ahorrar con energía solar?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-marca-contraste/85">
            Cuéntenos cuánto paga de luz al mes y le decimos qué sistema le
            sirve y en cuánto tiempo se paga.
          </p>
          <a
            href={`https://wa.me/${site.contacto.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex rounded-marca bg-accion px-7 py-4 font-semibold text-accion-contraste transition-colors hover:bg-accion-fuerte"
          >
            Hablar con un asesor
          </a>
        </div>
      </section>
    </>
  );
}
