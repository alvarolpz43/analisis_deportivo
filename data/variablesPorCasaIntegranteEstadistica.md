# Arquitectura del Proyecto: Extracción de Datos, Modelado Probabilístico y Predicción Deportiva

## 1. Dataset Maestro y Variables Seleccionadas
Se consolidaron **3.800 registros históricos** correspondientes a las últimas 10 temporadas completas de Primera División de España (`SP1.csv`, 2016/17 – 2025/26) extraídos de *Football-Data.co.uk* tras verificar `robots.txt`. De las más de 100 columnas originales, se aplicó reducción de dimensionalidad conservando **21 variables limpias** (eliminando cuotas de casas de apuestas):

* **Identificación y Contexto (3):** `Date` (fecha), `HomeTeam` (equipo local), `AwayTeam` (equipo visitante).
* **Resultados y Goles (6):** `FTR` (resultado final: `H`, `D`, `A`), `FTHG` (goles local final), `FTAG` (goles visitante final), `HTR` (resultado al descanso), `HTHG` (goles local 1T), `HTAG` (goles visitante 1T).
* **Volumen y Precisión Ofensiva (6):** `HS` (tiros totales local), `AS` (tiros totales visitante), `HST` (tiros a puerta local), `AST` (tiros a puerta visitante), `HC` (córners local), `AC` (córners visitante).
* **Disciplina e Infracciones (6):** `HF` (faltas local), `AF` (faltas visitante), `HY` (amarillas local), `AY` (amarillas visitante), `HR` (rojas local), `AR` (rojas visitante).

> **Nota metodológica:** El dataset opera a nivel agregado de club por partido (no contiene registros individuales de futbolistas). El módulo de **Machine Learning (Regresión Logística / Random Forest)** utiliza promedios móviles de los últimos 5 partidos por equipo para evitar fuga de datos (*data leakage*) y complementar la inferencia bayesiana.

---

## 2. Asignación de Variables Dependientes y Preguntas por Integrante (6 Roles)

Cada integrante defiende una relación de dependencia específica bajo el doble enfoque de **Muestreo sin Reemplazo (Distribución Hipergeométrica: $N, r, n, x$)** y **Probabilidad Condicional (Teorema de Bayes: $P(\text{Evento} \mid \text{Evidencia})$)**:

### Integrante 1: Eficacia de Remate y Victoria como Local
* **Variables:** `FTR` (dependiente) $\leftarrow$ `HST`, `HS` (condicionantes).
* **Planteamiento Hipergeométrico:** Población $N = \text{HS}$ (tiros totales), éxitos $r = \text{HST}$ (tiros a puerta).
* **Pregunta de exposición:** *¿En qué medida aumenta la probabilidad de que el equipo local gane el partido ($V_A$), dado que registra más de 5 tiros a puerta ($T$: $\text{HST} > 5$), y cómo se comporta el conteo de remates efectivos al auditar muestras sin reemplazo?*

### Integrante 2: Conversión de Gol desde Tiros a Puerta
* **Variables:** `FTHG` (dependiente) $\leftarrow$ `HST` (condicionante).
* **Planteamiento Hipergeométrico:** Población $N = \text{HST}$ (tiros a puerta), éxitos $r = \text{FTHG}$ (tiros que terminan en gol) vs. fracasos $N - r$ (tiros atajados).
* **Pregunta de exposición:** *¿Cuál es la probabilidad de que un club local anote 2 o más goles ($\text{FTHG} \ge 2$), dado que supera los 5 remates al arco ($\text{HST} > 5$), y qué proporción esperada de goles se obtiene al muestrear tiros a puerta sin reemplazo?*

### Integrante 3: Sostenimiento de Ventaja desde el Descanso
* **Variables:** `FTR` (dependiente) $\leftarrow$ `HTR`, `HTHG`, `FTHG` (condicionantes).
* **Planteamiento Hipergeométrico:** Población $N = \text{FTHG}$ (goles totales en el encuentro), éxitos $r = \text{HTHG}$ (goles anotados en el primer tiempo).
* **Pregunta de exposición:** *¿Cómo se actualiza la probabilidad de obtener la victoria definitiva al minuto 90 ($\text{FTR} = \text{H}$), dado que el equipo local se marcha al descanso ganando el primer tiempo ($\text{HTR} = \text{H}$)?*

### Integrante 4: Presión Ofensiva mediante Tiros de Esquina
* **Variables:** `FTR` (dependiente) $\leftarrow$ `HC`, `HS` (condicionantes).
* **Planteamiento Hipergeométrico:** Población $N = \text{HS} + \text{HC}$ (acciones totales de finalización), éxitos $r = \text{HC}$ (tiros de esquina forzados).
* **Pregunta de exposición:** *¿Existe dependencia estadística entre generar asedio ofensivo mediante más de 6 tiros de esquina ($\text{HC} > 6$) y ganar el encuentro ($\text{FTR} = \text{H}$), y cómo varía la probabilidad posterior frente a la previa histórica?*

### Integrante 5: Impacto Disciplinario en la Pérdida de Puntos
* **Variables:** `FTR` (dependiente) $\leftarrow$ `HY`, `HR`, `HF` (condicionantes).
* **Planteamiento Hipergeométrico:** Población $N = \text{HF}$ (faltas cometidas), éxitos $r = \text{HY} + \text{HR}$ (faltas sancionadas con tarjeta).
* **Pregunta de exposición:** *¿Cuánto se incrementa la probabilidad de ceder puntos —empatar o perder— ($\text{FTR} \neq \text{H}$), dado que el equipo local acumula 3 o más tarjetas ($\text{HY} + \text{HR} \ge 3$) durante el partido?*

### Integrante 6: Rendimiento Off-Home (Eficacia como Visitante) y Cierre Predictivo
* **Variables:** `FTR` (dependiente) $\leftarrow$ `AST`, `AS` (condicionantes) + Evaluación del Modelo Predictivo.
* **Planteamiento Hipergeométrico:** Población $N = \text{AS}$ (tiros totales de visitante), éxitos $r = \text{AST}$ (tiros a puerta fuera de casa).
* **Pregunta de exposición:** *¿Cómo cambia la probabilidad de ganar en condición de visitante ($\text{FTR} = \text{A}$) al superar los 4 tiros a puerta ($\text{AST} > 4$) frente al factor localía, y qué precisión alcanza el modelo predictivo al clasificar futuros enfrentamientos a partir del historial extraído?*