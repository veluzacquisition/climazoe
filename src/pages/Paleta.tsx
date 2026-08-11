import { useEffect, useState } from 'react';
import Logo from '../components/Logo';

/**
 * Página interna para decidir la identidad visual con Don Carlos.
 *
 * No va en el menú: se entra por /paleta. Muestra las tres direcciones de
 * src/index.css aplicadas a piezas reales del sitio (hero, tarjeta de
 * producto, botones), porque una paleta se juzga sobre el producto armado, no
 * sobre cuadritos de color sueltos.
 *
 * Cuando esté elegida: fijar `paletaActiva` en site.config.ts, dejar sus
 * valores en :root y borrar esta página.
 */

type Direccion = 'a' | 'b' | 'c';

const DIRECCIONES: {
  id: Direccion;
  nombre: string;
  resumen: string;
  cuando: string;
}[] = [
  {
    id: 'a',
    nombre: 'Solar Nítido',
    resumen:
      'El verde del logo como color de marca sobre neutros fríos casi negros, con el naranja reservado sólo para los botones de acción.',
    cuando:
      'La apuesta más segura: se lee moderna y técnica, y es la que menos se parece al estilo caricatura de hoy sin renunciar al verde que ya reconoce la gente.',
  },
  {
    id: 'b',
    nombre: 'Campo y Sol',
    resumen:
      'Verde más profundo, amarillo dorado y neutros cálidos, con fondos color hueso en vez de blanco puro.',
    cuando:
      'Si el cliente principal es rural o agro —bombas de agua, neveras solares, fincas sin red eléctrica—, esta habla su idioma.',
  },
  {
    id: 'c',
    nombre: 'Azul Ingeniería',
    resumen:
      'El azul del globo del logo pasa a primario y el verde queda como acento de energía.',
    cuando:
      'La más sobria y corporativa. Buena si el foco se va a proyectos grandes y licitaciones, pero se aleja del verde con el que ya identifican a Clima Zoe.',
  },
];

export default function Paleta() {
  const [activa, setActiva] = useState<Direccion>('a');

  useEffect(() => {
    document.documentElement.setAttribute('data-paleta', activa);
    return () => document.documentElement.removeAttribute('data-paleta');
  }, [activa]);

  const dir = DIRECCIONES.find((d) => d.id === activa)!;

  return (
    <div className="contenedor py-12">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-marca">
          Interno — decisión de marca
        </p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Direcciones visuales</h1>
        <p className="mt-4 text-lg leading-relaxed text-tinta-media">
          Tres caminos partiendo de los colores del logo actual. Cambiá entre
          ellos y mirá cómo se ve el sitio armado, no sólo los colores sueltos.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-2">
        {DIRECCIONES.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setActiva(d.id)}
            aria-pressed={activa === d.id}
            className={`rounded-marca border px-4 py-2.5 text-sm font-semibold transition-colors ${
              activa === d.id
                ? 'border-marca bg-marca text-marca-contraste'
                : 'border-borde bg-fondo text-tinta-media hover:border-tinta-suave'
            }`}
          >
            {d.nombre}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-marca-lg border border-borde bg-fondo-alt p-6">
        <h2 className="text-xl font-bold">{dir.nombre}</h2>
        <p className="mt-2 max-w-3xl text-tinta-media">{dir.resumen}</p>
        <p className="mt-3 max-w-3xl text-sm text-tinta-media">
          <strong className="text-tinta">Cuándo elegirla:</strong> {dir.cuando}
        </p>
        <Muestrario />
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Vista previa</h2>
        <p className="mt-2 text-tinta-media">Las mismas piezas, con la paleta seleccionada arriba.</p>
        <div className="mt-6 space-y-8">
          <MockHero />
          <MockGrid />
        </div>
      </section>
    </div>
  );
}

function Muestrario() {
  const fichas: { nombre: string; variable: string }[] = [
    { nombre: 'Marca', variable: '--marca' },
    { nombre: 'Marca fuerte', variable: '--marca-fuerte' },
    { nombre: 'Acción', variable: '--accion' },
    { nombre: 'Apoyo', variable: '--apoyo' },
    { nombre: 'Tinta', variable: '--tinta' },
    { nombre: 'Fondo alt', variable: '--fondo-alt' },
  ];

  return (
    <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
      {fichas.map((f) => (
        <div key={f.variable}>
          <div
            className="h-16 w-full rounded-marca border border-borde"
            style={{ background: `var(${f.variable})` }}
          />
          <p className="mt-1.5 text-xs font-medium text-tinta">{f.nombre}</p>
          <p className="font-mono text-[10px] text-tinta-suave">{f.variable}</p>
        </div>
      ))}
    </div>
  );
}

function MockHero() {
  return (
    <div className="overflow-hidden rounded-marca-lg border border-borde">
      <div className="bg-fondo-hondo px-8 py-16 sm:px-14 sm:py-20">
        <Logo className="h-12" variante="oscuro" />
        <h3 className="mt-8 max-w-2xl text-4xl font-bold text-white sm:text-5xl">
          Energía solar que se paga sola
        </h3>
        <p className="mt-4 max-w-xl text-lg text-white/70">
          Paneles, baterías e instalación para hogares, fincas y negocios.
          Más de 7 años montando sistemas en Colombia.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button className="rounded-marca bg-accion px-6 py-3.5 font-semibold text-accion-contraste">
            Ver catálogo
          </button>
          <button className="rounded-marca border border-white/25 px-6 py-3.5 font-semibold text-white">
            Hablar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

function MockGrid() {
  const items = [
    { nombre: 'Panel Solar 665W Trina Vertex', cat: 'Paneles solares', precio: '$ 890.000' },
    { nombre: 'Batería Gel Sunray 200Ah 12V', cat: 'Baterías · Gel', precio: '$ 1.565.000' },
    { nombre: 'Inversor Híbrido 5kW', cat: 'Inversores · Híbrido', precio: '$ 3.200.000' },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <article
          key={p.nombre}
          className="overflow-hidden rounded-marca-lg border border-borde bg-fondo shadow-marca"
        >
          <div className="flex aspect-square items-center justify-center bg-fondo-alt text-sm text-tinta-suave">
            imagen del producto
          </div>
          <div className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-marca">{p.cat}</p>
            <h4 className="mt-1.5 text-base font-semibold leading-snug">{p.nombre}</h4>
            <p className="mt-3 text-xl font-bold text-tinta">{p.precio}</p>
            <button className="mt-4 w-full rounded-marca bg-accion px-4 py-2.5 text-sm font-semibold text-accion-contraste">
              Comprar por WhatsApp
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
