import { site } from '../lib/site.config';

/**
 * Botón para agendar una asesoría en Calendly.
 *
 * El enlace todavía no existe —falta que se cree el evento— y en vez de
 * dejar el botón fuera hasta entonces, se muestra deshabilitado con la razón
 * a la vista. Dos motivos: el hueco no se olvida, y el día que llegue la URL
 * se pega en `site.calendly` y el botón queda vivo en todas las páginas
 * donde aparezca, sin tocar ningún componente.
 *
 * Abre en pestaña nueva en vez de incrustar el widget de Calendly: el
 * incrustado carga scripts de terceros que ven a todos los visitantes, y no
 * hay razón para pagar ese peaje en la página completa.
 */

interface Props {
  /** Clases del botón. Por defecto, secundario de contorno. */
  className?: string;
  texto?: string;
}

export default function BotonAgendar({
  className = 'btn btn-contorno',
  texto = 'Agendar una asesoría',
}: Props) {
  if (!site.calendly) {
    return (
      <span className="inline-flex flex-col gap-1">
        <button type="button" disabled className={`${className} cursor-not-allowed opacity-50`}>
          <IconoCalendario />
          {texto}
        </button>
        <span className="text-xs text-texto-suave">Agenda en línea, disponible pronto</span>
      </span>
    );
  }

  return (
    <a
      href={site.calendly}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <IconoCalendario />
      {texto}
    </a>
  );
}

function IconoCalendario() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-[18px]"
    >
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M8.5 14.5h2M13.5 14.5h2M8.5 17.5h2M13.5 17.5h2" />
    </svg>
  );
}
