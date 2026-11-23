"""
Servidor API RESTful con FastAPI
Expone todos los módulos analíticos, modelos predictivos, estadísticas inferenciales y sirve el frontend estático.
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os

from ..analytics.data_processor import DataProcessor
from ..analytics.inferential_engine import InferentialEngine
from ..models.train import ModelTrainer
from ..models.predictor import MatchPredictor
from ..models.tournament_simulator import TournamentSimulator
from ..scraper.football_scraper import FootballDataScraper

app = FastAPI(
    title="Plataforma de Análisis Deportivo y Machine Learning",
    description="API de Ciencia de Datos para La Liga de España (10 temporadas, 3.800 partidos)",
    version="1.0.0"
)

# Habilitar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar componentes
print("[INIT] Inicializando procesador de datos...")
processor = DataProcessor()
print("[INIT] Inicializando motor inferencial...")
engine = InferentialEngine(processor.df)
print("[INIT] Entrenando modelos de Machine Learning...")
trainer = ModelTrainer(processor)
trainer.train_and_evaluate()
predictor = MatchPredictor(trainer)
tournament_simulator = TournamentSimulator(predictor)
scraper = FootballDataScraper()
print("[INIT] Sistema listo.")

# Schemas
class PredictionRequest(BaseModel):
    home_team: str
    away_team: str
    bayesian_condition: Optional[str] = None
    simulation_mode: Optional[str] = "recent"

# Rutas API
@app.get("/api/summary")
def get_summary():
    """Devuelve resumen estadístico y KPIs de los 3.800 partidos."""
    return processor.get_summary_stats()

@app.get("/api/teams")
def get_teams():
    """Lista de los 31 equipos de La Liga con sus métricas más recientes."""
    return {
        "teams": processor.get_summary_stats()["teams"],
        "latest_metrics": processor.get_latest_team_metrics()
    }

@app.get("/api/member/{member_id}")
def get_member(member_id: int):
    """Devuelve la inferencia bayesiana, tabla de contingencia y distribución hipergeométrica del integrante 1-6."""
    if member_id < 1 or member_id > 6:
        raise HTTPException(status_code=400, detail="El ID del integrante debe estar entre 1 y 6.")
    return engine.get_member_analysis(member_id)

@app.get("/api/hypergeometric/calculate")
def calculate_hypergeometric(
    N: int = Query(..., description="Población total"),
    r: int = Query(..., description="Éxitos en la población"),
    n: int = Query(..., description="Muestra extraída sin reemplazo"),
    x: int = Query(..., description="Éxitos observados en la muestra")
):
    """Calcula probabilidades hipergeométricas dinámicas con curva PMF y CDF completa."""
    try:
        return engine.calculate_hypergeometric(N=N, r=r, n=n, x=x)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/binomial/calculate")
def calculate_binomial(
    n: int = Query(..., description="Número de ensayos independientes"),
    p: float = Query(..., description="Probabilidad de éxito constante"),
    k: int = Query(..., description="Éxitos observados")
):
    """Calcula probabilidades de la Distribución Binomial (eventos independientes)."""
    try:
        return engine.calculate_binomial(n=n, p=p, k=k)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/poisson/calculate")
def calculate_poisson(
    mu: float = Query(..., description="Tasa media histórica de ocurrencia (goles/partido)"),
    x: int = Query(..., description="Conteo de goles observado")
):
    """Calcula probabilidades de la Distribución de Poisson (Larson & Farber Cap. 4)."""
    try:
        return engine.calculate_poisson(mu=mu, x=x)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/normal/calculate")
def calculate_normal(
    value: float = Query(..., description="Valor de la variable continua a evaluar"),
    mean: Optional[float] = Query(None, description="Media de la distribución (opcional)"),
    std: Optional[float] = Query(None, description="Desviación estándar (opcional)")
):
    """Calcula estandarización valor z, áreas y regla empírica (Larson & Farber Cap. 7)."""
    try:
        return engine.calculate_normal(value=value, mean=mean, std_dev=std)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/descriptive/questions")
def get_descriptive_questions():
    """Devuelve las respuestas estadísticas formales a las 3 preguntas descriptivas de Electiva III."""
    try:
        return engine.get_descriptive_analysis()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reliability")
def get_reliability():
    """Devuelve métricas de confiabilidad, dispersión (s) y prueba de hipótesis bilateral de localía."""
    return engine.get_reliability_metrics()

@app.get("/api/tournament/simulate")
def simulate_tournament(simulations: int = Query(200, description="Número de simulaciones Monte Carlo")):
    """Simula una temporada completa de LaLiga (380 partidos) y proyecta al campeón y tabla final."""
    try:
        return tournament_simulator.simulate_season(n_simulations=simulations)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict")
def predict_match(req: PredictionRequest):
    """Predice un enfrentamiento entre dos clubes con ML, Poisson xG y actualización bayesiana opcional."""
    try:
        return predictor.predict_match(
            home_team=req.home_team,
            away_team=req.away_team,
            bayesian_condition=req.bayesian_condition,
            simulation_mode=req.simulation_mode or "recent"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/model/metrics")
def get_model_metrics():
    """Devuelve la evaluación técnica de los modelos de Machine Learning (Accuracy, Matrices, Importancias)."""
    return trainer.metrics

@app.get("/api/scraper/status")
def get_scraper_status():
    """Verifica robots.txt y el estado de la fuente web Football-Data.co.uk."""
    return scraper.get_source_status()

@app.get("/api/matches")
def get_matches(page: int = 1, page_size: int = 20, team: Optional[str] = None, season: Optional[str] = None):
    """Devuelve listado paginado y filtrable de partidos para auditoría."""
    df = processor.df
    if team:
        df = df[(df['HomeTeam'] == team) | (df['AwayTeam'] == team)]
    if season:
        df = df[df['Temporada'].astype(str) == season]
    
    total = len(df)
    start = (page - 1) * page_size
    end = start + page_size
    records = df.iloc[start:end].to_dict(orient="records")
    
    # Limpiar columnas de fecha para serialización JSON
    for r in records:
        if 'DateTime' in r:
            r['DateTime'] = str(r['DateTime'])

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "matches": records
    }

# Montar frontend web estático
WEB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "web")
if os.path.exists(WEB_DIR):
    app.mount("/", StaticFiles(directory=WEB_DIR, html=True), name="web")
