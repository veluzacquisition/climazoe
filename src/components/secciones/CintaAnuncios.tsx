import { ANIO_INICIO_COMERCIAL, aniosDeTrayectoria } from '../../lib/site.config';

/**
 * Cinta de anuncios bajo el hero.
 *
 * Lo que un visitante quiere resolver en los primeros diez segundos: si le
 * llega, cómo paga, si le responden. Eso estaba repartido entre el checkout,
 * el pie y la página de servicios; acá va todo junto en una línea.
 *
 * Se desplaza sola porque no cabe de otra forma —son ocho datos y en celular
 * entran dos— y se detiene al pasar el mouse, para poder leer el que
 * interesa. Con "reducir movimiento" activo se queda quieta y se desplaza a
 * mano: es información, no adorno, así que no se oculta.
 *
 * El contenido se pinta DOS veces. La animación traslada el -50%, de modo
 * que al terminar la primera copia la segunda ocupa exactamente su posición
 * inicial y el bucle no tiene salto.
 */

interface Anuncio {
  texto: string;
  icono: React.ReactNode;
}

const ANUNCIOS: Anuncio[] = [
  { texto: 'Envíos a toda Colombia', icono: <IconoCamion /> },
  { texto: 'Pago contraentrega', icono: <IconoCaja /> },
  { texto: 'Transferencia o consignación', icono: <IconoBanco /> },
  { texto: 'Equipos con norma RETIE, CE, IEC y UL', icono: <IconoEscudo /> },
  { texto: 'Asesoría técnica sin costo', icono: <IconoChat /> },
  { texto: 'Garantía de fábrica', icono: <IconoSello /> },
  { texto: 'Venta e instalación', icono: <IconoLlave /> },
  {
    texto: `${aniosDeTrayectoria(ANIO_INICIO_COMERCIAL)} años en energía solar`,
    icono: <IconoSol />,
  },
];

export default function CintaAnuncios() {
  return (
    <div className="tono-oscuro relative isolate overflow-hidden bg-fondo">
      {/* Textura tenue: sobre un azul pleno de 3rem de alto, un degradado no
          se aprecia, pero unos puntos sí le quitan la planitud. */}
      <div
        aria-hidden="true"
        className="malla-puntos pointer-events-none absolute inset-0 -z-10 text-white/12"
      />

      {/* Los bordes se desvanecen para que las piezas no aparezcan cortadas
          de golpe en el filo de la pantalla. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-[linear-gradient(to_right,var(--fondo),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-[linear-gradient(to_left,var(--fondo),transparent)]"
      />

      <div className="cinta py-3.5">
        {[0, 1].map((copia) => (
          <ul
            key={copia}
            className="flex shrink-0 items-center"
            // La segunda copia es un duplicado visual: para un lector de
            // pantalla repetir los ocho datos es ruido, no información.
            aria-hidden={copia === 1 ? 'true' : undefined}
          >
            {ANUNCIOS.map((a) => (
              <li
                key={a.texto}
                className="flex shrink-0 items-center gap-2.5 px-6 text-sm font-semibold text-white"
              >
                <span className="text-marca-texto">{a.icono}</span>
                {a.texto}
                <span aria-hidden="true" className="ml-6 size-1.5 rounded-full bg-white/30" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

// --- Iconos ----------------------------------------------------------------

function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-[18px]"
    >
      {children}
    </svg>
  );
}

function IconoCamion() {
  return (
  <Svg>
    <path d="M2 6.5h11v11H2zM13 10h4l3 3.5v4h-7" />
    <circle cx="6.5" cy="18.5" r="1.8" />
    <circle cx="16.5" cy="18.5" r="1.8" />
  </Svg>
  );
}
function IconoCaja() {
  return (
  <Svg>
    <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
    <path d="M3 7.5 12 12l9-4.5M12 12v9" />
  </Svg>
  );
}
function IconoBanco() {
  return (
  <Svg>
    <path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />
  </Svg>
  );
}
function IconoEscudo() {
  return (
  <Svg>
    <path d="M12 2.5 5 5.5v6c0 4.4 3 8.2 7 9.5 4-1.3 7-5.1 7-9.5v-6z" />
    <path d="m9 11.8 2.2 2.2L15.4 10" />
  </Svg>
  );
}
function IconoChat() {
  return (
  <Svg>
    <path d="M20.5 11.5a7.9 7.9 0 0 1-8.5 7.9 9 9 0 0 1-2.5-.4L4 20.5l1.5-4.4a7.6 7.6 0 0 1-1.5-4.6C4 7.1 7.7 3.5 12.3 3.5s8.2 3.6 8.2 8z" />
  </Svg>
  );
}
function IconoSello() {
  return (
  <Svg>
    <circle cx="12" cy="9.5" r="6" />
    <path d="m8.5 14.5-1 7 4.5-2.5 4.5 2.5-1-7" />
  </Svg>
  );
}
function IconoLlave() {
  return (
  <Svg>
    <path d="M14.7 6.3a4 4 0 0 0 5 5l-8.1 8.1a2.5 2.5 0 0 1-3.6-3.6l8.1-8.1a4 4 0 0 0-1.4-1.4Z" />
  </Svg>
  );
}
function IconoSol() {
  return (
  <Svg>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
  </Svg>
  );
}
