import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { construirArbol, ramaDe, useCatalogo, type ProductoWeb } from '../../lib/catalogo';
import Seccion, { TituloSeccion } from '../Seccion';

/**
 * "Categorías destacadas" en carrusel.
 *
 * Cada tarjeta muestra una FOTO real de un producto de esa categoría, no un
 * pictograma. Una rejilla de iconitos se lee como plantilla; una rejilla de
 * producto se lee como tienda, y la foto ya la tenemos en el catálogo, así
 * que no hace falta material nuevo.
 *
 * Usa scroll horizontal nativo con scroll-snap en vez de una librería: se
 * puede arrastrar, funciona con teclado y con lector de pantalla, y no suma
 * kilobytes al bundle.
 */
export default function CarruselCategorias() {
  const { datos, cargando } = useCatalogo();
  const pista = useRef<HTMLDivElement>(null);

  const categorias = useMemo(() => {
    if (!datos) return [];
    return construirArbol(datos.categorias).map((c) => {
      const rama = ramaDe(c.slug, datos.categorias);
      // Se elige el producto disponible con más fotos: es el que mejor se ve.
      const mejor = datos.productos
        .filter(
          (p: ProductoWeb) =>
            (p.categoria && rama.has(p.categoria)) ||
            (p.subcategoria && rama.has(p.subcategoria)),
        )
        .sort(
          (a, b) =>
            Number(b.disponible) - Number(a.disponible) ||
            b.imagenes.length - a.imagenes.length,
        )[0];
      return { ...c, imagen: mejor?.imagenes[0] ?? null };
    });
  }, [datos]);

  const desplazar = (dir: 1 | -1) =>
    pista.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });

  return (
    <Seccion>
      <TituloSeccion
        titulo="Qué necesita para su proyecto"
        accion={
          <div className="flex gap-2">
            <BotonPista etiqueta="Categorías anteriores" onClick={() => desplazar(-1)}>
              ‹
            </BotonPista>
            <BotonPista etiqueta="Categorías siguientes" onClick={() => desplazar(1)}>
              ›
            </BotonPista>
          </div>
        }
      />

      <div ref={pista} className="pista mt-8 gap-4 pb-2">
        {cargando
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 w-64 animate-pulse rounded-marca-lg bg-superficie" />
            ))
          : categorias.map((c) => (
              <Link
                key={c.slug}
                to={`/catalogo?categoria=${c.slug}`}
                className="group w-64 overflow-hidden rounded-marca-lg border border-borde bg-fondo transition-colors hover:border-marca"
              >
                <div className="relative aspect-4/3 overflow-hidden border-b border-borde bg-white">
                  {c.imagen ? (
                    <img
                      src={c.imagen}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="size-full object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="size-full bg-superficie" />
                  )}
                  <span className="absolute bottom-2 right-2 rounded-marca bg-zoe-black/80 px-2 py-0.5 text-[11px] font-bold text-zoe-white">
                    {c.total}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 px-5 py-4">
                  <span className="font-bold leading-snug transition-colors group-hover:text-marca-texto">
                    {c.nombre}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-marca-texto transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </div>
              </Link>
            ))}
      </div>
    </Seccion>
  );
}

function BotonPista({
  etiqueta,
  onClick,
  children,
}: {
  etiqueta: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      className="flex size-10 items-center justify-center rounded-marca border border-borde text-texto-medio transition-colors hover:border-marca hover:text-marca-texto"
    >
      {children}
    </button>
  );
}
