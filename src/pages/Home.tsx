import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { filtrarProductos, useCatalogo } from '../lib/catalogo';
import TarjetaProducto from '../components/TarjetaProducto';
import Seccion, { TituloSeccion } from '../components/Seccion';
import Hero from '../components/secciones/Hero';
import Impacto from '../components/secciones/Impacto';
import CarruselCategorias from '../components/secciones/CarruselCategorias';
import {
  BandaGarantias,
  BannerAsesoria,
  ComoComprar,
  Marcas,
  Tienda,
} from '../components/secciones/Bloques';
import { MEDIA_HERO, imagen, imagenSrcSet } from '../lib/media';
import { site } from '../lib/site.config';
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
      if (elegidos.length === 8) break;
    }
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
        fondo="alt"
        titulo="Productos destacados"
        bajada="Distribución, venta e instalación de sistemas solares. Le asesoramos para generar energía al menor costo."
        productos={destacados}
        cargando={cargando}
        segmento={segmento}
      />

      <BannerAsesoria />
      <Impacto />

      <FranjaProductos
        fondo="alt"
        titulo="También le puede servir"
        bajada="Más equipo disponible para despacho inmediato."
        productos={novedades}
        cargando={cargando}
        segmento={segmento}
      />

      <Marcas />
      <ComoComprar />
      <Tienda />
      <Cierre />
    </>
  );
}

/**
 * Cierre con fotografía a sangre, no una caja de texto centrada.
 *
 * Es el mismo recurso del hero —imagen debajo, velo, texto encima— y cierra
 * la página con el mismo peso con el que abre.
 */
function Cierre() {
  return (
    <section className="tono-oscuro relative isolate overflow-hidden bg-zoe-black">
      <img
        src={imagen(MEDIA_HERO.panelesTecho, 1600)}
        srcSet={imagenSrcSet(MEDIA_HERO.panelesTecho)}
        sizes="100vw"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-20 size-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/70" />

      <div className="contenedor relative py-20 text-center lg:py-28">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Dejemos de <span className="text-marca">pagar recibo</span> de luz
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-lg text-white/80">
          Le armamos el sistema a la medida de lo que necesita.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={`https://wa.me/${site.contacto.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-xl btn-solar"
          >
            Hablar con un asesor
          </a>
          <Link
            to="/catalogo"
            className="btn btn-xl border border-white/30 text-white hover:border-white hover:bg-white/10"
          >
            Ver el catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}

function FranjaProductos({
  fondo = 'base',
  titulo,
  bajada,
  productos,
  cargando,
  segmento,
}: {
  fondo?: 'base' | 'alt';
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

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cargando
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-marca-lg bg-superficie" />
            ))
          : productos.map((p) => (
              <TarjetaProducto key={p.id} producto={p} segmento={segmento} />
            ))}
      </div>
    </Seccion>
  );
}
