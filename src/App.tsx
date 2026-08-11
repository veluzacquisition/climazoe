import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import Producto from './pages/Producto';
import Paleta from './pages/Paleta';
import EnConstruccion from './pages/EnConstruccion';
import { site } from './lib/site.config';
import type { Segmento } from './types/catalogo';

export default function App() {
  // El segmento vive en el App y no en cada página: cambiarlo en el header
  // debe recolorear los precios de toda la navegación, no sólo de la vista.
  const [segmento, setSegmento] = useState<Segmento>(site.segmentoPorDefecto);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout segmento={segmento} onCambiarSegmento={setSegmento} />}>
          <Route index element={<Home segmento={segmento} />} />
          <Route path="catalogo" element={<Catalogo segmento={segmento} />} />
          <Route path="producto/:slug" element={<Producto segmento={segmento} />} />
          <Route
            path="servicios"
            element={<EnConstruccion titulo="Servicios" nota="[PENDIENTE: contenido real de Clima Zoe] — venta e instalación." />}
          />
          <Route
            path="nosotros"
            element={<EnConstruccion titulo="Nosotros" nota="[PENDIENTE: contenido real de Clima Zoe] — historia, proyectos y fotos propias." />}
          />
          <Route
            path="contacto"
            element={<EnConstruccion titulo="Contacto" nota="[PENDIENTE: teléfono, WhatsApp, correo y dirección reales]." />}
          />
          {/* Interna, fuera del menú: identidad visual documentada. */}
          <Route path="paleta" element={<Paleta />} />
          <Route path="*" element={<EnConstruccion titulo="Página no encontrada" nota="Revisá la dirección." />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
