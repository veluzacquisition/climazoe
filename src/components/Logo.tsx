import { useState } from 'react';

/**
 * Logo de Clima Zoe.
 *
 * El archivo va en `public/brand/climazoe-logo.png` (PNG con fondo
 * transparente, el que pasó Juan Felipe). Mientras no exista, cae a un
 * wordmark tipográfico con los colores de la paleta activa, para que el sitio
 * nunca muestre una imagen rota.
 */

interface Props {
  className?: string;
  /** En fondos oscuros el wordmark de respaldo invierte el color de "CLIMA". */
  variante?: 'claro' | 'oscuro';
}

export default function Logo({ className = 'h-11', variante = 'claro' }: Props) {
  const [falló, setFalló] = useState(false);

  if (falló) {
    return (
      <span
        className={`inline-flex items-baseline gap-1.5 font-titulo text-2xl font-extrabold tracking-tight ${className}`}
      >
        <span className={variante === 'oscuro' ? 'text-white' : 'text-tinta'}>CLIMA</span>
        <span className="text-marca">ZOE</span>
      </span>
    );
  }

  return (
    <img
      src="/brand/climazoe-logo.png"
      alt="Clima Zoe — Energía Solar"
      className={`w-auto object-contain ${className}`}
      onError={() => setFalló(true)}
    />
  );
}
