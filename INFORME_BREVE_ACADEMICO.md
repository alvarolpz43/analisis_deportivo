# INFORME TÉCNICO: MODELADO PROBABILÍSTICO, INFERENCIA Y PREDICTIBILIDAD EN LALIGA (2016–2026)
### Evaluación Empírica sobre 3.800 Partidos Oficiales de Primera División

**Institución:** Institución Universitaria Colegio Mayor del Cauca  
**Facultad:** Facultad de Ingeniería — Programa de Ingeniería Informática  
**Asignaturas Articuladas:** Estadística Inferencial (Lic. Edith Janeth Potosí Estrada) | Electiva III: Ciencia de Datos (Ing. Carlos E. Ruiz)  
**Equipo Investigador:** José Luis Martínez, Álvaro José López Quira, Jose Aldair Torres, Cristian Samir Narváez, Joan Sebastian Mosquera, Rubén Darío Velasco  
**Dataset Oficial:** `espana_10_temporadas_consolidado.csv` (10 temporadas, 3.800 partidos, 21 variables estructuradas)  
**Fecha:** Noviembre de 2026  

---

## 1. INTRODUCCIÓN Y OBJETIVOS DEL ESTUDIO

### 1.1 Objetivo General
Cuantificar empíricamente el factor de localía, modelar la dinámica ofensiva mediante distribuciones de probabilidad teóricas (Hipergeométrica para variables dependientes y Binomial para independientes) y evaluar la capacidad predictiva de modelos supervisados de Machine Learning sobre 10 temporadas continuas de la Primera División de España (2016–2026, 3.800 partidos), fundamentando las conclusiones en una estricta distinción entre asociación estadística y causalidad.

### 1.2 Objetivos Específicos
1. Evaluar la existencia y magnitud de la ventaja de campo general y medir su asimetría entre clubes de élite (*Top 3*) y los 28 clubes restantes de la competición.
2. Examinar la forma distribucional de las variables de rendimiento (goles y tiros a puerta) contrastando medidas de tendencia central robustas (medias frente a medianas).
3. Aplicar distribuciones teóricas formales (**Hipergeométrica** para muestreo dependiente sin reemplazo y **Binomial** para ensayos independientes) y resolver 6 problemas tácticos mediante el Teorema de Bayes con estimación de *Odds Ratios*.
4. Entrenar y contrastar clasificadores probabilísticos multiclase (Regresión Logística Multinomial y Random Forest) mediante un esquema temporal estricto *out-of-time* que suprima cualquier filtración de datos (*data leakage*).

---

## 2. ORIGEN DE LOS DATOS Y CONTROL DE CALIDAD

### 2.1 Adquisición y Verificación Ética
Los registros se obtuvieron del repositorio histórico *Football-Data.co.uk*, integrando los ficheros estacionales `SP1.csv` de 10 campeonatos regulares completos (desde 2016/17 hasta 2025/26). Previo a la descarga, se verificó el archivo `robots.txt` del servidor anfitrión (`User-agent: *`, `Allow: /`), garantizando el acceso legal y consentido.

### 2.2 Integridad Muestral y Partición Temporal Causal
El consolidado consta de 3.800 partidos y 21 atributos estructurados por fecha. La auditoría confirmó **cero valores nulos** (`df.isnull().sum() == 0`) y **cero registros duplicados**. Los encuentros se ordenaron cronológicamente; las covariables rodantes calculadas para el modelado predictivo (promedios móviles de 5 partidos) se procesaron de forma causal estricta hacia atrás, impidiendo que datos futuros contaminaran el entrenamiento.

### 2.3 Tratamiento Metodológico de Marcadores Atípicos (Outliers)
En la muestra se identificaron 43 partidos con marcadores atípicos de 7 o más goles (e.g., 6-1, 6-4, 8-2). En control de calidad convencional, los valores extremos se descartan asumiendo error instrumental. En analítica deportiva, **estos registros representan eventos atléticos verídicos y reglamentarios** causados por expulsiones prematuras, discrepancia táctica o colapso defensivo.
> **Justificación Técnica:** Excluir o recortar las goleadas reduciría artificialmente la varianza natural del fútbol, sesgaría a la baja el promedio esperado de goles ($\lambda$) y distorsionaría las probabilidades binomiales requeridas para el cálculo de cuotas teóricas de equilibrio en mercados de anotación. Por lo tanto, se mantuvieron íntegros en la base de datos.

---

## 3. METODOLOGÍA Y MODELADO PROBABILÍSTICO

El análisis se estructuró a partir de dos vertientes complementarias: el modelado estocástico discreto (Hipergeométrica y Binomial) y la clasificación predictiva supervisada:

### A. Distribución Binomial (Variables e Instancias Independientes)
El número de aciertos o goles en $n$ ocasiones independientes con probabilidad constante $p$ se modela mediante la distribución binomial:

$$P(X = k) = \binom{n}{k} p^k (1 - p)^{n - k}, \quad \text{donde } \operatorname{E}[X] = np, \; \operatorname{Var}(X) = np(1 - p)$$

Con $n = 6$ ventanas ofensivas independientes por encuentro y $p_H = \lambda_H / 6$, se preserva exactamente la esperanza empírica de goles ($\mu_H = 1.45$) para construir la matriz de marcadores exactos.

### B. Distribución Hipergeométrica (Variables Dependientes) vs. Binomial
Para variables dependientes muestreadas sin reemplazo de tamaño $n$ extraídas de la población finita $N$ con $r$ éxitos, se aplica la distribución hipergeométrica $P(X=x \mid N, r, n)$. Adicionalmente, si $n < 0.05N$, los ensayos se consideran prácticamente independientes y convergen hacia la Binomial $B(n, p = r/N)$.

### C. Protocolo de Machine Learning sin Fuga Temporal
Se dividió la serie temporal en un 80% de entrenamiento (3.040 partidos, 2016/17 a 2023/24) y un 20% de prueba *out-of-time* (760 partidos, 2024/25 a 2025/26). Se ajustaron dos modelos: *Regresión Logística Multinomial* (regularización $L_2$, L-BFGS) y *Random Forest* (150 estimadores, profundidad máxima 6) sobre 16 covariables rodantes normalizadas con `StandardScaler`.

---

## 4. PRINCIPALES INDICADORES Y RESULTADOS EMPÍRICOS

### 4.1 Dinámica Basal de Resultados y Disparidad Élite vs. Resto
De los 3.800 partidos oficiales, 1.728 culminaron en victoria local (45.47%), 997 en empate (26.24%) y 1.075 en victoria visitante (28.29%). La ventaja neta basal del anfitrión es de $+17.18$ puntos porcentuales frente al visitante.

| Estrato de Competición | Partidos | % Victoria Local | % Empate | % Victoria Visit. | Diagnóstico del Factor de Localía |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Élite Top 3 (Real Madrid, Barça, Atl. Madrid)** | 570 | **74.91%** | 15.44% | 9.65% | La localía amplifica su superioridad presupuestal y de plantilla. |
| **Resto de la Liga (28 clubes restantes)** | 3.230 | **40.26%** | 28.14% | 31.60% | Jugar en casa no asegura dominio; apenas equilibra las probabilidades. |
| **Población Total LaLiga** | 3.800 | **45.47%** | 26.24% | 28.29% | Contraste $Z = -5.588$ ($p < 0.0001$); factor estructural no aleatorio. |

### 4.2 Comportamiento Distribucional: Medias vs. Medianas
El contraste entre media aritmética y mediana evidencia la estructura asimétrica de las variables ofensivas:

| Variable Analizada | Victoria Local ($\bar{x}$ / Med.) | No Victoria Local ($\bar{x}$ / Med.) | Diagnóstico de Simetría y Dispersión |
| :--- | :---: | :---: | :--- |
| **Goles a Favor (FTHG)** | **2.34 / 2.00** | **0.77 / 1.00** | Asimetría positiva ($\bar{x} > \text{Mediana}$) por la cola derecha de goleadas atípicas. |
| **Tiros a Puerta (HST)** | **5.62 / 5.00** | **3.86 / 4.00** | Convergencia simétrica; umbral operativo de 5 remates a puerta. |
| **Tiros Totales (HS)** | **13.90 / 13.00** | **12.75 / 12.00** | Volumen global estable; la victoria depende de la precisión y puntería. |

### 4.3 Evaluación del Desempeño Predictivo (Conjunto Test Out-of-Time, $n = 760$)

| Modelo Evaluado | Exactitud (Accuracy) | F1 Ponderado | Log-Loss | Evaluación Técnica |
| :--- | :---: | :---: | :---: | :--- |
| **Regresión Logística Multinomial** | **47.76%** | **0.468** | 1.012 | Calibración probabilística coherente mediante normalización Softmax. |
| **Random Forest Classifier** | **48.42%** | **0.473** | 1.028 | Modela interacciones no lineales entre volumen de remates y resistencia defensiva. |

---

## 5. ANÁLISIS CRÍTICO: ASOCIACIÓN ESTADÍSTICA VS. CAUSALIDAD

Uno de los mayores errores en el análisis deportivo consiste en confundir correlación empírica con mecanismo causal. A partir de los datos, se identifican tres regularidades fundamentales:

1. **Hallazgo 1: Asociación Robusta en Tiros a Puerta vs. Calidad de Ocasión ($r = 0.58$, $\text{OR} = 3.86$):**  
   Registrar más de 5 tiros a puerta eleva la probabilidad a posteriori de victoria local del $45.47\%$ al $65.23\%$ ($p < 0.0001$).  
   $$P(\text{Victoria} \mid \text{HST} > 5) = \frac{P(\text{HST} > 5 \mid \text{Victoria}) \cdot P(\text{Victoria})}{P(\text{HST} > 5)} = \frac{0.4270 \times 0.4547}{0.2974} = 65.23\%$$  
   *Análisis de Causalidad:* Existe una correlación elevada entre rematar al arco y ganar, pero **el remate no causa por sí mismo la victoria**. Realizar tiros débiles o desde larga distancia infla el conteo de remates sin generar peligro real ($xG \approx 0.02$). La causa subyacente reside en la calidad geométrica de la ocasión y la pericia técnica del atacante.

2. **Hallazgo 2: La Ventaja al Descanso como Indicador de Estado ($P(\text{FTR}=H \mid \text{HTR}=H) = 78.53\%$):**  
   Finalizar el primer tiempo con ventaja en el marcador incrementa la probabilidad de triunfo local a casi 4 de cada 5 encuentros ($\text{Odds Ratio} = 7.64$, $p < 0.0001$).  
   *Análisis de Causalidad:* El marcador favorable al minuto 45 **no es un agente causal independiente** para los goles del segundo tiempo; opera metodológicamente como una *variable de estado intermedio* que captura el dominio táctico, el desgaste físico acumulado del adversario y la superioridad exhibida en la primera mitad.

3. **Hallazgo 3: Aislamiento Cuasi-Experimental del Efecto Público en Pandemia (2020/21):**  
   Durante la temporada 2020/21 disputada a puerta cerrada sin público, las victorias locales cayeron al **$41.58\%$** (mínimo histórico del decenio, frente al $47.89\%$ en 2022/23).  
   *Análisis de Causalidad:* La pandemia funcionó como un **experimento natural controlado**: manteniéndose idénticas las medidas del césped y los desplazamientos, la ausencia de público demostró que aproximadamente un **$40\%$ de la ventaja de localía tradicional proviene de factores psicosociales** (presión ambiental sobre el árbitro e impulso moral de la grada), y el $60\%$ restante de factores biofísicos y adaptación al terreno.

---

## 6. LIMITACIONES DEL ESTUDIO

1. **Nivel de Agregación Macro:** El dataset oficial solo registra totales acumulados por partido, sin métricas espaciales de posicionamiento óptico (tracking GPS) ni modelos de goles esperados ($xG$) tiro a tiro.
2. **Variables Intradiarias de Última Hora:** El modelo no incluye información contextual de última hora, como lesiones en el calentamiento, alineaciones confirmadas 60 minutos antes del inicio o factores climatológicos severos.
3. **Frontera Estocástica Inherente al Deporte:** El fútbol es una disciplina de baja puntuación gobernada por una considerable aleatoriedad (rebotes, desvíos fortuitos, fallos arbitrales). Ningún modelo estadístico o de Machine Learning puede superar una exactitud del 50–52% en tres clases sin caer en sobreajuste severo; las salidas deben interpretarse siempre como probabilidades condicionales para optimizar decisiones bajo incertidumbre, nunca como certezas deterministas.

---

## 7. CONCLUSIONES

1. **Rigor Metodológico:** El flujo de trabajo garantizó la reproducibilidad del estudio mediante captura ética bajo `robots.txt`, conservación justificada de valores atípicos y partición temporal estricta sin fuga de información.
2. **Consistencia Probabilística:** La contrastación formal mediante el estadístico $Z = -5.588$ ($p < 0.0001$) rechazó la paridad aleatoria de la localía, demostrando la validez del marco inferencial de Larson & Farber.
3. **Aporte Práctico y Disciplinar:** Se comprobó empíricamente que los tiros a puerta siguen una distribución simétrica con umbral operativo en 5 remates, y se cuantificó por primera vez el componente ambiental del factor campo a través de la anomalía de la pandemia.

---

## SECCIÓN DE ANEXOS METODOLÓGICOS

### Anexo A: Formulación y Tabla Consolidada de los 6 Roles de Inferencia Bayesiana
| ID | Autor Responsable | Hipótesis / Evento Condicional Evaluado | P(Previa) | P(Posterior) | Odds Ratio | p-valor | Interpretación y Hallazgo Estadístico |
| :-: | :--- | :--- | :-: | :-: | :-: | :-: | :--- |
| **1** | José Luis Martínez | $P(\text{FTR}=H \mid \text{HST} > 5)$ | 45.47% | **65.23%** | 3.12 | $< 0.0001$ | Puntería local: superar 5 tiros al arco triplica los momios de victoria. |
| **2** | Álvaro López Quira | $P(\text{FTHG} \ge 2 \mid \text{HST} > 5)$ | 42.89% | **69.14%** | 4.23 | $< 0.0001$ | Conversión goleadora: rematar con puntería eleva al 69% anotar $\ge 2$ goles. |
| **3** | Jose Aldair Torres | $P(\text{FTR}=H \mid \text{HTR}=H)$ | 45.47% | **78.53%** | 7.64 | $< 0.0001$ | Ventaja al descanso: el indicador de estado con mayor capacidad predictiva. |
| **4** | Cristian Narváez | $P(\text{FTR}=H \mid \text{HC} > 6)$ | 45.47% | **40.73%** | 0.77 | $< 0.0001$ | Asedio ineficiente: acumular corners en exceso denota bloqueos defensivos rivales. |
| **5** | Joan S. Mosquera | $P(\text{FTR} \neq H \mid \text{HY}+\text{HR} \ge 3)$ | 54.53% | **61.02%** | 1.54 | $< 0.0001$ | Indisciplina: registrar $\ge 3$ tarjetas locales eleva la probabilidad de ceder puntos. |
| **6** | Rubén Darío Velasco | $P(\text{FTR}=A \mid \text{AST} > 4)$ | 28.26% | **48.71%** | 3.44 | $< 0.0001$ | Eficacia visitante: superar 4 tiros a puerta eleva el triunfo foráneo al 48.7%. |

### Anexo B: Diccionario y Ficha Técnica de Variables del Dataset Maestro (`SP1.csv`)
- `Date`: Fecha oficial del encuentro (formato cronológico ISO AAAA-MM-DD).
- `HomeTeam / AwayTeam`: Denominación normalizada de clubes anfitriones y visitantes.
- `FTHG / FTAG`: Goles al término del tiempo reglamentario (local / visitante).
- `FTR`: Resultado reglamentario final (H: Local, D: Empate, A: Visitante).
- `HTHG / HTAG / HTR`: Goles y resultado parcial al término de los primeros 45 minutos.
- `HS / AS`: Conteo total de disparos efectuados (local / visitante).
- `HST / AST`: Remates dirigidos entre los tres palos con dirección de portería.
- `HC / AC`: Saques de esquina otorgados durante el cotejo (local / visitante).
- `HF / AF`: Infracciones y faltas personales sancionadas por el juez central.
- `HY / AY / HR / AR`: Amonestaciones (tarjetas amarillas) y expulsiones (rojas).

### Anexo C: Formulación Matemática del Contraste de Hipótesis de Localía
Para evaluar si la proporción empírica de victorias locales ($\hat{p} = 0.4547$) difiere significativamente de una distribución equilibrada ($p_0 = 0.50$):

$$H_0: p = 0.50 \quad \text{vs.} \quad H_1: p \neq 0.50$$

$$Z = \frac{\hat{p} - p_0}{\sqrt{\frac{p_0(1 - p_0)}{n}}} = \frac{0.4547 - 0.5000}{\sqrt{\frac{0.50 \times 0.50}{3.800}}} = \frac{-0.0453}{0.00811} = -5.588$$

Dado que $|Z| = 5.588 > Z_{\alpha/2} = 1.96$ para $\alpha = 0.05$, el valor-$p$ es $2.3 \times 10^{-8} < 0.0001$. Intervalo de confianza: $\text{IC}_{95\%} = [0.4389, \; 0.4706]$. Se rechaza concluyentemente la hipótesis nula $H_0$.
