import { useEffect, useRef, useState } from 'react';

/**
 * Revela a sus hijos en cascada cuando el bloque entra en pantalla.
 *
 * Envuelve una rejilla; cada hijo directo recibe la clase `.aparecer` y un
 * `--retraso` propio, y al cruzar el umbral se les añade `.aparecer-listo`.
 * Es el efecto de entrada del sitio de referencia, hecho con
 * IntersectionObserver en vez de una librería de scroll: son ~30 líneas y
 * cero peso en el bundle.
 *
 * Corre una sola vez: re-animar al volver a subir marea y hace que el
 * catálogo parezca inestable.
 */

interface Props {
  children: React.ReactNode;
  className?: string;
  /** Milisegundos entre una tarjeta y la siguiente. */
  paso?: number;
  /** Tope del retraso: con 24 tarjetas, un paso lineal deja la última en 1.4s. */
  maximo?: number;
  como?: 'div' | 'ul' | 'section';
}

export default function Revelar({
  children,
  className = '',
  paso = 45,
  maximo = 400,
  como: Tag = 'div',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observador.disconnect();
        }
      },
      // Umbral 0, NO una fracción del bloque. Una rejilla de 24 productos en
      // una sola columna mide varias pantallas de alto, y pedirle un 12%
      // visible significa que en celular no se dispara nunca: las tarjetas se
      // quedan en opacidad 0 y el catálogo se ve vacío. Con 0 + margen
      // inferior, arranca en cuanto la primera fila asoma, en cualquier ancho.
      { threshold: 0, rootMargin: '0px 0px -48px 0px' },
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  const hijos = Array.isArray(children) ? children : [children];

  return (
    <Tag ref={ref as never} className={className}>
      {hijos.flat().map((hijo, i) =>
        hijo == null || typeof hijo !== 'object' ? (
          hijo
        ) : (
          <div
            key={(hijo as { key?: string }).key ?? i}
            className={`h-full aparecer${visible ? ' aparecer-listo' : ''}`}
            style={{ '--retraso': `${Math.min(i * paso, maximo)}ms` } as React.CSSProperties}
          >
            {hijo as React.ReactNode}
          </div>
        ),
      )}
    </Tag>
  );
}
