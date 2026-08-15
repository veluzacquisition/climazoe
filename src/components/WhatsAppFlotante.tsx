import { useEffect, useState } from 'react';
import { site } from '../lib/site.config';

/**
 * Burbuja de WhatsApp fija, como la del sitio de referencia.
 *
 * Aparece después de un poco de scroll en vez de al instante: en la primera
 * pantalla el hero ya tiene su propio CTA y la burbuja sólo estorbaría.
 */
export default function WhatsAppFlotante() {
  const [visible, setVisible] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const alScroll = () => setVisible(window.scrollY > 400);
    alScroll();
    window.addEventListener('scroll', alScroll, { passive: true });
    return () => window.removeEventListener('scroll', alScroll);
  }, []);

  if (!visible) return null;

  const enlace = `https://wa.me/${site.contacto.whatsapp}?text=${encodeURIComponent(
    `Hola ${site.nombre}, quisiera asesoría sobre energía solar.`,
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {abierto && (
        <div className="w-72 overflow-hidden rounded-marca-lg border border-borde bg-superficie">
          <div className="flex items-center gap-3 bg-marca px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-marca-contraste/15">
              <IconoWhatsApp className="size-5 fill-marca-contraste" />
            </span>
            <div>
              <p className="text-sm font-bold text-marca-contraste">{site.nombre}</p>
              <p className="text-xs text-marca-contraste/80">Normalmente responde rápido</p>
            </div>
          </div>
          <div className="p-4">
            <p className="rounded-marca bg-superficie-alta px-3 py-2.5 text-sm text-texto-medio">
              ¡Hola! Cuéntenos qué quiere alimentar con energía solar y le
              decimos qué sistema le sirve.
            </p>
            <a
              href={enlace}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block rounded-marca bg-marca py-2.5 text-center text-sm font-semibold text-marca-contraste transition-colors hover:bg-marca-fuerte"
            >
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? 'Cerrar chat de WhatsApp' : 'Abrir chat de WhatsApp'}
        aria-expanded={abierto}
        className="flex size-14 items-center justify-center rounded-full bg-marca transition-transform hover:scale-105"
      >
        {abierto ? (
          <span className="text-xl font-bold text-marca-contraste">✕</span>
        ) : (
          <IconoWhatsApp className="size-7 fill-marca-contraste" />
        )}
      </button>
    </div>
  );
}

function IconoWhatsApp({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.08-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24z" />
    </svg>
  );
}
