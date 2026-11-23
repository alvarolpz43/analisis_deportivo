"""
Simulador de Temporada y Proyección de Campeón para LaLiga Primera División
Formato oficial: 20 equipos, todos contra todos a doble vuelta (38 jornadas, 380 partidos).
Puntos oficiales: 3 por Victoria, 1 por Empate, 0 por Derrota.
Realiza simulación probabilística analítica y Monte Carlo basada en modelos de Poisson (xG) y Bayes.
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from scipy.stats import poisson

class TournamentSimulator:
    def __init__(self, predictor):
        self.predictor = predictor
        self.processor = predictor.processor
        self.df = self.processor.df
        
        # 20 equipos de la temporada más reciente (o los 20 más frecuentes/activos)
        recent_season = self.df['Temporada'].max()
        season_matches = self.df[self.df['Temporada'] == recent_season]
        season_teams = sorted(list(set(season_matches['HomeTeam'].unique()) | set(season_matches['AwayTeam'].unique())))
        
        if len(season_teams) >= 20:
            self.teams = season_teams[:20]
        else:
            # Fallback a los 20 equipos con mayor cantidad de partidos en el dataset
            team_counts = self.df['HomeTeam'].value_counts()
            self.teams = sorted(team_counts.head(20).index.tolist())

    def simulate_season(self, n_simulations: int = 500, simulation_mode: str = "recent") -> Dict[str, Any]:
        """
        Ejecuta n_simulations simulaciones completas de LaLiga (380 partidos por temporada)
        y calcula la tabla de posiciones proyectada, puntos esperados y probabilidad de campeón.
        Permite elegir entre:
        - "recent": Basado en la forma reciente de 5 partidos mediante Machine Learning (Rolling Form)
        - "historical": Basado en el registro histórico consolidado de 10 temporadas (3.800 partidos)
        """
        n_simulations = max(50, min(1000, int(n_simulations)))
        simulation_mode = "historical" if simulation_mode == "historical" else "recent"
        teams = self.teams
        n_teams = len(teams)
        
        # 1. Precomputar matriz de probabilidades y goles esperados para los 380 partidos
        # Cada par (i, j) con i != j (i local, j visitante)
        fixtures = []
        for home in teams:
            for away in teams:
                if home != away:
                    pred = self.predictor.predict_match(home, away, simulation_mode=simulation_mode)
                    p_h = float(pred['probabilities']['home_win'])
                    p_d = float(pred['probabilities']['draw'])
                    p_a = float(pred['probabilities']['away_win'])
                    
                    # Normalizar
                    s = p_h + p_d + p_a
                    if s > 0:
                        p_h, p_d, p_a = p_h / s, p_d / s, p_a / s
                    else:
                        p_h, p_d, p_a = 0.45, 0.27, 0.28
                    
                    fixtures.append({
                        "home": home,
                        "away": away,
                        "p_h": p_h,
                        "p_d": p_d,
                        "p_a": p_a,
                        "xg_home": float(pred['expected_goals']['home_xG']),
                        "xg_away": float(pred['expected_goals']['away_xG'])
                    })

        # 2. Acumuladores de simulación Monte Carlo
        points_acc = {t: 0 for t in teams}
        wins_acc = {t: 0 for t in teams}
        draws_acc = {t: 0 for t in teams}
        losses_acc = {t: 0 for t in teams}
        gf_acc = {t: 0 for t in teams}
        ga_acc = {t: 0 for t in teams}
        
        champion_counts = {t: 0 for t in teams}
        champions_league_counts = {t: 0 for t in teams}
        relegation_counts = {t: 0 for t in teams}

        # Generador de números aleatorios con semilla reproducible para consistencia
        rng = np.random.default_rng(42)

        for _ in range(n_simulations):
            sim_pts = {t: 0 for t in teams}
            sim_gf = {t: 0 for t in teams}
            sim_ga = {t: 0 for t in teams}
            sim_w = {t: 0 for t in teams}
            sim_d = {t: 0 for t in teams}
            sim_l = {t: 0 for t in teams}

            for fix in fixtures:
                u = rng.random()
                p_h, p_d = fix['p_h'], fix['p_d']
                
                # Muestreo Poisson de goles para calcular GD
                gh = int(rng.poisson(max(0.2, fix['xg_home'])))
                ga = int(rng.poisson(max(0.2, fix['xg_away'])))

                h = fix['home']
                a = fix['away']

                sim_gf[h] += gh
                sim_ga[h] += ga
                sim_gf[a] += ga
                sim_ga[a] += gh

                if u < p_h:
                    # Victoria Local
                    sim_pts[h] += 3
                    sim_w[h] += 1
                    sim_l[a] += 1
                elif u < (p_h + p_d):
                    # Empate
                    sim_pts[h] += 1
                    sim_pts[a] += 1
                    sim_d[h] += 1
                    sim_d[a] += 1
                else:
                    # Victoria Visitante
                    sim_pts[a] += 3
                    sim_w[a] += 1
                    sim_l[h] += 1

            # Acumular para promedios
            for t in teams:
                points_acc[t] += sim_pts[t]
                wins_acc[t] += sim_w[t]
                draws_acc[t] += sim_d[t]
                losses_acc[t] += sim_l[t]
                gf_acc[t] += sim_gf[t]
                ga_acc[t] += sim_ga[t]

            # Clasificación de la temporada simulada
            # Criterio: Puntos desc, Diferencia de goles desc, Goles a favor desc
            standings = sorted(
                teams,
                key=lambda t: (sim_pts[t], sim_pts[t] - sim_ga[t], sim_gf[t]),
                reverse=True
            )

            champion_counts[standings[0]] += 1
            for t in standings[:4]:
                champions_league_counts[t] += 1
            for t in standings[-3:]:
                relegation_counts[t] += 1

        # 3. Formatear tabla final de posiciones proyectada
        table = []
        for t in teams:
            exp_pts = points_acc[t] / n_simulations
            exp_w = wins_acc[t] / n_simulations
            exp_d = draws_acc[t] / n_simulations
            exp_l = losses_acc[t] / n_simulations
            exp_gf = gf_acc[t] / n_simulations
            exp_ga = ga_acc[t] / n_simulations
            exp_gd = exp_gf - exp_ga
            
            p_champ = (champion_counts[t] / n_simulations) * 100.0
            p_ucl = (champions_league_counts[t] / n_simulations) * 100.0
            p_rel = (relegation_counts[t] / n_simulations) * 100.0

            table.append({
                "team": t,
                "matches": 38,
                "points": round(exp_pts, 1),
                "wins": round(exp_w, 1),
                "draws": round(exp_d, 1),
                "losses": round(exp_l, 1),
                "goals_for": round(exp_gf, 1),
                "goals_against": round(exp_ga, 1),
                "goal_diff": round(exp_gd, 1),
                "champion_prob": round(p_champ, 1),
                "ucl_prob": round(p_ucl, 1),
                "relegation_prob": round(p_rel, 1)
            })

        # Ordenar tabla por puntos esperados descendente
        table = sorted(table, key=lambda x: (x['points'], x['goal_diff']), reverse=True)
        for rank, row in enumerate(table, start=1):
            row['rank'] = rank

        mode_title = (
            "Forma Reciente (Modelo ML - Ventana 5 Partidos)"
            if simulation_mode == "recent"
            else "Registro Histórico Completo (10 Temporadas / 3.800 Partidos)"
        )

        return {
            "competition": "LaLiga Primera División de España",
            "format": "Todos contra todos por puntos (38 jornadas, 380 partidos)",
            "simulation_mode": simulation_mode,
            "mode_title": mode_title,
            "methodology_name": "Simulación Estocástica Monte Carlo sobre 380 Partidos",
            "methodology_description": (
                "La proyección del torneo ejecuta una simulación Monte Carlo sobre los 380 partidos que componen "
                "el calendario oficial a doble vuelta de los 20 clubes. En cada partido individual, el resultado "
                "y los goles se muestrean estocásticamente a partir de las distribuciones bivariadas de Poisson (xG), "
                "ponderadas por el modo seleccionado (" + mode_title + "). Tras iterar cientos de campeonatos completos, "
                "se calcula el promedio esperado de puntos, victorias y la probabilidad empírica de campeonato, "
                "clasificación a Champions League (Top 4) y descenso (puestos 18-20)."
            ),
            "analyzed_variables": {
                "match_metrics": ["380 partidos por temporada", "Victorias (3 pts)", "Empates (1 pt)", "Derrotas (0 pts)"],
                "table_metrics": ["Puntos Esperados (Pts)", "Goles a Favor (GF)", "Goles en Contra (GC)", "Diferencia de Goles (DG)"],
                "probabilistic_metrics": ["Probabilidad de Campeón (% 1º lugar)", "Probabilidad Champions League (% Top 4)", "Riesgo de Descenso (% Puestos 18-20)"]
            },
            "simulations_count": n_simulations,
            "projected_champion": table[0]['team'],
            "champion_probability": table[0]['champion_prob'],
            "projected_champion_points": table[0]['points'],
            "standings": table
        }
