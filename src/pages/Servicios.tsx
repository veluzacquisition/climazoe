import { Link } from 'react-router-dom';
import Seccion, { TituloSeccion } from '../components/Seccion';
import EncabezadoPagina from '../components/EncabezadoPagina';
import Pendiente from '../components/Pendiente';
import { certificacionesDeProducto, lineasDeProducto, servicios, site } from '../lib/site.config';
import Revelar from '../components/Revelar';
import BotonAgendar from '../components/BotonAgendar';

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
      <Seccion
        resplandores={
          <>
            <span className="resplandor resplandor-apoyo -left-32 top-10 size-96" />
            <span className="resplandor resplandor-marca -right-24 bottom-0 size-80" />
          </>
        }
      >
        <TituloSeccion
          etiqueta="Servicios"
          titulo="Qué hacemos"
          bajada="No solo vendemos el equipo: lo dimensionamos, lo montamos y lo mantenemos funcionando."
        />
        <Revelar className="mt-12 grid gap-5 sm:grid-cols-2" paso={100}>
          {servicios.map((s, i) => (
            <article
              key={s.titulo}
              className="acento-tarjeta group relative h-full overflow-hidden rounded-marca-lg border border-borde bg-fondo p-7 shadow-panel transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:sombra-flotante motion-reduce:transform-none sm:p-8"
            >
              <div className="flex items-start gap-5">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-marca bg-apoyo-tenue text-apoyo-texto transition-all duration-300 group-hover:bg-apoyo group-hover:text-zoe-white motion-reduce:transition-none">
                  <IconoServicio nombre={s.icono} />
                </span>
                <div className="min-w-0">
                  <p
                    aria-hidden="true"
                    className="text-xs font-bold tabular-nums tracking-widest text-texto-suave"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-1 text-xl font-bold leading-snug transition-colors group-hover:text-apoyo-texto">
                    {s.titulo}
                  </h3>
                  <p className="mt-2.5 leading-relaxed text-texto-medio">{s.detalle}</p>
                </div>
              </div>
            </article>
          ))}
        </Revelar>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={`https://wa.me/${site.contacto.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-solar"
          >
            Pedir una visita técnica
          </a>
          <BotonAgendar />
        </div>
      </Seccion>

      {/* --- Líneas de producto -------------------------------------------- */}
      <Seccion fondo="degradado">
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
              className="group relative flex h-full flex-col overflow-hidden rounded-marca-lg border border-borde bg-fondo p-7 shadow-panel transition-all duration-300 hover:-translate-y-1.5 hover:border-marca hover:sombra-flotante motion-reduce:transform-none"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-marca text-sm font-bold text-marca-contraste transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none">
                {i + 1}
              </span>
              <h3 className="mt-5 text-xl font-bold leading-snug transition-colors group-hover:text-marca-texto">
                {l.titulo}
              </h3>
              <p className="mt-2 flex-1 leading-relaxed text-texto-medio">{l.detalle}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-marca-texto">
                Ver productos
                <span
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </Revelar>
      </Seccion>

      {/* --- Ahorro ---------------------------------------------------------- */}
      <Seccion>
        {/* En azul de marca y no en verde tenue: es el bloque que corta la
            página por la mitad y necesitaba peso. El verde tenue lo dejaba a
            la misma altura visual que las tarjetas de arriba. */}
        <div className="tono-oscuro relative isolate grid items-center gap-10 overflow-hidden rounded-marca-lg bg-fondo p-8 sombra-elevada sm:p-12 lg:grid-cols-[1fr_auto]">
          <div
            aria-hidden="true"
            className="malla-puntos pointer-events-none absolute inset-0 -z-10 text-white/10"
          />
          <span
            aria-hidden="true"
            className="resplandor resplandor-solar -right-10 -top-16 -z-10 size-72"
          />
          <div>
            <span className="chip bg-solar text-solar-contraste">Ahorre</span>
            <h2 className="mt-5 text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[2.125rem]">
              Más de un <span className="text-marca">50% en consumo</span>,
              más beneficios tributarios
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-texto-medio">
              La energía solar no solo baja el recibo: en Colombia los sistemas
              de generación con fuentes no convencionales tienen incentivos
              tributarios. Le explicamos cuáles aplican a su caso.
            </p>
          </div>
          <Link to="/calculadora" className="btn btn-xl btn-solar group shrink-0">
            Calcular mi ahorro
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            >
              →
            </span>
          </Link>
        </div>
      </Seccion>

      {/* --- Certificaciones --------------------------------------------------
          Rotuladas como certificación de los EQUIPOS, no de Clima Zoe:
          presentarlas como propias sería atribuirse algo que no se tiene. */}
      <Seccion fondo="degradado" espaciado="compacto">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-texto-suave">
          Los equipos que comercializamos cumplen
        </p>
        <Revelar className="mt-8 flex flex-wrap items-stretch justify-center gap-3" paso={70}>
          {certificacionesDeProducto.map((c) => (
            <div
              key={c.sigla}
              className="min-w-[9rem] rounded-marca-lg border border-borde bg-fondo px-6 py-4 text-center shadow-panel transition-all duration-300 hover:-translate-y-1 hover:border-marca hover:sombra-flotante motion-reduce:transform-none"
            >
              <p className="text-xl font-bold text-marca-texto">{c.sigla}</p>
              <p className="mt-1 text-xs leading-snug text-texto-medio">{c.detalle}</p>
            </div>
          ))}
        </Revelar>
      </Seccion>

      {/* --- Cómo trabajamos -------------------------------------------------- */}
      <Seccion fondo="alt">
        <TituloSeccion
          titulo="Cómo trabajamos"
          bajada="Capacitamos y orientamos antes de vender. Es parte de la misión, no un extra."
        />
        <Revelar
          className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          paso={100}
        >
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
            <div
              key={p.t}
              className="group relative h-full overflow-hidden rounded-marca-lg border border-borde bg-fondo p-6 shadow-panel transition-all duration-300 hover:-translate-y-1.5 hover:border-marca hover:sombra-flotante motion-reduce:transform-none"
            >
              {/* La cifra a media opacidad y grande hace de marca de agua:
                  ordena la secuencia sin robarle jerarquía al titular. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-1 -top-3 text-6xl font-bold tabular-nums text-superficie-alta transition-colors duration-300 group-hover:text-marca-tenue"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="relative text-sm font-bold tabular-nums tracking-widest text-marca-texto">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="relative mt-4 text-lg font-bold leading-snug">{p.t}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-texto-medio">{p.d}</p>
            </div>
          ))}
        </Revelar>

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
