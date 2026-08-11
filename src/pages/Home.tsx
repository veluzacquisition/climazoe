import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { construirArbol, filtrarProductos, useCatalogo } from '../lib/catalogo';
import TarjetaProducto from '../components/TarjetaProducto';
import { site } from '../lib/site.config';
import type { Segmento } from '../types/catalogo';

/**
 * Home.
 *
 * Las categorías y los destacados salen del catálogo real, no de una lista
 * escrita a mano: si el scraper trae categorías nuevas, la home las muestra
 * sin tocar código.
 *
 * Regla de color: el verde carga la marca (nombre, precios, botones
 * primarios); el rojo es acento puntual y el navy sólo tinta superficies.
 */

export default function Home({ segmento }: { segmento: Segmento }) {
  const { datos, cargando } = useCatalogo();

  const categorias = useMemo(
    () => (datos ? construirArbol(datos.categorias).slice(0, 8) : []),
    [datos],
  );

  /**
   * Destacados: se toma el mejor producto de cada categoría raíz en vez de
   * los cuatro mejores del catálogo. Sin esa restricción la vitrina se llena
   * con cuatro baterías de la misma familia y no muestra a qué se dedica el
   * negocio.
   */
  const destacados = useMemo(() => {
    if (!datos) return [];
    const ordenados = filtrarProductos(
      datos,
      { soloDisponibles: true, orden: 'relevancia' },
      segmento,
    );
    const vistas = new Set<string>();
    const elegidos = [];
    for (const p of ordenados) {
      const raiz = p.ruta[0] ?? p.categoria ?? '';
      if (vistas.has(raiz)) continue;
      vistas.add(raiz);
      elegidos.push(p);
      if (elegidos.length === 4) break;
    }
    return elegidos;
  }, [datos, segmento]);

  return (
    <>
      {/* --- Hero ------------------------------------------------------- */}
      <section>
        <div className="contenedor grid gap-14 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
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

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-borde-suave pt-8">
              {[
                { n: datos ? `${datos.productos.length}` : '—', t: 'productos' },
                { n: datos ? `${datos.categorias.length}` : '—', t: 'categorías' },
                { n: '7+', t: 'años' },
              ].map((s) => (
                <div key={s.t}>
                  <dt className="text-2xl font-bold text-marca">{s.n}</dt>
                  <dd className="mt-0.5 text-xs uppercase tracking-wide text-texto-suave">{s.t}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex aspect-4/3 items-center justify-center rounded-marca-lg border border-dashed border-borde bg-superficie px-6 text-center text-sm text-texto-suave">
            [PENDIENTE: foto real de una instalación de Clima Zoe]
          </div>
        </div>
      </section>

      <div className="contenedor"><div className="regla-tenue" /></div>

      {/* --- Categorías -------------------------------------------------- */}
      <section className="contenedor py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Qué vendemos</h2>
            <p className="mt-3 text-lg text-texto-medio">
              Equipos para hogar, finca y empresa. Si no sabe qué necesita,
              escríbanos y le armamos el sistema a la medida.
            </p>
          </div>
          <Link
            to="/catalogo"
            className="text-sm font-semibold text-marca transition-colors hover:text-marca-fuerte"
          >
            Ver todo →
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cargando
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-marca-lg bg-superficie" />
              ))
            : categorias.map((c) => (
                <Link
                  key={c.slug}
                  to={`/catalogo?categoria=${c.slug}`}
                  className="group flex flex-col justify-between rounded-marca-lg border border-borde-suave bg-superficie p-5 transition-colors hover:border-marca-borde hover:bg-superficie-alta"
                >
                  <h3 className="font-semibold leading-snug transition-colors group-hover:text-marca">
                    {c.nombre}
                  </h3>
                  <p className="mt-3 text-sm text-texto-suave">
                    {c.total} {c.total === 1 ? 'producto' : 'productos'}
                  </p>
                </Link>
              ))}
        </div>
      </section>

      {/* --- Destacados ---------------------------------------------------- */}
      <section className="contenedor py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-bold sm:text-4xl">Productos destacados</h2>
          <Link
            to="/catalogo"
            className="text-sm font-semibold text-marca transition-colors hover:text-marca-fuerte"
          >
            Ver catálogo completo →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cargando
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-marca-lg bg-superficie" />
              ))
            : destacados.map((p) => (
                <TarjetaProducto key={p.id} producto={p} segmento={segmento} />
              ))}
        </div>
      </section>

      {/* --- Cómo compramos ------------------------------------------------- */}
      <section className="contenedor py-16">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              t: 'Le asesoramos gratis',
              d: 'Nos cuenta qué quiere alimentar y le decimos qué sistema le sirve. Sin compromiso.',
            },
            {
              t: 'Cotiza por WhatsApp',
              d: 'Le pasamos precio con instalación incluida si la necesita, y tiempo de entrega.',
            },
            {
              t: 'Instalamos nosotros',
              d: 'No solo vendemos el equipo: lo dejamos funcionando en su casa, finca o negocio.',
            },
          ].map((paso, i) => (
            <div key={paso.t} className="rounded-marca-lg border border-borde-suave bg-superficie p-6">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-marca-tenue text-sm font-bold text-marca">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold">{paso.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-texto-medio">{paso.d}</p>
            </div>
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

      {/* --- CTA final ---------------------------------------------------- */}
      <section className="contenedor py-16">
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
