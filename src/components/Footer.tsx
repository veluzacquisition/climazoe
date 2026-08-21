import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { construirArbol, useCatalogo } from '../lib/catalogo';
import { site } from '../lib/site.config';

/**
 * Footer de tienda: identidad y contacto a la izquierda, columnas de enlaces
 * al centro y suscripción a la derecha. Las categorías salen del catálogo
 * real, así que el footer se actualiza solo cuando cambia el inventario.
 */

export default function Footer() {
  const { datos } = useCatalogo();
  const categorias = useMemo(
    () => (datos ? construirArbol(datos.categorias).slice(0, 6) : []),
    [datos],
  );

  return (
    <footer className="mt-24 border-t border-borde bg-superficie">
      <div className="contenedor grid gap-10 py-16 lg:grid-cols-12">
        {/* --- Identidad y contacto -------------------------------------- */}
        <div className="lg:col-span-4">
          <Logo className="h-14" tamano="lg" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-texto-medio">
            {site.claim}. Venta e instalación de sistemas solares en toda
            Colombia.
          </p>
          <p className="mt-4 max-w-xs border-l-2 border-marca pl-3 text-sm font-semibold italic text-marca-texto">
            «{site.eslogan}»
          </p>

          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-texto-suave">
                Servicio al cliente
              </dt>
              <dd>
                <a
                  href={`tel:${site.contacto.telefono?.replace(/\s/g, '')}`}
                  className="text-lg font-bold text-marca-texto transition-colors hover:text-marca-fuerte"
                >
                  {site.contacto.telefono}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-texto-suave">Correo</dt>
              <dd>
                <a
                  href={`mailto:${site.contacto.email}`}
                  className="break-all font-semibold text-texto transition-colors hover:text-marca-texto"
                >
                  {site.contacto.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-texto-suave">Dirección</dt>
              <dd className="font-semibold text-texto">
                {site.contacto.direccion}
                <span className="block font-normal text-texto-medio">
                  {site.contacto.ciudad}
                </span>
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex gap-2">
            <RedSocial nombre="Instagram" url={site.redes.instagram} />
            <RedSocial nombre="Facebook" url={site.redes.facebook} />
            <a
              href={`https://wa.me/${site.contacto.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-marca border border-borde px-3 py-2 text-xs font-medium text-texto-medio transition-colors hover:border-marca-borde hover:text-marca-texto"
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* --- Columnas de enlaces ----------------------------------------- */}
        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-5">
          <ColumnaFooter titulo="Tienda en línea">
            {categorias.map((c) => (
              <li key={c.slug}>
                <Link
                  to={`/catalogo?categoria=${c.slug}`}
                  className="transition-colors hover:text-marca-texto"
                >
                  {c.nombre}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/catalogo" className="font-semibold text-marca-texto">
                Ver todo →
              </Link>
            </li>
          </ColumnaFooter>

          <ColumnaFooter titulo="Sobre nosotros">
            <li><Link to="/nosotros" className="transition-colors hover:text-marca-texto">Quiénes somos</Link></li>
            <li><Link to="/servicios" className="transition-colors hover:text-marca-texto">Servicios e instalación</Link></li>
            <li><Link to="/contacto" className="transition-colors hover:text-marca-texto">Contacto</Link></li>
            <li><Link to="/contacto" className="transition-colors hover:text-marca-texto">Política de privacidad</Link></li>
            <li><Link to="/contacto" className="transition-colors hover:text-marca-texto">PQRS</Link></li>
          </ColumnaFooter>
        </div>

        {/* --- Suscripción -------------------------------------------------- */}
        <div className="lg:col-span-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-texto">
            ¿Le pasamos las ofertas?
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-texto-medio">
            Déjenos su correo y le avisamos cuando entren equipos nuevos o
            bajen los precios.
          </p>
          <FormularioSuscripcion />
        </div>
      </div>

      <div className="border-t border-borde-suave">
        <div className="contenedor flex flex-col gap-2 py-5 text-xs text-texto-suave sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.nombre}® — {site.razonSocial},
            NIT {site.nit}
          </p>
          <p>Hecho en Colombia</p>
        </div>
      </div>
    </footer>
  );
}

function ColumnaFooter({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide text-texto">{titulo}</h3>
      <ul className="mt-4 space-y-2.5 text-sm text-texto-medio">{children}</ul>
    </div>
  );
}

function RedSocial({ nombre, url }: { nombre: string; url: string | null }) {
  if (!url) {
    // Sin enlace real preferimos no poner un botón muerto.
    return (
      <span
        className="cursor-help rounded-marca border border-dashed border-borde px-3 py-2 text-xs text-texto-suave"
      >
        {nombre}
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-marca border border-borde px-3 py-2 text-xs font-medium text-texto-medio transition-colors hover:border-marca-borde hover:text-marca-texto"
    >
      {nombre}
    </a>
  );
}

/**
 * La lista de correos todavía no tiene dónde guardarse, así que en vez de
 * simular un envío que se pierde, el formulario abre WhatsApp con el correo
 * escrito. Cuando exista la tabla en Supabase se cambia el submit.
 */
function FormularioSuscripcion() {
  const [correo, setCorreo] = useState('');

  return (
    <form
      className="mt-5"
      onSubmit={(e) => {
        e.preventDefault();
        const texto = encodeURIComponent(
          `Hola ${site.nombre}, quiero recibir ofertas y novedades. Mi correo es: ${correo}`,
        );
        window.open(`https://wa.me/${site.contacto.whatsapp}?text=${texto}`, '_blank');
      }}
    >
      <label className="sr-only" htmlFor="correo-newsletter">Correo electrónico</label>
      <input
        id="correo-newsletter"
        type="email"
        required
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        placeholder="su@correo.com"
        className="w-full rounded-marca border border-borde bg-fondo px-4 py-3 text-sm text-texto placeholder:text-texto-suave focus:border-marca-borde focus:outline-none"
      />
      <button
        type="submit"
        className="btn btn-primario mt-3 w-full"
      >
        Suscribirme
      </button>
    </form>
  );
}
