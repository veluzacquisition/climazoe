import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCatalogo } from '../../lib/catalogo';
import { site } from '../../lib/site.config';

/**
 * Bloques sueltos de la home. Están juntos acá porque son piezas de
 * presentación cortas; cuando alguno crezca, se saca a su propio archivo.
 */

// ---------------------------------------------------------------------------
// Banda de garantías, debajo del hero
// ---------------------------------------------------------------------------

const GARANTIAS = [
  { t: 'Envíos a toda Colombia', d: 'Despachamos a cualquier municipio' },
  { t: 'Asesoría técnica gratis', d: 'Le decimos qué sistema necesita' },
  { t: 'Venta e instalación', d: 'Se lo dejamos funcionando' },
  { t: 'Más de 7 años', d: 'Experiencia en energía solar' },
];

export function BandaGarantias() {
  return (
    <section className="border-b border-borde-suave bg-superficie">
      <div className="contenedor grid gap-px py-0 sm:grid-cols-2 lg:grid-cols-4">
        {GARANTIAS.map((g) => (
          <div key={g.t} className="flex items-start gap-3 py-6 lg:px-5">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-marca-tenue text-marca">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="size-4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 5 5L20 7" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold">{g.t}</p>
              <p className="mt-0.5 text-xs text-texto-medio">{g.d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
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
    <section className="contenedor py-12">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-texto-suave">
        Marcas que manejamos
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {marcas.map((m) => (
          <Link
            key={m.nombre}
            to={`/catalogo?q=${encodeURIComponent(m.nombre)}`}
            className="rounded-marca border border-borde-suave bg-superficie px-5 py-3 text-sm font-semibold text-texto-medio transition-colors hover:border-marca-borde hover:text-marca"
          >
            {m.nombre}
            <span className="ml-2 text-xs font-normal text-texto-suave">{m.n}</span>
          </Link>
        ))}
      </div>
    </section>
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
    <section className="contenedor py-10">
      <div className="relative overflow-hidden rounded-marca-lg border border-marca-borde bg-superficie">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full opacity-25 blur-[90px]"
          style={{ background: 'var(--marca)' }}
        />
        <div className="relative grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="inline-flex rounded-full bg-acento px-3 py-1 text-xs font-bold uppercase tracking-wider text-acento-contraste">
              Gratis
            </span>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
              ¿Cuánto puede <span className="text-marca">ahorrar</span> con energía solar?
            </h2>
            <p className="mt-3 max-w-xl text-texto-medio">
              Cuéntenos cuánto paga de luz al mes y qué quiere alimentar.
              Le decimos qué sistema le sirve, cuánto cuesta y en cuánto
              tiempo se paga solo.
            </p>
          </div>

          <a
            href={`https://wa.me/${site.contacto.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-marca bg-marca px-7 py-4 font-semibold text-marca-contraste transition-colors hover:bg-marca-fuerte"
          >
            Calcular mi ahorro
          </a>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Cómo compramos
// ---------------------------------------------------------------------------

export function ComoComprar() {
  const pasos = [
    { t: 'Le asesoramos', d: 'Nos cuenta qué quiere alimentar y le decimos qué sistema le sirve. Sin compromiso.' },
    { t: 'Cotizamos', d: 'Le pasamos precio con instalación incluida si la necesita, y tiempo de entrega.' },
    { t: 'Instalamos', d: 'No solo vendemos el equipo: lo dejamos funcionando en su casa, finca o negocio.' },
  ];

  return (
    <section className="contenedor py-16">
      <h2 className="text-3xl font-bold sm:text-4xl">Cómo se compra</h2>
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {pasos.map((p, i) => (
          <div key={p.t} className="rounded-marca-lg border border-borde-suave bg-superficie p-6">
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-marca text-sm font-bold text-marca-contraste">
              {i + 1}
            </span>
            <h3 className="mt-4 text-lg font-semibold">{p.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-texto-medio">{p.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Tienda, blog y galería — estructura lista, contenido pendiente
// ---------------------------------------------------------------------------

function Pendiente({ nota }: { nota: string }) {
  return (
    <div className="rounded-marca-lg border border-dashed border-acento/30 bg-acento-tenue px-6 py-10 text-center">
      <p className="text-sm font-semibold text-acento-texto">
        [PENDIENTE: contenido real de Clima Zoe]
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-texto-medio">{nota}</p>
    </div>
  );
}

export function Tienda() {
  return (
    <section className="contenedor py-16">
      <h2 className="text-3xl font-bold sm:text-4xl">Dónde estamos</h2>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-marca-lg border border-borde-suave bg-superficie p-8">
          <h3 className="text-lg font-bold">{site.nombre}</h3>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-texto-suave">Teléfono</dt>
              <dd>
                <a
                  href={`tel:${site.contacto.telefono?.replace(/\s/g, '')}`}
                  className="text-lg font-bold text-marca"
                >
                  {site.contacto.telefono}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-texto-suave">WhatsApp</dt>
              <dd>
                <a
                  href={`https://wa.me/${site.contacto.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-marca"
                >
                  Escribir ahora
                </a>
              </dd>
            </div>
          </dl>
          <div className="mt-6">
            <Pendiente nota="Dirección, correo y horario de atención." />
          </div>
        </div>

        <div className="flex min-h-64 items-center justify-center rounded-marca-lg border border-dashed border-borde bg-superficie text-center text-sm text-texto-suave">
          [PENDIENTE: mapa de la ubicación de Clima Zoe]
        </div>
      </div>
    </section>
  );
}

export function BlogYGaleria() {
  return (
    <section className="contenedor py-16">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">Del blog</h2>
          <p className="mt-2 text-sm text-texto-medio">
            Guías para entender qué sistema le conviene.
          </p>
          <div className="mt-6">
            <Pendiente nota="Artículos propios: cómo dimensionar un sistema, litio vs. gel, cuánto se ahorra." />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold">Galería de proyectos</h2>
          <p className="mt-2 text-sm text-texto-medio">
            Instalaciones hechas por Clima Zoe.
          </p>
          <div className="mt-6">
            <Pendiente nota="Fotos propias de instalaciones y del equipo trabajando." />
          </div>
        </div>
      </div>
    </section>
  );
}
