# Estimación de Probabilidades y Predicción de Resultados en LaLiga Primera División
## Plataforma de Ciencia de Datos, Estadística Inferencial y Machine Learning

---

### 🎓 Información Institucional y Autoría
* **Institución:** Institución Universitaria Colegio Mayor del Cauca
* **Facultad:** Facultad de Ingeniería — Programa de Ingeniería Informática
* **Asignatura:** Estadística Inferencial (Ciclo Académico 2026)
* **Docente Titular:** Edith Janeth Potosí Estrada
* **Equipo de Investigadores y Autores:**
  1. José Luis Martínez
  2. Álvaro José López Quira
  3. Jose Aldair Torres
  4. Cristian Samir Narváez
  5. Joan Sebastian Mosquera
  6. Rubén Darío Velasco

---

## 📌 Descripción General del Proyecto
Plataforma integral de analítica deportiva para la **Primera División de España (LaLiga)** sustentada en **10 temporadas completas (2016/17 a 2025/26, 3.800 partidos)** consolidadas de *Football-Data.co.uk* tras auditoría del archivo `robots.txt`.

El software combina de forma rigurosa:
1. **Web Scraping Ético y Depuración de Datos:** Consolidación de 21 variables limpias sin fuga de datos (*zero data leakage*).
2. **Estadística Inferencial y Probabilidad Formal:**
   - **Espacio Muestral y Axiomas de Probabilidad:** $\Omega = \{V_A, E, V_B\}$, uniones y complementos.
   - **Distribución Binomial:** $P(X = k) = \binom{n}{k}p^k(1-p)^{n-k}$ para modelar eventos independientes y goles por partido.
   - **Distribución Hipergeométrica:** Muestreo finito dependiente sin reemplazo (tiros a puerta, córners y tarjetas).
   - **Teorema de Bayes:** Actualización empírica para las 6 hipótesis de investigación de los autores.
   - **Validación de Confiabilidad:** Cálculo de la **desviación estándar muestral** ($s$) y **Prueba de Hipótesis Bilateral de Localía** ($H_0: p = 0.5$ vs $H_1: p \ne 0.5$).
3. **Machine Learning & Poisson Bivariado:**
   - Ensamble cronológico (80% Train, 20% Test) de Regresión Logística y Random Forest con ventana rodante de 5 partidos.
   - Cálculo de goles esperados ($xG$), matrices de marcadores probables y cuotas justas implícitas ($1 / P$).
4. **Simulador de Temporada y Proyección de Campeón:** Simulación Monte Carlo de las 38 jornadas (380 partidos) bajo el formato de *todos contra todos por puntos*, proyectando la tabla de posiciones, puntos esperados y probabilidades de título y clasificación europea.
5. **Dashboard SPA Interactivo & Ecuaciones KaTeX:** Interfaz web moderna con tipografía matemática $\LaTeX$ y código fuente Python visible lado a lado.

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Python 3.10 o superior (verificado en Python 3.12).
- Dependencias instaladas:
  ```powershell
  pip install -r requirements.txt
  ```

### Modos de Ejecución Oficiales

1. **Dashboard Web Interactivo (Recomendado):**
   ```powershell
   python main.py
   ```
   *(Inicia el servidor FastAPI en `http://127.0.0.1:8000` y abre automáticamente el navegador).* También puedes hacer doble clic en `run.bat` o ejecutar `python run.py`.

2. **Reporte Analítico en Consola (CLI):**
   ```powershell
   python main.py --cli
   ```
   *(Emite el resumen ejecutivo de datos, modelos, 6 integrantes y proyección de campeón en terminal).*

3. **Ejecución de Módulos Específicos:**
   - Auditoría y extracción de datos: `python datos.py --summary`
   - Modelado estadístico y fórmulas: `python modelo.py`
   - Cuaderno interactivo de extracción y EDA: Abrir `LaLigaScrap.ipynb` en Jupyter Notebook o VS Code.

4. **Informe Técnico Escrito:**
   - Documento Markdown: `INFORME_TECNICO_FINAL_LALIGA.md`
   - Versión Web Imprimible / Guardar en PDF: Abrir `web/informe_tecnico.html` en el navegador.

---

## 🏛️ Estructura de Archivos del Proyecto

```
analisis_deportivo/
├── datos.py                                      # Módulo oficial de datos, robots.txt, limpieza y tipado
├── modelo.py                                     # Módulo oficial de marco estadístico (Bayes, Binomial, Hipergeométrica, s)
├── main.py                                       # Lanzador unificado (soporta --web y --cli)
├── LaLigaScrap.ipynb                             # Cuaderno Jupyter de extracción, validación y EDA
├── INFORME_TECNICO_FINAL_LALIGA.md               # Informe técnico académico final estructurado en 5 secciones
├── run.py                                        # Script alternativo de lanzamiento directo
├── run.bat                                       # Lanzador de 1 clic para entornos Windows
├── requirements.txt                              # Dependencias fijadas del entorno Python
├── data/
│   ├── espana_10_temporadas_consolidado.csv      # Dataset maestro (3.800 partidos, 21 variables, 0 nulos)
│   └── variablesPorCasaIntegranteEstadistica.md  # Especificación de variables y preguntas de investigación
├── src/
│   ├── scraper/
│   │   └── football_scraper.py                   # Scraper ético para Football-Data.co.uk
│   ├── analytics/
│   │   ├── data_processor.py                     # Motor de procesamiento y cálculo de medias móviles (rolling 5)
│   │   └── inferential_engine.py                 # Motor de Bayes, Binomial, Hipergeométrica y Confiabilidad
│   ├── models/
│   │   ├── train.py                              # Entrenamiento de modelos ML (Logistic Regression, Random Forest)
│   │   ├── predictor.py                          # Predictor de partidos, cuotas justas y Poisson xG
│   │   └── tournament_simulator.py               # Simulador Monte Carlo de temporada completa (380 partidos)
│   └── api/
│       └── app.py                                # Servidor RESTful FastAPI con todos los endpoints expuestos
├── web/
│   ├── index.html                                # Dashboard SPA con 5 pestañas temáticas
│   ├── informe_tecnico.html                      # Versión web imprimible del informe técnico con KaTeX
│   ├── css/
│   │   └── styles.css                            # Sistema de diseño dark mode con variables CSS y selectores
│   └── js/
│       ├── api.js                                # Cliente asíncrono Fetch API
│       ├── charts.js                             # Renderizado de gráficos interactivos con Chart.js
│       └── app.js                                # Controlador principal, KaTeX, modales y reactividad
└── tests/
    ├── test_academic_modules.py                  # Pruebas unitarias de datos.py y modelo.py
    ├── test_inferential.py                       # Pruebas de Bayes, Hipergeométrica, Binomial y Confiabilidad
    ├── test_models.py                            # Pruebas de ML, Poisson y simulación histórica H2H
    └── test_api.py                               # Pruebas de rutas y endpoints de la API RESTful
```

---

## 🔬 Síntesis Metodológica de los 6 Roles / Integrantes

| ID | Investigador | Pregunta de Investigación Condicional | P(Previa) | P(Posterior) | Odds Ratio | Significancia |
|:--:|:---|:---|:---:|:---:|:---:|:---:|
| **1** | José Luis Martínez | $P(\text{FTR} = \text{H} \mid \text{HST} > 5)$ | 45.5% | **65.2%** | 3.12 | $p < 0.0001$ |
| **2** | Álvaro José López Quira | $P(\text{FTHG} \ge 2 \mid \text{HST} > 5)$ | 42.9% | **69.1%** | 4.23 | $p < 0.0001$ |
| **3** | Jose Aldair Torres | $P(\text{FTR} = \text{H} \mid \text{HTR} = \text{H})$ | 45.5% | **78.5%** | 7.64 | $p < 0.0001$ |
| **4** | Cristian Samir Narváez | $P(\text{FTR} = \text{H} \mid \text{HC} > 6)$ | 45.5% | **40.7%** | 0.77 | $p < 0.0001$ |
| **5** | Joan Sebastian Mosquera | $P(\text{FTR} \neq \text{H} \mid \text{Tarjetas} \ge 3)$ | 54.5% | **61.0%** | 1.54 | $p < 0.0001$ |
| **6** | Rubén Darío Velasco | $P(\text{FTR} = \text{A} \mid \text{AST} > 4)$ | 28.3% | **48.7%** | 3.44 | $p < 0.0001$ |

---

## 🧪 Ejecución de Pruebas Automatizadas

El proyecto incluye 28 pruebas unitarias e integración que validan matemáticamente todas las funciones:
```powershell
python -m unittest discover -s tests -p "test_*.py" -v
```
**Resultado:** `Ran 28 tests in 11.568s - OK` (100% exitosas).
