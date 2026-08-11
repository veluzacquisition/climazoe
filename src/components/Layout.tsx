import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WhatsAppFlotante from './WhatsAppFlotante';
import type { Segmento } from '../types/catalogo';

export default function Layout({
  segmento,
  onCambiarSegmento,
}: {
  segmento: Segmento;
  onCambiarSegmento: (s: Segmento) => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-fondo">
      <Header segmento={segmento} onCambiarSegmento={onCambiarSegmento} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFlotante />
    </div>
  );
}
