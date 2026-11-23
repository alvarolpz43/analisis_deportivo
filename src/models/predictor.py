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
            "recent_form": {
                "home": h_stat,
                "away": a_stat
            },
            "head_to_head": h2h
        }
