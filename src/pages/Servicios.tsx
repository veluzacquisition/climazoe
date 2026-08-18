import { Link } from 'react-router-dom';
import Seccion, { TituloSeccion } from '../components/Seccion';
import Pendiente from '../components/Pendiente';
import { certificacionesDeProducto, lineasDeProducto, site } from '../lib/site.config';

/**
 * Servicios y líneas de producto.
 *
 * Las líneas salen del material comercial de la empresa, no del catálogo:
 * son lo que Clima Zoe dice que vende. Cada una enlaza a la categoría
 * correspondiente del catálogo real.
 */
export default function Servicios() {
  return (
    <>
      <Seccion espaciado="amplio">
        <div className="max-w-3xl">
          <p className="chip border border-marca-borde bg-marca-tenue text-marca-texto">
            Productos y servicios
          </p>
          <h1 className="mt-6 text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl">
            Energías renovables,
            <br />
            <span className="text-marca-texto">de la asesoría al montaje</span>
          </h1>
          <p className="mt-7 text-xl leading-relaxed text-texto-medio">
            Comercializamos e instalamos sistemas de energía limpia para
            hogares, fincas, comercios e industria, y orientamos a cada cliente
            en el ahorro de energía antes de venderle nada.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href={`https://wa.me/${site.contacto.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-xl btn-primario"
            >
              Pedir asesoría gratis
            </a>
            <Link to="/catalogo" className="btn btn-xl btn-contorno">
              Ver catálogo
            </Link>
          </div>
        </div>
      </Seccion>

      {/* --- Líneas de producto -------------------------------------------- */}
      <Seccion fondo="alt">
        <TituloSeccion
          titulo="Qué comercializamos"
          bajada="Cinco líneas de producto, todas con asesoría técnica incluida."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lineasDeProducto.map((l, i) => (
            <Link
              key={l.titulo}
              to={`/catalogo?categoria=${l.categoria}`}
              className="group flex flex-col rounded-marca-lg border border-borde bg-fondo p-7 transition-colors hover:border-marca"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-marca text-sm font-bold text-marca-contraste">
                {i + 1}
              </span>
              <h3 className="mt-5 text-xl font-bold transition-colors group-hover:text-marca-texto">
                {l.titulo}
              </h3>
              <p className="mt-2 flex-1 leading-relaxed text-texto-medio">{l.detalle}</p>
              <span className="mt-5 text-sm font-bold text-marca-texto">
                Ver productos →
              </span>
            </Link>
          ))}
        </div>
      </Seccion>

      {/* --- Ahorro ---------------------------------------------------------- */}
      <Seccion>
        <div className="grid items-center gap-10 rounded-marca-lg border border-marca-borde bg-marca-tenue p-8 sm:p-12 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="chip bg-acento text-acento-contraste">Ahorre</span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Más de un <span className="text-marca-texto">50% en consumo</span>,
              más beneficios tributarios
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-texto-medio">
              La energía solar no solo baja el recibo: en Colombia los sistemas
              de generación con fuentes no convencionales tienen incentivos
              tributarios. Le explicamos cuáles aplican a su caso.
            </p>
          </div>
          <a
            href={`https://wa.me/${site.contacto.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-xl btn-primario shrink-0"
          >
            Calcular mi ahorro
          </a>
        </div>
      </Seccion>

      {/* --- Certificaciones --------------------------------------------------
          Rotuladas como certificación de los EQUIPOS, no de Clima Zoe:
          presentarlas como propias sería atribuirse algo que no se tiene. */}
      <Seccion fondo="alt" espaciado="compacto">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-texto-suave">
          Los equipos que comercializamos cumplen
        </p>
        <div className="mt-7 flex flex-wrap items-stretch justify-center gap-3">
          {certificacionesDeProducto.map((c) => (
            <div
              key={c.sigla}
              className="rounded-marca border border-borde bg-fondo px-5 py-3 text-center"
            >
              <p className="text-lg font-bold text-marca-texto">{c.sigla}</p>
              <p className="mt-0.5 text-xs text-texto-medio">{c.detalle}</p>
            </div>
          ))}
        </div>
      </Seccion>

      {/* --- Cómo trabajamos -------------------------------------------------- */}
      <Seccion fondo="alt">
        <TituloSeccion
          titulo="Cómo trabajamos"
          bajada="Capacitamos y orientamos antes de vender. Es parte de la misión, no un extra."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              t: 'Diagnóstico',
              d: 'Revisamos su consumo y qué quiere alimentar. Sin costo ni compromiso.',
            },
            {
              t: 'Dimensionamiento',
              d: 'Definimos paneles, baterías e inversor según su consumo real, no según lo que queramos vender.',
            },
            {
              t: 'Instalación',
              d: 'Montaje del sistema completo, con las protecciones y estructuras que corresponden.',
            },
            {
              t: 'Acompañamiento',
              d: 'Le enseñamos a operar el sistema y quedamos disponibles para dudas.',
            },
          ].map((p, i) => (
            <div key={p.t} className="rounded-marca-lg border border-borde bg-fondo p-6">
              <span className="text-3xl font-bold text-marca-texto">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 text-lg font-bold">{p.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-texto-medio">{p.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Pendiente nota="Fotos de instalaciones propias, tiempos de entrega y montaje, y condiciones de garantía por línea de producto." />
        </div>
      </Seccion>
    </>
  );
}
