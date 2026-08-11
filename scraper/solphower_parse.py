"""Parsers para las páginas de solphower.co (plataforma Parze / Rails).

El sitio es server-rendered y expone microdata Schema.org, así que basta con
`Fetcher` (HTTP simple). Todo el conocimiento sobre selectores vive aquí para
que `scrape_solphower.py` quede como orquestador.
"""

from __future__ import annotations

import re
from datetime import datetime, timezone
from urllib.parse import unquote, urljoin, urlparse

BASE = "https://solphower.co"


# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------

def _txt(node) -> str | None:
    """Texto limpio de un nodo de Scrapling, o None si no hay nodo/está vacío."""
    if node is None:
        return None
    raw = node.get_all_text(strip=True) if hasattr(node, "get_all_text") else str(node)
    clean = re.sub(r"\s+", " ", raw).strip()
    return clean or None


def _attr(node, name: str) -> str | None:
    if node is None:
        return None
    value = node.attrib.get(name)
    return value.strip() if value else None


def _money(value: str | None) -> float | None:
    """'$1.565.000' o '1565000.0' -> 1565000.0"""
    if not value:
        return None
    cleaned = value.replace("$", "").replace(" ", "").strip()
    # Formato colombiano: '.' como separador de miles, ',' decimal.
    if re.fullmatch(r"[\d.]+,\d+", cleaned):
        cleaned = cleaned.replace(".", "").replace(",", ".")
    elif re.fullmatch(r"[\d.]{4,}", cleaned) and cleaned.count(".") >= 1 and not re.search(r"\.\d{1,2}$", cleaned):
        cleaned = cleaned.replace(".", "")
    try:
        return float(cleaned)
    except ValueError:
        return None


def slug_from_url(url: str) -> str:
    return urlparse(url).path.rstrip("/").split("/")[-1]


def _absolute(url: str | None) -> str | None:
    if not url:
        return None
    if url.startswith("//"):
        return "https:" + url
    return urljoin(BASE, url)


# --------------------------------------------------------------------------
# breadcrumb
# --------------------------------------------------------------------------

def parse_breadcrumb(page) -> list[dict]:
    """[{'nombre': 'Baterías', 'slug': 'baterias', 'url': ...}, ...] sin 'Inicio'."""
    items = []
    for li in page.css('ul.breadcrumb li[itemprop="itemListElement"]'):
        nombre = _txt(li.css('span[itemprop="name"]').first)
        if not nombre or nombre.lower() == "inicio":
            continue
        link = li.css('a[itemprop="item"]').first
        href = _attr(link, "href")
        items.append({
            "nombre": nombre,
            "slug": slug_from_url(href) if href else None,
            "url": _absolute(href),
        })
    return items


# --------------------------------------------------------------------------
# categorías
# --------------------------------------------------------------------------

def parse_categoria(page, url: str) -> dict:
    """Datos de una página /es/categoria/<slug>. El padre sale del breadcrumb."""
    ruta = parse_breadcrumb(page)
    slug = slug_from_url(url)
    # El último item del breadcrumb es la categoría actual; el anterior, su padre.
    actual = ruta[-1] if ruta else {}
    padre = ruta[-2] if len(ruta) > 1 else None

    nombre = actual.get("nombre") or _txt(page.css("h1").first)
    descripcion = _txt(page.css(".tf-page-title .description, .category-description").first)

    return {
        "slug": slug,
        "nombre": nombre,
        "parent_slug": padre["slug"] if padre else None,
        "nivel": len(ruta),
        "ruta": [r["nombre"] for r in ruta],
        "descripcion": descripcion,
        "fuente_url": url,
    }


# --------------------------------------------------------------------------
# productos
# --------------------------------------------------------------------------

_AVAIL = {
    "https://schema.org/InStock": "in_stock",
    "https://schema.org/OutOfStock": "out_of_stock",
    "https://schema.org/PreOrder": "pre_order",
}


def _imagenes(page) -> list[str]:
    """Imágenes de producto en su versión grande (galería fancybox)."""
    urls: list[str] = []
    for a in page.css('a[data-fancybox="product-gallery"]'):
        href = _attr(a, "href")
        if not href or "youtube" in href:
            continue
        full = _absolute(href)
        if full and full not in urls:
            urls.append(full)
    if not urls:
        og = _attr(page.css('meta[property="og:image"]').first, "content")
        if og:
            urls.append(_absolute(og))
    return urls


def _videos(page) -> list[str]:
    urls = []
    for a in page.css('a[data-fancybox="product-gallery"], a.video-fancy'):
        href = _attr(a, "href") or ""
        if "youtube" in href or "youtu.be" in href:
            full = _absolute(href)
            if full and full not in urls:
                urls.append(full)
    return urls


def _fichas_tecnicas(page) -> list[dict]:
    """PDFs adjuntos: aquí es donde Solphower guarda las specs técnicas."""
    fichas = []
    seen = set()
    selectors = (
        'a.product-attacheds__btn--view',
        '.att-box a.btn-tallas',
    )
    for sel in selectors:
        for a in page.css(sel):
            href = _attr(a, "href")
            if not href or ".pdf" not in href.lower():
                continue
            full = _absolute(href.split("?")[0])
            if full in seen:
                continue
            seen.add(full)
            # El nombre real del PDF está en el último segmento de la URL;
            # el `title` del botón es genérico ("Ver Archivo").
            nombre = _attr(a, "download") or unquote(full.split("/")[-1])
            fichas.append({"nombre": nombre, "url": _absolute(href)})
    return fichas


def _especificaciones(page) -> dict:
    """Pares clave/valor si el producto trae tabla o lista de atributos.

    Solphower casi no los usa (las specs viven en el PDF adjunto), pero se
    extraen cuando existen para no perder datos.
    """
    specs: dict[str, str] = {}
    for row in page.css(".format-text table tr, .product-attributes li, .attribute-row"):
        celdas = [_txt(c) for c in row.css("td, th, span, b, strong")]
        celdas = [c for c in celdas if c]
        if len(celdas) >= 2 and celdas[0] != celdas[1]:
            specs.setdefault(celdas[0].rstrip(":"), celdas[1])
    return specs


def parse_producto(page, url: str) -> dict:
    ruta = parse_breadcrumb(page)
    categoria = ruta[0] if ruta else None
    subcategoria = ruta[1] if len(ruta) > 1 else None

    nombre = _txt(page.css('.product-title[itemprop="name"]').first) or _txt(
        page.css("h1").first
    )
    sku = _attr(page.css('meta[itemprop="sku"]').first, "content")
    precio = _money(_attr(page.css('meta[itemprop="price"]').first, "content"))
    moneda = _attr(page.css('meta[itemprop="priceCurrency"]').first, "content") or "COP"
    disponibilidad_raw = _attr(page.css('meta[itemprop="availability"]').first, "content")
    precio_tachado = _money(_txt(page.css(".product-prices del").first))

    descuento = _txt(page.css(".product-detail-discount").first)
    descuento_pct = None
    if descuento:
        m = re.search(r"(-?\d+)", descuento)
        if m:
            descuento_pct = abs(int(m.group(1)))

    qty = page.css("input.qty-field").first
    stock_max = None
    if qty is not None:
        raw_max = _attr(qty, "max") or _attr(qty, "data-max")
        if raw_max and raw_max.isdigit():
            stock_max = int(raw_max)

    unidad = _txt(page.css("small.product-unit").first)
    dimensiones = _txt(page.css("small.product-unit strong").first)

    desc_larga = _txt(page.css(".widget-content-inner .format-text").first)

    return {
        "id": slug_from_url(url),
        "nombre": nombre,
        "sku_proveedor": sku,
        "producto_id_proveedor": _attr(page.css("#product_id").first, "value"),
        "categoria": categoria["slug"] if categoria else None,
        "categoria_nombre": categoria["nombre"] if categoria else None,
        "subcategoria": subcategoria["slug"] if subcategoria else None,
        "subcategoria_nombre": subcategoria["nombre"] if subcategoria else None,
        "ruta_categorias": [r["nombre"] for r in ruta],
        "precio_proveedor": precio,
        "precio_lista_proveedor": precio_tachado,
        "descuento_pct": descuento_pct,
        "moneda": moneda,
        "disponibilidad": _AVAIL.get(disponibilidad_raw or "", disponibilidad_raw),
        "stock_max": stock_max,
        "unidad_venta": unidad,
        "dimensiones": dimensiones,
        "descripcion_corta": _txt(page.css(".product-short-description").first),
        "descripcion_larga": desc_larga,
        "especificaciones": _especificaciones(page),
        "imagenes": _imagenes(page),
        "videos": _videos(page),
        "fichas_tecnicas": _fichas_tecnicas(page),
        "fuente_url": url,
        "scraped_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
