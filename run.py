"""
Script Principal de Lanzamiento de la Plataforma de Análisis Deportivo
Inicia el servidor FastAPI con Uvicorn y abre el dashboard en el navegador web.
"""
import uvicorn
import webbrowser
import threading
import time
import os
import sys

def open_browser():
    """Espera 1.5 segundos a que el servidor esté activo y abre el navegador."""
    time.sleep(1.5)
    url = "http://127.0.0.1:8000"
    print(f"\n[INFO] Abriendo dashboard en: {url}\n")
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"[AVISO] No se pudo abrir el navegador automáticamente: {e}")

if __name__ == "__main__":
    # Asegurar que el directorio de trabajo esté en sys.path
    project_root = os.path.dirname(os.path.abspath(__file__))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)

    print("=" * 70)
    print("  PLATAFORMA DE ANÁLISIS DEPORTIVO, MACHINE LEARNING & BAYES")
    print("  La Liga de España (10 Temporadas, 3.800 Partidos)")
    print("=" * 70)

    # Iniciar hilo para abrir el navegador
    threading.Thread(target=open_browser, daemon=True).start()

    # Ejecutar servidor Uvicorn
    uvicorn.run("src.api.app:app", host="127.0.0.1", port=8000, reload=False, log_level="info")
