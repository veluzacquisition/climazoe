import { useEffect, useMemo, useState } from 'react';
import type { Segmento } from '../types/catalogo';

/**
 * Capa de datos del catálogo.
 *
 * Hoy lee `public/data/catalogo.json`, que genera
 * `scraper/generar_catalogo_web.py` a partir del scraping. Mañana lee
 * Supabase. Las páginas usan sólo los hooks de este archivo, así que el
 * cambio es reemplazar `cargarCatalogo()` y nada más.
 *
 * Se sirve como fetch y no como import para que los 689 KB del catálogo no
 * entren al bundle de JS: el navegador lo cachea aparte y la primera pintura
 * no espera por él.
 */

export interface ProductoWeb {
  id: string;
  nombre: string;
  sku: string | null;
  categoria: string | null;
  subcategoria: string | null;
  ruta: string[];
  resumen: string | null;
  descripcion: string | null;
  specs: Record<string, string>;
  precios: Partial<Record<Segmento, number>>;
  disponible: boolean;
  unidad: string | null;
  imagenes: string[];
  videos: string[];
  fichas: { nombre: string; url: string }[];
}

export interface CategoriaWeb {
  slug: string;
  nombre: string;
  parent: string | null;
  conteo: number;
}

export interface Catalogo {
  generado_en: string;
  con_precios: boolean;
  categorias: CategoriaWeb[];
  productos: ProductoWeb[];
}

export interface NodoCategoria extends CategoriaWeb {
  hijos: NodoCategoria[];
  /** Productos propios + los de todas sus subcategorías. */
  total: number;
}

let cache: Promise<Catalogo> | null = null;

/**
 * Origen de los datos, en orden:
 *
 *   1. Supabase, si hay credenciales. Se consultan las vistas
 *      `catalogo_publico` y `categorias_publicas`, que ya devuelven la forma
 *      exacta de `ProductoWeb` / `CategoriaWeb` y —lo importante— NO incluyen
 *      el costo del proveedor.
 *   2. `public/data/catalogo.json`, el volcado del scraper.
 *
 * El respaldo no es pereza: mientras se migra, un error de red o una tabla a
 * medio poblar dejaría el sitio sin catálogo. Con esto se degrada a los datos
 * del último scraping en vez de mostrar una página vacía.
 */
async function desdeSupabase(): Promise<Catalogo> {
  const { supabase } = await import('./supabase');
  if (!supabase) throw new Error('Supabase sin configurar');

  const [productos, categorias] = await Promise.all([
    supabase.from('catalogo_publico').select('*').order('orden'),
    supabase.from('categorias_publicas').select('*'),
  ]);

  if (productos.error) throw new Error(productos.error.message);
  if (categorias.error) throw new Error(categorias.error.message);
  if (!productos.data?.length) throw new Error('El catálogo de Supabase está vacío');

  return {
    generado_en: new Date().toISOString(),
    con_precios: productos.data.some(
      (p) => p.precios && Object.keys(p.precios).length > 0,
    ),
    categorias: categorias.data as CategoriaWeb[],
    productos: productos.data as ProductoWeb[],
  };
}

async function desdeJSON(): Promise<Catalogo> {
  const r = await fetch('/data/catalogo.json');
  if (!r.ok) throw new Error(`No se pudo cargar el catálogo (HTTP ${r.status})`);
  return r.json() as Promise<Catalogo>;
}

function cargarCatalogo(): Promise<Catalogo> {
  cache ??= desdeSupabase().catch((e: Error) => {
    if (import.meta.env.DEV) {
      console.info(`[catálogo] Supabase no disponible (${e.message}); usando el JSON local.`);
    }
    return desdeJSON();
  });
  return cache;
}

export function useCatalogo() {
  const [datos, setDatos] = useState<Catalogo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    cargarCatalogo()
      .then((d) => vivo && setDatos(d))
      .catch((e: Error) => vivo && setError(e.message));
    return () => {
      vivo = false;
    };
  }, []);

  return { datos, error, cargando: !datos && !error };
}

// ---------------------------------------------------------------------------
// árbol de categorías
// ---------------------------------------------------------------------------

export function construirArbol(categorias: CategoriaWeb[]): NodoCategoria[] {
  const nodos = new Map<string, NodoCategoria>(
    categorias.map((c) => [c.slug, { ...c, hijos: [], total: c.conteo }]),
  );

  const raices: NodoCategoria[] = [];
  for (const nodo of nodos.values()) {
    const padre = nodo.parent ? nodos.get(nodo.parent) : undefined;
    if (padre) padre.hijos.push(nodo);
    else raices.push(nodo);
  }

  // El conteo de una categoría padre en los datos ya incluye a sus hijas
  // (viene del breadcrumb del producto), así que `total` no se suma: se
  // ordena por él y se ordenan las hijas igual.
  const ordenar = (lista: NodoCategoria[]) => {
    lista.sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre));
    lista.forEach((n) => ordenar(n.hijos));
  };
  ordenar(raices);

  return raices;
}

/** Slugs de una categoría y toda su descendencia, para filtrar. */
export function ramaDe(slug: string, categorias: CategoriaWeb[]): Set<string> {
  const rama = new Set([slug]);
  let creció = true;
  while (creció) {
    creció = false;
    for (const c of categorias) {
      if (c.parent && rama.has(c.parent) && !rama.has(c.slug)) {
        rama.add(c.slug);
        creció = true;
      }
    }
  }
  return rama;
}

// ---------------------------------------------------------------------------
// filtros y orden
// ---------------------------------------------------------------------------

export type Orden = 'relevancia' | 'nombre' | 'precio-asc' | 'precio-desc';

export interface Filtros {
  categoria?: string | null;
  busqueda?: string;
  soloDisponibles?: boolean;
  orden?: Orden;
}

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function filtrarProductos(
  catalogo: Catalogo,
  filtros: Filtros,
  segmento: Segmento,
): ProductoWeb[] {
  let lista = catalogo.productos;

  if (filtros.categoria) {
    const rama = ramaDe(filtros.categoria, catalogo.categorias);
    lista = lista.filter(
      (p) =>
        (p.categoria && rama.has(p.categoria)) ||
        (p.subcategoria && rama.has(p.subcategoria)),
    );
  }

  if (filtros.busqueda?.trim()) {
    // Todos los términos deben aparecer, en nombre, resumen, SKU o categoría:
    // así "bateria litio" filtra de verdad en vez de traer todo lo que
    // contenga cualquiera de las dos palabras.
    const terminos = normalizar(filtros.busqueda).split(/\s+/).filter(Boolean);
    lista = lista.filter((p) => {
      const heno = normalizar(
        [p.nombre, p.resumen ?? '', p.sku ?? '', p.ruta.join(' ')].join(' '),
      );
      return terminos.every((t) => heno.includes(t));
    });
  }

  if (filtros.soloDisponibles) {
    lista = lista.filter((p) => p.disponible);
  }

  const precio = (p: ProductoWeb) => p.precios[segmento] ?? p.precios.minorista ?? null;

  const ordenada = [...lista];
  switch (filtros.orden) {
    case 'nombre':
      ordenada.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;
    case 'precio-asc':
    case 'precio-desc': {
      const dir = filtros.orden === 'precio-asc' ? 1 : -1;
      ordenada.sort((a, b) => {
        const pa = precio(a);
        const pb = precio(b);
        // Los productos sin precio van al final en cualquier dirección.
        if (pa == null && pb == null) return 0;
        if (pa == null) return 1;
        if (pb == null) return -1;
        return (pa - pb) * dir;
      });
      break;
    }
    default:
      // Relevancia: primero lo que se puede comprar hoy —abrir el catálogo
      // con cuatro paneles agotados es peor que abrirlo con algo en stock—,
      // dentro de eso lo que el negocio vende como producto principal, y al
      // final se desempata por riqueza de ficha.
      ordenada.sort(
        (a, b) =>
          Number(b.disponible) - Number(a.disponible) ||
          pesoCategoria(b) - pesoCategoria(a) ||
          riqueza(b) - riqueza(a),
      );
  }

  return ordenada;
}

/**
 * Un panel solar vale más en la vitrina que un breaker, aunque el breaker
 * tenga más fotos. Sin esto la portada del catálogo abre con accesorios de
 * conexión, que es exactamente lo que nadie está buscando.
 */
const PESO_CATEGORIA: Record<string, number> = {
  'paneles-solares': 100,
  baterias: 90,
  litio: 90,
  'agm-gel': 85,
  'inversores-solphower': 80,
  hibrido: 80,
  'grid-tied': 75,
  'off-grid': 75,
  'bateria-inversor-integrado': 75,
  controladores: 60,
  'colectores-solares': 60,
  lamparas: 55,
  reflectores: 55,
  'movilidad-electrica': 40,
};

function pesoCategoria(p: ProductoWeb): number {
  const base =
    PESO_CATEGORIA[p.subcategoria ?? ''] ?? PESO_CATEGORIA[p.categoria ?? ''] ?? 10;
  // Los accesorios van detrás del equipo principal de su misma categoría.
  const esAccesorio = /^(accesorio|kit de|adaptador|cable|conector|soporte)/i.test(
    p.nombre,
  );
  return esAccesorio ? base - 25 : base;
}

function riqueza(p: ProductoWeb): number {
  return (
    p.imagenes.length +
    (p.descripcion ? 2 : 0) +
    (Object.keys(p.specs).length ? 2 : 0) +
    (p.fichas.length ? 1 : 0)
  );
}

/** Productos de la misma subcategoría, para el bloque de relacionados. */
export function relacionados(
  catalogo: Catalogo,
  producto: ProductoWeb,
  limite = 4,
): ProductoWeb[] {
  const clave = producto.subcategoria ?? producto.categoria;
  return catalogo.productos
    .filter(
      (p) =>
        p.id !== producto.id &&
        (p.subcategoria === clave || p.categoria === clave),
    )
    .sort((a, b) => riqueza(b) - riqueza(a))
    .slice(0, limite);
}

export function useProducto(id: string | undefined) {
  const { datos, error, cargando } = useCatalogo();
  const producto = useMemo(
    () => (datos && id ? datos.productos.find((p) => p.id === id) ?? null : null),
    [datos, id],
  );
  return { producto, catalogo: datos, error, cargando };
}
