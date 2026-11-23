# GUION TÉCNICO Y ESTRUCTURA DE SUSTENTACIÓN ORAL (15 MINUTOS)
## Proyecto: Plataforma Analítica y Predictiva de LaLiga Primera División (3.800 Partidos | 2016–2026)

---

### METADATOS Y CRONOMETRAJE OFICIAL

- **Institución:** Institución Universitaria Colegio Mayor del Cauca — Facultad de Ingeniería (Ingeniería Informática)  
- **Articulación Académica Interdisciplinar:**  
  - **Asignatura 1:** Estadística Inferencial — **Docente:** Edith Janeth Potosí Estrada  
  - **Asignatura 2:** Electiva III: Introducción a la Ciencia de Datos — **Docente:** Carlos E. Ruiz  
- **Equipo Expositor (6 Integrantes):**  
  1. José Luis Martínez  
  2. Álvaro José López Quira  
  3. Jose Aldair Torres  
  4. Cristian Samir Narváez  
  5. Joan Sebastian Mosquera  
  6. Rubén Darío Velasco  
- **Duración Total:** **15 minutos cronometrados** (12 minutos de exposición temática + 3 minutos de demostración en vivo y sesión de preguntas).

---

## ESTRUCTURA TEMPORAL Y DESGLOSE POR DIAPOSITIVAS

```
[00:00 - 02:00] Diapositiva 1: Portada, Articulación Académica y Planteamiento del Problema
[02:00 - 04:00] Diapositiva 2: Extracción Ética de Datos, robots.txt y Justificación de Outliers
[04:00 - 06:30] Diapositiva 3: Ciencia de Datos: Respuestas a las 3 Preguntas de la Cátedra (25%)
[06:30 - 08:00] Diapositiva 4: Tres Hallazgos Numéricos: Distinción entre Asociación y Causalidad
[08:00 - 10:30] Diapositiva 5: Estadística Inferencial (Larson & Farber): Bayes, Hiper, Binomial, Poisson y Normal
[10:30 - 12:30] Diapositiva 6: Machine Learning, Predictor Bivariado y Demostración en la Plataforma Web
[12:30 - 15:00] Diapositiva 7: Conclusiones, Validación de Confiabilidad y Preguntas del Jurado
```

---

## DESGLOSE DETALLADO DE DIAPOSITIVAS Y GUION VERBAL

---

### DIAPOSITIVA 1: Portada, Articulación Institucional y Planteamiento
**Tiempo Asignado:** 00:00 – 02:00 (2 minutos)  
**Ponente Principal:** José Luis Martínez  

#### Contenido Visual en Pantalla:
- Logotipo oficial de la Institución Universitaria Colegio Mayor del Cauca.
- Título del Proyecto: *Plataforma de Analítica Deportiva e Inferencia Probabilística: LaLiga Santander (2016–2026)*.
- Cuadro de asignaturas articuladas:
  - *Estadística Inferencial* — Docente: Edith Janeth Potosí Estrada.
  - *Electiva III: Introducción a la Ciencia de Datos* — Docente: Carlos E. Ruiz.
- Nómina de los 6 autores del equipo de investigación.
- Indicador clave: *3.800 partidos oficiales auditados | 10 temporadas consecutivas*.

#### Guion Verbal del Ponente:
> *"Buenos días, estimada docente Edith Janeth Potosí Estrada, estimado docente Carlos E. Ruiz, compañeros del jurado y audiencia. Hoy presentamos la culminación de nuestro proyecto integrador, el cual articula de forma directa los saberes de **Estadística Inferencial** y la cátedra de **Electiva III: Introducción a la Ciencia de Datos**.*  
>  
> *El problema de investigación aborda la modelación probabilística del fútbol profesional: un sistema complejo caracterizado por eventos discretos de baja frecuencia (goles) y una fuerte influencia de la incertidumbre. Sobre un universo auditado de 3.800 partidos de LaLiga española correspondientes a 10 temporadas continuas (2016 a 2026), respondimos preguntas estructurales sobre el factor localía, evaluamos la eficiencia ofensiva y construimos una plataforma interactiva completa que integra el Teorema de Bayes, distribuciones teóricas de Larson & Farber y algoritmos de Machine Learning."*

---

### DIAPOSITIVA 2: Extracción Ética de Datos, robots.txt y Tratamiento de Outliers
**Tiempo Asignado:** 02:00 – 04:00 (2 minutos)  
**Ponente Principal:** Álvaro José López Quira  

#### Contenido Visual en Pantalla:
- Captura de la verificación programática del archivo `robots.txt` en *Football-Data.co.uk* (`Allow: /`, HTTP 200 OK).
- Flujo ETL: 10 archivos estacionales `SP1.csv` $\rightarrow$ Depuración dimensional a 21 variables limpias $\rightarrow$ Consolidado de 3.800 filas.
- Tabla de auditoría: 0 valores nulos, 0 duplicados, ordenación cronológica estricta para evitar *Data Leakage*.
- Bloque destacado: *Preservación Justificada de Goleadas Extremas (6-2, 6-4, 8-2)*.

#### Guion Verbal del Ponente:
> *"Para garantizar la integridad ética de la investigación, el primer paso consistió en validar el protocolo de robots de Football-Data.co.uk mediante el módulo RobotFileParser de Python, confirmando que las peticiones se realizaban en rutas plenamente autorizadas.*  
>  
> *Se descartaron cuotas comerciales de casas de apuestas para conservar un dataset depurado de 21 variables físico-deportivas. Un aspecto crucial evaluado en Ciencia de Datos fue el tratamiento de **valores atípicos (outliers)**. Encontrando 43 encuentros con marcadores extremos como 6-2 o 6-4, determinamos metodológicamente **no eliminarlos**. En analítica deportiva, una goleada no es un fallo instrumental o un error de tipografía; es un acontecimiento atlético genuino. Truncar estos registros artificialmente alteraría la varianza del fenómeno y sesgaría negativamente la estimación de parámetros estocásticos como la intensidad de Poisson."*

---

### DIAPOSITIVA 3: Ciencia de Datos: Respuestas a las 3 Preguntas de la Cátedra (25%)
**Tiempo Asignado:** 04:00 – 06:30 (2 minutos y 30 segundos)  
**Ponente Principal:** Jose Aldair Torres  

#### Contenido Visual en Pantalla:
- **Gráfico P1:** Barras agrupadas comparando % de victoria local: Top 3 (74.9%) vs General (45.5%) vs Resto (40.3%).
- **Tabla P2:** Medias vs Medianas de goles y tiros a puerta en victorias locales ($FTHG = 2.34 / 2.00$; $HST = 5.62 / 5.00$) frente a no victorias ($FTHG = 0.77 / 1.00$; $HST = 3.86 / 4.00$).
- **Gráfico P3:** Evolución temporal de 10 temporadas resaltando la anomalía de la temporada 2020/21 (41.6% victorias locales a puerta cerrada sin público).

#### Guion Verbal del Ponente:
> *"Abordando el componente del 25% de la cátedra de Electiva III, resolvimos formalmente las tres preguntas planteadas:*  
>  
> *En la **Pregunta 1**, demostramos que la ventaja de jugar como local existe de forma basal (45.5% victorias en casa vs 28.3% fuera), pero se magnifica radicalmente según el nivel del equipo: los clubes de élite (Real Madrid, Barcelona y Atlético de Madrid) ganan el **74.9%** de sus partidos en su feudo, mientras que el resto de la liga apenas alcanza el **40.3%**. La localía actúa como catalizador de la superioridad de plantilla.*  
>  
> *En la **Pregunta 2**, contrastamos medias y medianas para auditar la asimetría: en los goles marcados, la media (2.34) supera la mediana (2.0), evidenciando una asimetría positiva provocada por goleadas atípicas. En cambio, en los **tiros a puerta (HST)**, la media (5.62) y la mediana (5.0) coinciden casi a la perfección, lo que prueba una distribución simétrica y define a los 5 remates a marco como el umbral operativo mínimo del triunfo local.*  
>  
> *En la **Pregunta 3**, evidenciamos que el promedio de goles es muy estable (~2.62 goles por partido), pero descubrimos una alteración estructural en la temporada 2020/21, donde la ausencia de hinchada por la pandemia redujo la victoria local al 41.6%, el punto más bajo en diez años."*

---

### DIAPOSITIVA 4: Tres Hallazgos Numéricos (Asociación vs Causalidad)
**Tiempo Asignado:** 06:30 – 08:00 (1 minuto y 30 segundos)  
**Ponente Principal:** Cristian Samir Narváez  

#### Contenido Visual en Pantalla:
- Tarjeta 1: *Tiros a Puerta vs Triunfo* ($r = 0.58$, $\text{OR} = 3.86$, Likelihood = 42.7%).
- Tarjeta 2: *Ventaja al Descanso* ($P(H \mid HTR=H) = 78.5\%$).
- Tarjeta 3: *Efecto Cuasi-Experimental del Público* (Caída de 6.3 puntos porcentuales sin espectadores).
- Banner de advertencia: *Distinción Epistemológica: Asociación Probabilística $\neq$ Causalidad Determinista*.

#### Guion Verbal del Ponente:
> *"Uno de los mayores aportes del proyecto es evitar la clásica falacia de atribuir causalidad a la correlación:*  
>  
> *1. **Hallazgo 1:** Registrar más de 5 tiros a puerta triplica las opciones de ganar ($\text{OR} = 3.86$), elevando la probabilidad de 45.5% a 65.2%. Sin embargo, disparar al arco **no causa** por sí solo el gol: disparar desde 40 metros eleva el conteo pero reduce el gol esperado ($xG$). Existe asociación matemática fuerte, pero la causalidad está condicionada por la calidad del disparo.*  
> *2. **Hallazgo 2:** La ventaja al descanso (HTR = H) predice el 78.5% de las victorias locales, pero es un **indicador de estado intermedio**, no una causa independiente que actúe en el segundo tiempo.*  
> *3. **Hallazgo 3:** El cierre de estadios en 2020/21 ofreció un experimento natural único: al desaparecer el público, el factor campo cayó un 14% relativo, demostrando que cerca del 40% de la ventaja local reside en factores psicológicos y presión ambiental sobre los árbitros y el rival."*

---

### DIAPOSITIVA 5: Marco Estadístico Inferencial (Larson & Farber Cap. 4 & 7)
**Tiempo Asignado:** 08:00 – 10:30 (2 minutos y 30 segundos)  
**Ponente Principal:** Joan Sebastian Mosquera  

#### Contenido Visual en Pantalla:
- **Teorema de Bayes:** 6 roles estudiados por los integrantes (Eficacia, Conversión, Descanso, Córners, Tarjetas y Rendimiento Visitante).
- **Distribución Hipergeométrica:** Muestreo sin reemplazo y la regla de aproximación binomial de Larson & Farber ($n < 0.05N$).
- **Distribución Binomial:** Eventos independientes y goles.
- **Distribución de Poisson (Cap. 4):** $P(x) = (\mu^x e^{-\mu})/x!$, varianza $\sigma^2 = \mu$, desviación estándar $\sigma = \sqrt{\mu}$ y rango usual $[\mu - 2\sigma, \mu + 2\sigma]$.
- **Distribución Normal Estándar y Valor Z (Cap. 7):** $z = (X - \mu)/\sigma$, 4 casos de áreas bajo la curva y Regla Empírica 68–95–99.7.

#### Guion Verbal del Ponente:
> *"Para la cátedra de Estadística Inferencial, implementamos los modelos del texto guía de Larson & Farber:*  
>  
> *Con el **Teorema de Bayes**, cada uno de los 6 integrantes analizó una variable condicionante; por ejemplo, el Integrante 3 demostró cómo la creencia a priori de victoria (45.5%) se actualiza al 78.5% condicionada a liderar al descanso.*  
>  
> *En la **Distribución Hipergeométrica**, modelamos extracciones sin reemplazo y validamos el criterio de Larson & Farber: si la muestra $n$ es menor al 5% de la población $N$, la hipergeométrica converge con precisión a la binomial.*  
>  
> *En la **Distribución de Poisson (Cap. 4)**, calculamos la tasa de goles en el intervalo continuo de 90 minutos ($\mu = 1.45$). Dado que en Poisson la varianza es igual a la media ($\sigma^2 = \mu$), evaluamos el rango usual $[\mu - 2\sigma, \mu + 2\sigma]$; cualquier partido con 5 o más goles de un equipo cae fuera de los límites y califica como inusual ($P < 0.05$).*  
>  
> *Finalmente, con la **Distribución Normal Estándar (Cap. 7)**, tipificamos el valor z del rendimiento de los clubes y calculamos las áreas de los 4 Casos estándar, aplicando la Regla Empírica del 68%, 95% y 99.7%."*

---

### DIAPOSITIVA 6: Machine Learning, Predictor y Demostración Web
**Tiempo Asignado:** 10:30 – 12:30 (2 minutos)  
**Ponente Principal:** Rubén Darío Velasco  

#### Contenido Visual en Pantalla:
- Métricas del Modelo:
  - *Regresión Logística Multinomial:* Exactitud = **47.8%**, F1-Score (Weighted) = **0.468**.
  - *Random Forest Classifier (150 árboles):* Exactitud = **48.5%**, F1-Score (Weighted) = **0.473**.
- Cuotas Justas Implícitas: $\text{Fair Odd} = 1 / P$.
- Captura de la aplicación Web interactiva (SPA) desarrollada con HTML5, CSS3, Vanilla JS, KaTeX y Chart.js.
- Aviso de Ciencia de Datos: *Predicciones como probabilidades estimadas, no certezas deterministas*.

#### Guion Verbal del Ponente:
> *"En el apartado de Machine Learning, empleamos una partición out-of-time estricta: 80% para entrenamiento (3.040 partidos) y 20% para evaluación en el test set temporal (760 partidos).*  
>  
> *Tanto la Regresión Logística como el Random Forest alcanzan un Accuracy del ~48.5% y un F1-Score ponderado de 0.473. Aunque en otros dominios esto parecería modesto, en el fútbol profesional —con tres desenlaces mutuamente excluyentes (H, D, A) y donde la victoria base visitante es de solo 28%— superar el 48% con variables rodantes representa un poder de discriminación estadísticamente significativo.*  
>  
> *Como principio ético de Ciencia de Datos, nuestra plataforma enseña que estas predicciones **son estimaciones probabilísticas y no certezas absolutas**. Por ello, el simulador web proyecta no solo las probabilidades, sino las cuotas justas sin margen de casa de apuestas y la simulación Monte Carlo de las 38 jornadas de la liga."*

---

### DIAPOSITIVA 7: Conclusiones, Confiabilidad y Preguntas del Jurado
**Tiempo Asignado:** 12:30 – 15:00 (2 minutos y 30 segundos)  
**Ponente Principal:** Todo el Equipo (Cierre: José Luis Martínez)  

#### Contenido Visual en Pantalla:
- Resumen de Confiabilidad:
  - Desviación estándar de goles local: $s = 1.30$.
  - Desviación estándar de goles visitante: $s = 1.15$.
  - Prueba de hipótesis bilateral: $Z = -5.59$, $p < 0.0001$ (Rechazo concluyente de $H_0$).
- Logros Académicos:
  - Articulación interdisciplinar exitosa (Estadística Inferencial + Electiva III).
  - Web Scraping legal (`robots.txt`), 3.800 partidos sin nulos ni fugas temporales.
  - Plataforma funcional interactiva de código abierto con 5 módulos analíticos.
- Agradecimientos a los docentes: Edith Janeth Potosí Estrada y Carlos E. Ruiz.

#### Guion Verbal del Ponente:
> *"Para concluir, la auditoría muestral valida una desviación estándar cercana a $s \approx 1.25$ y un estadístico $Z = -5.59$ con $p < 0.0001$, confirmando con altísima significancia estadística que el factor localía es un fenómeno estructural permanente y no un artefacto del azar.*  
>  
> *Este trabajo demuestra cómo la unión entre la rigurosidad matemática de la Estadística Inferencial y las herramientas computacionales modernas de la Ciencia de Datos permite extraer conocimiento accionable a partir de grandes volúmenes de información deportiva.*  
>  
> *Agradecemos a nuestros docentes Edith Janeth Potosí Estrada y Carlos E. Ruiz por su constante orientación pedagógica. Quedamos a su entera disposición para responder las preguntas del jurado. Muchas gracias."*

---

## CONSEJOS CLAVE PARA EL DÍA DE LA PRESENTACIÓN

1. **Gestión del Tiempo:** Mantener un cronómetro visible; cada ponente debe hablar entre 1:30 y 2:00 minutos como máximo.
2. **Uso del Vocabulario:** Emplear terminología rigurosa: *"probabilidad a posteriori"*, *"odds ratio"*, *"asimetría positiva"*, *"regla empírica"*, *"sesgo de selección"*, *"cuotas justas"*.
3. **Respuesta a Preguntas:**  
   - Si preguntan sobre Machine Learning: Recalcar la partición cronológica (no aleatoria) para evitar *data leakage*.  
   - Si preguntan sobre la pandemia: Recordar que la temporada 2020/21 fue un experimento natural con estadios vacíos.  
   - Si preguntan sobre outliers: Recordar que una goleada 8-2 es un hecho deportivo real que define la cola derecha de la distribución.
