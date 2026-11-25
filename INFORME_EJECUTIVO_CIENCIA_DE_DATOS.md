# INFORME EJECUTIVO DE CIENCIA DE DATOS
## Análisis Analítico y Predictivo de LaLiga Primera División (3.800 Partidos | 2016–2026)

---

### FICHA TÉCNICA E INSTITUCIONAL

- **Institución Universitaria:** Institución Universitaria Colegio Mayor del Cauca  
- **Facultad:** Facultad de Ingeniería — Programa de Ingeniería Informática  
- **Asignatura:** Electiva III: Introducción a la Ciencia de Datos (2026)  
- **Docente:** Carlos E. Ruiz  
- **Articulación Interdisciplinar:** Asignatura de Estadística Inferencial — Docente: Edith Janeth Potosí Estrada  
- **Autores (Equipo de 6 Integrantes):**  
  1. José Luis Martínez (Eficacia de Remate y Tiros a Puerta Local)  
  2. Álvaro José López Quira (Conversión Goleadora FTHG $\ge 2$)  
  3. Jose Aldair Torres (Ventaja Parcial al Descanso HTR)  
  4. Cristian Samir Narváez (Asedio Ofensivo por Saques de Esquina)  
  5. Joan Sebastian Mosquera (Régimen Disciplinario y Tarjetas Sancionadas)  
  6. Rubén Darío Velasco (Eficacia Ofensiva Visitante e Integración Predictiva ML)  
- **Fecha de Elaboración:** Noviembre de 2026  
- **Dataset Maestro:** `espana_10_temporadas_consolidado.csv` (10 temporadas consecutivas, 3.800 enfrentamientos, 21 variables limpias)

---

## 1. RESUMEN EJECUTIVO Y CONTEXTO DEL PROBLEMA

El presente proyecto implementa un ciclo de vida completo de Ciencia de Datos aplicado a la Primera División del fútbol profesional español (*LaLiga*). A través de técnicas rigurosas de recolección ética (web scraping respetando `robots.txt`), depuración de datos, análisis exploratorio multidimensional, modelado probabilístico y algoritmos de Machine Learning, se investiga la dinámica del rendimiento deportivo, el factor localía y la predictibilidad del resultado final.

A diferencia de los enfoques comerciales que se limitan a cuotas de apuestas, este trabajo fundamenta sus conclusiones en regularidades empíricas auditadas sobre **3.800 partidos oficiales**, garantizando la reproducibilidad metodológica y estableciendo una estricta distinción epistemológica entre **asociación estadística** y **relación causal**.

---

## 2. EXTRACCIÓN ÉTICA Y TRATAMIENTO DE DATOS

### 2.1 Verificación Ética de Acceso (Web Scraping)
La recolección se efectuó mediante inspección previa automatizada del archivo `robots.txt` de *Football-Data.co.uk* (`User-agent: *`, `Allow: /`), garantizando un rastreo consentido y legalmente autorizado. Se compilaron 10 archivos estacionales (`SP1.csv`, campañas 2016/17 a 2025/26), consolidando exactamente 380 partidos por temporada.

### 2.2 Auditoría de Calidad y Limpieza
- **Filas y Columnas:** 3.800 observaciones $\times$ 21 variables estructuradas.
- **Valores Ausentes:** 0 valores nulos (`df.isnull().sum() == 0`).
- **Registros Duplicados:** 0 filas duplicadas.
- **Fuga de Datos (*Data Leakage*):** Se ordenaron cronológicamente las observaciones por fecha (`Date`), y las métricas rodantes (medias móviles de 5 partidos para el modelo ML) se computaron de forma causal estricta hacia atrás en el tiempo, impidiendo que el futuro contamine el pasado.

### 2.3 Tratamiento y Justificación Metodológica de Valores Atípicos (*Outliers*)
Se identificaron 43 partidos con marcadores atípicos de 7 o más goles (ej. victorias 6-1, 6-2, 6-4, 8-2). En ciencia de datos aplicada a sistemas físicos o sociológicos, un valor extremo suele indicar fallo del sensor o ruido espurio. Sin embargo, en el fútbol:
> **Justificación:** Las goleadas extremas son **eventos atléticos auténticos y legalmente registrados**, derivados de circunstancias reales de juego (superioridad táctica masiva, expulsiones tempranas o desorganización defensiva). Truncar o eliminar estas observaciones distorsionaría la varianza real del fenómeno, sesgaría a la baja el promedio esperado de goles ($\lambda$) y falsearía las probabilidades binomiales de mercados de goles (*Over 2.5*). Por tanto, se preservan íntegramente.

---

## 3. RESPUESTAS A LAS TRES PREGUNTAS CLAVE DE LA CÁTEDRA (25%)

### Pregunta 1: Factor Localía en Clubes de Élite vs Resto de la Liga
*¿Existe ventaja de jugar como local en LaLiga? ¿Varía según el nivel de los equipos?*

- **Promedio General de la Liga (3.800 partidos):**
  - Victoria Local ($H$): **45.5%** (1.728 triunfos)
  - Empate ($D$): **26.2%** (997 empates)
  - Victoria Visitante ($A$): **28.3%** (1.075 triunfos)
  - *Conclusión:* Existe una clara ventaja de localía basal en la liga (+17.2 puntos porcentuales sobre la victoria visitante).
- **Disparidad por Estrato Competitivo (Clubes Top 3 vs Resto):**
  - **Top 3 (Real Madrid, Barcelona, Atlético de Madrid):** Ganan el **74.9%** de sus partidos como local, empatan el 15.4% y pierden solo el 9.6%. Fuera de casa, su tasa de victoria se sitúa en 61.9%.
  - **Resto de la Liga (28 clubes):** La tasa de victoria como local desciende al **40.3%**, los empates suben a 28.1% y las derrotas en casa al 31.6%.
  - *Interpretación:* La ventaja de jugar en casa no es homogénea. En los clubes de élite, la localía funciona como un multiplicador de su superioridad estructural de plantilla; en los clubes de media tabla hacia abajo, la localía apenas equilibra la contienda.

---

### Pregunta 2: Medias vs Medianas de Goles y Tiros a Puerta en Victorias vs No Victorias
*¿Cuál es el promedio y la mediana de goles y tiros a puerta en partidos donde el equipo local gana frente a cuando no lo hace?*

| Variable Ofensiva | Victoria Local (Media / Mediana) | No Victoria Local (Media / Mediana) | Diagnóstico de Distribución |
| :--- | :---: | :---: | :--- |
| **Goles a Favor (FTHG)** | **2.34 / 2.00** | **0.77 / 1.00** | Asimetría positiva marcada en triunfos locales por arrastre de goleadas (cola derecha). |
| **Tiros a Puerta (HST)** | **5.62 / 5.00** | **3.86 / 4.00** | Distribución cuasi-simétrica; 5 remates a puerta constituye el umbral operativo del éxito. |
| **Tiros Totales (HS)** | **13.90 / 13.00** | **12.75 / 12.00** | Variación moderada en volumen de intentos, pero abismal en puntería efectiva. |

- *Diagnóstico Metodológico:*  
  1. En los **goles marcados**, la media (2.34) es sustancialmente superior a la mediana (2.0) en las victorias locales. Esta divergencia ($Media > Mediana$) delata una **asimetría positiva** provocada por partidos con tanteadores muy altos.
  2. En los **tiros a puerta (HST)**, la media (5.62) y la mediana (5.00) convergen notablemente. Esto denota una distribución con forma de campana simétrica, validando que el equipo local requiere típicamente alcanzar o superar los 5 remates a marco para transformar el dominio territorial en triunfo numérico.

---

### Pregunta 3: Evolución Temporal a 10 Temporadas & Anomalía COVID-19 (2020/21)
*¿Cómo ha evolucionado el rendimiento a lo largo de las últimas 10 temporadas?*

- **Estabilidad Global de Goles:**  
  La media de goles por encuentro ha permanecido extraordinariamente estable en el decenio analizado, oscilando entre **2.48 goles/partido (2019/20)** y **2.94 goles/partido (2016/17)**, con un promedio consolidado de **2.62 goles/partido** y desviación estándar muestral $s \approx 1.25$.
- **Anomalía Estructural de la Pandemia (Temporada 2020/21):**  
  Durante la temporada 2020/21, disputada bajo estrictas restricciones sanitarias a **puerta cerrada (sin público en las tribunas)**, el porcentaje de victorias locales se desplomó al **41.6%** (mínimo histórico del decenio, frente al 47.9% en 2022/23 y 48.9% en 2025/26).  
  *Hallazgo Clave:* Este evento funcionó como un experimento natural que permitió aislar el componente psicológico y ambiental (la presión de la hinchada sobre árbitros y rivales) del factor geográfico (conocimiento del césped o fatiga por viaje).

---

## 4. TRES HALLAZGOS NUMÉRICOS FORMALES (ASOCIACIÓN VS CAUSALIDAD)

1. **Hallazgo 1 — Asociación Estadística Robusta en Tiros a Puerta ($r = 0.58$, $\text{OR} = 3.86$):**  
   Registrar más de 5 tiros a puerta eleva la probabilidad a posteriori de victoria local del 45.5% al 65.2% (Likelihood = 42.7%, Factor de Bayes = 1.43).  
   *Diferenciación Metodológica:* Se trata de una **fuerte correlación y asociación probabilística**, pero **no implica causalidad determinista simple**. Disparar sin calidad desde larga distancia no garantiza el gol. El factor causal reside en la calidad de la ocasión (goles esperados o $xG$) y la pericia del guardameta, no en el mero conteo de remates.

2. **Hallazgo 2 — La Ventaja al Descanso como Indicador de Estado, no Agente Causal Primario ($P(H \mid HTR=H) = 78.5\%$):**  
   Finalizar el primer tiempo con ventaja en el marcador incrementa la probabilidad de victoria local a casi cuatro de cada cinco partidos (78.5%).  
   *Diferenciación Metodológica:* El marcador al minuto 45 no *causa* por arte de magia el triunfo del minuto 90; es un **indicador de estado intermedio acumulado** que captura la superioridad táctica, física y anímica ya exhibida en la primera mitad.

3. **Hallazgo 3 — Evidencia Cuasi-Experimental del Factor Campo en la Temporada Pandemia:**  
   La reducción de 6.3 puntos porcentuales en triunfos locales durante la campaña a puerta cerrada (41.6% vs 47.9% histórico pos-pandemia) demuestra de forma cuasi-experimental que cerca del **40% de la ventaja de localía tradicional proviene de factores psicosociales** (presión del público sobre el colectivo arbitral y motivación de los jugadores), mientras que el 60% restante obedece a factores biofísicos y de descanso.

---

## 5. COMPONENTE PREDICTIVO Y MACHINE LEARNING

### 5.1 Protocolo de Entrenamiento sin Filtración Temporal
- **División de Datos:** Partición cronológica estricta:
  - Conjunto de Entrenamiento: **3.040 partidos (80%)** — Temporadas 2016/17 a 2023/24.
  - Conjunto de Prueba (*Out-of-Time Test Set*): **760 partidos (20%)** — Temporadas 2024/25 y 2025/26.
- **Espacio de Características (16 variables rodantes):**  
  Medias móviles de los últimos 5 partidos por club para goles a favor/en contra, tiros al arco, corners forzados y tarjetas, normalizadas con `StandardScaler`.

### 5.2 Desempeño Técnico de los Algoritmos

| Algoritmo | Exactitud (*Accuracy*) | F1-Score Ponderado (*Weighted F1*) | Observaciones de Generalización |
| :--- | :---: | :---: | :--- |
| **Regresión Logística Multinomial (L-BFGS)** | **47.8%** | **0.468** | Modelo probabilístico calibrado multiclase vía Softmax. Coherente con los axiomas de Kolmogorov ($\sum P = 1$). |
| **Random Forest Classifier (150 árboles)** | **48.5%** | **0.473** | Modela interacciones no lineales entre volumen de remates y resistencia defensiva visitante. |

### 5.3 Aviso Metodológico Fundamental: Probabilidades vs Certezas
> **Declaración de Ciencia de Datos:** En el deporte profesional, las predicciones de Machine Learning **deben interpretarse como probabilidades estimadas y nunca como certezas absolutas**. Un evento con 65% de probabilidad proyectada fallará el 35% de las veces. La intrínseca estocasticidad del fútbol (rebotes, decisiones arbitrales de milímetros, lesiones imprevistas y azar puro) impiden la infalibilidad predictiva, por lo que los algoritmos se emplean para optimizar decisiones bajo incertidumbre y calcular cuotas justas de mercado ($\text{Fair Odds} = 1 / P$).

---

## 6. CONCLUSIONES GENERALES

1. **Rigor en la Ingeniería de Datos:** El proceso de captura respetó la política de `robots.txt`, construyendo un dataset estructurado de 3.800 partidos sin nulos ni data leakage.
2. **Consistencia Inferencial y Descriptiva:** La convergencia entre los modelos probabilísticos discretos (Distribución Hipergeométrica para variables dependientes sin reemplazo, Distribución Binomial para eventos independientes y contraste de hipótesis $Z = -5.59$) y los algoritmos de Machine Learning proporciona un marco analítico sólido y coherente.
3. **Aporte Disciplinar:** Se superó la barrera del análisis superficial demostrando que los tiros a puerta se distribuyen simétricamente y actúan como palanca decisiva de victoria, al tiempo que se aisló empíricamente la influencia de la hinchada durante el cierre de estadios de 2020/21.
