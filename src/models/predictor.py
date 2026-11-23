"""
Predictor de Partidos, Cuotas Justas y Simulación de Marcadores Poisson (xG)
Soporta dos modalidades de simulación:
1. 'recent': Ensamble Machine Learning (Logistic Regression + Random Forest) basado en forma rodante de 5 partidos.
2. 'historical': Inferencia empírica y bayesiana basada en el historial de 10 temporadas (Head-to-Head directo y rendimiento en casa/fuera).
"""
import pandas as pd
import numpy as np
import math
from typing import Dict, Any, List, Optional
from scipy.stats import poisson

from ..analytics.data_processor import DataProcessor
from .train import ModelTrainer, FEATURE_COLS, LABEL_MAP, INV_LABEL_MAP

class MatchPredictor:
    def __init__(self, trainer: Optional[ModelTrainer] = None):
        if trainer is None:
            self.trainer = ModelTrainer()
            self.trainer.train_and_evaluate()
        else:
            self.trainer = trainer
            if not self.trainer.is_trained:
                self.trainer.train_and_evaluate()
        self.processor = self.trainer.processor
        self.latest_metrics = self.processor.get_latest_team_metrics()

    def get_head_to_head(self, home_team: str, away_team: str) -> Dict[str, Any]:
        """Calcula el registro histórico directo entre ambos equipos en las 10 temporadas."""
        df = self.processor.df
        
        # Partidos directos en el estadio del local actual
        direct_home = df[(df['HomeTeam'] == home_team) & (df['AwayTeam'] == away_team)]
        total_direct_home = len(direct_home)
        h_wins_direct = int((direct_home['FTR'] == 'H').sum())
        d_direct = int((direct_home['FTR'] == 'D').sum())
        a_wins_direct = int((direct_home['FTR'] == 'A').sum())
        avg_hg_direct = float(direct_home['FTHG'].mean()) if total_direct_home > 0 else 1.45
        avg_ag_direct = float(direct_home['FTAG'].mean()) if total_direct_home > 0 else 1.10

        # Todos los partidos mutuos en las 10 temporadas (ambos estadios)
        mutual = df[((df['HomeTeam'] == home_team) & (df['AwayTeam'] == away_team)) |
                    ((df['HomeTeam'] == away_team) & (df['AwayTeam'] == home_team))]
        
        # Rendimiento histórico general del local jugando en casa en 10 temporadas
        h_overall = df[df['HomeTeam'] == home_team]
        total_h_overall = len(h_overall)
        h_overall_win_rate = float((h_overall['FTR'] == 'H').mean()) if total_h_overall > 0 else 0.455
        h_overall_draw_rate = float((h_overall['FTR'] == 'D').mean()) if total_h_overall > 0 else 0.262
        h_overall_loss_rate = float((h_overall['FTR'] == 'A').mean()) if total_h_overall > 0 else 0.283
        h_overall_gf_avg = float(h_overall['FTHG'].mean()) if total_h_overall > 0 else 1.45
        h_overall_ga_avg = float(h_overall['FTAG'].mean()) if total_h_overall > 0 else 1.10

        # Rendimiento histórico general del visitante jugando fuera en 10 temporadas
        a_overall = df[df['AwayTeam'] == away_team]
        total_a_overall = len(a_overall)
        a_overall_win_rate = float((a_overall['FTR'] == 'A').mean()) if total_a_overall > 0 else 0.283
        a_overall_draw_rate = float((a_overall['FTR'] == 'D').mean()) if total_a_overall > 0 else 0.262
        a_overall_loss_rate = float((a_overall['FTR'] == 'H').mean()) if total_a_overall > 0 else 0.455
        a_overall_gf_avg = float(a_overall['FTAG'].mean()) if total_a_overall > 0 else 1.10
        a_overall_ga_avg = float(a_overall['FTHG'].mean()) if total_a_overall > 0 else 1.45

        # Últimos enfrentamientos directos ordenados del más reciente al más antiguo
        recent_matches = []
        for _, row in mutual.tail(5).iloc[::-1].iterrows():
            recent_matches.append({
                "date": str(row['Date']),
                "season": str(row['Temporada']),
                "home": str(row['HomeTeam']),
                "away": str(row['AwayTeam']),
                "score": f"{row['FTHG']} - {row['FTAG']}",
                "result": str(row['FTR'])
            })

        return {
            "direct_at_venue": {
                "total_matches": total_direct_home,
                "home_wins": h_wins_direct,
                "draws": d_direct,
                "away_wins": a_wins_direct,
                "home_goals_avg": round(avg_hg_direct, 2),
                "away_goals_avg": round(avg_ag_direct, 2)
            },
            "total_mutual_matches": len(mutual),
            "home_team_10y_home_record": {
                "matches": total_h_overall,
                "win_pct": round(h_overall_win_rate * 100, 1),
                "draw_pct": round(h_overall_draw_rate * 100, 1),
                "loss_pct": round(h_overall_loss_rate * 100, 1),
                "gf_avg": round(h_overall_gf_avg, 2),
                "ga_avg": round(h_overall_ga_avg, 2)
            },
            "away_team_10y_away_record": {
                "matches": total_a_overall,
                "win_pct": round(a_overall_win_rate * 100, 1),
                "draw_pct": round(a_overall_draw_rate * 100, 1),
                "loss_pct": round(a_overall_loss_rate * 100, 1),
                "gf_avg": round(a_overall_gf_avg, 2),
                "ga_avg": round(a_overall_ga_avg, 2)
            },
            "recent_encounters": recent_matches
        }

    def predict_match(
        self,
        home_team: str,
        away_team: str,
        bayesian_condition: Optional[str] = None,
        simulation_mode: str = "recent"
    ) -> Dict[str, Any]:
        """
        Predice el enfrentamiento entre dos clubes en modo 'recent' (ML) o 'historical' (10 temporadas H2H).
        """
        if home_team not in self.latest_metrics or away_team not in self.latest_metrics:
            raise ValueError(f"Uno de los equipos ({home_team}, {away_team}) no se encuentra en el historial.")

        h_stat = self.latest_metrics[home_team]
        a_stat = self.latest_metrics[away_team]
        h2h = self.get_head_to_head(home_team, away_team)

        if simulation_mode == "historical":
            # --- MODO HISTÓRICO (10 Temporadas & H2H) ---
            # Si hay partidos directos en este estadio, ponderar el directo con las tasas globales históricas
            direct = h2h["direct_at_venue"]
            h_rec = h2h["home_team_10y_home_record"]
            a_rec = h2h["away_team_10y_away_record"]

            # Probabilidad base del local en casa a lo largo de 10 años
            base_p_h = h_rec["win_pct"] / 100.0
            base_p_d = (h_rec["draw_pct"] + a_rec["draw_pct"]) / 200.0
            base_p_a = a_rec["win_pct"] / 100.0

            if direct["total_matches"] >= 2:
                # Si hay al menos 2 partidos directos, usar suavizado bayesiano empírico (prior + evidencia H2H)
                w_direct = min(0.65, direct["total_matches"] * 0.08) # peso creciente con más partidos
                w_base = 1.0 - w_direct

                dir_p_h = direct["home_wins"] / direct["total_matches"]
                dir_p_d = direct["draws"] / direct["total_matches"]
                dir_p_a = direct["away_wins"] / direct["total_matches"]

                p_h = w_direct * dir_p_h + w_base * base_p_h
                p_d = w_direct * dir_p_d + w_base * base_p_d
                p_a = w_direct * dir_p_a + w_base * base_p_a
            else:
                p_h = base_p_h
                p_d = base_p_d
                p_a = base_p_a

            # Normalizar
            sum_hist = p_h + p_d + p_a
            p_h, p_d, p_a = p_h / sum_hist, p_d / sum_hist, p_a / sum_hist

            # Goles esperados históricos Poisson
            lambda_h = (direct["home_goals_avg"] * 0.5 + h_rec["gf_avg"] * 0.25 + a_rec["ga_avg"] * 0.25)
            lambda_a = (direct["away_goals_avg"] * 0.5 + a_rec["gf_avg"] * 0.25 + h_rec["ga_avg"] * 0.25)
            lambda_h = max(0.4, float(lambda_h))
            lambda_a = max(0.3, float(lambda_a))

        else:
            # --- MODO FORMA RECIENTE (ML 5 Partidos) ---
            row_feat = {
                'diff_roll_pts': h_stat['pts'] - a_stat['pts'],
                'diff_roll_gf': h_stat['gf'] - a_stat['gf'],
                'diff_roll_ga': a_stat['ga'] - h_stat['ga'],
                'diff_roll_sot': h_stat['sot'] - a_stat['sot'],
                'h_roll_pts': h_stat['pts'],
                'h_roll_gf': h_stat['gf'],
                'h_roll_ga': h_stat['ga'],
                'h_roll_sot': h_stat['sot'],
                'h_roll_corners': h_stat['corners'],
                'h_roll_cards': h_stat['cards'],
                'a_roll_pts': a_stat['pts'],
                'a_roll_gf': a_stat['gf'],
                'a_roll_ga': a_stat['ga'],
                'a_roll_sot': a_stat['sot'],
                'a_roll_corners': a_stat['corners'],
                'a_roll_cards': a_stat['cards']
            }

            X_input = pd.DataFrame([row_feat])[FEATURE_COLS]
            X_scaled = self.trainer.scaler.transform(X_input)

            proba_lr = self.trainer.lr_model.predict_proba(X_scaled)[0]
            proba_rf = self.trainer.rf_model.predict_proba(X_input)[0]
            proba_ml = 0.5 * proba_lr + 0.5 * proba_rf

            p_h, p_d, p_a = float(proba_ml[0]), float(proba_ml[1]), float(proba_ml[2])

            avg_league_h = 1.45
            avg_league_a = 1.10
            lambda_h = max(0.4, (h_stat['gf'] / 1.3) * (a_stat['ga'] / 1.3) * avg_league_h)
            lambda_a = max(0.3, (a_stat['gf'] / 1.1) * (h_stat['ga'] / 1.3) * avg_league_a)

        # Ajuste bayesiano condicional opcional
        applied_condition = None
        if bayesian_condition == "HST_GT_5":
            p_h = p_h * 1.43
            p_d = p_d * 0.75
            p_a = p_a * 0.65
            applied_condition = "Asedio Local proyectado: > 5 Tiros a Puerta (HST > 5)"
        elif bayesian_condition == "HTR_H":
            p_h = p_h * 1.72
            p_d = p_d * 0.60
            p_a = p_a * 0.40
            applied_condition = "Ventaja al descanso proyectada: Local Ganando 1T (HTR = H)"
        elif bayesian_condition == "AST_GT_4":
            p_a = p_a * 1.72
            p_d = p_d * 0.85
            p_h = p_h * 0.70
            applied_condition = "Eficacia Visitante proyectada: > 4 Tiros a Puerta (AST > 4)"

        # Normalizar probabilidades
        sum_p = p_h + p_d + p_a
        p_h, p_d, p_a = p_h / sum_p, p_d / sum_p, p_a / sum_p

        # Cuotas justas (Fair Odds = 1 / P)
        fair_odd_h = round(1.0 / p_h, 2) if p_h > 0 else 99.0
        fair_odd_d = round(1.0 / p_d, 2) if p_d > 0 else 99.0
        fair_odd_a = round(1.0 / p_a, 2) if p_a > 0 else 99.0

        # Matriz Poisson (0 a 4 goles)
        score_matrix = []
        prob_over_2_5 = 0.0
        for i in range(5):
            for j in range(5):
                prob_ij = float(poisson.pmf(i, lambda_h) * poisson.pmf(j, lambda_a))
                if (i + j) > 2.5:
                    prob_over_2_5 += prob_ij
                score_matrix.append({
                    "score": f"{i} - {j}",
                    "home_goals": i,
                    "away_goals": j,
                    "probability": round(prob_ij, 4),
                    "pct": round(prob_ij * 100, 1)
                })

        top_scores = sorted(score_matrix, key=lambda s: s["probability"], reverse=True)[:5]
        outcomes = [('H', p_h), ('D', p_d), ('A', p_a)]
        best_outcome = max(outcomes, key=lambda x: x[1])[0]

        # Muestreo estocástico Monte Carlo basado en la distribución conjunta bivariada de Poisson.
        # En enfrentamientos reñidos (ej. Real Madrid vs Barcelona), el marcador modal único suele ser 1-1.
        # Con muestreo estocástico ponderado por las probabilidades reales de la matriz Poisson,
        # cada simulación en vivo es única y reproduce fielmente la distribución (victorias locales,
        # empates y victorias visitantes según las cuotas y esperanzas matemáticas calculadas).
        import random
        score_weights = [max(1e-6, s["probability"]) for s in score_matrix]
        sampled_score = random.choices(score_matrix, weights=score_weights, k=1)[0]

        # Simulación dinámica y realista de la línea de tiempo del partido (30s de duración)
        simulated_match = self.simulate_match_timeline(
            home_team=home_team,
            away_team=away_team,
            lambda_h=lambda_h,
            lambda_a=lambda_a,
            p_h=p_h,
            p_d=p_d,
            p_a=p_a,
            bayesian_condition=bayesian_condition,
            target_score=sampled_score,
            top_score=top_scores[0]
        )

        return {
            "home_team": home_team,
            "away_team": away_team,
            "simulation_mode": simulation_mode,
            "applied_condition": applied_condition,
            "probabilities": {
                "home_win": round(p_h, 4),
                "draw": round(p_d, 4),
                "away_win": round(p_a, 4),
                "pct_home_win": round(p_h * 100, 1),
                "pct_draw": round(p_d * 100, 1),
                "pct_away_win": round(p_a * 100, 1)
            },
            "fair_odds": {
                "home_win": fair_odd_h,
                "draw": fair_odd_d,
                "away_win": fair_odd_a
            },
            "most_likely_outcome": best_outcome,
            "expected_goals": {
                "home_xG": round(lambda_h, 2),
                "away_xG": round(lambda_a, 2),
                "total_xG": round(lambda_h + lambda_a, 2),
                "prob_over_2_5": round(prob_over_2_5, 3),
                "pct_over_2_5": round(prob_over_2_5 * 100, 1),
                "pct_under_2_5": round((1.0 - prob_over_2_5) * 100, 1)
            },
            "top_scores": top_scores,
            "sampled_score": sampled_score,
            "analyzed_variables": {
                "match_metrics": ["FTHG", "FTAG", "HTHG", "HTAG", "HTR", "HS", "AS", "HST", "AST", "HC", "AC", "HY", "AY", "HR", "AR"],
                "poisson_parameters": {
                    "lambda_home": round(lambda_h, 3),
                    "lambda_away": round(lambda_a, 3),
                    "expected_total_goals": round(lambda_h + lambda_a, 2),
                    "prob_over_2_5": round(prob_over_2_5, 3)
                },
                "ml_features": {
                    "rolling_window": "5 partidos recientes",
                    "features_used": ["diff_roll_pts", "diff_roll_gf", "diff_roll_ga", "diff_roll_sot", "h_roll_pts", "a_roll_pts", "h_roll_gf", "a_roll_gf", "h_roll_ga", "a_roll_ga"]
                },
                "bayesian_inference": {
                    "condition_applied": applied_condition or "Ninguna (Distribución a priori)",
                    "p_home": round(p_h, 4),
                    "p_draw": round(p_d, 4),
                    "p_away": round(p_a, 4)
                }
            },
            "recent_form": {
                "home": h_stat,
                "away": a_stat
            },
            "head_to_head": h2h,
            "match_simulation": simulated_match
        }

    def simulate_match_timeline(self, home_team: str, away_team: str,
                                lambda_h: float, lambda_a: float,
                                p_h: float, p_d: float, p_a: float,
                                bayesian_condition: Optional[str],
                                target_score: Optional[Dict[str, Any]] = None,
                                top_score: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Genera una secuencia cronológica coherente y verosímil de eventos para la simulación
        en vivo de 30 segundos (equivalente a 90 minutos de juego).
        Utiliza el marcador objetivo muestreado estocásticamente de la distribución de Poisson.
        """
        import random

        effective_score = target_score or top_score or {"home_goals": 1, "away_goals": 0}
        target_hg = int(effective_score.get("home_goals", 1))
        target_ag = int(effective_score.get("away_goals", 0))

        # Ajuste si hay condición bayesiana específica
        if bayesian_condition == "HTR_H" and target_hg == 0:
            target_hg = max(1, target_hg + 1)

        # Generar minutos clave para los goles
        available_mins = list(range(4, 44)) + list(range(48, 89))
        random.shuffle(available_mins)

        home_goal_mins = []
        away_goal_mins = []

        if bayesian_condition == "HTR_H" and target_hg > 0:
            # Al menos un gol local en el primer tiempo
            first_half_mins = [m for m in available_mins if m < 45]
            if first_half_mins:
                home_goal_mins.append(first_half_mins.pop(0))
                target_hg_rem = target_hg - 1
            else:
                home_goal_mins.append(28)
                target_hg_rem = target_hg - 1
            for _ in range(target_hg_rem):
                if available_mins:
                    home_goal_mins.append(available_mins.pop(0))
        else:
            for _ in range(target_hg):
                if available_mins:
                    home_goal_mins.append(available_mins.pop(0))

        for _ in range(target_ag):
            if available_mins:
                away_goal_mins.append(available_mins.pop(0))

        home_goal_mins.sort()
        away_goal_mins.sort()

        # Totales del partido simulado
        tot_hs = max(target_hg + 4, random.randint(11, 17))
        tot_as = max(target_ag + 3, random.randint(8, 14))

        if bayesian_condition == "HST_GT_5":
            tot_hst = max(target_hg, random.randint(6, 9))
        else:
            tot_hst = max(target_hg, random.randint(3, 7))

        if bayesian_condition == "AST_GT_4":
            tot_ast = max(target_ag, random.randint(5, 7))
        else:
            tot_ast = max(target_ag, random.randint(2, 5))

        if bayesian_condition == "HC_GT_6":
            tot_hc = random.randint(7, 10)
        else:
            tot_hc = random.randint(4, 7)
        tot_ac = random.randint(2, 6)

        tot_hy = random.randint(1, 3)
        tot_ay = random.randint(1, 4)
        possession_h = int(np.clip(round(50 + (lambda_h - lambda_a) * 8), 38, 68))
        possession_a = 100 - possession_h

        # Narraciones contextuales
        home_attack_phrases = [
            f"Presión alta y triangulación en tres cuartos de campo por parte de {home_team}.",
            f"Desborde por la banda derecha y centro peligroso al corazón del área de {home_team}.",
            f"Gran pase entre líneas que deja al delantero de {home_team} en posición de remate.",
            f"Recuperación rápida en mediocampo y transición vertiginosa de {home_team}."
        ]
        away_attack_phrases = [
            f"Contragolpe veloz conducido por {away_team} aprovechando los espacios.",
            f"Pase filtrado al callejón interior buscando la espalda de los centrales locales.",
            f"Disparo con efecto desde la frontal que obliga al repliegue defensivo.",
            f"Jugada ensayada a balón parado que genera incertidumbre en el área anfitriona."
        ]

        # Lista de eventos base
        event_candidates = []

        # 1. Goles
        for gm in home_goal_mins:
            event_candidates.append({
                "minute": gm,
                "type": "goal",
                "team": "home",
                "team_name": home_team,
                "title": f"¡GOOOOL DE {home_team.upper()}!",
                "description": f"¡Anotación para {home_team}! Definición soberbia con remate raso y colocado contra el poste.",
                "pitch_zone": "attack_home"
            })
        for gm in away_goal_mins:
            event_candidates.append({
                "minute": gm,
                "type": "goal",
                "team": "away",
                "team_name": away_team,
                "title": f"¡GOOOOL DE {away_team.upper()}!",
                "description": f"¡Anotación para {away_team}! Remate cruzado tras superar la marca del central.",
                "pitch_zone": "attack_away"
            })

        # 2. Tiros a puerta parados / atajadas
        saved_mins = [m for m in available_mins if m not in home_goal_mins and m not in away_goal_mins]
        random.shuffle(saved_mins)

        # 2 tiros al arco salvados para local
        for _ in range(min(2, max(0, tot_hst - target_hg))):
            if saved_mins:
                sm = saved_mins.pop(0)
                event_candidates.append({
                    "minute": sm,
                    "type": "shot_saved",
                    "team": "home",
                    "team_name": home_team,
                    "title": f"Parada providencial contra {home_team}",
                    "description": f"Disparo a puerta de {home_team} repelido con reflejos extraordinarios por el arquero.",
                    "pitch_zone": "attack_home"
                })

        # 1 o 2 tiros al arco salvados para visitante
        for _ in range(min(2, max(0, tot_ast - target_ag))):
            if saved_mins:
                sm = saved_mins.pop(0)
                event_candidates.append({
                    "minute": sm,
                    "type": "shot_saved",
                    "team": "away",
                    "team_name": away_team,
                    "title": f"Intervención del arquero local",
                    "description": f"Gran estirada abajo para mandar el disparo de {away_team} al tiro de esquina.",
                    "pitch_zone": "attack_away"
                })

        # 3. Córners
        if saved_mins:
            event_candidates.append({
                "minute": saved_mins.pop(0),
                "type": "corner",
                "team": "home",
                "team_name": home_team,
                "title": f"Córner a favor de {home_team}",
                "description": f"Saque de esquina ejecutado con comba cerrada; despeja la zaga foránea.",
                "pitch_zone": "attack_home"
            })
        if saved_mins:
            event_candidates.append({
                "minute": saved_mins.pop(0),
                "type": "corner",
                "team": "away",
                "team_name": away_team,
                "title": f"Córner a favor de {away_team}",
                "description": f"Balón al punto penal que es cabeceado fuera de los tres palos.",
                "pitch_zone": "attack_away"
            })

        # 4. Tarjetas
        if saved_mins and tot_hy > 0:
            event_candidates.append({
                "minute": saved_mins.pop(0),
                "type": "card_yellow",
                "team": "home",
                "team_name": home_team,
                "title": f"Tarjeta Amarilla para {home_team}",
                "description": f"Amonestación por frenar una carrera prometedora en la divisoria de campo.",
                "pitch_zone": "midfield"
            })
        if saved_mins and tot_ay > 0:
            event_candidates.append({
                "minute": saved_mins.pop(0),
                "type": "card_yellow",
                "team": "away",
                "team_name": away_team,
                "title": f"Tarjeta Amarilla para {away_team}",
                "description": f"El colegiado muestra la cartulina amarilla por entrada desmedida.",
                "pitch_zone": "midfield"
            })

        # 5. Ataques / Ocasiones de peligro
        if saved_mins:
            event_candidates.append({
                "minute": saved_mins.pop(0),
                "type": "attack",
                "team": "home",
                "team_name": home_team,
                "title": f"Ocasión clara de {home_team}",
                "description": random.choice(home_attack_phrases),
                "pitch_zone": "attack_home"
            })
        if saved_mins:
            event_candidates.append({
                "minute": saved_mins.pop(0),
                "type": "attack",
                "team": "away",
                "team_name": away_team,
                "title": f"Aproximación peligrosa de {away_team}",
                "description": random.choice(away_attack_phrases),
                "pitch_zone": "attack_away"
            })

        # Eventos fijos estructurales
        structural_events = [
            {
                "minute": 0,
                "type": "kickoff",
                "team": "neutral",
                "team_name": "Árbitro",
                "title": "Pitazo Inicial",
                "description": f"Rueda el balón en LaLiga. Comienza el choque entre {home_team} y {away_team}.",
                "pitch_zone": "midfield"
            },
            {
                "minute": 45,
                "type": "halftime",
                "team": "neutral",
                "team_name": "Descanso",
                "title": "Final del Primer Tiempo (45')",
                "description": "El árbitro hace sonar su silbato. Los equipos se retiran a los vestuarios para el entretiempo.",
                "pitch_zone": "midfield"
            },
            {
                "minute": 46,
                "type": "second_half",
                "team": "neutral",
                "team_name": "Segundo Tiempo",
                "title": "Inicio del Segundo Tiempo (46')",
                "description": "Arrancan los segundos 45 minutos decisivos del encuentro.",
                "pitch_zone": "midfield"
            },
            {
                "minute": 90,
                "type": "fulltime",
                "team": "neutral",
                "team_name": "Final",
                "title": "¡Final del Partido (90')!",
                "description": f"¡Concluyen los 90 minutos reglamentarios! Triunfo, empate o definición sellada.",
                "pitch_zone": "midfield"
            }
        ]

        # Fusionar y ordenar cronológicamente
        all_events = structural_events + event_candidates
        all_events = sorted(all_events, key=lambda e: (e["minute"], 0 if e["type"] in ["kickoff", "second_half"] else 1))

        # Calcular marcador acumulado y estadísticas acumuladas en cada evento
        curr_hg = 0
        curr_ag = 0
        curr_hs = 0
        curr_as = 0
        curr_hst = 0
        curr_ast = 0
        curr_hc = 0
        curr_ac = 0
        curr_hy = 0
        curr_ay = 0

        final_timeline = []
        for ev in all_events:
            t = ev["type"]
            team = ev.get("team")
            if t == "goal":
                if team == "home":
                    curr_hg += 1
                    curr_hs += 1
                    curr_hst += 1
                else:
                    curr_ag += 1
                    curr_as += 1
                    curr_ast += 1
            elif t == "shot_saved":
                if team == "home":
                    curr_hs += 1
                    curr_hst += 1
                else:
                    curr_as += 1
                    curr_ast += 1
            elif t == "attack":
                if team == "home":
                    curr_hs += 1
                else:
                    curr_as += 1
            elif t == "corner":
                if team == "home":
                    curr_hc += 1
                else:
                    curr_ac += 1
            elif t == "card_yellow":
                if team == "home":
                    curr_hy += 1
                else:
                    curr_ay += 1

            ev_copy = dict(ev)
            ev_copy["current_home_score"] = curr_hg
            ev_copy["current_away_score"] = curr_ag
            ev_copy["stats_snapshot"] = {
                "hs": curr_hs,
                "as": curr_as,
                "hst": curr_hst,
                "ast": curr_ast,
                "hc": curr_hc,
                "ac": curr_ac,
                "hy": curr_hy,
                "ay": curr_ay,
                "possession_h": possession_h,
                "possession_a": possession_a
            }
            final_timeline.append(ev_copy)

        return {
            "duration_seconds": 30,
            "final_score": {
                "home": curr_hg,
                "away": curr_ag,
                "formatted": f"{curr_hg} - {curr_ag}"
            },
            "total_stats": {
                "home_shots": max(curr_hs, tot_hs),
                "away_shots": max(curr_as, tot_as),
                "home_shots_on_target": max(curr_hst, tot_hst),
                "away_shots_on_target": max(curr_ast, tot_ast),
                "home_corners": max(curr_hc, tot_hc),
                "away_corners": max(curr_ac, tot_ac),
                "home_yellow_cards": max(curr_hy, tot_hy),
                "away_yellow_cards": max(curr_ay, tot_ay),
                "possession_home": possession_h,
                "possession_away": possession_a
            },
            "timeline": final_timeline
        }
