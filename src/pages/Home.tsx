import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { filtrarProductos, useCatalogo } from '../lib/catalogo';
import TarjetaProducto from '../components/TarjetaProducto';
import Hero from '../components/secciones/Hero';
import Impacto from '../components/secciones/Impacto';
import CarruselCategorias from '../components/secciones/CarruselCategorias';
import {
  BandaGarantias,
  BannerAsesoria,
  BlogYGaleria,
  ComoComprar,
  Marcas,
  Tienda,
} from '../components/secciones/Bloques';
import type { Segmento } from '../types/catalogo';

/**
 * Home.
 *
 * Sigue el orden de bloques de una tienda de catálogo: gancho, confianza,
 * navegación por categoría, producto, y recién al final la parte
 * institucional. Todo lo que muestra sale del catálogo real; lo que depende
 * de contenido de Clima Zoe queda marcado como pendiente en vez de
 * rellenarse con texto inventado.
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
      if (elegidos.length === 8) break;
    }
    // Si hay pocas categorías raíz, se completa con el resto del orden.
    for (const p of ordenados) {
      if (elegidos.length >= 8) break;
      if (!elegidos.includes(p)) elegidos.push(p);
    }
    return elegidos;
  }, [datos, segmento]);

  const novedades = useMemo(
    () =>
      datos
        ? filtrarProductos(datos, { soloDisponibles: true, orden: 'relevancia' }, segmento)
            .slice(8, 16)
        : [],
    [datos, segmento],
  );

  return (
    <>
      <Hero />
      <BandaGarantias />
      <CarruselCategorias />

      <FranjaProductos
        titulo="Productos destacados"
        bajada="Distribución, venta e instalación de sistemas solares. Le asesoramos para generar energía al menor costo."
        productos={destacados}
        cargando={cargando}
        segmento={segmento}
      />

      <BannerAsesoria />
      <Impacto />

      <FranjaProductos
        titulo="También le puede servir"
        bajada="Más equipo disponible para despacho inmediato."
        productos={novedades}
        cargando={cargando}
        segmento={segmento}
      />

      <Marcas />
      <ComoComprar />
      <Tienda />
      <BlogYGaleria />

      {/* --- CTA final ---------------------------------------------------- */}
      <section className="contenedor py-16">
        <div className="overflow-hidden rounded-marca-lg border border-borde bg-superficie px-8 py-16 text-center sm:px-14">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Dejemos de <span className="text-marca">pagar recibo</span> de luz
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-texto-medio">
            Escríbanos y le armamos el sistema a la medida de lo que necesita.
          </p>
          <a
            href="https://wa.me/573223919801"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-9 inline-flex rounded-marca bg-marca px-7 py-4 font-semibold text-marca-contraste transition-colors hover:bg-marca-fuerte"
          >
            Hablar con un asesor
          </a>
        </div>
      </section>
    </>
  );
}

function FranjaProductos({
  titulo,
  bajada,
  productos,
  cargando,
  segmento,
}: {
  titulo: string;
  bajada: string;
  productos: ReturnType<typeof filtrarProductos>;
  cargando: boolean;
  segmento: Segmento;
}) {
  if (!cargando && productos.length === 0) return null;

  return (
    <section className="contenedor py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl">{titulo}</h2>
          <p className="mt-3 text-texto-medio">{bajada}</p>
        </div>
        <Link
          to="/catalogo"
          className="text-sm font-semibold text-marca transition-colors hover:text-marca-fuerte"
        >
          Ver catálogo completo →
        </Link>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cargando
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-marca-lg bg-superficie" />
            ))
          : productos.map((p) => (
              <TarjetaProducto key={p.id} producto={p} segmento={segmento} />
            ))}
      </div>
    </section>
  );
}
