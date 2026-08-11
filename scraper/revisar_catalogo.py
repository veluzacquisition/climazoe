#!/usr/bin/env python3
"""Resumen del JSON del scraping, para revisarlo antes de subirlo a Supabase.

Responde lo que hay que saber antes de importar: qué categorías quedaron, qué
tan completo viene cada producto y qué huecos habrá que llenar a mano o
pidiéndoselos al proveedor.

    python revisar_catalogo.py [ruta_json]
"""

from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
POR_DEFECTO = RAIZ / "data" / "catalogo_solphower.json"


def barra(n: int, total: int, ancho: int = 24) -> str:
    llenos = round(ancho * n / total) if total else 0
    return "█" * llenos + "·" * (ancho - llenos)


def main() -> int:
    ruta = Path(sys.argv[1]) if len(sys.argv) > 1 else POR_DEFECTO
    datos = json.loads(ruta.read_text(encoding="utf-8"))
    cats = datos["categorias"]
    prods = datos["productos"]
    total = len(prods)

    print(f"\n{'=' * 68}")
    print(f"  CATÁLOGO SOLPHOWER — {ruta.name}")
    print(f"  generado: {datos['generado_en']}")
    print(f"{'=' * 68}\n")

    print(f"Categorías: {len(cats)}   Productos: {total}   Fallos: {len(datos['fallos'])}\n")

    # --- árbol de categorías ---------------------------------------------
    print("ÁRBOL DE CATEGORÍAS")
    print("-" * 68)
    por_cat = Counter(p["categoria"] for p in prods)
    por_sub = Counter(p["subcategoria"] for p in prods if p["subcategoria"])
    raices = [c for c in cats if not c["parent_slug"]]
    for r in sorted(raices, key=lambda c: -por_cat.get(c["slug"], 0)):
        print(f"  {r['nombre']:<34} {por_cat.get(r['slug'], 0):>4} productos")
        hijos = [c for c in cats if c["parent_slug"] == r["slug"]]
        for h in sorted(hijos, key=lambda c: -por_sub.get(c["slug"], 0)):
            print(f"    └ {h['nombre']:<30} {por_sub.get(h['slug'], 0):>4}")
    huerfanas = [c for c in cats if c["parent_slug"] and not any(o["slug"] == c["parent_slug"] for o in cats)]
    if huerfanas:
        print(f"\n  ⚠ categorías con padre fuera del sitemap: {[c['slug'] for c in huerfanas]}")

    # --- completitud de campos -------------------------------------------
    print(f"\nCOMPLETITUD DE CAMPOS ({total} productos)")
    print("-" * 68)
    campos = [
        ("nombre", lambda p: bool(p["nombre"])),
        ("SKU proveedor", lambda p: bool(p["sku_proveedor"])),
        ("precio", lambda p: p["precio_proveedor"] is not None),
        ("descripción corta", lambda p: bool(p["descripcion_corta"])),
        ("descripción larga", lambda p: bool(p["descripcion_larga"])),
        ("especificaciones", lambda p: bool(p["especificaciones"])),
        ("≥1 imagen", lambda p: len(p["imagenes"]) > 0),
        ("≥2 imágenes", lambda p: len(p["imagenes"]) > 1),
        ("ficha técnica PDF", lambda p: bool(p["fichas_tecnicas"])),
        ("video", lambda p: bool(p["videos"])),
        ("subcategoría", lambda p: bool(p["subcategoria"])),
    ]
    for nombre, test in campos:
        n = sum(1 for p in prods if test(p))
        pct = 100 * n / total if total else 0
        print(f"  {nombre:<20} {barra(n, total)} {n:>4}/{total}  {pct:5.1f}%")

    # --- precios ----------------------------------------------------------
    precios = sorted(p["precio_proveedor"] for p in prods if p["precio_proveedor"])
    if precios:
        print("\nPRECIOS DEL PROVEEDOR (referencia interna, COP)")
        print("-" * 68)
        med = precios[len(precios) // 2]
        print(f"  mínimo  $ {precios[0]:>14,.0f}")
        print(f"  mediana $ {med:>14,.0f}")
        print(f"  máximo  $ {precios[-1]:>14,.0f}")
        con_desc = [p for p in prods if p["descuento_pct"]]
        print(f"  con descuento vigente: {len(con_desc)} productos")

    # --- disponibilidad ----------------------------------------------------
    print("\nDISPONIBILIDAD")
    print("-" * 68)
    for estado, n in Counter(p["disponibilidad"] for p in prods).most_common():
        print(f"  {str(estado):<20} {n:>4}")

    # --- lo que hay que arreglar a mano ------------------------------------
    print("\nREVISAR A MANO")
    print("-" * 68)
    sin_precio = [p for p in prods if not p["precio_proveedor"]]
    sin_img = [p for p in prods if not p["imagenes"]]
    sin_sku = [p for p in prods if not p["sku_proveedor"]]
    sin_cat = [p for p in prods if not p["categoria"]]
    for etiqueta, lista in [
        ("sin precio", sin_precio),
        ("sin imagen", sin_img),
        ("sin SKU", sin_sku),
        ("sin categoría", sin_cat),
    ]:
        if not lista:
            print(f"  ✓ ninguno {etiqueta}")
            continue
        print(f"  ⚠ {len(lista)} {etiqueta}:")
        for p in lista[:8]:
            print(f"      · {p['nombre']}  ({p['id']})")
        if len(lista) > 8:
            print(f"      … y {len(lista) - 8} más")

    # SKUs repetidos: romperían el índice único de la tabla productos.
    dup = [s for s, n in Counter(p["sku_proveedor"] for p in prods if p["sku_proveedor"]).items() if n > 1]
    if dup:
        print(f"  ⚠ {len(dup)} SKU repetidos (chocarían con el índice único): {dup[:6]}")
    else:
        print("  ✓ no hay SKU repetidos")

    print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
