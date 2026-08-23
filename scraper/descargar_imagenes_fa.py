#!/usr/bin/env python3
"""Baja las imágenes de producto de Fibra Andina y las optimiza.

Se re-alojan en vez de enlazarlas: los originales viven en el CDN de otra
empresa, y colgarse de ahí es frágil (pueden moverlas o bloquearnos) y además
les consume ancho de banda. Son fotos de producto de fabricante —Deye, Must
Solar, Luxen— de equipos que Clima Zoe comercializa.

Los PNG originales pesan ~414 KB cada uno (24 MB en total). Convertidos a
WebP a 700px quedan en una fracción, que sí es razonable servir desde el
propio sitio.

Salida: public/productos/<id>.webp
"""

from __future__ import annotations

import io
import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ENTRADA = RAIZ / "data" / "catalogo_fibraandina.json"
DESTINO = RAIZ / "public" / "productos"
ANCHO = 700
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0"


def main() -> int:
    datos = json.loads(ENTRADA.read_text(encoding="utf-8"))
    DESTINO.mkdir(parents=True, exist_ok=True)

    bajadas = saltadas = fallidas = sin_foto = 0
    peso = 0

    for p in datos["productos"]:
        url = p.get("imagen")
        if not url:
            continue
        destino = DESTINO / f"{p['id']}.webp"
        if destino.exists():
            saltadas += 1
            p["imagen_local"] = f"/productos/{destino.name}"
            continue

        try:
            # Dos modelos llevan espacio en el nombre del archivo y urllib
            # rechaza la URL sin codificar.
            seguro = urllib.parse.quote(url, safe=":/?#[]@!$&'()*+,;=%~")
            req = urllib.request.Request(seguro, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=40) as r:
                crudo = r.read()
            im = Image.open(io.BytesIO(crudo)).convert("RGBA")
            # Se recorta el margen transparente: muchas vienen con aire de
            # sobra y así la foto llena la tarjeta.
            caja = im.getbbox()
            if not caja:
                # Su CDN sirve algunos productos como un PNG 2400x2400
                # completamente transparente —un hueco, no una foto—. Guardarlo
                # deja un recuadro vacío en la tarjeta, peor que no tener nada:
                # se queda sin `imagen_local` y el sitio pinta su marcador.
                print(f"  ○ {p['modelo']}: el original está en blanco, se omite")
                p.pop("imagen_local", None)
                destino.unlink(missing_ok=True)
                sin_foto += 1
                continue
            im = im.crop(caja)
            if im.width > ANCHO:
                alto = round(im.height * ANCHO / im.width)
                im = im.resize((ANCHO, alto), Image.LANCZOS)
            im.save(destino, format="WEBP", quality=86, method=6)
            peso += destino.stat().st_size
            bajadas += 1
            p["imagen_local"] = f"/productos/{destino.name}"
        except Exception as e:  # noqa: BLE001
            print(f"  ✗ {p['modelo']}: {e}", file=sys.stderr)
            fallidas += 1

    ENTRADA.write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")

    total = sum(f.stat().st_size for f in DESTINO.glob("*.webp"))
    print(f"✓ bajadas {bajadas}   ya estaban {saltadas}   en blanco en el origen {sin_foto}   fallidas {fallidas}")
    print(f"  peso total en el repo: {total/1024/1024:.1f} MB "
          f"({total/max(1,len(list(DESTINO.glob('*.webp'))))/1024:.0f} KB por imagen)")
    return 1 if fallidas else 0


if __name__ == "__main__":
    raise SystemExit(main())
