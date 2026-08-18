/**
 * Marcador de contenido que falta.
 *
 * NO se renderiza en producción. Antes estas cajas salían en el sitio
 * publicado, así que un cliente veía "[PENDIENTE: contenido real de Clima
 * Zoe]" en la home — un recordatorio interno convertido en cartel público.
 *
 * Con esto Juan Felipe sigue viendo qué falta mientras trabaja en local, y el
 * visitante ve la sección terminada o no la ve en absoluto.
 */
export default function Pendiente({ nota }: { nota: string }) {
  if (!import.meta.env.DEV) return null;

  return (
    <div className="rounded-marca border-2 border-dashed border-acento/50 bg-acento-tenue px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-acento-texto">
        Sólo visible en desarrollo — falta contenido
      </p>
      <p className="mt-1 text-sm text-texto-medio">{nota}</p>
    </div>
  );
}
