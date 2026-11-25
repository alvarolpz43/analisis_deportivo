# GUION DE EXPOSICIÓN Y SUSTENTACIÓN ORAL (15 MINUTOS)
## Plataforma Analítica, Estadística Inferencial y Machine Learning — LaLiga (2016–2026)

---

### FICHA INSTITUCIONAL Y DISTRIBUCIÓN DE EXPOSITORES

- **Institución:** Institución Universitaria Colegio Mayor del Cauca — Facultad de Ingeniería (Ingeniería Informática)
- **Articulación Académica Interdisciplinar (2026):**
  - **Asignatura 1 — Electiva III: Introducción a la Ciencia de Datos** — **Docente:** Carlos E. Ruiz
  - **Asignatura 2 — Estadística Inferencial** — **Docente:** Edith Janeth Potosí Estrada
- **Criterio de Distribución del Equipo (6 Integrantes en Orden 1 al 6):**
  - **Exposición mixta (Electiva III + Estadística Inferencial):** **Luis, Álvaro, Aldair, Cristian y Rubén** presentan tanto componentes de Ciencia de Datos / Machine Learning / Colab como su análisis estadístico inferencial.
  - **Exposición exclusiva en Estadística Inferencial:** **Sebastián** interviene únicamente en el eje de Estadística Inferencial (Integrante 5, Distribución Binomial y Validación de Confiabilidad).
  - **Roles de Bayes (Integrantes 1 al 6):** Se conservan exactamente como figuran en la plataforma web (`1. Luis`, `2. Álvaro`, `3. Aldair`, `4. Cristian`, `5. Sebastián`, `6. Rubén`).
  - **Cuaderno Colab (`LaLigaScrap.ipynb`):** Dividido entre **Luis** (Parte 1: `robots.txt`, limpieza y outliers) y **Rubén** (Parte 2: EDA en código Python, gráficas y hallazgos de asociación vs. causalidad).

---

## CRONOGRAMA GENERAL DE LA EXPOSICIÓN (15 MINUTOS)

| Tiempo | Expositor | Electiva III (Ciencia de Datos) | Estadística Inferencial (y Rol 1–6) | Pestaña en Pantalla |
| :---: | :--- | :--- | :--- | :--- |
| `00:00 - 02:30` | **1. José Luis Martínez (Luis)** | Apertura, **Cuaderno Colab (Parte 1: Celdas 1–2)**, `robots.txt`, 3.800 partidos, 21 variables y 43 outliers | Espacio muestral $\Omega$, axiomas de Kolmogórov, reglas de probabilidad, intro a Bayes e **Integrante 1 (`HST > 5`)** | **Cuaderno Colab** / **Auditoría** / **Estadística (Int. 1)** |
| `02:30 - 05:00` | **2. Álvaro José López Quira (Álvaro)** | **Pregunta 1** (Localía Global vs. Top 3 vs. Resto) y **Pregunta 2** (Medias vs. Medianas y asimetría) | **Integrante 2 (`FTHG >= 2 \| HST > 5`)** e introducción al muestreo dependiente sin reemplazo | **Visión General** / **Estadística (Int. 2)** |
| `05:00 - 07:30` | **3. Jose Aldair Torres (Aldair)** | **Pregunta 3** (10 temporadas y Pandemia 2020/21), **ML 80/20** (`51.7%` / `50.3%`) y demo en **Estadio 3D** | **Integrante 3 (`HTR = H`)**: sostenimiento de ventaja al descanso (`78.5%`, $\text{OR}=8.93$) | **Visión General** / **Predicciones & ML** / **Estadística (Int. 3)** |
| `07:30 - 10:00` | **4. Cristian Samir Narváez (Cristian)** | Ética ML (cuotas justas $1/P$), **Simulador Monte Carlo (380 partidos)** y Causalidad en tiros/descanso | **Distribución Hipergeométrica Interactiva** (dependientes, $n < 0.05N$) e **Integrante 4 (`HC > 6`)** | **Predicciones & ML** / **Estadística (Sliders + Int. 4)** |
| `10:00 - 12:30` | **5. Joan Sebastian Mosquera (Sebastián)** | *(No expone Electiva III — 100% Estadística Inferencial)* | **Integrante 5 (`HY+HR >= 3`)**, **Distribución Binomial** (independientes, $xG$) y **Confiabilidad ($s$, $Z=-5.55$)** | **Estadística (Int. 5 + Binomial)** / **Visión General** |
| `12:30 - 15:00` | **6. Rubén Darío Velasco (Rubén)** | **Cuaderno Colab (Parte 2: Celdas 3–7)**, código EDA/gráficas y síntesis **Asociación vs. Causalidad** (Pandemia) | **Integrante 6 (`AST > 4`)**: eficacia visitante (`28.3%` $\rightarrow$ `48.7%`) y **Cierre interdisciplinar** | **Cuaderno Colab** / **Estadística (Int. 6)** |

---

## GUION DETALLADO POR INTEGRANTE (ORDEN 1 AL 6)

---

### TURNO 1: José Luis Martínez ("Luis") — `00:00 - 02:30`
**Ejes:** `[Electiva III]` + `[Estadística Inferencial — Integrante 1]`  
**En pantalla:** **Visión General** (cabecera institucional), luego **Cuaderno Colab (`LaLigaScrap.ipynb`, celdas 1–2)**, **Web Scraping & Auditoría** y **Estadística Inferencial (Integrante 1)**.  
**Datos clave:** `robots.txt` (`Allow: /`); 10 temporadas (`2016/17`–`2025/26`), 3.800 partidos, 31 clubes, 21 variables, 0 nulos, 0 duplicados, 43 goleadas ($\ge 7$ goles); $\Omega=\{V_A, E, V_B\}$, $P(V_A \cup E)=71.7\%$, Rol 1 (`HST > 5`): `45.5%` $\rightarrow$ `65.2%` ($\text{OR} = 3.29$).

#### Guion para exponer:
> *"Buenos días, estimado docente Carlos E. Ruiz, estimada docente Edith Janeth Potosí Estrada y compañeros. Somos estudiantes de Ingeniería Informática de la Institución Universitaria Colegio Mayor del Cauca y presentamos nuestro proyecto integrador entre **Electiva III: Ciencia de Datos** y **Estadística Inferencial** sobre la Primera División de España (LaLiga).*
>
> *A lo largo de la exposición, cada integrante conectará ambos enfoques en su turno, reservando un bloque estadístico especializado para Sebastián.*
>
> *[Electiva III — Cuaderno Colab Parte 1] Comenzando por la adquisición ética de datos —como observan en las primeras celdas de nuestro **Cuaderno Colab (`LaLigaScrap.ipynb`)** y en la pestaña de **Web Scraping & Auditoría**— verificamos programáticamente el archivo `robots.txt` de **Football-Data.co.uk** mediante `RobotFileParser` de Python, confirmando `Allow: /`. Consolidamos 10 temporadas (`2016/17` a `2025/26`), es decir, **3.800 partidos oficiales** de 31 clubes; eliminamos las cuotas de casas de apuestas y conservamos **21 variables físico-deportivas limpias**, con **0 valores nulos** y **0 duplicados**. Además, detectamos **43 partidos atípicos (outliers)** con 7 o más goles, como un 6-2 o un 8-2, y decidimos **conservarlos**: en fútbol una goleada no es un error de sensor, sino un evento real por expulsiones o superioridad táctica cuya eliminación distorsionaría la varianza.*
>
> *[Estadística Inferencial — Base Formal e Integrante 1] Pasando a Estadística Inferencial, formalizamos el espacio muestral de cada partido como $\Omega = \{V_A, E, V_B\}$, verificando los axiomas de Kolmogórov: $P(V_A) = 45.5\%$, $P(E) = 26.2\%$ y $P(V_B) = 28.3\%$ (suma $= 1$), la regla de adición ($P(V_A \cup E) = 71.7\%$ de no perder en casa) y el complemento ($P(V_A^c) = 54.5\%$).*
>
> *Sobre esa base aplicamos el **Teorema de Bayes**, $P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}$, junto con tablas $2\times 2$ y pruebas Chi-cuadrado ($\chi^2$). En mi rol como **Integrante 1 (Eficacia de Remate Local)**, la probabilidad previa de victoria local es **45.5%**, pero al observar más de 5 tiros a puerta (`HST > 5`), la posterior sube a **65.2%** ($\text{OR} = 3.29$, $p < 0.0001$). Doy paso a mi compañero **Álvaro**."*

---

### TURNO 2: Álvaro José López Quira ("Álvaro") — `02:30 - 05:00`
**Ejes:** `[Electiva III]` + `[Estadística Inferencial — Integrante 2]`  
**En pantalla:** **Visión General** (tarjetas Pregunta 1 y Pregunta 2), luego **Estadística Inferencial & Bayes (Integrante 2)**.  
**Datos clave:** P1: General `45.5%` vs Top 3 `74.9%` vs Resto `40.3%` | P2: Goles `2.34 / 2.0` vs HST `5.62 / 5.0` | Rol 2 (`FTHG >= 2 | HST > 5`): `42.9%` $\rightarrow$ `69.1%` ($\text{OR} = 5.06$).

#### Guion para exponer:
> *"Gracias, Luis. Continuando con la cátedra de **Electiva III**, en la pestaña **Visión General** respondimos las dos primeras preguntas descriptivas sobre los 3.800 encuentros:*
>
> *[Electiva III — Preguntas 1 y 2] En la **Pregunta 1 (Factor Localía)**, demostramos que el promedio general de victoria en casa es del **45.5%**, frente a un **28.3%** visitante y **26.2%** de empates. Sin embargo, al segmentar por jerarquía competitiva, los tres clubes de élite —Real Madrid, Barcelona y Atlético de Madrid— ganan el **74.9%** de sus partidos como locales, mientras que los 28 clubes restantes caen al **40.3%**. Esto demuestra que la localía amplifica la calidad de plantilla, pero en equipos de media tabla apenas equilibra el duelo.*
>
> *En la **Pregunta 2 (Medias frente a Medianas)**, evaluamos la asimetría ofensiva: en goles locales (`FTHG`) cuando el equipo gana, la media es **2.34** pero la mediana es **2.0**, lo que revela una asimetría positiva causada por las goleadas. En cambio, en los **tiros a puerta (`HST`)**, la media (**5.62**) y la mediana (**5.0**) convergen hacia una distribución simétrica, confirmando que **5 remates al arco** marcan el umbral operativo del triunfo.*
>
> *[Estadística Inferencial — Integrante 2] Conectando esto con **Estadística Inferencial**, en mi rol como **Integrante 2 (Conversión de Gol)** evaluamos el Teorema de Bayes para anotar 2 o más goles (`FTHG >= 2`) dado que el local supera los 5 tiros a puerta (`HST > 5`): la probabilidad base es del **42.9%** y la posterior asciende al **69.1%** ($\text{OR} = 5.06$, $p < 0.0001$). Y aquí surge una propiedad estadística clave: si auditamos $n$ remates dentro de los $N$ tiros a puerta del encuentro donde $r$ fueron gol, cada extracción modifica la probabilidad siguiente porque es un **muestreo dependiente sin reemplazo**, base de la Distribución Hipergeométrica. Le doy la palabra a **Aldair**."*

---

### TURNO 3: Jose Aldair Torres ("Aldair") — `05:00 - 07:30`
**Ejes:** `[Electiva III]` + `[Estadística Inferencial — Integrante 3]`  
**En pantalla:** **Visión General** (Pregunta 3), luego **Predicciones & Machine Learning** (Métricas + Simulador de Partido 3D) y **Estadística Inferencial (Integrante 3)**.  
**Datos clave:** P3: `2.62` goles/partido, Pandemia `2020/21` `41.6%` vs `47.9%`; Split temporal 80/20 (3.040 train / 760 test) sin *data leakage*; Logística `51.7%`, Random Forest `50.3%`, top feature `diff_roll_sot` (`13.7%`); Rol 3 (`HTR = H`): `45.5%` $\rightarrow$ `78.5%` ($\text{OR} = 8.93$).

#### Guion para exponer:
> *"Gracias, Álvaro. En **Electiva III**, cerramos primero la **Pregunta 3 (Evolución a 10 temporadas)**: aunque el promedio de goles se mantuvo estable en **2.62 goles por partido**, hallamos una anomalía histórica en la **temporada 2020/21 (pandemia)** disputada a puerta cerrada: la victoria local cayó a su mínimo del decenio (**41.6%**), recuperándose al **47.9%** en 2022/23 al regresar el público.*
>
> *[Electiva III — Machine Learning y Simulador 3D] Con esos datos limpios construimos el módulo de **Machine Learning** evitando toda fuga de datos (**zero data leakage**): ordenamos cronológicamente los 3.800 partidos, entrenamos con el **80% histórico** (3.040 partidos, `2016/17`–`2023/24`) y evaluamos sobre el **20% futuro o out-of-time** (760 partidos, `2024/25`–`2025/26`), usando 16 variables rodantes de los últimos 5 partidos normalizadas con `StandardScaler`. En prueba, la **Regresión Logística Multinomial** alcanza **51.7%** de exactitud y el **Random Forest** (150 árboles) un **50.3%**, destacando el diferencial de tiros a puerta recientes (`diff_roll_sot`, 13.7%) y de puntos (`diff_roll_pts`, 9.1%). Como ven en vivo al simular un clásico en la plataforma, el sistema proyecta goles esperados, marcadores exactos y anima el encuentro minuto a minuto en el **estadio 3D**.*
>
> *[Estadística Inferencial — Integrante 3] Ahora bien, en **Estadística Inferencial**, mi rol como **Integrante 3 (Sostenimiento de Ventaja al Descanso)** analiza la probabilidad de triunfo final condicionada a ir ganando al minuto 45 (`HTR = H`). La probabilidad previa de victoria local del **45.5%** se dispara al **78.5%** ($\text{OR} = 8.93$, $p < 0.0001$), siendo el predictor de estado más determinante del estudio: casi 4 de cada 5 clubes que ganan el primer tiempo terminan llevándose los 3 puntos. Paso la palabra a **Cristian**."*

---

### TURNO 4: Cristian Samir Narváez ("Cristian") — `07:30 - 10:00`
**Ejes:** `[Electiva III]` + `[Estadística Inferencial — Integrante 4]`  
**En pantalla:** **Predicciones & ML** (Simulador de Torneo 380 partidos), luego **Estadística Inferencial & Bayes** (Sliders Hipergeométricos + Integrante 4).  
**Datos clave:** Cuotas justas ($1/P$), simulación Monte Carlo 380 partidos; Hipergeométrica $P(X=x \mid N,r,n)$, factor $\frac{N-n}{N-1}$, criterio $n < 0.05N$; Rol 4 (`HC > 6`): `45.5%` $\rightarrow$ `40.7%` ($\text{OR} = 0.76$).

#### Guion para exponer:
> *"Gracias, Aldair. Complementando el bloque de **Electiva III**, destacamos el principio ético de nuestro sistema predictivo: en el fútbol no existen certezas deterministas; las salidas del ML se expresan como **probabilidades estimadas** y **cuotas justas implícitas** ($1/P$), con las que nuestro **Simulador de Torneo Monte Carlo** simula las **380 jornadas completas de LaLiga** para estimar puntos esperados y probabilidades de campeón. Asimismo, debemos separar **asociación de causalidad**: ni rematar desde 40 metros causa un gol —media la calidad de ocasión ($xG$)— ni ir ganando al descanso (`HTR = H`) es una causa independiente, sino un estado intermedio acumulado.*
>
> *[Estadística Inferencial — Distribución Hipergeométrica e Integrante 4] Entrando en **Estadística Inferencial**, diferenciamos con rigor qué distribución aplica según la dependencia de las variables. Cuando trabajamos con **variables dependientes** en una población finita sin reemplazo —como extraer $n$ disparos dentro de los $N$ tiros totales donde $r$ fueron a puerta— cada extracción altera la probabilidad de la siguiente, por lo que aplicamos la **Distribución Hipergeométrica**:*
> $$P(X = x \mid N, r, n) = \frac{\binom{r}{x}\binom{N-r}{n-x}}{\binom{N}{n}}$$
> *En los controles interactivos de la plataforma observamos $N, r, n, x$, la varianza con su **factor de corrección finita** $\frac{N-n}{N-1}$ y el criterio de convergencia hacia la Binomial cuando $n < 0.05N$.*
>
> *Finalmente, en mi rol como **Integrante 4 (Asedio por Córners)** descubrimos una paradoja táctica muy interesante: acumular más de 6 tiros de esquina (`HC > 6`) **reduce** la probabilidad de victoria local del **45.5%** al **40.7%** ($\text{OR} = 0.76$, $p < 0.0001$), porque los equipos generan ráfagas de córners justamente cuando van perdiendo o empatando y atacan desesperadamente ante defensas cerradas. Le cedo la palabra a **Sebastián**, quien profundizará exclusivamente en la parte estadística."*

---

### TURNO 5: Joan Sebastian Mosquera ("Sebastián") — `10:00 - 12:30`
**Eje:** `[Estadística Inferencial — Integrante 5 + Binomial + Confiabilidad]` *(Exclusivamente Estadística)*  
**En pantalla:** **Estadística Inferencial & Bayes** (Integrante 5 + Calculadora Binomial Interactiva) y **Visión General** (Validación de Confiabilidad).  
**Datos clave:** Rol 5 (`HY+HR >= 3`): `54.5%` $\rightarrow$ `61.0%` ($\text{OR} = 1.60$); Binomial $P(X=k)=\binom{n}{k}p^k(1-p)^{n-k}$ para **variables independientes**; $s_{\text{local}}=1.26$, $s_{\text{visitante}}=1.10$; $Z = -5.55$, $p = 2.89 \times 10^{-8} < 0.0001$, $\text{IC}_{95\%} = [43.9\%, 47.1\%]$.

#### Guion para exponer:
> *"Muchas gracias, Cristian. En mi intervención me centro exclusivamente en el análisis de **Estadística Inferencial** del proyecto.*
>
> *[Integrante 5 — Impacto Disciplinario] En primer lugar, como **Integrante 5 (Impacto Disciplinario)** evaluamos el costo de la indisciplina táctica mediante tablas de contingencia $2\times 2$ y prueba Chi-cuadrado ($\chi^2$). La probabilidad basal de que el equipo local ceda puntos —es decir, empate o pierda (`FTR != 'H'`)— es del **54.5%**; pero cuando acumula 3 o más tarjetas (`HY + HR >= 3`), la probabilidad posterior sube al **61.0%** ($\text{OR} = 1.60$, $p < 0.0001$), validando el riesgo defensivo de las faltas reiteradas.*
>
> *[Distribución Binomial — Variables Independientes] En segundo lugar, contrastando con la Hipergeométrica que explicó Cristian para variables dependientes, cuando modelamos **variables o ensayos independientes** —donde la probabilidad $p$ permanece constante de un intento a otro, como rachas de partidos o ventanas ofensivas independientes de gol— aplicamos la **Distribución Binomial**:*
> $$P(X = k) = \binom{n}{k} p^k (1 - p)^{n - k}, \qquad \mu = np, \quad \sigma = \sqrt{np(1 - p)}$$
> *Con la calculadora interactiva de la plataforma verificamos la probabilidad exacta, acumulada y de supervivencia, además de servir como base matemática del modelo Binomial de goles esperados ($xG$) en el simulador.*
>
> *[Validación de Confiabilidad Estadística] Por último, validamos la **confiabilidad estadística** de los 3.800 partidos: las desviaciones estándar muestrales de goles son bajas y estables ($s_{\text{local}} = 1.26$ y $s_{\text{visitante}} = 1.10$). Y al ejecutar la **prueba de hipótesis bilateral de localía** ($H_0: p = 0.50$ frente a $H_1: p \neq 0.50$), obtenemos $Z = -5.55$ con $p = 2.89 \times 10^{-8} < 0.0001$ e intervalo de confianza del 95% de $[43.9\%, 47.1\%]$. Se rechaza $H_0$, comprobando estadísticamente que la localía es estructural y no producto del azar. Ahora **Rubén** cierra nuestra exposición."*

---

### TURNO 6: Rubén Darío Velasco ("Rubén") — `12:30 - 15:00`
**Ejes:** `[Electiva III — Cuaderno Colab Parte 2]` + `[Estadística Inferencial — Integrante 6]` + `[Cierre]`  
**En pantalla:** **Cuaderno Colab (`LaLigaScrap.ipynb`, celdas 3–7)** y luego **Estadística Inferencial & Bayes (Integrante 6)**.  
**Datos clave:** Código Python EDA y gráficas en Colab, 3 hallazgos Asociación vs. Causalidad (Pandemia 2020/21 cuasi-experimental); Rol 6 (`AST > 4`): `28.3%` $\rightarrow$ `48.7%` ($\text{OR} = 3.95$, $p < 0.0001$).

#### Guion para exponer:
> *"Gracias, Sebastián. Para cerrar esta sustentación, conecto la segunda parte del cuaderno de **Electiva III** con el sexto análisis de **Estadística Inferencial**.*
>
> *[Electiva III — Cuaderno Colab Parte 2] Volviendo a nuestro **Cuaderno Colab (`LaLigaScrap.ipynb`)** en las secciones 3 a 7, aquí evidenciamos cómo el código en Python y `Matplotlib` genera automáticamente las tablas y gráficas comparativas de las tres preguntas descriptivas, contrastando el **74.9%** de localía de los clubes élite frente al **40.3%** del resto y resaltando en rojo la caída de la temporada **2020/21**. Precisamente ahí consolidamos los **tres hallazgos formales de Asociación vs. Causalidad**: mientras los remates al arco y la ventaja al descanso muestran asociación mediada o de estado, la pandemia a puerta cerrada funcionó como un **experimento cuasi-natural** que aisló el peso psicológico y ambiental del público sobre el factor campo.*
>
> *[Estadística Inferencial — Integrante 6] En cuanto a **Estadística Inferencial**, mi rol como **Integrante 6 (Eficacia Visitante)** cierra los 6 modelos bayesianos analizando el desafío más exigente de LaLiga: ganar fuera de casa. La probabilidad previa de victoria visitante es apenas del **28.3%**; sin embargo, cuando el visitante supera los 4 tiros a puerta (`AST > 4`), su probabilidad posterior salta al **48.7%** ($\text{OR} = 3.95$, $p < 0.0001$), demostrando que la precisión ofensiva logra contrarrestar la ventaja estadística del local.*
>
> *[Cierre Integrador] De este modo integramos de principio a fin la captura ética, el EDA en Colab y el Machine Learning de **Electiva III** con el rigor probabilístico e inferencial de **Estadística Inferencial**. Agradecemos a nuestros docentes Carlos E. Ruiz y Edith Janeth Potosí Estrada por su guía. Quedamos atentos a las preguntas del jurado. Muchas gracias."*

---

## BANCO DE RESPUESTAS RÁPIDAS ANTE PREGUNTAS DEL JURADO

1. **¿Por qué usan Hipergeométrica y Binomial y no otras distribuciones?**  
   Porque las variables internas de un partido (tiros a puerta dentro de tiros totales, tarjetas dentro de faltas) son **dependientes** sobre una población finita sin reemplazo (**Hipergeométrica**), mientras que eventos con probabilidad constante entre intentos o partidos independientes siguen la **Binomial**.
2. **¿Cómo evitaron el *data leakage* en Machine Learning?**  
   Ordenando cronológicamente los 3.800 partidos, separando 80% pasado (`2016–2024`) y 20% futuro (`2024–2026`), eliminando cuotas de apuestas y calculando medias móviles exclusivamente hacia atrás (`shift(1).rolling(5)`).
3. **¿Por qué la exactitud del ML ronda el 50%–52%?**  
   En fútbol hay 3 clases (`H`, `D`, `A`) y alta incertidumbre estocástica (rebotes, arbitraje, lesiones). Superar el 51% *out-of-time* sin fuga de datos frente al azar (33.3%) o la clase mayoritaria (45.5%) demuestra poder predictivo real y bien calibrado.
