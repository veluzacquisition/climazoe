import { useEffect, useRef, useState } from 'react';
import { useCatalogo } from '../../lib/catalogo';

/**
 * Bloque de cifras, con los contadores animados del sitio de referencia.
 *
 * Ojo con el contenido: las cifras de Solphower (500 clientes, 2000 kWp, 21
 * departamentos, 210 proyectos) son SUYAS. Copiarlas sería atribuirle a Clima
 * Zoe un historial que no verificamos, así que acá sólo van números que
 * salen de datos propios —el tamaño del catálogo— y el resto queda marcado
 * como pendiente hasta que Juan Felipe pase los reales.
 */

interface Cifra {
  valor: number | null;
  sufijo?: string;
  etiqueta: string;
}

export default function Impacto() {
  const { datos } = useCatalogo();

  const cifras: Cifra[] = [
    { valor: 7, sufijo: '+', etiqueta: 'Años de experiencia' },
    { valor: datos?.productos.length ?? null, sufijo: '', etiqueta: 'Productos en catálogo' },
    { valor: datos?.categorias.length ?? null, sufijo: '', etiqueta: 'Categorías' },
    { valor: null, etiqueta: 'Proyectos instalados' },
  ];

  return (
    <section className="border-y border-borde-suave bg-superficie">
      <div className="contenedor py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Nuestro impacto</h2>
          <p className="mx-auto mt-3 max-w-xl text-texto-medio">
            Energía solar instalada y funcionando en hogares, fincas y
            negocios de todo el país.
          </p>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {cifras.map((c) => (
            <div
              key={c.etiqueta}
              className="rounded-marca-lg border border-borde-suave bg-fondo px-6 py-8 text-center"
            >
              <dt className="sr-only">{c.etiqueta}</dt>
              <dd>
                {c.valor === null ? (
                  <span
                    className="block text-2xl font-bold text-acento-texto"
                    title="[PENDIENTE: cifra real de Clima Zoe]"
                  >
                    —
                  </span>
                ) : (
                  <Contador hasta={c.valor} sufijo={c.sufijo} />
                )}
                <span className="mt-2 block text-sm text-texto-medio">{c.etiqueta}</span>
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 text-center text-xs text-texto-suave">
          [PENDIENTE: número real de proyectos, clientes y kWp instalados por Clima Zoe]
        </p>
      </div>
    </section>
  );
}

/** Cuenta desde 0 cuando el bloque entra en pantalla, una sola vez. */
function Contador({ hasta, sufijo = '' }: { hasta: number; sufijo?: string }) {
  const [valor, setValor] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const yaCorrio = useRef(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    // Respetar a quien pidió menos movimiento: se muestra el número final.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValor(hasta);
      return;
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting || yaCorrio.current) return;
        yaCorrio.current = true;

        const duracion = 1200;
        const inicio = performance.now();
        const paso = (ahora: number) => {
          const t = Math.min((ahora - inicio) / duracion, 1);
          // easeOutCubic: arranca rápido y frena, se lee mejor que lineal.
          setValor(Math.round(hasta * (1 - (1 - t) ** 3)));
          if (t < 1) requestAnimationFrame(paso);
        };
        requestAnimationFrame(paso);
      },
      { threshold: 0.4 },
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, [hasta]);

  return (
    <span ref={ref} className="block text-4xl font-bold text-marca sm:text-5xl">
      {valor.toLocaleString('es-CO')}
      {sufijo}
    </span>
  );
}
