#!/usr/bin/env python3
"""Carga el catálogo en Supabase.

Orden de trabajo:

  1. Categorías, padres antes que hijos (el árbol se arma con parent_id).
  2. Productos, reconciliados por `slug_proveedor`. Entran APAGADOS.
  3. Imágenes.
  4. Se encienden los productos que quedaron con al menos una imagen.

El paso 4 va aparte porque el trigger `verificar_publicable` rechaza activar
un producto sin imágenes, y en el INSERT el producto todavía no tiene ninguna.

Sobre las imágenes: mientras no haya Cloudinary configurado se guarda la URL
de origen en `url_origen` y `url_cloudinary` queda en null. La vista pública
hace coalesce entre las dos, así que el sitio funciona igual y el día que se
suban las imágenes propias sólo hay que rellenar `url_cloudinary`.

Sobre los precios: se carga `precio_proveedor` como COSTO INTERNO (protegido
por RLS, no sale en la vista pública). Los precios de venta se quedan en null
hasta que se definan; el sitio muestra "Cotizar".

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

from normalizar_texto import normalizar_nombre

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
            valor = valor.strip().strip('"').strip("'")
            if valor:
                valores.setdefault(clave.strip(), valor)
    return valores


def exigir(entorno: dict, *claves: str) -> list[str]:
    faltan = [c for c in claves if not entorno.get(c)]
    if faltan:
        print("Faltan variables en .env.local: " + ", ".join(faltan), file=sys.stderr)
        raise SystemExit(1)
    return [entorno[c] for c in claves]


# --------------------------------------------------------------------------
# categorías
# --------------------------------------------------------------------------

def importar_categorias(sb, categorias: list[dict], dry: bool) -> dict[str, str]:
    """Devuelve {slug_proveedor: id}. Inserta padres antes que hijos."""
    por_slug = {c["slug"]: c for c in categorias}

    def profundidad(c: dict) -> int:
        n, actual = 0, c
        while actual.get("parent_slug") in por_slug and n < 6:
            actual = por_slug[actual["parent_slug"]]
            n += 1
        return n

    ids: dict[str, str] = {}
    for i, cat in enumerate(sorted(categorias, key=profundidad)):
        nombre = normalizar_nombre(cat["nombre"]) or cat["slug"]
        fila = {
            "nombre": nombre,
            "slug": slugificar(nombre),
            "slug_proveedor": cat["slug"],
            "descripcion": cat.get("descripcion"),
            # Si el padre no está en el sitemap, la categoría cuelga de la raíz.
            "parent_id": ids.get(cat.get("parent_slug") or ""),
            "orden": i,
            "activo": True,
        }
        if dry:
            ids[cat["slug"]] = f"dry-{cat['slug']}"
            continue

        res = sb.table("categorias").upsert(fila, on_conflict="slug_proveedor").execute()
        ids[cat["slug"]] = res.data[0]["id"]

    print(f"  categorías procesadas: {len(ids)}")
    return ids


# --------------------------------------------------------------------------
# imágenes
# --------------------------------------------------------------------------

def subir_a_cloudinary(cdn, slug: str, url: str, orden: int, carpeta: str):
    """URL en Cloudinary, o None si falla (queda sirviendo `url_origen`)."""
    try:
        r = cdn.uploader.upload(
            url,
            public_id=f"{carpeta}/{slug}-{orden}",
            overwrite=False,
            resource_type="image",
            transformation=[
                {"width": 1200, "height": 1200, "crop": "limit", "quality": "auto"}
            ],
        )
        return r["secure_url"]
    except Exception as e:  # noqa: BLE001
        print(f"      ✗ Cloudinary {slug}-{orden}: {e}", file=sys.stderr)
        return None


# --------------------------------------------------------------------------
# productos
# --------------------------------------------------------------------------

def importar_productos(sb, cdn, productos, ids_cat, carpeta, dry, limite):
    nuevos = actualizados = activados = con_imagen = 0
    slugs_usados: set[str] = set()

    total = len(productos)
    for i, p in enumerate(productos):
        if limite and i >= limite:
            break

        nombre = normalizar_nombre(p.get("nombre"))
        if not nombre:
            print(f"  ⚠ saltado (sin nombre): {p['id']}")
            continue

        slug = slugificar(nombre)
        if slug in slugs_usados:
            slug = f"{slug}-{p['id'][-6:]}"
        slugs_usados.add(slug)

        # La subcategoría es más específica; si no hay, cuelga de la categoría.
        categoria_id = ids_cat.get(p.get("subcategoria") or p.get("categoria") or "")

        specs = {
            k: v
            for k, v in (p.get("especificaciones") or {}).items()
            if k.lower() not in ("característica", "caracteristica")
        }

        fila = {
            "nombre": nombre,
            "slug": slug,
            "slug_proveedor": p["id"],
            "categoria_id": categoria_id,
            "descripcion_corta": p.get("descripcion_corta"),
            "descripcion_larga": p.get("descripcion_larga"),
            "especificaciones": specs,
            # Costo interno. Los precios de venta NO se tocan acá.
            "precio_proveedor": p.get("precio_proveedor"),
            "moneda": p.get("moneda") or "COP",
            "sku_proveedor": p.get("sku_proveedor"),
            "unidad_venta": p.get("unidad_venta"),
            "disponibilidad": p.get("disponibilidad") or "in_stock",
            "fichas_tecnicas": p.get("fichas_tecnicas") or [],
            "videos": p.get("videos") or [],
            "fuente_url": p.get("fuente_url"),
        }

        print(f"  [{i + 1}/{total}] {nombre}")

        if dry:
            nuevos += 1
            if p.get("imagenes"):
                con_imagen += 1
                activados += 1
            continue

        existente = (
            sb.table("productos").select("id").eq("slug_proveedor", p["id"]).limit(1).execute()
        )
        if existente.data:
            producto_id = existente.data[0]["id"]
            # No se pisan precios de venta, `activo` ni `destacado`: eso es
            # decisión de Clima Zoe, no dato del proveedor.
            sb.table("productos").update(fila).eq("id", producto_id).execute()
            actualizados += 1
        else:
            fila["activo"] = False  # se enciende abajo, cuando tenga imagen
            producto_id = sb.table("productos").insert(fila).execute().data[0]["id"]
            nuevos += 1

        # --- imágenes ---
        ya = (
            sb.table("producto_imagenes")
            .select("id")
            .eq("producto_id", producto_id)
            .limit(1)
            .execute()
        )
        if not ya.data:
            filas_img = []
            for orden, url in enumerate(p.get("imagenes") or []):
                url_cdn = subir_a_cloudinary(cdn, slug, url, orden, carpeta) if cdn else None
                filas_img.append({
                    "producto_id": producto_id,
                    "url_cloudinary": url_cdn,
                    "url_origen": url,
                    "alt": nombre,
                    "orden": orden,
                })
            if filas_img:
                sb.table("producto_imagenes").insert(filas_img).execute()
                ya.data = filas_img

        if ya.data:
            con_imagen += 1
            sb.table("productos").update({"activo": True}).eq("id", producto_id).execute()
            activados += 1

    return nuevos, actualizados, activados, con_imagen


def main() -> int:
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument("--catalogo", type=Path, default=CATALOGO)
    ap.add_argument("--dry-run", action="store_true", help="no escribe nada")
    ap.add_argument("--limite", type=int, help="máximo de productos")
    ap.add_argument(
        "--sin-cloudinary",
        action="store_true",
        help="guarda sólo la URL de origen, sin subir imágenes",
    )
    args = ap.parse_args()

    datos = json.loads(args.catalogo.read_text(encoding="utf-8"))
    entorno = cargar_entorno()
    carpeta = entorno.get("CLOUDINARY_FOLDER", "climazoe/productos")

    sb = cdn = None
    if not args.dry_run:
        url, key = exigir(entorno, "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY")
        from supabase import create_client  # noqa: PLC0415

        sb = create_client(url, key)

        tiene_cdn = all(
            entorno.get(k)
            for k in ("CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET")
        )
        if tiene_cdn and not args.sin_cloudinary:
            import cloudinary  # noqa: PLC0415
            import cloudinary.uploader  # noqa: F401,PLC0415  (registra .uploader)

            cloudinary.config(
                cloud_name=entorno["CLOUDINARY_CLOUD_NAME"],
                api_key=entorno["CLOUDINARY_API_KEY"],
                api_secret=entorno["CLOUDINARY_API_SECRET"],
                secure=True,
            )
            cdn = cloudinary
        else:
            print("→ sin Cloudinary: se guardan las URL de origen\n")

    print(f"Categorías ({len(datos['categorias'])})")
    ids_cat = importar_categorias(sb, datos["categorias"], args.dry_run)

    print(f"\nProductos ({len(datos['productos'])})")
    nuevos, actualizados, activados, con_imagen = importar_productos(
        sb, cdn, datos["productos"], ids_cat, carpeta, args.dry_run, args.limite
    )

    print(f"\n{'[DRY RUN] ' if args.dry_run else ''}Resumen")
    print(f"  nuevos:       {nuevos}")
    print(f"  actualizados: {actualizados}")
    print(f"  con imagen:   {con_imagen}")
    print(f"  publicados:   {activados}")
    print(
        "\nLos precios de venta quedan vacíos a propósito: se cargan después de "
        "cerrar la lista con el proveedor. Hasta entonces el sitio dice 'Cotizar'."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
