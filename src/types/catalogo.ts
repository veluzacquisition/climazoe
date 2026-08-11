/** Modelo del catálogo de Clima Zoe.
 *
 * Estos tipos son la fuente de verdad del frontend y espejan las tablas de
 * Supabase (ver supabase/schema.sql). El scraper produce un JSON con la forma
 * de `ProductoImportado`; el script de importación lo traduce a estas tablas.
 */

/** Los dos públicos del negocio. El precio mostrado depende de cuál esté activo. */
export type Segmento = 'minorista' | 'mayorista';

export type Disponibilidad = 'in_stock' | 'out_of_stock' | 'pre_order';

/** Cómo se cierra la venta de un producto. Configurable global o por producto. */
export type ModoCompra = 'whatsapp' | 'bold' | 'contraentrega' | 'cotizacion';

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  parent_id: string | null;
  orden: number;
  icono_url: string | null;
  descripcion: string | null;
  activo: boolean;
}

export interface ProductoImagen {
  id: string;
  producto_id: string;
  url_cloudinary: string;
  alt: string | null;
  orden: number;
}

export interface Producto {
  id: string;
  nombre: string;
  slug: string;
  categoria_id: string | null;

  descripcion_corta: string | null;
  descripcion_larga: string | null;
  /** Pares clave-valor libres: potencia, voltaje, capacidad, garantía… */
  especificaciones: Record<string, string>;

  /** Lo que se le muestra al cliente final. */
  precio_minorista: number | null;
  /** Lo que se le muestra a negocios, pymes e instaladores. */
  precio_mayorista: number | null;
  /**
   * Costo de referencia del proveedor. Uso interno: NUNCA se renderiza en el
   * sitio ni se expone en respuestas públicas de la API.
   */
  precio_proveedor: number | null;
  moneda: string;

  sku_proveedor: string | null;
  marca: string | null;
  disponibilidad: Disponibilidad;

  /** Si es null, aplica el modo de compra global de site.config. */
  modo_compra: ModoCompra | null;

  /** Sólo se enciende cuando tiene precio propio e imagen real en Cloudinary. */
  activo: boolean;
  destacado: boolean;
  orden: number;

  fuente_url: string | null;
  creado_en: string;
  actualizado_en: string;
}

/** Producto ya listo para pintar: incluye imágenes y categoría resueltas. */
export interface ProductoConDetalle extends Producto {
  imagenes: ProductoImagen[];
  categoria: Categoria | null;
  fichas_tecnicas: FichaTecnica[];
}

export interface FichaTecnica {
  nombre: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Forma del JSON que produce el scraper (data/catalogo_solphower.json)
// ---------------------------------------------------------------------------

export interface CategoriaImportada {
  slug: string;
  nombre: string | null;
  parent_slug: string | null;
  nivel: number;
  ruta: string[];
  subcategorias: string[];
  descripcion: string | null;
  fuente_url: string;
}

export interface ProductoImportado {
  id: string;
  nombre: string | null;
  sku_proveedor: string | null;
  producto_id_proveedor: string | null;
  categoria: string | null;
  categoria_nombre: string | null;
  subcategoria: string | null;
  subcategoria_nombre: string | null;
  ruta_categorias: string[];
  precio_proveedor: number | null;
  precio_lista_proveedor: number | null;
  descuento_pct: number | null;
  moneda: string;
  disponibilidad: Disponibilidad | string | null;
  stock_max: number | null;
  unidad_venta: string | null;
  dimensiones: string | null;
  descripcion_corta: string | null;
  descripcion_larga: string | null;
  especificaciones: Record<string, string>;
  imagenes: string[];
  videos: string[];
  fichas_tecnicas: FichaTecnica[];
  fuente_url: string;
  scraped_at: string;
}

export interface CatalogoImportado {
  fuente: string;
  generado_en: string;
  totales: Record<string, number>;
  categorias: CategoriaImportada[];
  productos: ProductoImportado[];
  fallos: { url: string; error: string }[];
}
