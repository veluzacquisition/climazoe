import { Link } from 'react-router-dom';
import type { ProductoWeb } from '../lib/catalogo';
import type { Segmento } from '../types/catalogo';
import { precio as formatear } from '../lib/formato';
import AccionesProducto from './AccionesProducto';

/**
 * Tarjeta de producto del grid.
 *
 * El catálogo mezcla dos proveedores con fichas distintas, y la tarjeta se
 * adapta en vez de forzar a los dos al mismo molde:
 *
 *   · MODO FICHA — paneles, inversores, baterías, controladores MPPT y
 *     medidores. Marca sobre la imagen, modelo como título, una línea de
 *     especificación y el PDF del fabricante. Sin precio y sin carrito: son
 *     líneas que se dimensionan y se cotizan por proyecto, no que se meten
 *     al carrito de a una.
 *
 *   · MODO TIENDA — el resto del catálogo. Precio (o "a cotizar") y las
 *     acciones de compra de siempre.
 *
 * La animación al pasar el mouse es contenida a propósito: la tarjeta se
 * levanta y la imagen crece un punto. En una rejilla de 273 productos un
 * efecto más aparatoso marea en vez de ayudar, y `motion-reduce` lo apaga
 * para quien pidió menos movimiento.
 */

interface Props {
  producto: ProductoWeb;
  segmento: Segmento;
}

export default function TarjetaProducto({ producto, segmento }: Props) {
  const esFicha = producto.fuente === 'fibraandina';
  const valor = producto.precios[segmento] ?? producto.precios.minorista ?? null;
  const categoria = producto.ruta.join(' · ');
  const portada = producto.imagenes[0];
  const segunda = producto.imagenes[1];
  const ficha = producto.fichas[0];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-marca-lg border border-borde bg-fondo transition-all duration-300 hover:-translate-y-1 hover:border-apoyo hover:shadow-panel motion-reduce:transform-none motion-reduce:transition-none">
      <div className="relative">
        <Link
          to={`/producto/${producto.id}`}
          className="relative block aspect-square overflow-hidden border-b border-borde bg-white"
          aria-label={producto.nombre}
        >
          {/* Fondo blanco a propósito: las fotos vienen recortadas sobre
              blanco, así que sobre otro tono se verían con un marco sucio. */}
          {!portada ? (
            /* El proveedor publica algún producto sin foto. Un recuadro vacío
               parece un error de carga; un marcador con el modelo se lee como
               lo que es: la ficha existe, la foto todavía no. */
            <span className="flex size-full flex-col items-center justify-center gap-2 bg-superficie px-4 text-center">
              <IconoSinFoto />
              <span className="text-xs font-semibold text-texto-suave">
                Foto en camino
              </span>
            </span>
          ) : (
          <img
            src={portada}
            alt={producto.nombre}
            loading="lazy"
            decoding="async"
            className={`size-full object-contain p-5 transition-all duration-500 motion-reduce:transition-none ${
              segunda ? 'group-hover:opacity-0' : 'group-hover:scale-105 motion-reduce:group-hover:scale-100'
            }`}
          />
          )}
          {segunda && (
            <img
              src={segunda}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-contain p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
            />
          )}
        </Link>

        {/* La marca va sobre la imagen: en una parrilla de equipos técnicos
            uno identifica al fabricante antes de leer el modelo. */}
        {producto.marca && (
          <span className="chip pointer-events-none absolute left-3 top-3 bg-apoyo text-zoe-white">
            {producto.marca}
          </span>
        )}

        {/* Acción sobre la imagen, sólo donde hay hover de verdad. */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden translate-y-2 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none lg:block">
          <Link
            to={`/producto/${producto.id}`}
            className="block rounded-marca bg-zoe-black/90 py-2.5 text-center text-sm font-semibold text-zoe-white backdrop-blur transition-colors hover:bg-zoe-black"
          >
            Ver detalles
          </Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {!producto.marca && categoria && (
          <p className="line-clamp-1 text-xs font-medium uppercase tracking-wide text-texto-suave">
            {categoria}
          </p>
        )}

        <h3
          className={`text-sm font-semibold leading-snug ${
            producto.marca ? '' : 'mt-1.5'
          } ${esFicha ? '' : 'flex-1'}`}
        >
          <Link
            to={`/producto/${producto.id}`}
            className="transition-colors hover:text-apoyo"
          >
            <span className="line-clamp-2">
              {esFicha ? producto.sku : producto.nombre}
            </span>
          </Link>
        </h3>

        {esFicha ? (
          <>
            {producto.resumen && (
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-texto-medio">
                {producto.resumen}
              </p>
            )}

            {/* La acción es descargar la especificación, no comprar. */}
            {ficha ? (
              <a
                href={ficha.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-apoyo transition-colors hover:text-apoyo-fuerte"
              >
                <IconoDescarga />
                Ficha técnica
              </a>
            ) : (
              <Link
                to={`/producto/${producto.id}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-apoyo transition-colors hover:text-apoyo-fuerte"
              >
                Ver especificaciones
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </>
        ) : (
          <>
            {/* Precio y nota de ficha en filas separadas: en una tarjeta de
                ~230px puestos en la misma línea se parten en dos renglones. */}
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
          </>
        )}
      </div>
    </article>
  );
}

function IconoDescarga() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function IconoSinFoto() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-9 text-texto-suave"
    >
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m3 16 4.5-4.5 4 4L15 12l6 5.5" />
    </svg>
  );
}
