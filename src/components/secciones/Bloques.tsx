import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCatalogo } from '../../lib/catalogo';
import { site } from '../../lib/site.config';
import { MEDIA_HERO, imagen, imagenSrcSet } from '../../lib/media';
import Seccion from '../Seccion';
import Pendiente from '../Pendiente';

/**
 * Bloques de la home.
 *
 * Criterio de esta pasada: ninguna sección larga puede ser sólo texto sobre
 * una caja. Donde hay algo que mostrar —una foto, un dato, un producto— se
 * muestra; donde no lo hay, la sección se acorta en vez de rellenarse con
 * párrafos.
 */

// ---------------------------------------------------------------------------
// Banda de garantías
// ---------------------------------------------------------------------------

/**
 * Tarjetas de valor, el patrón central del sitio de referencia: cuatro
 * razones para confiar, cada una con pictograma, titular y una línea. Antes
 * era una franja fina de cuatro palabras; como tarjetas sostienen el peso de
 * lo que se vende sin volverse un muro de texto.
 */
const GARANTIAS = [
  {
    t: 'Asesoría técnica',
    s: 'Criterio antes de vender',
    d: 'Dimensionamos según su consumo real, no según lo que queramos vender.',
    icono: <IconoChat />,
  },
  {
    t: 'Catálogo con respaldo',
    s: 'Equipos certificados',
    d: 'Paneles, baterías e inversores de marcas con norma CE, IEC, UL y RETIE.',
    icono: <IconoEscudo />,
  },
  {
    t: 'Envíos a toda Colombia',
    s: 'Cobertura nacional',
    d: 'Despachamos a cualquier municipio y coordinamos la entrega en obra.',
    icono: <IconoCamion />,
  },
  {
    t: 'Venta e instalación',
    s: 'De principio a fin',
    d: 'No entregamos una caja: montamos el sistema y lo dejamos funcionando.',
    icono: <IconoLlave />,
  },
];

/**
 * Bloque de posicionamiento, centrado y corto.
 *
 * Es la pieza que el sitio de referencia pone justo debajo del hero: un
 * párrafo que dice a qué se dedica la empresa y una frase suelta, en negrita,
 * que resume la promesa. Ordena la entrada antes de que empiece el producto.
 */
export function Intro() {
  return (
    <Seccion espaciado="normal">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-lg leading-relaxed text-texto-medio">
          {site.nombre} comercializa e instala sistemas de energía solar
          fotovoltaica en toda Colombia: paneles, baterías, inversores,
          iluminación y material eléctrico para hogares, fincas, comercios e
          industria.
        </p>
        <p className="mt-7 text-xl font-bold leading-snug sm:text-2xl">
          No entregamos una caja. Acompañamos el proyecto de principio a fin.
        </p>
      </div>
    </Seccion>
  );
}

export function BandaGarantias() {
  return (
    <Seccion>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {GARANTIAS.map((g) => (
          <article
            key={g.t}
            className="rounded-marca-lg border border-borde bg-fondo p-6 shadow-panel"
          >
            <span className="flex size-11 items-center justify-center rounded-marca bg-marca-tenue text-marca-texto">
              {g.icono}
            </span>
            <h3 className="mt-5 font-bold leading-snug">{g.t}</h3>
            <p className="mt-1 text-sm font-semibold text-marca-texto">{g.s}</p>
            <p className="mt-3 text-sm leading-relaxed text-texto-medio">{g.d}</p>
          </article>
        ))}
      </div>
    </Seccion>
  );
}

// ---------------------------------------------------------------------------
// Marcas — se detectan sobre los nombres de producto, así que reflejan lo que
// de verdad hay en inventario y no una lista escrita a mano.
// ---------------------------------------------------------------------------

const MARCAS_CONOCIDAS = [
  'Fox ESS', 'Trina Solar', 'JA Solar', 'Moreday', 'Projoy', 'Sunray',
  'Growatt', 'Deye', 'Huawei', 'Canadian Solar', 'Renesola', 'Victron',
  'EPEVER', 'Jinko',
];

export function Marcas() {
  const { datos } = useCatalogo();

  const marcas = useMemo(() => {
    if (!datos) return [];
    return MARCAS_CONOCIDAS.map((m) => ({
      nombre: m,
      n: datos.productos.filter((p) => p.nombre.toLowerCase().includes(m.toLowerCase())).length,
    }))
      .filter((m) => m.n > 0)
      .sort((a, b) => b.n - a.n);
  }, [datos]);

  if (marcas.length === 0) return null;

  return (
    <Seccion fondo="alt" espaciado="compacto">
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-texto-suave">
          Trabajamos con
        </p>
        {marcas.map((m) => (
          <Link
            key={m.nombre}
            to={`/catalogo?q=${encodeURIComponent(m.nombre)}`}
            className="text-lg font-bold text-texto-suave transition-colors hover:text-marca-texto"
          >
            {m.nombre}
          </Link>
        ))}
      </div>
    </Seccion>
  );
}

// ---------------------------------------------------------------------------
// Banner de asesoría — el bloque amarillo del sitio
// ---------------------------------------------------------------------------

/**
 * Ocupa el lugar que en el sitio de referencia tiene la calculadora solar. Se
 * promete lo que sí podemos cumplir hoy —una asesoría por WhatsApp— en vez de
 * anunciar una calculadora que todavía no existe.
 *
 * Va en amarillo pleno: es el único bloque de la página con ese color, así
 * que corta el scroll sin necesidad de ser grande.
 */
export function BannerAsesoria() {
  return (
    <Seccion espaciado="compacto">
      <div className="overflow-hidden rounded-marca-lg bg-solar">
        <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/60">
              Sin costo y sin compromiso
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-black sm:text-3xl">
              Díganos cuánto paga de luz y le decimos cuánto ahorraría
            </h2>
          </div>

          <a
            href={`https://wa.me/${site.contacto.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-xl shrink-0 bg-zoe-black text-zoe-white hover:bg-zoe-black/85"
          >
            Calcular mi ahorro
          </a>
        </div>
      </div>
    </Seccion>
  );
}

// ---------------------------------------------------------------------------
// Cómo se compra — foto a la izquierda, pasos a la derecha
// ---------------------------------------------------------------------------

const PASOS = [
  { t: 'Nos cuenta qué necesita', d: 'Su consumo y qué quiere alimentar.' },
  { t: 'Dimensionamos el sistema', d: 'Según su consumo real, no según lo que queramos vender.' },
  { t: 'Cotizamos', d: 'Precio con instalación y tiempo de entrega.' },
  { t: 'Instalamos', d: 'Se lo dejamos funcionando y le enseñamos a operarlo.' },
];

export function ComoComprar() {
  return (
    <Seccion>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="overflow-hidden rounded-marca-lg border border-borde">
          <img
            src={imagen(MEDIA_HERO.instalacion, 960)}
            srcSet={imagenSrcSet(MEDIA_HERO.instalacion)}
            sizes="(min-width: 1024px) 45vw, 100vw"
            alt="Instalación de paneles solares sobre una cubierta"
            loading="lazy"
            decoding="async"
            className="aspect-4/3 w-full object-cover"
          />
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-marca-texto">
            Cómo trabajamos
          </p>
          <h2 className="text-2xl font-bold leading-[1.25] tracking-tight sm:text-[1.75rem]">
            De la llamada al sistema andando
          </h2>

          <ol className="mt-8 space-y-6">
            {PASOS.map((p, i) => (
              <li key={p.t} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-marca text-sm font-bold text-marca-contraste">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold leading-tight">{p.t}</h3>
                  <p className="mt-1 text-sm text-texto-medio">{p.d}</p>
                </div>
              </li>
            ))}
          </ol>

          <a
            href={`https://wa.me/${site.contacto.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-solar mt-9"
          >
            Empezar por WhatsApp
          </a>
        </div>
      </div>
    </Seccion>
  );
}

// ---------------------------------------------------------------------------
// Contacto directo
// ---------------------------------------------------------------------------

export function Tienda() {
  const tel = (n: string) => n.replace(/\s/g, '');

  return (
    <Seccion fondo="alt">
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-stretch">
        <div className="rounded-marca-lg border border-borde bg-fondo p-8 sm:p-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-marca-texto">
            Contacto
          </p>
          <h2 className="text-2xl font-bold leading-[1.25] tracking-tight sm:text-[1.75rem]">
            Hablemos
          </h2>
          <p className="mt-3 text-texto-medio">
            Atendemos por WhatsApp y teléfono a todo el país.
          </p>

          <dl className="mt-8 space-y-6">
            <div>
              <dt className="text-xs uppercase tracking-wide text-texto-suave">
                Teléfono y WhatsApp
              </dt>
              <dd className="mt-1 flex flex-wrap items-baseline gap-x-4">
                <a
                  href={`tel:${tel(site.contacto.telefono)}`}
                  className="text-2xl font-bold text-marca-texto"
                >
                  {site.contacto.telefono}
                </a>
                <a
                  href={`tel:${tel(site.contacto.telefonoSecundario)}`}
                  className="font-semibold text-texto-medio hover:text-marca-texto"
                >
                  {site.contacto.telefonoSecundario}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-texto-suave">Correo</dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${site.contacto.email}`}
                  className="break-all font-semibold hover:text-marca-texto"
                >
                  {site.contacto.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-texto-suave">Sede</dt>
              <dd className="mt-1 font-semibold">
                {site.contacto.direccion}
                <span className="block font-normal text-texto-medio">
                  {site.contacto.ciudad}
                </span>
              </dd>
            </div>
          </dl>

          <a
            href={`https://wa.me/${site.contacto.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-solar mt-8 w-full"
          >
            Escribir por WhatsApp
          </a>

          <div className="mt-4">
            <Pendiente nota="Horario de atención y mapa de la sede." />
          </div>
        </div>

        <div className="overflow-hidden rounded-marca-lg border border-borde">
          <img
            src={imagen(MEDIA_HERO.panelesTecho, 960)}
            srcSet={imagenSrcSet(MEDIA_HERO.panelesTecho)}
            sizes="(min-width: 1024px) 45vw, 100vw"
            alt="Paneles solares instalados sobre un techo, con montañas al fondo"
            loading="lazy"
            decoding="async"
            className="size-full min-h-72 object-cover"
          />
        </div>
      </div>
    </Seccion>
  );
}

// --- Pictogramas ------------------------------------------------------------

const trazo = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: 'size-5',
};

function IconoCamion() {
  return (
    <svg {...trazo}>
      <path d="M2 7h11v10H2zM13 10h4l4 3v4h-8" />
      <circle cx="6.5" cy="18.5" r="1.8" />
      <circle cx="17.5" cy="18.5" r="1.8" />
    </svg>
  );
}
function IconoChat() {
  return (
    <svg {...trazo}>
      <path d="M21 12a8 8 0 0 1-11.7 7.1L4 20.5l1.4-5.3A8 8 0 1 1 21 12Z" />
    </svg>
  );
}
function IconoLlave() {
  return (
    <svg {...trazo}>
      <path d="M14.5 6.5a4 4 0 1 0 3.6 5.7L21 15l-2 2-1.5-1.5L16 17l-2-2 1.8-1.8a4 4 0 0 0-1.3-6.7Z" />
      <path d="m3 21 7-7" />
    </svg>
  );
}
function IconoEscudo() {
  return (
    <svg {...trazo}>
      <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3Z" />
      <path d="m9.5 12 1.8 1.8L15 10" />
    </svg>
  );
}
