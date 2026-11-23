"""
Pruebas de los Módulos Académicos Oficiales: datos.py y modelo.py
"""
import unittest
import pandas as pd
from datos import load_consolidated_data, get_dataset_summary, check_robots_txt
from modelo import (
    calcular_espacio_muestral_y_reglas,
    distribucion_binomial,
    distribucion_hipergeometrica,
    actualizacion_bayesiana,
    calcular_confiabilidad_y_desviacion_estandar
)

class TestAcademicModules(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.df = load_consolidated_data()

    def test_datos_loading_and_integrity(self):
        self.assertEqual(len(self.df), 3800)
        summary = get_dataset_summary(self.df)
        self.assertEqual(summary['total_partidos'], 3800)
        self.assertEqual(summary['valores_nulos_totales'], 0)
        self.assertEqual(summary['total_clubes'], 31)

    def test_robots_txt(self):
        res = check_robots_txt()
        self.assertIn('status', res)
        self.assertTrue(res['can_fetch'])

    def test_modelo_espacio_muestral(self):
        res = calcular_espacio_muestral_y_reglas(self.df)
        self.assertEqual(res['total_observaciones'], 3800)
        probs = res['probabilidades_simples']
        total_p = probs['P(V_A)'] + probs['P(E)'] + probs['P(V_B)']
        self.assertAlmostEqual(total_p, 1.0, places=3)

    def test_modelo_binomial(self):
        b = distribucion_binomial(n=10, p=0.3, k=3)
        self.assertEqual(b['parametros']['n'], 10)
        self.assertAlmostEqual(b['esperanza_E_X'], 3.0, places=2)
        self.assertTrue(0.0 <= b['P(X = k)'] <= 1.0)

    def test_modelo_hipergeometrica(self):
        h = distribucion_hipergeometrica(N=20, r=8, n=5, x=2)
        self.assertEqual(h['parametros']['N'], 20)
        self.assertTrue(0.0 <= h['P(X = x)'] <= 1.0)

    def test_modelo_bayes(self):
        bayes = actualizacion_bayesiana(prior_A=0.45, likelihood_B_given_A=0.60, prob_B=0.30)
        # P(A|B) = (0.60 * 0.45) / 0.30 = 0.90
        self.assertAlmostEqual(bayes['posterior_A_given_B'], 0.90, places=2)

    def test_modelo_confiabilidad(self):
        conf = calcular_confiabilidad_y_desviacion_estandar(self.df)
        self.assertEqual(conf['n_muestral'], 3800)
        self.assertTrue(conf['desviacion_estandar_goles']['desv_estandar_local_s'] > 0)
        self.assertIn('Rechazar H0', conf['prueba_hipotesis_bilateral']['decision'])

if __name__ == '__main__':
    unittest.main()
