"""
Entrenamiento y Evaluación de Modelos de Machine Learning
Regresión Logística Multinomial y Random Forest con partición cronológica (zero data leakage).
"""
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, f1_score, classification_report, confusion_matrix
import joblib
import os
from typing import Dict, Any, Tuple

from ..analytics.data_processor import DataProcessor

FEATURE_COLS = [
    'diff_roll_pts', 'diff_roll_gf', 'diff_roll_ga', 'diff_roll_sot',
    'h_roll_pts', 'h_roll_gf', 'h_roll_ga', 'h_roll_sot', 'h_roll_corners', 'h_roll_cards',
    'a_roll_pts', 'a_roll_gf', 'a_roll_ga', 'a_roll_sot', 'a_roll_corners', 'a_roll_cards'
]

LABEL_MAP = {'H': 0, 'D': 1, 'A': 2}
INV_LABEL_MAP = {0: 'H', 1: 'D', 2: 'A'}

class ModelTrainer:
    def __init__(self, processor: DataProcessor = None):
        self.processor = processor or DataProcessor()
        self.scaler = StandardScaler()
        self.lr_model = LogisticRegression(max_iter=1000, random_state=42)
        self.rf_model = RandomForestClassifier(n_estimators=150, max_depth=6, random_state=42)
        self.metrics: Dict[str, Any] = {}
        self.is_trained = False

    def train_and_evaluate(self, train_ratio: float = 0.8) -> Dict[str, Any]:
        """Entrena los modelos respetando el orden temporal estricto."""
        df = self.processor.compute_rolling_features()
        
        X = df[FEATURE_COLS].copy()
        y = df['FTR'].map(LABEL_MAP).values

        # Partición cronológica (no aleatoria para series de tiempo deportivas)
        split_idx = int(len(df) * train_ratio)
        X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]

        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # 1. Regresión Logística
        self.lr_model.fit(X_train_scaled, y_train)
        y_pred_lr = self.lr_model.predict(X_test_scaled)
        acc_lr = float(accuracy_score(y_test, y_pred_lr))
        f1_lr = float(f1_score(y_test, y_pred_lr, average='weighted'))

        # 2. Random Forest
        self.rf_model.fit(X_train, y_train)
        y_pred_rf = self.rf_model.predict(X_test)
        acc_rf = float(accuracy_score(y_test, y_pred_rf))
        f1_rf = float(f1_score(y_test, y_pred_rf, average='weighted'))

        # Matrices de confusión
        cm_lr = confusion_matrix(y_test, y_pred_lr).tolist()
        cm_rf = confusion_matrix(y_test, y_pred_rf).tolist()

        # Importancia de características (Random Forest)
        importances = [
            {"feature": col, "importance": round(float(imp), 4)}
            for col, imp in sorted(zip(FEATURE_COLS, self.rf_model.feature_importances_), key=lambda x: x[1], reverse=True)
        ]

        self.metrics = {
            "total_samples": len(df),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "train_period": f"{df.iloc[0]['Date']} - {df.iloc[split_idx-1]['Date']}",
            "test_period": f"{df.iloc[split_idx]['Date']} - {df.iloc[-1]['Date']}",
            "models": {
                "logistic_regression": {
                    "accuracy": round(acc_lr * 100, 2),
                    "f1_score": round(f1_lr * 100, 2),
                    "confusion_matrix": cm_lr,
                    "classes": ['H', 'D', 'A']
                },
                "random_forest": {
                    "accuracy": round(acc_rf * 100, 2),
                    "f1_score": round(f1_rf * 100, 2),
                    "confusion_matrix": cm_rf,
                    "classes": ['H', 'D', 'A'],
                    "feature_importances": importances
                }
            }
        }
        self.is_trained = True
        return self.metrics

if __name__ == "__main__":
    trainer = ModelTrainer()
    metrics = trainer.train_and_evaluate()
    print("Métricas de entrenamiento:")
    print(metrics)
