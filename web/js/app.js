/**
 * Controlador Principal de la Aplicación Web
 */
let currentMemberId = 1;
let currentMatchesPage = 1;
let globalSummary = null;
let globalTeams = [];

// =======================================================
// Gestor de Listas y Selectores Personalizados (Custom Select UI)
// =======================================================
const CustomSelectManager = {
  instances: new Map(),

  init(selectEl, { searchable = false, placeholder = 'Seleccionar...' } = {}) {
    if (!selectEl) return;
    if (this.instances.has(selectEl)) {
      this.update(selectEl);
      return;
    }

    // Envolver el select nativo
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper hidden-select';
    selectEl.parentNode.insertBefore(wrapper, selectEl);
    wrapper.appendChild(selectEl);

    // Botón gatillo visible
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    const triggerLabel = document.createElement('span');
    triggerLabel.className = 'trigger-label';

    const arrowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrowSvg.setAttribute('class', 'ui-icon arrow-icon');
    arrowSvg.setAttribute('width', '16');
    arrowSvg.setAttribute('height', '16');
    arrowSvg.setAttribute('viewBox', '0 0 24 24');
    arrowSvg.setAttribute('fill', 'none');
    arrowSvg.setAttribute('stroke', 'currentColor');
    arrowSvg.setAttribute('stroke-width', '2');
    arrowSvg.setAttribute('stroke-linecap', 'round');
    arrowSvg.setAttribute('stroke-linejoin', 'round');
    arrowSvg.innerHTML = '<path d="m6 9 6 6 6-6"/>';

    trigger.appendChild(triggerLabel);
    trigger.appendChild(arrowSvg);
    wrapper.appendChild(trigger);

    // Menú desplegable flotante
    const dropdown = document.createElement('div');
    dropdown.className = 'custom-select-dropdown';
    dropdown.setAttribute('role', 'listbox');

    let searchInput = null;
    if (searchable) {
      const searchBox = document.createElement('div');
      searchBox.className = 'custom-select-search-box';
      searchBox.innerHTML = `
        <svg class="ui-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
      `;
      searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = 'Buscar...';
      searchBox.appendChild(searchInput);
      dropdown.appendChild(searchBox);

      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const optionsList = optionsContainer.querySelectorAll('.custom-select-option');
        optionsList.forEach(opt => {
          const text = opt.textContent.toLowerCase();
          opt.style.display = text.includes(query) ? 'flex' : 'none';
        });
      });
    }

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-select-options';
    dropdown.appendChild(optionsContainer);
    wrapper.appendChild(dropdown);

    // Evento de apertura/cierre
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('open');
      CustomSelectManager.closeAll();
      if (!isOpen) {
        wrapper.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
          const optionsList = optionsContainer.querySelectorAll('.custom-select-option');
          optionsList.forEach(opt => opt.style.display = 'flex');
        }
      }
    });

    const instanceData = {
      wrapper,
      trigger,
      triggerLabel,
      dropdown,
      optionsContainer,
      searchInput,
      selectEl
    };
    this.instances.set(selectEl, instanceData);
    this.update(selectEl);
  },

  update(selectEl) {
    const inst = this.instances.get(selectEl);
    if (!inst) return;

    const { triggerLabel, optionsContainer, selectEl: sel } = inst;
    const selectedOpt = sel.options[sel.selectedIndex] || sel.options[0];

    // Mostrar escudo si la opción seleccionada es un club
    if (selectedOpt && window.TEAM_LOGOS && window.TEAM_LOGOS[selectedOpt.value]) {
      triggerLabel.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
          <img class="custom-select-logo" src="${window.TEAM_LOGOS[selectedOpt.value]}" alt="">
          <span>${selectedOpt.textContent}</span>
        </span>
      `;
    } else {
      triggerLabel.textContent = selectedOpt ? selectedOpt.textContent : 'Seleccionar...';
    }

    optionsContainer.innerHTML = '';
    Array.from(sel.options).forEach(opt => {
      const item = document.createElement('div');
      item.className = 'custom-select-option';
      if (opt.value === sel.value) item.classList.add('selected');
      if (opt.disabled) item.classList.add('disabled');
      item.dataset.value = opt.value;

      let badgeHtml = '';
      if (window.TEAM_LOGOS && window.TEAM_LOGOS[opt.value]) {
        badgeHtml = `<img class="custom-select-logo" src="${window.TEAM_LOGOS[opt.value]}" alt="">`;
      }

      item.innerHTML = `
        <span class="option-text" style="display: inline-flex; align-items: center; gap: 0.5rem;">
          ${badgeHtml}
          <span>${opt.textContent}</span>
        </span>
        <svg class="ui-icon option-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (opt.disabled) return;
        sel.value = opt.value;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        this.update(sel);
        CustomSelectManager.closeAll();
      });

      optionsContainer.appendChild(item);
    });
  },

  closeAll() {
    document.querySelectorAll('.custom-select-wrapper.open').forEach(w => {
      w.classList.remove('open');
      const trigger = w.querySelector('.custom-select-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }
};

// Cerrar listas al hacer clic fuera o con Escape
document.addEventListener('click', () => {
  CustomSelectManager.closeAll();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') CustomSelectManager.closeAll();
});

document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupAcademicModal();
  setupAcademicPDFModal();
  setupMemberTabs();
  setupHyperControls();
  setupBinomialControls();
  setupPoissonControls();
  setupNormalControls();
  setupPredictor();
  setupTournamentSimulator();
  setupAuditor();
  setupEquationsTab();
  setupAssistantNLQ();
  await loadInitialData();
  updateRadarComparison();
});

// 1. Navegación por Pestañas
function setupNavigation() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.dataset.target;
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      // Re-renderizar gráficos si es necesario al cambiar pestaña
      if (targetId === 'tab-overview') {
        loadOverviewCharts();
        loadReliabilityMetrics();
        loadDescriptiveAnalysis();
      }
      if (targetId === 'tab-inferential') {
        loadMemberData(currentMemberId);
        calculateAndRenderBinomial();
        calculateAndRenderPoisson();
        calculateAndRenderNormal();
      }
      if (targetId === 'tab-ml') {
        loadMLMetrics();
        updateRadarComparison();
      }
      if (targetId === 'tab-auditor') loadAuditorTable();
      if (targetId === 'tab-equations') renderEquationsMath();
    });
  });
}

// 2. Carga Inicial de Datos Globales
async function loadInitialData() {
  try {
    globalSummary = await SportsAPI.getSummary();
    const teamsData = await SportsAPI.getTeams();
    globalTeams = teamsData.teams;

    // Actualizar Header
    document.getElementById('header-total-matches').textContent = globalSummary.total_matches.toLocaleString();
    document.getElementById('header-teams-count').textContent = globalSummary.num_teams;

    // Actualizar KPIs de Resumen
    document.getElementById('kpi-total-matches').textContent = globalSummary.total_matches.toLocaleString();
    document.getElementById('kpi-home-wins').textContent = `${globalSummary.pct_home_wins}%`;
    document.getElementById('kpi-home-wins-sub').textContent = `${globalSummary.home_wins.toLocaleString()} victorias`;
    document.getElementById('kpi-draws').textContent = `${globalSummary.pct_draws}%`;
    document.getElementById('kpi-draws-sub').textContent = `${globalSummary.draws.toLocaleString()} empates`;
    document.getElementById('kpi-away-wins').textContent = `${globalSummary.pct_away_wins}%`;
    document.getElementById('kpi-away-wins-sub').textContent = `${globalSummary.away_wins.toLocaleString()} victorias`;
    document.getElementById('kpi-goals').textContent = globalSummary.avg_goals_per_match;
    document.getElementById('kpi-goals-sub').textContent = `${globalSummary.total_goals.toLocaleString()} goles totales`;
    document.getElementById('kpi-cards').textContent = (globalSummary.total_yellow_cards + globalSummary.total_red_cards).toLocaleString();
    document.getElementById('kpi-cards-sub').textContent = `${globalSummary.total_yellow_cards} amarillas / ${globalSummary.total_red_cards} rojas`;

    // Cargar gráficos de la pestaña 1
    loadOverviewCharts();

    // Cargar análisis descriptivo de Ciencia de Datos (3 Preguntas)
    await loadDescriptiveAnalysis();

    // Cargar métricas de confiabilidad (s y prueba de hipótesis bilateral)
    await loadReliabilityMetrics();

    // Cargar primer integrante
    await loadMemberData(1);

    // Cargar simulación binomial, poisson y normal iniciales
    await calculateAndRenderBinomial();
    await calculateAndRenderPoisson();
    await calculateAndRenderNormal();

    // Cargar selectores de equipos en el Predictor
    populateTeamSelectors();

  } catch (err) {
    console.error('Error al inicializar la aplicación:', err);
  }
}

async function loadDescriptiveAnalysis() {
  try {
    const data = await SportsAPI.getDescriptiveQuestions();
    ChartManager.renderDescriptiveQ1Chart('chart-descriptive-q1', data.pregunta_1_localia);
    ChartManager.renderDescriptiveQ3Chart('chart-descriptive-q3', data.pregunta_3_evolucion);
  } catch (err) {
    console.error('Error al cargar análisis descriptivo:', err);
  }
}

function loadOverviewCharts() {
  if (!globalSummary) return;
  ChartManager.renderOutcomeDonut(
    'chart-outcome-donut',
    globalSummary.home_wins,
    globalSummary.draws,
    globalSummary.away_wins
  );
  ChartManager.renderSeasonsBar(
    'chart-seasons-bar',
    globalSummary.seasons,
    globalSummary.matches_per_season
  );
}

// Modal Académico Institucional
function setupAcademicModal() {
  const modal = document.getElementById('academic-modal');
  const btnOpen = document.getElementById('btn-open-academic-modal');
  const btnClose = document.getElementById('btn-close-academic-modal');

  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => modal.classList.add('active'));
  }
  if (btnClose && modal) {
    btnClose.addEventListener('click', () => modal.classList.remove('active'));
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        modal.classList.remove('active');
      }
    });
  }
}

// Carga de Confiabilidad y Desviación Estándar
async function loadReliabilityMetrics() {
  try {
    const data = await SportsAPI.getReliabilityMetrics();
    const disp = data.dispersion_metrics;
    const test = data.hypothesis_test;

    const elStdH = document.getElementById('rel-std-home-goals');
    const elMeanH = document.getElementById('rel-mean-home-goals');
    const elStdA = document.getElementById('rel-std-away-goals');
    const elMeanA = document.getElementById('rel-mean-away-goals');
    const elZ = document.getElementById('rel-z-stat');
    const elGap = document.getElementById('rel-advantage-gap');
    const elBox = document.getElementById('rel-conclusion-box');

    if (elStdH) elStdH.textContent = disp.std_fthg.toFixed(2);
    if (elMeanH) elMeanH.textContent = `Media: ${disp.mean_fthg} goles/partido`;
    if (elStdA) elStdA.textContent = disp.std_ftag.toFixed(2);
    if (elMeanA) elMeanA.textContent = `Media: ${disp.mean_ftag} goles/partido`;
    if (elZ) elZ.textContent = test.z_statistic;
    if (elGap) elGap.textContent = `+${test.home_advantage_gap_pct}%`;
    if (elBox) {
      elBox.innerHTML = `<strong>Dictamen de Confiabilidad:</strong> Las desviaciones estándar de goles (s = ${disp.std_fthg} en casa y s = ${disp.std_ftag} fuera) evidencian baja dispersión e idoneidad muestral. La prueba bilateral arroja Z = ${test.z_statistic} (${test.decision}), validando que el factor localía es un fenómeno estructural no atribuible al azar.`;
    }
  } catch (err) {
    console.error('Error al cargar métricas de confiabilidad:', err);
  }
}

// Controles y Cálculo Binomial Interactivo
function setupBinomialControls() {
  const nSlider = document.getElementById('slider-binom-n');
  const pSlider = document.getElementById('slider-binom-p');
  const kSlider = document.getElementById('slider-binom-k');

  if (nSlider && pSlider && kSlider) {
    [nSlider, pSlider, kSlider].forEach(slider => {
      slider.addEventListener('input', () => {
        const n = parseInt(nSlider.value);
        kSlider.max = n;
        if (parseInt(kSlider.value) > n) kSlider.value = n;

        document.getElementById('val-slider-binom-n').textContent = nSlider.value;
        document.getElementById('val-slider-binom-p').textContent = (parseInt(pSlider.value) / 100).toFixed(2);
        document.getElementById('val-slider-binom-k').textContent = kSlider.value;

        calculateAndRenderBinomial();
      });
    });
  }
}

async function calculateAndRenderBinomial() {
  const nEl = document.getElementById('slider-binom-n');
  const pEl = document.getElementById('slider-binom-p');
  const kEl = document.getElementById('slider-binom-k');
  if (!nEl || !pEl || !kEl) return;

  const n = parseInt(nEl.value);
  const p = parseFloat(pEl.value) / 100.0;
  const k = parseInt(kEl.value);

  try {
    const res = await SportsAPI.calculateBinomial(n, p, k);
    document.getElementById('binom-exact').textContent = `${(res.pmf_exact * 100).toFixed(1)}%`;
    document.getElementById('binom-cdf').textContent = `${(res.cdf_leq * 100).toFixed(1)}%`;
    document.getElementById('binom-sf').textContent = `${(res.sf_geq * 100).toFixed(1)}%`;
    document.getElementById('binom-exp').textContent = res.expected_value.toFixed(2);
    document.getElementById('binom-std').textContent = res.std_dev.toFixed(2);

    ChartManager.renderBinomialChart('chart-binom-pmf', res.k_values, res.pmf_values, res.k);
  } catch (err) {
    console.error('Error al calcular distribución binomial:', err);
  }
}

// Controles y Cálculo Poisson Interactivo (Larson & Farber Cap. 4)
function setupPoissonControls() {
  const muSlider = document.getElementById('slider-poisson-mu');
  const xSlider = document.getElementById('slider-poisson-x');

  if (muSlider && xSlider) {
    [muSlider, xSlider].forEach(slider => {
      slider.addEventListener('input', () => {
        const mu = (parseInt(muSlider.value) / 100).toFixed(2);
        const x = xSlider.value;
        document.getElementById('val-slider-poisson-mu').textContent = mu;
        document.getElementById('val-slider-poisson-x').textContent = x;
        calculateAndRenderPoisson();
      });
    });
  }
}

async function calculateAndRenderPoisson() {
  const muEl = document.getElementById('slider-poisson-mu');
  const xEl = document.getElementById('slider-poisson-x');
  if (!muEl || !xEl) return;

  const mu = parseFloat(muEl.value) / 100.0;
  const x = parseInt(xEl.value);

  try {
    const res = await SportsAPI.calculatePoisson(mu, x);
    document.getElementById('poisson-exact').textContent = `${(res.pmf_exact * 100).toFixed(1)}%`;
    document.getElementById('poisson-cdf').textContent = `${(res.cdf_leq * 100).toFixed(1)}%`;
    document.getElementById('poisson-sf').textContent = `${(res.sf_geq * 100).toFixed(1)}%`;
    document.getElementById('poisson-var').textContent = res.variance.toFixed(2);
    document.getElementById('poisson-std').textContent = res.std_dev.toFixed(2);
    document.getElementById('poisson-usual-bounds').textContent = `[${res.usual_range.min}, ${res.usual_range.max}]`;

    const badge = document.getElementById('poisson-usual-badge');
    if (badge) {
      if (res.is_usual) {
        badge.className = 'badge-usual';
        badge.innerHTML = `
          <svg class="ui-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Evento Estadísticamente Usual (Dentro de μ ± 2σ)</span>
        `;
      } else {
        badge.className = 'badge-unusual';
        badge.innerHTML = `
          <svg class="ui-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          <span>Evento Poco Común / Inusual (P &lt; 0.05, fuera de μ ± 2σ)</span>
        `;
      }
    }

    ChartManager.renderPoissonChart('chart-poisson-pmf', res.k_values, res.pmf_values, res.x);
  } catch (err) {
    console.error('Error al calcular distribución de Poisson:', err);
  }
}

// Controles y Cálculo Normal Interactivo (Larson & Farber Cap. 7)
function setupNormalControls() {
  const xSlider = document.getElementById('slider-normal-x');
  const muSlider = document.getElementById('slider-normal-mu');
  const stdSlider = document.getElementById('slider-normal-std');

  if (xSlider && muSlider && stdSlider) {
    [xSlider, muSlider, stdSlider].forEach(slider => {
      slider.addEventListener('input', () => {
        document.getElementById('val-slider-normal-x').textContent = xSlider.value;
        document.getElementById('val-slider-normal-mu').textContent = muSlider.value;
        document.getElementById('val-slider-normal-std').textContent = stdSlider.value;
        calculateAndRenderNormal();
      });
    });
  }
}

async function calculateAndRenderNormal() {
  const xEl = document.getElementById('slider-normal-x');
  const muEl = document.getElementById('slider-normal-mu');
  const stdEl = document.getElementById('slider-normal-std');
  if (!xEl || !muEl || !stdEl) return;

  const x = parseFloat(xEl.value);
  const mu = parseFloat(muEl.value);
  const std = parseFloat(stdEl.value);

  try {
    const res = await SportsAPI.calculateNormal(x, mu, std);
    document.getElementById('normal-z-val').textContent = res.z_score >= 0 ? `+${res.z_score}` : `${res.z_score}`;
    document.getElementById('normal-z-interp').textContent = res.interpretation;
    document.getElementById('normal-emp-68').textContent = `[${res.empirical_rule['68_percent'].min}, ${res.empirical_rule['68_percent'].max}]`;
    document.getElementById('normal-emp-95').textContent = `[${res.empirical_rule['95_percent'].min}, ${res.empirical_rule['95_percent'].max}]`;
    document.getElementById('normal-emp-99').textContent = `[${res.empirical_rule['99_7_percent'].min}, ${res.empirical_rule['99_7_percent'].max}]`;

    document.getElementById('normal-case-1').textContent = `${(res.areas.case_1_left * 100).toFixed(1)}%`;
    document.getElementById('normal-case-2').textContent = `${(res.areas.case_2_right * 100).toFixed(1)}%`;
    document.getElementById('normal-case-3').textContent = `${(res.areas.case_3_between * 100).toFixed(1)}%`;
    document.getElementById('normal-case-4').textContent = `${(res.areas.case_4_tails * 100).toFixed(1)}%`;

    ChartManager.renderNormalChart('chart-normal-pdf', res.x_values, res.pdf_values, res.value, res.mean);
  } catch (err) {
    console.error('Error al calcular distribución normal:', err);
  }
}

// Simulador de Torneo y Proyección de Campeón
function setupTournamentSimulator() {
  const btn = document.getElementById('btn-run-tournament-sim');
  if (!btn) return;

  const modeSelect = document.getElementById('select-tournament-mode');
  if (modeSelect) {
    modeSelect.addEventListener('change', () => {
      const mode = modeSelect.value;
      const methText = document.getElementById('tournament-methodology-text');
      if (methText) {
        if (mode === 'historical') {
          methText.innerHTML = `
            <strong>Modo Registro Histórico (10 Temporadas / 3.800 Partidos):</strong> Proyecta cada uno de los 380 partidos del calendario oficial utilizando las frecuencias absolutas y parámetros de Poisson derivados de la base de datos histórica consolidada (2016-2026), incluyendo el récord directo mutuo en cada feudo. Cada partido individual otorga <strong>3 puntos por victoria, 1 por empate y 0 por derrota</strong>.
          `;
        } else {
          methText.innerHTML = `
            <strong>Modo Forma Reciente (Modelos ML - 5 Partidos):</strong> Proyecta la temporada utilizando la ventana móvil reciente de 5 partidos para cada club (<code>gf_5, ga_5, hst_5, pts_5</code>), ponderada por los modelos de Regresión Logística y Random Forest combinados con la tasa Poisson. Refleja el momento competitivo contemporáneo de cada club en el campeonato.
          `;
        }
      }
    });
  }

  btn.addEventListener('click', async () => {
    const origHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="ui-icon spinning" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      Simulando 380 Partidos...
    `;

    try {
      const mode = document.getElementById('select-tournament-mode')?.value || 'recent';
      const data = await SportsAPI.simulateTournament(250, mode);
      
      // Actualizar Podio
      if (data.standings && data.standings.length >= 3) {
        const c1 = data.standings[0];
        const c2 = data.standings[1];
        const c3 = data.standings[2];

        const logoH = typeof getTeamLogo === 'function' ? getTeamLogo : (t => `assets/logos/${t.toLowerCase().replace(/ /g, '_')}.png`);

        // Actualizar Showcase Celebratorio de la Copa de Campeón
        const trophyShowcase = document.getElementById('champion-trophy-showcase');
        const champTitleEl = document.getElementById('trophy-champ-name');
        const champMetaEl = document.getElementById('trophy-champ-meta');
        const champLogoEl = document.getElementById('trophy-club-logo');

        if (champTitleEl) champTitleEl.textContent = `${c1.team}`;
        if (champMetaEl) champMetaEl.textContent = `${c1.points} Puntos Esperados • ${c1.goal_diff > 0 ? '+' : ''}${c1.goal_diff} Diferencia de Goles • ${c1.champion_prob}% Probabilidad Monte Carlo`;
        if (champLogoEl) champLogoEl.setAttribute('href', logoH(c1.team));

        if (trophyShowcase) {
          trophyShowcase.classList.remove('celebrating');
          void trophyShowcase.offsetWidth;
          trophyShowcase.classList.add('celebrating');
          trophyShowcase.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Fanfarria triunfal de campeón con Web Audio API
        if (window.StadiumAudio && typeof window.StadiumAudio.playVictoryFanfare === 'function') {
          window.StadiumAudio.playVictoryFanfare();
        }

        document.getElementById('podium-champ-team').innerHTML = `<img class="table-team-logo" src="${logoH(c1.team)}" alt=""> ${c1.team}`;
        document.getElementById('podium-champ-prob').textContent = `${c1.champion_prob}%`;
        document.getElementById('podium-champ-pts').textContent = `${c1.points} Pts Esperados (${c1.goal_diff > 0 ? '+' : ''}${c1.goal_diff} DG)`;

        document.getElementById('podium-2nd-team').innerHTML = `<img class="table-team-logo" src="${logoH(c2.team)}" alt=""> ${c2.team}`;
        document.getElementById('podium-2nd-prob').textContent = `${c2.champion_prob}%`;
        document.getElementById('podium-2nd-pts').textContent = `${c2.points} Pts Esperados`;

        document.getElementById('podium-3rd-team').innerHTML = `<img class="table-team-logo" src="${logoH(c3.team)}" alt=""> ${c3.team}`;
        document.getElementById('podium-3rd-prob').textContent = `${c3.champion_prob}%`;
        document.getElementById('podium-3rd-pts').textContent = `${c3.points} Pts Esperados`;
      }

      // Llenar tabla de posiciones con escudos
      const tbody = document.getElementById('tournament-standings-body');
      tbody.innerHTML = '';
      const getLogo = typeof getTeamLogo === 'function' ? getTeamLogo : (t => `assets/logos/${t.toLowerCase().replace(/ /g, '_')}.png`);
      data.standings.forEach(row => {
        const tr = document.createElement('tr');
        let rankClass = '';
        if (row.rank <= 4) rankClass = 'rank-ucl';
        else if (row.rank >= 18) rankClass = 'rank-rel';

        tr.innerHTML = `
          <td class="rank-cell ${rankClass}"><strong>${row.rank}</strong></td>
          <td>
            <span style="display: inline-flex; align-items: center; gap: 0.35rem;">
              <img class="table-team-logo" src="${getLogo(row.team)}" alt="${row.team}">
              <strong>${row.team}</strong>
            </span>
          </td>
          <td>${row.matches}</td>
          <td><strong style="color: #60a5fa;">${row.points}</strong></td>
          <td>${row.wins}</td>
          <td>${row.draws}</td>
          <td>${row.losses}</td>
          <td>${row.goals_for}</td>
          <td>${row.goals_against}</td>
          <td style="color: ${row.goal_diff >= 0 ? '#34d399' : '#f87171'}; font-weight: 700;">
            ${row.goal_diff > 0 ? '+' : ''}${row.goal_diff}
          </td>
          <td><span class="badge-prob-champ">${row.champion_prob}%</span></td>
          <td><span style="color: #60a5fa; font-weight: 600;">${row.ucl_prob}%</span></td>
          <td><span style="color: ${row.relegation_prob > 20 ? '#ef4444' : 'var(--text-muted)'}; font-weight: 600;">${row.relegation_prob}%</span></td>
        `;
        tbody.appendChild(tr);
      });

    } catch (err) {
      console.error('Error al simular temporada:', err);
      alert('Ocurrió un error al ejecutar la simulación de temporada: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  });
}

// 3. Módulo de Estadística Inferencial (6 Integrantes)
function setupMemberTabs() {
  const memberBtns = document.querySelectorAll('.member-btn');
  memberBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      memberBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMemberId = parseInt(btn.dataset.member);
      loadMemberData(currentMemberId);
    });
  });
}

async function loadMemberData(memberId) {
  try {
    const data = await SportsAPI.getMember(memberId);
    
    // Título y Rol
    document.getElementById('member-title').textContent = data.title;
    document.getElementById('member-role').textContent = data.role;
    document.getElementById('member-variables').textContent = data.variables;
    document.getElementById('member-question').textContent = data.question;
    document.getElementById('member-interpretation').textContent = data.interpretation;

    // Métricas de Bayes
    const b = data.stats.bayes;
    document.getElementById('bayes-prior').textContent = `${(b.prior_P_A * 100).toFixed(1)}%`;
    document.getElementById('bayes-evidence').textContent = `${(b.prob_evidence_P_B * 100).toFixed(1)}%`;
    document.getElementById('bayes-likelihood').textContent = `${(b.likelihood_P_B_given_A * 100).toFixed(1)}%`;
    document.getElementById('bayes-posterior').textContent = `${(b.posterior_P_A_given_B * 100).toFixed(1)}%`;
    document.getElementById('bayes-factor').textContent = `x${b.bayes_factor}`;
    document.getElementById('bayes-ci').textContent = `[${(data.stats.posterior_ci_95.lower * 100).toFixed(1)}% - ${(data.stats.posterior_ci_95.upper * 100).toFixed(1)}%]`;
    
    // Test de Hipótesis y Odds Ratio
    const ht = data.stats.hypothesis_test;
    document.getElementById('stat-chi2').textContent = ht.chi2_stat;
    document.getElementById('stat-pval').textContent = ht.p_value_formatted;
    const or = data.stats.odds_ratio;
    document.getElementById('stat-or').textContent = or.value;
    document.getElementById('stat-or-ci').textContent = `[${or.ci_95_lower} - ${or.ci_95_upper}]`;

    // Gráfico de Bayes
    ChartManager.renderBayesBar('chart-bayes-bar', b.prior_P_A, b.posterior_P_A_given_B);

    // Tabla de Contingencia
    const c = data.stats.contingency_table;
    document.getElementById('ct-event-label').textContent = data.event_label;
    document.getElementById('ct-cond-label').textContent = data.condition_label;
    document.getElementById('ct-a').textContent = c.a_event_and_cond.toLocaleString();
    document.getElementById('ct-b').textContent = c.b_no_event_and_cond.toLocaleString();
    document.getElementById('ct-c').textContent = c.c_event_and_no_cond.toLocaleString();
    document.getElementById('ct-d').textContent = c.d_no_event_and_no_cond.toLocaleString();
    document.getElementById('ct-total-cond').textContent = c.total_condition.toLocaleString();
    document.getElementById('ct-total-nocond').textContent = c.total_no_condition.toLocaleString();
    document.getElementById('ct-total-event').textContent = c.total_event.toLocaleString();
    document.getElementById('ct-total-noevent').textContent = c.total_no_event.toLocaleString();
    document.getElementById('ct-grand-total').textContent = c.total_samples.toLocaleString();

    // Actualizar Controles Hipergeométricos con los valores por defecto del integrante
    const hScenario = data.hypergeometric_scenario;
    document.getElementById('hyper-scenario-desc').textContent = hScenario.description;
    document.getElementById('label-hyper-N').textContent = hScenario.N_label;
    document.getElementById('label-hyper-r').textContent = hScenario.r_label;
    document.getElementById('label-hyper-n').textContent = hScenario.n_label;
    document.getElementById('label-hyper-x').textContent = hScenario.x_label;

    setHyperSlider('slider-N', hScenario.default_N, 1, 40);
    setHyperSlider('slider-r', hScenario.default_r, 0, hScenario.default_N);
    setHyperSlider('slider-n', hScenario.default_n, 1, hScenario.default_N);
    setHyperSlider('slider-x', hScenario.default_x, 0, Math.min(hScenario.default_r, hScenario.default_n));

    // Renderizar gráfico hipergeométrico
    updateHypergeometricResults(hScenario.calc);

  } catch (err) {
    console.error('Error al cargar datos del integrante:', err);
  }
}

// 4. Calculadora Hipergeométrica Interactiva
function setupHyperControls() {
  ['slider-N', 'slider-r', 'slider-n', 'slider-x'].forEach(id => {
    const slider = document.getElementById(id);
    if (slider) {
      slider.addEventListener('input', () => {
        syncHyperSliders();
        calculateAndRenderHyper();
      });
    }
  });
}

function setHyperSlider(id, val, min, max) {
  const el = document.getElementById(id);
  const badge = document.getElementById(`val-${id}`);
  if (el) {
    el.min = min;
    el.max = max;
    el.value = val;
  }
  if (badge) badge.textContent = val;
}

function syncHyperSliders() {
  const N = parseInt(document.getElementById('slider-N').value);
  const rEl = document.getElementById('slider-r');
  const nEl = document.getElementById('slider-n');
  const xEl = document.getElementById('slider-x');

  rEl.max = N;
  if (parseInt(rEl.value) > N) rEl.value = N;

  nEl.max = N;
  if (parseInt(nEl.value) > N) nEl.value = N;

  const r = parseInt(rEl.value);
  const n = parseInt(nEl.value);
  const maxX = Math.min(r, n);
  xEl.max = maxX;
  if (parseInt(xEl.value) > maxX) xEl.value = maxX;

  document.getElementById('val-slider-N').textContent = N;
  document.getElementById('val-slider-r').textContent = r;
  document.getElementById('val-slider-n').textContent = n;
  document.getElementById('val-slider-x').textContent = xEl.value;
}

async function calculateAndRenderHyper() {
  const N = parseInt(document.getElementById('slider-N').value);
  const r = parseInt(document.getElementById('slider-r').value);
  const n = parseInt(document.getElementById('slider-n').value);
  const x = parseInt(document.getElementById('slider-x').value);

  try {
    const calc = await SportsAPI.calculateHypergeometric(N, r, n, x);
    updateHypergeometricResults(calc);
  } catch (err) {
    console.error('Error calculando hipergeométrica:', err);
  }
}

function updateHypergeometricResults(calc) {
  document.getElementById('hyper-exact').textContent = `${(calc.pmf_exact * 100).toFixed(2)}%`;
  document.getElementById('hyper-cdf').textContent = `${(calc.cdf_leq * 100).toFixed(2)}%`;
  document.getElementById('hyper-sf').textContent = `${(calc.sf_geq * 100).toFixed(2)}%`;
  document.getElementById('hyper-mean').textContent = calc.expected_value;
  document.getElementById('hyper-var').textContent = calc.variance;
  document.getElementById('hyper-sd').textContent = calc.std_dev;

  ChartManager.renderHypergeometricChart(
    'chart-hyper-pmf',
    calc.k_values,
    calc.pmf_values,
    calc.x
  );
}

// 5. Predictor Machine Learning & Simulación Histórica
function populateTeamSelectors() {
  const homeSelect = document.getElementById('select-home-team');
  const awaySelect = document.getElementById('select-away-team');
  if (!homeSelect || !awaySelect) return;

  homeSelect.innerHTML = '';
  awaySelect.innerHTML = '';

  globalTeams.forEach(team => {
    const optH = document.createElement('option');
    optH.value = team;
    optH.textContent = team;
    homeSelect.appendChild(optH);

    const optA = document.createElement('option');
    optA.value = team;
    optA.textContent = team;
    awaySelect.appendChild(optA);
  });

  // Equipos por defecto
  homeSelect.value = 'Real Madrid';
  awaySelect.value = 'Barcelona';

  // Sincronizar para evitar selección del mismo equipo
  updateSelectOptionsDisabled(homeSelect, awaySelect);

  // Inicializar Custom Selects con listas estilizadas
  CustomSelectManager.init(homeSelect, { searchable: true, placeholder: 'Seleccionar Local...' });
  CustomSelectManager.init(awaySelect, { searchable: true, placeholder: 'Seleccionar Visitante...' });
  CustomSelectManager.init(document.getElementById('select-simulation-mode'));
  CustomSelectManager.init(document.getElementById('select-bayesian-condition'));
  CustomSelectManager.init(document.getElementById('select-tournament-mode'));

  homeSelect.addEventListener('change', () => {
    if (homeSelect.value === awaySelect.value) {
      // Auto-seleccionar otro equipo para Away
      const altTeam = globalTeams.find(t => t !== homeSelect.value);
      if (altTeam) awaySelect.value = altTeam;
    }
    updateSelectOptionsDisabled(homeSelect, awaySelect);
  });

  awaySelect.addEventListener('change', () => {
    if (awaySelect.value === homeSelect.value) {
      const altTeam = globalTeams.find(t => t !== awaySelect.value);
      if (altTeam) homeSelect.value = altTeam;
    }
    updateSelectOptionsDisabled(homeSelect, awaySelect);
  });

  // Botón para invertir Local y Visitante
  const swapBtn = document.getElementById('btn-swap-teams');
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const temp = homeSelect.value;
      homeSelect.value = awaySelect.value;
      awaySelect.value = temp;
      updateSelectOptionsDisabled(homeSelect, awaySelect);
    });
  }
}

function updateSelectOptionsDisabled(homeSelect, awaySelect) {
  const hVal = homeSelect.value;
  const aVal = awaySelect.value;

  Array.from(homeSelect.options).forEach(opt => {
    opt.disabled = (opt.value === aVal);
  });

  Array.from(awaySelect.options).forEach(opt => {
    opt.disabled = (opt.value === hVal);
  });

  CustomSelectManager.update(homeSelect);
  CustomSelectManager.update(awaySelect);

  // Sincronizar escudos y nombres del marcador en vivo
  const logoFn = typeof getTeamLogo === 'function' ? getTeamLogo : (t => `assets/logos/${t.toLowerCase().replace(/ /g, '_')}.png`);
  const hCrest = document.getElementById('sim-home-crest');
  const aCrest = document.getElementById('sim-away-crest');
  const hName = document.getElementById('sim-home-name');
  const aName = document.getElementById('sim-away-name');
  if (hCrest) hCrest.src = logoFn(hVal);
  if (aCrest) aCrest.src = logoFn(aVal);
  if (hName) hName.textContent = hVal;
  if (aName) aName.textContent = aVal;
}

function setupPredictor() {
  const btn = document.getElementById('btn-run-predict');
  if (btn) {
    btn.addEventListener('click', runPrediction);
  }

  const sHome = document.getElementById('select-home-team');
  const sAway = document.getElementById('select-away-team');
  const btnSwap = document.getElementById('btn-swap-teams');

  if (sHome) sHome.addEventListener('change', updateRadarComparison);
  if (sAway) sAway.addEventListener('change', updateRadarComparison);
  if (btnSwap) btnSwap.addEventListener('click', () => setTimeout(updateRadarComparison, 100));
}

async function updateRadarComparison() {
  const home = document.getElementById('select-home-team')?.value || 'Real Madrid';
  const away = document.getElementById('select-away-team')?.value || 'Barcelona';
  if (home === away) return;
  try {
    const radarData = await SportsAPI.getRadarComparison(home, away);
    ChartManager.renderRadarChart('chart-radar-h2h', radarData);
  } catch (err) {
    console.error('Error al cargar radar comparativo:', err);
  }
}
window.updateRadarComparison = updateRadarComparison;


async function runPrediction() {
  const homeTeam = document.getElementById('select-home-team').value;
  const awayTeam = document.getElementById('select-away-team').value;
  const cond = document.getElementById('select-bayesian-condition').value || null;
  const simMode = document.getElementById('select-simulation-mode').value || 'historical';

  if (homeTeam === awayTeam) {
    alert('Por favor selecciona dos clubes diferentes para el enfrentamiento.');
    return;
  }

  updateRadarComparison();

  const resultContainer = document.getElementById('predict-result-container');
  try {
    // Ocultar resultados previos mientras corre la simulación en vivo
    if (resultContainer) resultContainer.style.display = 'none';

    const pred = await SportsAPI.predictMatch(homeTeam, awayTeam, cond, simMode);

    // Si está disponible el simulador en vivo, iniciar la experiencia visual de 30 segundos
    if (window.LiveMatchSimulator && pred.match_simulation) {
      window.LiveMatchSimulator.start(pred, (finishedPred) => {
        renderPredictionResults(finishedPred || pred);
      });
    } else {
      renderPredictionResults(pred);
    }
  } catch (err) {
    alert(err.message);
  }
}

function renderPredictionResults(pred) {
  const resultContainer = document.getElementById('predict-result-container');
  if (!resultContainer) return;

  resultContainer.style.display = 'block';

  const homeTeam = pred.home_team;
  const awayTeam = pred.away_team;

  // Badge del modo de simulación
  const modeBadge = document.getElementById('badge-sim-mode');
  if (pred.simulation_mode === 'historical') {
    modeBadge.textContent = 'Modo: Histórico 10 Temporadas & Cara a Cara';
    modeBadge.style.background = 'rgba(59, 130, 246, 0.15)';
    modeBadge.style.color = '#60a5fa';
  } else {
    modeBadge.textContent = 'Modo: Forma Reciente (ML 5 Partidos)';
    modeBadge.style.background = 'rgba(16, 185, 129, 0.15)';
    modeBadge.style.color = '#34d399';
  }

  // Marcador Estocástico Simulado (Monte Carlo)
  if (pred.sampled_score) {
    const alertScore = document.getElementById('label-sampled-score');
    const alertProb = document.getElementById('label-sampled-prob');
    if (alertScore) alertScore.textContent = pred.sampled_score.score;
    if (alertProb) alertProb.textContent = `Probabilidad Poisson Bivariada: ${pred.sampled_score.pct}% (Muestreo Estocástico)`;
  }

  // Barra de probabilidades animada con escudos
  const barH = document.getElementById('bar-home');
  const barD = document.getElementById('bar-draw');
  const barA = document.getElementById('bar-away');

  const pH = pred.probabilities.pct_home_win;
  const pD = pred.probabilities.pct_draw;
  const pA = pred.probabilities.pct_away_win;

  const logoFn = typeof getTeamLogo === 'function' ? getTeamLogo : (t => `assets/logos/${t.toLowerCase().replace(/ /g, '_')}.png`);

  barH.style.width = `${pH}%`;
  barH.innerHTML = `<img class="table-team-logo" src="${logoFn(homeTeam)}" alt=""> 1 (${homeTeam}) ${pH}%`;

  barD.style.width = `${pD}%`;
  barD.textContent = `X (Empate) ${pD}%`;

  barA.style.width = `${pA}%`;
  barA.innerHTML = `<img class="table-team-logo" src="${logoFn(awayTeam)}" alt=""> 2 (${awayTeam}) ${pA}%`;

  // Cuotas Justas (Fair Odds)
  document.getElementById('fair-odd-home').textContent = pred.fair_odds.home_win;
  document.getElementById('fair-odd-draw').textContent = pred.fair_odds.draw;
  document.getElementById('fair-odd-away').textContent = pred.fair_odds.away_win;

  // Goles Esperados (Poisson xG)
  document.getElementById('xg-home').textContent = pred.expected_goals.home_xG;
  document.getElementById('xg-away').textContent = pred.expected_goals.away_xG;
  document.getElementById('xg-total').textContent = pred.expected_goals.total_xG;
  document.getElementById('xg-over25').textContent = `${pred.expected_goals.pct_over_2_5}%`;

  // Top Marcadores
  const scoresContainer = document.getElementById('top-scores-list');
  scoresContainer.innerHTML = '';
  pred.top_scores.forEach(s => {
    const chip = document.createElement('div');
    chip.className = 'stat-pill';
    chip.innerHTML = `<strong>${s.score}</strong> (${s.pct}%)`;
    scoresContainer.appendChild(chip);
  });

  // Desglose Histórico Cara a Cara (Head to Head)
  if (pred.head_to_head) {
    const h2h = pred.head_to_head;
    const direct = h2h.direct_at_venue;
    document.getElementById('h2h-total-matches-label').textContent = `${direct.total_matches} partidos en este estadio (${h2h.total_mutual_matches} mutuos en 10 años)`;
    document.getElementById('h2h-venue-label').textContent = `En estadio de ${homeTeam}`;
    document.getElementById('h2h-direct-record').textContent = `${direct.home_wins} Victoria(s) / ${direct.draws} Empate(s) / ${direct.away_wins} Derrota(s)`;
    document.getElementById('h2h-direct-goals').textContent = `Goles prom: ${direct.home_goals_avg} vs ${direct.away_goals_avg}`;

    const hRec = h2h.home_team_10y_home_record;
    document.getElementById('h2h-home-10y-label').textContent = `${homeTeam} en casa (10 años)`;
    document.getElementById('h2h-home-10y-pct').textContent = `${hRec.win_pct}% Victorias`;
    document.getElementById('h2h-home-10y-goals').textContent = `Goles: ${hRec.gf_avg} a favor / ${hRec.ga_avg} en contra`;

    const aRec = h2h.away_team_10y_away_record;
    document.getElementById('h2h-away-10y-label').textContent = `${awayTeam} fuera (10 años)`;
    document.getElementById('h2h-away-10y-pct').textContent = `${aRec.win_pct}% Victorias`;
    document.getElementById('h2h-away-10y-goals').textContent = `Goles: ${aRec.gf_avg} a favor / ${aRec.ga_avg} en contra`;

    // Lista de últimos enfrentamientos
    const encContainer = document.getElementById('h2h-encounters-list');
    encContainer.innerHTML = '';
    if (h2h.recent_encounters && h2h.recent_encounters.length > 0) {
      h2h.recent_encounters.forEach(m => {
        const item = document.createElement('div');
        item.className = 'h2h-match-item';
        const badgeClass = m.result.toLowerCase();
        item.innerHTML = `
          <span style="color: var(--text-muted);">${m.date} (Temp ${m.season})</span>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem;">
            <img class="table-team-logo" src="${logoFn(m.home)}" alt="">
            <strong>${m.home}</strong>
            <span style="color: var(--accent-cyan); font-weight: 700; margin: 0 0.3rem;">${m.score}</span>
            <img class="table-team-logo" src="${logoFn(m.away)}" alt="">
            <strong>${m.away}</strong>
          </span>
          <span class="badge-result ${badgeClass}">${m.result}</span>
        `;
        encContainer.appendChild(item);
      });
    } else {
      encContainer.innerHTML = '<div style="padding: 0.75rem; color: var(--text-muted); font-size: 0.85rem;">No se registran enfrentamientos previos en las 10 temporadas.</div>';
    }
  }

  // Condición Bayesiana aplicada
  const condAlert = document.getElementById('prediction-condition-alert');
  if (pred.applied_condition) {
    condAlert.style.display = 'block';
    condAlert.textContent = `Actualización Bayesiana Aplicada: ${pred.applied_condition}`;
  } else {
    condAlert.style.display = 'none';
  }

  // Actualizar Radar Táctico Head-to-Head
  updateRadarComparison();

  // Scroll suave hacia los resultados analíticos
  resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function loadMLMetrics() {
  try {
    const data = await SportsAPI.getModelMetrics();
    document.getElementById('ml-acc-lr').textContent = `${data.models.logistic_regression.accuracy}%`;
    document.getElementById('ml-acc-rf').textContent = `${data.models.random_forest.accuracy}%`;

    const elF1Lr = document.getElementById('ml-f1-lr');
    if (elF1Lr && data.models.logistic_regression.f1_score !== undefined) {
      elF1Lr.textContent = `F1-Score: ${data.models.logistic_regression.f1_score.toFixed(3)} (Weighted)`;
    }

    const elF1Rf = document.getElementById('ml-f1-rf');
    if (elF1Rf && data.models.random_forest.f1_score !== undefined) {
      elF1Rf.textContent = `F1-Score: ${data.models.random_forest.f1_score.toFixed(3)} (Weighted)`;
    }

    document.getElementById('ml-train-samples').textContent = data.train_samples.toLocaleString();
    document.getElementById('ml-test-samples').textContent = data.test_samples.toLocaleString();

    ChartManager.renderFeatureImportanceChart(
      'chart-feature-importance',
      data.models.random_forest.feature_importances
    );
  } catch (err) {
    console.error('Error al cargar métricas ML:', err);
  }
}

// 6. Web Scraping & Auditor de Partidos
function setupAuditor() {
  const filterTeam = document.getElementById('auditor-filter-team');
  const filterSeason = document.getElementById('auditor-filter-season');
  const btnPrev = document.getElementById('btn-page-prev');
  const btnNext = document.getElementById('btn-page-next');

  if (filterSeason) {
    CustomSelectManager.init(filterSeason);
    filterSeason.addEventListener('change', () => { currentMatchesPage = 1; loadAuditorTable(); });
  }
  if (filterTeam) {
    filterTeam.addEventListener('change', () => { currentMatchesPage = 1; loadAuditorTable(); });
  }
  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentMatchesPage > 1) {
        currentMatchesPage--;
        loadAuditorTable();
      }
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => {
      currentMatchesPage++;
      loadAuditorTable();
    });
  }
}

async function loadAuditorTable() {
  try {
    // 1. Estado del Scraper
    const scraper = await SportsAPI.getScraperStatus();
    document.getElementById('scraper-source').textContent = scraper.source_name;
    document.getElementById('scraper-robots').textContent = scraper.robots_allowed ? 'Permitido (Robots.txt respetado)' : 'Restringido por robots.txt';
    document.getElementById('scraper-status').textContent = scraper.online_check || 'Online';

    // 2. Poblar filtros de equipo si están vacíos
    const teamSelect = document.getElementById('auditor-filter-team');
    if (teamSelect && teamSelect.options.length <= 1 && globalTeams.length > 0) {
      globalTeams.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        teamSelect.appendChild(opt);
      });
      CustomSelectManager.init(teamSelect, { searchable: true, placeholder: 'Todos los Equipos' });
      CustomSelectManager.update(teamSelect);
    }

    // 3. Cargar tabla de partidos
    const selectedTeam = teamSelect ? teamSelect.value : '';
    const seasonSelect = document.getElementById('auditor-filter-season');
    const selectedSeason = seasonSelect ? seasonSelect.value : '';

    const data = await SportsAPI.getMatches(currentMatchesPage, 15, selectedTeam, selectedSeason);
    document.getElementById('auditor-total-records').textContent = data.total.toLocaleString();
    document.getElementById('auditor-current-page').textContent = `Página ${data.page} de ${data.total_pages || 1}`;

    document.getElementById('btn-page-prev').disabled = data.page <= 1;
    document.getElementById('btn-page-next').disabled = data.page >= data.total_pages;

    const tbody = document.getElementById('auditor-tbody');
    tbody.innerHTML = '';
    const logoFn = typeof getTeamLogo === 'function' ? getTeamLogo : (t => `assets/logos/${t.toLowerCase().replace(/ /g, '_')}.png`);

    data.matches.forEach(m => {
      const tr = document.createElement('tr');
      const badgeClass = m.FTR.toLowerCase();
      tr.innerHTML = `
        <td>${m.Date}</td>
        <td>Temp ${m.Temporada}</td>
        <td>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem;">
            <img class="table-team-logo" src="${logoFn(m.HomeTeam)}" alt="">
            <strong>${m.HomeTeam}</strong>
          </span>
        </td>
        <td>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem;">
            <img class="table-team-logo" src="${logoFn(m.AwayTeam)}" alt="">
            <strong>${m.AwayTeam}</strong>
          </span>
        </td>
        <td>${m.FTHG} - ${m.FTAG}</td>
        <td><span class="badge-result ${badgeClass}">${m.FTR}</span></td>
        <td>${m.HTHG} - ${m.HTAG} (${m.HTR})</td>
        <td>${m.HS} / ${m.AS}</td>
        <td>${m.HST} / ${m.AST}</td>
        <td>${m.HC} / ${m.AC}</td>
        <td>${m.HY + m.HR} / ${m.AY + m.AR}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Error al cargar tabla de auditoría:', err);
  }
}

// 7. Apartado de Ecuaciones Estadísticas & Código
const memberBayesEquations = {
  1: "$$P(\\text{FTR} = \\text{H} \\mid \\text{HST} > 5) = \\frac{P(\\text{HST} > 5 \\mid \\text{FTR} = \\text{H}) \\cdot P(\\text{FTR} = \\text{H})}{P(\\text{HST} > 5)} = \\frac{0.4271 \\cdot 0.4547}{0.2976} = 65.2\\%$$",
  2: "$$P(\\text{FTHG} \\ge 2 \\mid \\text{HST} > 5) = \\frac{P(\\text{HST} > 5 \\mid \\text{FTHG} \\ge 2) \\cdot P(\\text{FTHG} \\ge 2)}{P(\\text{HST} > 5)} = \\frac{0.4795 \\cdot 0.4289}{0.2976} = 69.1\\%$$",
  3: "$$P(\\text{FTR} = \\text{H} \\mid \\text{HTR} = \\text{H}) = \\frac{P(\\text{HTR} = \\text{H} \\mid \\text{FTR} = \\text{H}) \\cdot P(\\text{FTR} = \\text{H})}{P(\\text{HTR} = \\text{H})} = \\frac{0.5735 \\cdot 0.4547}{0.3321} = 78.5\\%$$",
  4: "$$P(\\text{FTR} = \\text{H} \\mid \\text{HC} > 6) = \\frac{P(\\text{HC} > 6 \\mid \\text{FTR} = \\text{H}) \\cdot P(\\text{FTR} = \\text{H})}{P(\\text{HC} > 6)} = \\frac{0.3177 \\cdot 0.4547}{0.3547} = 40.7\\%$$",
  5: "$$P(\\text{FTR} \\neq \\text{H} \\mid \\text{Tarjetas} \\ge 3) = \\frac{P(\\text{Tarjetas} \\ge 3 \\mid \\text{FTR} \\neq \\text{H}) \\cdot P(\\text{FTR} \\neq \\text{H})}{P(\\text{Tarjetas} \\ge 3)} = \\frac{0.4192 \\cdot 0.5453}{0.3747} = 61.0\\%$$",
  6: "$$P(\\text{FTR} = \\text{A} \\mid \\text{AST} > 4) = \\frac{P(\\text{AST} > 4 \\mid \\text{FTR} = \\text{A}) \\cdot P(\\text{FTR} = \\text{A})}{P(\\text{AST} > 4)} = \\frac{0.4614 \\cdot 0.2829}{0.2682} = 48.7\\%$$"
};

function renderEquationsMath() {
  if (typeof renderMathInElement === 'function') {
    const eqContainer = document.getElementById('tab-equations');
    if (eqContainer) {
      renderMathInElement(eqContainer, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }
  }
}

function setupEquationsTab() {
  // Selector dinámico por integrante para Bayes
  const memberBtns = document.querySelectorAll('.btn-eq-member');
  const dynLatexContainer = document.getElementById('eq-bayes-dynamic-latex');

  memberBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      memberBtns.forEach(b => {
        b.classList.remove('active');
        b.style.borderColor = 'var(--border-color)';
        b.style.color = 'var(--text-primary)';
      });
      btn.classList.add('active');
      btn.style.borderColor = 'var(--accent-green)';
      btn.style.color = 'var(--accent-green-light)';

      const mId = parseInt(btn.dataset.member);
      if (dynLatexContainer && memberBayesEquations[mId]) {
        dynLatexContainer.innerHTML = `<span class="katex-render">${memberBayesEquations[mId]}</span>`;
        if (typeof renderMathInElement === 'function') {
          renderMathInElement(dynLatexContainer, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ],
            throwOnError: false
          });
        }
      }
    });
  });

  // Botones de copiado de código al portapapeles
  document.querySelectorAll('.btn-copy-code').forEach(btn => {
    btn.addEventListener('click', async () => {
      const codeId = btn.dataset.codeId;
      const preEl = document.getElementById(codeId);
      if (preEl) {
        try {
          await navigator.clipboard.writeText(preEl.innerText);
          const origHtml = btn.innerHTML;
          btn.innerHTML = `
            <svg class="ui-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span style="color: #34d399;">Copiado!</span>
          `;
          setTimeout(() => {
            btn.innerHTML = origHtml;
          }, 1800);
        } catch (e) {
          console.error('Error al copiar código:', e);
        }
      }
    });
  });

  // Render inicial tras carga
  setTimeout(renderEquationsMath, 400);
}

// Modal y Visor de Dictamen Académico Oficial en Formato Paper Científico
function setupAcademicPDFModal() {
  const btnOpen = document.getElementById('btn-open-pdf-report');
  const modal = document.getElementById('academic-pdf-modal');
  const btnClose = document.getElementById('btn-close-pdf-modal');
  const btnPrint = document.getElementById('btn-print-academic-report');

  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => {
      modal.style.display = 'flex';
    });
  }

  if (btnClose && modal) {
    btnClose.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }
}

// Asistente Analítico en Lenguaje Natural (NLQ)
function setupAssistantNLQ() {
  const input = document.getElementById('assistant-input');
  const btnAsk = document.getElementById('btn-assistant-ask');
  const container = document.getElementById('assistant-response-container');
  const chips = document.querySelectorAll('.assistant-chip');

  async function handleQuery(query) {
    if (!query || !query.trim()) return;
    if (input) input.value = query;

    try {
      const data = await SportsAPI.askAssistant(query);
      if (!container) return;

      container.style.display = 'block';
      const catBadge = document.getElementById('ast-category-badge');
      if (catBadge) catBadge.textContent = data.title || 'Inferencia Estadística';

      const echo = document.getElementById('ast-query-echo');
      if (echo) echo.textContent = `Consulta: "${query}"`;

      const hl = document.getElementById('ast-headline');
      if (hl) hl.textContent = data.headline || '';

      const exp = document.getElementById('ast-explanation');
      if (exp) exp.textContent = data.explanation || '';

      const metricsGrid = document.getElementById('ast-metrics-grid');
      if (metricsGrid) {
        metricsGrid.innerHTML = '';
        if (data.metrics) {
          Object.entries(data.metrics).forEach(([k, v]) => {
            const box = document.createElement('div');
            box.className = 'hyper-stat-box';
            const label = k.replace(/_/g, ' ').toUpperCase();
            box.innerHTML = `<span class="h-label">${label}</span><div class="h-value" style="font-size: 1.1rem; color: #38bdf8;">${v}</div>`;
            metricsGrid.appendChild(box);
          });
        }
      }

      const formulaBox = document.getElementById('ast-formula-box');
      if (formulaBox) {
        formulaBox.innerHTML = data.formula ? `Fórmula formal: <code>${data.formula}</code>` : '';
      }

      const btnJump = document.getElementById('btn-ast-jump');
      if (btnJump && data.target_tab) {
        btnJump.onclick = () => {
          const tabBtn = document.querySelector(`.tab-btn[data-target="${data.target_tab}"]`);
          if (tabBtn) tabBtn.click();
          if (data.member_id) {
            const mBtn = document.querySelector(`.member-btn[data-member="${data.member_id}"]`);
            if (mBtn) mBtn.click();
          }
        };
      }

      container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      console.error('Error al consultar asistente:', err);
    }
  }

  if (btnAsk && input) {
    btnAsk.addEventListener('click', () => handleQuery(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleQuery(input.value);
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.query;
      handleQuery(q);
    });
  });
}
