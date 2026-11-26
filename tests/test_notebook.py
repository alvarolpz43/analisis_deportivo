"""
Pruebas unitarias para el motor de ejecución del cuaderno Colab (LaLigaScrap.ipynb)
"""
import unittest
from src.analytics.notebook_runner import NotebookRunner


class TestNotebookRunner(unittest.TestCase):
    def setUp(self):
        self.runner = NotebookRunner()

    def test_load_notebook_structure(self):
        nb = self.runner.get_notebook()
        self.assertEqual(nb["filename"], "LaLigaScrap.ipynb")
        self.assertGreater(nb["total_cells"], 10)
        self.assertGreaterEqual(nb["code_cells"], 8)
        self.assertIn("colab.research.google.com", nb["colab_url"])

    def test_execute_all_cells_and_outputs(self):
        results = self.runner.execute_all()
        self.assertGreaterEqual(len(results), 8)
        for res in results:
            self.assertEqual(res["status"], "ok", f"Error en celda {res['cell_index']}: {res.get('error')}")

        all_stdout = "\n".join(r["stdout"] for r in results)
        self.assertIn("3800 partidos", all_stdout)
        self.assertIn("Valores ausentes (NaN): 0", all_stdout)
        self.assertIn("RESULTADOS PREGUNTA 1", all_stdout)
        self.assertIn("RESULTADOS PREGUNTA 2", all_stdout)
        self.assertIn("RESULTADOS PREGUNTA 3", all_stdout)
        self.assertIn("EVALUACIÓN DEL MODELO PREDICTIVO", all_stdout)
        self.assertIn("Predicción: Real Madrid vs Barcelona", all_stdout)

        all_html = [h for r in results for h in r["html_outputs"]]
        self.assertGreaterEqual(len(all_html), 2)
        self.assertTrue(any("<table" in h for h in all_html))

        all_images = [img for r in results for img in r["images"]]
        self.assertEqual(len(all_images), 3)
        for img in all_images:
            self.assertTrue(img.startswith("data:image/png;base64,"))

    def test_custom_code_execution_and_reset(self):
        nb = self.runner.get_notebook()
        first_code_idx = next(c["index"] for c in nb["cells"] if c["cell_type"] == "code")

        res = self.runner.execute_cell(first_code_idx, code="x_test = 40 + 2\nx_test")
        self.assertEqual(res["status"], "ok")
        self.assertIn("42", res["stdout"])

        reset_res = self.runner.reset_kernel()
        self.assertEqual(reset_res["status"], "reset")
        self.assertEqual(reset_res["execution_counter"], 0)

        err_res = self.runner.execute_cell(first_code_idx, code="print(x_test)")
        self.assertEqual(err_res["status"], "error")
        self.assertIn("NameError", err_res["error"])

    def test_auto_run_prerequisites_on_middle_cell(self):
        self.runner.reset_kernel()
        nb = self.runner.get_notebook()
        code_indices = [c["index"] for c in nb["cells"] if c["cell_type"] == "code"]
        target_idx = code_indices[4]  # Celda de Pregunta 1
        res = self.runner.execute_cell(target_idx)
        self.assertEqual(res["status"], "ok")
        self.assertEqual(len(res["prerequisite_results"]), 4)
        self.assertIn("RESULTADOS PREGUNTA 1", res["stdout"])


if __name__ == "__main__":
    unittest.main()
