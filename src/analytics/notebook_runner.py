"""
Motor de ejecución interactivo para el cuaderno Jupyter/Colab (LaLigaScrap.ipynb).
Permite parsear celdas Markdown/Código y ejecutarlas de forma persistente (stateful)
capturando stdout, DataFrames HTML y gráficas matplotlib en formato PNG Base64.
"""
import ast
import base64
import contextlib
import io
import json
import os
import threading
import time
import traceback
from typing import Any, Dict, List, Optional

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import pandas as pd


COLAB_GITHUB_URL = (
    "https://colab.research.google.com/drive/1tLSmHw77EA01G7AOqRDKQNhNi39eD_Wx?usp=sharing"
)


class NotebookRunner:
    """Ejecutor stateful en memoria para celdas Python de un cuaderno .ipynb."""

    def __init__(self, notebook_path: Optional[str] = None):
        self.project_root = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..")
        )
        self.notebook_path = notebook_path or os.path.join(
            self.project_root, "LaLigaScrap.ipynb"
        )
        self._lock = threading.RLock()
        self.namespace: Dict[str, Any] = {}
        self.execution_counter: int = 0
        self.cell_states: Dict[int, Dict[str, Any]] = {}
        self._init_namespace()

    def _init_namespace(self) -> None:
        self.namespace = {"__name__": "__main__"}
        self.execution_counter = 0
        self.cell_states = {}

    def _load_raw_notebook(self) -> Dict[str, Any]:
        if not os.path.exists(self.notebook_path):
            raise FileNotFoundError(
                f"No se encontró el cuaderno en {self.notebook_path}"
            )
        with open(self.notebook_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def get_notebook(self) -> Dict[str, Any]:
        """Devuelve metadatos y celdas del cuaderno con su último estado de ejecución."""
        nb = self._load_raw_notebook()
        cells_out: List[Dict[str, Any]] = []

        for idx, cell in enumerate(nb.get("cells", [])):
            cell_type = cell.get("cell_type", "code")
            src = cell.get("source", "")
            if isinstance(src, list):
                src = "".join(src)

            state = self.cell_states.get(idx, {})
            cells_out.append(
                {
                    "index": idx,
                    "cell_type": cell_type,
                    "source": src,
                    "execution_count": state.get("execution_count"),
                    "status": state.get("status", "idle"),
                    "stdout": state.get("stdout", ""),
                    "html_outputs": state.get("html_outputs", []),
                    "images": state.get("images", []),
                    "error": state.get("error"),
                    "duration_ms": state.get("duration_ms"),
                }
            )

        return {
            "filename": os.path.basename(self.notebook_path),
            "colab_url": COLAB_GITHUB_URL,
            "total_cells": len(cells_out),
            "code_cells": sum(1 for c in cells_out if c["cell_type"] == "code"),
            "kernel_status": "ready",
            "execution_counter": self.execution_counter,
            "cells": cells_out,
        }

    def reset_kernel(self) -> Dict[str, Any]:
        """Reinicia el espacio de nombres y limpia todas las salidas almacenadas."""
        with self._lock:
            plt.close("all")
            self._init_namespace()
        return {"status": "reset", "kernel_status": "ready", "execution_counter": 0}

    def execute_cell(
        self,
        cell_index: int,
        code: Optional[str] = None,
        auto_run_prior: bool = True,
    ) -> Dict[str, Any]:
        """Ejecuta una celda de código en el entorno persistente del cuaderno."""
        nb = self._load_raw_notebook()
        cells = nb.get("cells", [])
        if cell_index < 0 or cell_index >= len(cells):
            raise IndexError(f"Índice de celda inválido: {cell_index}")

        target_cell = cells[cell_index]
        if target_cell.get("cell_type") != "code":
            raise ValueError(f"La celda {cell_index} no es una celda de código.")

        with self._lock:
            prerequisite_results: List[Dict[str, Any]] = []
            if auto_run_prior:
                for prev_idx in range(cell_index):
                    if (
                        cells[prev_idx].get("cell_type") == "code"
                        and prev_idx not in self.cell_states
                    ):
                        prev_res = self.execute_cell(
                            prev_idx, code=None, auto_run_prior=False
                        )
                        prerequisite_results.append(prev_res)
                        if prev_res["status"] == "error":
                            break

            if code is None:
                raw_src = target_cell.get("source", "")
                code = "".join(raw_src) if isinstance(raw_src, list) else raw_src

            self.execution_counter += 1
            exec_count = self.execution_counter
            stdout_buf = io.StringIO()
            stderr_buf = io.StringIO()
            html_outputs: List[str] = []
            images: List[str] = []
            error_msg: Optional[str] = None
            status = "ok"

            def capture_figures() -> None:
                for fig_num in plt.get_fignums():
                    fig = plt.figure(fig_num)
                    img_buf = io.BytesIO()
                    fig.savefig(
                        img_buf,
                        format="png",
                        dpi=120,
                        bbox_inches="tight",
                        facecolor="#ffffff",
                    )
                    img_buf.seek(0)
                    b64 = base64.b64encode(img_buf.read()).decode("ascii")
                    images.append(f"data:image/png;base64,{b64}")
                plt.close("all")

            orig_show = plt.show
            prev_cwd = os.getcwd()
            t0 = time.perf_counter()

            try:
                os.chdir(self.project_root)
                plt.close("all")
                plt.show = lambda *args, **kwargs: capture_figures()

                tree = ast.parse(code, mode="exec")
                with (
                    contextlib.redirect_stdout(stdout_buf),
                    contextlib.redirect_stderr(stderr_buf),
                ):
                    if tree.body and isinstance(tree.body[-1], ast.Expr):
                        exec_mod = ast.Module(
                            body=tree.body[:-1], type_ignores=[]
                        )
                        eval_expr = ast.Expression(body=tree.body[-1].value)
                        if exec_mod.body:
                            exec(
                                compile(
                                    exec_mod,
                                    f"<colab-cell-{cell_index}>",
                                    "exec",
                                ),
                                self.namespace,
                            )
                        last_val = eval(
                            compile(
                                eval_expr,
                                f"<colab-cell-{cell_index}>",
                                "eval",
                            ),
                            self.namespace,
                        )
                        if last_val is not None:
                            if isinstance(last_val, pd.DataFrame):
                                html_outputs.append(
                                    last_val.to_html(
                                        classes="colab-df-table",
                                        border=0,
                                        max_rows=25,
                                    )
                                )
                            elif isinstance(last_val, pd.Series):
                                html_outputs.append(
                                    last_val.to_frame().to_html(
                                        classes="colab-df-table",
                                        border=0,
                                        max_rows=25,
                                    )
                                )
                            else:
                                print(repr(last_val))
                    else:
                        exec(
                            compile(
                                tree, f"<colab-cell-{cell_index}>", "exec"
                            ),
                            self.namespace,
                        )

                capture_figures()
            except Exception as exc:
                status = "error"
                plt.close("all")
                tb = traceback.format_exc()
                if isinstance(exc, NameError):
                    tb += (
                        "\n[Sugerencia] Ejecuta las celdas anteriores primero "
                        "o presiona 'Ejecutar Todo'."
                    )
                error_msg = tb
            finally:
                plt.show = orig_show
                os.chdir(prev_cwd)

            duration_ms = round((time.perf_counter() - t0) * 1000.0, 1)
            combined_out = stdout_buf.getvalue()
            err_text = stderr_buf.getvalue()
            if err_text:
                combined_out = (
                    f"{combined_out}\n{err_text}" if combined_out else err_text
                )

            result = {
                "cell_index": cell_index,
                "execution_count": exec_count,
                "status": status,
                "stdout": combined_out.rstrip(),
                "html_outputs": html_outputs,
                "images": images,
                "error": error_msg,
                "duration_ms": duration_ms,
                "prerequisite_results": prerequisite_results,
            }
            self.cell_states[cell_index] = result
            return result

    def execute_all(self) -> List[Dict[str, Any]]:
        """Reinicia el kernel y ejecuta todas las celdas de código en orden."""
        self.reset_kernel()
        nb = self._load_raw_notebook()
        results: List[Dict[str, Any]] = []
        for idx, cell in enumerate(nb.get("cells", [])):
            if cell.get("cell_type") == "code":
                results.append(self.execute_cell(idx, auto_run_prior=False))
        return results
