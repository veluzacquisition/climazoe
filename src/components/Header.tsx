import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { construirArbol, useCatalogo, type NodoCategoria } from '../lib/catalogo';
import { site } from '../lib/site.config';
import { useCarrito } from '../lib/carrito';
import { IconoCarrito } from './carrito/PanelCarrito';
import type { Segmento } from '../types/catalogo';

/**
 * Header de dos filas:
 *
 *   1. Logo · buscador · contacto y segmento.
 *   2. Navegación con el mega-menú "Productos".
 *
 * Tenía una tercera fila con una cinta de anuncios en movimiento. Se quitó:
 * decía lo mismo que ahora dicen las tarjetas de valor —envíos, asesoría,
 * instalación— y sumaba peso arriba, que es justo donde el sitio de
 * referencia es más liviano.
 *
 * El buscador va arriba y grande a propósito: en un catálogo de 213 ítems
 * repartidos en 35 categorías, buscar es más rápido que navegar el árbol.
 *
 * No hay carrito ni "mi cuenta": Clima Zoe cierra por WhatsApp, así que ese
 * espacio lo ocupa el teléfono y el CTA de asesoría.
 */

const NAV = [
  { a: '/catalogo', texto: 'Catálogo' },
  { a: '/servicios', texto: 'Servicios' },
  { a: '/nosotros', texto: 'Nosotros' },
  { a: '/contacto', texto: 'Contacto' },
];

export default function Header({
  segmento,
  onCambiarSegmento,
}: {
  segmento: Segmento;
  onCambiarSegmento: (s: Segmento) => void;
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-fondo">
      {/* --- Fila principal ---------------------------------------------- */}
      <div className="border-b border-borde-suave">
        <div className="contenedor flex h-20 items-center gap-4 md:h-24 md:gap-8">
          <Link to="/" className="shrink-0" aria-label={`${site.nombre} — inicio`}>
            <Logo className="h-12 md:h-16" />
          </Link>

          <Buscador className="hidden flex-1 md:block" />

          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <a
              href={`tel:${site.contacto.telefono?.replace(/\s/g, '')}`}
              className="hidden text-right lg:block"
            >
              <span className="block text-[11px] uppercase tracking-wide text-texto-suave">
                Servicio al cliente
              </span>
              <span className="block font-semibold text-marca-texto">{site.contacto.telefono}</span>
            </a>

            <SelectorSegmento valor={segmento} onCambiar={onCambiarSegmento} />

            <BotonCarrito />

            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú"
              className="rounded-marca border border-borde p-2.5 md:hidden"
            >
              <IconoMenu />
            </button>
          </div>
        </div>

        {/* Buscador móvil, debajo de la fila principal */}
        <div className="contenedor pb-3 md:hidden">
          <Buscador />
        </div>
      </div>

      {/* --- Barra de navegación ------------------------------------------ */}
      {/* Nav en píldora centrada: es la organización del sitio de referencia
          y pesa mucho menos que una barra de ancho completo. */}
      <nav className="hidden border-b border-borde-suave md:block">
        <div className="contenedor flex items-center gap-1 py-2">
          <MegaMenuProductos />
          {NAV.map((item) => (
            <NavLink
              key={item.a}
              to={item.a}
              className={({ isActive }) =>
                `px-4 py-3.5 text-sm font-medium transition-colors ${
                  isActive ? 'text-marca-texto' : 'text-texto-medio hover:text-texto'
                }`
              }
            >
              {item.texto}
            </NavLink>
          ))}

          <a
            href={`https://wa.me/${site.contacto.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-solar ml-auto"
          >
            Asesoría gratis
          </a>
        </div>
      </nav>

      <MenuMovil abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
    </header>
  );
}

// ---------------------------------------------------------------------------

/** Acceso al carrito con contador de unidades. */
function BotonCarrito() {
  const { totales, abrir } = useCarrito();

  return (
    <button
      type="button"
      onClick={abrir}
      aria-label={
        totales.unidades > 0
          ? `Abrir carrito, ${totales.unidades} unidades`
          : 'Abrir carrito, vacío'
      }
      className="relative rounded-marca border border-borde p-2.5 transition-colors hover:border-marca hover:text-marca-texto"
    >
      <IconoCarrito className="size-5" />
      {totales.unidades > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-acento px-1 text-[11px] font-bold text-acento-contraste">
          {totales.unidades}
        </span>
      )}
    </button>
  );
}

function Buscador({ className = '' }: { className?: string }) {
  const navegar = useNavigate();
  const [texto, setTexto] = useState('');

  return (
    <form
      role="search"
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        navegar(`/catalogo?q=${encodeURIComponent(texto.trim())}`);
      }}
    >
      <div className="flex items-center gap-2 rounded-marca border border-borde bg-superficie px-4 focus-within:border-marca-borde">
        <IconoLupa />
        <input
          type="search"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar: batería litio, panel 550W, inversor híbrido…"
          aria-label="Buscar productos"
          className="w-full bg-transparent py-3 text-sm text-texto placeholder:text-texto-suave focus:outline-none"
        />
        <button
          type="submit"
          className="btn btn-sm btn-primario shrink-0"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}

/** Mega-menú con el árbol completo de categorías, en columnas. */
function MegaMenuProductos() {
  const { datos } = useCatalogo();
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  const arbol = useMemo(
    () => (datos ? construirArbol(datos.categorias) : []),
    [datos],
  );

  // Se cierra al hacer clic fuera o con Escape: sin esto el panel queda
  // colgado tapando la página al navegar con teclado.
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    };
    const escape = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', fuera);
      document.removeEventListener('keydown', escape);
    };
  }, [abierto]);

  return (
    <div ref={contenedor} className="relative" onMouseLeave={() => setAbierto(false)}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        onMouseEnter={() => setAbierto(true)}
        aria-expanded={abierto}
        className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
          abierto ? 'bg-marca text-marca-contraste' : 'text-texto hover:text-marca-texto'
        }`}
      >
        <IconoGrilla />
        Productos
        <span className={`text-[10px] transition-transform ${abierto ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {abierto && (
        <div className="absolute left-0 top-full z-50 w-[min(64rem,90vw)] rounded-b-marca-lg border border-t-0 border-borde bg-fondo p-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4">
            {arbol.map((raiz) => (
              <ColumnaCategoria key={raiz.slug} nodo={raiz} onNavegar={() => setAbierto(false)} />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-borde-suave pt-4">
            <p className="text-sm text-texto-suave">
              {datos?.productos.length ?? 0} productos en {datos?.categorias.length ?? 0} categorías
            </p>
            <Link
              to="/catalogo"
              onClick={() => setAbierto(false)}
              className="text-sm font-semibold text-marca-texto hover:text-marca-fuerte"
            >
              Ver todo el catálogo →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function ColumnaCategoria({
  nodo,
  onNavegar,
}: {
  nodo: NodoCategoria;
  onNavegar: () => void;
}) {
  return (
    <div>
      <Link
        to={`/catalogo?categoria=${nodo.slug}`}
        onClick={onNavegar}
        className="block text-sm font-bold text-texto transition-colors hover:text-marca-texto"
      >
        {nodo.nombre}
        <span className="ml-2 text-xs font-normal text-texto-suave">{nodo.total}</span>
      </Link>
      {nodo.hijos.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {nodo.hijos.slice(0, 6).map((h) => (
            <li key={h.slug}>
              <Link
                to={`/catalogo?categoria=${h.slug}`}
                onClick={onNavegar}
                className="text-sm text-texto-medio transition-colors hover:text-marca-texto"
              >
                {h.nombre}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MenuMovil({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const { datos } = useCatalogo();
  const arbol = useMemo(
    () => (datos ? construirArbol(datos.categorias) : []),
    [datos],
  );

  // El scroll del fondo se congela mientras el panel está abierto.
  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onCerrar}
        aria-hidden="true"
      />
      <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-fondo">
        <div className="flex items-center justify-between border-b border-borde-suave px-4 py-3">
          <Logo className="h-11" />
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar menú"
            className="rounded-marca border border-borde px-3 py-2 text-sm"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {NAV.map((i) => (
              <li key={i.a}>
                <Link
                  to={i.a}
                  onClick={onCerrar}
                  className="block rounded-marca px-3 py-2.5 font-semibold text-texto"
                >
                  {i.texto}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-texto-suave">
            Categorías
          </p>
          <ul className="mt-2 space-y-1">
            {arbol.map((c) => (
              <li key={c.slug}>
                <Link
                  to={`/catalogo?categoria=${c.slug}`}
                  onClick={onCerrar}
                  className="flex items-center justify-between rounded-marca px-3 py-2.5 text-sm text-texto-medio"
                >
                  {c.nombre}
                  <span className="text-xs text-texto-suave">{c.total}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-borde-suave p-4">
          <a
            href={`https://wa.me/${site.contacto.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-solar w-full"
          >
            Asesoría gratis por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function SelectorSegmento({
  valor,
  onCambiar,
}: {
  valor: Segmento;
  onCambiar: (s: Segmento) => void;
}) {
  const opciones: { id: Segmento; texto: string }[] = [
    { id: 'minorista', texto: 'Hogar' },
    { id: 'mayorista', texto: 'Empresa' },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Tipo de cliente"
      className="flex rounded-marca border border-borde bg-superficie p-0.5"
    >
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={valor === o.id}
          onClick={() => onCambiar(o.id)}
          className={`rounded-[calc(var(--radio)-2px)] px-3 py-1.5 text-xs font-semibold transition-colors ${
            valor === o.id
              ? 'bg-marca text-marca-contraste'
              : 'text-texto-suave hover:text-texto-medio'
          }`}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}

const IconoLupa = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 shrink-0 text-texto-suave">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
  </svg>
);

const IconoGrilla = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const IconoMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" strokeLinecap="round">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
