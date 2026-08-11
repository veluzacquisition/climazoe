"""Arregla el Title Case del proveedor.

Solphower guarda los nombres capitalizando cada palabra, así que llegan cosas
como "Batería Srp Litio 12,8v 200ah" o "Adaptador Ev Tipo 1 A Gb/T". Puesto
tal cual en el catálogo de Clima Zoe se ve descuidado y, peor, esconde los
datos técnicos: "200ah" cuesta más de leer que "200Ah".

Se corrigen tres cosas y nada más:
  1. Siglas y marcas que van en mayúscula (SRP, EV, GB/T, ESS, MPPT…).
  2. Unidades pegadas a un número (200ah -> 200Ah, 12,8v -> 12,8V, 5kw -> 5kW).
  3. Conectores en minúscula cuando no abren la frase (De -> de, Para -> para).

No se toca nada más: si el proveedor escribió mal un modelo, se respeta.
"""

from __future__ import annotations

import re

# Siglas, normas y marcas. La clave se compara en minúscula.
SIGLAS = {
    "ac": "AC", "dc": "DC", "ac/dc": "AC/DC", "led": "LED", "ev": "EV",
    "srp": "SRP", "ess": "ESS", "gbt": "GBT", "gb/t": "GB/T",
    "ccs": "CCS", "ccs1": "CCS1", "ccs2": "CCS2", "mppt": "MPPT",
    "pwm": "PWM", "lcd": "LCD", "pv": "PV", "usb": "USB", "ip65": "IP65",
    "ip55": "IP55", "ip67": "IP67", "ul": "UL", "dps": "DPS", "agm": "AGM",
    "bms": "BMS", "rv": "RV", "ups": "UPS", "smd": "SMD", "abs": "ABS",
    "pvc": "PVC", "wifi": "WiFi", "iot": "IoT", "usa": "USA",
    "jkbms": "JKBMS", "epever": "EPEVER", "victron": "Victron",
    "ja": "JA", "us": "US",  # JA Solar, Fox ESS H1 US
}

# Unidades pegadas a un número. Se escriben como las escribe un técnico.
UNIDADES = {
    "ah": "Ah", "wh": "Wh", "kwh": "kWh", "mwh": "MWh",
    "kw": "kW", "mw": "MW", "w": "W", "kva": "kVA", "va": "VA",
    "v": "V", "kv": "kV", "a": "A", "ma": "mA",
    "hz": "Hz", "mm2": "mm²", "mm": "mm", "cm": "cm", "kg": "kg",
}

# Conectores que no van en mayúscula salvo al inicio.
CONECTORES = {
    "de", "del", "la", "las", "el", "los", "y", "e", "o", "u", "a", "al",
    "en", "con", "sin", "para", "por", "sobre",
}
# Ojo: "tipo" NO va acá. En este catálogo "Tipo 1" y "Tipo 2" son
# designaciones de conector de carga, no la palabra común.

# Unidades de una sola letra: sólo cuentan pegadas al número. Con espacio de
# por medio son ambiguas — en "Adaptador EV Tipo 1 A GB/T" esa "A" es la
# preposición "a", no amperios.
_UNA_LETRA = {u for u in UNIDADES if len(u) == 1}


def _unidad(m: re.Match) -> str:
    numero, unidad = m.group(1), m.group(2).lower()
    return f"{numero}{UNIDADES.get(unidad, m.group(2))}"


def normalizar_nombre(texto: str | None) -> str | None:
    """"Batería Srp Litio 12,8v 200ah" -> "Batería SRP Litio 12,8V 200Ah"."""
    if not texto:
        return texto

    # 1) Unidades, antes de tocar palabras sueltas. Las de varias letras
    #    admiten espacio ("500 kWh"); las de una sola, no (ver _UNA_LETRA).
    largas = [u for u in UNIDADES if len(u) > 1]
    texto = re.compile(
        r"(\d+(?:[.,]\d+)?)\s?(" + "|".join(sorted(largas, key=len, reverse=True)) + r")\b",
        re.IGNORECASE,
    ).sub(_unidad, texto)
    texto = re.compile(
        r"(\d+(?:[.,]\d+)?)(" + "|".join(sorted(_UNA_LETRA)) + r")\b",
        re.IGNORECASE,
    ).sub(_unidad, texto)

    # 2) Palabra por palabra, conservando la puntuación pegada.
    palabras = texto.split(" ")
    salida: list[str] = []
    for i, palabra in enumerate(palabras):
        if not palabra:
            salida.append(palabra)
            continue

        nucleo = palabra.strip(".,;:()[]")
        prefijo = palabra[: len(palabra) - len(palabra.lstrip(".,;:()[]"))]
        sufijo = palabra[len(prefijo) + len(nucleo):]
        bajo = nucleo.lower()

        if bajo in SIGLAS:
            nucleo = SIGLAS[bajo]
        elif bajo in CONECTORES and i > 0:
            # "Tipo 2" al inicio sí va en mayúscula; en medio, no.
            nucleo = bajo
        elif re.fullmatch(r"[A-Za-z]{1,3}\d+[A-Za-z]?", nucleo):
            # Códigos de modelo: Cq7 -> CQ7, Ep12 -> EP12, H3 -> H3.
            nucleo = nucleo.upper()
        elif re.fullmatch(r"\d+[A-Za-z]", nucleo):
            # Formatos de polos y calibres: 2p -> 2P.
            nucleo = nucleo.upper()
        # Si ya tiene una unidad correcta (200Ah) o mezcla mayúsculas
        # deliberadas (H3, CQ7), se deja como está.

        salida.append(prefijo + nucleo + sufijo)

    resultado = " ".join(salida)

    # 3) La primera letra siempre en mayúscula.
    for i, c in enumerate(resultado):
        if c.isalpha():
            return resultado[:i] + c.upper() + resultado[i + 1:]
    return resultado
