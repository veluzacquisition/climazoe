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
      <header className="sticky top-0 z-40 border-b border-borde bg-fondo/90 backdrop-blur">
        <div className="contenedor flex h-18 items-center justify-between gap-4 py-3">
          <NavLink to="/" className="shrink-0" aria-label={`${site.nombre} — inicio`}>
            <Logo className="h-11" />
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.a}
                to={item.a}
                className={({ isActive }) =>
                  `rounded-marca px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-marca-suave text-marca-fuerte'
                      : 'text-tinta-media hover:bg-fondo-alt hover:text-tinta'
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
              className="hidden rounded-marca bg-accion px-4 py-2.5 text-sm font-semibold text-accion-contraste transition-colors hover:bg-accion-fuerte sm:inline-flex"
            >
              Asesoría gratis
            </a>
          </div>
        </div>

        {/* Nav móvil */}
        <nav className="flex gap-1 overflow-x-auto border-t border-borde px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.a}
              to={item.a}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-marca px-3 py-1.5 text-sm font-medium ${
                  isActive ? 'bg-marca-suave text-marca-fuerte' : 'text-tinta-media'
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
      className="flex rounded-marca border border-borde bg-fondo-alt p-0.5"
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
              ? 'bg-fondo text-tinta shadow-sm'
              : 'text-tinta-suave hover:text-tinta-media'
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
    <footer className="mt-20 border-t border-borde bg-fondo-alt">
      <div className="contenedor grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo className="h-12" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-tinta-media">
            {site.claim}. Venta e instalación de sistemas solares.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-tinta">Catálogo</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-tinta-media">
            <li><NavLink to="/catalogo" className="hover:text-marca">Todos los productos</NavLink></li>
            <li><NavLink to="/servicios" className="hover:text-marca">Instalación</NavLink></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-tinta">Empresa</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-tinta-media">
            <li><NavLink to="/nosotros" className="hover:text-marca">Nosotros</NavLink></li>
            <li><NavLink to="/contacto" className="hover:text-marca">Contacto</NavLink></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-tinta">Contacto</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-tinta-media">
            <li className="rounded-marca bg-alerta/10 px-2.5 py-1.5 text-xs text-alerta">
              [PENDIENTE: teléfono, correo y dirección reales de Clima Zoe]
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-borde">
        <div className="contenedor flex flex-col gap-2 py-5 text-xs text-tinta-suave sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.nombre}. Todos los derechos reservados.</p>
          <p>Hecho en Colombia</p>
        </div>
      </div>
    </footer>
  );
}
