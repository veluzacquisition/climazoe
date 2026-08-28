import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCatalogo } from '../../lib/catalogo';
import { ANIO_INICIO_COMERCIAL, aniosDeTrayectoria, site } from '../../lib/site.config';
import { MEDIA_HERO, imagen, imagenSrcSet } from '../../lib/media';
import Seccion from '../Seccion';
import Pendiente from '../Pendiente';
import Revelar from '../Revelar';
import BotonAgendar from '../BotonAgendar';

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
/**
 * Cada tarjeta lleva su propio color de la paleta.
 *
 * Cuatro cajas idénticas en gris se leen como una lista; cuatro colores
 * distintos se leen como cuatro razones. Se usan los cuatro que ya tiene la
 * marca —azul, verde, ámbar y coral— así que no entra ningún color nuevo.
 *
 * Ojo con la separación relleno/texto: el amarillo vivo como letra da 1.4:1
 * y es ilegible, por eso cada color tiene su token `-texto` verificado. Los
 * cuatro pasan 4.5:1 sobre las tres superficies del sitio.
 */
const GARANTIAS = [
  {
    t: 'Asesoría técnica',
    s: 'Criterio antes de vender',
    d: 'Dimensionamos según su consumo real, no según lo que queramos vender.',
    icono: <IconoChat />,
    color: {
      texto: 'text-apoyo-texto',
      fondo: 'bg-apoyo-tenue',
      borde: 'group-hover:border-apoyo',
      relleno: 'group-hover:bg-apoyo group-hover:text-zoe-white',
      barra: 'from-apoyo to-apoyo-fuerte',
    },
  },
  {
    t: 'Catálogo con respaldo',
    s: 'Equipos certificados',
    d: 'Paneles, baterías e inversores de marcas con norma CE, IEC, UL y RETIE.',
    icono: <IconoEscudo />,
    color: {
      texto: 'text-marca-texto',
      fondo: 'bg-marca-tenue',
      borde: 'group-hover:border-marca',
      relleno: 'group-hover:bg-marca group-hover:text-marca-contraste',
      barra: 'from-marca to-marca-fuerte',
    },
  },
  {
    t: 'Envíos a toda Colombia',
    s: 'Cobertura nacional',
    d: 'Despachamos a cualquier municipio y coordinamos la entrega en obra.',
    icono: <IconoCamion />,
    color: {
      texto: 'text-solar-texto',
      fondo: 'bg-solar-tenue',
      borde: 'group-hover:border-solar',
      relleno: 'group-hover:bg-solar group-hover:text-solar-contraste',
      barra: 'from-solar to-solar-fuerte',
    },
  },
  {
    t: 'Venta e instalación',
    s: 'De principio a fin',
    d: 'No entregamos una caja: montamos el sistema y lo dejamos funcionando.',
    icono: <IconoLlave />,
    color: {
      texto: 'text-acento-texto',
      fondo: 'bg-acento-tenue',
      borde: 'group-hover:border-acento',
      relleno: 'group-hover:bg-acento group-hover:text-zoe-white',
      barra: 'from-acento to-acento-fuerte',
    },
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
    <Seccion
      espaciado="normal"
      resplandores={
        <>
          <span className="resplandor resplandor-marca -left-24 top-0 size-72" />
          <span className="resplandor resplandor-apoyo -right-20 bottom-0 size-80" />
        </>
      }
    >
      <Revelar className="mx-auto max-w-3xl text-center" paso={130}>
        <p className="text-lg leading-relaxed text-texto-medio sm:text-xl">
          {site.nombre} comercializa e instala sistemas de energía solar
          fotovoltaica en toda Colombia: paneles, baterías, inversores,
          iluminación y material eléctrico para hogares, fincas, comercios e
          industria.
        </p>
        <p className="mt-8 text-2xl font-bold leading-[1.25] tracking-[-0.02em] sm:text-[1.75rem]">
          No entregamos una caja.{' '}
          <span className="text-marca-texto">
            Acompañamos el proyecto de principio a fin.
          </span>
        </p>
      </Revelar>
    </Seccion>
  );
}

export function BandaGarantias() {
  return (
    <Seccion
      resplandores={
        <>
          <span className="resplandor resplandor-apoyo -left-28 top-0 size-96" />
          <span className="resplandor resplandor-solar -right-20 bottom-4 size-72" />
        </>
      }
    >
      <Revelar className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" paso={90}>
        {GARANTIAS.map((g, i) => (
          <article
            key={g.t}
            className={`group relative h-full overflow-hidden rounded-marca-lg border border-borde bg-fondo p-6 shadow-panel transition-all duration-300 hover:-translate-y-1.5 hover:sombra-flotante motion-reduce:transform-none ${g.color.borde}`}
          >
            {/* Barra de color arriba: crece desde la izquierda al pasar el
                mouse. Es lo que convierte un rectángulo con borde en una
                tarjeta que responde, y no cuesta nada. */}
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-linear-to-r transition-transform duration-500 group-hover:scale-x-100 motion-reduce:transition-none ${g.color.barra}`}
            />

            <div className="flex items-start justify-between">
              <span
                className={`flex size-12 items-center justify-center rounded-marca transition-all duration-300 motion-reduce:transition-none ${g.color.fondo} ${g.color.texto} ${g.color.relleno}`}
              >
                {g.icono}
              </span>
              {/* El número no ordena una secuencia —no hay pasos acá— sino que
                  da ritmo a la fila y ancla la esquina que si no queda vacía. */}
              <span
                aria-hidden="true"
                className={`text-2xl font-bold tabular-nums text-borde transition-colors duration-300 ${g.color.texto.replace('text-', 'group-hover:text-')}`}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <h3 className="mt-6 text-lg font-bold leading-snug">{g.t}</h3>
            <p className={`mt-1 text-sm font-semibold ${g.color.texto}`}>{g.s}</p>
            <p className="mt-3 text-sm leading-relaxed text-texto-medio">{g.d}</p>
          </article>
        ))}
      </Revelar>
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
    // Dos formas de detectar marca, porque los dos proveedores la entregan
    // distinto: Fibra Andina la trae en un campo propio y Solphower sólo la
    // mete dentro del nombre del producto. Sin lo primero, marcas con decenas
    // de equipos —Must Solar, Deye, Hoymiles— no salían en la franja.
    const cuenta = new Map<string, number>();
    for (const p of datos.productos) {
      if (p.marca) {
        cuenta.set(p.marca, (cuenta.get(p.marca) ?? 0) + 1);
        continue;
      }
      const encontrada = MARCAS_CONOCIDAS.find((m) =>
        p.nombre.toLowerCase().includes(m.toLowerCase()),
      );
      if (encontrada) cuenta.set(encontrada, (cuenta.get(encontrada) ?? 0) + 1);
    }
    return [...cuenta].map(([nombre, n]) => ({ nombre, n })).sort((a, b) => b.n - a.n);
  }, [datos]);

  if (marcas.length === 0) return null;

  return (
    <Seccion fondo="degradado" espaciado="compacto">
      <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-texto-suave">
        Trabajamos con {marcas.length} marcas
      </p>
      {/* Fichas en vez de una lista de palabras sueltas. Cada una lleva
          cuántos productos hay de esa marca: convierte un adorno en un dato
          y en un atajo de búsqueda. */}
      <Revelar className="mt-7 flex flex-wrap items-center justify-center gap-2.5" paso={35}>
        {marcas.map((m) => (
          <Link
            key={m.nombre}
            to={`/catalogo?q=${encodeURIComponent(m.nombre)}`}
            className="group inline-flex items-center gap-2 rounded-marca-pildora border border-borde bg-fondo px-4 py-2 text-sm font-bold text-texto-medio shadow-panel transition-all duration-200 hover:-translate-y-0.5 hover:border-apoyo hover:text-apoyo-texto hover:sombra-flotante motion-reduce:transform-none"
          >
            {m.nombre}
            <span className="rounded-marca-pildora bg-superficie-alta px-1.5 py-0.5 text-[11px] tabular-nums text-texto-suave transition-colors group-hover:bg-apoyo-tenue group-hover:text-apoyo-texto">
              {m.n}
            </span>
          </Link>
        ))}
      </Revelar>
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
      <div className="relative isolate overflow-hidden rounded-marca-lg bg-solar">
        {/* Textura de puntos en negro translúcido: sobre amarillo pleno un
            resplandor no se vería, y un color plano de este tamaño pide algo
            que lo rompa. */}
        <div
          aria-hidden="true"
          className="malla-puntos pointer-events-none absolute inset-0 -z-10 text-black/10"
        />
        <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/60">
              Sin costo y sin compromiso
            </p>
            <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-[1.2] tracking-[-0.02em] text-black sm:text-[2rem]">
              Díganos cuánto paga de luz y le decimos cuánto ahorraría
            </h2>
          </div>

          <Link
            to="/calculadora"
            className="btn btn-xl group shrink-0 bg-zoe-black text-zoe-white transition-transform hover:bg-zoe-black/85 hover:scale-[1.03] motion-reduce:transform-none"
          >
            Calcular mi ahorro
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            >
              →
            </span>
          </Link>
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
        <div className="relative">
          <div className="overflow-hidden rounded-marca-lg border border-borde sombra-elevada">
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

          {/* Ficha flotante sobre la esquina de la foto. Es lo que rompe el
              rectángulo y da la sensación de capas; el dato sale de
              site.config, no está escrito a mano. */}
          <div className="absolute -bottom-6 -right-4 hidden rounded-marca-lg border border-borde bg-fondo p-5 sombra-elevada sm:block lg:-right-8">
            <p className="text-3xl font-bold tracking-tight text-apoyo-texto">
              {aniosDeTrayectoria(ANIO_INICIO_COMERCIAL)} años
            </p>
            <p className="mt-1 max-w-[9rem] text-xs leading-snug text-texto-medio">
              instalando energía solar en Colombia
            </p>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-marca-texto">
            Cómo trabajamos
          </p>
          <h2 className="text-2xl font-bold leading-[1.25] tracking-tight sm:text-[1.75rem]">
            De la llamada al sistema andando
          </h2>

          {/* Un hilo une los círculos: sin él son cuatro viñetas sueltas;
              con él se leen como un recorrido, que es lo que son. */}
          <Revelar
            como="ul"
            className="relative mt-8 space-y-7 before:absolute before:bottom-8 before:left-[1.0625rem] before:top-8 before:w-px before:bg-borde before:content-['']"
            paso={110}
          >
            {PASOS.map((p, i) => (
              <li key={p.t} className="relative flex gap-4">
                <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-marca text-sm font-bold text-marca-contraste ring-4 ring-[var(--fondo)]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold leading-tight">{p.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-texto-medio">{p.d}</p>
                </div>
              </li>
            ))}
          </Revelar>

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
    <Seccion fondo="degradado">
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

          <div className="mt-3">
            <BotonAgendar className="btn btn-contorno w-full" texto="O agendar una llamada" />
          </div>

          <div className="mt-4">
            <Pendiente nota="Horario de atención y mapa de la sede." />
          </div>
        </div>

        <div className="overflow-hidden rounded-marca-lg border border-borde sombra-elevada">
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
