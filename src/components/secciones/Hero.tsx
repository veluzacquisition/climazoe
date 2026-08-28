import { Link } from 'react-router-dom';
import { site } from '../../lib/site.config';
import { MEDIA_HERO, imagen, imagenSrcSet } from '../../lib/media';

/**
 * Hero en dos columnas: mensaje a la izquierda, pieza de marca a la derecha.
 *
 * La imagen nueva NO es una fotografía de fondo: es una composición cerrada
 * que ya trae el lettering "Clima Zoe". Eso descarta el tratamiento anterior
 * —foto a sangre bajo un degradado blanco— por dos razones:
 *
 *   · Lavarla al 30% para poder leer texto encima destruiría el globo y
 *     borraría su propia tipografía.
 *   · El titular caería justo sobre las letras de la imagen. Dos textos
 *     peleando en el mismo sitio.
 *
 * Partida en dos, la pieza se ve a plena fuerza y el mensaje tiene su propio
 * aire. De paso el bloque gana el dinamismo que pedía el dueño: dos pesos
 * distintos en la misma fila se leen mejor que un centrado simétrico.
 *
 * El fondo es un degradado azul claro que arranca en blanco puro arriba, así
 * que la costura con el encabezado —también blanco— sigue sin verse.
 */

const MEDIA = {
  id: MEDIA_HERO.marcaGlobo,
  alt: 'La Tierra iluminada por el sol junto al logotipo de Clima Zoe',
};

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Fondo: blanco arriba para fundirse con el encabezado, azul muy
          diluido hacia abajo para que la primera pantalla no sea un folio en
          blanco. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[linear-gradient(175deg,#ffffff_0%,#f2f7fe_38%,#e3eefd_100%)]"
      />
      <span
        aria-hidden="true"
        className="resplandor resplandor-apoyo -z-10 -left-24 top-1/4 size-[28rem]"
      />
      <span
        aria-hidden="true"
        className="resplandor resplandor-marca -z-10 -right-16 bottom-0 size-80"
      />

      <div className="contenedor relative grid items-center gap-10 py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
        {/* --- Mensaje ----------------------------------------------------- */}
        <div className="text-center lg:text-left">
          <p className="chip entra-hero border border-marca-borde bg-marca-tenue text-marca-texto">
            <span className="size-1.5 rounded-full bg-marca" />
            Proyectos de energía solar
          </p>

          <h1
            className="entra-hero mt-6 text-[2.1rem] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[2.75rem] lg:text-[3.25rem]"
            style={{ '--retraso': '80ms' } as React.CSSProperties}
          >
            Soluciones de <span className="text-apoyo-texto">energía solar</span> para
            hogar, empresas e industria
          </h1>

          <p
            className="entra-hero mt-6 max-w-xl text-lg leading-relaxed text-texto-medio lg:text-xl"
            style={{ '--retraso': '160ms' } as React.CSSProperties}
          >
            Construimos proyectos de energía fotovoltaica a su alcance y a la
            medida.
          </p>

          <div
            className="entra-hero mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
            style={{ '--retraso': '240ms' } as React.CSSProperties}
          >
            <Link to="/catalogo" className="btn btn-xl btn-primario">
              Explorar
            </Link>
            <a
              href={`https://wa.me/${site.contacto.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-xl btn-solar"
            >
              <IconoWhatsApp />
              Asesoría gratis
            </a>
          </div>

          {/* La calculadora no cabe en la barra de navegación; esta es su
              puerta de entrada. Es una herramienta, no una sección. */}
          <Link
            to="/calculadora"
            className="entra-hero group mt-7 inline-flex items-center gap-2 text-sm font-bold text-apoyo-texto transition-colors hover:text-apoyo-fuerte"
            style={{ '--retraso': '320ms' } as React.CSSProperties}
          >
            <IconoCalculadora />
            Calcule cuánto ahorraría con paneles
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            >
              →
            </span>
          </Link>
        </div>

        {/* --- Pieza de marca ---------------------------------------------- */}
        <div
          className="entra-hero relative"
          style={{ '--retraso': '120ms' } as React.CSSProperties}
        >
          {/* Halo detrás del marco: el azul de la imagen y el del fondo son
              parecidos, y sin este respiro el recuadro se pierde. */}
          <span
            aria-hidden="true"
            className="absolute -inset-6 -z-10 rounded-[2rem] bg-apoyo/10 blur-2xl"
          />
          <img
            src={imagen(MEDIA.id, 1200)}
            srcSet={imagenSrcSet(MEDIA.id)}
            sizes="(min-width: 1024px) 48vw, 100vw"
            alt={MEDIA.alt}
            // Es el elemento más grande de la primera pantalla.
            fetchPriority="high"
            decoding="sync"
            width={1672}
            height={941}
            className="w-full rounded-marca-lg sombra-elevada"
          />
        </div>
      </div>
    </section>
  );
}

function IconoWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.43 12.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.08-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
    </svg>
  );
}

function IconoCalculadora() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
      <path d="M8 6.5h8M8 11h.01M12 11h.01M16 11h.01M8 14.5h.01M12 14.5h.01M16 14.5h.01M8 18h.01M12 18h4" />
    </svg>
  );
}
