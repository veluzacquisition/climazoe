import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import Producto from './pages/Producto';
import Paleta from './pages/Paleta';
import Nosotros from './pages/Nosotros';
import Servicios from './pages/Servicios';
import Contacto from './pages/Contacto';
import Checkout from './pages/Checkout';
import PedidoConfirmado from './pages/PedidoConfirmado';
import { ProveedorCarrito } from './lib/carrito';
import EnConstruccion from './pages/EnConstruccion';
import { site } from './lib/site.config';
import type { Segmento } from './types/catalogo';

export default function App() {
  // El segmento vive en el App y no en cada página: cambiarlo en el header
  // debe recolorear los precios de toda la navegación, no sólo de la vista.
  const [segmento, setSegmento] = useState<Segmento>(site.segmentoPorDefecto);

  return (
    <BrowserRouter>
      <ProveedorCarrito>
      <Routes>
        <Route element={<Layout segmento={segmento} onCambiarSegmento={setSegmento} />}>
          <Route index element={<Home segmento={segmento} />} />
          <Route path="catalogo" element={<Catalogo segmento={segmento} />} />
          <Route path="producto/:slug" element={<Producto segmento={segmento} />} />
          <Route path="servicios" element={<Servicios />} />
          <Route path="nosotros" element={<Nosotros />} />
          <Route path="contacto" element={<Contacto />} />
          {/* Interna, fuera del menú: identidad visual documentada. */}
          <Route path="pedido/:codigo" element={<PedidoConfirmado />} />
          <Route path="paleta" element={<Paleta />} />
          <Route path="*" element={<EnConstruccion titulo="Página no encontrada" nota="Revisá la dirección." />} />
        </Route>

        {/* El checkout va FUERA del Layout: tiene su propia cabecera y no
            debe ofrecer salidas del flujo de compra. */}
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
      </ProveedorCarrito>
    </BrowserRouter>
  );
}
