import { Link } from 'react-router-dom';
import Seccion, { TituloSeccion } from '../components/Seccion';
import {
  ANIO_CONSTITUCION,
  ANIO_INICIO_COMERCIAL,
  aniosDeTrayectoria,
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
  const anios = aniosDeTrayectoria();

  return (
    <>
      {/* --- Encabezado --------------------------------------------------- */}
      <Seccion espaciado="amplio">
        <div className="max-w-3xl">
          <p className="chip border border-marca-borde bg-marca-tenue text-marca-texto">
            Desde {ANIO_INICIO_COMERCIAL}
          </p>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Zoe quiere decir <span className="text-marca-texto">vida</span>
          </h1>
          <p className="mt-7 text-xl leading-relaxed text-texto-medio">
            {identidad.origenNombre}
          </p>
        </div>
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

          <div className="rounded-marca-lg border border-borde bg-fondo p-8">
            <h3 className="text-sm font-bold uppercase tracking-wide text-texto-suave">
              La empresa
            </h3>
            <dl className="mt-6 space-y-5 text-sm">
              {[
                ['Razón social', site.razonSocial],
                ['NIT', site.nit],
                ['Constituida', `${ANIO_CONSTITUCION}, Cámara de Comercio de Bogotá`],
                ['Actividad comercial', `Desde junio de ${ANIO_INICIO_COMERCIAL}`],
                ['Sede', `${site.contacto.direccion} — ${site.contacto.ciudad}`],
              ].map(([k, v]) => (
                <div key={k} className="border-b border-borde-suave pb-4 last:border-0 last:pb-0">
                  <dt className="text-xs uppercase tracking-wide text-texto-suave">{k}</dt>
                  <dd className="mt-1 font-semibold text-texto">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm leading-relaxed text-texto-medio">
              La marca <strong className="text-texto">Clima Zoe®</strong> está
              registrada. Iniciamos actividad tras participar en talleres de
              capacitación en proyectos fotovoltaicos, eólicos y de energías
              limpias con impacto social.
            </p>
          </div>
        </div>
      </Seccion>

      {/* --- Misión y visión ------------------------------------------------ */}
      <Seccion>
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-marca-lg border border-borde bg-superficie p-8 sm:p-10">
            <h2 className="text-2xl font-extrabold tracking-tight">Misión</h2>
            <p className="mt-5 text-lg leading-relaxed text-texto-medio">
              {identidad.mision}
            </p>
          </article>

          <article className="rounded-marca-lg border border-marca-borde bg-marca-tenue p-8 sm:p-10">
            <h2 className="text-2xl font-extrabold tracking-tight">Visión</h2>
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
            <p className="text-7xl font-extrabold tracking-tight text-marca sm:text-8xl">
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
            <div className="mt-8 rounded-marca border border-dashed border-acento/40 bg-acento-tenue px-4 py-3">
              <p className="text-sm font-bold text-acento-texto">
                [PENDIENTE: contenido real de Clima Zoe]
              </p>
              <p className="mt-1 text-sm text-texto-medio">
                Número de proyectos instalados, kWp en operación, clientes
                atendidos y fotos del equipo trabajando.
              </p>
            </div>
          </div>
        </div>
      </Seccion>

      {/* --- Frases ---------------------------------------------------------- */}
      <Seccion fondo="alt">
        <TituloSeccion
          titulo="Lo que nos mueve"
          bajada="Frases que acompañan a la marca desde el principio."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
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
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
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
