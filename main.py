"""
Punto de Entrada Principal del Sistema: main.py
Asignatura: Estadística Inferencial (2026) - Institución Universitaria Colegio Mayor del Cauca
Docente: Edith Janeth Potosí Estrada
Autores: José Luis Martínez, Álvaro José López Quira, Jose Aldair Torres,
         Cristian Samir Narváez, Joan Sebastian Mosquera y Rubén Darío Velasco.

Modos de Ejecución:
- python main.py          -> Inicia el servidor web FastAPI y abre automáticamente el Dashboard en el navegador.
- python main.py --cli    -> Emite un reporte ejecutivo completo en terminal con los 6 integrantes, modelos y confiabilidad.
- python main.py --port   -> Especifica el puerto HTTP (por defecto 8000).
"""
import sys
import os
import argparse
import webbrowser
import threading
import time

def run_cli_report():
    """Ejecuta y muestra el reporte analítico completo en terminal."""
    from datos import load_consolidated_data, get_dataset_summary
    from modelo import (
        calcular_espacio_muestral_y_reglas,
        distribucion_binomial,
        distribucion_hipergeometrica,
        calcular_confiabilidad_y_desviacion_estandar
    )
    from src.analytics.inferential_engine import InferentialEngine
    from src.models.train import ModelTrainer
    from src.models.predictor import MatchPredictor
    from src.models.tournament_simulator import TournamentSimulator

    print("\n" + "=" * 80)
    print("  INSTITUCIÓN UNIVERSITARIA COLEGIO MAYOR DEL CAUCA")
    print("  Facultad de Ingeniería - Programa de Ingeniería Informática")
    print("  Asignatura: Estadística Inferencial (2026) | Docente: Edith Janeth Potosí Estrada")
    print("  Autores: José Luis Martínez, Álvaro José López Quira, Jose Aldair Torres,")
    print("           Cristian Samir Narváez, Joan Sebastian Mosquera y Rubén Darío Velasco.")
    print("=" * 80)

    print("\n>>> CARGANDO DATASET Y GENERANDO REPORTE EJECUTIVO...")
    df = load_consolidated_data()
    summary = get_dataset_summary(df)
    engine = InferentialEngine(df)
    trainer = ModelTrainer()
    trainer.train_and_evaluate()
    predictor = MatchPredictor(trainer)
    sim = TournamentSimulator(predictor)

    print(f"\n[1] DATASET MAESTRO CONSOLIDADO (Football-Data.co.uk):")
    print(f"  * Total de partidos históricos analizados: {summary['total_partidos']}")
    print(f"  * Temporadas consecutivas: 10 (2016/17 a 2025/26)")
    print(f"  * Clubes únicos analizados: {summary['total_clubes']}")
    print(f"  * Promedio de goles por encuentro: {summary['promedio_goles_partido']}")
    print(f"  * Distribución histórica de resultados: Local {summary['distribucion_resultados']['pct_local']}%, Empate {summary['distribucion_resultados']['pct_empate']}%, Visitante {summary['distribucion_resultados']['pct_visitante']}%")

    print(f"\n[2] VALIDACIÓN DE CONFIABILIDAD ESTADÍSTICA:")
    conf = calcular_confiabilidad_y_desviacion_estandar(df)
    disp = conf['desviacion_estandar_goles']
    test = conf['prueba_hipotesis_bilateral']
    print(f"  * Desviación estándar goles local s: {disp['desv_estandar_local_s']}")
    print(f"  * Desviación estándar goles visitante s: {disp['desv_estandar_visitante_s']}")
    print(f"  * Prueba de Hipótesis Bilateral de Localía: Z = {test['estadistico_Z']}, p-valor = {test['valor_p']}")
    print(f"  * Conclusión: {test['decision']}")

    print(f"\n[3] INFERENCIA BAYESIANA POR INTEGRANTE (6 ROLES):")
    for m_id in range(1, 7):
        m = engine.get_member_analysis(m_id)
        b = m['stats']['bayes']
        print(f"  * Integrante {m_id} ({m['role']}):")
        print(f"    - Pregunta: {m['question']}")
        print(f"    - P(Previa) = {b['prior_P_A']*100:.1f}%  -->  P(Posterior con Evidencia) = {b['posterior_P_A_given_B']*100:.1f}% (Delta: {b['delta_percentage']:+.1f}%)")

    print(f"\n[4] EVALUACIÓN DE MACHINE LEARNING & EXPECTED GOALS (xG):")
    print(f"  * Accuracy Regresión Logística (Rolling 5): {trainer.metrics['models']['logistic_regression']['accuracy']:.1f}%")
    print(f"  * Accuracy Random Forest (150 Estimators): {trainer.metrics['models']['random_forest']['accuracy']:.1f}%")

    print(f"\n[5] SIMULACIÓN DE ENFRENTAMIENTO CLÁSICO (Real Madrid vs Barcelona):")
    pred = predictor.predict_match("Real Madrid", "Barcelona", simulation_mode="recent")
    prob = pred['probabilities']
    print(f"  * Probabilidades: Real Madrid {prob['pct_home_win']}% | Empate {prob['pct_draw']}% | Barcelona {prob['pct_away_win']}%")
    print(f"  * Goles Esperados (Poisson xG): Real Madrid {pred['expected_goals']['home_xG']} vs Barcelona {pred['expected_goals']['away_xG']}")

    print(f"\n[6] PROYECCIÓN DE CAMPEÓN (SIMULACIÓN MONTE CARLO LALIGA 380 PARTIDOS):")
    tourn = sim.simulate_season(n_simulations=100)
    print(f"  * Campeón Proyectado: {tourn['projected_champion']} (Probabilidad de Título: {tourn['champion_probability']}%, Puntos esperados: {tourn['projected_champion_points']})")
    print(f"  * Top 4 Proyectado (Puestos UEFA Champions League):")
    for row in tourn['standings'][:4]:
        print(f"    {row['rank']}. {row['team']:<15} {row['points']} pts (Dif: {row['goal_diff']:+5.1f}) - Prob. Título: {row['champion_prob']}%")

    print("\n" + "=" * 80)
    print("  Reporte finalizado exitosamente. Para abrir el Dashboard Web interactivo ejecute: python main.py")
    print("=" * 80 + "\n")


def run_web_server(host: str = "127.0.0.1", port: int = 8000):
    """Inicia el servidor Uvicorn FastAPI y lanza el navegador web."""
    import uvicorn
    url = f"http://{host}:{port}"

    def open_browser():
        time.sleep(1.2)
        print(f"\n[INFO] Abriendo Dashboard interactivo en: {url}")
        webbrowser.open(url)

    threading.Thread(target=open_browser, daemon=True).start()
    print("=" * 70)
    print("  LaLiga Analytics & Machine Learning - Dashboard Web")
    print(f"  Servidor activo en: {url}")
    print("  Presione CTRL+C para detener el servidor.")
    print("=" * 70)
    uvicorn.run("src.api.app:app", host=host, port=port, log_level="info")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Lanzador Principal: main.py")
    parser.add_argument("--cli", action="store_true", help="Emite el reporte analítico en terminal sin iniciar servidor web.")
    parser.add_argument("--port", type=int, default=8000, help="Puerto HTTP para el servidor web (por defecto 8000).")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host HTTP (por defecto 127.0.0.1).")
    args = parser.parse_args()

    if args.cli:
        run_cli_report()
    else:
        run_web_server(host=args.host, port=args.port)
