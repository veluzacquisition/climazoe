import { Link } from 'react-router-dom';
import type { ProductoWeb } from '../lib/catalogo';
import type { Segmento } from '../types/catalogo';
import { precio as formatear } from '../lib/formato';
import AccionesProducto from './AccionesProducto';

/**
 * Tarjeta de producto: disposición HORIZONTAL.
 *
 * La foto va a la izquierda en un cuadrado fijo y el texto a la derecha, como
 * en el sitio de referencia. La razón no es estética: en una parrilla de
 * equipos técnicos lo que decide la compra es el modelo y la línea de
 * especificación, no la foto —un inversor blanco se parece a todos los
 * inversores blancos—. En vertical la foto se comía media tarjeta y el texto
 * quedaba recortado a dos líneas; en horizontal cabe la especificación
 * completa y entran más productos por pantalla.
 *
 * La tarjeta tiene dos modos según de dónde salga la ficha:
 *
 *   · FICHA — paneles, inversores, baterías, MPPT y medidores de Fibra
 *     Andina. Marca, modelo, especificación y el PDF del fabricante. Sin
 *     precio ni carrito: se dimensionan por proyecto.
 *   · TIENDA — el resto. Precio (o "a cotizar") y las acciones de compra.
 */

interface Props {
  producto: ProductoWeb;
  segmento: Segmento;
}

export default function TarjetaProducto({ producto, segmento }: Props) {
  const esFicha = producto.fuente === 'fibraandina';
  const valor = producto.precios[segmento] ?? producto.precios.minorista ?? null;
  const portada = producto.imagenes[0];
  const ficha = producto.fichas[0];

  return (
    <article className="group relative flex gap-4 overflow-hidden rounded-marca-lg border border-borde bg-fondo p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-apoyo hover:shadow-panel motion-reduce:transform-none motion-reduce:transition-none">
      {/* --- Foto ---------------------------------------------------------- */}
      <div className="relative size-24 shrink-0 overflow-hidden rounded-marca border border-borde-suave bg-white sm:size-28">
        {portada ? (
          <img
            src={portada}
            alt={producto.nombre}
            loading="lazy"
            decoding="async"
            className="size-full object-contain p-2 transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          /* El proveedor publica algún producto sin foto. Un recuadro vacío
             parece un error de carga; esto se lee como lo que es. */
          <span className="flex size-full flex-col items-center justify-center gap-1 bg-superficie px-2 text-center">
            <IconoSinFoto />
            <span className="text-[10px] font-semibold leading-tight text-texto-suave">
              Foto en camino
            </span>
          </span>
        )}

        {producto.marca && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-apoyo/95 py-0.5 text-center text-[9px] font-bold uppercase tracking-wider text-zoe-white">
            {producto.marca}
          </span>
        )}
      </div>

      {/* --- Contenido ----------------------------------------------------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {!producto.marca && producto.ruta.length > 0 && (
          <p className="line-clamp-1 text-[11px] font-semibold uppercase tracking-wide text-texto-suave">
            {producto.ruta.join(' · ')}
          </p>
        )}

        <h3 className="text-[0.9375rem] font-bold leading-snug">
          {/* El enlace cubre la tarjeta entera: en horizontal el título es un
              blanco pequeño y obligar a apuntarle es incómodo. Las acciones de
              abajo van por encima con `relative`. */}
          <Link to={`/producto/${producto.id}`} className="transition-colors hover:text-apoyo">
            <span className="absolute inset-0" aria-hidden="true" />
            <span className="line-clamp-2">{esFicha ? producto.sku : producto.nombre}</span>
          </Link>
        </h3>

        {producto.resumen && (
          <p className="mt-1.5 line-clamp-3 flex-1 text-[13px] leading-relaxed text-texto-medio">
            {producto.resumen}
          </p>
        )}

        {esFicha ? (
          <div className="relative mt-3">
            {ficha ? (
              <a
                href={ficha.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-apoyo transition-colors hover:text-apoyo-fuerte"
              >
                <IconoDescarga />
                Ficha técnica
              </a>
            ) : (
              <Link
                to={`/producto/${producto.id}`}
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-apoyo transition-colors hover:text-apoyo-fuerte"
              >
                Ver especificaciones
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="relative mt-3 flex flex-wrap items-center justify-between gap-2">
            {valor ? (
              <p className="text-base font-bold text-marca-texto">{formatear(valor)}</p>
            ) : (
              <p className="text-[13px] font-semibold text-texto-medio">Precio a cotizar</p>
            )}
            <AccionesProducto producto={producto} segmento={segmento} variante="fila" />
          </div>
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
      className="size-6 text-texto-suave"
    >
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m3 16 4.5-4.5 4 4L15 12l6 5.5" />
    </svg>
  );
}
