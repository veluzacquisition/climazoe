import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { construirArbol, useCatalogo } from '../lib/catalogo';
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

// Los cinco enlaces que pidió el dueño, en su orden. La calculadora no va
// acá: vive como llamada a la acción en la portada y en el pie, para no
// volver a desbordar la fila.
const NAV = [
  { a: '/', texto: 'Inicio' },
  { a: '/nosotros', texto: 'Nosotros' },
  // Lleva pestañita desplegable con las categorías, como la "TIENDA SOLAR"
  // de ecozaque: desde cualquier página se puede saltar a una línea concreta
  // sin pasar antes por la portada del catálogo.
  { a: '/catalogo', texto: 'Tienda Solar', desplegable: true },
  { a: '/servicios', texto: 'Servicios' },
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
  const [desplazado, setDesplazado] = useState(false);

  useEffect(() => {
    const alDesplazar = () => setDesplazado(window.scrollY > 8);
    alDesplazar();
    window.addEventListener('scroll', alDesplazar, { passive: true });
    return () => window.removeEventListener('scroll', alDesplazar);
  }, []);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);

  return (
    <header
      className={`sticky top-0 z-50 bg-fondo/95 backdrop-blur transition-[border-color] duration-300 ${
        // Sin línea mientras se está arriba del todo: el hero empieza en
        // blanco puro y la idea es que barra y sección se lean como una sola
        // pieza. La línea aparece al bajar, que es cuando hace falta separar
        // el encabezado del contenido que pasa por debajo.
        desplazado ? 'border-b border-borde-suave' : 'border-b border-transparent'
      }`}
    >
      {/* Una sola fila, como la referencia: logo, navegación en píldora
          centrada y acciones a la derecha. El buscador pasa a un icono que
          abre un panel — con dos filas el encabezado pesaba el doble que el
          del sitio que se tomó como modelo, y arriba es donde más se nota. */}
      <div className="contenedor flex h-24 items-center justify-between gap-4">
        <Link to="/" className="shrink-0" aria-label={`${site.nombre} — inicio`}>
          <Logo className="h-14 md:h-16" />
        </Link>

        <nav className="relative hidden items-center gap-1 rounded-marca-pildora border border-borde bg-superficie p-1 lg:flex">
          {NAV.map((item) =>
            item.desplegable ? (
              <PestanaTienda key={item.a} texto={item.texto} a={item.a} />
            ) : (
              <NavLink
                key={item.a}
                to={item.a}
                end={item.a === '/'}
                className={({ isActive }) =>
                  `rounded-marca-pildora px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-fondo text-texto shadow-panel'
                      : 'text-texto-medio hover:text-texto'
                  }`
                }
              >
                {item.texto}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBuscadorAbierto(true)}
            aria-label="Buscar productos"
            className="flex size-10 items-center justify-center rounded-marca-pildora border border-borde text-texto-medio transition-colors hover:border-marca hover:text-marca-texto"
          >
            <IconoLupa />
          </button>

          {/* Debajo de xl vive dentro del menú: acá no cabe junto a la
              navegación completa. */}
          <div className="hidden lg:block">
            <SelectorSegmento valor={segmento} onCambiar={onCambiarSegmento} />
          </div>

          <BotonCarrito />

          <a
            href={`https://wa.me/${site.contacto.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-solar hidden md:inline-flex"
          >
            Contacto
          </a>

          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
            className="flex size-10 items-center justify-center rounded-marca-pildora border border-borde lg:hidden"
          >
            <IconoMenu />
          </button>
        </div>
      </div>

      {buscadorAbierto && <PanelBuscador onCerrar={() => setBuscadorAbierto(false)} />}
      <MenuMovil
        abierto={menuAbierto}
        onCerrar={() => setMenuAbierto(false)}
        segmento={segmento}
        onCambiarSegmento={onCambiarSegmento}
      />
    </header>
  );
}

/** Panel de búsqueda a pantalla completa, que reemplaza la fila del buscador. */
/**
 * "Tienda Solar" con su pestañita de categorías.
 *
 * Es el patrón de ecozaque: la entrada de tienda del menú despliega las
 * líneas de producto, así que desde cualquier página se salta directo a
 * "Baterías" sin pasar por la portada del catálogo.
 *
 * Se abre con clic y no con hover: en un menú que también es enlace, el
 * hover dispara el panel cuando uno sólo iba de paso al siguiente elemento.
 * Cierra con Escape, con clic fuera y al navegar.
 */
function PestanaTienda({ texto, a }: { texto: string; a: string }) {
  const { datos } = useCatalogo();
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  const raices = useMemo(
    () => (datos ? construirArbol(datos.categorias) : []),
    [datos],
  );

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false);
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
    <div ref={caja} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="true"
        className={`inline-flex items-center gap-1.5 rounded-marca-pildora px-4 py-2 text-sm font-semibold transition-colors ${
          abierto ? 'bg-fondo text-texto shadow-panel' : 'text-texto-medio hover:text-texto'
        }`}
      >
        {texto}
        <span
          aria-hidden="true"
          className={`text-[10px] transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>

      {abierto && (
        <div className="absolute left-1/2 top-full z-50 mt-3 w-[34rem] -translate-x-1/2 rounded-marca-lg border border-borde bg-fondo p-4 sombra-elevada">
          <ul className="grid grid-cols-2 gap-1">
            {raices.map((c) => (
              <li key={c.slug}>
                <Link
                  to={`/catalogo?categoria=${c.slug}`}
                  onClick={() => setAbierto(false)}
                  className="flex items-center justify-between gap-3 rounded-marca px-3 py-2 text-sm font-semibold text-texto-medio transition-colors hover:bg-superficie hover:text-apoyo"
                >
                  <span className="truncate">{c.nombre}</span>
                  <span className="shrink-0 text-xs tabular-nums text-texto-suave">
                    {c.total}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to={a}
            onClick={() => setAbierto(false)}
            className="mt-3 flex items-center justify-center gap-1.5 border-t border-borde-suave pt-3 text-sm font-bold text-apoyo transition-colors hover:text-apoyo-fuerte"
          >
            Ver todo el catálogo
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </div>
  );
}

function PanelBuscador({ onCerrar }: { onCerrar: () => void }) {
  useEffect(() => {
    const escape = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [onCerrar]);

  return (
    <div className="absolute inset-x-0 top-full border-b border-borde bg-fondo shadow-panel">
      <div className="contenedor flex items-center gap-3 py-4">
        <Buscador className="flex-1" alEnviar={onCerrar} autoFoco />
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar búsqueda"
          className="shrink-0 text-sm font-semibold text-texto-medio hover:text-texto"
        >
          Cerrar
        </button>
      </div>
    </div>
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

function Buscador({
  className = '',
  alEnviar,
  autoFoco = false,
}: {
  className?: string;
  alEnviar?: () => void;
  autoFoco?: boolean;
}) {
  const navegar = useNavigate();
  const [texto, setTexto] = useState('');

  return (
    <form
      role="search"
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        navegar(`/catalogo?q=${encodeURIComponent(texto.trim())}`);
        alEnviar?.();
      }}
    >
      <div className="flex items-center gap-2 rounded-marca border border-borde bg-superficie px-4 focus-within:border-marca-borde">
        <IconoLupa />
        <input
          type="search"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          autoFocus={autoFoco}
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


function MenuMovil({
  abierto,
  onCerrar,
  segmento,
  onCambiarSegmento,
}: {
  abierto: boolean;
  onCerrar: () => void;
  segmento: Segmento;
  onCambiarSegmento: (s: Segmento) => void;
}) {
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
    <div className="fixed inset-0 z-50 lg:hidden">
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
          <div className="mb-5 rounded-marca border border-borde bg-superficie p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texto-suave">
              Estoy comprando como
            </p>
            <SelectorSegmento valor={segmento} onCambiar={onCambiarSegmento} />
          </div>

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

const IconoMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" strokeLinecap="round">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
