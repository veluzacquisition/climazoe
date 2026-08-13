import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { relacionados, useProducto } from '../lib/catalogo';
import BotonCompra from '../components/BotonCompra';
import TarjetaProducto from '../components/TarjetaProducto';
import { precio as formatear } from '../lib/formato';
import { site } from '../lib/site.config';
import type { Segmento } from '../types/catalogo';

export default function Producto({ segmento }: { segmento: Segmento }) {
  const { slug } = useParams();
  const { producto, catalogo, cargando } = useProducto(slug);
  const [imagenActiva, setImagenActiva] = useState(0);

  // Al saltar de un relacionado a otro cambia la ruta pero no se desmonta la
  // página: sin esto quedarías a mitad del scroll del producto anterior.
  useEffect(() => {
    setImagenActiva(0);
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (cargando) {
    return (
      <div className="contenedor py-16">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-marca-lg bg-superficie" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-superficie" />
            <div className="h-4 w-full animate-pulse rounded bg-superficie" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-superficie" />
          </div>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="contenedor py-24 text-center">
        <h1 className="text-3xl font-bold">Producto no encontrado</h1>
        <p className="mt-3 text-texto-medio">
          Puede que haya cambiado de nombre o ya no esté en el catálogo.
        </p>
        <Link
          to="/catalogo"
          className="mt-8 inline-flex rounded-marca bg-marca px-6 py-3 font-semibold text-marca-contraste"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const valor = producto.precios[segmento] ?? producto.precios.minorista ?? null;
  const specs = Object.entries(producto.specs);
  const similares = catalogo ? relacionados(catalogo, producto) : [];

  return (
    <div className="bg-fondo">
      <div className="contenedor py-10">
      {/* --- Ruta ---------------------------------------------------------- */}
      <nav aria-label="Ruta" className="text-sm text-texto-suave">
        <Link to="/" className="transition-colors hover:text-marca-texto">Inicio</Link>
        <span className="mx-2">/</span>
        <Link to="/catalogo" className="transition-colors hover:text-marca-texto">Catálogo</Link>
        {producto.categoria && producto.ruta[0] && (
          <>
            <span className="mx-2">/</span>
            <Link
              to={`/catalogo?categoria=${producto.categoria}`}
              className="transition-colors hover:text-marca-texto"
            >
              {producto.ruta[0]}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* --- Galería ------------------------------------------------------ */}
        <div>
          <div className="overflow-hidden rounded-marca-lg border border-borde-suave bg-white">
            <img
              src={producto.imagenes[imagenActiva]}
              alt={producto.nombre}
              className="aspect-square w-full object-contain p-8"
            />
          </div>

          {producto.imagenes.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {producto.imagenes.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setImagenActiva(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                  aria-current={i === imagenActiva}
                  className={`size-20 overflow-hidden rounded-marca border-2 bg-white transition-colors ${
                    i === imagenActiva ? 'border-marca' : 'border-borde-suave hover:border-borde'
                  }`}
                >
                  <img src={img} alt="" loading="lazy" className="size-full object-contain p-1.5" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- Información -------------------------------------------------- */}
        <div>
          {producto.ruta.length > 0 && (
            <p className="text-xs font-medium uppercase tracking-wide text-marca-texto">
              {producto.ruta.join(' · ')}
            </p>
          )}

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{producto.nombre}</h1>

          {producto.resumen && (
            <p className="mt-4 text-lg leading-relaxed text-texto-medio">{producto.resumen}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            {producto.sku && (
              <span className="rounded-marca border border-borde bg-superficie px-3 py-1.5 text-texto-medio">
                Ref: <span className="font-mono text-texto">{producto.sku}</span>
              </span>
            )}
            <span
              className={`rounded-marca px-3 py-1.5 font-semibold ${
                producto.disponible
                  ? 'border border-marca-borde bg-marca-tenue text-marca-texto'
                  : 'border border-acento/40 bg-acento-tenue text-acento-texto'
              }`}
            >
              {producto.disponible ? 'Disponible' : 'Agotado — consultar'}
            </span>
          </div>

          {/* --- Precio y compra ------------------------------------------- */}
          <div className="mt-8 rounded-marca-lg border border-borde bg-superficie p-6">
            {valor ? (
              <>
                <p className="text-sm text-texto-medio">
                  Precio {segmento === 'mayorista' ? 'para empresas' : 'para hogar'}
                </p>
                <p className="mt-1 text-4xl font-extrabold tracking-tight text-marca-texto sm:text-5xl">{formatear(valor)}</p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold">Precio a cotizar</p>
                <p className="mt-1.5 text-sm leading-relaxed text-texto-medio">
                  Escríbanos y le pasamos el precio con instalación incluida si
                  la necesita.
                </p>
              </>
            )}

            <div className="mt-5">
              <BotonCompra producto={producto} segmento={segmento} />
            </div>

            <p className="mt-3 text-center text-xs text-texto-suave">
              Le respondemos por WhatsApp con precio, disponibilidad y tiempo de entrega.
            </p>
          </div>

          {/* --- Fichas técnicas -------------------------------------------- */}
          {producto.fichas.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-texto-suave">
                Ficha técnica
              </h2>
              <ul className="mt-3 space-y-2">
                {producto.fichas.map((f) => (
                  <li key={f.url}>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-marca border border-borde-suave bg-superficie px-4 py-3 text-sm transition-colors hover:border-marca-borde"
                    >
                      <span className="rounded bg-acento-tenue px-2 py-0.5 text-[10px] font-bold text-acento-texto">
                        PDF
                      </span>
                      <span className="line-clamp-1 flex-1 text-texto-medio">{f.nombre}</span>
                      <span className="text-marca-texto">Abrir</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* --- Descripción y specs -------------------------------------------- */}
      {(producto.descripcion || specs.length > 0) && (
        <div
          className={`mt-16 grid gap-10 ${
            specs.length > 0 ? 'lg:grid-cols-[1fr_22rem]' : ''
          }`}
        >
          {producto.descripcion && (
            <section className={specs.length > 0 ? '' : 'max-w-3xl'}>
              <h2 className="text-2xl font-bold">Descripción</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-texto-medio">
                {producto.descripcion}
              </p>
            </section>
          )}

          {specs.length > 0 && (
            <section className={producto.descripcion ? '' : 'lg:col-span-2'}>
              <h2 className="text-2xl font-bold">Especificaciones</h2>
              <dl className="mt-4 overflow-hidden rounded-marca-lg border border-borde-suave">
                {specs.map(([clave, valorSpec], i) => (
                  <div
                    key={clave}
                    className={`flex gap-4 px-4 py-3 text-sm ${
                      i % 2 ? 'bg-superficie' : 'bg-superficie-alta'
                    }`}
                  >
                    <dt className="w-2/5 shrink-0 text-texto-suave">{clave}</dt>
                    <dd className="font-medium text-texto">{valorSpec}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      )}

      {/* --- Video ------------------------------------------------------------ */}
      {producto.videos.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold">En video</h2>
          <div className="mt-4 aspect-video max-w-3xl overflow-hidden rounded-marca-lg border border-borde-suave">
            <iframe
              src={producto.videos[0].replace('watch?v=', 'embed/')}
              title={`Video de ${producto.nombre}`}
              allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              loading="lazy"
              className="size-full"
            />
          </div>
        </section>
      )}

      {/* --- Relacionados ------------------------------------------------------ */}
      {similares.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold">También le puede servir</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similares.map((p) => (
              <TarjetaProducto key={p.id} producto={p} segmento={segmento} />
            ))}
          </div>
        </section>
      )}

      {/* --- Ayuda -------------------------------------------------------------- */}
      <section className="mt-20 rounded-marca-lg border border-borde bg-superficie px-8 py-12 text-center">
        <h2 className="text-2xl font-bold">
          ¿No sabe si este equipo es el que <span className="text-marca-texto">necesita</span>?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-texto-medio">
          Cuéntenos qué quiere alimentar con energía solar y le decimos
          exactamente qué le sirve. La asesoría no cuesta.
        </p>
        <a
          href={`https://wa.me/${site.contacto.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex rounded-marca bg-marca px-7 py-3.5 font-semibold text-marca-contraste transition-colors hover:bg-marca-fuerte"
        >
          Hablar con un asesor
        </a>
      </section>
      </div>
    </div>
  );
}
