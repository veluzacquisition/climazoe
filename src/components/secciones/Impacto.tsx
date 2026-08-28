import { useEffect, useRef, useState } from 'react';
import { useCatalogo } from '../../lib/catalogo';
import Seccion from '../Seccion';
import Pendiente from '../Pendiente';
import { ANIO_INICIO_COMERCIAL, aniosDeTrayectoria } from '../../lib/site.config';

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

  // Las marcas se cuentan sobre el catálogo, no a mano.
  const marcas = datos
    ? new Set(datos.productos.map((p) => p.marca).filter(Boolean)).size || null
    : null;

  // Sólo cifras que salen de datos propios y verificables. "Proyectos
  // instalados" estaba acá con un guion porque no lo sabemos: en desarrollo se
  // veía como pendiente, pero en producción quedaba una tarjeta con un "—"
  // que parece un error de carga. Vuelve cuando llegue el número real.
  const cifras: Cifra[] = [
    // Ojo: acá se cuenta desde la actividad comercial, no desde la
    // constitución, porque la etiqueta habla de VENDER.
    { valor: aniosDeTrayectoria(ANIO_INICIO_COMERCIAL), sufijo: '', etiqueta: 'Años vendiendo energía solar' },
    { valor: datos?.productos.length ?? null, sufijo: '', etiqueta: 'Productos en catálogo' },
    { valor: marcas, sufijo: '', etiqueta: 'Marcas representadas' },
    { valor: datos?.categorias.length ?? null, sufijo: '', etiqueta: 'Líneas de producto' },
  ];

  // Bloque oscuro con cifras verdes: es el patrón de "control energético"
  // —negro de fondo, número en verde— que usan los referentes del sector.
  return (
    <Seccion tono="oscuro" espaciado="normal">
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-tight sm:text-3xl">
          Nuestro impacto
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-texto-medio">
          Energía solar instalada y funcionando en hogares, fincas y negocios,
          desde {ANIO_INICIO_COMERCIAL}.
        </p>
      </div>

      <dl className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {cifras.map((c) => (
          <div
            key={c.etiqueta}
            className="group rounded-marca-lg border border-borde bg-superficie px-6 py-9 text-center transition-all duration-300 hover:-translate-y-1 hover:border-marca-borde motion-reduce:transform-none"
          >
            <dt className="sr-only">{c.etiqueta}</dt>
            <dd>
              {c.valor === null ? (
                <span
                  className="block text-4xl font-bold text-acento-texto sm:text-5xl"
                >
                  —
                </span>
              ) : (
                <Contador hasta={c.valor} sufijo={c.sufijo} />
              )}
              <span className="mt-3 block text-sm text-texto-medio">{c.etiqueta}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mx-auto mt-8 max-w-xl">
        <Pendiente nota="Proyectos instalados, clientes y kWp en operación: faltan los números reales." />
      </div>
    </Seccion>
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
    <span ref={ref} className="block text-5xl font-bold tracking-tight text-marca-texto sm:text-6xl">
      {valor.toLocaleString('es-CO')}
      {sufijo}
    </span>
  );
}
