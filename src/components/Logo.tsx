import { useState } from 'react';

/**
 * Logo de Clima Zoe.
 *
 * El PNG original trae el resplandor oscuro con transparencia real (las
 * esquinas son alpha 0), así que se funde con el fondo negro del sitio sin
 * recorte visible. Se sirve en WebP —41 KB en la versión de header contra
 * 464 KB del PNG— con el PNG como respaldo.
 *
 * Si el archivo no está, cae a un wordmark tipográfico con los colores de
 * marca, para no mostrar nunca una imagen rota.
 */

interface Props {
  className?: string;
  /** El header usa la versión chica; el footer y el hero, la grande. */
  tamano?: 'sm' | 'lg';
}

export default function Logo({ className = 'h-11', tamano = 'sm' }: Props) {
  const [falló, setFalló] = useState(false);

  if (falló) {
    return (
      <span
        className={`inline-flex items-baseline gap-1.5 font-titulo text-2xl font-extrabold tracking-tight ${className}`}
      >
        <span className="text-zoe-white">CLIMA</span>
        <span className="text-marca-texto">ZOE</span>
      </span>
    );
  }

  const webp = tamano === 'sm' ? '/brand/climazoe-logo-sm.webp' : '/brand/climazoe-logo.webp';

  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img
        src="/brand/climazoe-logo.png"
        alt="Clima Zoe — Energía Solar"
        className={`w-auto object-contain ${className}`}
        onError={() => setFalló(true)}
      />
    </picture>
  );
}
