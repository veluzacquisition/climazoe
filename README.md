# Clima Zoe — plataforma web

Sitio y catálogo de **Clima Zoe** (energía solar: paneles, baterías,
inversores, iluminación LED, refrigeración solar, bombeo de agua).

- **Frontend**: React + Vite + TypeScript + Tailwind CSS v4
- **Datos**: Supabase (Postgres + Auth + Storage)
- **Imágenes**: Cloudinary
- **Hosting**: Vercel
- **Scraper del catálogo de referencia**: Python + [Scrapling](https://github.com/D4Vinci/Scrapling)

---

## Arranque rápido

```bash
npm install
cp .env.example .env.local     # llenar con las claves de Supabase
npm run dev
```

Rutas útiles en desarrollo:

| Ruta      | Qué es                                                          |
|-----------|-----------------------------------------------------------------|
| `/`       | Home                                                             |
| `/paleta` | **Interna.** La identidad visual documentada: tokens, reglas de contraste y piezas reales |

---

## Identidad visual

La paleta no se inventó: son los colores muestreados del logo que el negocio
ya usa. Verificados contra los píxeles de `public/brand/climazoe-logo.png`
(el verde y el rojo caen a Δ≈10 de los colores dominantes de la tipografía).

| Token         | Hex       | Origen en el logo  | Papel |
|---------------|-----------|--------------------|-------|
| `--zoe-black` | `#000000` | Fondo              | Fondo base del sitio |
| `--zoe-white` | `#FFFFFF` | "CLIMA"            | Texto principal |
| `--zoe-green` | `#68CB4E` | "ZOE"              | **Protagonista**: marca, precios, botones primarios, estados activos |
| `--zoe-red`   | `#D6492E` | "ENERGÍA SOLAR"    | Acento puntual: descuentos, alertas. Máx. 10-15% de superficie |
| `--zoe-navy`  | `#284978` | El globo           | Sólo bordes, íconos y tinte de superficies |

Reglas que salen de medir el contraste, no de estimarlo:

- **Botón verde = texto negro** (10.24:1). Blanco sobre ese verde da 2.05:1 y
  es ilegible.
- **Navy nunca lleva texto encima sobre negro** (2.31:1, no pasa ni como UI).
  Como relleno sí, con texto blanco (9.07:1).
- **El rojo puro no se usa como texto sobre fondos rojizos** (cae a ~4.4:1):
  para eso está `--acento-texto` (`#E07662`, 6.94:1).

El sitio es de **tema oscuro por decisión**, igual que el logo — no hay
variante clara. Lo que se conserva del logo es la paleta, no la ilustración:
sin rayos de sol, sin textura de pasto, sin gradientes ni sombras pesadas.

El logo se sirve en WebP (41 KB en la versión de header, contra 464 KB del
PNG) con el PNG como respaldo. El master está en Cloudinary.

---

## Scraper

Extrae el catálogo de `solphower.co` (futuro proveedor) a
`data/catalogo_solphower.json`, para usarlo como base del catálogo propio.

```bash
cd scraper
python3 -m venv .venv
./.venv/bin/pip install -r requirements.txt

./.venv/bin/python scrape_solphower.py                 # catálogo completo
./.venv/bin/python scrape_solphower.py --limite 10     # prueba rápida
./.venv/bin/python scrape_solphower.py --sin-cache     # ignora el HTML cacheado
```

- `solphower_parse.py` concentra todos los selectores; si el proveedor cambia
  su HTML, se arregla ahí.
- El HTML crudo se cachea en `data/raw_html/` (ignorado por git) para poder
  iterar sobre los parsers sin volver a descargar.
- Se respeta `robots.txt`: sólo se piden `/es/categoria/*` y
  `/es/productos/<slug>`; nunca `/api/*`, `/productos/search` ni
  `/productos/quick/*`. Delay de 1.2 s entre peticiones.

### Qué se puede sacar del sitio de referencia y qué no

| Dato                        | Estado                                                    |
|-----------------------------|-----------------------------------------------------------|
| Nombre, SKU, categoría      | ✅ En microdata Schema.org                                 |
| Precio y precio tachado     | ✅ Sólo como **referencia interna** (`precio_proveedor`)   |
| Descripción corta           | ✅                                                         |
| Descripción larga           | ⚠️ El proveedor deja esa pestaña casi siempre vacía        |
| Especificaciones técnicas   | ❌ **No están en HTML**: viven dentro de PDFs adjuntos      |
| Imágenes de producto        | ✅ URLs de la galería                                      |
| Fichas técnicas (PDF)       | ✅ Se guarda el enlace (no se descargan)                   |

Las specs hay que sacarlas de los PDFs o pedírselas al proveedor en la llamada
de conciliación; por eso cada producto guarda su `fuente_url`.

---

## Deploy (Vercel)

`vercel.json` hace dos cosas que no son automáticas:

- **SPA fallback.** El sitio enruta en el cliente con react-router. Sin el
  rewrite a `index.html`, entrar directo a `/paleta` o refrescar
  `/producto/x` devuelve 404. Vercel resuelve los archivos estáticos *antes*
  de aplicar rewrites, así que el catch-all no intercepta `/assets/*`.
- **Cache.** Los assets de Vite llevan hash en el nombre, así que van con
  `immutable` a un año; el logo, a una semana.

Cada push a `main` dispara un deploy de producción; las ramas y PRs generan
preview URLs.

---

## Estructura

```
src/
  components/   Layout, Logo, BotonCompra…
  pages/        Home, Paleta, EnConstruccion…
  lib/          supabase.ts, site.config.ts, formato.ts
  types/        catalogo.ts  (espejo del schema)
supabase/
  schema.sql    Tablas, vista pública y RLS
scraper/        Python + Scrapling (venv propio, fuera de node_modules)
data/           JSON del scraping (raw_html/ ignorado)
public/brand/   Logo — colocar climazoe-logo.png acá
```

---

## Decisiones que conviene conocer

- **Precios.** `precio_proveedor` es costo interno y **nunca** se renderiza:
  el frontend lee la vista `productos_publicos`, que no lo incluye. Los precios
  de venta se definen tras la llamada con el proveedor.
- **Segmentos.** Mayorista y minorista son dos columnas de precio en
  `productos`, no una tabla aparte: hoy la única diferencia es el número. Si
  aparecen reglas propias por segmento (mínimos, escalas por volumen), se migra
  a `producto_precios`.
- **Publicación.** Un producto sólo se activa si tiene precio propio e imagen
  en Cloudinary; un trigger en Postgres lo impide en caso contrario, para que
  no haya imágenes rotas en producción.
- **Modo de compra.** Arranca en WhatsApp. `BotonCompra` es el único lugar que
  sabe cómo se cierra una venta; cambiar a Bold o contraentrega es tocar
  `site.config.ts` o la columna `modo_compra` del producto.
- **Paleta.** Los cinco tokens de marca viven en `:root` de `src/index.css` y
  los componentes usan roles semánticos (`bg-marca`, `text-acento`) que apuntan
  a ellos. Ver la tabla de arriba y la ruta `/paleta`.

---

## Pendientes de contenido

Marcados en el código como `[PENDIENTE: contenido real de Clima Zoe]`:
historia y años de operación, proyectos anteriores, fotos propias,
testimonios, teléfono/WhatsApp/correo/dirección reales.
