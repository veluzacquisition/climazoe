import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { filtrarProductos, useCatalogo } from '../lib/catalogo';
import TarjetaProducto from '../components/TarjetaProducto';
import Seccion, { TituloSeccion } from '../components/Seccion';
import Revelar from '../components/Revelar';
import Hero from '../components/secciones/Hero';
import CarruselCategorias from '../components/secciones/CarruselCategorias';
import {
  BandaGarantias,
  Intro,
  BannerAsesoria,
  ComoComprar,
  Marcas,
  Tienda,
} from '../components/secciones/Bloques';
import type { Segmento } from '../types/catalogo';

/**
 * Home.
 *
 * El ritmo de tonos es deliberado: el oscuro se reserva para los momentos de
 * fuerza —hero, cifras, cierre— y el resto va sobre claro, donde se leen
 * mejor las fichas y los precios. Queda en torno a 65% claro / 35% oscuro,
 * en vez del negro continuo que hacía ver el sitio apagado.
 *
 *   1. Hero .................. OSCURO
 *   2. Garantías ............. claro
 *   3. Categorías ............ claro
 *   4. Destacados ............ claro
 *   5. Banner asesoría ....... OSCURO
 *   6. Impacto ............... OSCURO
 *   7. Más productos ......... claro
 *   8. Marcas ................ claro
 *   9. Cómo se compra ........ claro
 *  10. Tienda ................ OSCURO
 *  11. Blog y galería ........ claro
 *  12. Cierre ............... OSCURO
 */

export default function Home({ segmento }: { segmento: Segmento }) {
  const { datos, cargando } = useCatalogo();

  /**
   * Destacados: el mejor producto de cada categoría raíz. Tomar los ocho
   * mejores del catálogo llenaría la vitrina con baterías de la misma
   * familia y no mostraría a qué se dedica el negocio.
   */
  const destacados = useMemo(() => {
    if (!datos) return [];
    const ordenados = filtrarProductos(
      datos,
      { soloDisponibles: true, orden: 'relevancia' },
      segmento,
    );
    const vistas = new Set<string>();
    const elegidos = [];
    for (const p of ordenados) {
      const raiz = p.ruta[0] ?? p.categoria ?? '';
      if (vistas.has(raiz)) continue;
      vistas.add(raiz);
      elegidos.push(p);
      if (elegidos.length === 6) break;
    }
    for (const p of ordenados) {
      if (elegidos.length >= 6) break;
      if (!elegidos.includes(p)) elegidos.push(p);
    }
    return elegidos;
  }, [datos, segmento]);


  return (
    <>
      <Hero />
      <Intro />
      <BandaGarantias />
      <Marcas />
      <CarruselCategorias />

      <FranjaProductos
        fondo="alt"
        etiqueta="Catálogo"
        titulo="Productos destacados"
        bajada="Equipo disponible para despacho inmediato."
        productos={destacados}
        cargando={cargando}
        segmento={segmento}
      />

      <ComoComprar />
      <Tienda />
      <BannerAsesoria />
    </>
  );
}

function FranjaProductos({
  fondo = 'base',
  etiqueta,
  titulo,
  bajada,
  productos,
  cargando,
  segmento,
}: {
  fondo?: 'base' | 'alt';
  etiqueta?: string;
  titulo: string;
  bajada: string;
  productos: ReturnType<typeof filtrarProductos>;
  cargando: boolean;
  segmento: Segmento;
}) {
  if (!cargando && productos.length === 0) return null;

  return (
    <Seccion fondo={fondo}>
      <TituloSeccion
        etiqueta={etiqueta}
        titulo={titulo}
        bajada={bajada}
        accion={
          <Link
            to="/catalogo"
            className="text-sm font-bold text-marca-texto transition-colors hover:underline"
          >
            Ver catálogo completo →
          </Link>
        }
      />

      {cargando ? (
        <div className="mt-10 grid items-start gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-marca-lg bg-superficie" />
          ))}
        </div>
      ) : (
        <Revelar className="mt-10 grid items-start gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {productos.map((p) => (
            <TarjetaProducto key={p.id} producto={p} segmento={segmento} />
          ))}
        </Revelar>
      )}
    </Seccion>
  );
}
