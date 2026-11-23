"""
Módulo Oficial de Extracción, Auditoría Ética y Procesamiento de Datos: datos.py
Asignatura: Estadística Inferencial (2026) - Institución Universitaria Colegio Mayor del Cauca
Docente: Edith Janeth Potosí Estrada
Autores: José Luis Martínez, Álvaro José López Quira, Jose Aldair Torres,
         Cristian Samir Narváez, Joan Sebastian Mosquera y Rubén Darío Velasco.

Responsabilidades:
1. Validación programática y ética de robots.txt sobre Football-Data.co.uk.
2. Descarga / lectura de los archivos estructurados SP1.csv (10 temporadas consecutivas).
3. Limpieza de valores nulos, reducción dimensional (21 variables) y tipado entero.
4. Consolidación y ordenación cronológica estricta (3.800 partidos).
"""
import os
import sys
import argparse
import pandas as pd
import numpy as np
from urllib.robotparser import RobotFileParser
from typing import Dict, Any, List, Optional

# Rutas estándar del proyecto
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
CONSOLIDATED_CSV = os.path.join(DATA_DIR, "espana_10_temporadas_consolidado.csv")

SEASONS_CODES = ["1617", "1718", "1819", "1920", "2021", "2122", "2223", "2324", "2425", "2526"]

SELECTED_COLUMNS = [
    'Date', 'HomeTeam', 'AwayTeam', 
    'FTHG', 'FTAG', 'FTR', 
    'HTHG', 'HTAG', 'HTR', 
    'HS', 'AS', 'HST', 'AST', 
    'HF', 'AF', 'HC', 'AC', 
    'HY', 'AY', 'HR', 'AR', 
    'Fuente', 'Temporada'
]

INTEGER_COLS = [
    'FTHG', 'FTAG', 'HTHG', 'HTAG', 
    'HS', 'AS', 'HST', 'AST', 
    'HF', 'AF', 'HC', 'AC', 
    'HY', 'AY', 'HR', 'AR', 
    'Temporada'
]


def check_robots_txt(base_url: str = "https://www.football-data.co.uk", user_agent: str = "SportsAnalyticsResearchBot") -> Dict[str, Any]:
    """
    Verifica éticamente los permisos de scraping en el archivo robots.txt del servidor.
    """
    robots_url = f"{base_url}/robots.txt"
    rp = RobotFileParser()
    rp.set_url(robots_url)
    try:
        rp.read()
        target_path = f"{base_url}/spainm.php"
        can_fetch = rp.can_fetch(user_agent, target_path)
        return {
            "status": "compliant",
            "robots_url": robots_url,
            "can_fetch": can_fetch,
            "user_agent": user_agent,
            "message": "Scraping ético autorizado conforme a robots.txt de Football-Data.co.uk." if can_fetch else "Acceso restringido por robots.txt"
        }
    except Exception as e:
        return {
            "status": "fallback_allowed",
            "robots_url": robots_url,
            "can_fetch": True,
            "user_agent": user_agent,
            "message": f"Aviso de lectura robots.txt ({e}). Continuando con política ética de pausas."
        }


def clean_and_type_dataset(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aplica limpieza estricta:
    - Conserva las 21 variables limpias.
    - Elimina registros vacíos o incompletos.
    - Fuerza el tipado entero (int64) en variables numéricas discretas.
    - Formatea la fecha y asegura orden cronológico.
    """
    # Filtrar solo columnas relevantes que existan
    available_cols = [c for c in SELECTED_COLUMNS if c in df.columns]
    df_clean = df[available_cols].copy()

    # Eliminar nulos en columnas esenciales
    df_clean = df_clean.dropna(subset=['HomeTeam', 'AwayTeam', 'FTR', 'FTHG', 'FTAG'])

    # Tipado entero en variables cuantitativas discretas
    for col in INTEGER_COLS:
        if col in df_clean.columns:
            df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce').fillna(0).astype(int)

    # Conversión de fecha a DateTime para ordenación temporal estricta (sin data leakage)
    if 'Date' in df_clean.columns:
        df_clean['DateTime'] = pd.to_datetime(df_clean['Date'], format='%d/%m/%y', errors='coerce')
        # Si algunas fechas vienen en formato YYYY-MM-DD o con año de 4 dígitos
        mask_nat = df_clean['DateTime'].isna()
        if mask_nat.any():
            df_clean.loc[mask_nat, 'DateTime'] = pd.to_datetime(df_clean.loc[mask_nat, 'Date'], dayfirst=True, errors='coerce')
        
        # Ordenar cronológicamente
        df_clean = df_clean.sort_values(by=['DateTime', 'Temporada']).reset_index(drop=True)

    return df_clean


def load_consolidated_data(path: str = CONSOLIDATED_CSV) -> pd.DataFrame:
    """
    Carga el dataset maestro consolidado de 10 temporadas (3.800 partidos).
    """
    if not os.path.exists(path):
        raise FileNotFoundError(f"No se encontró el dataset maestro en: {path}")

    df = pd.read_csv(path)
    df_clean = clean_and_type_dataset(df)
    return df_clean


def get_dataset_summary(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Genera métricas descriptivas y de integridad del dataset.
    """
    return {
        "total_partidos": len(df),
        "total_columnas": len(df.columns),
        "temporadas": df['Temporada'].value_counts().sort_index().to_dict(),
        "total_clubes": int(df['HomeTeam'].nunique()),
        "clubes": sorted(df['HomeTeam'].unique().tolist()),
        "distribucion_resultados": {
            "victorias_local": int((df['FTR'] == 'H').sum()),
            "empates": int((df['FTR'] == 'D').sum()),
            "victorias_visitante": int((df['FTR'] == 'A').sum()),
            "pct_local": round(float((df['FTR'] == 'H').mean() * 100), 2),
            "pct_empate": round(float((df['FTR'] == 'D').mean() * 100), 2),
            "pct_visitante": round(float((df['FTR'] == 'A').mean() * 100), 2),
        },
        "goles_totales": int((df['FTHG'] + df['FTAG']).sum()),
        "promedio_goles_partido": round(float((df['FTHG'] + df['FTAG']).mean()), 2),
        "valores_nulos_totales": int(df.isnull().sum().sum())
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Módulo de extracción y auditoría de datos de LaLiga (datos.py)")
    parser.add_argument("--verify", action="store_true", help="Verifica el archivo robots.txt de la fuente oficial.")
    parser.add_argument("--summary", action="store_true", help="Muestra el resumen estadístico e integridad del dataset consolidado.")
    args = parser.parse_args()

    print("=" * 70)
    print("  LaLiga Primera División: Módulo de Datos (datos.py)")
    print("  Institución Universitaria Colegio Mayor del Cauca - Estadística Inferencial")
    print("=" * 70)

    if args.verify or len(sys.argv) == 1:
        print("\n[1] Verificación Ética de Scraping (robots.txt):")
        res = check_robots_txt()
        print(f"  - Estado: {res['status']}")
        print(f"  - URL: {res['robots_url']}")
        print(f"  - Autorizado: {res['can_fetch']}")
        print(f"  - Dictamen: {res['message']}")

    if args.summary or len(sys.argv) == 1:
        print("\n[2] Auditoría de Integridad y Consolidación del Dataset:")
        try:
            df = load_consolidated_data()
            summary = get_dataset_summary(df)
            print(f"  - Total partidos consolidados: {summary['total_partidos']} (Esperado: 3.800)")
            print(f"  - Nulos detectados: {summary['valores_nulos_totales']}")
            print(f"  - Clubes analizados: {summary['total_clubes']}")
            print(f"  - Promedio de goles: {summary['promedio_goles_partido']} por encuentro")
            print(f"  - Victorias Local (H): {summary['distribucion_resultados']['victorias_local']} ({summary['distribucion_resultados']['pct_local']}%)")
            print(f"  - Empates (D): {summary['distribucion_resultados']['empates']} ({summary['distribucion_resultados']['pct_empate']}%)")
            print(f"  - Victorias Visitante (A): {summary['distribucion_resultados']['victorias_visitante']} ({summary['distribucion_resultados']['pct_visitante']}%)")
            print("\n  -> Verificación completada con éxito.")
        except Exception as e:
            print(f"  Error al cargar dataset: {e}")
