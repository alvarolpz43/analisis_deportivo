/**
 * Motor de Simulación en Vivo de Partidos (LiveMatchSimulator)
 * Transforma la predicción en una experiencia de estadio inmersiva de 30 segundos:
 * - Cancha y graderías completas de Estadio LaLiga (Tribunas, Focos y Vallas LED)
 * - Vuelo tridimensional del balón en arco parabólico (sombra en césped + rotación 3D)
 * - Redes de portería con vibración en los goles
 * - Escudos oficiales de todos los 31 clubes de LaLiga integrados
 * - Marcador digital tipo transmisión de televisión
 * - Feed de relato minuto a minuto con íconos vectoriales SVG (Cero emojis)
 * - HUD interactivo con estadísticas acumuladas en tiempo real
 * - Controles de reproducción: Pausar/Reanudar, Velocidad 1x/2x y Saltar al Final
 */

// Catálogo oficial de escudos de los 31 clubes de LaLiga
const TEAM_LOGOS = {
  'Alaves': 'assets/logos/alaves.png',
  'Almeria': 'assets/logos/almeria.png',
  'Ath Bilbao': 'assets/logos/ath_bilbao.png',
  'Ath Madrid': 'assets/logos/ath_madrid.png',
  'Barcelona': 'assets/logos/barcelona.png',
  'Betis': 'assets/logos/betis.png',
  'Cadiz': 'assets/logos/cadiz.png',
  'Celta': 'assets/logos/celta.png',
  'Eibar': 'assets/logos/eibar.svg',
  'Elche': 'assets/logos/elche.png',
  'Espanol': 'assets/logos/espanol.png',
  'Getafe': 'assets/logos/getafe.png',
  'Girona': 'assets/logos/girona.png',
  'Granada': 'assets/logos/granada.png',
  'Huesca': 'assets/logos/huesca.svg',
  'La Coruna': 'assets/logos/la_coruna.png',
  'Las Palmas': 'assets/logos/las_palmas.png',
  'Leganes': 'assets/logos/leganes.png',
  'Levante': 'assets/logos/levante.png',
  'Malaga': 'assets/logos/malaga.svg',
  'Mallorca': 'assets/logos/mallorca.png',
  'Osasuna': 'assets/logos/osasuna.png',
  'Oviedo': 'assets/logos/oviedo.png',
  'Real Madrid': 'assets/logos/real_madrid.png',
  'Sevilla': 'assets/logos/sevilla.png',
  'Sociedad': 'assets/logos/sociedad.png',
  'Sp Gijon': 'assets/logos/sp_gijon.svg',
  'Valencia': 'assets/logos/valencia.png',
  'Valladolid': 'assets/logos/valladolid.png',
  'Vallecano': 'assets/logos/vallecano.png',
  'Villarreal': 'assets/logos/villarreal.png'
};

function getTeamLogo(team) {
  return TEAM_LOGOS[team] || 'assets/logos/real_madrid.png';
}

window.TEAM_LOGOS = TEAM_LOGOS;
window.getTeamLogo = getTeamLogo;

const LiveMatchSimulator = (function() {
  // Constantes de configuración
  const TOTAL_MATCH_MINUTES = 90;
  const BASE_DURATION_MS = 30000; // 30 segundos
  const MS_PER_MINUTE_BASE = Math.round(BASE_DURATION_MS / TOTAL_MATCH_MINUTES); // ~333 ms

  // Estado interno
  let activeTimeline = [];
  let currentEventIdx = 0;
  let currentMinute = 0;
  let isRunning = false;
  let isPaused = false;
  let speedMultiplier = 1;
  let timerId = null;
  let onFinishCallback = null;
  let homeTeamName = '';
  let awayTeamName = '';
  let finalData = null;

  // Mapa de posiciones porcentuales en la cancha táctica
  const PITCH_POSITIONS = {
    'home_box': { left: '14%', top: '50%' },
    'home_def': { left: '28%', top: '42%' },
    'midfield': { left: '50%', top: '50%' },
    'away_att': { left: '72%', top: '58%' },
    'away_box': { left: '86%', top: '50%' },
    'attack_home': { left: '76%', top: '46%' },
    'attack_away': { left: '24%', top: '54%' },
    'home_goal_net': { left: '6%', top: '50%' },
    'away_goal_net': { left: '94%', top: '50%' },
    'corner_nw': { left: '3%', top: '6%' },
    'corner_ne': { left: '97%', top: '6%' },
    'corner_sw': { left: '3%', top: '94%' },
    'corner_se': { left: '97%', top: '94%' }
  };

  // Íconos vectoriales SVG profesionales (cero emojis)
  const EVENT_ICONS = {
    kickoff: `<svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17a1 1 0 0 1-2 0v-.07A8 8 0 0 1 4.07 10H5a1 1 0 0 1 0-2h-.93A8 8 0 0 1 11 4.07V5a1 1 0 0 1 2 0v-.93A8 8 0 0 1 19.93 11H19a1 1 0 0 1 0 2h.93A8 8 0 0 1 13 16.93z"/></svg>`,
    attack: `<svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 7 17 7 17 17"/><line x1="7" y1="17" x2="17" y2="7"/></svg>`,
    shot_saved: `<svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    shot_missed: `<svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    corner: `<svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
    card_yellow: `<svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="#fbbf24" stroke="#d97706" stroke-width="2"><rect x="5" y="3" width="14" height="18" rx="2"/></svg>`,
    goal: `<svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>`,
    halftime: `<svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    second_half: `<svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    fulltime: `<svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
  };

  /**
   * Inicializa los listeners de los botones de la arena (Pausa, Velocidad, Saltar)
   */
  function initControls() {
    const btnPause = document.getElementById('sim-btn-pause');
    const btnSpeed = document.getElementById('sim-btn-speed');
    const btnSkip = document.getElementById('sim-btn-skip');

    if (btnPause && !btnPause.dataset.bound) {
      btnPause.addEventListener('click', togglePause);
      btnPause.dataset.bound = 'true';
    }

    if (btnSpeed && !btnSpeed.dataset.bound) {
      btnSpeed.addEventListener('click', toggleSpeed);
      btnSpeed.dataset.bound = 'true';
    }

    if (btnSkip && !btnSkip.dataset.bound) {
      btnSkip.addEventListener('click', skipToEnd);
      btnSkip.dataset.bound = 'true';
    }

    // Controles de conmutador 3D / 2D
    const btn3D = document.getElementById('sim-btn-view-3d');
    const btn2D = document.getElementById('sim-btn-view-2d');
    const wrap3D = document.getElementById('stadium-3d-wrapper');
    const bowl2D = document.getElementById('stadium-2d-bowl');
    const hint3D = document.getElementById('stadium-3d-hint');
    const camGroup = document.getElementById('stadium-cam-selector-group');

    if (btn3D && btn2D && !btn3D.dataset.bound) {
      btn3D.dataset.bound = 'true';
      btn3D.addEventListener('click', () => {
        btn3D.classList.add('active');
        btn2D.classList.remove('active');
        if (wrap3D) wrap3D.style.display = 'block';
        if (bowl2D) bowl2D.style.display = 'none';
        if (camGroup) camGroup.style.display = 'inline-flex';
        if (hint3D) hint3D.innerHTML = '<svg class="ui-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg> WebGL 3D • Arrastra para rotar 360° • Zoom con rueda';
        if (window.Stadium3D) window.Stadium3D.onResize();
      });

      btn2D.addEventListener('click', () => {
        btn2D.classList.add('active');
        btn3D.classList.remove('active');
        if (wrap3D) wrap3D.style.display = 'none';
        if (bowl2D) bowl2D.style.display = 'block';
        if (camGroup) camGroup.style.display = 'none';
        if (hint3D) hint3D.innerHTML = '<svg class="ui-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg> Vista 2D Táctica Clásica';
      });
    }

    // Controles de Perspectiva de Cámara 3D (Dentro del estadio, Transmisión, etc.)
    const camButtons = {
      'broadcast': document.getElementById('cam-btn-broadcast'),
      'pitchside': document.getElementById('cam-btn-pitchside'),
      'goalcam': document.getElementById('cam-btn-goalcam'),
      'aerial': document.getElementById('cam-btn-aerial'),
      'follow': document.getElementById('cam-btn-follow')
    };
    const hudBadge = document.getElementById('stadium-hud-cam-name');

    Object.entries(camButtons).forEach(([modeKey, btn]) => {
      if (btn && !btn.dataset.bound) {
        btn.dataset.bound = 'true';
        btn.addEventListener('click', () => {
          Object.values(camButtons).forEach(b => b && b.classList.remove('active'));
          btn.classList.add('active');
          if (window.Stadium3D) {
            window.Stadium3D.setCameraMode(modeKey);
          }
          if (hudBadge) {
            const labels = {
              'broadcast': 'ESTADIO LALIGA 3D • BROADCAST TV • 60 FPS',
              'pitchside': 'A PIE DE CAMPO (DENTRO DEL ESTADIO) • 60 FPS',
              'goalcam': 'PERSPECTIVA DETRÁS DEL ARCO • 60 FPS',
              'aerial': 'VISTA AÉREA CENITAL TÁCTICA • 60 FPS',
              'follow': 'CÁMARA DE SEGUIMIENTO AL BALÓN • 60 FPS'
            };
            hudBadge.textContent = labels[modeKey] || 'ESTADIO LALIGA 3D • 60 FPS';
          }
        });
      }
    });

    const btnResetCam = document.getElementById('cam-btn-reset');
    if (btnResetCam && !btnResetCam.dataset.bound) {
      btnResetCam.dataset.bound = 'true';
      btnResetCam.addEventListener('click', () => {
        if (window.Stadium3D) {
          window.Stadium3D.resetCamera();
        }
      });
    }

    // Control de Mapa de Calor Táctico 3D
    const btnHeatmap = document.getElementById('btn-toggle-heatmap');
    if (btnHeatmap && !btnHeatmap.dataset.bound) {
      btnHeatmap.dataset.bound = 'true';
      btnHeatmap.addEventListener('click', () => {
        if (window.Stadium3D) {
          const isVis = window.Stadium3D.toggleHeatmap();
          btnHeatmap.classList.toggle('active', isVis);
        }
      });
    }

    // Control de Pines 3D de Tiros y Goles
    const btnShotMap = document.getElementById('btn-toggle-shotmap');
    if (btnShotMap && !btnShotMap.dataset.bound) {
      btnShotMap.dataset.bound = 'true';
      btnShotMap.addEventListener('click', () => {
        if (window.Stadium3D && typeof window.Stadium3D.toggleShotMap === 'function') {
          const isVis = window.Stadium3D.toggleShotMap();
          btnShotMap.classList.toggle('active', isVis);
        }
      });
    }

    // Selector cíclico de Iluminación / Atmósfera (Noche / Atardecer / Día)
    const btnLighting = document.getElementById('btn-cycle-lighting');
    const lightingLbl = document.getElementById('lighting-mode-label');
    if (btnLighting && !btnLighting.dataset.bound) {
      btnLighting.dataset.bound = 'true';
      const modes = [
        { key: 'night', label: 'Noche' },
        { key: 'sunset', label: 'Atardecer' },
        { key: 'day', label: 'Día' }
      ];
      let lightIdx = 0;
      btnLighting.addEventListener('click', () => {
        lightIdx = (lightIdx + 1) % modes.length;
        const next = modes[lightIdx];
        if (lightingLbl) lightingLbl.textContent = next.label;
        if (window.Stadium3D && typeof window.Stadium3D.setTimeOfDay === 'function') {
          window.Stadium3D.setTimeOfDay(next.key);
        }
      });
    }

    // Control de Audio Sintetizado (Silbato, Jugadas, Gradería y Gol)
    const btnAudio = document.getElementById('sim-btn-audio-toggle');
    const audioLabel = document.getElementById('audio-text-label');
    if (btnAudio && !btnAudio.dataset.bound) {
      btnAudio.dataset.bound = 'true';
      btnAudio.addEventListener('click', () => {
        if (window.StadiumAudio) {
          const isMuted = window.StadiumAudio.toggleMute();
          if (isMuted) {
            btnAudio.classList.add('muted');
            if (audioLabel) audioLabel.textContent = 'Sonido OFF';
          } else {
            btnAudio.classList.remove('muted');
            if (audioLabel) audioLabel.textContent = 'Sonido ON';
            window.StadiumAudio.playWhistle();
          }
        }
      });
    }
  }

  /**
   * Arranca la simulación interactiva con los datos de predicción
   */
  function start(predData, onComplete) {
    initControls();

    // Guardar nombres de los equipos
    homeTeamName = predData.home_team || 'Local';
    awayTeamName = predData.away_team || 'Visitante';

    // Preparar elementos de la arena antes de inicializar WebGL para tener dimensiones reales
    const arena = document.getElementById('live-match-arena');
    if (arena) {
      arena.style.display = 'block';
      arena.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Inicializar y actualizar Estadio 3D WebGL con los colores oficiales de ambos clubes
    if (window.Stadium3D) {
      window.Stadium3D.init('stadium-3d-wrapper', homeTeamName, awayTeamName);
      window.Stadium3D.reset();
      window.Stadium3D.onResize();
      const hudBadge = document.getElementById('stadium-hud-cam-name');
      if (hudBadge) {
        const modeLabels = {
          'broadcast': 'ESTADIO LALIGA 3D • BROADCAST TV • 60 FPS',
          'pitchside': 'A PIE DE CAMPO (DENTRO DEL ESTADIO) • 60 FPS',
          'goalcam': 'PERSPECTIVA DETRÁS DEL ARCO • 60 FPS',
          'aerial': 'VISTA AÉREA CENITAL TÁCTICA • 60 FPS',
          'follow': 'CÁMARA DE SEGUIMIENTO AL BALÓN • 60 FPS'
        };
        hudBadge.textContent = modeLabels[window.Stadium3D.cameraMode] || 'ESTADIO LALIGA 3D • 60 FPS';
      }
    }

    // Iniciar ambientación acústica y silbatazo inicial de LaLiga
    if (window.StadiumAudio) {
      if (typeof window.StadiumAudio.init === 'function') window.StadiumAudio.init();
      if (typeof window.StadiumAudio.startAmbience === 'function') {
        window.StadiumAudio.startAmbience();
      } else if (typeof window.StadiumAudio.startAmbientCrowd === 'function') {
        window.StadiumAudio.startAmbientCrowd();
      }
      if (typeof window.StadiumAudio.playWhistle === 'function') window.StadiumAudio.playWhistle();
    }

    // Resetear estado
    clearTimer();
    finalData = predData;
    onFinishCallback = onComplete;

    const simPayload = predData.match_simulation || {};
    activeTimeline = simPayload.timeline || [];
    currentEventIdx = 0;
    currentMinute = 0;
    isRunning = true;
    isPaused = false;
    speedMultiplier = 1;

    // Actualizar controles UI
    updatePauseButtonUI(false);
    updateSpeedButtonUI(1);

    // Nombres y Escudos oficiales en el marcador
    const hNameEl = document.getElementById('sim-home-name');
    const aNameEl = document.getElementById('sim-away-name');
    const hCrestEl = document.getElementById('sim-home-crest');
    const aCrestEl = document.getElementById('sim-away-crest');

    if (hNameEl) hNameEl.textContent = homeTeamName;
    if (aNameEl) aNameEl.textContent = awayTeamName;
    if (hCrestEl) hCrestEl.src = getTeamLogo(homeTeamName);
    if (aCrestEl) aCrestEl.src = getTeamLogo(awayTeamName);

    // Etiquetas de zona en la cancha
    const lblHome = document.getElementById('lbl-home-team-side');
    const lblAway = document.getElementById('lbl-away-team-side');
    if (lblHome) lblHome.textContent = `Defensa ${homeTeamName}`;
    if (lblAway) lblAway.textContent = `Defensa ${awayTeamName}`;

    // Resetear marcador y reloj
    updateScoreboard(0, 0);
    updateClock(0);
    setStatusBadge('live_1t', 'EN VIVO • 1T');

    // Ocultar alerta de gol
    const goalAlert = document.getElementById('sim-goal-alert');
    if (goalAlert) goalAlert.style.display = 'none';

    // Resetear balón a la mitad de la cancha sin vuelo
    flyBall(PITCH_POSITIONS['midfield'], 'normal');

    // Resetear redes de portería
    resetNets();

    // Resetear Posesión y HUD Stats
    updateHUDStats({
      hs: 0, as: 0, hst: 0, ast: 0,
      hc: 0, ac: 0, hy: 0, ay: 0,
      possession_h: 50, possession_a: 50
    });

    // Resetear feed de eventos
    const feedList = document.getElementById('sim-events-list');
    const eventCountBadge = document.getElementById('sim-event-count');
    if (feedList) {
      feedList.innerHTML = `
        <div class="feed-item feed-initial">
          <span class="feed-minute">00'</span>
          <div class="feed-body">
            <div class="feed-event-title">
              ${EVENT_ICONS.kickoff}
              <span>Comienza el encuentro en LaLiga</span>
            </div>
            <div class="feed-event-desc">
              Pitazo inicial entre <strong>${escapeHtml(homeTeamName)}</strong> y <strong>${escapeHtml(awayTeamName)}</strong>. ¡Rueda el balón en el estadio!
            </div>
          </div>
        </div>
      `;
    }
    if (eventCountBadge) eventCountBadge.textContent = '1 evento';

    // Iniciar el ciclo del reloj
    scheduleNextTick();
  }

  /**
   * Programa el siguiente minuto del partido
   */
  function scheduleNextTick() {
    if (!isRunning || isPaused) return;

    const delay = Math.round(MS_PER_MINUTE_BASE / speedMultiplier);
    timerId = setTimeout(tickMinute, delay);
  }

  /**
   * Ejecuta el avance de 1 minuto de juego
   */
  function tickMinute() {
    if (!isRunning || isPaused) return;

    currentMinute++;
    updateClock(currentMinute);
    if (window.Stadium3D && window.Stadium3D.isInitialized && typeof window.Stadium3D.updateClockMinute === 'function') {
      window.Stadium3D.updateClockMinute(currentMinute);
    }

    // Revisar si hay eventos programados en este minuto
    const hadEvent = processEventsForMinute(currentMinute);

    // Mantener fluidez realista con pases tácticos en los minutos intermedios
    if (!hadEvent && currentMinute < TOTAL_MATCH_MINUTES && currentMinute % 2 === 0) {
      if (window.Stadium3D && window.Stadium3D.isInitialized && !window.Stadium3D.ballState?.isMoving) {
        const possHomeTxt = document.getElementById('sim-poss-h-label')?.textContent || '50%';
        const possH = parseInt(possHomeTxt, 10) || 50;
        const passTeam = (Math.random() * 100 < possH) ? 'home' : 'away';
        if (typeof window.Stadium3D.playRoutinePass === 'function') {
          window.Stadium3D.playRoutinePass(passTeam);
        }
      }
    }

    // Manejo de medio tiempo
    if (currentMinute === 45) {
      if (window.StadiumAudio) window.StadiumAudio.playWhistle();
      setStatusBadge('halftime', 'DESCANSO (1T)');
      clearTimer();
      timerId = setTimeout(() => {
        if (!isRunning || isPaused) return;
        if (window.StadiumAudio) window.StadiumAudio.playWhistle();
        setStatusBadge('live_2t', 'EN VIVO • 2T');
        scheduleNextTick();
      }, Math.round(1200 / speedMultiplier));
      return;
    }

    // Fin de los 90 minutos
    if (currentMinute >= TOTAL_MATCH_MINUTES) {
      if (window.StadiumAudio) window.StadiumAudio.playWhistle();
      finishMatch();
      return;
    }

    scheduleNextTick();
  }

  /**
   * Procesa los eventos del timeline que coinciden con el minuto actual
   */
  function processEventsForMinute(min) {
    let processed = false;
    while (currentEventIdx < activeTimeline.length && activeTimeline[currentEventIdx].minute <= min) {
      const ev = activeTimeline[currentEventIdx];
      renderEvent(ev);
      currentEventIdx++;
      processed = true;
    }
    return processed;
  }

  /**
   * Renderiza un evento específico: trayectoria de vuelo del balón, marcador, alerta y feed
   */
  function renderEvent(ev) {
    // 1. Determinar tipo de vuelo tridimensional del balón y destino
    let flightType = 'high';
    let targetCoords = PITCH_POSITIONS[ev.pitch_zone] || PITCH_POSITIONS['midfield'];

    if (ev.type === 'goal') {
      flightType = 'shot';
      // Si el gol es del local, el balón vuela al fondo de la red visitante (derecha)
      // Si el gol es del visitante, el balón vuela al fondo de la red local (izquierda)
      if (ev.team === 'home') {
        targetCoords = PITCH_POSITIONS['away_goal_net'];
        shakeGoalNet('away');
      } else {
        targetCoords = PITCH_POSITIONS['home_goal_net'];
        shakeGoalNet('home');
      }
    } else if (ev.type === 'shot_saved' || ev.type === 'shot_missed') {
      flightType = 'shot';
    } else if (ev.type === 'corner') {
      flightType = 'high';
      // Posición de córner
      const cornerKey = ev.team === 'home' ? 'corner_ne' : 'corner_nw';
      targetCoords = PITCH_POSITIONS[cornerKey] || PITCH_POSITIONS['midfield'];
    } else if (ev.type === 'kickoff' || ev.type === 'second_half') {
      flightType = 'normal';
      targetCoords = PITCH_POSITIONS['midfield'];
    }

    if (!targetCoords) targetCoords = PITCH_POSITIONS['midfield'];

    // Hacer volar el balón con efecto parabólico en 3D
    flyBall(targetCoords, flightType);

    // Conectar animación tridimensional WebGL con Three.js
    if (window.Stadium3D && window.Stadium3D.isInitialized) {
      let isAerial = (flightType === 'high' || flightType === 'shot');
      let peakY = flightType === 'high' ? 8.5 : (flightType === 'shot' ? 3.5 : 0.0);
      let durationMs = (ev.type === 'goal' ? 1200 : (flightType === 'high' ? 1100 : 800)) / speedMultiplier;

      let targetZoneKey = ev.pitch_zone || 'midfield';
      if (ev.type === 'goal') {
        targetZoneKey = ev.team === 'home' ? 'away_goal_net' : 'home_goal_net';
      } else if (ev.type === 'corner') {
        targetZoneKey = ev.team === 'home' ? 'corner_ne' : 'corner_nw';
      } else if (ev.type === 'kickoff' || ev.type === 'second_half') {
        targetZoneKey = 'midfield';
      }

      if (typeof window.Stadium3D.handleMatchEvent === 'function') {
        window.Stadium3D.handleMatchEvent(ev, {
          targetZoneKey,
          duration: durationMs,
          isAerial,
          peakY
        });
      } else {
        if (ev.type === 'goal') {
          window.Stadium3D.triggerGoalCelebration(ev.team === 'away');
        }
        window.Stadium3D.animateBallTo(targetZoneKey, {
          duration: durationMs,
          isAerial,
          peakY
        });
      }
    }

    // 2. Efecto de onda táctica si es tiro o gol
    if (['goal', 'shot_saved', 'shot_missed', 'card_yellow'].includes(ev.type)) {
      triggerPitchRipple(targetCoords);
    }

    // 3. Actualizar marcador si hubo cambios
    updateScoreboard(ev.current_home_score, ev.current_away_score, ev.type === 'goal');

    // 4. Actualizar HUD de estadísticas si incluye snapshot
    if (ev.stats_snapshot) {
      updateHUDStats(ev.stats_snapshot);
    }

    // 5. Alerta de Gol prominente con escudo del club anotador
    if (ev.type === 'goal') {
      showGoalAlert(ev);
    }

    // 6. Agregar al feed minuto a minuto
    appendFeedEvent(ev);
  }

  /**
   * Ejecuta el vuelo tridimensional del balón a las coordenadas objetivo
   */
  function flyBall(coords, flightType = 'normal') {
    const ball = document.getElementById('pitch-ball');
    const flightCore = document.getElementById('ball-flight');
    const shadow = document.getElementById('ball-shadow');
    if (!ball) return;

    const target = coords || PITCH_POSITIONS['midfield'];

    // Movimiento plano X/Y sobre la cancha
    ball.style.left = target.left;
    ball.style.top = target.top;

    if (flightCore && shadow) {
      // Reiniciar clases de animación
      flightCore.className = 'ball-flight-core';
      shadow.className = 'ball-ground-shadow';

      if (flightType === 'high') {
        void flightCore.offsetWidth; // forzar reflow
        flightCore.classList.add('ball-flying-high');
        shadow.classList.add('shadow-flying-high');
      } else if (flightType === 'shot') {
        void flightCore.offsetWidth; // forzar reflow
        flightCore.classList.add('ball-flying-shot');
        shadow.classList.add('shadow-flying-shot');
      }
    }
  }

  /**
   * Vibra la red de la portería cuando entra un gol
   */
  function shakeGoalNet(side) {
    const netId = side === 'home' ? 'net-mesh-home' : 'net-mesh-away';
    const netEl = document.getElementById(netId);
    if (!netEl) return;

    netEl.classList.remove('net-shake');
    void netEl.offsetWidth;
    netEl.classList.add('net-shake');
  }

  function resetNets() {
    const netH = document.getElementById('net-mesh-home');
    const netA = document.getElementById('net-mesh-away');
    if (netH) netH.classList.remove('net-shake');
    if (netA) netA.classList.remove('net-shake');
  }

  /**
   * Detona una onda expansiva en la zona táctica donde ocurre una acción clave
   */
  function triggerPitchRipple(coords) {
    const ripple = document.getElementById('pitch-action-ripple');
    if (!ripple) return;

    const target = coords || PITCH_POSITIONS['midfield'];
    ripple.style.left = target.left;
    ripple.style.top = target.top;

    ripple.classList.remove('trigger-ripple');
    void ripple.offsetWidth;
    ripple.classList.add('trigger-ripple');
  }

  /**
   * Muestra la alerta de gol con escudo oficial del club
   */
  function showGoalAlert(ev) {
    const alertEl = document.getElementById('sim-goal-alert');
    const descEl = document.getElementById('sim-goal-desc');
    const crestEl = document.getElementById('sim-goal-crest');
    if (!alertEl || !descEl) return;

    const scoringTeam = ev.team === 'home' ? homeTeamName : awayTeamName;
    if (crestEl) crestEl.src = getTeamLogo(scoringTeam);
    descEl.textContent = `¡Gol de ${scoringTeam}! (${ev.current_home_score} - ${ev.current_away_score})`;
    alertEl.style.display = 'block';

    setTimeout(() => {
      alertEl.style.display = 'none';
    }, Math.round(2800 / speedMultiplier));
  }

  /**
   * Agrega un nuevo ítem al feed de relatos minuto a minuto con escudo del club
   */
  function appendFeedEvent(ev) {
    const feedList = document.getElementById('sim-events-list');
    const countBadge = document.getElementById('sim-event-count');
    if (!feedList) return;

    const iconHtml = EVENT_ICONS[ev.type] || EVENT_ICONS.attack;
    const formattedMin = String(ev.minute).padStart(2, '0') + "'";

    let extraClass = '';
    if (ev.type === 'goal') extraClass = 'feed-goal';
    else if (ev.type === 'card_yellow') extraClass = 'feed-card';

    // Determinar si corresponde mostrar el escudo del club en el relato
    let teamBadgeHtml = '';
    if (ev.team === 'home') {
      teamBadgeHtml = `<img class="feed-team-badge" src="${getTeamLogo(homeTeamName)}" alt="${escapeHtml(homeTeamName)}">`;
    } else if (ev.team === 'away') {
      teamBadgeHtml = `<img class="feed-team-badge" src="${getTeamLogo(awayTeamName)}" alt="${escapeHtml(awayTeamName)}">`;
    }

    const item = document.createElement('div');
    item.className = `feed-item ${extraClass}`;
    item.innerHTML = `
      <span class="feed-minute">${formattedMin}</span>
      <div class="feed-body">
        <div class="feed-event-title">
          ${teamBadgeHtml}
          ${iconHtml}
          <span>${escapeHtml(ev.title || 'Incidencia de juego')}</span>
        </div>
        <div class="feed-event-desc">${escapeHtml(ev.description || '')}</div>
      </div>
    `;

    feedList.appendChild(item);

    // Auto-scroll al final del relato
    feedList.scrollTop = feedList.scrollHeight;

    // Actualizar conteo
    if (countBadge) {
      const itemsCount = feedList.querySelectorAll('.feed-item').length;
      countBadge.textContent = `${itemsCount} eventos`;
    }
  }

  /**
   * Actualiza el reloj del partido en formato MM:SS
   */
  function updateClock(min) {
    const clockEl = document.getElementById('sim-clock');
    if (clockEl) {
      clockEl.textContent = `${String(min).padStart(2, '0')}:00`;
    }
  }

  /**
   * Actualiza los dígitos del marcador digital con animación opcional de gol
   */
  function updateScoreboard(hg, ag, isGoal = false) {
    const hEl = document.getElementById('sim-score-home');
    const aEl = document.getElementById('sim-score-away');

    if (hEl && hEl.textContent !== String(hg)) {
      hEl.textContent = hg;
      if (isGoal) {
        hEl.classList.add('score-bump');
        setTimeout(() => hEl.classList.remove('score-bump'), 600);
      }
    }

    if (aEl && aEl.textContent !== String(ag)) {
      aEl.textContent = ag;
      if (isGoal) {
        aEl.classList.add('score-bump');
        setTimeout(() => aEl.classList.remove('score-bump'), 600);
      }
    }
  }

  /**
   * Actualiza el HUD inferior con estadísticas acumuladas y barras de posesión
   */
  function updateHUDStats(stats) {
    const hsEl = document.getElementById('hud-stat-hs');
    const asEl = document.getElementById('hud-stat-as');
    const hstEl = document.getElementById('hud-stat-hst');
    const astEl = document.getElementById('hud-stat-ast');
    const hcEl = document.getElementById('hud-stat-hc');
    const acEl = document.getElementById('hud-stat-ac');
    const hyEl = document.getElementById('hud-stat-hy');
    const ayEl = document.getElementById('hud-stat-ay');

    if (hsEl) hsEl.textContent = stats.hs ?? 0;
    if (asEl) asEl.textContent = stats.as ?? 0;
    if (hstEl) hstEl.textContent = stats.hst ?? 0;
    if (astEl) astEl.textContent = stats.ast ?? 0;
    if (hcEl) hcEl.textContent = stats.hc ?? 0;
    if (acEl) acEl.textContent = stats.ac ?? 0;
    if (hyEl) hyEl.textContent = stats.hy ?? 0;
    if (ayEl) ayEl.textContent = stats.ay ?? 0;

    // Barras de posesión
    const pH = stats.possession_h ?? 50;
    const pA = stats.possession_a ?? 50;
    const barH = document.getElementById('sim-poss-bar-h');
    const barA = document.getElementById('sim-poss-bar-a');
    const lblH = document.getElementById('sim-poss-h-label');
    const lblA = document.getElementById('sim-poss-a-label');

    if (barH) barH.style.width = `${pH}%`;
    if (barA) barA.style.width = `${pA}%`;
    if (lblH) lblH.textContent = `${pH}% ${homeTeamName}`;
    if (lblA) lblA.textContent = `${pA}% ${awayTeamName}`;
  }

  /**
   * Configura la insignia visual de estado del partido
   */
  function setStatusBadge(state, text) {
    const badge = document.getElementById('sim-status-badge');
    const textEl = document.getElementById('sim-status-text');
    if (!badge || !textEl) return;

    badge.className = 'live-status-pill';
    if (state === 'live_1t' || state === 'live_2t') {
      badge.classList.add('status-live');
    } else if (state === 'halftime') {
      badge.classList.add('status-halftime');
    } else if (state === 'finished') {
      badge.classList.add('status-finished');
    }

    textEl.textContent = text;
  }

  /**
   * Alterna entre pausa y reanudación
   */
  function togglePause() {
    if (!isRunning) return;

    isPaused = !isPaused;
    updatePauseButtonUI(isPaused);

    if (!isPaused) {
      scheduleNextTick();
    } else {
      clearTimer();
    }
  }

  /**
   * Alterna entre 1x y 2x de velocidad de simulación
   */
  function toggleSpeed() {
    speedMultiplier = speedMultiplier === 1 ? 2 : 1;
    updateSpeedButtonUI(speedMultiplier);
  }

  /**
   * Salta instantáneamente al final de la simulación
   */
  function skipToEnd() {
    if (!isRunning) return;

    clearTimer();

    // Procesar todos los eventos restantes de una vez
    while (currentEventIdx < activeTimeline.length) {
      const ev = activeTimeline[currentEventIdx];
      renderEvent(ev);
      currentEventIdx++;
    }

    currentMinute = TOTAL_MATCH_MINUTES;
    updateClock(currentMinute);
    finishMatch();
  }

  /**
   * Finaliza el partido formalmente
   */
  function finishMatch() {
    clearTimer();
    isRunning = false;
    isPaused = false;

    if (window.StadiumAudio && typeof window.StadiumAudio.stopAmbience === 'function') {
      window.StadiumAudio.stopAmbience();
    }

    setStatusBadge('finished', 'PARTIDO FINALIZADO');

    // Deshabilitar controles de pausa/velocidad
    const btnPause = document.getElementById('sim-btn-pause');
    const btnSpeed = document.getElementById('sim-btn-speed');
    if (btnPause) btnPause.disabled = true;
    if (btnSpeed) btnSpeed.disabled = true;

    // Asegurar que el marcador y HUD reflejen el total exacto
    const simPayload = (finalData && finalData.match_simulation) || {};
    const fScore = simPayload.final_score || {};
    const tStats = simPayload.total_stats || {};

    if (fScore.home !== undefined && fScore.away !== undefined) {
      updateScoreboard(fScore.home, fScore.away);
      if (window.Stadium3D && typeof window.Stadium3D.updateScoreboardBanner === 'function') {
        window.Stadium3D.updateScoreboardBanner(homeTeamName, awayTeamName, fScore.home, fScore.away, 90);
      }

      // Ceremonia 3D de Levantamiento de Copa para el equipo ganador
      const hudBadge = document.getElementById('stadium-hud-cam-name');
      if (fScore.home > fScore.away) {
        if (window.Stadium3D && typeof window.Stadium3D.triggerTrophyCeremony === 'function') {
          window.Stadium3D.triggerTrophyCeremony('home', homeTeamName);
        }
        if (hudBadge) hudBadge.textContent = `CAMPEÓN: ${homeTeamName.toUpperCase()} • LEVANTA LA COPA 3D`;
      } else if (fScore.away > fScore.home) {
        if (window.Stadium3D && typeof window.Stadium3D.triggerTrophyCeremony === 'function') {
          window.Stadium3D.triggerTrophyCeremony('away', awayTeamName);
        }
        if (hudBadge) hudBadge.textContent = `CAMPEÓN: ${awayTeamName.toUpperCase()} • LEVANTA LA COPA 3D`;
      } else {
        if (window.Stadium3D && typeof window.Stadium3D.triggerDrawSalute === 'function') {
          window.Stadium3D.triggerDrawSalute();
        }
        if (hudBadge) hudBadge.textContent = 'EMPATE FINAL • SALUDO DEPORTIVO 3D';
      }
    }

    if (tStats.home_shots !== undefined) {
      updateHUDStats({
        hs: tStats.home_shots,
        as: tStats.away_shots,
        hst: tStats.home_shots_on_target,
        ast: tStats.away_shots_on_target,
        hc: tStats.home_corners,
        ac: tStats.away_corners,
        hy: tStats.home_yellow_cards,
        ay: tStats.away_yellow_cards,
        possession_h: tStats.possession_home || 50,
        possession_a: tStats.possession_away || 50
      });
    }

    // Agregar evento final de cierre
    const feedList = document.getElementById('sim-events-list');
    if (feedList) {
      const item = document.createElement('div');
      item.className = 'feed-item';
      item.innerHTML = `
        <span class="feed-minute">90'</span>
        <div class="feed-body">
          <div class="feed-event-title">
            ${EVENT_ICONS.fulltime}
            <span>¡Pitazo final del árbitro en el estadio!</span>
          </div>
          <div class="feed-event-desc">
            Marcador definitivo: <strong>${escapeHtml(homeTeamName)}</strong> ${fScore.formatted || ''} <strong>${escapeHtml(awayTeamName)}</strong>. Cargando analítica completa...
          </div>
        </div>
      `;
      feedList.appendChild(item);
      feedList.scrollTop = feedList.scrollHeight;
    }

    // Notificar al llamador para desplegar el contenedor de resultados analíticos
    if (typeof onFinishCallback === 'function') {
      setTimeout(() => {
        onFinishCallback(finalData);
      }, 700);
    }
  }

  function clearTimer() {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  }

  function updatePauseButtonUI(paused) {
    const iconPause = document.getElementById('sim-icon-pause');
    const iconPlay = document.getElementById('sim-icon-play');
    const textEl = document.getElementById('sim-btn-pause-text');
    const btn = document.getElementById('sim-btn-pause');

    if (btn) btn.disabled = false;
    if (iconPause && iconPlay && textEl) {
      if (paused) {
        iconPause.style.display = 'none';
        iconPlay.style.display = 'inline-block';
        textEl.textContent = 'Reanudar';
      } else {
        iconPause.style.display = 'inline-block';
        iconPlay.style.display = 'none';
        textEl.textContent = 'Pausar';
      }
    }
  }

  function updateSpeedButtonUI(mult) {
    const valEl = document.getElementById('sim-speed-val');
    const btn = document.getElementById('sim-btn-speed');
    if (btn) btn.disabled = false;
    if (valEl) {
      valEl.textContent = `${mult}x`;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    start,
    togglePause,
    toggleSpeed,
    skipToEnd
  };
})();

window.LiveMatchSimulator = LiveMatchSimulator;
