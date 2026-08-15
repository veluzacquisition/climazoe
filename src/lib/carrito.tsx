import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import type { ProductoWeb } from './catalogo';
import type { Segmento } from '../types/catalogo';

/**
 * Carrito de compra.
 *
 * Vive en el cliente y se persiste en localStorage: no hay sesión de usuario
 * todavía, y perder el carrito al recargar es la forma más rápida de perder
 * una venta.
 *
 * El precio se congela al agregar el producto. Si mañana cambia la lista, lo
 * que el cliente vio es lo que se respeta hasta que vacíe el carrito; el
 * checkout avisa si algún ítem quedó desactualizado.
 */

const CLAVE_ALMACEN = 'climazoe.carrito.v1';

export interface ItemCarrito {
  id: string;
  nombre: string;
  imagen: string | null;
  /** Precio unitario congelado al momento de agregar. null = a cotizar. */
  precio: number | null;
  /** Segmento con el que se agregó, para detectar mezclas. */
  segmento: Segmento;
  cantidad: number;
  disponible: boolean;
  sku: string | null;
}

type Accion =
  | { tipo: 'agregar'; item: ItemCarrito }
  | { tipo: 'quitar'; id: string }
  | { tipo: 'cantidad'; id: string; cantidad: number }
  | { tipo: 'vaciar' }
  | { tipo: 'restaurar'; items: ItemCarrito[] };

/** Tope por línea: no hay control de stock real, así que se acota a algo sano. */
export const MAX_POR_LINEA = 99;

function reducer(items: ItemCarrito[], accion: Accion): ItemCarrito[] {
  switch (accion.tipo) {
    case 'agregar': {
      const existente = items.find((i) => i.id === accion.item.id);
      if (!existente) return [...items, accion.item];
      // Volver a agregar suma cantidades en vez de duplicar la línea.
      return items.map((i) =>
        i.id === accion.item.id
          ? { ...i, cantidad: Math.min(i.cantidad + accion.item.cantidad, MAX_POR_LINEA) }
          : i,
      );
    }
    case 'quitar':
      return items.filter((i) => i.id !== accion.id);
    case 'cantidad': {
      const n = Math.max(1, Math.min(accion.cantidad, MAX_POR_LINEA));
      return items.map((i) => (i.id === accion.id ? { ...i, cantidad: n } : i));
    }
    case 'vaciar':
      return [];
    case 'restaurar':
      return accion.items;
  }
}

export interface Totales {
  /** Suma de los ítems con precio. */
  subtotal: number;
  /** Unidades en el carrito, no líneas. */
  unidades: number;
  lineas: number;
  /** Hay al menos un producto sin precio: el pedido va como cotización. */
  hayACotizar: boolean;
  /** Todos los ítems tienen precio: se puede cobrar. */
  cobrable: boolean;
}

interface ContextoCarrito {
  items: ItemCarrito[];
  totales: Totales;
  abierto: boolean;
  abrir: () => void;
  cerrar: () => void;
  agregar: (producto: ProductoWeb, segmento: Segmento, cantidad?: number) => void;
  quitar: (id: string) => void;
  cambiarCantidad: (id: string, cantidad: number) => void;
  vaciar: () => void;
  cantidadDe: (id: string) => number;
}

const Contexto = createContext<ContextoCarrito | null>(null);

function leerAlmacen(): ItemCarrito[] {
  if (typeof window === 'undefined') return [];
  try {
    const crudo = window.localStorage.getItem(CLAVE_ALMACEN);
    if (!crudo) return [];
    const datos = JSON.parse(crudo);
    return Array.isArray(datos) ? (datos as ItemCarrito[]) : [];
  } catch {
    // Un carrito corrupto no debe tumbar el sitio: se descarta y sigue.
    return [];
  }
}

export function ProveedorCarrito({ children }: { children: React.ReactNode }) {
  const [items, despachar] = useReducer(reducer, []);
  const [abierto, setAbierto] = useState(false);
  const [hidratado, setHidratado] = useState(false);

  // Se restaura después del primer render para no romper la hidratación.
  useEffect(() => {
    despachar({ tipo: 'restaurar', items: leerAlmacen() });
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    try {
      window.localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(items));
    } catch {
      // Modo privado o cuota llena: el carrito sigue funcionando en memoria.
    }
  }, [items, hidratado]);

  // El scroll del fondo se congela con el panel abierto.
  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [abierto]);

  const agregar = useCallback(
    (producto: ProductoWeb, segmento: Segmento, cantidad = 1) => {
      despachar({
        tipo: 'agregar',
        item: {
          id: producto.id,
          nombre: producto.nombre,
          imagen: producto.imagenes[0] ?? null,
          precio: producto.precios[segmento] ?? producto.precios.minorista ?? null,
          segmento,
          cantidad,
          disponible: producto.disponible,
          sku: producto.sku,
        },
      });
      setAbierto(true);
    },
    [],
  );

  const totales = useMemo<Totales>(() => {
    const subtotal = items.reduce((t, i) => t + (i.precio ?? 0) * i.cantidad, 0);
    const unidades = items.reduce((t, i) => t + i.cantidad, 0);
    const hayACotizar = items.some((i) => i.precio == null);
    return {
      subtotal,
      unidades,
      lineas: items.length,
      hayACotizar,
      cobrable: items.length > 0 && !hayACotizar,
    };
  }, [items]);

  const valor = useMemo<ContextoCarrito>(
    () => ({
      items,
      totales,
      abierto,
      abrir: () => setAbierto(true),
      cerrar: () => setAbierto(false),
      agregar,
      quitar: (id) => despachar({ tipo: 'quitar', id }),
      cambiarCantidad: (id, cantidad) => despachar({ tipo: 'cantidad', id, cantidad }),
      vaciar: () => despachar({ tipo: 'vaciar' }),
      cantidadDe: (id) => items.find((i) => i.id === id)?.cantidad ?? 0,
    }),
    [items, totales, abierto, agregar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCarrito(): ContextoCarrito {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useCarrito debe usarse dentro de <ProveedorCarrito>');
  return ctx;
}
