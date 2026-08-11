import { Link } from 'react-router-dom';
import type { ProductoWeb } from '../lib/catalogo';
import type { Segmento } from '../types/catalogo';
import { precio as formatear } from '../lib/formato';
import { enlaceWhatsApp } from './BotonCompra';

interface Props {
  producto: ProductoWeb;
  segmento: Segmento;
}

export default function TarjetaProducto({ producto, segmento }: Props) {
  const valor = producto.precios[segmento] ?? producto.precios.minorista ?? null;
  const categoria = producto.ruta.join(' · ');

  return (
    <article className="group flex flex-col overflow-hidden rounded-marca-lg border border-borde-suave bg-superficie transition-colors hover:border-marca-borde">
      <Link
        to={`/producto/${producto.id}`}
        className="relative block aspect-square overflow-hidden bg-white"
      >
        {/* Fondo blanco a propósito: las fotos del catálogo vienen recortadas
            sobre blanco, así que sobre negro se verían con un marco sucio. */}
        <img
          src={producto.imagenes[0]}
          alt={producto.nombre}
          loading="lazy"
          decoding="async"
          className="size-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
        {!producto.disponible && (
          <span className="absolute left-3 top-3 rounded-marca bg-zoe-black/85 px-2.5 py-1 text-xs font-semibold text-texto-medio backdrop-blur">
            Agotado
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {categoria && (
          <p className="line-clamp-1 text-xs font-medium uppercase tracking-wide text-texto-suave">
            {categoria}
          </p>
        )}

        <h3 className="mt-1.5 flex-1 text-sm font-semibold leading-snug">
          <Link to={`/producto/${producto.id}`} className="transition-colors hover:text-marca">
            <span className="line-clamp-2">{producto.nombre}</span>
          </Link>
        </h3>

        <div className="mt-4">
          {valor ? (
            <p className="text-lg font-bold text-marca">{formatear(valor)}</p>
          ) : (
            <p className="text-sm font-semibold text-texto-medio">Precio a cotizar</p>
          )}
        </div>

        <a
          href={enlaceWhatsApp(producto, segmento)}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-4 inline-flex w-full items-center justify-center rounded-marca px-4 py-2.5 text-sm font-semibold transition-colors ${
            producto.disponible
              ? 'bg-marca text-marca-contraste hover:bg-marca-fuerte'
              : 'border border-borde bg-superficie-alta text-texto-medio hover:border-marca-borde hover:text-marca'
          }`}
        >
          {producto.disponible ? 'Cotizar por WhatsApp' : 'Consultar disponibilidad'}
        </a>
      </div>
    </article>
  );
}
