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
| `/paleta` | **Interna.** Las tres direcciones visuales, para decidir con Don Carlos |

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
- **Paleta.** Tres direcciones como variables CSS en `src/index.css`,
  intercambiables con `data-paleta="a|b|c"` en `<html>`.

---

## Pendientes de contenido

Marcados en el código como `[PENDIENTE: contenido real de Clima Zoe]`:
historia y años de operación, proyectos anteriores, fotos propias,
testimonios, teléfono/WhatsApp/correo/dirección reales.
