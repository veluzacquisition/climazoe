import Logo from '../components/Logo';

/**
 * Documentación de la identidad visual (interna, fuera del menú: /paleta).
 *
 * Ya no es un comparador de opciones. La paleta está decidida porque no se
 * inventó: son los colores muestreados del logo que el negocio ya usa. Esta
 * página deja registrado cuáles son, por qué cada uno tiene el papel que
 * tiene, y cómo se ven aplicados a piezas reales del sitio.
 */

const TOKENS = [
  {
    css: '--zoe-black',
    hex: '#000000',
    nombre: 'Negro',
    origen: 'Fondo del logo',
    papel: 'Fondo base de todo el sitio. No es un tema oscuro opcional: es el fondo de la marca.',
  },
  {
    css: '--zoe-white',
    hex: '#FFFFFF',
    nombre: 'Blanco',
    origen: 'La palabra "CLIMA"',
    papel: 'Color de marca, no sólo texto: alrededor del 62% de la página va sobre superficies claras. El negro se reserva para el hero, las cifras y los cierres.',
  },
  {
    css: '--zoe-green',
    hex: '#68CB4E',
    nombre: 'Verde',
    origen: 'La palabra "ZOE"',
    papel: 'Protagonista. Nombre de marca, precios, botones primarios y estados activos: es el color que la gente ya asocia con Clima Zoe.',
    contraste: '10.24:1',
  },
  {
    css: '--zoe-red',
    hex: '#D6492E',
    nombre: 'Rojo-naranja',
    origen: '"ENERGÍA SOLAR"',
    papel: 'Acento puntual: descuentos, alertas de stock, avisos. Máximo 10-15% de la superficie — no compite con el verde.',
    contraste: '4.85:1',
  },
  {
    css: '--zoe-navy',
    hex: '#284978',
    nombre: 'Navy',
    origen: 'El globo terráqueo',
    papel: 'Sólo detalles: bordes, íconos y el tinte de las superficies oscuras. Con 2.31:1 no sirve para texto ni para UI.',
    contraste: '2.31:1',
  },
];

export default function Paleta() {
  return (
    <div className="contenedor py-14">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-marca-texto">
          Interno — identidad visual
        </p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
          La paleta de <span className="text-marca-texto">Clima Zoe</span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-texto-medio">
          Estos colores no son una propuesta: salieron de muestrear los píxeles
          del logo que el negocio ya usa en Facebook e Instagram. Es la única
          dirección que corresponde a la marca real, así que es la definitiva.
        </p>
        <p className="mt-4 rounded-marca border border-borde bg-superficie px-4 py-3 text-sm leading-relaxed text-texto-medio">
          <strong className="text-texto">Lo que se conserva es la paleta, no la ilustración.</strong>{' '}
          El fondo de rayos de sol, la textura de pasto y los gradientes
          gruesos del logo actual quedan fuera: el reconocimiento lo hacen el
          verde y el negro, no la decoración.
        </p>
      </header>

      {/* --- Los cinco tokens --------------------------------------------- */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold">Los cinco tokens</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOKENS.map((t) => (
            <article
              key={t.css}
              className="overflow-hidden rounded-marca-lg border border-borde-suave bg-superficie"
            >
              {/* El ring interior hace visible el swatch negro, que si no se
                  funde con la tarjeta. */}
              <div
                className="h-24 w-full border-b border-borde-suave ring-1 ring-inset ring-white/10"
                style={{ background: t.hex }}
              />
              <div className="p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-base font-semibold">{t.nombre}</h3>
                  <code className="font-mono text-xs text-marca-texto">{t.hex}</code>
                </div>
                <p className="mt-1 font-mono text-[11px] text-texto-suave">{t.css}</p>
                <p className="mt-3 text-sm leading-relaxed text-texto-medio">{t.papel}</p>
                <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-borde-suave pt-3 text-xs">
                  <div className="flex gap-1.5">
                    <dt className="text-texto-suave">Origen:</dt>
                    <dd className="text-texto-medio">{t.origen}</dd>
                  </div>
                  {t.contraste && (
                    <div className="flex gap-1.5">
                      <dt className="text-texto-suave">Sobre negro:</dt>
                      <dd className="text-texto-medio">{t.contraste}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* --- Reglas verificadas -------------------------------------------- */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold">Reglas que salen de los números</h2>
        <p className="mt-2 max-w-2xl text-texto-medio">
          Cada regla está calculada, no estimada a ojo. Los contrastes son
          WCAG 2.1 contra el fondo negro.
        </p>

        <div className="mt-6 overflow-x-auto rounded-marca-lg border border-borde-suave">
          <table className="w-full min-w-[38rem] text-left text-sm">
            <thead className="bg-superficie text-xs uppercase tracking-wide text-texto-suave">
              <tr>
                <th className="px-5 py-3 font-semibold">Uso</th>
                <th className="px-5 py-3 font-semibold">Regla</th>
                <th className="px-5 py-3 font-semibold">Por qué</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde-suave">
              {[
                ['Botón primario', 'Verde con texto NEGRO', 'Negro da 10.24:1; blanco sobre ese verde da 2.05:1 y es ilegible. Igual en secciones claras y oscuras'],
                ['Verde como TEXTO', 'Cambia con el tono', '#68CB4E sobre blanco da 2.05:1, así que en secciones claras la letra usa #3E7A2F (5.21:1)'],
                ['Ritmo de la página', '~62% claro / 38% oscuro', 'Todo negro se lee apagado para una marca de energía'],
                ['Precios', 'Verde', 'Es el dato que más se busca y el color que ancla la marca'],
                ['Badge de descuento', 'Rojo con texto negro', '4.85:1 contra 4.33:1 del blanco'],
                ['Navy', 'Bordes, íconos y tinte de tarjetas', '2.31:1 sobre negro: no pasa ni para UI'],
                ['Texto sobre navy', 'Blanco', '9.07:1'],
                ['Foco de teclado', 'Contorno verde', 'Refuerza la marca en cada interacción'],
              ].map(([uso, regla, porque]) => (
                <tr key={uso}>
                  <td className="px-5 py-3.5 font-medium text-texto">{uso}</td>
                  <td className="px-5 py-3.5 text-marca-texto">{regla}</td>
                  <td className="px-5 py-3.5 text-texto-medio">{porque}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Aplicada a piezas reales --------------------------------------- */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold">Aplicada al sitio</h2>
        <p className="mt-2 max-w-2xl text-texto-medio">
          Las mismas piezas que se van a usar en producción: header, hero,
          tarjeta de producto y botón de compra.
        </p>

        <div className="mt-8 space-y-6">
          <MockHeader />
          <MockHero />
          <MockGrid />
        </div>
      </section>
    </div>
  );
}

function Marco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 font-mono text-xs uppercase tracking-wider text-texto-suave">{titulo}</p>
      <div className="overflow-hidden rounded-marca-lg border border-borde-suave">{children}</div>
    </div>
  );
}

function MockHeader() {
  return (
    <Marco titulo="Header">
      <div className="flex items-center justify-between gap-4 bg-fondo px-6 py-4">
        <Logo className="h-10" />
        <nav className="hidden items-center gap-1 md:flex">
          <span className="rounded-marca bg-marca-tenue px-3.5 py-2 text-sm font-medium text-marca-texto">
            Catálogo
          </span>
          {['Servicios', 'Nosotros', 'Contacto'].map((t) => (
            <span key={t} className="px-3.5 py-2 text-sm font-medium text-texto-medio">
              {t}
            </span>
          ))}
        </nav>
        <span className="rounded-marca bg-marca px-4 py-2.5 text-sm font-semibold text-marca-contraste">
          Asesoría gratis
        </span>
      </div>
    </Marco>
  );
}

function MockHero() {
  return (
    <Marco titulo="Hero">
      <div className="bg-fondo px-8 py-16 sm:px-14">
        <p className="inline-flex items-center gap-2 rounded-full border border-marca-borde bg-marca-tenue px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-marca-texto">
          <span className="size-1.5 rounded-full bg-marca" />
          Energía solar desde 2019
        </p>
        <h3 className="mt-7 max-w-2xl text-4xl font-bold leading-[1.05] sm:text-5xl">
          Energía solar
          <br />
          que <span className="text-marca-texto">se paga sola</span>
        </h3>
        <p className="mt-5 max-w-lg text-lg text-texto-medio">
          Paneles, baterías e instalación para hogares, fincas y negocios.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <span className="rounded-marca bg-marca px-6 py-3.5 font-semibold text-marca-contraste">
            Ver catálogo
          </span>
          <span className="rounded-marca border border-borde px-6 py-3.5 font-semibold text-texto">
            Hablar por WhatsApp
          </span>
        </div>
      </div>
    </Marco>
  );
}

function MockGrid() {
  const items = [
    { nombre: 'Panel Solar 665W Trina Vertex', cat: 'Paneles solares', precio: '$ 890.000', desc: null, stock: true },
    { nombre: 'Batería Gel Sunray 200Ah 12V', cat: 'Baterías · Gel', precio: '$ 1.565.000', desc: '-15%', stock: true },
    { nombre: 'Inversor Híbrido 5kW', cat: 'Inversores · Híbrido', precio: '$ 3.200.000', desc: null, stock: false },
  ];

  return (
    <Marco titulo="Tarjeta de producto y botón de compra">
      <div className="grid gap-5 bg-fondo p-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <article
            key={p.nombre}
            className="overflow-hidden rounded-marca-lg border border-borde-suave bg-superficie"
          >
            <div className="relative flex aspect-square items-center justify-center border-b border-borde-suave bg-superficie-alta text-sm text-texto-suave">
              imagen del producto
              {p.desc && (
                <span className="absolute left-3 top-3 rounded-marca bg-acento px-2 py-1 text-xs font-bold text-acento-contraste">
                  {p.desc}
                </span>
              )}
            </div>
            <div className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-texto-suave">{p.cat}</p>
              <h4 className="mt-1.5 text-base font-semibold leading-snug">{p.nombre}</h4>
              <p className="mt-3 text-xl font-bold text-marca-texto">{p.precio}</p>
              {p.stock ? (
                <span className="mt-4 flex w-full items-center justify-center gap-2 rounded-marca bg-marca px-4 py-2.5 text-sm font-semibold text-marca-contraste">
                  Comprar por WhatsApp
                </span>
              ) : (
                <span className="mt-4 flex w-full items-center justify-center rounded-marca border border-borde bg-superficie px-4 py-2.5 text-sm font-semibold text-texto-suave">
                  Agotado
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </Marco>
  );
}
