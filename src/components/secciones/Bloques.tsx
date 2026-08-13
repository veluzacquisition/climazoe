import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCatalogo } from '../../lib/catalogo';
import { site } from '../../lib/site.config';
import Seccion, { TituloSeccion } from '../Seccion';

/**
 * Bloques sueltos de la home. Están juntos acá porque son piezas de
 * presentación cortas; cuando alguno crezca, se saca a su propio archivo.
 *
 * El fondo claro es el default; sólo se declara el tono cuando un bloque se
 * sale de esa base.
 */

// ---------------------------------------------------------------------------
// Banda de garantías — validación social pegada al hero, antes del scroll
// ---------------------------------------------------------------------------

const GARANTIAS = [
  { t: 'Envíos a toda Colombia', d: 'Despachamos a cualquier municipio' },
  { t: 'Asesoría técnica gratis', d: 'Le decimos qué sistema necesita' },
  { t: 'Venta e instalación', d: 'Se lo dejamos funcionando' },
  { t: 'Más de 7 años', d: 'Experiencia en energía solar' },
];

export function BandaGarantias() {
  return (
    <Seccion fondo="alt" espaciado="none" className="border-b border-borde">
      <div className="contenedor grid divide-y divide-borde sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
        {GARANTIAS.map((g) => (
          <div key={g.t} className="flex items-start gap-3 py-6 lg:px-6 lg:first:pl-0">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-marca text-marca-contraste">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="size-4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 5 5L20 7" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-bold">{g.t}</p>
              <p className="mt-0.5 text-xs text-texto-medio">{g.d}</p>
            </div>
          </div>
        ))}
      </div>
    </Seccion>
  );
}

// ---------------------------------------------------------------------------
// Marcas
// ---------------------------------------------------------------------------

/**
 * Las marcas no vienen como campo en el catálogo: se detectan sobre los
 * nombres de producto. Es preferible a escribir la lista a mano, porque así
 * refleja lo que de verdad hay en inventario.
 */
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
      n: datos.productos.filter((p) =>
        p.nombre.toLowerCase().includes(m.toLowerCase()),
      ).length,
    }))
      .filter((m) => m.n > 0)
      .sort((a, b) => b.n - a.n);
  }, [datos]);

  if (marcas.length === 0) return null;

  return (
    <Seccion fondo="alt" espaciado="compacto">
      <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-texto-suave">
        Marcas que manejamos
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        {marcas.map((m) => (
          <Link
            key={m.nombre}
            to={`/catalogo?q=${encodeURIComponent(m.nombre)}`}
            className="rounded-marca border border-borde bg-fondo px-5 py-3 text-sm font-bold text-texto-medio transition-colors hover:border-marca hover:text-marca-texto"
          >
            {m.nombre}
            <span className="ml-2 text-xs font-normal text-texto-suave">{m.n}</span>
          </Link>
        ))}
      </div>
    </Seccion>
  );
}

// ---------------------------------------------------------------------------
// Banner de asesoría
// ---------------------------------------------------------------------------

/**
 * Ocupa el lugar que en el sitio de referencia tiene la calculadora solar.
 * Se promete lo que sí podemos cumplir hoy —una asesoría por WhatsApp— en vez
 * de anunciar una calculadora que todavía no existe.
 */
export function BannerAsesoria() {
  return (
    <Seccion espaciado="compacto">
      <div className="relative overflow-hidden rounded-marca-lg border border-marca-borde bg-superficie">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full opacity-25 blur-[100px]"
          style={{ background: 'var(--marca)' }}
        />
        <div className="relative grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="chip bg-acento text-acento-contraste">Sin costo</span>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
              ¿Cuánto puede <span className="text-marca">ahorrar</span> con energía solar?
            </h2>
            <p className="mt-4 max-w-xl text-lg text-texto-medio">
              Cuéntenos cuánto paga de luz al mes y qué quiere alimentar.
              Le decimos qué sistema le sirve, cuánto cuesta y en cuánto
              tiempo se paga solo.
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
      </div>
    </Seccion>
  );
}

// ---------------------------------------------------------------------------
// Cómo se compra
// ---------------------------------------------------------------------------

export function ComoComprar() {
  const pasos = [
    { t: 'Le asesoramos', d: 'Nos cuenta qué quiere alimentar y le decimos qué sistema le sirve. Sin compromiso.' },
    { t: 'Cotizamos', d: 'Le pasamos precio con instalación incluida si la necesita, y tiempo de entrega.' },
    { t: 'Instalamos', d: 'No solo vendemos el equipo: lo dejamos funcionando en su casa, finca o negocio.' },
  ];

  return (
    <Seccion>
      <TituloSeccion
        titulo="Cómo se compra"
        bajada="Tres pasos, sin letra chica y sin compromiso hasta que usted decida."
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {pasos.map((p, i) => (
          <div
            key={p.t}
            className="rounded-marca-lg border border-borde bg-superficie p-7"
          >
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-marca text-lg font-extrabold text-marca-contraste">
              {i + 1}
            </span>
            <h3 className="mt-5 text-xl font-bold">{p.t}</h3>
            <p className="mt-2 leading-relaxed text-texto-medio">{p.d}</p>
          </div>
        ))}
      </div>
    </Seccion>
  );
}

// ---------------------------------------------------------------------------
// Tienda, blog y galería — estructura lista, contenido pendiente
// ---------------------------------------------------------------------------

function Pendiente({ nota }: { nota: string }) {
  return (
    <div className="rounded-marca-lg border border-dashed border-acento/40 bg-acento-tenue px-6 py-10 text-center">
      <p className="text-sm font-bold text-acento-texto">
        [PENDIENTE: contenido real de Clima Zoe]
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-texto-medio">{nota}</p>
    </div>
  );
}

export function Tienda() {
  return (
    <Seccion fondo="alt">
      <TituloSeccion
        titulo="Dónde estamos"
        bajada="Atendemos por WhatsApp y teléfono a todo el país."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-marca-lg border border-borde bg-superficie p-8">
          <h3 className="text-xl font-bold">{site.nombre}</h3>
          <dl className="mt-6 space-y-5">
            <div>
              <dt className="text-xs uppercase tracking-wide text-texto-suave">Teléfono</dt>
              <dd>
                <a
                  href={`tel:${site.contacto.telefono?.replace(/\s/g, '')}`}
                  className="text-2xl font-extrabold text-marca"
                >
                  {site.contacto.telefono}
                </a>
              </dd>
            </div>
          </dl>
          <a
            href={`https://wa.me/${site.contacto.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-urgente mt-6 w-full"
          >
            Escribir por WhatsApp
          </a>
          <div className="mt-6">
            <Pendiente nota="Dirección, correo y horario de atención." />
          </div>
        </div>

        <div className="flex min-h-72 items-center justify-center rounded-marca-lg border border-dashed border-borde bg-superficie px-6 text-center text-sm text-texto-suave">
          [PENDIENTE: mapa de la ubicación de Clima Zoe]
        </div>
      </div>
    </Seccion>
  );
}

export function BlogYGaleria() {
  return (
    <Seccion fondo="alt">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Del blog</h2>
          <p className="mt-2 text-texto-medio">
            Guías para entender qué sistema le conviene.
          </p>
          <div className="mt-6">
            <Pendiente nota="Artículos propios: cómo dimensionar un sistema, litio vs. gel, cuánto se ahorra." />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Galería de proyectos</h2>
          <p className="mt-2 text-texto-medio">
            Instalaciones hechas por Clima Zoe.
          </p>
          <div className="mt-6">
            <Pendiente nota="Fotos propias de instalaciones y del equipo trabajando." />
          </div>
        </div>
      </div>
    </Seccion>
  );
}
