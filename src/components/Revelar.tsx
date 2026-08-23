import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Revela a sus hijos en cascada cuando el bloque entra en pantalla.
 *
 * Envuelve una rejilla; cada hijo directo recibe su propio `--retraso` y al
 * cruzar el umbral se le añade `.aparecer-listo`. Es el efecto de entrada del
 * sitio de referencia, hecho con IntersectionObserver en vez de una librería
 * de scroll: son ~40 líneas y cero peso en el bundle.
 *
 * Lo importante es CUÁNDO se oculta, no cuándo se muestra. El contenido nace
 * visible y sólo se esconde si, al montar, está de verdad por debajo del
 * pliegue. Así:
 *
 *   · si el JS falla o no llega a correr, no hay nada invisible;
 *   · lo que ya se ve al cargar no parpadea esperando al observador;
 *   · un rastreador que no hace scroll igual lee todo el texto.
 *
 * La alternativa —ocultar todo desde el CSS y confiar en que el observador
 * dispare— deja media página en opacidad 0 cuando algo sale mal.
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

type Estado = 'visible' | 'oculto' | 'entrando';

export default function Revelar({
  children,
  className = '',
  paso = 45,
  maximo = 400,
  como: Tag = 'div',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<Estado>('visible');

  useLayoutEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Se mide antes de pintar. Si el bloque ya asoma, la cascada arranca de
    // una: es la rejilla del catálogo, y saltarse la animación ahí sería
    // perder el efecto justo donde más se nota.
    const caja = nodo.getBoundingClientRect();
    if (caja.top < window.innerHeight - 48) {
      setEstado('entrando');
      return;
    }

    setEstado('oculto');

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        setEstado('entrando');
        observador.disconnect();
      },
      // Umbral 0, NO una fracción del bloque: una rejilla de 24 productos en
      // una sola columna mide varias pantallas de alto, y pedirle un 12%
      // visible significa que en celular no se dispara nunca.
      { threshold: 0, rootMargin: '0px 0px -48px 0px' },
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  const clase =
    estado === 'oculto' ? 'aparecer' : estado === 'entrando' ? 'aparecer-listo' : '';

  const hijos = Array.isArray(children) ? children : [children];

  return (
    <Tag ref={ref as never} className={className}>
      {hijos.flat().map((hijo, i) =>
        hijo == null || typeof hijo !== 'object' ? (
          hijo
        ) : (
          <div
            key={(hijo as { key?: string }).key ?? i}
            className={`h-full ${clase}`}
            style={{ '--retraso': `${Math.min(i * paso, maximo)}ms` } as React.CSSProperties}
          >
            {hijo as React.ReactNode}
          </div>
        ),
      )}
    </Tag>
  );
}
