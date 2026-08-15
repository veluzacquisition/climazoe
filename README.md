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
| `--zoe-black` | `#000000` | Fondo              | Excepción: hero (sobre la foto) y franja de cifras |
| `--zoe-white` | `#FFFFFF` | "CLIMA"            | **Base del sitio**: ~84% de la superficie |
| `--zoe-green` | `#68CB4E` | "ZOE"              | **Protagonista**: marca, precios, botones primarios, estados activos |
| `--zoe-red`   | `#D6492E` | "ENERGÍA SOLAR"    | Acento puntual: descuentos, alertas. Máx. 10-15% de superficie |
| `--zoe-navy`  | `#284978` | El globo           | Sólo bordes, íconos y tinte de superficies |

Reglas que salen de medir el contraste, no de estimarlo:

- **Botón verde = texto negro** (10.24:1). Blanco sobre ese verde da 2.05:1 y
  es ilegible.
- **El verde como TEXTO cambia con el tono.** `#68CB4E` sobre blanco da
  2.05:1 y es ilegible, así que la letra usa `--marca-texto`: `#3E7A2F`
  (5.21:1) en claro y el verde vivo en oscuro. El RELLENO de los botones no
  cambia nunca — es el ancla de reconocimiento.
- **Navy nunca lleva texto encima sobre negro** (2.31:1). Como relleno sí,
  con texto blanco (9.07:1).

### Tonos

Clima Zoe es una marca de **fondo claro**: el claro vive en `:root` y no hay
que declararlo. El oscuro es la excepción `.tono-oscuro`, reservado al hero
—donde la oscuridad la pone la fotografía— y a la franja de cifras. Medido en
el navegador: **84% de superficie clara**.

Envolver una sección en `.tono-oscuro` redefine las variables semánticas; los
componentes no saben en qué tono están y se adaptan solos.

### Logo

`public/brand/climazoe-logo.*` es el logo 2026: plano, sin resplandor, con
"CLIMA" en negro — hecho para fondo claro. El anterior queda como
`climazoe-logo-oscuro.*` porque el nuevo desaparece sobre negro. Se sirve en
WebP con PNG de respaldo.

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

## Supabase

El frontend intenta Supabase primero y, si no hay credenciales o la consulta
falla, cae a `public/data/catalogo.json`. Eso significa que el sitio nunca se
queda sin catálogo mientras se migra.

### Puesta en marcha

1. Crear un proyecto en Supabase (región `us-east-1`).
2. Llenar `.env.local` (ver `.env.example`). Ese archivo está en `.gitignore`.
3. Aplicar el esquema: pegar `supabase/migrations/0001_catalogo.sql` en el
   SQL Editor del proyecto.
4. Cargar el catálogo:

   ```bash
   cd scraper
   ./.venv/bin/pip install -r requirements-import.txt
   ./.venv/bin/python importar_a_supabase.py --dry-run   # ver el plan
   ./.venv/bin/python importar_a_supabase.py
   ```

5. En Vercel, añadir `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
   **La `service_role` no va a Vercel**: es sólo para los scripts locales.

### Cómo se protege el costo del proveedor

`precio_proveedor` vive en la tabla `productos`, pero el rol `anon` **no
tiene ninguna política de SELECT** sobre esa tabla: con RLS activo, eso es
denegado. El público sólo puede leer las vistas `catalogo_publico` y
`categorias_publicas`, que corren con los privilegios de su dueño y no
incluyen esa columna. O sea, el costo no se filtra aunque alguien consulte la
API a mano con la anon key.

### Publicación de productos

Un producto se activa cuando tiene **al menos una imagen** — no cuando tiene
precio. Clima Zoe vende por cotización, así que exigir precio dejaría el
catálogo entero apagado; lo que no se admite es una imagen rota en
producción. Un trigger lo verifica en Postgres.

### Imágenes

`producto_imagenes` tiene dos columnas: `url_cloudinary` y `url_origen`. La
vista pública hace `coalesce` entre las dos. Hoy sólo está poblada
`url_origen`; cuando estén las imágenes propias de Clima Zoe se rellena
`url_cloudinary` y el sitio cambia solo, sin tocar código.

---

## Carrito y checkout

El sitio tiene carrito propio y checkout interno; WhatsApp dejó de ser el
botón de compra y pasó a ser un canal de consulta aparte.

**Carrito** (`src/lib/carrito.tsx`): contexto de React con persistencia en
`localStorage`, para no perder la venta si el cliente recarga. El precio se
congela al agregar: si cambia la lista, se respeta lo que el cliente vio.

**Checkout** (`src/pages/Checkout.tsx`): tres pasos —datos, entrega, pago—
con resumen fijo al lado. Funciona en dos modos según el catálogo:

| | Sin precios (hoy) | Con precios |
|---|---|---|
| Resumen | "A confirmar" | Subtotal y total reales |
| Métodos | Contraentrega, transferencia, coordinar | Los mismos **+ pasarela** |
| Cierre | Pedido en firme, total por confirmar | Cobro en línea |

No se finge un total: mientras no haya lista cerrada, el pedido entra como
solicitud en firme y un asesor confirma el monto.

### Dónde se enchufa la pasarela

Todo el conocimiento de pagos está en `src/lib/pagos.ts`. Conectar Bold,
Wompi o Mercado Pago es:

1. Implementar `procesar()` del método `pasarela` para que cree la orden
   contra su API y devuelva `{ ok: true, urlExterna: respuesta.checkoutUrl }`.
2. Poner `disponible: true`.

El checkout no cambia: pide métodos con `metodosDisponibles()` y llama a
`procesar()`. La pasarela se muestra en gris con el motivo mientras no esté
activa, en vez de esconderse.

### Pedidos

`supabase/migrations/0002_pedidos.sql` tiene las tablas `pedidos` y
`pedido_items`. Dos decisiones:

- Los ítems guardan **nombre y precio congelados**: un pedido histórico debe
  mostrar lo que el cliente compró, no lo que el producto vale hoy.
- `anon` puede **INSERT pero no SELECT**: los pedidos tienen cédula,
  dirección y teléfono. La lectura es de `service_role`.

Mientras no haya Supabase conectado, el pedido se guarda en el navegador y se
envía por WhatsApp con todo el detalle.

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
