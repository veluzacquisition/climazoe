import { Link } from 'react-router-dom';
import Seccion, { TituloSeccion } from '../components/Seccion';
import EncabezadoPagina from '../components/EncabezadoPagina';
import Pendiente from '../components/Pendiente';
import Revelar from '../components/Revelar';
import {
  ANIO_CONSTITUCION,
  ANIO_INICIO_COMERCIAL,
  aniosDeTrayectoria,
  consignas,
  frases,
  identidad,
  site,
} from '../lib/site.config';

/**
 * Quiénes somos.
 *
 * Todo el texto sale del documento de marca de la empresa; la misión y la
 * visión van textuales porque son las que Clima Zoe ya usa. Lo único que
 * falta son las fotos propias.
 */
export default function Nosotros() {
  const anios = aniosDeTrayectoria(ANIO_INICIO_COMERCIAL);

  return (
    <>
      <EncabezadoPagina
        etiqueta={`Desde ${ANIO_INICIO_COMERCIAL}`}
        titulo={<>Zoe quiere decir <span className="text-marca">vida</span></>}
        bajada={identidad.origenNombre}
        migas={[{ texto: 'Inicio', a: '/' }, { texto: 'Nosotros' }]}
        fondo="instalacion"
      />

      {/* --- Soplo de vida ---------------------------------------------------
          Es el fragmento más humano del documento de marca y estaba metido en
          una cita lateral como si fuera un pie de página. De acá salió el
          nombre de la empresa; se le da el peso que tiene y no se reescribe:
          dicho así es lo que separa una historia real de un texto de relleno. */}
      <Seccion tono="oscuro" espaciado="amplio">
        <Revelar className="mx-auto max-w-4xl text-center" paso={140}>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-texto-suave">
            El origen del nombre
          </p>
          <blockquote className="mt-8">
            <p className="text-2xl font-semibold leading-[1.35] tracking-tight sm:text-4xl">
              {identidad.origenPersonalIntro}{' '}
              <span className="text-marca">
                «{identidad.origenPersonalRemate}»
              </span>
              .
            </p>
          </blockquote>
          <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-texto-medio">
            De ahí salió el nombre. <strong className="text-texto">Zoe es
            soplo de vida</strong> — y es lo que buscamos dejar en cada
            instalación: una casa, una finca o un negocio que vuelve a
            respirar con su propia energía.
          </p>
        </Revelar>
      </Seccion>

      {/* --- Origen de la marca -------------------------------------------- */}
      <Seccion fondo="alt">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <TituloSeccion titulo="Por qué existimos" />
            <p className="mt-6 text-lg leading-relaxed text-texto-medio">
              {identidad.origenMarca}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-texto-medio">
              Por esa razón Clima Zoe trabaja para crear conciencia ecológica
              comercializando productos y servicios que ayuden a{' '}
              <strong className="text-texto">mitigar</strong> el cambio
              climático —reducir las emisiones de gases de efecto invernadero—
              y a <strong className="text-texto">adaptarnos</strong> a los
              cambios que ya no podemos evitar.
            </p>
          </div>

          {/* Sin ficha de la sociedad: razón social, NIT y matrícula
              mercantil son datos de trámite, no razones para confiar en una
              empresa de energía solar. Lo que sí importa —desde cuándo
              trabajamos y desde dónde— queda dicho en prosa. */}
          <div className="rounded-marca-lg border border-apoyo/25 bg-apoyo-tenue p-8 sm:p-10">
            <p className="text-5xl font-bold tracking-tight text-apoyo-texto">
              {aniosDeTrayectoria()} años
            </p>
            <p className="mt-3 text-lg font-semibold">construyendo Clima Zoe</p>
            <p className="mt-5 leading-relaxed text-texto-medio">
              La sociedad se constituyó en marzo de {ANIO_CONSTITUCION}, después
              de participar en talleres de capacitación en proyectos
              fotovoltaicos, eólicos y de energías limpias con impacto social.
              Desde junio de {ANIO_INICIO_COMERCIAL} vendemos e instalamos
              energía solar, y desde entonces trabajamos desde{' '}
              {site.contacto.ciudad}.
            </p>
            <p className="mt-5 leading-relaxed text-texto-medio">
              La marca <strong className="text-texto">Clima Zoe®</strong> está
              registrada.
            </p>
          </div>
        </div>
      </Seccion>

      {/* --- Misión y visión ------------------------------------------------ */}
      <Seccion>
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="acento-tarjeta group relative overflow-hidden rounded-marca-lg border border-borde bg-superficie p-8 shadow-panel transition-all duration-300 hover:-translate-y-1 hover:sombra-flotante motion-reduce:transform-none sm:p-10">
            <h2 className="text-xl font-bold tracking-tight">Misión</h2>
            <p className="mt-5 text-lg leading-relaxed text-texto-medio">
              {identidad.mision}
            </p>
          </article>

          <article className="rounded-marca-lg border border-marca-borde bg-marca-tenue p-8 sm:p-10">
            <h2 className="text-xl font-bold tracking-tight">Visión</h2>
            <p className="mt-5 text-lg leading-relaxed text-texto-medio">
              {identidad.vision}
            </p>
            <p className="mt-6 border-l-4 border-marca pl-4 text-lg font-bold italic text-marca-texto">
              «{site.eslogan}»
            </p>
          </article>
        </div>
      </Seccion>

      {/* --- Cifra de trayectoria ------------------------------------------- */}
      <Seccion tono="oscuro">
        <div className="grid items-center gap-10 lg:grid-cols-[auto_1fr]">
          <div className="text-center lg:text-left">
            <p className="text-7xl font-bold tracking-tight text-marca sm:text-8xl">
              {anios}
            </p>
            <p className="mt-2 text-sm uppercase tracking-wide text-texto-medio">
              años vendiendo energía solar
            </p>
          </div>
          <div>
            <p className="text-xl leading-relaxed text-texto-medio">
              Desde {ANIO_INICIO_COMERCIAL} dirigimos nuestras operaciones al
              sector comercial público y privado, buscando generar acciones con
              pensamiento crítico y conciencia sobre la reducción de emisiones.
            </p>
            <div className="mt-8">
              <Pendiente nota="Número de proyectos instalados, kWp en operación, clientes atendidos y fotos del equipo trabajando." />
            </div>
          </div>
        </div>
      </Seccion>

      {/* --- Frases ---------------------------------------------------------- */}
      <Seccion fondo="alt">
        <TituloSeccion
          titulo="Lo que nos mueve"
          bajada="Consignas propias y frases que acompañan a la marca desde el principio."
        />

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {consignas.map((c) => (
            <p
              key={c}
              className="rounded-marca-lg border-l-4 border-marca bg-fondo p-6 text-lg font-semibold leading-relaxed ring-1 ring-borde"
            >
              {c}
            </p>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {frases.map((f) => (
            <blockquote
              key={f.texto}
              className="rounded-marca-lg border border-borde bg-fondo p-7"
            >
              <p className="text-lg leading-relaxed text-texto-medio">«{f.texto}»</p>
              {f.autor && (
                <footer className="mt-4 text-sm font-bold text-marca-texto">
                  — {f.autor}
                </footer>
              )}
            </blockquote>
          ))}
        </div>
      </Seccion>

      {/* --- Cierre ---------------------------------------------------------- */}
      <Seccion espaciado="amplio">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold leading-[1.25] tracking-tight sm:text-[1.75rem]">
            ¿Damos el paso <span className="text-marca-texto">juntos</span>?
          </h2>
          <p className="mt-5 text-lg text-texto-medio">
            Cuéntenos qué quiere alimentar con energía solar y le armamos el
            sistema a la medida.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={`https://wa.me/${site.contacto.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-xl btn-primario"
            >
              Hablar con un asesor
            </a>
            <Link to="/catalogo" className="btn btn-xl btn-contorno">
              Ver el catálogo
            </Link>
          </div>
        </div>
      </Seccion>
    </>
  );
}
