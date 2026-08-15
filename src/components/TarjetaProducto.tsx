import { Link } from 'react-router-dom';
import type { ProductoWeb } from '../lib/catalogo';
import type { Segmento } from '../types/catalogo';
import { precio as formatear } from '../lib/formato';
import AccionesProducto from './AccionesProducto';

/**
 * Tarjeta de producto del grid.
 *
 * Sigue la anatomía de una tarjeta de tienda: imagen con segunda foto al
 * pasar el mouse, distintivos arriba a la izquierda, categoría, nombre,
 * precio y acción. La acción aparece sobre la imagen en pantallas grandes
 * —donde hay hover— y fija debajo en táctiles, donde el hover no existe.
 */

interface Props {
  producto: ProductoWeb;
  segmento: Segmento;
}

export default function TarjetaProducto({ producto, segmento }: Props) {
  const valor = producto.precios[segmento] ?? producto.precios.minorista ?? null;
  const categoria = producto.ruta.join(' · ');
  const segunda = producto.imagenes[1];

  // La tarjeta usa el fondo base y las franjas de producto van sobre la
  // superficie alternativa: si ambas usaran el mismo tono, la tarjeta se
  // fundiría con la sección y el grid perdería su retícula.
  return (
    <article className="group flex flex-col overflow-hidden rounded-marca-lg border border-borde bg-fondo transition-colors hover:border-marca">
      <div className="relative">
        <Link
          to={`/producto/${producto.id}`}
          className="relative block aspect-square overflow-hidden border-b border-borde bg-white"
          aria-label={producto.nombre}
        >
          {/* Fondo blanco a propósito: las fotos vienen recortadas sobre
              blanco, así que sobre negro se verían con un marco sucio. */}
          <img
            src={producto.imagenes[0]}
            alt={producto.nombre}
            loading="lazy"
            decoding="async"
            className={`size-full object-contain p-4 transition-all duration-500 ${
              segunda ? 'group-hover:opacity-0' : 'group-hover:scale-105'
            }`}
          />
          {segunda && (
            <img
              src={segunda}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-contain p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Distintivos: sólo lo excepcional. La ficha técnica la tiene el 74%
            de los productos, así que como badge flotante es ruido, no señal;
            va abajo, junto al precio. */}
        {!producto.disponible && (
          <span className="chip pointer-events-none absolute left-3 top-3 bg-acento text-acento-contraste">
            Agotado
          </span>
        )}

        {/* --- Acción sobre la imagen (sólo donde hay hover) --- */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden translate-y-2 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 lg:block">
          <Link
            to={`/producto/${producto.id}`}
            className="block rounded-marca bg-zoe-black/90 py-2.5 text-center text-sm font-semibold text-zoe-white backdrop-blur transition-colors hover:bg-zoe-black"
          >
            Ver detalles
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {categoria && (
          <p className="line-clamp-1 text-xs font-medium uppercase tracking-wide text-texto-suave">
            {categoria}
          </p>
        )}

        <h3 className="mt-1.5 flex-1 text-sm font-semibold leading-snug">
          <Link to={`/producto/${producto.id}`} className="transition-colors hover:text-marca-texto">
            <span className="line-clamp-2">{producto.nombre}</span>
          </Link>
        </h3>

        {/* Precio y nota de ficha en filas separadas: en una tarjeta de ~230px
            puestos en la misma línea los dos se parten en dos renglones. */}
        <div className="mt-4">
          {valor ? (
            <p className="text-lg font-bold text-marca-texto">{formatear(valor)}</p>
          ) : (
            <p className="text-sm font-semibold text-texto-medio">Precio a cotizar</p>
          )}
          {producto.fichas.length > 0 && (
            <p className="mt-1 text-[10px] uppercase tracking-wide text-texto-suave">
              Ficha técnica en PDF
            </p>
          )}
        </div>

        <AccionesProducto producto={producto} segmento={segmento} variante="tarjeta" />
      </div>
    </article>
  );
}
