import { useState } from 'react';
import logoPng from '../assets/marca/climazoe-logo.png';
import logoWebp from '../assets/marca/climazoe-logo.webp';
import logoWebpSm from '../assets/marca/climazoe-logo-sm.webp';

/**
 * Logo de Clima Zoe.
 *
 * Los archivos se IMPORTAN en vez de referenciarse por ruta fija.
 *
 * La razón no es de estilo: el logo cambió una vez y los navegadores que ya
 * habían visitado el sitio siguieron mostrando el anterior, porque el archivo
 * conservaba el nombre y la cabecera de caché lo daba por bueno durante una
 * semana. Importándolo, Vite le pone un hash de contenido al nombre; cuando
 * el archivo cambia, cambia la URL, y el caché deja de ser un problema.
 *
 * Se sirve en WebP —43 KB contra 124 KB del PNG— con el PNG como respaldo.
 * Si algo falla, cae a un wordmark tipográfico para no dejar un hueco.
 */

interface Props {
  className?: string;
  /** El header usa la versión chica; el footer y las piezas grandes, la otra. */
  tamano?: 'sm' | 'lg';
}

export default function Logo({ className = 'h-11', tamano = 'sm' }: Props) {
  const [falló, setFalló] = useState(false);

  if (falló) {
    return (
      <span
        className={`inline-flex items-baseline gap-1.5 font-titulo text-2xl font-bold tracking-tight ${className}`}
      >
        <span className="text-texto">CLIMA</span>
        <span className="text-marca-texto">ZOE</span>
      </span>
    );
  }

  return (
    <picture>
      <source srcSet={tamano === 'sm' ? logoWebpSm : logoWebp} type="image/webp" />
      <img
        src={logoPng}
        alt="Clima Zoe — Energía Solar"
        className={`w-auto object-contain ${className}`}
        onError={() => setFalló(true)}
      />
    </picture>
  );
}
