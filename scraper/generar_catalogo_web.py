#!/usr/bin/env python3
"""Genera public/data/catalogo.json: la versión del catálogo que ve el navegador.

Por qué existe este paso en vez de importar el JSON del scraper directo:

  * `data/catalogo_solphower.json` tiene `precio_proveedor`, que es el COSTO
    interno. Ese archivo está fuera del repo a propósito. Cualquier cosa que
    importe el frontend termina en el bundle público, así que el costo no
    puede pasar de acá.
  * Los precios de venta se calculan ACÁ, no en el navegador, aplicando el
    margen sobre el costo. Así el bundle sólo lleva el precio final y el costo
    nunca sale de esta máquina.

Mientras no haya margen acordado con el proveedor, se corre sin `--margen-*`:
el catálogo sale sin precios y el sitio muestra "Cotizar" en vez de un número.

    # hoy: catálogo sin precios
    ./.venv/bin/python generar_catalogo_web.py

    # después de cerrar precios con el proveedor
    ./.venv/bin/python generar_catalogo_web.py --margen-minorista 35 --margen-mayorista 18
"""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from pathlib import Path

from normalizar_texto import normalizar_nombre

RAIZ = Path(__file__).resolve().parent.parent
ENTRADA = RAIZ / "data" / "catalogo_solphower.json"
SALIDA = RAIZ / "public" / "data" / "catalogo.json"

# Campos del scraper que NUNCA deben llegar al navegador.
CAMPOS_INTERNOS = {"precio_proveedor", "precio_lista_proveedor", "producto_id_proveedor"}


def slugificar(texto: str) -> str:
    base = unicodedata.normalize("NFD", texto)
    base = "".join(c for c in base if unicodedata.category(c) != "Mn")
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", base.lower())).strip("-")


def redondear_comercial(valor: float) -> int:
    """Deja precios que se leen como precios: al millar más cercano."""
    return int(round(valor / 1000.0) * 1000)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--entrada", type=Path, default=ENTRADA)
    ap.add_argument("--salida", type=Path, default=SALIDA)
    ap.add_argument("--margen-minorista", type=float, help="%% sobre el costo para cliente final")
    ap.add_argument("--margen-mayorista", type=float, help="%% sobre el costo para empresas")
    args = ap.parse_args()

    datos = json.loads(args.entrada.read_text(encoding="utf-8"))
    cats_origen = datos["categorias"]
    prods_origen = datos["productos"]

    # --- categorías: sólo las que tienen producto, con su conteo -----------
    conteo: dict[str, int] = {}
    for p in prods_origen:
        for slug in (p.get("categoria"), p.get("subcategoria")):
            if slug:
                conteo[slug] = conteo.get(slug, 0) + 1

    por_slug = {c["slug"]: c for c in cats_origen}
    categorias = []
    for c in cats_origen:
        n = conteo.get(c["slug"], 0)
        if not n:
            continue  # categorías vacías no se muestran
        padre = c.get("parent_slug")
        # Si el padre no vino en el sitemap, se cuelga de la raíz.
        if padre and padre not in por_slug:
            padre = None
        categorias.append({
            "slug": c["slug"],
            "nombre": normalizar_nombre(c["nombre"]),
            "parent": padre,
            "conteo": n,
        })

    # --- productos ---------------------------------------------------------
    productos = []
    slugs: set[str] = set()
    for p in prods_origen:
        if not p.get("nombre") or not p.get("imagenes"):
            continue

        slug = slugificar(p["nombre"])
        if slug in slugs:
            slug = f"{slug}-{p['id'][-6:]}"
        slugs.add(slug)

        costo = p.get("precio_proveedor")
        precios: dict[str, int] = {}
        if costo:
            if args.margen_minorista is not None:
                precios["minorista"] = redondear_comercial(costo * (1 + args.margen_minorista / 100))
            if args.margen_mayorista is not None:
                precios["mayorista"] = redondear_comercial(costo * (1 + args.margen_mayorista / 100))

        # Las specs vienen con una clave basura ("característica": "Especificación")
        # que es el encabezado de la tabla del proveedor, no un dato.
        specs = {
            k: v for k, v in (p.get("especificaciones") or {}).items()
            if k.lower() not in ("característica", "caracteristica")
        }

        productos.append({
            "id": slug,
            "nombre": normalizar_nombre(p["nombre"]),
            "sku": p.get("sku_proveedor"),
            "categoria": p.get("categoria"),
            "subcategoria": p.get("subcategoria"),
            "ruta": [normalizar_nombre(r) for r in (p.get("ruta_categorias") or [])],
            "resumen": p.get("descripcion_corta"),
            "descripcion": p.get("descripcion_larga"),
            "specs": specs,
            "precios": precios,
            "disponible": p.get("disponibilidad") != "out_of_stock",
            "unidad": p.get("unidad_venta"),
            "imagenes": p["imagenes"],
            "videos": p.get("videos") or [],
            "fichas": p.get("fichas_tecnicas") or [],
        })

    salida = {
        "generado_en": datos.get("generado_en"),
        "con_precios": bool(args.margen_minorista is not None or args.margen_mayorista is not None),
        "categorias": categorias,
        "productos": productos,
    }

    # Red de seguridad: que nunca se escape un campo interno.
    crudo = json.dumps(salida, ensure_ascii=False)
    for campo in CAMPOS_INTERNOS:
        assert campo not in crudo, f"FUGA: '{campo}' llegó al catálogo público"

    args.salida.parent.mkdir(parents=True, exist_ok=True)
    args.salida.write_text(json.dumps(salida, ensure_ascii=False, indent=1), encoding="utf-8")

    kb = args.salida.stat().st_size / 1024
    print(f"✓ {args.salida.relative_to(RAIZ)}  ({kb:.0f} KB)")
    print(f"  categorías: {len(categorias)}   productos: {len(productos)}")
    print(f"  con precios: {'sí' if salida['con_precios'] else 'no — el sitio mostrará Cotizar'}")
    print("  sin costos del proveedor: verificado")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
