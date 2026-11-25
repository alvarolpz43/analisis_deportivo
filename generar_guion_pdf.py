"""
Script de compilación y verificación del Guion de Exposición en formato PDF.
Renderiza guion_exposicion_laliga.html con KaTeX mediante Microsoft Edge / Chrome Headless.
"""
import os
import re
import subprocess
import sys


def contar_paginas_pdf(ruta_pdf: str):
    """Cuenta el número de páginas inspeccionando la estructura interna del PDF."""
    try:
        with open(ruta_pdf, "rb") as f:
            contenido = f.read()
        return len(re.findall(rb"/Type\s*/Page\b", contenido))
    except Exception as e:
        print(f"Error al contar páginas: {e}")
        return None


def verificar_katex_embebido(ruta_pdf: str) -> bool:
    """Verifica si las fuentes tipográficas vectoriales de KaTeX se incrustaron en el PDF."""
    try:
        with open(ruta_pdf, "rb") as f:
            return b"KaTeX" in f.read()
    except Exception:
        return False


def generar_guion_pdf() -> str:
    directorio_actual = os.path.dirname(os.path.abspath(__file__))
    archivo_html = os.path.join(directorio_actual, "guion_exposicion_laliga.html")
    archivo_pdf = os.path.join(directorio_actual, "guion_exposicion_laliga.pdf")

    if not os.path.exists(archivo_html):
        print(f"Error: No se encontró {archivo_html}")
        sys.exit(1)

    rutas_navegadores = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]

    navegador = next((r for r in rutas_navegadores if os.path.exists(r)), None)
    if not navegador:
        print("Error: No se encontró Microsoft Edge o Google Chrome instalado.")
        sys.exit(1)

    print(f"[*] Compilando guion PDF con {os.path.basename(navegador)}...")
    comando = [
        navegador,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=3000",
        f"--print-to-pdf={archivo_pdf}",
        archivo_html,
    ]

    resultado = subprocess.run(comando, capture_output=True, text=True)
    if not os.path.exists(archivo_pdf):
        print("Error en la compilación del PDF.")
        print(resultado.stderr)
        sys.exit(1)

    peso_kb = os.path.getsize(archivo_pdf) / 1024.0
    num_paginas = contar_paginas_pdf(archivo_pdf)
    tiene_katex = verificar_katex_embebido(archivo_pdf)

    print("\n[OK] Guion PDF compilado con éxito:")
    print(f"     - Ruta: {archivo_pdf}")
    print(f"     - Tamaño: {peso_kb:.1f} KB")
    print(f"     - Páginas totales: {num_paginas}")
    print(f"     - Renderizado matemático KaTeX: {'Confirmado' if tiene_katex else 'Revisar'}")
    return archivo_pdf


if __name__ == "__main__":
    generar_guion_pdf()
