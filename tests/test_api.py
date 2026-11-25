"""
Prueba integral de integración de todos los endpoints de FastAPI y montaje estático.
"""
from fastapi.testclient import TestClient
from src.api.app import app
import unittest

class TestAPIRoutes(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_summary(self):
        r = self.client.get('/api/summary')
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data['total_matches'], 3800)
        self.assertEqual(data['num_teams'], 31)

    def test_teams(self):
        r = self.client.get('/api/teams')
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(len(data['teams']), 31)
        self.assertIn('Real Madrid', data['teams'])
        self.assertIn('Barcelona', data['teams'])

    def test_all_six_members_endpoints(self):
        for m_id in range(1, 7):
            r = self.client.get(f'/api/member/{m_id}')
            self.assertEqual(r.status_code, 200)
            data = r.json()
            self.assertEqual(data['member_id'], m_id)
            self.assertIn('bayes', data['stats'])
            self.assertIn('contingency_table', data['stats'])

    def test_hypergeometric_endpoint(self):
        r = self.client.get('/api/hypergeometric/calculate?N=15&r=7&n=5&x=3')
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn('pmf_exact', data)
        self.assertIn('cdf_leq', data)
        self.assertIn('k_values', data)

    def test_predict_endpoint(self):
        payload = {
            'home_team': 'Real Madrid',
            'away_team': 'Barcelona',
            'bayesian_condition': 'HST_GT_5',
            'simulation_mode': 'historical'
        }
        r = self.client.post('/api/predict', json=payload)
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data['simulation_mode'], 'historical')
        self.assertIn('probabilities', data)
        self.assertIn('fair_odds', data)
        self.assertIn('expected_goals', data)
        self.assertIn('top_scores', data)
        self.assertIn('head_to_head', data)
        self.assertIn('binomial_parameters', data['analyzed_variables'])
        self.assertNotIn('poisson_parameters', data['analyzed_variables'])
        self.assertIn('match_simulation', data)
        self.assertEqual(data['match_simulation']['duration_seconds'], 30)
        self.assertGreaterEqual(len(data['match_simulation']['timeline']), 10)

    def test_model_metrics_endpoint(self):
        r = self.client.get('/api/model/metrics')
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn('logistic_regression', data['models'])
        self.assertIn('random_forest', data['models'])

    def test_matches_endpoint(self):
        r = self.client.get('/api/matches?page=1&page_size=10')
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(len(data['matches']), 10)
        self.assertEqual(data['total'], 3800)

    def test_binomial_endpoint(self):
        r = self.client.get('/api/binomial/calculate?n=6&p=0.4&k=2')
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(data['n'], 6)
        self.assertEqual(data['k'], 2)
        self.assertIn('pmf_exact', data)
        self.assertIn('expected_value', data)

    def test_reliability_endpoint(self):
        r = self.client.get('/api/reliability')
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn('dispersion_metrics', data)
        self.assertIn('hypothesis_test', data)
        self.assertEqual(data['sample_size'], 3800)

    def test_tournament_simulate_endpoint(self):
        r = self.client.get('/api/tournament/simulate?simulations=10')
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertEqual(len(data['standings']), 20)
        self.assertIn('projected_champion', data)
        self.assertTrue(data['champion_probability'] > 0)

    def test_descriptive_questions_endpoint(self):
        r = self.client.get('/api/descriptive/questions')
        self.assertEqual(r.status_code, 200)
        data = r.json()
        self.assertIn('pregunta_1_localia', data)
        self.assertIn('pregunta_2_eficiencia', data)
        self.assertIn('pregunta_3_evolucion', data)
        self.assertIn('hallazgos_principales', data)

    def test_static_html(self):
        r = self.client.get('/')
        self.assertEqual(r.status_code, 200)
        self.assertIn('La Liga Analytics', r.text)
        self.assertIn('tab-inferential', r.text)
        self.assertIn('tab-equations', r.text)
        self.assertIn('tab-notebook', r.text)
        self.assertLess(
            r.text.index('data-target="tab-overview"'),
            r.text.index('data-target="tab-notebook"'),
        )
        self.assertLess(
            r.text.index('data-target="tab-notebook"'),
            r.text.index('data-target="tab-inferential"'),
        )
        self.assertIn('no-store', r.headers.get('cache-control', ''))
        self.assertIn('Fundamentos Estadísticos y Mapeo al Código Fuente', r.text)
        self.assertIn('card-theoretical-framework', r.text)
        self.assertIn('theory-pillars-grid', r.text)
        self.assertIn('glossary-grid', r.text)
        self.assertIn('katex', r.text.lower())
        self.assertNotIn('tab-assistant', r.text)
        self.assertNotIn('slider-poisson-mu', r.text)
        self.assertNotIn('slider-normal-x', r.text)

    def test_notebook_endpoints(self):
        r = self.client.get('/api/notebook')
        self.assertEqual(r.status_code, 200)
        nb = r.json()
        self.assertEqual(nb['filename'], 'LaLigaScrap.ipynb')
        self.assertGreater(len(nb['cells']), 10)

        first_code_idx = next(c['index'] for c in nb['cells'] if c['cell_type'] == 'code')
        exec_r = self.client.post('/api/notebook/execute', json={'cell_index': first_code_idx})
        self.assertEqual(exec_r.status_code, 200)
        self.assertEqual(exec_r.json()['status'], 'ok')

        all_r = self.client.post('/api/notebook/execute-all')
        self.assertEqual(all_r.status_code, 200)
        all_data = all_r.json()
        self.assertEqual(all_data['status'], 'completed')
        self.assertGreaterEqual(all_data['executed_cells'], 6)
        self.assertTrue(all(item['status'] == 'ok' for item in all_data['results']))

        dl_r = self.client.get('/api/notebook/download')
        self.assertEqual(dl_r.status_code, 200)
        self.assertIn('LaLigaScrap.ipynb', dl_r.headers.get('content-disposition', ''))

        reset_r = self.client.post('/api/notebook/reset')
        self.assertEqual(reset_r.status_code, 200)
        self.assertEqual(reset_r.json()['status'], 'reset')

if __name__ == '__main__':
    unittest.main()
