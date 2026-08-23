import type { NodoCategoria } from '../lib/catalogo';

/**
 * Organigrama del catálogo: las categorías en horizontal, con icono.
 *
 * Reemplaza a la barra lateral vertical. En una tienda de cinco líneas de
 * producto —panel, inversor, batería, controlador, medidor— una columna
 * lateral desperdicia 16rem de ancho en escritorio y en celular obliga a
 * desplegar un acordeón para descubrir qué se vende. En horizontal la oferta
 * completa se ve de una y el ancho queda para los productos.
 *
 * Dos filas: arriba las categorías raíz, y debajo las subcategorías de la que
 * esté activa. La segunda fila sólo aparece cuando hay algo que mostrar, así
 * que la barra no ocupa alto de más en las categorías planas.
 */

interface Props {
  arbol: NodoCategoria[];
  activa: string | null;
  total: number;
  onElegir: (slug: string | null) => void;
}

export default function Organigrama({ arbol, activa, total, onElegir }: Props) {
  // Si lo activo es una subcategoría, la fila de abajo sigue siendo la de su
  // madre: al entrar a "Litio" uno espera seguir viendo "Gel" al lado.
  const rama =
    arbol.find((n) => n.slug === activa) ??
    arbol.find((n) => n.hijos.some((h) => h.slug === activa)) ??
    null;

  return (
    <div className="sticky top-24 z-30 border-b border-borde-suave bg-fondo/92 backdrop-blur">
      <div className="contenedor">
        <div className="pista gap-1 py-2.5">
          <Pieza
            texto="Todo"
            conteo={total}
            activa={!activa}
            onClick={() => onElegir(null)}
            icono="todo"
          />
          {arbol.map((n) => (
            <Pieza
              key={n.slug}
              texto={n.nombre}
              conteo={n.total}
              activa={activa === n.slug || rama?.slug === n.slug}
              onClick={() => onElegir(n.slug)}
              icono={n.slug}
            />
          ))}
        </div>

        {rama && rama.hijos.length > 0 && (
          <div className="pista gap-1.5 border-t border-borde-suave py-2">
            <SubPieza
              texto={`Todo en ${rama.nombre}`}
              activa={activa === rama.slug}
              onClick={() => onElegir(rama.slug)}
            />
            {rama.hijos.map((h) => (
              <SubPieza
                key={h.slug}
                texto={h.nombre}
                conteo={h.total}
                activa={activa === h.slug}
                onClick={() => onElegir(h.slug)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Pieza({
  texto,
  conteo,
  activa,
  onClick,
  icono,
}: {
  texto: string;
  conteo: number;
  activa: boolean;
  onClick: () => void;
  icono: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={activa ? 'true' : undefined}
      className={`group inline-flex items-center gap-2 whitespace-nowrap rounded-marca px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
        activa
          ? 'bg-apoyo text-zoe-white shadow-panel'
          : 'text-texto-medio hover:bg-superficie hover:text-apoyo'
      }`}
    >
      <IconoCategoria slug={icono} />
      {texto}
      <span
        className={`rounded-marca-pildora px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
          activa ? 'bg-white/20 text-zoe-white' : 'bg-superficie-alta text-texto-suave'
        }`}
      >
        {conteo}
      </span>
    </button>
  );
}

function SubPieza({
  texto,
  conteo,
  activa,
  onClick,
}: {
  texto: string;
  conteo?: number;
  activa: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={activa ? 'true' : undefined}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-marca-pildora border px-3 py-1.5 text-[13px] font-semibold transition-colors ${
        activa
          ? 'border-marca-borde bg-marca-tenue text-marca-texto'
          : 'border-borde text-texto-medio hover:border-apoyo hover:text-apoyo'
      }`}
    >
      {texto}
      {conteo != null && (
        <span className="text-[11px] font-bold tabular-nums text-texto-suave">{conteo}</span>
      )}
    </button>
  );
}

/**
 * Un icono por línea de producto.
 *
 * Van por slug y no por posición: si mañana se reordena el catálogo, el
 * panel sigue teniendo su sol. Lo que no está mapeado cae en un icono
 * genérico en vez de dejar un hueco.
 */
function IconoCategoria({ slug }: { slug: string }) {
  const trazos: Record<string, React.ReactNode> = {
    todo: (
      <>
        <rect x="3" y="3" width="7.5" height="7.5" rx="1.8" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8" />
      </>
    ),
    // Sol
    'paneles-solares': (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
      </>
    ),
    // Rayo
    inversores: <path d="M13 2 4.5 13.5H11l-.5 8.5L19.5 10.5H13z" />,
    // Pila
    baterias: (
      <>
        <rect x="2.5" y="7" width="16" height="10" rx="2" />
        <path d="M21.5 10.5v3M6 10v4M10 10v4" />
      </>
    ),
    // Chip
    'controladores-mppt': (
      <>
        <rect x="7" y="7" width="10" height="10" rx="1.5" />
        <path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />
      </>
    ),
    // Barras de medición
    medidores: <path d="M5 20V11M10 20V5M15 20v-6M20 20V8" />,
    // Ondas
    monitoreo: (
      <>
        <path d="M5 12.5a9.5 9.5 0 0 1 14 0M8 16a5 5 0 0 1 8 0" />
        <circle cx="12" cy="19.5" r="1" />
      </>
    ),
    // Escudo
    protecciones: <path d="M12 2.5 4.5 5.5v6c0 4.6 3.2 8.6 7.5 10 4.3-1.4 7.5-5.4 7.5-10v-6z" />,
    // Estructura
    'estructura-para-paneles': <path d="M3 20h18M6 20V9l6-4 6 4v11M6 12h12" />,
    // Enchufe
    conectores: (
      <>
        <path d="M9 3v6M15 3v6" />
        <path d="M6 9h12v2.5a6 6 0 0 1-6 6 6 6 0 0 1-6-6z" />
        <path d="M12 17.5V21" />
      </>
    ),
    // Bombillo
    lamparas: (
      <>
        <path d="M9.5 18h5M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5.9 1.2.9 2h5.2c0-.8.3-1.5.9-2A6 6 0 0 0 12 3Z" />
      </>
    ),
    // Termo
    'colectores-solares': (
      <>
        <path d="M4 9h16M4 15h16" />
        <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      </>
    ),
    // Cargador
    'movilidad-electrica': (
      <>
        <rect x="4" y="3" width="10" height="18" rx="2" />
        <path d="M8.5 8.5 7 12h3l-1.5 3.5M17 8v9a2 2 0 0 0 4 0v-5l-2.5-3" />
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
      className="size-[18px] shrink-0"
    >
      {trazos[slug] ?? <circle cx="12" cy="12" r="8.5" />}
    </svg>
  );
}
