import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { construirArbol, useCatalogo } from '../../lib/catalogo';
import Seccion, { TituloSeccion } from '../Seccion';

/**
 * "Categorías destacadas" en carrusel, como el del sitio de referencia.
 *
 * Usa scroll horizontal nativo con scroll-snap en vez de una librería: se
 * puede arrastrar, funciona con teclado y con lector de pantalla, y no suma
 * kilobytes al bundle.
 */

/** Un pictograma por familia; la clave es el prefijo del slug. */
const ICONOS: { patron: RegExp; icono: React.ReactNode }[] = [
  { patron: /panel/i, icono: <IconoPanel /> },
  { patron: /bater|litio|gel/i, icono: <IconoBateria /> },
  { patron: /inversor|controlador|grid|hibrido/i, icono: <IconoInversor /> },
  { patron: /proteccion|breaker|dps|fusible/i, icono: <IconoEscudo /> },
  { patron: /lampara|reflector|ilumina/i, icono: <IconoBombillo /> },
  { patron: /cable|conector/i, icono: <IconoCable /> },
  { patron: /movilidad|cargador|electrolinera/i, icono: <IconoCarga /> },
  { patron: /calentador|colector/i, icono: <IconoSol /> },
  { patron: /estructura/i, icono: <IconoEstructura /> },
];

function iconoDe(slug: string, nombre: string) {
  return ICONOS.find((i) => i.patron.test(slug) || i.patron.test(nombre))?.icono ?? <IconoSol />;
}

export default function CarruselCategorias() {
  const { datos, cargando } = useCatalogo();
  const pista = useRef<HTMLDivElement>(null);

  const categorias = useMemo(
    () => (datos ? construirArbol(datos.categorias) : []),
    [datos],
  );

  const desplazar = (dir: 1 | -1) => {
    pista.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <Seccion>
      <TituloSeccion
        titulo="Categorías destacadas"
        bajada="Equipos para hogar, finca y empresa. Si no sabe qué necesita, escríbanos y le armamos el sistema a la medida."
        accion={
          <div className="flex gap-2">
          <button
            type="button"
            onClick={() => desplazar(-1)}
            aria-label="Categorías anteriores"
            className="flex size-10 items-center justify-center rounded-full border border-borde text-texto-medio transition-colors hover:border-marca-borde hover:text-marca-texto"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => desplazar(1)}
            aria-label="Categorías siguientes"
            className="flex size-10 items-center justify-center rounded-full border border-borde text-texto-medio transition-colors hover:border-marca-borde hover:text-marca-texto"
          >
            ›
          </button>
          </div>
        }
      />

      <div ref={pista} className="pista mt-10 gap-4 pb-2">
        {cargando
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 w-56 animate-pulse rounded-marca-lg bg-superficie" />
            ))
          : categorias.map((c) => (
              <Link
                key={c.slug}
                to={`/catalogo?categoria=${c.slug}`}
                className="group flex w-56 flex-col justify-between rounded-marca-lg border border-borde-suave bg-superficie p-6 transition-colors hover:border-marca hover:bg-superficie-alta"
              >
                <span className="flex size-12 items-center justify-center rounded-marca bg-marca-tenue text-marca-texto transition-colors group-hover:bg-marca group-hover:text-marca-contraste">
                  {iconoDe(c.slug, c.nombre)}
                </span>
                <span className="mt-6 block font-semibold leading-snug transition-colors group-hover:text-marca-texto">
                  {c.nombre}
                </span>
                <span className="mt-1 block text-sm text-texto-suave">
                  {c.total} {c.total === 1 ? 'producto' : 'productos'}
                </span>
              </Link>
            ))}
      </div>
    </Seccion>
  );
}

// --- Pictogramas ------------------------------------------------------------
// Trazo simple sobre la retícula de 24: se leen bien a 24px y no compiten con
// el verde de marca.

const svg = 'size-6 stroke-current fill-none';
const props = { viewBox: '0 0 24 24', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function IconoPanel() {
  return (
    <svg {...props} className={svg}>
      <path d="M3 4h18l-2 10H5L3 4Z" />
      <path d="M9 4v10M15 4v10M4 9h16M12 14v6M9 20h6" />
    </svg>
  );
}
function IconoBateria() {
  return (
    <svg {...props} className={svg}>
      <rect x="2" y="7" width="17" height="10" rx="2" />
      <path d="M22 11v2M6 11v2M10 11v2M14 11v2" />
    </svg>
  );
}
function IconoInversor() {
  return (
    <svg {...props} className={svg}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="m8 14 3-4 2 2 3-4" />
    </svg>
  );
}
function IconoEscudo() {
  return (
    <svg {...props} className={svg}>
      <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3Z" />
      <path d="m9.5 12 1.8 1.8L15 10" />
    </svg>
  );
}
function IconoBombillo() {
  return (
    <svg {...props} className={svg}>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.4.3.5.7.5 1.1v1h6v-1c0-.4.1-.8.5-1.1A6 6 0 0 0 12 3Z" />
    </svg>
  );
}
function IconoCable() {
  return (
    <svg {...props} className={svg}>
      <path d="M4 6v4a4 4 0 0 0 4 4h8a4 4 0 0 1 4 4v0" />
      <path d="M2 4h4v2H2zM18 18h4v2h-4z" />
    </svg>
  );
}
function IconoCarga() {
  return (
    <svg {...props} className={svg}>
      <rect x="4" y="3" width="11" height="18" rx="2" />
      <path d="m9 9-2 4h3l-1 3M19 8v7a2 2 0 0 1-4 0" />
    </svg>
  );
}
function IconoSol() {
  return (
    <svg {...props} className={svg}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
    </svg>
  );
}
function IconoEstructura() {
  return (
    <svg {...props} className={svg}>
      <path d="M3 20 8 5h8l5 15" />
      <path d="M6.5 13h11M12 5v15" />
    </svg>
  );
}
