# GUION DE EXPOSICIÓN Y SUSTENTACIÓN ORAL (15 MINUTOS)
## Plataforma Analítica, Estadística Inferencial y Machine Learning — LaLiga (2016–2026)

---

### FICHA INSTITUCIONAL Y DISTRIBUCIÓN DE EXPOSITORES

- **Institución:** Institución Universitaria Colegio Mayor del Cauca — Facultad de Ingeniería (Ingeniería Informática)
- **Articulación Académica Interdisciplinar (2026):**
  - **Bloque 1 — Ciencia de Datos, Web Scraping & Machine Learning:** *Electiva III: Introducción a la Ciencia de Datos* — **Docente:** Carlos E. Ruiz
  - **Bloque 2 — Estadística Inferencial:** *Estadística Inferencial* — **Docente:** Edith Janeth Potosí Estrada
- **Equipo Expositor (6 Integrantes en 2 Bloques):**
  - **Bloque 1 (Ciencia de Datos & Web Scraping):**
    1. **José Luis Martínez (Luis)** — Apertura, Web Scraping Ético (`robots.txt`), Limpieza, Outliers y Cuaderno Colab
    2. **Rubén Darío Velasco (Rubén)** — Análisis Descriptivo (3 Preguntas de la Cátedra) y Asociación vs. Causalidad
    3. **Jose Aldair Torres (Aldair)** — Machine Learning (80/20 sin fuga temporal), Predictor Binomial xG, Estadio 3D y Simulador de Torneo
  - **Bloque 2 (Estadística Inferencial):**
    4. **Álvaro José López Quira (Álvaro)** — Espacio Muestral, Axiomas, Teorema de Bayes y Eficiencia Ofensiva (Roles 1 y 2)
    5. **Cristian Samir Narváez (Cristian)** — Distribución Hipergeométrica (Variables Dependientes sin Reemplazo) y Roles Tácticos (Roles 3 y 4)
    6. **Joan Sebastian Mosquera (Sebastián)** — Distribución Binomial (Variables Independientes), Disciplina/Visitante (Roles 5 y 6), Confiabilidad ($s$, $Z$) y Cierre

---

## CRONOGRAMA GENERAL DE LA EXPOSICIÓN (15 MINUTOS)

| Tiempo | Bloque | Expositor | Tema y Pestaña en Pantalla |
| :---: | :--- | :--- | :--- |
| `00:00 - 02:30` | **Bloque 1: Ciencia de Datos** | **José Luis Martínez (Luis)** | Portada, Web Scraping (`robots.txt`), Outliers y demo en **Cuaderno Colab** + **Web Scraping & Auditoría** |
| `02:30 - 05:00` | **Bloque 1: Ciencia de Datos** | **Rubén Darío Velasco (Rubén)** | 3 Preguntas de Electiva III (Localía, Medias/Medianas, Pandemia 2020/21) y Asociación vs. Causalidad en **Visión General** |
| `05:00 - 07:30` | **Bloque 1: Ciencia de Datos** | **Jose Aldair Torres (Aldair)** | Modelos ML (Logística `51.7%` y Random Forest `50.3%`), demo en vivo en **Predicciones & ML** (Partido 3D + Torneo 380 partidos) |
| `07:30 - 10:00` | **Bloque 2: Estadística** | **Álvaro José López Quira (Álvaro)** | Espacio Muestral $\Omega$, Reglas de Probabilidad, Teorema de Bayes, $\chi^2$ y Roles 1–2 en **Estadística Inferencial** |
| `10:00 - 12:30` | **Bloque 2: Estadística** | **Cristian Samir Narváez (Cristian)** | **Distribución Hipergeométrica** (Variables Dependientes, $n < 0.05N$), demo de sliders y Roles 3–4 en **Estadística Inferencial** |
| `12:30 - 15:00` | **Bloque 2: Estadística** | **Joan Sebastian Mosquera (Sebastián)** | **Distribución Binomial** (Variables Independientes), Roles 5–6, Validación de Confiabilidad ($s$, $Z = -5.55$) y Cierre |

---

## BLOQUE 1: CIENCIA DE DATOS, WEB SCRAPING & MACHINE LEARNING
*(Asignatura: Electiva III — Docente: Carlos E. Ruiz)*

---

### TURNO 1: José Luis Martínez ("Luis") — `00:00 - 02:30`
**En pantalla:** Pestaña **Visión General** (cabecera institucional), luego **Cuaderno Colab (`LaLigaScrap.ipynb`)** y **Web Scraping & Auditoría**.  
**Datos clave:** 10 temporadas (`2016/17`–`2025/26`), 3.800 partidos, 31 clubes, 21 variables limpias (sin cuotas), 0 nulos, 0 duplicados, 43 goleadas ($\ge 7$ goles) conservadas.

#### Guion para exponer:
> *"Buenos días, estimado docente Carlos E. Ruiz, estimada docente Edith Janeth Potosí Estrada y compañeros. Nosotros conformamos el equipo de Ingeniería Informática de la Institución Universitaria Colegio Mayor del Cauca, y hoy presentamos nuestro proyecto integrador que articula **Electiva III: Ciencia de Datos** con **Estadística Inferencial** sobre la Primera División de España (LaLiga).*
>
> *Nuestro grupo se divide en dos bloques: en esta primera parte, Rubén, Aldair y yo presentaremos el ciclo completo de Ciencia de Datos, Web Scraping y Machine Learning; y en la segunda parte, Álvaro, Cristian y Sebastián sustentarán el modelado estadístico inferencial.*
>
> *Comenzando por la adquisición ética de datos —como pueden ver aquí en el **Cuaderno Colab integrado** dentro de nuestra propia plataforma web y en la pestaña de **Web Scraping & Auditoría**— el primer paso fue verificar programáticamente el archivo `robots.txt` del repositorio histórico **Football-Data.co.uk** utilizando `RobotFileParser` de Python. Al confirmar `Allow: /`, garantizamos una recolección legal y consentida.*
>
> *Consolidamos 10 temporadas consecutivas (`2016/17` a `2025/26`), es decir, **3.800 partidos oficiales** de 31 clubes. Aplicamos reducción de dimensionalidad eliminando todas las cuotas comerciales de casas de apuestas y conservando **21 variables físico-deportivas limpias**, con **0 valores nulos** y **0 registros duplicados**.*
>
> *Un punto metodológico clave fue el tratamiento de **valores atípicos (outliers)**. Detectamos 43 partidos con marcadores extremos de 7 o más goles, como un 6-2 o un 8-2. Decidimos **no eliminarlos**, porque en analítica deportiva una goleada no es un error de sensor: es un evento atlético real derivado de expulsiones o superioridad táctica. Truncarlos distorsionaría la varianza real de los goles y alteraría las probabilidades de nuestros modelos. Ahora le doy paso a mi compañero **Rubén** para explicar los hallazgos descriptivos."*

---

### TURNO 2: Rubén Darío Velasco ("Rubén") — `02:30 - 05:00`
**En pantalla:** Pestaña **Visión General** (tarjetas de las 3 Preguntas de la Cátedra y sección Asociación vs. Causalidad).  
**Datos clave:** P1: General `45.5%` vs Top 3 `74.9%` vs Resto `40.3%` | P2: Goles `2.34 / 2.0` vs HST `5.62 / 5.0` | P3: Pandemia `2020/21` `41.6%` local vs `47.9%` pospandemia.

#### Guion para exponer:
> *"Gracias, Luis. Con los 3.800 partidos depurados, respondimos formalmente las **tres preguntas estructurales** de la cátedra de Ciencia de Datos:*
>
> *En la **Pregunta 1 (Factor Localía)**, demostramos que el promedio general de victoria en casa es del **45.5%**, frente a un **28.3%** visitante y **26.2%** de empates. Sin embargo, al segmentar por nivel competitivo, los tres clubes de élite —Real Madrid, Barcelona y Atlético de Madrid— ganan el **74.9%** de sus partidos como locales, mientras que los 28 clubes restantes caen al **40.3%**. Esto demuestra que la localía amplifica la jerarquía de plantilla, pero en equipos de media tabla apenas equilibra el partido.*
>
> *En la **Pregunta 2 (Medias frente a Medianas)**, evaluamos la asimetría ofensiva. En goles locales (`FTHG`), cuando el equipo gana la media es **2.34** pero la mediana es **2.0**, lo que delata una asimetría positiva causada por las goleadas. En cambio, en los **tiros a puerta (`HST`)**, la media (**5.62**) y la mediana (**5.0**) casi coinciden, revelando una distribución simétrica y confirmando que **5 remates al arco** marcan el umbral operativo del triunfo.*
>
> *En la **Pregunta 3 (Evolución a 10 temporadas)**, aunque el promedio de goles se mantuvo estable en **2.62 goles por partido**, encontramos una anomalía histórica en la **temporada 2020/21 (pandemia)**, disputada a puerta cerrada sin público: la victoria local se desplomó a su mínimo del decenio (**41.6%**), recuperándose al **47.9%** en 2022/23 al volver la afición.*
>
> *Finalmente, distinguimos **asociación de causalidad** en tres hallazgos: primero, tener más de 5 tiros a puerta triplica los momios de victoria ($\text{OR} = 3.29$), pero disparar desde 40 metros no causa el gol; media la calidad de la ocasión. Segundo, ir ganando al descanso (`HTR = H`) predice el **78.5%** de triunfos, pero actúa como indicador de estado acumulado, no como causa independiente. Tercero, la pandemia funcionó como un experimento cuasi-natural que aisló el peso psicológico y ambiental del público sobre el factor campo. Le doy la palabra a **Aldair**."*

---

### TURNO 3: Jose Aldair Torres ("Aldair") — `05:00 - 07:30`
**En pantalla:** Pestaña **Predicciones & Machine Learning** (Métricas ML, Simulador de Partido 2D/3D y Simulador de Torneo 380 partidos).  
**Datos clave:** Partición cronológica 80/20 (3.040 train / 760 test) sin *data leakage*; Regresión Logística `51.7%`, Random Forest `50.3%`; top feature `diff_roll_sot` (`13.7%`); simulación 380 partidos Monte Carlo Binomial.

#### Guion para exponer:
> *"Gracias, Rubén. Para cerrar el bloque de Ciencia de Datos, implementamos el componente predictivo de **Machine Learning**. Para evitar cualquier fuga de datos (**zero data leakage**), ordenamos los partidos estrictamente por fecha: entrenamos con el **80% histórico** (3.040 partidos, temporadas `2016/17` a `2023/24`) y evaluamos sobre el **20% futuro o out-of-time** (760 partidos, `2024/25` y `2025/26`), usando 16 variables rodantes de los últimos 5 partidos normalizadas con `StandardScaler`.*
>
> *En el conjunto de prueba, la **Regresión Logística Multinomial** alcanza una exactitud del **51.7%** y el **Random Forest** (150 árboles) un **50.3%**, destacando el diferencial de tiros a puerta recientes (`diff_roll_sot`, 13.7%) y el diferencial de puntos (`diff_roll_pts`, 9.1%) como las variables más influyentes. Aquí recalcamos un principio ético clave: en el fútbol no existen certezas deterministas; nuestras salidas son **probabilidades estimadas** que convertimos en **cuotas justas implícitas** ($1/P$).*
>
> *Como ven en vivo en el simulador (ejecutando por ejemplo **Real Madrid vs. Barcelona**), el sistema combina el ensamble ML con el **modelo Binomial xG** para proyectar goles esperados, marcadores exactos (`0-0` a `4-4`), animar el encuentro minuto a minuto en el **estadio 3D**, y además permite simular las **380 jornadas completas de LaLiga** mediante Monte Carlo para proyectar puntos esperados y probabilidades de campeón. Con esto cerramos Ciencia de Datos y doy paso al **Bloque de Estadística Inferencial** con mi compañero **Álvaro**."*

---

## BLOQUE 2: ESTADÍSTICA INFERENCIAL
*(Asignatura: Estadística Inferencial — Docente: Edith Janeth Potosí Estrada)*

---

### TURNO 4: Álvaro José López Quira ("Álvaro") — `07:30 - 10:00`
**En pantalla:** Pestaña **Estadística Inferencial & Bayes (6 Roles)** (Integrantes 1 y 2) y **Ecuaciones & Código** (Tarjeta 1: Teorema de Bayes).  
**Datos clave:** $\Omega = \{V_A, E, V_B\}$; Bayes $P(A\mid B)$; Rol 1 (`HST > 5`): `45.5%` $\rightarrow$ `65.2%` ($\text{OR} = 3.29$); Rol 2 (`FTHG >= 2 | HST > 5`): `42.9%` $\rightarrow$ `69.1%` ($\text{OR} = 5.06$).

#### Guion para exponer:
> *"Muchas gracias, Aldair. Entramos ahora al segundo bloque del proyecto: la **Estadística Inferencial**.*
>
> *Para modelar formalmente cada partido, partimos del espacio muestral discreto $\Omega = \{V_A, E, V_B\}$ —victoria local, empate y victoria visitante— verificando los axiomas de Kolmogórov: $P(V_A) = 45.5\%$, $P(E) = 26.2\%$ y $P(V_B) = 28.3\%$, cuya suma es $1$, además de las reglas de adición para eventos mutuamente excluyentes (probabilidad de no perder en casa $P(V_A \cup E) = 71.7\%$) y regla del complemento ($P(V_A^c) = 54.5\%$).*
>
> *Sobre esa base, los 6 integrantes aplicamos el **Teorema de Bayes**, $P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}$, respaldado con tablas de contingencia $2 \times 2$, pruebas Chi-cuadrado ($\chi^2$), Odds Ratios e intervalos de confianza al 95%.*
>
> *En los dos primeros roles enfocamos la eficiencia ofensiva local:*
> - *En el **Rol 1 (Eficacia de Remate)**, la probabilidad previa de ganar como local es **45.5%**; pero al observar más de 5 tiros a puerta (`HST > 5`), la probabilidad posterior sube a **65.2%** ($\text{OR} = 3.29$, $p < 0.0001$).*
> - *En el **Rol 2 (Conversión de Gol)**, la probabilidad base de marcar 2 o más goles en casa es **42.9%**, y condicionada a superar 5 remates al arco asciende al **69.1%** ($\text{OR} = 5.06$, $p < 0.0001$).*
>
> *A continuación, **Cristian** explicará cómo modelamos estas variables dependientes mediante la Distribución Hipergeométrica y los roles de ventaja al descanso y córners."*

---

### TURNO 5: Cristian Samir Narváez ("Cristian") — `10:00 - 12:30`
**En pantalla:** Pestaña **Estadística Inferencial & Bayes** (Sliders de **Distribución Hipergeométrica Interactiva** + Roles 3 y 4).  
**Datos clave:** Hipergeométrica $P(X=x \mid N,r,n)$ para **variables dependientes** sin reemplazo; criterio $n < 0.05N$; Rol 3 (`HTR=H`): `78.5%` ($\text{OR} = 8.93$); Rol 4 (`HC>6`): `40.7%` ($\text{OR} = 0.76$).

#### Guion para exponer:
> *"Gracias, Álvaro. En nuestro proyecto diferenciamos con rigor qué distribución aplica según la dependencia de las variables.*
>
> *Cuando trabajamos con **variables dependientes** dentro de una población finita —por ejemplo, extraer $n$ disparos sin reemplazo de los $N$ tiros totales de un partido donde $r$ fueron a puerta, o analizar goles dentro de remates efectivos— cada extracción modifica la probabilidad de la siguiente. Por eso utilizamos la **Distribución Hipergeométrica**:*
> $$P(X = x \mid N, r, n) = \frac{\binom{r}{x}\binom{N-r}{n-x}}{\binom{N}{n}}$$
> *Aquí en la plataforma pueden ver los controles interactivos de $N, r, n, x$, la esperanza, la varianza con su **factor de corrección finita** $\frac{N-n}{N-1}$ y la regla de aproximación ($n < 0.05N$).*
>
> *En cuanto a los roles tácticos 3 y 4:*
> - *En el **Rol 3 (Ventaja al Descanso)**, demostramos el indicador más fuerte del estudio: ir ganando al entretiempo (`HTR = H`) eleva la probabilidad posterior de triunfo final del **45.5%** al **78.5%** ($\text{OR} = 8.93$, $p < 0.0001$).*
> - *En el **Rol 4 (Asedio por Córners)**, descubrimos una paradoja táctica muy interesante: acumular más de 6 tiros de esquina (`HC > 6`) **reduce** la victoria local del **45.5%** al **40.7%** ($\text{OR} = 0.76$, $p < 0.0001$), porque muchos córners ocurren cuando el equipo local va perdiendo o empatando y ataca de forma desesperada ante una defensa cerrada.*
>
> *Ahora le doy la palabra a **Sebastián** para cerrar con la Distribución Binomial, los roles restantes y la confiabilidad estadística."*

---

### TURNO 6: Joan Sebastian Mosquera ("Sebastián") — `12:30 - 15:00`
**En pantalla:** Pestaña **Estadística Inferencial & Bayes** (**Distribución Binomial Interactiva** + Roles 5 y 6) y **Visión General** (Validación de Confiabilidad).  
**Datos clave:** Binomial $P(X=k)=\binom{n}{k}p^k(1-p)^{n-k}$ para **variables independientes**; Rol 5 (`HY+HR>=3`): `54.5%` $\rightarrow$ `61.0%` ($\text{OR}=1.60$); Rol 6 (`AST>4`): `28.3%` $\rightarrow$ `48.7%` ($\text{OR}=3.95$); $s_H=1.26$, $s_A=1.10$, $Z=-5.55$, $p < 0.0001$.

#### Guion para exponer:
> *"Muchas gracias, Cristian. Mientras la Hipergeométrica modela nuestras variables dependientes sin reemplazo, cuando analizamos **variables o ensayos independientes** —donde la probabilidad $p$ se mantiene constante de un evento a otro, como una racha de partidos ganados o las ocasiones de gol independientes de un encuentro— aplicamos la **Distribución Binomial**:*
> $$P(X = k) = \binom{n}{k} p^k (1 - p)^{n - k}$$
> *En la calculadora interactiva evaluamos la probabilidad exacta, acumulada, de supervivencia, esperanza $\mu = np$ y desviación estándar $\sigma = \sqrt{npq}$, además de servir como base matemática para estimar marcadores en nuestro simulador de partidos.*
>
> *Completando los roles bayesianos:*
> - *En el **Rol 5 (Impacto Disciplinario)**, acumular 3 o más tarjetas como local eleva la probabilidad de ceder puntos —empatar o perder— de **54.5%** a **61.0%** ($\text{OR} = 1.60$, $p < 0.0001$).*
> - *En el **Rol 6 (Eficacia Visitante)**, el equipo visitante pasa de una probabilidad basal de triunfo de **28.3%** a **48.7%** al superar 4 tiros a puerta (`AST > 4`, $\text{OR} = 3.95$).*
>
> *Para cerrar, validamos la **confiabilidad estadística** de los 3.800 partidos: las desviaciones estándar muestrales de goles son pequeñas y estables ($s_{\text{local}} = 1.26$ y $s_{\text{visitante}} = 1.10$), confirmando baja dispersión. Y al ejecutar la **prueba de hipótesis bilateral de localía** ($H_0: p = 0.50$ frente a $H_1: p \neq 0.50$), obtenemos $Z = -5.55$ con $p = 2.89 \times 10^{-8} < 0.0001$ e intervalo de confianza del 95% de $[43.9\%, 47.1\%]$. Se rechaza $H_0$, comprobando estadísticamente que el factor localía es estructural y no producto del azar.*
>
> *Agradecemos a nuestros docentes Carlos E. Ruiz y Edith Janeth Potosí Estrada por su orientación. Quedamos atentos a las preguntas del jurado. Muchas gracias."*

---

## BANCO DE RESPUESTAS RÁPIDAS ANTE PREGUNTAS DEL JURADO

1. **¿Por qué usan Hipergeométrica y Binomial y no otras distribuciones?**  
   Porque las variables internas de un partido (tiros a puerta dentro de tiros totales, tarjetas dentro de faltas) son **dependientes** sobre una población finita sin reemplazo (**Hipergeométrica**), mientras que eventos con probabilidad constante entre intentos o partidos independientes siguen la **Binomial**.
2. **¿Cómo evitaron el *data leakage* en Machine Learning?**  
   Ordenando cronológicamente los 3.800 partidos, separando 80% pasado (`2016–2024`) y 20% futuro (`2024–2026`), eliminando cuotas de apuestas y calculando medias móviles exclusivamente hacia atrás (`shift(1).rolling(5)`).
3. **¿Por qué la exactitud del ML ronda el 50%–52%?**  
   En fútbol hay 3 clases (`H`, `D`, `A`) y alta incertidumbre estocástica (rebotes, arbitraje, lesiones). Superar el 51% *out-of-time* sin fuga de datos frente al azar (33.3%) o la clase mayoritaria (45.5%) demuestra poder predictivo real y bien calibrado.
