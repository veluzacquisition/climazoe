import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  construirArbol,
  filtrarProductos,
  useCatalogo,
  type NodoCategoria,
  type Orden,
} from '../lib/catalogo';
import TarjetaProducto from '../components/TarjetaProducto';
import type { Segmento } from '../types/catalogo';

/**
 * Catálogo.
 *
 * Los filtros viven en la URL (`?categoria=…&q=…`) para que un enlace a
 * "baterías de litio" se pueda mandar por WhatsApp y abra exactamente esa
 * vista. Es la mitad de cómo se vende hoy.
 */

const POR_PAGINA = 24;

const ORDENES: { id: Orden; texto: string }[] = [
  { id: 'relevancia', texto: 'Relevancia' },
  { id: 'nombre', texto: 'Nombre (A-Z)' },
  { id: 'precio-asc', texto: 'Precio: menor primero' },
  { id: 'precio-desc', texto: 'Precio: mayor primero' },
];

export default function Catalogo({ segmento }: { segmento: Segmento }) {
  const { datos, error, cargando } = useCatalogo();
  const [params, setParams] = useSearchParams();
  const [visibles, setVisibles] = useState(POR_PAGINA);
  const [panelAbierto, setPanelAbierto] = useState(false);

  const categoria = params.get('categoria');
  const busqueda = params.get('q') ?? '';
  const orden = (params.get('orden') as Orden) ?? 'relevancia';
  const soloDisponibles = params.get('disponibles') === '1';

  const actualizar = (cambios: Record<string, string | null>) => {
    const nuevos = new URLSearchParams(params);
    for (const [k, v] of Object.entries(cambios)) {
      if (v === null || v === '') nuevos.delete(k);
      else nuevos.set(k, v);
    }
    setParams(nuevos, { replace: true });
    setVisibles(POR_PAGINA);
  };

  const arbol = useMemo(
    () => (datos ? construirArbol(datos.categorias) : []),
    [datos],
  );

  const resultados = useMemo(
    () =>
      datos
        ? filtrarProductos(datos, { categoria, busqueda, soloDisponibles, orden }, segmento)
        : [],
    [datos, categoria, busqueda, soloDisponibles, orden, segmento],
  );

  const nombreCategoria = datos?.categorias.find((c) => c.slug === categoria)?.nombre;

  if (error) {
    return (
      <div className="contenedor py-24">
        <h1 className="text-3xl font-bold">No se pudo cargar el catálogo</h1>
        <p className="mt-3 text-texto-medio">{error}</p>
      </div>
    );
  }

  // Catálogo en tono claro: las fichas, precios y filtros se leen mejor
  // sobre blanco, y le da el respiro claro que pedía el ritmo del sitio.
  return (
    <div className="bg-fondo">
      <div className="contenedor py-10">
      {/* --- Encabezado --------------------------------------------------- */}
      <header>
        <nav aria-label="Ruta" className="text-sm text-texto-suave">
          <Link to="/" className="transition-colors hover:text-marca-texto">Inicio</Link>
          <span className="mx-2">/</span>
          <Link to="/catalogo" className="transition-colors hover:text-marca-texto">Catálogo</Link>
          {nombreCategoria && (
            <>
              <span className="mx-2">/</span>
              <span className="text-texto">{nombreCategoria}</span>
            </>
          )}
        </nav>

        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
          {nombreCategoria ?? 'Todo el catálogo'}
        </h1>
        <p className="mt-2 text-texto-medio">
          {cargando
            ? 'Cargando productos…'
            : `${resultados.length} ${resultados.length === 1 ? 'producto' : 'productos'}`}
          {datos && !datos.con_precios && (
            <span className="ml-2 text-texto-suave">
              · precios a cotizar mientras se cierra la lista con el proveedor
            </span>
          )}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr]">
        {/* --- Sidebar de categorías -------------------------------------- */}
        {/* El header pegajoso mide 183px (cinta + fila principal + nav), así
            que la barra lateral se ancla justo debajo. */}
        <aside className="lg:sticky lg:top-[12rem] lg:max-h-[calc(100dvh-13rem)] lg:self-start lg:overflow-y-auto">
          <button
            type="button"
            onClick={() => setPanelAbierto((v) => !v)}
            aria-expanded={panelAbierto}
            className="flex w-full items-center justify-between rounded-marca border border-borde bg-superficie px-4 py-3 text-sm font-semibold lg:hidden"
          >
            Categorías
            <span className={`transition-transform ${panelAbierto ? 'rotate-180' : ''}`}>▾</span>
          </button>

          <div className={`${panelAbierto ? 'block' : 'hidden'} mt-3 lg:mt-0 lg:block`}>
            <h2 className="hidden px-1 text-xs font-semibold uppercase tracking-wider text-texto-suave lg:block">
              Categorías
            </h2>
            <ul className="mt-3 space-y-0.5">
              <li>
                <button
                  type="button"
                  onClick={() => actualizar({ categoria: null })}
                  className={`w-full rounded-marca px-3 py-2 text-left text-sm font-medium transition-colors ${
                    !categoria
                      ? 'bg-marca-tenue text-marca-texto'
                      : 'text-texto-medio hover:bg-superficie hover:text-texto'
                  }`}
                >
                  Todo el catálogo
                  <span className="float-right text-texto-suave">{datos?.productos.length ?? ''}</span>
                </button>
              </li>
              {arbol.map((nodo) => (
                <RamaCategoria
                  key={nodo.slug}
                  nodo={nodo}
                  activa={categoria}
                  onElegir={(slug) => actualizar({ categoria: slug })}
                />
              ))}
            </ul>
          </div>
        </aside>

        {/* --- Resultados ---------------------------------------------------- */}
        <div>
          {/* Barra de filtros */}
          <div className="flex flex-wrap items-center gap-3 rounded-marca-lg border border-borde-suave bg-superficie p-3">
            <label className="relative min-w-[12rem] flex-1">
              <span className="sr-only">Buscar productos</span>
              <input
                type="search"
                value={busqueda}
                onChange={(e) => actualizar({ q: e.target.value })}
                placeholder="Buscar: batería litio, panel 550w, inversor…"
                className="w-full rounded-marca border border-borde bg-fondo px-4 py-2.5 text-sm text-texto placeholder:text-texto-suave focus:border-marca-borde focus:outline-none"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-texto-medio">
              <input
                type="checkbox"
                checked={soloDisponibles}
                onChange={(e) => actualizar({ disponibles: e.target.checked ? '1' : null })}
                className="size-4 accent-[var(--marca)]"
              />
              Solo disponibles
            </label>

            <label className="flex items-center gap-2 text-sm text-texto-medio">
              <span className="sr-only sm:not-sr-only">Ordenar</span>
              <select
                value={orden}
                onChange={(e) => actualizar({ orden: e.target.value })}
                className="rounded-marca border border-borde bg-fondo px-3 py-2.5 text-sm text-texto focus:border-marca-borde focus:outline-none"
              >
                {ORDENES.map((o) => (
                  <option key={o.id} value={o.id}>{o.texto}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Grid */}
          {cargando ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-marca-lg border border-borde-suave bg-superficie"
                />
              ))}
            </div>
          ) : resultados.length === 0 ? (
            <div className="mt-6 rounded-marca-lg border border-borde-suave bg-superficie px-6 py-20 text-center">
              <p className="text-lg font-semibold">Sin resultados</p>
              <p className="mt-2 text-texto-medio">
                No encontramos productos con esos filtros. Escríbanos y se lo conseguimos.
              </p>
              <button
                type="button"
                onClick={() => setParams(new URLSearchParams(), { replace: true })}
                className="mt-6 rounded-marca bg-marca px-5 py-2.5 text-sm font-semibold text-marca-contraste"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {resultados.slice(0, visibles).map((p) => (
                  <TarjetaProducto key={p.id} producto={p} segmento={segmento} />
                ))}
              </div>

              {visibles < resultados.length && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibles((v) => v + POR_PAGINA)}
                    className="rounded-marca border border-borde px-6 py-3 text-sm font-semibold transition-colors hover:border-marca-borde hover:text-marca-texto"
                  >
                    Ver más ({resultados.length - visibles} restantes)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

function RamaCategoria({
  nodo,
  activa,
  onElegir,
  nivel = 0,
}: {
  nodo: NodoCategoria;
  activa: string | null;
  onElegir: (slug: string) => void;
  nivel?: number;
}) {
  // La rama se abre sola si la categoría activa está dentro, para que al
  // llegar por un enlace directo se vea dónde estás parado.
  const contieneActiva = useMemo(() => {
    const buscar = (n: NodoCategoria): boolean =>
      n.slug === activa || n.hijos.some(buscar);
    return buscar(nodo);
  }, [nodo, activa]);

  const [abierta, setAbierta] = useState(contieneActiva);
  const esActiva = nodo.slug === activa;

  return (
    <li>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onElegir(nodo.slug)}
          className={`flex-1 rounded-marca px-3 py-2 text-left text-sm transition-colors ${
            esActiva
              ? 'bg-marca-tenue font-semibold text-marca-texto'
              : 'text-texto-medio hover:bg-superficie hover:text-texto'
          }`}
          style={{ paddingLeft: `${0.75 + nivel * 0.75}rem` }}
        >
          {nodo.nombre}
          <span className="float-right text-xs text-texto-suave">{nodo.total}</span>
        </button>
        {nodo.hijos.length > 0 && (
          <button
            type="button"
            onClick={() => setAbierta((v) => !v)}
            aria-expanded={abierta}
            aria-label={`${abierta ? 'Contraer' : 'Expandir'} ${nodo.nombre}`}
            className="rounded-marca px-2 py-2 text-xs text-texto-suave transition-colors hover:text-marca-texto"
          >
            <span className={`inline-block transition-transform ${abierta ? 'rotate-180' : ''}`}>▾</span>
          </button>
        )}
      </div>

      {abierta && nodo.hijos.length > 0 && (
        <ul className="space-y-0.5 border-l border-borde-suave">
          {nodo.hijos.map((h) => (
            <RamaCategoria
              key={h.slug}
              nodo={h}
              activa={activa}
              onElegir={onElegir}
              nivel={nivel + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
