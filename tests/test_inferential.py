"""
Pruebas unitarias para el motor inferencial y probabilístico (6 Integrantes)
"""
import unittest
import pandas as pd
import os
from src.analytics.data_processor import DataProcessor
from src.analytics.inferential_engine import InferentialEngine

class TestInferentialEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.processor = DataProcessor()
        cls.engine = InferentialEngine(cls.processor.df)

    def test_hypergeometric_calculation(self):
        # N=10, r=4, n=3, x=2
        res = self.engine.calculate_hypergeometric(N=10, r=4, n=3, x=2)
        self.assertEqual(res['N'], 10)
        self.assertEqual(res['r'], 4)
        self.assertEqual(res['n'], 3)
        self.assertEqual(res['x'], 2)
        # Probabilidad teórica: (C(4,2)*C(6,1)) / C(10,3) = (6*6)/120 = 36/120 = 0.3
        self.assertAlmostEqual(res['pmf_exact'], 0.3, places=3)
        self.assertEqual(len(res['k_values']), len(res['pmf_values']))

    def test_all_six_members(self):
        for member_id in range(1, 7):
            analysis = self.engine.get_member_analysis(member_id)
            self.assertEqual(analysis['member_id'], member_id)
            self.assertIn('title', analysis)
            self.assertIn('question', analysis)
            self.assertIn('bayes', analysis['stats'])
            self.assertIn('contingency_table', analysis['stats'])
            self.assertIn('hypothesis_test', analysis['stats'])
            
            bayes = analysis['stats']['bayes']
            # Probabilidades válidas [0, 1]
            self.assertTrue(0.0 <= bayes['prior_P_A'] <= 1.0)
            self.assertTrue(0.0 <= bayes['posterior_P_A_given_B'] <= 1.0)

    def test_member_1_specific_results(self):
        # Integrante 1: P(H | HST > 5) debe ser notablemente superior a P(H)
        analysis = self.engine.get_member_analysis(1)
        bayes = analysis['stats']['bayes']
        self.assertGreater(bayes['posterior_P_A_given_B'], bayes['prior_P_A'])
        self.assertTrue(analysis['stats']['hypothesis_test']['is_statistically_significant'])

    def test_member_3_halftime_lead(self):
        # Integrante 3: Ganando al descanso da > 70% de victoria local
        analysis = self.engine.get_member_analysis(3)
        bayes = analysis['stats']['bayes']
        self.assertGreater(bayes['posterior_P_A_given_B'], 0.70)

    def test_binomial_calculation(self):
        # n=5, p=0.5, k=2 -> C(5,2)*(0.5)^5 = 10 * 0.03125 = 0.3125
        res = self.engine.calculate_binomial(n=5, p=0.5, k=2)
        self.assertEqual(res['n'], 5)
        self.assertEqual(res['k'], 2)
        self.assertAlmostEqual(res['pmf_exact'], 0.3125, places=4)
        self.assertAlmostEqual(res['expected_value'], 2.5, places=2)
        self.assertAlmostEqual(res['variance'], 1.25, places=2)
        self.assertEqual(len(res['k_values']), 6) # 0 to 5

    def test_reliability_metrics(self):
        rel = self.engine.get_reliability_metrics()
        self.assertEqual(rel['sample_size'], 3800)
        self.assertIn('dispersion_metrics', rel)
        self.assertIn('hypothesis_test', rel)
        disp = rel['dispersion_metrics']
        # s de goles debe estar en torno a ~1.25
        self.assertTrue(1.0 <= disp['std_fthg'] <= 1.5)
        self.assertTrue(1.0 <= disp['std_ftag'] <= 1.5)
        # Z de localía debe ser significativo
        test = rel['hypothesis_test']
        self.assertLess(test['p_value'], 0.001)
        self.assertIn('Rechazar H0', test['decision'])

    def test_poisson_calculation(self):
        res = self.engine.calculate_poisson(mu=1.45, x=2)
        self.assertEqual(res['mu'], 1.45)
        self.assertEqual(res['x'], 2)
        self.assertAlmostEqual(res['variance'], 1.45, places=2)
        self.assertAlmostEqual(res['std_dev'], 1.45 ** 0.5, places=2)
        self.assertTrue(res['is_usual'])
        self.assertTrue(0.0 <= res['pmf_exact'] <= 1.0)
        self.assertTrue(0.0 <= res['cdf_leq'] <= 1.0)

    def test_normal_calculation(self):
        res = self.engine.calculate_normal(value=75.0, mean=52.8, std_dev=16.5)
        self.assertAlmostEqual(res['z_score'], (75.0 - 52.8) / 16.5, places=2)
        self.assertIn('case_1_left', res['areas'])
        self.assertIn('case_2_right', res['areas'])
        self.assertIn('68_percent', res['empirical_rule'])
        self.assertIn('95_percent', res['empirical_rule'])

    def test_descriptive_analysis(self):
        desc = self.engine.get_descriptive_analysis()
        self.assertIn('pregunta_1_localia', desc)
        self.assertIn('pregunta_2_eficiencia', desc)
        self.assertIn('pregunta_3_evolucion', desc)
        self.assertIn('hallazgos_principales', desc)
        self.assertEqual(len(desc['hallazgos_principales']), 3)

if __name__ == '__main__':
    unittest.main()
