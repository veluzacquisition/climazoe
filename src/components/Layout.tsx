import { NavLink, Outlet } from 'react-router-dom';
import Logo from './Logo';
import { site } from '../lib/site.config';
import type { Segmento } from '../types/catalogo';

interface Props {
  segmento: Segmento;
  onCambiarSegmento: (s: Segmento) => void;
}

const NAV = [
  { a: '/catalogo', texto: 'Catálogo' },
  { a: '/servicios', texto: 'Servicios' },
  { a: '/nosotros', texto: 'Nosotros' },
  { a: '/contacto', texto: 'Contacto' },
];

export default function Layout({ segmento, onCambiarSegmento }: Props) {
  return (
    <div className="flex min-h-dvh flex-col bg-fondo">
      <header className="sticky top-0 z-40 border-b border-borde-suave bg-fondo/85 backdrop-blur-md">
        {/* El logo es un lockup apilado (CLIMA / ZOE / ENERGÍA SOLAR), así que
            necesita altura para que la bajada se lea: por debajo de ~60px se
            vuelve una mancha. De ahí el header alto. */}
        <div className="contenedor flex h-20 items-center justify-between gap-4 md:h-24">
          <NavLink to="/" className="shrink-0" aria-label={`${site.nombre} — inicio`}>
            <Logo className="h-13 md:h-16" />
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.a}
                to={item.a}
                className={({ isActive }) =>
                  `rounded-marca px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-marca-tenue text-marca'
                      : 'text-texto-medio hover:bg-superficie hover:text-texto'
                  }`
                }
              >
                {item.texto}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <SelectorSegmento valor={segmento} onCambiar={onCambiarSegmento} />
            <a
              href={`https://wa.me/${site.contacto.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-marca bg-marca px-4 py-2.5 text-sm font-semibold text-marca-contraste transition-colors hover:bg-marca-fuerte sm:inline-flex"
            >
              Asesoría gratis
            </a>
          </div>
        </div>

        {/* Nav móvil */}
        <nav className="flex gap-1 overflow-x-auto border-t border-borde-suave px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.a}
              to={item.a}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-marca px-3 py-1.5 text-sm font-medium ${
                  isActive ? 'bg-marca-tenue text-marca' : 'text-texto-medio'
                }`
              }
            >
              {item.texto}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

/**
 * Mayorista vs. minorista. Cambia qué precio se muestra en todo el catálogo,
 * no qué productos se ven.
 */
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

function Footer() {
  return (
    <footer className="mt-24 border-t border-borde-suave">
      <div className="contenedor grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo className="h-14" tamano="lg" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-texto-medio">
            {site.claim}. Venta e instalación de sistemas solares.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-texto">Catálogo</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-texto-medio">
            <li><NavLink to="/catalogo" className="transition-colors hover:text-marca">Todos los productos</NavLink></li>
            <li><NavLink to="/servicios" className="transition-colors hover:text-marca">Instalación</NavLink></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-texto">Empresa</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-texto-medio">
            <li><NavLink to="/nosotros" className="transition-colors hover:text-marca">Nosotros</NavLink></li>
            <li><NavLink to="/contacto" className="transition-colors hover:text-marca">Contacto</NavLink></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-texto">Contacto</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li className="rounded-marca border border-acento/30 bg-acento-tenue px-3 py-2 text-xs text-acento-texto">
              [PENDIENTE: teléfono, correo y dirección reales de Clima Zoe]
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-borde-suave">
        <div className="contenedor flex flex-col gap-2 py-5 text-xs text-texto-suave sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.nombre}. Todos los derechos reservados.</p>
          <p>Hecho en Colombia</p>
        </div>
      </div>
    </footer>
  );
}
