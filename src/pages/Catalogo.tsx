import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  construirArbol,
  filtrarProductos,
  useCatalogo,
  type Orden,
} from '../lib/catalogo';
import TarjetaProducto from '../components/TarjetaProducto';
import EncabezadoPagina from '../components/EncabezadoPagina';
import Revelar from '../components/Revelar';
import Organigrama from '../components/Organigrama';
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

  const categoria = params.get('categoria');
  const busqueda = params.get('q') ?? '';
  const orden = (params.get('orden') as Orden) ?? 'relevancia';
  // Ya no hay casilla en la interfaz —el distintivo "agotado" se retiró
  // porque el inventario del proveedor no es el nuestro— pero el parámetro
  // se sigue respetando: hay enlaces con ?disponibles=1 circulando.
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
      <EncabezadoPagina
        etiqueta="Catálogo"
        titulo={nombreCategoria ?? 'Todo el catálogo'}
        bajada={
          cargando
            ? 'Cargando productos…'
            : `${resultados.length} ${resultados.length === 1 ? 'producto disponible' : 'productos disponibles'}${
                datos && !datos.con_precios ? ' · precios a cotizar' : ''
              }`
        }
        migas={[
          { texto: 'Inicio', a: '/' },
          ...(nombreCategoria
            ? [{ texto: 'Catálogo', a: '/catalogo' }, { texto: nombreCategoria }]
            : [{ texto: 'Catálogo' }]),
        ]}
        alto="compacto"
      />

      {/* --- Organigrama --------------------------------------------------
          Las categorías en horizontal, con su icono, y las subcategorías en
          una segunda fila. Sustituye a la barra lateral vertical: con cinco
          líneas de producto una columna de 16rem era ancho regalado, y en
          celular obligaba a desplegar un acordeón para saber qué se vende. */}
      <Organigrama
        arbol={arbol}
        activa={categoria}
        total={datos?.productos.length ?? 0}
        onElegir={(slug) => actualizar({ categoria: slug })}
      />

      <div className="contenedor py-10">
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
            <div className="mt-6 grid items-start gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-marca-lg border border-borde-suave bg-superficie"
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
              <Revelar
                key={`${categoria ?? 'todo'}-${busqueda}-${orden}`}
                className="mt-6 grid items-start gap-4 lg:grid-cols-2 xl:grid-cols-3"
              >
                {resultados.slice(0, visibles).map((p) => (
                  <TarjetaProducto key={p.id} producto={p} segmento={segmento} />
                ))}
              </Revelar>

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
  );
}
