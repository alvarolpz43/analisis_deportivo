# 🎤 GUION DE SUSTENTACIÓN — JOSÉ LUIS MARTÍNEZ (LUIS)
## Proyecto Integrador: Ciencia de Datos & Estadística Inferencial — LaLiga (2016–2026)
### Institución Universitaria Colegio Mayor del Cauca — Facultad de Ingeniería

---

## 📌 FICHA TÉCNICA DEL EXPOSITOR
* **Expositor:** José Luis Martínez ("Luis")
* **Rol:** Apertura Institucional, Web Scraping Ético (`robots.txt`), Limpieza de Datos, Tratamiento de Outliers y Demostración en Cuaderno Colab
* **Bloque:** Bloque 1 — Ciencia de Datos, Web Scraping y Machine Learning
* **Asignaturas y Docentes a Cargo:**
  - *Electiva III: Introducción a la Ciencia de Datos* — **Docente:** Carlos E. Ruiz
  - *Estadística Inferencial* — **Docente:** Edith Janeth Potosí Estrada
* **Tiempo Asignado:** `00:00 – 02:30` (Exactamente 2 minutos y 30 segundos)

---

## 🧠 CIFRAS ANCLA (GRÁBALAS EN TU MEMORIA)
> Memoriza estos 6 datos. Si te pones nervioso, apóyate en ellos:
> 1. **10 temporadas** completas (`2016/17` a `2025/26`).
> 2. **3.800 partidos oficiales** analizados.
> 3. **31 clubes** de Primera División.
> 4. **21 variables físico-deportivas limpias** (sin cuotas comerciales de apuestas).
> 5. **0 valores nulos** y **0 duplicados** (*zero data leakage*, orden cronológico).
> 6. **43 goleadas (≥ 7 goles)**: *Outliers conservados metodológicamente*.
> 7. **`robots.txt`**: Verificación con `RobotFileParser` de Python con directiva `Allow: /`.

---

## ⏱️ CRONOMETRAJE Y ACCIONES EN VIVO

| Minuto | ¿Qué tienes en pantalla? | ¿Qué acción física o en el software realizas? | Objetivo del tramo |
| :---: | :--- | :--- | :--- |
| `00:00 - 00:30` | Pestaña **Visión General** (Cabecera del Dashboard) | Mirada al frente, saludo formal a los dos docentes con voz firme. | Fijar presencia institucional y presentar la estructura de 2 bloques. |
| `00:30 - 01:15` | Pestaña **Cuaderno Colab (`LaLigaScrap.ipynb`)** | Clic en la pestaña, bajas suavemente al primer bloque de código (`robots.txt`). Señalas con el cursor o el dedo. | Demostrar Web Scraping ético y legal en vivo con código Python. |
| `01:15 - 01:50` | Pestaña **Web Scraping & Auditoría** o Tarjeta Resumen | Muestras las métricas del dataset maestro (3.800 filas, 21 columnas, 0 nulos). | Demostrar rigor en limpieza de datos y reducción de dimensionalidad. |
| `01:50 - 02:20` | Misma pestaña (Sección de Outliers / Goleadas) | Haces énfasis verbal con las manos. Explicas por qué **NO** se borraron las goleadas. | Demostrar criterio de ingeniería de datos avanzado (varianza real). |
| `02:20 - 02:30` | Pestaña **Visión General** | Miras a Rubén y le cedes la palabra con seguridad. | Transición limpia y sin vacilaciones. |

---

## 🎙️ GUION PASO A PASO CON INDICACIONES EN VIVO

---

### [FASE 1: 00:00 – 00:30] — APERTURA INSTITUCIONAL Y ENCUADRE
🖥️ **En pantalla:** Pestaña **Visión General** (debe verse el título grande de la plataforma y los nombres de los 6 integrantes).  
👀 **Indicación física:** De pie, postura recta, hombros relajados. Haz contacto visual directo primero con el profesor Carlos Ruiz y luego con la profesora Edith Potosí. No mires la pantalla todavía.

🗣️ **DI EXACTAMENTE ESTO:**
> *"Buenos días, estimado docente Carlos Eduardo Ruiz, estimada docente Edith Janeth Potosí Estrada y compañeros.*
>
> *Nosotros somos estudiantes de Ingeniería Informática de la Institución Universitaria Colegio Mayor del Cauca, y hoy tenemos el honor de sustentar nuestro proyecto integrador que articula las cátedras de **Electiva III: Ciencia de Datos** y **Estadística Inferencial**, aplicado sobre el fútbol profesional de la Primera División de España: LaLiga.*
>
> *(Gesto con la mano indicando la división del equipo)*
>
> *Para que la sustentación sea dinámica y rigurosa, hemos estructurado al equipo en dos bloques complementarios: en esta primera mitad, mis compañeros Rubén Velasco, Aldair Torres y yo presentaremos el pipeline completo de **Ciencia de Datos, Web Scraping Ético y Machine Learning**; y en la segunda mitad, Álvaro López, Cristian Narváez y Sebastián Mosquera sustentarán el **Modelado Estadístico Inferencial y Bayesiano**."*

---

### [FASE 2: 00:30 – 01:15] — DEMOSTRACIÓN DE WEB SCRAPING ÉTICO EN VIVO
🖥️ **En pantalla:** 🖱️ **Haz clic en la pestaña "Cuaderno Colab" (`LaLigaScrap.ipynb`)** o en **"Web Scraping & Auditoría"**.  
👉 **Indicación física:** Desplaza la vista hasta la celda de Python donde aparece `RobotFileParser`. Con el cursor del mouse (o señalando al proyector), rodea esa sección de código.

🗣️ **DI EXACTAMENTE ESTO:**
> *(Señalando el código en pantalla)*  
> *"Iniciando con la fase de adquisición de datos —como pueden observar directamente en vivo dentro de nuestro Cuaderno Colab ejecutable en la plataforma—, nuestro punto de partida no fue descargar archivos arbitrariamente, sino garantizar un **Web Scraping Ético, Responsable y Transparente**.*
>
> *(Haces énfasis en el nombre técnico)*  
> *Para ello, auditamos programáticamente el archivo `robots.txt` del repositorio de datos Football-Data.co.uk utilizando la clase `RobotFileParser` de Python. Al comprobar que el servidor emite una directiva explícita de `Allow: /`, certificamos que la extracción de datos cuenta con autorización legal y cumple con los estándares éticos de la Ciencia de Datos."*

---

### [FASE 3: 01:15 – 01:50] — VOLUMEN, LIMPIEZA Y ZERO DATA LEAKAGE
🖥️ **En pantalla:** 🖱️ **Baja a la tarjeta o tabla de "Resumen del Dataset Maestro"** (donde se aprecian las 10 temporadas, 3.800 partidos y las 21 columnas).  
👉 **Indicación física:** Señala los números `3.800` y `21`. Habla con ritmo pausado y claro al mencionar las cifras.

🗣️ **DI EXACTAMENTE ESTO:**
> *"Con esta vía ética consolidamos un registro histórico de **10 temporadas consecutivas completas**, desde la 2016/17 hasta la actual 2025/26, alcanzando un universo de **3.800 partidos oficiales** disputados por **31 clubes**.*
>
> *En la etapa de depuración aplicamos **reducción de dimensionalidad**: eliminamos de raíz todas las cuotas comerciales de casas de apuestas para evitar sesgos de mercado, y conservamos únicamente **21 variables físico-deportivas puras**.*
>
> *Garantizamos un dataset con **cero valores nulos** y **cero registros duplicados**, estructurado en estricto orden cronológico por fecha para asegurar el principio de **Zero Data Leakage** o cero fuga de datos hacia nuestros modelos predictivos posteriores."*

---

### [FASE 4: 01:50 – 02:20] — EL CRITERIO CLAVE DE INGENIERÍA: MANEJO DE OUTLIERS
🖥️ **En pantalla:** Quédate en la sección de estadísticas descriptivas o muestra la sección de goles atípicos.  
👀 **Indicación física:** Mira fijamente al profesor de Ciencia de Datos (Carlos Ruiz). Este punto demuestra tu criterio metodológico superior.

🗣️ **DI EXACTAMENTE ESTO:**
> *"Un aspecto crítico de nuestro análisis fue el tratamiento de los **valores atípicos u outliers**. Al auditar la distribución de goles, identificamos exactamente **43 partidos con marcadores extremos de 7 o más goles** —como partidos atípicos de 6 a 2 o incluso un 8 a 2—.*
>
> *(Voz reflexiva y con seguridad)*  
> *La decisión estándar de un análisis superficial sería eliminar o recortar estos outliers; sin embargo, en ingeniería de datos deportivos decidimos **conservarlos intactos**. En el fútbol, una goleada no es un error de sensor ni una falla instrumental: es un evento atlético real originado por expulsiones, superioridad táctica o desfondamiento físico.*
>
> *Eliminar estas filas mutilaría la varianza real del deporte y sesgaría tanto la desviación estándar como las probabilidades de marcadores abultados en el modelado inferencial."*

---

### [FASE 5: 02:20 – 02:30] — TRANSICIÓN PERFECTA Y PASE A RUBÉN
🖥️ **En pantalla:** 🖱️ **Vuelve a dar clic en la pestaña "Visión General"** para dejarle la pantalla lista a Rubén con las tarjetas de las 3 preguntas.  
👉 **Indicación física:** Gira el torso hacia tu compañero Rubén Darío Velasco, extiéndele la mano amablemente e indícale la palabra.

🗣️ **DI EXACTAMENTE ESTO:**
> *"Habiendo dejado esta base de datos auditada, limpia y metodológicamente validada, le cedo la palabra a mi compañero **Rubén Darío Velasco**, quien presentará el análisis descriptivo y las respuestas a las tres preguntas formuladas por la cátedra."*

---

## 🛡️ ESCUDO DE DEFENSA: CÓMO RESPONDER SI LOS PROFESORES TE INTERRUMPEN

### 1. Si el profesor Carlos Ruiz (Ciencia de Datos) te pregunta:
> **Pregunta:** *«¿Por qué dicen que tienen 0 nulos en vez de haber usado métodos de imputación por KNN o media?»*  
> **Tu respuesta pro:**  
> *"Profesor Carlos, porque la auditoría del archivo CSV descargado de Football-Data contenía la totalidad de los datos reglamentarios de los árbitros para los 3.800 encuentros. En lugar de imputar e inventar datos artificiales con modelos sintéticos, validamos que la fuente primaria era completa en sus 21 variables, preservando la máxima fidelidad empírica."*

### 2. Si la profesora Edith Potosí (Estadística Inferencial) te pregunta:
> **Pregunta:** *«¿Por qué el archivo robots.txt tiene relevancia en un proyecto de estadística?»*  
> **Tu respuesta pro:**  
> *"Profesora Edith, porque la validez de la inferencia estadística depende de la calidad y legitimidad del muestreo. Si los datos se obtienen vulnerando las políticas del servidor o capturando datos incompletos mediante bloqueos de IP, la muestra queda sesgada. `robots.txt` garantiza que la población de 3.800 partidos es reproducible, legal y estadísticamente representativa."*

### 3. Si te preguntan:
> **Pregunta:** *«¿Qué variables eliminaron y por qué?»*  
> **Tu respuesta pro:**  
> *"Eliminamos más de 40 columnas correspondientes a cuotas de casas de apuestas (Bet365, William Hill, etc.). Las eliminamos porque las cuotas no reflejan rendimiento físico ni deportivo, sino márgenes comerciales de ganancia de las casas de apuestas. Dejamos solo variables físicas: goles, remates totales, remates al arco, faltas, córners y tarjetas."*

---

## 🚀 CHECKLIST ANTES DE EMPEZAR TU PRESENTACIÓN:
- [ ] Tener el proyecto abierto en el navegador (`http://127.0.0.1:8000`).
- [ ] Tener lista la pestaña de **Visión General**.
- [ ] Saber dónde hacer clic para ir al **Cuaderno Colab** o a **Web Scraping & Auditoría**.
- [ ] Cronómetro mental: no acelerar el habla; 2 minutos y 30 segundos es tiempo suficiente si mantienes un ritmo pausado.
