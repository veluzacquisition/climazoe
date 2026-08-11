#!/usr/bin/env python3
"""Importa data/catalogo_solphower.json a Cloudinary + Supabase (Fase 2).

Qué hace, en orden:

  1. Crea/actualiza el árbol de `categorias` (padres antes que hijos).
  2. Sube cada imagen a Cloudinary con un `public_id` determinista, así que
     re-correr el script no duplica imágenes.
  3. Hace upsert de `productos` por `slug_proveedor` (el slug de URL del
     proveedor). No por SKU: el proveedor repite SKU entre productos
     distintos y deja 47 sin SKU.

Reglas que respeta a propósito:

  * `precio_proveedor` entra como COSTO INTERNO. Los precios de venta
    (`precio_minorista` / `precio_mayorista`) quedan en NULL: se definen tras
    la llamada con el proveedor, no se copian del catálogo ajeno.
  * Todo producto nuevo entra con `activo = false`. Se publica cuando tiene
    precio propio e imagen real (el trigger de Postgres lo verifica).
  * Un producto ya existente NO se le pisan los precios de venta ni el estado
    `activo`: el script sólo refresca datos del proveedor.

Uso:
    ./.venv/bin/pip install -r requirements-import.txt
    ./.venv/bin/python importar_a_supabase.py --dry-run
    ./.venv/bin/python importar_a_supabase.py
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CATALOGO = RAIZ / "data" / "catalogo_solphower.json"


def slugificar(texto: str) -> str:
    base = unicodedata.normalize("NFD", texto)
    base = "".join(c for c in base if unicodedata.category(c) != "Mn")
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", base.lower())).strip("-")


def cargar_entorno() -> dict:
    """Lee .env / .env.local sin dependencias externas."""
    valores = dict(os.environ)
    for nombre in (".env", ".env.local"):
        archivo = RAIZ / nombre
        if not archivo.exists():
            continue
        for linea in archivo.read_text(encoding="utf-8").splitlines():
            linea = linea.strip()
            if not linea or linea.startswith("#") or "=" not in linea:
                continue
            clave, _, valor = linea.partition("=")
            valores.setdefault(clave.strip(), valor.strip().strip('"').strip("'"))
    return valores


def exigir(entorno: dict, *claves: str) -> list[str]:
    faltan = [c for c in claves if not entorno.get(c)]
    if faltan:
        print(
            "Faltan variables de entorno: " + ", ".join(faltan) +
            "\nLlenalas en .env.local (ver .env.example).",
            file=sys.stderr,
        )
        raise SystemExit(1)
    return [entorno[c] for c in claves]


# --------------------------------------------------------------------------
# categorías
# --------------------------------------------------------------------------

def importar_categorias(sb, categorias: list[dict], dry: bool) -> dict[str, str]:
    """Devuelve {slug_proveedor: id_uuid}. Inserta padres antes que hijos."""
    por_slug = {c["slug"]: c for c in categorias}
    ids: dict[str, str] = {}

    def profundidad(c: dict) -> int:
        n, actual = 0, c
        while actual.get("parent_slug") and actual["parent_slug"] in por_slug and n < 6:
            actual = por_slug[actual["parent_slug"]]
            n += 1
        return n

    for i, cat in enumerate(sorted(categorias, key=profundidad)):
        fila = {
            "nombre": cat["nombre"],
            "slug": slugificar(cat["nombre"] or cat["slug"]),
            "slug_proveedor": cat["slug"],
            "descripcion": cat.get("descripcion"),
            "parent_id": ids.get(cat.get("parent_slug") or ""),
            "orden": i,
            "activo": True,
        }
        if dry:
            print(f"  [dry] categoría {fila['slug']} (padre={cat.get('parent_slug')})")
            ids[cat["slug"]] = f"dry-{cat['slug']}"
            continue

        res = (
            sb.table("categorias")
            .upsert(fila, on_conflict="slug_proveedor")
            .execute()
        )
        ids[cat["slug"]] = res.data[0]["id"]
    return ids


# --------------------------------------------------------------------------
# imágenes
# --------------------------------------------------------------------------

def subir_imagenes(cdn, producto: dict, carpeta: str, dry: bool) -> list[dict]:
    """Sube al Cloudinary con public_id determinista (idempotente)."""
    subidas = []
    for orden, url in enumerate(producto["imagenes"]):
        public_id = f"{carpeta}/{producto['id']}-{orden}"
        if dry:
            print(f"      [dry] imagen -> {public_id}")
            subidas.append({"url_cloudinary": f"dry://{public_id}", "url_origen": url, "orden": orden})
            continue
        try:
            r = cdn.uploader.upload(
                url,
                public_id=public_id,
                overwrite=False,
                resource_type="image",
                # El proveedor sirve JPG/WEBP grandes; se normaliza al subir.
                transformation=[{"width": 1200, "height": 1200, "crop": "limit", "quality": "auto"}],
            )
        except Exception as e:  # noqa: BLE001
            print(f"      ✗ imagen {orden} de {producto['id']}: {e}", file=sys.stderr)
            continue
        subidas.append(
            {"url_cloudinary": r["secure_url"], "url_origen": url, "orden": orden}
        )
    return subidas


# --------------------------------------------------------------------------
# productos
# --------------------------------------------------------------------------

def importar_productos(sb, cloud, productos, ids_cat, carpeta, dry, limite):
    nuevos = actualizados = 0
    # `productos.slug` es único. Hoy no hay colisiones, pero dos productos
    # pueden terminar con el mismo nombre en un sync futuro.
    slugs_usados: set[str] = set()

    for i, p in enumerate(productos):
        if limite and i >= limite:
            break
        if not p["nombre"]:
            print(f"  ⚠ saltado (sin nombre): {p['id']}")
            continue

        # La subcategoría es más específica; si no hay, cuelga de la categoría.
        slug_cat = p.get("subcategoria") or p.get("categoria")
        categoria_id = ids_cat.get(slug_cat or "")

        slug = slugificar(p["nombre"])
        if slug in slugs_usados:
            slug = f"{slug}-{p['id'][-8:]}"
        slugs_usados.add(slug)

        fila = {
            "nombre": p["nombre"],
            "slug": slug,
            "slug_proveedor": p["id"],
            "categoria_id": categoria_id,
            "descripcion_corta": p.get("descripcion_corta"),
            "descripcion_larga": p.get("descripcion_larga"),
            "especificaciones": p.get("especificaciones") or {},
            # Costo interno. Los precios de venta se dejan intactos a propósito.
            "precio_proveedor": p.get("precio_proveedor"),
            "moneda": p.get("moneda") or "COP",
            "sku_proveedor": p.get("sku_proveedor"),
            "disponibilidad": p.get("disponibilidad") or "in_stock",
            "fichas_tecnicas": p.get("fichas_tecnicas") or [],
            "fuente_url": p.get("fuente_url"),
        }

        print(f"  [{i + 1}/{len(productos)}] {p['nombre']}")

        if dry:
            subir_imagenes(cloud, p, carpeta, dry=True)
            nuevos += 1
            continue

        # Se reconcilia por el slug del proveedor, no por SKU: el proveedor
        # repite SKU entre productos distintos y deja 47 sin SKU.
        r = (
            sb.table("productos")
            .select("id")
            .eq("slug_proveedor", fila["slug_proveedor"])
            .limit(1)
            .execute()
        )
        existente = r.data[0]["id"] if r.data else None

        if existente:
            sb.table("productos").update(fila).eq("id", existente).execute()
            producto_id = existente
            actualizados += 1
        else:
            # Nuevo: nace apagado hasta tener precio propio e imagen.
            fila["activo"] = False
            r = sb.table("productos").insert(fila).execute()
            producto_id = r.data[0]["id"]
            nuevos += 1

        ya_tiene = (
            sb.table("producto_imagenes")
            .select("id")
            .eq("producto_id", producto_id)
            .limit(1)
            .execute()
        )
        if not ya_tiene.data:
            for img in subir_imagenes(cloud, p, carpeta, dry=False):
                sb.table("producto_imagenes").insert(
                    {**img, "producto_id": producto_id, "alt": p["nombre"]}
                ).execute()

    return nuevos, actualizados


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--catalogo", type=Path, default=CATALOGO)
    ap.add_argument("--dry-run", action="store_true", help="no escribe nada, sólo muestra el plan")
    ap.add_argument("--limite", type=int, help="máximo de productos a importar")
    args = ap.parse_args()

    datos = json.loads(args.catalogo.read_text(encoding="utf-8"))
    entorno = cargar_entorno()

    sb = cloud = None
    carpeta = entorno.get("CLOUDINARY_FOLDER", "climazoe/productos")

    if not args.dry_run:
        url, key = exigir(entorno, "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY")
        cn, ck, cs = exigir(
            entorno, "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"
        )
        from supabase import create_client  # noqa: PLC0415
        import cloudinary  # noqa: PLC0415
        import cloudinary.uploader  # noqa: F401,PLC0415  (registra cloudinary.uploader)

        sb = create_client(url, key)
        cloudinary.config(cloud_name=cn, api_key=ck, api_secret=cs, secure=True)
        cloud = cloudinary

    print(f"\nCategorías ({len(datos['categorias'])})")
    ids_cat = importar_categorias(sb, datos["categorias"], args.dry_run)

    print(f"\nProductos ({len(datos['productos'])})")
    nuevos, actualizados = importar_productos(
        sb, cloud, datos["productos"], ids_cat, carpeta, args.dry_run, args.limite
    )

    print(f"\n{'[DRY RUN] ' if args.dry_run else ''}nuevos: {nuevos}  actualizados: {actualizados}")
    print(
        "Recordá: todo entra con activo=false y sin precio de venta. "
        "Los precios se cargan después de la llamada con el proveedor."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
