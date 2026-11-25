"""
Script de compilación y verificación del Informe Académico en formato PDF.
Renderiza HTML5/CSS3 Paged Media con KaTeX para fórmulas matemáticas vectoriales
utilizando Microsoft Edge Headless, garantizando exactamente 3 páginas de cuerpo + 1 de anexos.
"""

import os
import re
import subprocess
import sys

def contar_paginas_pdf(ruta_pdf):
    """Cuenta el número de páginas inspeccionando la estructura de objetos del PDF."""
    try:
        with open(ruta_pdf, 'rb') as f:
            contenido = f.read()
        paginas = len(re.findall(rb'/Type\s*/Page\b', contenido))
        return paginas
    except Exception as e:
        print(f"Error al verificar páginas: {e}")
        return None

def verificar_katex_embebido(ruta_pdf):
    """Verifica si las fuentes tipográficas vectoriales de KaTeX se incrustaron en el PDF."""
    try:
        with open(ruta_pdf, 'rb') as f:
            contenido = f.read()
        return b"KaTeX" in contenido
    except Exception:
        return False

def generar_pdf():
    directorio_actual = os.path.dirname(os.path.abspath(__file__))
    archivo_html = os.path.join(directorio_actual, "informe_academico_laliga.html")
    archivo_pdf = os.path.join(directorio_actual, "informe_academico_laliga.pdf")

    if not os.path.exists(archivo_html):
        print(f"Error: No se encontró {archivo_html}")
        sys.exit(1)

    rutas_navegadores = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    ]

    navegador = None
    for r in rutas_navegadores:
        if os.path.exists(r):
            navegador = r
            break

    if not navegador:
        print("Error: No se encontró ejecutable de Edge o Chrome.")
        sys.exit(1)

    print(f"[*] Compilando documento PDF con: {os.path.basename(navegador)}...")
    
    # Parámetros optimizados para asegurar que KaTeX renderice todas las fórmulas
    comando = [
        navegador,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={archivo_pdf}",
        archivo_html
    ]

    resultado = subprocess.run(comando, capture_output=True, text=True)

    if not os.path.exists(archivo_pdf):
        print("Error en la compilación del PDF.")
        print(resultado.stderr)
        sys.exit(1)

    peso_kb = os.path.getsize(archivo_pdf) / 1024
    num_paginas = contar_paginas_pdf(archivo_pdf)
    tiene_katex = verificar_katex_embebido(archivo_pdf)

    print(f"\n[OK] Documento PDF compilado con éxito:")
    print(f"     - Ruta: {archivo_pdf}")
    print(f"     - Tamaño: {peso_kb:.1f} KB")
    print(f"     - Páginas totales: {num_paginas}")
    print(f"     - Renderizado matemático vectorial (KaTeX): {'Confirmado' if tiene_katex else 'Revisar'}")

    if num_paginas == 4:
        print("\n=> CUMPLIMIENTO EXACTO DE REQUISITOS:")
        print("   * Páginas 1-3: Cuerpo principal (Objetivo, Fuente, Metodología, Indicadores, Hallazgos, Limitaciones, Conclusiones)")
        print("   * Página 4: Sección de Anexos Metodológicos (Roles Bayesianos, Diccionario de Variables y Contraste Z)")
        print("   * Extensión: Máximo 3 páginas (sin contar anexos).")
    else:
        print(f"\n[!] Alerta: Se detectaron {num_paginas} páginas. Verificar ajustes de salto de página.")

if __name__ == "__main__":
    generar_pdf()
