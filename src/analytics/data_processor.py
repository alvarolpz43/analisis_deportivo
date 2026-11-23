"""
Procesador de Datos Deportivos y Generador de Features Rodantes
Carga 3.800 partidos de La Liga y genera variables históricas sin data leakage.
"""
import pandas as pd
import numpy as np
import os
from typing import Dict, Any, List, Tuple

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "espana_10_temporadas_consolidado.csv")

class DataProcessor:
    def __init__(self, csv_path: str = DATA_PATH):
        self.csv_path = csv_path
        self.df = None
        self.df_features = None
        self.load_and_clean_data()

    def load_and_clean_data(self) -> pd.DataFrame:
        if not os.path.exists(self.csv_path):
            raise FileNotFoundError(f"No se encontró el dataset en {self.csv_path}")

        df = pd.read_csv(self.csv_path)
        # Parseo robusto de fechas y ordenamiento cronológico estricto
        df['DateTime'] = pd.to_datetime(df['Date'], dayfirst=True, format='mixed')
        df = df.sort_values('DateTime').reset_index(drop=True)
        
        # Tipos explícitos
        numeric_cols = ['FTHG', 'FTAG', 'HTHG', 'HTAG', 'HS', 'AS', 'HST', 'AST', 'HF', 'AF', 'HC', 'AC', 'HY', 'AY', 'HR', 'AR']
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)

        self.df = df
        return self.df

    def get_summary_stats(self) -> Dict[str, Any]:
        """Calcula KPIs globales del dataset consolidado."""
        df = self.df
        total_matches = len(df)
        home_wins = int((df['FTR'] == 'H').sum())
        draws = int((df['FTR'] == 'D').sum())
        away_wins = int((df['FTR'] == 'A').sum())
        
        total_goals = int(df['FTHG'].sum() + df['FTAG'].sum())
        avg_goals = round(total_goals / total_matches, 2)
        total_yellow_cards = int(df['HY'].sum() + df['AY'].sum())
        total_red_cards = int(df['HR'].sum() + df['AR'].sum())
        
        seasons_count = df['Temporada'].value_counts().sort_index().to_dict()
        teams = sorted(list(set(df['HomeTeam'].unique()) | set(df['AwayTeam'].unique())))
        
        return {
            "total_matches": total_matches,
            "home_wins": home_wins,
            "draws": draws,
            "away_wins": away_wins,
            "pct_home_wins": round(home_wins / total_matches * 100, 1),
            "pct_draws": round(draws / total_matches * 100, 1),
            "pct_away_wins": round(away_wins / total_matches * 100, 1),
            "total_goals": total_goals,
            "avg_goals_per_match": avg_goals,
            "total_yellow_cards": total_yellow_cards,
            "total_red_cards": total_red_cards,
            "num_teams": len(teams),
            "teams": teams,
            "seasons": [str(s) for s in seasons_count.keys()],
            "matches_per_season": seasons_count
        }

    def compute_rolling_features(self, window: int = 5) -> pd.DataFrame:
        """
        Calcula estadísticas rodantes (últimos N partidos) por equipo de manera estrictamente previa
        a cada partido para asegurar ZERO DATA LEAKAGE.
        """
        if self.df_features is not None:
            return self.df_features

        df = self.df.copy()
        
        # Registro cronológico por equipo
        team_history: Dict[str, List[Dict[str, float]]] = {}
        
        # Columnas a precalcular
        home_rolling_points = []
        home_rolling_goals_scored = []
        home_rolling_goals_conceded = []
        home_rolling_shots_target = []
        home_rolling_corners = []
        home_rolling_cards = []

        away_rolling_points = []
        away_rolling_goals_scored = []
        away_rolling_goals_conceded = []
        away_rolling_shots_target = []
        away_rolling_corners = []
        away_rolling_cards = []

        for idx, row in df.iterrows():
            h_team = row['HomeTeam']
            a_team = row['AwayTeam']

            # Helper para promediar historial previo
            def get_stats(team_name: str):
                hist = team_history.get(team_name, [])
                if not hist:
                    return {
                        'pts': 1.0, # valor neutro inicial
                        'gf': 1.2,
                        'ga': 1.2,
                        'sot': 4.0,
                        'corners': 4.5,
                        'cards': 2.0
                    }
                recent = hist[-window:]
                return {
                    'pts': float(np.mean([m['pts'] for m in recent])),
                    'gf': float(np.mean([m['gf'] for m in recent])),
                    'ga': float(np.mean([m['ga'] for m in recent])),
                    'sot': float(np.mean([m['sot'] for m in recent])),
                    'corners': float(np.mean([m['corners'] for m in recent])),
                    'cards': float(np.mean([m['cards'] for m in recent]))
                }

            h_stats = get_stats(h_team)
            a_stats = get_stats(a_team)

            home_rolling_points.append(h_stats['pts'])
            home_rolling_goals_scored.append(h_stats['gf'])
            home_rolling_goals_conceded.append(h_stats['ga'])
            home_rolling_shots_target.append(h_stats['sot'])
            home_rolling_corners.append(h_stats['corners'])
            home_rolling_cards.append(h_stats['cards'])

            away_rolling_points.append(a_stats['pts'])
            away_rolling_goals_scored.append(a_stats['gf'])
            away_rolling_goals_conceded.append(a_stats['ga'])
            away_rolling_shots_target.append(a_stats['sot'])
            away_rolling_corners.append(a_stats['corners'])
            away_rolling_cards.append(a_stats['cards'])

            # Actualizar historial POST partido (para partidos futuros)
            h_pts = 3 if row['FTR'] == 'H' else (1 if row['FTR'] == 'D' else 0)
            a_pts = 3 if row['FTR'] == 'A' else (1 if row['FTR'] == 'D' else 0)

            if h_team not in team_history:
                team_history[h_team] = []
            team_history[h_team].append({
                'pts': h_pts,
                'gf': row['FTHG'],
                'ga': row['FTAG'],
                'sot': row['HST'],
                'corners': row['HC'],
                'cards': row['HY'] + row['HR']
            })

            if a_team not in team_history:
                team_history[a_team] = []
            team_history[a_team].append({
                'pts': a_pts,
                'gf': row['FTAG'],
                'ga': row['FTHG'],
                'sot': row['AST'],
                'corners': row['AC'],
                'cards': row['AY'] + row['AR']
            })

        df['h_roll_pts'] = home_rolling_points
        df['h_roll_gf'] = home_rolling_goals_scored
        df['h_roll_ga'] = home_rolling_goals_conceded
        df['h_roll_sot'] = home_rolling_shots_target
        df['h_roll_corners'] = home_rolling_corners
        df['h_roll_cards'] = home_rolling_cards

        df['a_roll_pts'] = away_rolling_points
        df['a_roll_gf'] = away_rolling_goals_scored
        df['a_roll_ga'] = away_rolling_goals_conceded
        df['a_roll_sot'] = away_rolling_shots_target
        df['a_roll_corners'] = away_rolling_corners
        df['a_roll_cards'] = away_rolling_cards

        # Diferenciales ofensivos y defensivos
        df['diff_roll_pts'] = df['h_roll_pts'] - df['a_roll_pts']
        df['diff_roll_gf'] = df['h_roll_gf'] - df['a_roll_gf']
        df['diff_roll_ga'] = df['a_roll_ga'] - df['h_roll_ga'] # positivo = local concede menos
        df['diff_roll_sot'] = df['h_roll_sot'] - df['a_roll_sot']

        self.df_features = df
        return df

    def get_latest_team_metrics(self) -> Dict[str, Dict[str, float]]:
        """Devuelve los promedios rodantes más recientes de cada club para predecir futuros partidos."""
        df_feats = self.compute_rolling_features()
        teams = sorted(list(set(self.df['HomeTeam'].unique()) | set(self.df['AwayTeam'].unique())))
        latest_metrics = {}
        for team in teams:
            team_matches = df_feats[(df_feats['HomeTeam'] == team) | (df_feats['AwayTeam'] == team)].tail(1)
            if not team_matches.empty:
                row = team_matches.iloc[0]
                if row['HomeTeam'] == team:
                    latest_metrics[team] = {
                        'pts': round(float(row['h_roll_pts']), 2),
                        'gf': round(float(row['h_roll_gf']), 2),
                        'ga': round(float(row['h_roll_ga']), 2),
                        'sot': round(float(row['h_roll_sot']), 2),
                        'corners': round(float(row['h_roll_corners']), 2),
                        'cards': round(float(row['h_roll_cards']), 2)
                    }
                else:
                    latest_metrics[team] = {
                        'pts': round(float(row['a_roll_pts']), 2),
                        'gf': round(float(row['a_roll_gf']), 2),
                        'ga': round(float(row['a_roll_ga']), 2),
                        'sot': round(float(row['a_roll_sot']), 2),
                        'corners': round(float(row['a_roll_corners']), 2),
                        'cards': round(float(row['a_roll_cards']), 2)
                    }
            else:
                latest_metrics[team] = {'pts': 1.0, 'gf': 1.0, 'ga': 1.0, 'sot': 4.0, 'corners': 4.5, 'cards': 2.0}
        return latest_metrics
