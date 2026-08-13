/**
 * Fondo del hero mientras no hay fotografía propia.
 *
 * Es deliberadamente GRÁFICO —un arreglo de paneles en perspectiva contra un
 * cielo al atardecer—, no una foto de archivo: poner una imagen de stock de
 * otra empresa en la primera pantalla sería exactamente lo que estamos
 * evitando. Ocupa la misma caja que va a ocupar la foto real, así que
 * reemplazarlo es cambiar este componente por un <img>.
 */
export default function FondoHero({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        {/* Cielo: del negro de marca arriba a un verde profundo en el horizonte. */}
        <linearGradient id="cielo" x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="45%" stopColor="#0a1f1a" />
          <stop offset="75%" stopColor="#14402c" />
          <stop offset="100%" stopColor="#1d5c3a" />
        </linearGradient>

        {/* Halo del sol bajo. */}
        <radialGradient id="sol" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#b8f0a0" stopOpacity="0.85" />
          <stop offset="35%" stopColor="#68cb4e" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#68cb4e" stopOpacity="0" />
        </radialGradient>

        {/* Cara del módulo: azul profundo con reflejo verde del cielo. */}
        <linearGradient id="panel" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#1e4a6b" />
          <stop offset="55%" stopColor="#123048" />
          <stop offset="100%" stopColor="#2b6b4a" />
        </linearGradient>

        <pattern id="celdas" width="34" height="34" patternUnits="userSpaceOnUse">
          <rect width="34" height="34" fill="url(#panel)" />
          <path d="M34 0V34M0 34H34" stroke="#8fe27a" strokeOpacity="0.28" strokeWidth="1.6" />
        </pattern>

        {/* El arreglo se desvanece hacia el fondo para dar profundidad. */}
        <linearGradient id="lejania" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.75" />
          <stop offset="45%" stopColor="#000" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#cielo)" />

      {/* Sol bajo, a la derecha para no competir con el texto. */}
      <circle cx="1230" cy="500" r="330" fill="url(#sol)" />
      <circle cx="1230" cy="500" r="58" fill="#d9f7c9" opacity="0.55" />

      {/* Arreglo de módulos. Cuatro filas: las de atrás más chatas y estrechas,
          que es lo que construye la perspectiva. */}
      {[
        { y: 470, alto: 52, sesgo: 120, inicio: 300, fin: 1300 },
        { y: 536, alto: 72, sesgo: 175, inicio: 200, fin: 1420 },
        { y: 626, alto: 100, sesgo: 250, inicio: 60, fin: 1570 },
        { y: 744, alto: 145, sesgo: 355, inicio: -140, fin: 1760 },
      ].map((f, i) => (
        <path
          key={i}
          d={`M${f.inicio + f.sesgo} ${f.y}
              L${f.fin} ${f.y}
              L${f.fin - f.sesgo * 0.35} ${f.y + f.alto}
              L${f.inicio} ${f.y + f.alto} Z`}
          fill="url(#celdas)"
          stroke="#8fe27a"
          strokeOpacity="0.45"
          strokeWidth="2.5"
        />
      ))}

      {/* Velo de lejanía sobre el arreglo. */}
      <rect y="440" width="1600" height="200" fill="url(#lejania)" />

      {/* Destello del sol sobre el canto de los módulos. */}
      <path d="M300 470 L1300 470" stroke="#d9f7c9" strokeOpacity="0.5" strokeWidth="2" />
      <path d="M60 626 L1570 626" stroke="#b8f0a0" strokeOpacity="0.35" strokeWidth="2" />
    </svg>
  );
}
