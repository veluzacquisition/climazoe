import { Link } from 'react-router-dom';
import Seccion, { TituloSeccion } from '../components/Seccion';
import EncabezadoPagina from '../components/EncabezadoPagina';
import Pendiente from '../components/Pendiente';
import { certificacionesDeProducto, lineasDeProducto, servicios, site } from '../lib/site.config';
import Revelar from '../components/Revelar';

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
      <EncabezadoPagina
        etiqueta="Productos y servicios"
        titulo={<>Energías renovables, <span className="text-marca">de la asesoría al montaje</span></>}
        bajada="Comercializamos e instalamos sistemas de energía limpia para hogares, fincas, comercios e industria."
        migas={[{ texto: 'Inicio', a: '/' }, { texto: 'Servicios' }]}
      >
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={`https://wa.me/${site.contacto.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-xl btn-solar"
          >
            Pedir asesoría gratis
          </a>
          <Link
            to="/catalogo"
            className="btn btn-xl border border-white/30 text-white hover:border-white hover:bg-white/10"
          >
            Ver catálogo
          </Link>
        </div>
      </EncabezadoPagina>

      {/* --- Servicios ------------------------------------------------------
          Va PRIMERO, antes de las líneas de producto: la página se llamaba
          "Servicios" y sólo listaba mercancía. Instalar, mantener y limpiar
          es la mitad del negocio y no aparecía por ningún lado. */}
      <Seccion>
        <TituloSeccion
          etiqueta="Servicios"
          titulo="Qué hacemos"
          bajada="No solo vendemos el equipo: lo dimensionamos, lo montamos y lo mantenemos funcionando."
        />
        <Revelar className="mt-10 grid gap-5 sm:grid-cols-2">
          {servicios.map((s) => (
            <article
              key={s.titulo}
              className="group flex h-full gap-5 rounded-marca-lg border border-borde bg-fondo p-7 transition-all duration-300 hover:-translate-y-1 hover:border-apoyo hover:shadow-panel motion-reduce:transform-none"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-marca bg-apoyo-tenue text-apoyo">
                <IconoServicio nombre={s.icono} />
              </span>
              <div>
                <h3 className="text-lg font-bold leading-snug transition-colors group-hover:text-apoyo">
                  {s.titulo}
                </h3>
                <p className="mt-2 leading-relaxed text-texto-medio">{s.detalle}</p>
              </div>
            </article>
          ))}
        </Revelar>

        <div className="mt-8 text-center">
          <a
            href={`https://wa.me/${site.contacto.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-solar"
          >
            Pedir una visita técnica
          </a>
        </div>
      </Seccion>

      {/* --- Líneas de producto -------------------------------------------- */}
      <Seccion fondo="alt">
        <TituloSeccion
          etiqueta="Catálogo"
          titulo="Qué comercializamos"
          bajada="Cinco líneas de producto, todas con asesoría técnica incluida."
        />
        <Revelar className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lineasDeProducto.map((l, i) => (
            <Link
              key={l.titulo}
              to={`/catalogo?categoria=${l.categoria}`}
              className="group flex h-full flex-col rounded-marca-lg border border-borde bg-fondo p-7 transition-colors hover:border-marca"
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
        </Revelar>
      </Seccion>

      {/* --- Ahorro ---------------------------------------------------------- */}
      <Seccion>
        <div className="grid items-center gap-10 rounded-marca-lg border border-marca-borde bg-marca-tenue p-8 sm:p-12 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="chip bg-acento text-acento-contraste">Ahorre</span>
            <h2 className="mt-5 text-2xl font-bold leading-[1.25] tracking-tight sm:text-[1.75rem]">
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

/** Iconos de línea de los servicios. Trazo, no relleno: pesan menos visualmente. */
function IconoServicio({ nombre }: { nombre: string }) {
  const trazos: Record<string, React.ReactNode> = {
    // Panel sobre techo
    planta: <path d="M3 20h18M5 20V9l7-4 7 4v11M9 20v-5h6v5M4.5 9.5h15" />,
    // Llave de ajuste
    mantenimiento: (
      <path d="M14.7 6.3a4 4 0 0 0 5 5l-8.1 8.1a2.5 2.5 0 0 1-3.6-3.6l8.1-8.1a4 4 0 0 0-1.4-1.4Z" />
    ),
    // Gota y brillo
    limpieza: (
      <>
        <path d="M12 3.5S6.5 9.8 6.5 13.5a5.5 5.5 0 0 0 11 0C17.5 9.8 12 3.5 12 3.5Z" />
        <path d="M9.8 14.5a2.2 2.2 0 0 0 2.2 2.2" />
      </>
    ),
    // Bombillo
    asesoria: (
      <>
        <path d="M9.5 18h5M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5.9 1.2.9 2h5.2c0-.8.3-1.5.9-2A6 6 0 0 0 12 3Z" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-6"
    >
      {trazos[nombre] ?? trazos.asesoria}
    </svg>
  );
}
