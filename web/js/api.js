/**
 * Cliente de Conexión con la API RESTful de FastAPI
 */
const API_BASE = ''; // Rutas relativas para consumo directo del servidor

const SportsAPI = {
  async getSummary() {
    const res = await fetch(`${API_BASE}/api/summary`);
    if (!res.ok) throw new Error('Error al cargar resumen estadístico');
    return await res.json();
  },

  async getTeams() {
    const res = await fetch(`${API_BASE}/api/teams`);
    if (!res.ok) throw new Error('Error al cargar lista de equipos');
    return await res.json();
  },

  async getMember(memberId) {
    const res = await fetch(`${API_BASE}/api/member/${memberId}`);
    if (!res.ok) throw new Error(`Error al cargar datos del integrante ${memberId}`);
    return await res.json();
  },

  async calculateHypergeometric(N, r, n, x) {
    const params = new URLSearchParams({ N, r, n, x });
    const res = await fetch(`${API_BASE}/api/hypergeometric/calculate?${params.toString()}`);
    if (!res.ok) throw new Error('Error al calcular distribución hipergeométrica');
    return await res.json();
  },

  async predictMatch(homeTeam, awayTeam, bayesianCondition = null, simulationMode = 'recent') {
    const res = await fetch(`${API_BASE}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        home_team: homeTeam,
        away_team: awayTeam,
        bayesian_condition: bayesianCondition,
        simulation_mode: simulationMode
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error en la predicción del partido');
    }
    return await res.json();
  },

  async getModelMetrics() {
    const res = await fetch(`${API_BASE}/api/model/metrics`);
    if (!res.ok) throw new Error('Error al obtener métricas del modelo');
    return await res.json();
  },

  async getScraperStatus() {
    const res = await fetch(`${API_BASE}/api/scraper/status`);
    if (!res.ok) throw new Error('Error al consultar estado del scraper');
    return await res.json();
  },

  async calculateBinomial(n, p, k) {
    const params = new URLSearchParams({ n, p, k });
    const res = await fetch(`${API_BASE}/api/binomial/calculate?${params.toString()}`);
    if (!res.ok) throw new Error('Error al calcular distribución binomial');
    return await res.json();
  },

  async getDescriptiveQuestions() {
    const res = await fetch(`${API_BASE}/api/descriptive/questions`);
    if (!res.ok) throw new Error('Error al cargar análisis descriptivo');
    return await res.json();
  },

  async getReliabilityMetrics() {
    const res = await fetch(`${API_BASE}/api/reliability`);
    if (!res.ok) throw new Error('Error al cargar métricas de confiabilidad');
    return await res.json();
  },

  async simulateTournament(simulations = 200, mode = 'recent') {
    const res = await fetch(`${API_BASE}/api/tournament/simulate?simulations=${simulations}&mode=${mode}`);
    if (!res.ok) throw new Error('Error al simular temporada');
    return await res.json();
  },

  async getMatches(page = 1, pageSize = 20, team = '', season = '') {
    const params = new URLSearchParams({ page, page_size: pageSize });
    if (team) params.append('team', team);
    if (season) params.append('season', season);
    const res = await fetch(`${API_BASE}/api/matches?${params.toString()}`);
    if (!res.ok) throw new Error('Error al cargar registros de partidos');
    return await res.json();
  },

  async getRadarComparison(team1 = 'Real Madrid', team2 = 'Barcelona') {
    const params = new URLSearchParams({ team1, team2 });
    const res = await fetch(`${API_BASE}/api/teams/radar?${params.toString()}`);
    if (!res.ok) throw new Error('Error al cargar radar comparativo');
    return await res.json();
  },

  async getNotebook() {
    const res = await fetch(`${API_BASE}/api/notebook`);
    if (!res.ok) throw new Error('Error al cargar el cuaderno Colab');
    return await res.json();
  },

  async executeNotebookCell(cellIndex, code = null) {
    const res = await fetch(`${API_BASE}/api/notebook/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cell_index: cellIndex, code })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al ejecutar celda del cuaderno');
    }
    return await res.json();
  },

  async executeAllNotebook() {
    const res = await fetch(`${API_BASE}/api/notebook/execute-all`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Error al ejecutar todas las celdas del cuaderno');
    return await res.json();
  },

  async resetNotebookKernel() {
    const res = await fetch(`${API_BASE}/api/notebook/reset`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Error al reiniciar el entorno del cuaderno');
    return await res.json();
  }
};

window.SportsAPI = SportsAPI;

