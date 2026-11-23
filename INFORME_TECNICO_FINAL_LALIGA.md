# Estimación de Probabilidades y Predicción de Resultados en LaLiga Primera División
## Informe Técnico Final de Modelado Estadístico, Ciencia de Datos e Inferencia Predictiva

---

### Datos Generales del Proyecto
* **Institución Universitaria:** Institución Universitaria Colegio Mayor del Cauca
* **Facultad:** Facultad de Ingeniería — Programa de Ingeniería Informática
* **Articulación Académica Interdisciplinar (2026):**
  * **Asignatura 1:** Estadística Inferencial — **Docente Titular:** Edith Janeth Potosí Estrada
  * **Asignatura 2:** Electiva III: Introducción a la Ciencia de Datos — **Docente Titular:** Carlos E. Ruiz
* **Equipo de Autores / Investigadores (6 Integrantes):**
  1. José Luis Martínez (Eficacia de Remate y Tiros a Puerta Local)
  2. Álvaro José López Quira (Conversión Goleadora FTHG $\ge 2$)
  3. Jose Aldair Torres (Ventaja Parcial al Descanso HTR)
  4. Cristian Samir Narváez (Asedio Ofensivo por Saques de Esquina)
  5. Joan Sebastian Mosquera (Régimen Disciplinario y Tarjetas Sancionadas)
  6. Rubén Darío Velasco (Eficacia Ofensiva Visitante e Integración Predictiva ML)
* **Plataforma y Código Fuente:** Python 3.12 (FastAPI, Scipy, Pandas, Scikit-Learn) & Web SPA (Vanilla JavaScript, Chart.js, KaTeX)
* **Dataset Oficial:** `espana_10_temporadas_consolidado.csv` (10 campañas completas, 3.800 partidos, 21 variables limpias)

---

## 1. Introducción, Alcance y Articulación Interdisciplinar

### 1.1 Contexto y Justificación
En el análisis deportivo moderno, la intuición cualitativa y el seguimiento empírico informal resultan insuficientes para comprender la compleja dinámica de los resultados en competiciones de alto rendimiento. El presente proyecto desarrolla una herramienta integral de software que articula metodológicamente dos pilares de la formación en ingeniería:
1. **La Ciencia de Datos (Electiva III):** Web scraping ético respetando `robots.txt`, depuración sin fuga temporal (*data leakage*), análisis exploratorio de datos (EDA), respuesta fundamentada a preguntas estructurales y modelos predictivos multiclase de Machine Learning.
2. **La Estadística Inferencial Formal (Cátedra Troncal):** Estimación puntual y por intervalos, Teorema de Bayes aplicado a 6 roles tácticos, distribuciones de probabilidad teóricas discretas y continuas (Binomial, Hipergeométrica, Poisson y Normal según el texto guía de Larson & Farber, Capítulos 4 y 7) y contraste formal de hipótesis.

### 1.2 Formato de la Competición y Delimitación Temporal
* **Sistema de Competición:** LaLiga regular opera bajo el formato de **todos contra todos a doble vuelta por puntos**. Cada club disputa 38 jornadas (19 en condición de local y 19 de visitante), otorgando 3 puntos por victoria, 1 por empate y 0 por derrota. Se corona campeón el equipo con mayor puntuación acumulada.
* **Cobertura Histórica:** Se consolidaron exactamente **10 temporadas consecutivas** comprendidas entre los ciclos `2016/17` y `2025/26` (`SP1.csv`), totalizando una población muestral de **3.800 partidos oficiales** ordenados de forma estrictamente cronológica.
* **Granularidad de Análisis:** A nivel de club por partido, sin cuotas comerciales ni alineaciones cambiantes, garantizando la reproducibilidad matemática de las estimaciones.

---

## 2. Marco Teórico y Distribuciones Probabilísticas (Larson & Farber Cap. 4 & 7)

### 2.1 Espacio Muestral y Reglas Fundamentales de Probabilidad
Para cualquier encuentro oficial disputado entre un equipo anfitrión $A$ (local) y un adversario $B$ (visitante), el espacio muestral $\Omega$ de los resultados finales posibles es discreto y finito:
$$\Omega = \{V_A, E, V_B\}$$
donde $V_A$ representa la victoria del equipo local ($\text{FTR} = \text{H}$), $E$ el empate ($\text{FTR} = \text{D}$) y $V_B$ la victoria del visitante ($\text{FTR} = \text{A}$). Al tratarse de eventos mutuamente excluyentes y colectivamente exhaustivos, se satisfacen los axiomas de Kolmogórov:
$$P(\Omega) = P(V_A) + P(E) + P(V_B) = 1, \quad P(V_A \cap E) = 0$$

* **Regla de la Adición (Eventos Compuestos):** Probabilidad de no perder en casa:
  $$P(V_A \cup E) = P(V_A) + P(E)$$
* **Regla del Complemento:** Probabilidad de ceder puntos en casa:
  $$P(V_A^c) = 1 - P(V_A) = P(E \cup V_B)$$

---

### 2.2 Modelado de Distribuciones según la Naturaleza de la Variable

#### A. Distribución Binomial (Eventos Independientes y Conteo de Victorias)
Modelado estocástico formal para variables donde cada ensayo es independiente entre sí con probabilidad de éxito constante $p$ a lo largo de $n$ ensayos:
$$P(X = k) = \binom{n}{k} p^k (1 - p)^{n - k} = \frac{n!}{k!(n - k)!} p^k q^{n - k}, \quad q = 1 - p$$
* **Esperanza:** $\mu = E[X] = n \cdot p$
* **Varianza:** $\sigma^2 = \operatorname{Var}(X) = n \cdot p \cdot q$
* **Desviación Estándar:** $\sigma = \sqrt{n \cdot p \cdot q}$
* **Rango Usual (Larson & Farber):** $[\mu - 2\sigma, \; \mu + 2\sigma]$. Valores fuera de este intervalo son estadísticamente inusuales ($P < 0.05$).

#### B. Distribución Hipergeométrica (Muestreo Finito sin Reemplazo)
Se aplica cuando se extrae una muestra de tamaño $n$ sin reposición a partir de una población finita $N$ que contiene $r$ éxitos:
$$P(X = x \mid N, r, n) = \frac{\binom{r}{x} \binom{N - r}{n - x}}{\binom{N}{n}}$$
* **Esperanza:** $E[X] = n \frac{r}{N}$
* **Varianza con Factor de Corrección Finita:** $\operatorname{Var}(X) = n \frac{r}{N} \left(1 - \frac{r}{N}\right) \left(\frac{N - n}{N - 1}\right)$
* **Criterio de Aproximación Binomial (Larson & Farber):** Si la fracción de muestreo cumple $n < 0.05N$ (la muestra es inferior al 5% de la población finita), los ensayos pueden considerarse prácticamente independientes y la hipergeométrica se aproxima con alta fidelidad mediante la distribución binomial con $p = r/N$.

#### C. Distribución de Poisson (Larson & Farber Cap. 4: Variables en Intervalos Continuos)
Modela el conteo de eventos discretos independientes que ocurren en un intervalo continuo fijo (los 90 minutos reglamentarios de un partido de fútbol), tales como goles anotados o tarjetas sancionadas:
$$P(x) = \frac{\mu^x e^{-\mu}}{x!}$$
* **Parámetro $\mu$:** Tasa media de eventos en los 90 minutos (ej. $\mu = 1.45$ goles locales por encuentro).
* **Propiedad Fundamental:** En Poisson, la varianza es idéntica a la media:
  $$\sigma^2 = \mu, \quad \sigma = \sqrt{\mu}$$
* **Criterio de Rango Usual (Larson & Farber Cap. 4):**
  $$\text{Intervalo Usual} = [\mu - 2\sigma, \; \mu + 2\sigma]$$
  Un partido donde un equipo anota 5 goles con $\mu = 1.45$ tiene un límite superior $\mu + 2\sqrt{1.45} = 1.45 + 2(1.204) = 3.86$, clasificando de inmediato como un resultado **estadísticamente inusual** ($P(X \ge 5) < 0.02$).

#### D. Distribución Normal Estándar y Valor Z (Larson & Farber Cap. 7)
Para tipificar variables continuas de rendimiento de un club frente a la liga:
$$z = \frac{X - \mu}{\sigma}$$
* **Regla Empírica (68% – 95% – 99.7%):**
  * $68.27\%$ de las observaciones caen en el intervalo $[\mu - \sigma, \; \mu + \sigma]$.
  * $95.45\%$ de las observaciones caen en el intervalo $[\mu - 2\sigma, \; \mu + 2\sigma]$.
  * $99.73\%$ de las observaciones caen en el intervalo $[\mu - 3\sigma, \; \mu + 3\sigma]$.
* **Los 4 Casos de Áreas bajo la Curva Normal Estándar (Larson & Farber):**
  1. *Caso 1 (Área a la izquierda):* $P(Z < z) = \Phi(z)$
  2. *Caso 2 (Área a la derecha):* $P(Z > z) = 1 - \Phi(z)$
  3. *Caso 3 (Área entre dos valores simétricos):* $P(-|z| < Z < |z|) = 2\Phi(|z|) - 1$
  4. *Caso 4 (Área en las colas exteriores):* $P(Z < -|z| \text{ o } Z > |z|) = 2(1 - \Phi(|z|))$

---

## 3. Ciencia de Datos: Análisis Descriptivo y Resolución de Preguntas (25%)

### 3.1 Tratamiento de Outliers (Valores Atípicos Extremos)
En el consolidado de 3.800 partidos se identificaron 43 encuentros con tanteadores abultados de 7 o más goles (ej. victorias 6-1, 6-2, 6-4, 8-2). En ciencia de datos tradicional, los outliers pueden eliminarse si corresponden a errores instrumentales. En analítica deportiva:
> **Justificación:** Las goleadas son **eventos físicos auténticos** derivados de factores tácticos legítimos (expulsiones, juego ultraofensivo o colapso defensivo). Eliminarlas mutilaría la varianza natural del fútbol y sesgaría gravemente la tasa de intensidad de Poisson ($\lambda$), alterando las cuotas justas de goles.

### 3.2 Respuestas a las Tres Preguntas de la Cátedra de Ciencia de Datos

#### Pregunta 1: Factor Localía en Clubes de Élite vs Resto de la Liga
- **Promedio General (3.800 partidos):** Victoria Local ($45.5\%$), Empate ($26.2\%$), Victoria Visitante ($28.3\%$). Brecha neta a favor de la localía: $+17.2\%$.
- **Clubes Top 3 (Real Madrid, Barcelona, Atlético de Madrid):** Ganan el **$74.9\%$** de sus encuentros en casa, empatan el $15.4\%$ y pierden solo el $9.6\%$. A domicilio ganan el $61.9\%$.
- **Resto de la Liga (28 clubes):** La tasa de victoria como local desciende al **$40.3\%$**, con $28.1\%$ empates y $31.6\%$ derrotas.
- *Conclusión:* El factor campo multiplica la ventaja de los clubes con mayor presupuesto y talento individual; para clubes de media tabla, la localía apenas equilibra la contienda.

#### Pregunta 2: Medias vs Medianas de Goles y Tiros a Puerta en Victorias vs No Victorias

| Variable | Victoria Local (Media / Mediana) | No Victoria Local (Media / Mediana) | Diagnóstico |
| :--- | :---: | :---: | :--- |
| **Goles Local (FTHG)** | **2.34 / 2.00** | **0.77 / 1.00** | Asimetría positiva por goleadas atípicas en cola derecha. |
| **Tiros a Puerta (HST)** | **5.62 / 5.00** | **3.86 / 4.00** | Distribución simétrica (Campana); 5 remates a puerta es el umbral de victoria. |
| **Tiros Totales (HS)** | **13.90 / 13.00** | **12.75 / 12.00** | El volumen total varía poco; la diferencia radica en la puntería. |

- *Diagnóstico Metodológico:*  
  En goles, la media ($2.34$) supera la mediana ($2.00$) debido al arrastre de marcadores extremos. En tiros a puerta, la coincidencia entre media ($5.62$) y mediana ($5.00$) certifica simetría estocástica y confirma que 5 remates a marco constituyen el umbral operativo del triunfo.

#### Pregunta 3: Evolución Temporal a 10 Temporadas & Anomalía COVID-19 (2020/21)
- El promedio anual de goles por partido se mantuvo notablemente estable entre **2.48** (2019/20) y **2.94** (2016/17), con media global de **2.62 goles/partido** ($s \approx 1.25$).
- **Anomalía Pandemia (2020/21):** Disputada a **puerta cerrada sin público**, las victorias locales cayeron al **$41.6\%$** (el mínimo histórico del decenio frente al $47.9\%$ en 2022/23 y $48.9\%$ en 2025/26). Este suceso sirvió como experimento natural que aisló la influencia psicológica y arbitral de la hinchada.

### 3.3 Tres Hallazgos Numéricos Formales (Asociación vs Causalidad)
1. **Asociación en Tiros a Puerta ($r = 0.58, \text{OR} = 3.86$):** Registrar más de 5 tiros a puerta eleva la probabilidad a posteriori de victoria de 45.5% a 65.2%. No obstante, esto prueba **asociación estadística**, no causalidad aislada: rematar desde 40 metros eleva el conteo pero reduce el $xG$.
2. **Ventaja al Descanso como Indicador de Estado ($P(H \mid HTR=H) = 78.5\%$):** Finalizar el primer tiempo ganando predice el 78.5% de los triunfos finales. Es una **variable intermedia de estado acumulado**, no una causa independiente que actúe en el segundo tiempo.
3. **Aislamiento Cuasi-Experimental del Efecto Público:** La caída a 41.6% de victorias locales a puerta cerrada en 2020/21 prueba que cerca del 40% de la ventaja local tradicional proviene de la presión ambiental y psicológica de la hinchada sobre el colegiado y el adversario.

---

## 4. Desarrollo de los 6 Roles de Inferencia Bayesiana

A partir de los **3.800 registros consolidados**, se formalizan las 6 preguntas de investigación asignadas al equipo de autores:

```
+----+-----------------------+-----------------------------+-----------+--------------+-----------+-----------+
| ID | Autor                 | Pregunta Condicional        | P(Previa) | P(Posterior) | OddsRatio | p-valor   |
+----+-----------------------+-----------------------------+-----------+--------------+-----------+-----------+
| 1  | José Luis Martínez    | P(FTR=H | HST > 5)          | 45.47%    | 65.23%       | 3.12      | < 0.0001  |
| 2  | Álvaro López Quira    | P(FTHG ≥ 2 | HST > 5)       | 42.89%    | 69.14%       | 4.23      | < 0.0001  |
| 3  | Jose Aldair Torres    | P(FTR=H | HTR=H)            | 45.47%    | 78.53%       | 7.64      | < 0.0001  |
| 4  | Cristian Narváez      | P(FTR=H | HC > 6)           | 45.47%    | 40.73%       | 0.77      | < 0.0001  |
| 5  | Joan S. Mosquera      | P(FTR ≠ H | HY+HR ≥ 3)      | 54.53%    | 61.02%       | 1.54      | < 0.0001  |
| 6  | Rubén Darío Velasco   | P(FTR=A | AST > 4)          | 28.26%    | 48.71%       | 3.44      | < 0.0001  |
+----+-----------------------+-----------------------------+-----------+--------------+-----------+-----------+
```

---

## 5. Componente Predictivo de Machine Learning

### 5.1 Protocolo de Entrenamiento sin Filtración Temporal
- **Conjunto de Entrenamiento:** 3.040 partidos (80%, temporadas 2016/17 a 2023/24).
- **Conjunto de Prueba Out-of-Time:** 760 partidos (20%, temporadas 2024/25 a 2025/26).
- **Vector de Entrada:** 16 características rodantes (medias móviles de 5 partidos previos para ataque, defensa y disciplina).

### 5.2 Desempeño y Métricas Oficiales
- **Regresión Logística Multinomial (L-BFGS):**
  - Exactitud (*Accuracy*): **$47.8\%$**
  - Puntaje F1 Ponderado (*Weighted F1*): **$0.468$**
- **Random Forest Classifier (150 árboles, max depth 6):**
  - Exactitud (*Accuracy*): **$48.5\%$**
  - Puntaje F1 Ponderado (*Weighted F1*): **$0.473$**

### 5.3 Declaración Metodológica de Ciencia de Datos: Probabilidades vs Certezas
> **Aviso Fundamental:** Las predicciones emitidas por los algoritmos corresponden a **probabilidades estimadas condicionadas al historial empírico, y nunca a certezas absolutas**. En el fútbol profesional la alta aleatoriedad inherente, las decisiones arbitrales de milímetros y factores cualitativos no tabulados impiden la predictibilidad determinista.

---

## 6. Validación de Confiabilidad Muestral

El software computa directamente sobre los 3.800 encuentros:
* **Goles del Equipo Local:** Media $\bar{x}_H = 1.45$, Desviación Estándar $s_H = 1.30$.
* **Goles del Equipo Visitante:** Media $\bar{x}_A = 1.10$, Desviación Estándar $s_A = 1.15$.
* **Prueba de Hipótesis Bilateral de Localía:**
  $$\hat{p} = \frac{1.728}{3.800} = 0.4547, \quad p_0 = 0.50$$
  $$Z = \frac{0.4547 - 0.50}{\sqrt{\frac{0.25}{3.800}}} = \frac{-0.0453}{0.00811} = -5.588, \quad p\text{-valor} = 2.3 \times 10^{-8} < 0.0001$$
  $$\text{IC}_{95\%} = [0.4389, \; 0.4706]$$
  **Dictamen:** Se rechaza contundentemente la hipótesis nula $H_0$. El factor localía es un fenómeno estructural no atribuible al azar.

---

## 7. Conclusiones

1. **Articulación Académica Interdisciplinar Plena:** La integración entre la Ciencia de Datos y la Estadística Inferencial permitió abordar el ciclo completo de vida de los datos, desde el scraping legal en `robots.txt` hasta la inferencia bayesiana y el aprendizaje automático.
2. **Convergencia Teórica (Larson & Farber):** El rigor en la aplicación de las distribuciones Binomial, Hipergeométrica (con la regla $n < 0.05N$), Poisson ($\sigma^2 = \mu$) y Normal ($Z$ tipificado con los 4 casos) demuestra dominio de los fundamentos de probabilidad.
3. **Diferenciación Causal Crítica:** Se demostró que la ventaja al descanso y los tiros a puerta son predictores de alta correlación pero no causas mecánicas simples, mientras que la pandemia de 2020/21 ofreció evidencia cuasi-experimental del peso de la hinchada.
4. **Plataforma Web Funcional:** El desarrollo de la SPA en JavaScript Vanilla con KaTeX y Chart.js entrega una herramienta interactiva, visualmente impecable y de código abierto al servicio de la comunidad académica.
