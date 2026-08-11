#!/usr/bin/env python3
"""Scraper del catálogo de solphower.co (futuro proveedor de Clima Zoe).

Extrae el árbol de categorías y la ficha de cada producto a
`data/catalogo_solphower.json`, para usarlo como base del catálogo propio.

Uso:
    python scrape_solphower.py                    # todo el catálogo
    python scrape_solphower.py --limite 10        # prueba rápida
    python scrape_solphower.py --categorias paneles-solares baterias
    python scrape_solphower.py --sin-cache        # ignora el HTML cacheado

Respeta robots.txt (solo se piden rutas permitidas: /es/categoria/* y
/es/productos/<slug>; nunca /api/*, /productos/search ni /productos/quick/*)
y espacia las peticiones con un delay configurable.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import random
import re
import sys
import time
from pathlib import Path
from urllib.parse import urlparse
from xml.etree import ElementTree

from scrapling import Selector
from scrapling.fetchers import Fetcher

from solphower_parse import BASE, parse_categoria, parse_producto, slug_from_url

RAIZ = Path(__file__).resolve().parent.parent
DIR_DATA = RAIZ / "data"
DIR_HTML = DIR_DATA / "raw_html"
SALIDA = DIR_DATA / "catalogo_solphower.json"

SITEMAP_CATEGORIAS = f"{BASE}/es/sitemap_categories.xml"
SITEMAP_PRODUCTOS = f"{BASE}/es/sitemap_products.xml"

# Rutas que robots.txt prohíbe explícitamente.
RUTAS_BLOQUEADAS = (
    re.compile(r"/api/"),
    re.compile(r"/productos/quick/"),
    re.compile(r"/productos/search"),
    re.compile(r"/(extranet|dashboard|admin|admins|affiliates|users|profile)/"),
    re.compile(r"\.(pdf|docx)$"),
)

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36 "
    "(+climazoe catalog sync; contacto: lumens.ecom@gmail.com)"
)


def permitida(url: str) -> bool:
    ruta = urlparse(url).path
    return not any(p.search(ruta) for p in RUTAS_BLOQUEADAS)


# --------------------------------------------------------------------------
# fetching con cache en disco
# --------------------------------------------------------------------------

class Descargador:
    def __init__(self, delay: float = 1.2, usar_cache: bool = True):
        self.delay = delay
        self.usar_cache = usar_cache
        self.pedidos = 0
        DIR_HTML.mkdir(parents=True, exist_ok=True)

    def _ruta_cache(self, url: str) -> Path:
        slug = slug_from_url(url) or "index"
        firma = hashlib.sha1(url.encode()).hexdigest()[:8]
        return DIR_HTML / f"{slug}-{firma}.html"

    def get(self, url: str):
        """Devuelve un Selector de Scrapling, desde cache o desde la red."""
        if not permitida(url):
            raise ValueError(f"robots.txt prohíbe esta ruta: {url}")

        cache = self._ruta_cache(url)
        if self.usar_cache and cache.exists():
            return Selector(cache.read_text(encoding="utf-8"))

        if self.pedidos:
            time.sleep(self.delay + random.uniform(0, 0.4))
        self.pedidos += 1

        respuesta = Fetcher.get(url, headers={"User-Agent": UA}, timeout=30)
        if respuesta.status != 200:
            raise RuntimeError(f"HTTP {respuesta.status} en {url}")
        # Ojo: en Scrapling `.text` es el texto extraído del documento, no el
        # HTML. El fuente crudo está en `.body` (bytes).
        cache.write_text(
            respuesta.body.decode(respuesta.encoding or "utf-8", errors="replace"),
            encoding="utf-8",
        )
        return respuesta


def urls_de_sitemap(url: str) -> list[str]:
    import urllib.request

    peticion = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(peticion, timeout=30) as r:
        xml = r.read()
    raiz = ElementTree.fromstring(xml)

    def local(tag: str) -> str:
        return tag.rsplit("}", 1)[-1]

    # El índice declara el namespace con http:// y los sub-sitemaps con https://,
    # así que se compara sólo el nombre local. Se recorren <url>/<sitemap> y se
    # toma su <loc> DIRECTO: los sitemaps traen también <image:loc> anidados,
    # que son URLs de imagen y no páginas que haya que visitar.
    urls: list[str] = []
    for entrada in raiz:
        if local(entrada.tag) not in ("url", "sitemap"):
            continue
        for hijo in entrada:
            if local(hijo.tag) == "loc" and hijo.text:
                urls.append(hijo.text.strip())
                break
    return urls


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--limite", type=int, help="máximo de productos a procesar")
    ap.add_argument("--categorias", nargs="*", help="slugs de categoría a incluir (filtra productos)")
    ap.add_argument("--delay", type=float, default=1.2, help="segundos entre peticiones (default 1.2)")
    ap.add_argument("--sin-cache", action="store_true", help="ignora el HTML cacheado en data/raw_html")
    ap.add_argument("--salida", type=Path, default=SALIDA)
    args = ap.parse_args()

    dl = Descargador(delay=args.delay, usar_cache=not args.sin_cache)
    DIR_DATA.mkdir(parents=True, exist_ok=True)

    print("→ leyendo sitemaps…")
    urls_cat = [u for u in urls_de_sitemap(SITEMAP_CATEGORIAS) if permitida(u)]
    urls_prod = [u for u in urls_de_sitemap(SITEMAP_PRODUCTOS) if permitida(u)]
    print(f"  {len(urls_cat)} categorías, {len(urls_prod)} productos")

    # --- categorías -------------------------------------------------------
    categorias: list[dict] = []
    for i, url in enumerate(urls_cat, 1):
        try:
            cat = parse_categoria(dl.get(url), url)
        except Exception as e:  # noqa: BLE001
            print(f"  ✗ categoría {url}: {e}", file=sys.stderr)
            continue
        categorias.append(cat)
        print(f"  [{i}/{len(urls_cat)}] {cat['nombre']} ({cat['slug']})")

    por_slug = {c["slug"]: c for c in categorias}
    for c in categorias:
        c["subcategorias"] = sorted(
            o["slug"] for o in categorias if o["parent_slug"] == c["slug"]
        )

    # --- productos --------------------------------------------------------
    if args.categorias:
        pedidas = set(args.categorias)
        # incluye descendientes de las categorías pedidas
        for _ in range(3):
            for c in categorias:
                if c["parent_slug"] in pedidas:
                    pedidas.add(c["slug"])
    else:
        pedidas = None

    productos: list[dict] = []
    fallos: list[dict] = []
    for i, url in enumerate(urls_prod, 1):
        if args.limite and len(productos) >= args.limite:
            break
        try:
            prod = parse_producto(dl.get(url), url)
        except Exception as e:  # noqa: BLE001
            print(f"  ✗ producto {url}: {e}", file=sys.stderr)
            fallos.append({"url": url, "error": str(e)})
            continue

        if pedidas is not None and not (set(prod["ruta_categorias"]) or {}):
            pass
        if pedidas is not None:
            slugs_prod = {prod.get("categoria"), prod.get("subcategoria")}
            if not (slugs_prod & pedidas):
                continue

        productos.append(prod)
        marca = "·" if prod["precio_proveedor"] else "sin precio"
        print(f"  [{i}/{len(urls_prod)}] {prod['nombre']} — {prod['precio_proveedor']} {marca}")

    # --- salida -----------------------------------------------------------
    salida = {
        "fuente": BASE,
        "generado_en": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "totales": {
            "categorias": len(categorias),
            "productos": len(productos),
            "productos_sin_precio": sum(1 for p in productos if not p["precio_proveedor"]),
            "productos_sin_imagen": sum(1 for p in productos if not p["imagenes"]),
            "fallos": len(fallos),
        },
        "categorias": categorias,
        "productos": productos,
        "fallos": fallos,
    }
    args.salida.parent.mkdir(parents=True, exist_ok=True)
    args.salida.write_text(json.dumps(salida, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n✓ {args.salida.relative_to(RAIZ)}")
    for k, v in salida["totales"].items():
        print(f"   {k}: {v}")
    print(f"   peticiones de red: {dl.pedidos}")
    _ = por_slug
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
