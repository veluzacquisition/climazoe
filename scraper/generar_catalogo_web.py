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
ENTRADA_FA = RAIZ / "data" / "catalogo_fibraandina.json"
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


# Dónde entra cada categoría de Fibra Andina.
#
# Los slugs de la izquierda del par NO son inventados: son los que ya usa el
# catálogo de Solphower, para que los dos proveedores caigan en la MISMA
# categoría en vez de quedar en dos listas paralelas. Paneles, baterías,
# inversores y controladores quedan mezclados; medidores y monitoreo son
# líneas que sólo aporta Fibra Andina.
CATEGORIAS_FA = {
    "Paneles Solares": ("paneles-solares", "Paneles Solares"),
    "Inversores": ("inversores", "Inversores"),
    "Baterías": ("baterias", "Baterías"),
    "Controladores MPPT": ("controladores-mppt", "Controladores MPPT"),
    "Medidores": ("medidores", "Medidores"),
    "Unidades de Tráfico": ("monitoreo", "Monitoreo y comunicación"),
}

# --- Reorganización del árbol -------------------------------------------
#
# El árbol que salió del sitemap de Solphower no es el que pidió el dueño.
# Traía un cajón "Inversores y Controladores" que mete dos cosas distintas
# en la misma rama, y una subcategoría "Controladores" con slug UUID —basura
# del CMS del proveedor, no un nombre—.
#
# La taxonomía objetivo es la del negocio: Panel Solar · Inversor · Batería ·
# Controlador MPPT · Medidor. Esto la aplica sobre el árbol ya fusionado.

# Categorías que se absorben en otra: {slug viejo: slug destino}
FUSIONAR_CATEGORIAS = {
    # El cajón "Inversores y Controladores" ES la categoría de inversores.
    "controladores": "inversores",
    # Y su subcategoría "Inversores" de dos ítems no tiene por qué existir
    # aparte del padre que ya se llama así.
    "inversores-solphower": "inversores",
    # Los controladores de carga de Solphower van con los MPPT.
    "controladores-a064e3a3-c285-406c-9427-4e54e6dabf1d": "controladores-mppt",
}

# Orden de la vitrina: primero el equipo principal del sistema fotovoltaico.
ORDEN_CATEGORIAS = [
    "paneles-solares", "inversores", "baterias", "controladores-mppt",
    "medidores", "monitoreo", "protecciones", "estructura-para-paneles",
    "conectores", "lamparas", "colectores-solares", "movilidad-electrica",
]


def reorganizar(productos: list[dict], categorias: list[dict]):
    """Aplica la taxonomía del negocio sobre el árbol fusionado."""
    destino = FUSIONAR_CATEGORIAS

    # 1. Los productos de las categorías absorbidas pasan al destino.
    for p in productos:
        if p.get("categoria") in destino:
            p["categoria"] = destino[p["categoria"]]
        if p.get("subcategoria") in destino:
            nuevo = destino[p["subcategoria"]]
            # Si la subcategoría se absorbió en lo que ya es su padre, el
            # producto se queda sin subcategoría en vez de repetirla.
            p["subcategoria"] = None if nuevo == p.get("categoria") else nuevo

    # 1b. Si la subcategoría de un producto pasó a ser una categoría RAÍZ, el
    # producto se muda con ella: un controlador de carga que colgaba del cajón
    # "Inversores y Controladores" no puede seguir contando como inversor.
    raices_destino = {
        d for d in destino.values()
        if not next((c["parent"] for c in categorias if c["slug"] == d), None)
    }
    for p in productos:
        if p.get("subcategoria") in raices_destino:
            p["categoria"] = p["subcategoria"]
            p["subcategoria"] = None
            p["ruta"] = [
                c["nombre"] for c in categorias if c["slug"] == p["categoria"]
            ] or p["ruta"]

    # 2. Las hijas de una categoría absorbida se recuelgan del destino.
    for c in categorias:
        if c.get("parent") in destino:
            c["parent"] = destino[c["parent"]]

    # 3. Se eliminan las absorbidas y se recuentan todas.
    categorias = [c for c in categorias if c["slug"] not in destino]
    conteo: dict[str, int] = {}
    for p in productos:
        for slug in (p.get("categoria"), p.get("subcategoria")):
            if slug:
                conteo[slug] = conteo.get(slug, 0) + 1
    # El conteo de una madre incluye a sus hijas: es lo que espera el filtro
    # del sitio, que muestra la rama completa.
    vivos = {c["slug"] for c in categorias}
    for c in categorias:
        c["conteo"] = conteo.get(c["slug"], 0)
    categorias = [c for c in categorias if c["conteo"] > 0]

    # 4. Ninguna categoría puede colgar de un padre que ya no existe.
    vivos = {c["slug"] for c in categorias}
    for c in categorias:
        if c.get("parent") and c["parent"] not in vivos:
            c["parent"] = None

    # 5. La ruta (el breadcrumb de la tarjeta) se reconstruye del árbol
    # final. Arrastrar la del scraping deja migas mintiendo: un inversor
    # seguiría diciendo "Inversores y Controladores", una categoría que ya
    # no existe.
    nombres = {c["slug"]: c["nombre"] for c in categorias}
    padres = {c["slug"]: c.get("parent") for c in categorias}

    def camino(slug: str | None) -> list[str]:
        ruta: list[str] = []
        visto: set[str] = set()
        while slug and slug in nombres and slug not in visto:
            visto.add(slug)
            ruta.insert(0, nombres[slug])
            slug = padres.get(slug)
        return ruta

    for p in productos:
        p["ruta"] = camino(p.get("subcategoria") or p.get("categoria"))

    # 6. Orden de vitrina.
    peso = {s: i for i, s in enumerate(ORDEN_CATEGORIAS)}
    categorias.sort(key=lambda c: (peso.get(c["slug"], 99), -c["conteo"]))

    raiz = [c for c in categorias if not c.get("parent")]
    print(f"  árbol reorganizado: {len(raiz)} categorías raíz, {len(categorias)} en total")
    return productos, categorias


def fusionar_fibraandina(productos: list[dict], categorias: list[dict]):
    """Suma el catálogo de Fibra Andina al de Solphower."""
    if not ENTRADA_FA.exists():
        print("  (sin catálogo de Fibra Andina; se omite la fusión)")
        return productos, categorias

    datos = json.loads(ENTRADA_FA.read_text(encoding="utf-8"))
    usados = {p["id"] for p in productos}
    por_slug = {c["slug"]: c for c in categorias}
    nuevos = 0

    for p in datos["productos"]:
        mapa = CATEGORIAS_FA.get(p.get("categoria") or "")
        if not mapa:
            continue
        slug_cat, nombre_cat = mapa

        # El id lleva prefijo de marca, así que no choca con los slugs de
        # Solphower aunque coincida el modelo.
        pid = p["id"]
        if pid in usados:
            continue
        usados.add(pid)

        if slug_cat not in por_slug:
            nueva = {"slug": slug_cat, "nombre": nombre_cat, "parent": None, "conteo": 0}
            categorias.append(nueva)
            por_slug[slug_cat] = nueva
        por_slug[slug_cat]["conteo"] += 1

        productos.append({
            "id": pid,
            "nombre": f"{p['marca']} {p['modelo']}" if p.get("marca") else p["modelo"],
            "sku": p["modelo"],
            "marca": p.get("marca"),
            "categoria": slug_cat,
            "subcategoria": None,
            "ruta": [nombre_cat],
            "resumen": p.get("specs"),
            "descripcion": None,
            "specs": {},
            # Sin precio a propósito: este proveedor no lo publica y estas
            # líneas se cotizan por proyecto.
            "precios": {},
            "disponible": True,
            "unidad": None,
            "imagenes": [p["imagen_local"]] if p.get("imagen_local") else [],
            "videos": [],
            "fichas": (
                [{"nombre": f"Ficha técnica {p['modelo']}", "url": p["ficha_tecnica"]}]
                if p.get("ficha_tecnica") else []
            ),
            "fuente": "fibraandina",
        })
        nuevos += 1

    print(f"  fusionados desde Fibra Andina: {nuevos}")
    return productos, categorias


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
            "fuente": "solphower",
        })

    # --- Fusión con el catálogo del segundo proveedor ----------------------
    #
    # Las dos fuentes se complementan: Solphower cubre protecciones, cables y
    # estructura, y Fibra Andina cubre las líneas donde el otro está flojo
    # —paneles de alta potencia, inversores híbridos, litio, MPPT, medidores—.
    #
    # Sus fichas son distintas y NO se fuerzan al mismo molde: la de Fibra
    # Andina no trae precio ni stock, pero sí marca, modelo y una línea de
    # especificación limpia. Cada producto lleva su `fuente` para saber de
    # dónde salió y poder conciliar precios después con el proveedor correcto.
    productos, categorias = fusionar_fibraandina(productos, categorias)
    productos, categorias = reorganizar(productos, categorias)

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
