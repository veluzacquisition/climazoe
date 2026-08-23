#!/usr/bin/env python3
"""Extrae el catálogo de energía de fibraandina.com.

Se fusiona con el de Solphower para cubrir las líneas que Clima Zoe vende y
que el otro proveedor no tiene bien surtidas: paneles de alta potencia,
inversores híbridos, baterías de litio, controladores MPPT y medidores.

Su ficha es más pobre en datos que la de Solphower —no publica precio ni
stock— pero mejor en lo que importa acá: marca, modelo y una línea de
especificación limpia, más el enlace a la ficha técnica del fabricante.

Salida: data/catalogo_fibraandina.json
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
import urllib.request
from pathlib import Path

from scrapling import Selector

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "data" / "catalogo_fibraandina.json"
URL = "https://fibraandina.com/energia"

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)

# Las clases van con hash de build, así que se buscan por sufijo estable.
def con_clase(nodo, sufijo: str):
    return [
        n for n in nodo.css("*")
        if any(c.endswith(sufijo) for c in (n.attrib.get("class") or "").split())
    ]


def slugificar(texto: str) -> str:
    base = unicodedata.normalize("NFD", texto)
    base = "".join(c for c in base if unicodedata.category(c) != "Mn")
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", base.lower())).strip("-")


def descargar(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read().decode("utf-8", errors="replace")


def main() -> int:
    html = descargar(URL)
    s = Selector(html)

    productos: list[dict] = []
    categoria_actual = None

    # El documento va en orden: h2 = categoría, span.brand = marca de la
    # tarjeta, h3.name = modelo. Se recorre el árbol en orden de aparición
    # para no perder a qué categoría pertenece cada tarjeta.
    for nodo in s.css("h2, div"):
        clases = (nodo.attrib.get("class") or "").split()

        if nodo.tag == "h2":
            texto = re.sub(r"\s+", " ", nodo.get_all_text(strip=True)).strip()
            # Se descartan los bloques que no son categorías de producto.
            if texto and not texto.lower().startswith("catálogos"):
                categoria_actual = texto
            continue

        if not any(c.endswith("__cardInner") for c in clases):
            continue

        nombre = con_clase(nodo, "__name")
        specs = con_clase(nodo, "__specs")
        marca = con_clase(nodo, "__brand")
        img = nodo.css("img").first
        ficha = nodo.css("a").first

        if not nombre:
            continue

        modelo = re.sub(r"\s+", " ", nombre[0].get_all_text(strip=True)).strip()
        productos.append({
            "id": slugificar(f"{marca[0].get_all_text(strip=True) if marca else ''} {modelo}"),
            "modelo": modelo,
            "marca": re.sub(r"\s+", " ", marca[0].get_all_text(strip=True)).strip() if marca else None,
            "categoria": categoria_actual,
            "specs": re.sub(r"\s+", " ", specs[0].get_all_text(strip=True)).strip() if specs else None,
            "imagen": (img.attrib.get("src") if img is not None else None),
            "ficha_tecnica": (ficha.attrib.get("href") if ficha is not None else None),
        })

    salida = {
        "fuente": URL,
        "totales": {"productos": len(productos)},
        "productos": productos,
    }
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(salida, ensure_ascii=False, indent=1), encoding="utf-8")

    from collections import Counter
    print(f"✓ {SALIDA.relative_to(RAIZ)}  —  {len(productos)} productos")
    for cat, n in Counter(p["categoria"] for p in productos).most_common():
        print(f"   {str(cat):<24} {n}")
    faltan = [p["modelo"] for p in productos if not p["imagen"] or not p["specs"]]
    if faltan:
        print(f"   ⚠ sin imagen o specs: {faltan[:5]}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
