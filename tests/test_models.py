"""
Pruebas unitarias para el modelo de Machine Learning y el Predictor de Partidos
"""
import unittest
from src.analytics.data_processor import DataProcessor
from src.models.train import ModelTrainer
from src.models.predictor import MatchPredictor

class TestMLAndPredictor(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.processor = DataProcessor()
        cls.trainer = ModelTrainer(cls.processor)
        cls.trainer.train_and_evaluate()
        cls.predictor = MatchPredictor(cls.trainer)

    def test_training_metrics(self):
        metrics = self.trainer.metrics
        self.assertIn('logistic_regression', metrics['models'])
        self.assertIn('random_forest', metrics['models'])
        acc_lr = metrics['models']['logistic_regression']['accuracy']
        acc_rf = metrics['models']['random_forest']['accuracy']
        self.assertGreater(acc_lr, 40.0) # Mejor que azar (33.3%)
        self.assertGreater(acc_rf, 40.0)

    def test_prediction_output(self):
        pred = self.predictor.predict_match('Real Madrid', 'Barcelona')
        probs = pred['probabilities']
        total_p = probs['home_win'] + probs['draw'] + probs['away_win']
        self.assertAlmostEqual(total_p, 1.0, places=2)
        
        odds = pred['fair_odds']
        self.assertGreater(odds['home_win'], 1.0)
        self.assertGreater(odds['draw'], 1.0)
        self.assertGreater(odds['away_win'], 1.0)

        # Poisson xG
        xG = pred['expected_goals']
        self.assertGreater(xG['home_xG'], 0.0)
        self.assertGreater(xG['away_xG'], 0.0)
        self.assertTrue(0.0 <= xG['prob_over_2_5'] <= 1.0)

    def test_bayesian_adjustment_effect(self):
        pred_base = self.predictor.predict_match('Real Madrid', 'Barcelona')
        pred_cond = self.predictor.predict_match('Real Madrid', 'Barcelona', bayesian_condition='HST_GT_5')
        # Proyectar asedio local debe aumentar probabilidad de victoria local
        self.assertGreater(pred_cond['probabilities']['home_win'], pred_base['probabilities']['home_win'])

    def test_historical_simulation_mode(self):
        pred_hist = self.predictor.predict_match('Real Madrid', 'Barcelona', simulation_mode='historical')
        self.assertEqual(pred_hist['simulation_mode'], 'historical')
        self.assertIn('head_to_head', pred_hist)
        h2h = pred_hist['head_to_head']
        self.assertGreaterEqual(h2h['direct_at_venue']['total_matches'], 1)
        self.assertEqual(len(h2h['recent_encounters']), 5)
        probs = pred_hist['probabilities']
        total_p = probs['home_win'] + probs['draw'] + probs['away_win']
        self.assertAlmostEqual(total_p, 1.0, places=2)

    def test_match_simulation_timeline(self):
        pred = self.predictor.predict_match('Real Madrid', 'Barcelona', simulation_mode='historical')
        self.assertIn('match_simulation', pred)
        sim = pred['match_simulation']
        self.assertEqual(sim['duration_seconds'], 30)
        self.assertIn('final_score', sim)
        self.assertIn('total_stats', sim)
        self.assertIn('timeline', sim)
        timeline = sim['timeline']
        self.assertGreaterEqual(len(timeline), 10)

        # Verificar evento inicial y final
        self.assertEqual(timeline[0]['minute'], 0)
        self.assertEqual(timeline[0]['type'], 'kickoff')
        self.assertEqual(timeline[-1]['minute'], 90)
        self.assertEqual(timeline[-1]['type'], 'fulltime')

        # Verificar estructura de eventos
        for ev in timeline:
            self.assertIn('minute', ev)
            self.assertIn('type', ev)
            self.assertIn('title', ev)
            self.assertIn('description', ev)
            self.assertIn('pitch_zone', ev)
            self.assertIn('current_home_score', ev)
            self.assertIn('current_away_score', ev)
            self.assertIn('stats_snapshot', ev)
            self.assertTrue(0 <= ev['minute'] <= 90)

        # Coherencia del marcador final
        self.assertEqual(sim['final_score']['home'], timeline[-1]['current_home_score'])
        self.assertEqual(sim['final_score']['away'], timeline[-1]['current_away_score'])

if __name__ == '__main__':
    unittest.main()
