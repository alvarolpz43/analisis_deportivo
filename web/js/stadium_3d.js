/**
 * Motor Tridimensional Avanzado del Estadio LaLiga (Stadium3D)
 * Basado en Three.js r128 + WebGL a 60 FPS:
 * - Visualización Broadcast: selector Noche/Atardecer/Día, arcos 3D de tiro, pines de Shot Map y shake de gol
 * - Estadio completo: Videomarcador 3D en vivo, túnel de vestuarios, banquillos con técnicos/suplentes,
 *   fotógrafos tras porterías, esquinas cerradas con afición 360° y césped con área técnica
 * - Jugadores detallados: camisetas rayadas/franja por club, dorsales legibles 1-11, brazalete de capitán
 *   y árbitro que corre y muestra tarjeta amarilla 3D
 * - Hinchas vivos: 1.800+ espectadores con torso y cabeza sobre cada escalón, bufandas ondeantes,
 *   pancartas Tifo en fondos y reacción emocional localizada por afición
 * - Animaciones y física: red deformable por vértices, pases reales entre compañeros, córners curvos con
 *   salto de rematadores, estiradas de porteros y Ceremonia 3D de Copa para el campeón
 */

(function(window) {
  'use strict';

  const PITCH_L = 105;
  const PITCH_W = 68;
  const HALF_L = PITCH_L / 2;
  const HALF_W = PITCH_W / 2;
  const BALL_RADIUS = 0.28;

  const CLUB_KIT_COLORS = {
    'Real Madrid': { shirt: 0xf8fafc, shorts: 0xf8fafc, accent: 0xd4af37, socks: 0xf8fafc, pattern: 'solid', numCol: '#0f172a' },
    'Barcelona':   { shirt: 0x004d98, shorts: 0xa50044, accent: 0xa50044, socks: 0x004d98, pattern: 'stripes', numCol: '#fde047' },
    'Ath Madrid':  { shirt: 0xcb3524, shorts: 0x002d62, accent: 0xffffff, socks: 0xcb3524, pattern: 'stripes', numCol: '#ffffff' },
    'Ath Bilbao':  { shirt: 0xee2524, shorts: 0x111827, accent: 0xffffff, socks: 0x111827, pattern: 'stripes', numCol: '#ffffff' },
    'Sevilla':     { shirt: 0xf8fafc, shorts: 0xf8fafc, accent: 0xd4001f, socks: 0x111827, pattern: 'solid', numCol: '#d4001f' },
    'Betis':       { shirt: 0x0bb365, shorts: 0xf8fafc, accent: 0xffffff, socks: 0x0bb365, pattern: 'stripes', numCol: '#0f172a' },
    'Sociedad':    { shirt: 0x0067b1, shorts: 0xf8fafc, accent: 0xffffff, socks: 0x0067b1, pattern: 'stripes', numCol: '#ffffff' },
    'Villarreal':  { shirt: 0xfacc15, shorts: 0xfacc15, accent: 0x1e3a8a, socks: 0xfacc15, pattern: 'solid', numCol: '#1e3a8a' },
    'Valencia':    { shirt: 0xf8fafc, shorts: 0x111827, accent: 0xf97316, socks: 0xf8fafc, pattern: 'solid', numCol: '#111827' },
    'Celta':       { shirt: 0x7dd3fc, shorts: 0xf8fafc, accent: 0xffffff, socks: 0x7dd3fc, pattern: 'solid', numCol: '#0c4a6e' },
    'Espanol':     { shirt: 0x007ac2, shorts: 0x007ac2, accent: 0xffffff, socks: 0x007ac2, pattern: 'stripes', numCol: '#ffffff' },
    'Girona':      { shirt: 0xcd2027, shorts: 0xcd2027, accent: 0xffffff, socks: 0xcd2027, pattern: 'stripes', numCol: '#ffffff' },
    'Osasuna':     { shirt: 0x991b1b, shorts: 0x0a1c3e, accent: 0x0a1c3e, socks: 0x0a1c3e, pattern: 'solid', numCol: '#fde047' },
    'Vallecano':   { shirt: 0xf8fafc, shorts: 0xf8fafc, accent: 0xde2128, socks: 0xf8fafc, pattern: 'sash', numCol: '#111827' },
    'Mallorca':    { shirt: 0xe20613, shorts: 0x111827, accent: 0x111827, socks: 0xe20613, pattern: 'solid', numCol: '#ffffff' },
    'Alaves':      { shirt: 0x0055a5, shorts: 0x0055a5, accent: 0xffffff, socks: 0x0055a5, pattern: 'stripes', numCol: '#ffffff' },
    'Getafe':      { shirt: 0x0055a5, shorts: 0x0055a5, accent: 0xffffff, socks: 0x0055a5, pattern: 'solid', numCol: '#ffffff' },
    'Las Palmas':  { shirt: 0xf7e017, shorts: 0x004077, accent: 0x004077, socks: 0x004077, pattern: 'solid', numCol: '#004077' },
    'Cadiz':       { shirt: 0xffe600, shorts: 0x004077, accent: 0x004077, socks: 0x004077, pattern: 'solid', numCol: '#004077' },
    'Granada':     { shirt: 0xa61c31, shorts: 0x003366, accent: 0xffffff, socks: 0xa61c31, pattern: 'hoops', numCol: '#ffffff' },
    'Almeria':     { shirt: 0xe30613, shorts: 0xe30613, accent: 0xffffff, socks: 0xe30613, pattern: 'stripes', numCol: '#ffffff' },
    'Elche':       { shirt: 0xf8fafc, shorts: 0xf8fafc, accent: 0x008559, socks: 0xf8fafc, pattern: 'hoops', numCol: '#008559' },
    'Leganes':     { shirt: 0x0055a5, shorts: 0xf8fafc, accent: 0xffffff, socks: 0x0055a5, pattern: 'stripes', numCol: '#ffffff' },
    'Levante':     { shirt: 0x004d98, shorts: 0x004d98, accent: 0xa50044, socks: 0x004d98, pattern: 'stripes', numCol: '#fde047' },
    'Valladolid':  { shirt: 0x552781, shorts: 0xf8fafc, accent: 0xffffff, socks: 0x552781, pattern: 'stripes', numCol: '#ffffff' },
    'Eibar':       { shirt: 0x003366, shorts: 0x003366, accent: 0xa50044, socks: 0x003366, pattern: 'stripes', numCol: '#ffffff' },
    'Huesca':      { shirt: 0x003366, shorts: 0x003366, accent: 0xa50044, socks: 0x003366, pattern: 'stripes', numCol: '#ffffff' },
    'La Coruna':   { shirt: 0x0055a5, shorts: 0xf8fafc, accent: 0xffffff, socks: 0x0055a5, pattern: 'stripes', numCol: '#ffffff' },
    'Malaga':      { shirt: 0x7dd3fc, shorts: 0xf8fafc, accent: 0xffffff, socks: 0x7dd3fc, pattern: 'stripes', numCol: '#0c4a6e' },
    'Oviedo':      { shirt: 0x0055a5, shorts: 0xf8fafc, accent: 0xffffff, socks: 0x0055a5, pattern: 'solid', numCol: '#ffffff' },
    'Sp Gijon':    { shirt: 0xde2128, shorts: 0x003366, accent: 0xffffff, socks: 0x003366, pattern: 'stripes', numCol: '#ffffff' }
  };

  function getClubKit(name) {
    return CLUB_KIT_COLORS[name] || { shirt: 0xf8fafc, shorts: 0xf8fafc, accent: 0x2563eb, socks: 0xf8fafc, pattern: 'solid', numCol: '#0f172a' };
  }

  function hexToCss(hex) {
    return '#' + (hex >>> 0).toString(16).padStart(6, '0');
  }

  function lerpAngle(current, target, alpha) {
    let diff = target - current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return current + diff * alpha;
  }

  const ZONE_COORDS = {
    'home_box': { x: -41.0, z: 0.0, y: 0.0 },
    'home_def': { x: -28.0, z: 6.0, y: 0.0 },
    'midfield': { x: 0.0, z: 0.0, y: 0.0 },
    'away_att': { x: 28.0, z: -6.0, y: 0.0 },
    'away_box': { x: 41.0, z: 0.0, y: 0.0 },
    'attack_home': { x: 34.0, z: 5.0, y: 0.0 },
    'attack_away': { x: -34.0, z: -5.0, y: 0.0 },
    'home_goal_net': { x: -53.4, z: 0.0, y: 0.9 },
    'away_goal_net': { x: 53.4, z: 0.0, y: 0.9 },
    'corner_nw': { x: -HALF_L + 1, z: -HALF_W + 1, y: 0.0 },
    'corner_ne': { x: HALF_L - 1, z: -HALF_W + 1, y: 0.0 },
    'corner_sw': { x: -HALF_L + 1, z: HALF_W - 1, y: 0.0 },
    'corner_se': { x: HALF_L - 1, z: HALF_W - 1, y: 0.0 }
  };

  class Stadium3D {
    constructor() {
      this.container = null;
      this.canvas = null;
      this.renderer = null;
      this.scene = null;
      this.camera = null;
      this.controls = null;
      this.animFrameId = null;
      this.lastFrameTime = 0;
      this.webglSupported = true;

      // Iluminación y cielo configurables
      this.timeOfDay = 'night';
      this.skyTex = null;
      this.skyCanvas = null;
      this.skyCtx = null;
      this.hemiLight = null;
      this.keyLight = null;
      this.fillLight = null;
      this.floodSpots = [];
      this.floodHalos = [];

      // Elementos del estadio
      this.ballMesh = null;
      this.ballShadow = null;
      this.goalNetHome = null;
      this.goalNetAway = null;
      this.goalBackNetHome = null;
      this.goalBackNetAway = null;
      this.netShakeState = { active: false, net: null, backMesh: null, dir: 1, startTime: 0, duration: 950 };

      // Videomarcador 3D (Jumbotron)
      this.jumboCanvas = null;
      this.jumboCtx = null;
      this.jumboTex = null;

      // Vallas LED dinámicas
      this.ledMaterial = null;
      this.ledCanvas = null;
      this.ledCtx = null;
      this.ledTex = null;
      this.ledOffset = 0;

      // Mapa de calor y Shot Map 3D
      this.heatmapMesh = null;
      this.heatmapCanvas = null;
      this.heatmapCtx = null;
      this.heatmapTex = null;
      this.heatPointCount = 0;
      this.shotMapGroup = null;
      this.shotMapVisible = false;

      // Estela y arcos de tiro
      this.ballTrail = null;
      this.ballTrailMaxPts = 18;
      this.ballTrailPositions = null;
      this.activeShotArcs = [];
      this.activeRings = [];
      this.activeParticles = [];

      // Jugadores, kits dinámicos y árbitro
      this.homeMaterials = null;
      this.awayMaterials = null;
      this.homeTorsoMats = [];
      this.awayTorsoMats = [];
      this.playersHome = [];
      this.playersAway = [];
      this.goalkeeperHome = null;
      this.goalkeeperAway = null;
      this.referee = null;
      this.refereeCardMesh = null;
      this.refereeCardUntil = 0;

      // Multitud, bufandas y tifos
      this.crowdMesh = null;
      this.crowdHeadsMesh = null;
      this.crowdScarvesMesh = null;
      this.crowdCount = 0;
      this.crowdData = [];
      this._crowdDummy = typeof THREE !== 'undefined' ? new THREE.Object3D() : null;
      this._tempColor = typeof THREE !== 'undefined' ? new THREE.Color() : null;
      this.crowdExcitementUntil = 0;
      this.crowdExcitementSide = 'all';
      this.flashPoints = null;
      this.homeFlags = [];
      this.awayFlags = [];
      this.flags = [];
      this.tifoHome = null;
      this.tifoAway = null;
      this.tifoHomeUntil = 0;
      this.tifoAwayUntil = 0;

      // Ceremonia de Copa 3D
      this.podiumGroup = null;
      this.trophyGroup = null;
      this.ceremonyMode = null;
      this.ceremonyStart = 0;
      this.ceremonyCaptain = null;
      this.ceremonyLastConfetti = 0;

      // Estado del balón y rebote/curva
      this.ballState = {
        startX: 0, startY: BALL_RADIUS, startZ: 0,
        targetX: 0, targetY: BALL_RADIUS, targetZ: 0,
        peakY: 0,
        curveX: 0,
        curveZ: 0,
        startTime: 0,
        duration: 1000,
        isMoving: false,
        currentX: 0, currentY: BALL_RADIUS, currentZ: 0,
        bounceAmp: 0,
        bounceStart: 0,
        bounceDuration: 650
      };

      // Cámaras y camera shake
      this.cameraMode = 'broadcast';
      this.cameraTarget = typeof THREE !== 'undefined' ? new THREE.Vector3(0, 1.8, -4) : null;
      this.cameraGoal = typeof THREE !== 'undefined' ? new THREE.Vector3(0, 27.5, 58) : null;
      this.isUserOrbiting = false;
      this.userOverrideCamera = false;
      this.isGoalZoom = false;
      this.goalZoomUntil = 0;
      this.cameraShakeUntil = 0;
      this.cameraShakeAmp = 0;
      this.isInitialized = false;

      // Partido
      this.homeTeamName = 'Real Madrid';
      this.awayTeamName = 'Barcelona';
      this.currentHomeScore = 0;
      this.currentAwayScore = 0;
      this.currentMinute = 0;
    }

    init(containerId, homeTeam = 'Real Madrid', awayTeam = 'Barcelona') {
      this.homeTeamName = homeTeam;
      this.awayTeamName = awayTeam;

      this.container = document.getElementById(containerId);
      if (!this.container) return false;

      if (typeof THREE === 'undefined') {
        this.handleWebGLFallback('Three.js no disponible');
        return false;
      }

      if (!this._crowdDummy) this._crowdDummy = new THREE.Object3D();
      if (!this._tempColor) this._tempColor = new THREE.Color();
      if (!this.cameraTarget) this.cameraTarget = new THREE.Vector3(0, 1.8, -4);
      if (!this.cameraGoal) this.cameraGoal = new THREE.Vector3(0, 27.5, 58);

      this.canvas = document.getElementById('stadium-3d-canvas');
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'stadium-3d-canvas';
        this.container.appendChild(this.canvas);
      }

      if (this.isInitialized) {
        this.updateTeams(homeTeam, awayTeam);
        return true;
      }

      const width = this.container.clientWidth || 748;
      const height = this.container.clientHeight || 438;

      try {
        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        });
      } catch (err) {
        this.handleWebGLFallback(err && err.message ? err.message : 'Contexto WebGL no disponible');
        return false;
      }

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if (THREE.ACESFilmicToneMapping !== undefined) {
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
      }
      if (THREE.sRGBEncoding !== undefined) {
        this.renderer.outputEncoding = THREE.sRGBEncoding;
      }

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x040812);
      this.scene.fog = new THREE.FogExp2(0x050a16, 0.0022);

      this.camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 650);
      this.camera.position.set(0, 27.5, 58);
      this.camera.lookAt(0, 1.8, -4);

      if (typeof THREE.OrbitControls !== 'undefined') {
        this.controls = new THREE.OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.07;
        this.controls.maxPolarAngle = Math.PI / 2.04;
        this.controls.minDistance = 6;
        this.controls.maxDistance = 148;
        this.controls.target.set(0, 1.8, -4);

        this.controls.addEventListener('start', () => {
          this.isUserOrbiting = true;
          this.userOverrideCamera = true;
        });
        this.controls.addEventListener('end', () => {
          this.isUserOrbiting = false;
        });
      }

      this.buildSkyDome();
      this.buildLighting();
      this.buildPitch();
      this.buildTacticalHeatmap();
      this.buildShotMap();
      this.buildGrandstands();
      this.buildJumbotron();
      this.buildDugouts();
      this.buildCrowd();
      this.buildTifoBanners();
      this.buildSupporterFlags();
      this.buildGoals();
      this.buildLedPerimeter();
      this.buildPlayers();
      this.buildBall();
      this.buildBallTracer();
      this.buildCornerFlags();
      this.buildTrophy();

      this.setTimeOfDay(this.timeOfDay);

      this.onResize = this.onResize.bind(this);
      window.addEventListener('resize', this.onResize);

      this.isInitialized = true;
      this.webglSupported = true;
      this.lastFrameTime = performance.now();
      this.animate();
      return true;
    }

    handleWebGLFallback(reason) {
      this.webglSupported = false;
      console.warn('[Stadium3D] Fallback a 2D Táctico:', reason);
      const btn2D = document.getElementById('sim-btn-view-2d');
      if (btn2D) btn2D.click();
    }

    buildSkyDome() {
      const skyGeo = new THREE.SphereGeometry(290, 24, 16);
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 256;
      this.skyCanvas = canvas;
      this.skyCtx = canvas.getContext('2d');
      this.skyTex = new THREE.CanvasTexture(canvas);
      const skyMat = new THREE.MeshBasicMaterial({ map: this.skyTex, side: THREE.BackSide, fog: false });
      this.scene.add(new THREE.Mesh(skyGeo, skyMat));
    }

    buildLighting() {
      this.hemiLight = new THREE.HemisphereLight(0xbfe0ff, 0x0c2419, 0.7);
      this.scene.add(this.hemiLight);

      this.keyLight = new THREE.DirectionalLight(0xf0f9ff, 0.95);
      this.keyLight.position.set(28, 74, 34);
      this.keyLight.castShadow = true;
      this.keyLight.shadow.mapSize.width = 2048;
      this.keyLight.shadow.mapSize.height = 2048;
      this.keyLight.shadow.camera.near = 15;
      this.keyLight.shadow.camera.far = 185;
      this.keyLight.shadow.camera.left = -64;
      this.keyLight.shadow.camera.right = 64;
      this.keyLight.shadow.camera.top = 48;
      this.keyLight.shadow.camera.bottom = -48;
      this.keyLight.shadow.bias = -0.0005;
      this.scene.add(this.keyLight);

      this.fillLight = new THREE.DirectionalLight(0x93c5fd, 0.36);
      this.fillLight.position.set(-34, 52, -32);
      this.scene.add(this.fillLight);

      const glowCanvas = document.createElement('canvas');
      glowCanvas.width = 128;
      glowCanvas.height = 128;
      const gCtx = glowCanvas.getContext('2d');
      const gGrad = gCtx.createRadialGradient(64, 64, 4, 64, 64, 64);
      gGrad.addColorStop(0, 'rgba(255, 252, 224, 1.0)');
      gGrad.addColorStop(0.25, 'rgba(254, 243, 199, 0.55)');
      gGrad.addColorStop(0.6, 'rgba(186, 230, 253, 0.16)');
      gGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      gCtx.fillStyle = gGrad;
      gCtx.fillRect(0, 0, 128, 128);
      const glowTex = new THREE.CanvasTexture(glowCanvas);

      const towers = [
        { x: -66, z: -46 }, { x: 66, z: -46 },
        { x: -66, z: 46 }, { x: 66, z: 46 }
      ];

      const towerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.28 });
      const headMat = new THREE.MeshBasicMaterial({ color: 0xfefce8 });
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });

      this.floodSpots = [];
      this.floodHalos = [];

      towers.forEach(pos => {
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 1.25, 42, 8), towerMat);
        tower.position.set(pos.x, 21, pos.z);
        this.scene.add(tower);

        const rack = new THREE.Mesh(new THREE.BoxGeometry(6.2, 4.2, 1.2), frameMat);
        rack.position.set(pos.x, 42, pos.z);
        rack.lookAt(0, 0, 0);
        this.scene.add(rack);

        const panel = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 3.4), headMat);
        panel.position.set(pos.x * 0.985, 42, pos.z * 0.985);
        panel.lookAt(0, 0, 0);
        this.scene.add(panel);

        const spriteMat = new THREE.SpriteMaterial({
          map: glowTex,
          color: 0xfef9c3,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const halo = new THREE.Sprite(spriteMat);
        halo.position.set(pos.x * 0.97, 42, pos.z * 0.97);
        halo.scale.set(20, 20, 1);
        this.scene.add(halo);
        this.floodHalos.push(halo);

        const spot = new THREE.SpotLight(0xfef9c3, 0.82);
        spot.position.set(pos.x, 42, pos.z);
        spot.target.position.set(pos.x * 0.22, 0, pos.z * 0.22);
        spot.angle = Math.PI / 4;
        spot.penumbra = 0.65;
        spot.distance = 195;
        this.scene.add(spot);
        this.scene.add(spot.target);
        this.floodSpots.push(spot);
      });
    }

    /**
     * Cambia en caliente la iluminación y cielo del estadio: 'night', 'sunset', 'day'
     */
    setTimeOfDay(mode) {
      this.timeOfDay = mode;
      if (!this.scene || !this.skyCtx) return;

      const ctx = this.skyCtx;
      const grad = ctx.createLinearGradient(0, 0, 0, 256);

      if (mode === 'sunset') {
        grad.addColorStop(0.0, '#0f172a');
        grad.addColorStop(0.45, '#311042');
        grad.addColorStop(0.76, '#b45309');
        grad.addColorStop(0.92, '#f97316');
        grad.addColorStop(1.0, '#1e1b4b');
        this.scene.background.setHex(0x1f142b);
        this.scene.fog = new THREE.FogExp2(0x28172b, 0.002);
        if (this.hemiLight) { this.hemiLight.color.setHex(0xfdba74); this.hemiLight.groundColor.setHex(0x1e293b); this.hemiLight.intensity = 0.8; }
        if (this.keyLight) { this.keyLight.color.setHex(0xffedd5); this.keyLight.intensity = 1.15; }
        if (this.fillLight) { this.fillLight.color.setHex(0xc084fc); this.fillLight.intensity = 0.4; }
        this.floodSpots.forEach(s => s.intensity = 0.65);
        this.floodHalos.forEach(h => h.material.opacity = 0.55);
        if (this.renderer) this.renderer.toneMappingExposure = 1.08;
      } else if (mode === 'day') {
        grad.addColorStop(0.0, '#1d4ed8');
        grad.addColorStop(0.55, '#3b82f6');
        grad.addColorStop(0.88, '#93c5fd');
        grad.addColorStop(1.0, '#bae6fd');
        this.scene.background.setHex(0x60a5fa);
        this.scene.fog = new THREE.FogExp2(0x93c5fd, 0.0012);
        if (this.hemiLight) { this.hemiLight.color.setHex(0xe0f2fe); this.hemiLight.groundColor.setHex(0x166534); this.hemiLight.intensity = 0.95; }
        if (this.keyLight) { this.keyLight.color.setHex(0xffffff); this.keyLight.intensity = 1.3; }
        if (this.fillLight) { this.fillLight.color.setHex(0xbfdbfe); this.fillLight.intensity = 0.45; }
        this.floodSpots.forEach(s => s.intensity = 0.15);
        this.floodHalos.forEach(h => h.material.opacity = 0.08);
        if (this.renderer) this.renderer.toneMappingExposure = 1.0;
      } else {
        grad.addColorStop(0.0, '#02040a');
        grad.addColorStop(0.5, '#071126');
        grad.addColorStop(0.78, '#13244a');
        grad.addColorStop(0.92, '#1e3a6d');
        grad.addColorStop(1.0, '#040812');
        this.scene.background.setHex(0x040812);
        this.scene.fog = new THREE.FogExp2(0x050a16, 0.0022);
        if (this.hemiLight) { this.hemiLight.color.setHex(0xbfe0ff); this.hemiLight.groundColor.setHex(0x0c2419); this.hemiLight.intensity = 0.7; }
        if (this.keyLight) { this.keyLight.color.setHex(0xf0f9ff); this.keyLight.intensity = 0.95; }
        if (this.fillLight) { this.fillLight.color.setHex(0x93c5fd); this.fillLight.intensity = 0.36; }
        this.floodSpots.forEach(s => s.intensity = 0.82);
        this.floodHalos.forEach(h => h.material.opacity = 0.8);
        if (this.renderer) this.renderer.toneMappingExposure = 1.15;
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 256);
      if (this.skyTex) this.skyTex.needsUpdate = true;
    }

    buildPitch() {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1326;
      const ctx = canvas.getContext('2d');
      const W = canvas.width;
      const H = canvas.height;

      const stripes = 18;
      const sw = W / stripes;
      for (let i = 0; i < stripes; i++) {
        ctx.fillStyle = (i % 2 === 0) ? '#155e31' : '#1b733b';
        ctx.fillRect(i * sw, 0, sw, H);
      }

      for (let i = 0; i < 9000; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.03)';
        ctx.fillRect(Math.random() * W, Math.random() * H, 4, 2);
      }

      const padX = 66;
      const padY = 66;
      const fw = W - padX * 2;
      const fh = H - padY * 2;
      const mx = W / 2;
      const my = H / 2;

      const drawWear = (wx, wy, rad) => {
        const g = ctx.createRadialGradient(wx, wy, 0, wx, wy, rad);
        g.addColorStop(0, 'rgba(130, 115, 72, 0.16)');
        g.addColorStop(0.6, 'rgba(130, 115, 72, 0.06)');
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(wx, wy, rad, 0, Math.PI * 2);
        ctx.fill();
      };
      drawWear(padX + 42, my, 90);
      drawWear(padX + fw - 42, my, 90);
      drawWear(mx, my, 55);

      ctx.strokeStyle = 'rgba(248, 250, 252, 0.92)';
      ctx.lineWidth = 8;

      ctx.strokeRect(padX, padY, fw, fh);
      ctx.beginPath();
      ctx.moveTo(mx, padY);
      ctx.lineTo(mx, padY + fh);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(mx, my, (9.15 / PITCH_L) * fw, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(mx, my, 8, 0, Math.PI * 2);
      ctx.fill();

      const penW = (16.5 / PITCH_L) * fw;
      const penH = (40.32 / PITCH_W) * fh;
      const penY = my - penH / 2;
      ctx.strokeRect(padX, penY, penW, penH);
      ctx.strokeRect(padX + fw - penW, penY, penW, penH);

      const gBoxW = (5.5 / PITCH_L) * fw;
      const gBoxH = (18.32 / PITCH_W) * fh;
      const gBoxY = my - gBoxH / 2;
      ctx.strokeRect(padX, gBoxY, gBoxW, gBoxH);
      ctx.strokeRect(padX + fw - gBoxW, gBoxY, gBoxW, gBoxH);

      const pDist = (11.0 / PITCH_L) * fw;
      ctx.beginPath();
      ctx.arc(padX + pDist, my, 7, 0, Math.PI * 2);
      ctx.arc(padX + fw - pDist, my, 7, 0, Math.PI * 2);
      ctx.fill();

      const arcR = (9.15 / PITCH_L) * fw;
      ctx.beginPath();
      ctx.arc(padX + pDist, my, arcR, -0.65, 0.65);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(padX + fw - pDist, my, arcR, Math.PI - 0.65, Math.PI + 0.65);
      ctx.stroke();

      const cornerR = (1.5 / PITCH_L) * fw;
      ctx.beginPath(); ctx.arc(padX, padY, cornerR, 0, Math.PI / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(padX + fw, padY, cornerR, Math.PI / 2, Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(padX + fw, padY + fh, cornerR, Math.PI, Math.PI * 1.5); ctx.stroke();
      ctx.beginPath(); ctx.arc(padX, padY + fh, cornerR, Math.PI * 1.5, Math.PI * 2); ctx.stroke();

      const pitchTex = new THREE.CanvasTexture(canvas);
      pitchTex.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
      if (THREE.sRGBEncoding !== undefined) pitchTex.encoding = THREE.sRGBEncoding;

      const pitchMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(PITCH_L, PITCH_W),
        new THREE.MeshStandardMaterial({ map: pitchTex, roughness: 0.72, metalness: 0.05 })
      );
      pitchMesh.rotation.x = -Math.PI / 2;
      pitchMesh.receiveShadow = true;
      this.scene.add(pitchMesh);

      const apron = new THREE.Mesh(
        new THREE.PlaneGeometry(PITCH_L + 30, PITCH_W + 26),
        new THREE.MeshStandardMaterial({ color: 0x0b1526, roughness: 0.9, metalness: 0.05 })
      );
      apron.position.y = -0.05;
      apron.rotation.x = -Math.PI / 2;
      apron.receiveShadow = true;
      this.scene.add(apron);

      // Líneas de área técnica frente a los banquillos
      const techMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.55 });
      [-18, 18].forEach(tx => {
        const boxBorder = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.08, 4), techMat);
        boxBorder.rotation.x = -Math.PI / 2;
        boxBorder.rotation.z = Math.PI / 4;
        boxBorder.scale.set(6.5, 1.6, 1);
        boxBorder.position.set(tx, 0.02, -HALF_W - 2.6);
        this.scene.add(boxBorder);
      });
    }

    buildTacticalHeatmap() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 340;
      this.heatmapCanvas = canvas;
      this.heatmapCtx = canvas.getContext('2d');

      this.heatmapTex = new THREE.CanvasTexture(canvas);
      const heatMat = new THREE.MeshBasicMaterial({
        map: this.heatmapTex,
        transparent: true,
        opacity: 0.56,
        depthWrite: false
      });

      this.heatmapMesh = new THREE.Mesh(new THREE.PlaneGeometry(PITCH_L - 2, PITCH_W - 2), heatMat);
      this.heatmapMesh.rotation.x = -Math.PI / 2;
      this.heatmapMesh.position.set(0, 0.04, 0);
      this.heatmapMesh.visible = false;
      this.scene.add(this.heatmapMesh);

      this.resetHeatmap();
    }

    resetHeatmap() {
      if (!this.heatmapCtx || !this.heatmapCanvas || !this.heatmapTex) return;
      this.heatmapCtx.clearRect(0, 0, this.heatmapCanvas.width, this.heatmapCanvas.height);
      this.heatPointCount = 0;
      this.heatmapTex.needsUpdate = true;
    }

    recordHeatPoint(worldX, worldZ, intensity = 0.45, radiusPx = 52) {
      if (!this.heatmapCtx || !this.heatmapCanvas || !this.heatmapTex) return;

      const u = (worldX + HALF_L) / PITCH_L;
      const v = (worldZ + HALF_W) / PITCH_W;
      const cx = Math.max(0, Math.min(1, u)) * this.heatmapCanvas.width;
      const cy = Math.max(0, Math.min(1, v)) * this.heatmapCanvas.height;

      const ctx = this.heatmapCtx;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radiusPx);
      grad.addColorStop(0.0, `rgba(239, 68, 68, ${intensity})`);
      grad.addColorStop(0.38, `rgba(245, 158, 11, ${intensity * 0.72})`);
      grad.addColorStop(0.75, `rgba(234, 179, 8, ${intensity * 0.3})`);
      grad.addColorStop(1.0, 'rgba(16, 185, 129, 0)');

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      this.heatPointCount++;
      this.heatmapTex.needsUpdate = true;
    }

    toggleHeatmap() {
      if (!this.heatmapMesh) return false;
      if (!this.heatmapMesh.visible && this.heatPointCount === 0) {
        this.recordHeatPoint(0, 0, 0.35, 68);
      }
      this.heatmapMesh.visible = !this.heatmapMesh.visible;
      return this.heatmapMesh.visible;
    }

    /**
     * Pines 3D de Shot Map sobre el césped
     */
    buildShotMap() {
      this.shotMapGroup = new THREE.Group();
      this.shotMapGroup.visible = false;
      this.scene.add(this.shotMapGroup);
    }

    addShotPin(x, z, type) {
      if (!this.shotMapGroup) return;
      const colorHex = type === 'goal' ? 0x10b981 : (type === 'shot_saved' ? 0x38bdf8 : 0xf97316);
      const pin = new THREE.Group();

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8),
        new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.85 })
      );
      stem.position.y = 0.9;
      pin.add(stem);

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(type === 'goal' ? 0.45 : 0.32, 12, 12),
        new THREE.MeshBasicMaterial({ color: colorHex })
      );
      head.position.y = 1.9;
      pin.add(head);

      const baseRing = new THREE.Mesh(
        new THREE.RingGeometry(0.4, 0.65, 16),
        new THREE.MeshBasicMaterial({ color: colorHex, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
      );
      baseRing.rotation.x = -Math.PI / 2;
      baseRing.position.y = 0.05;
      pin.add(baseRing);

      pin.position.set(x, 0, z);
      this.shotMapGroup.add(pin);
    }

    clearShotMap() {
      if (!this.shotMapGroup) return;
      while (this.shotMapGroup.children.length > 0) {
        const ch = this.shotMapGroup.children[0];
        this.shotMapGroup.remove(ch);
      }
    }

    toggleShotMap() {
      if (!this.shotMapGroup) return false;
      this.shotMapVisible = !this.shotMapVisible;
      this.shotMapGroup.visible = this.shotMapVisible;
      return this.shotMapVisible;
    }

    buildBallTracer() {
      const maxPts = this.ballTrailMaxPts;
      this.ballTrailPositions = new Float32Array(maxPts * 3);
      for (let i = 0; i < maxPts; i++) {
        this.ballTrailPositions[i * 3] = 0;
        this.ballTrailPositions[i * 3 + 1] = BALL_RADIUS;
        this.ballTrailPositions[i * 3 + 2] = 0;
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(this.ballTrailPositions, 3));
      const mat = new THREE.LineBasicMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.38
      });
      this.ballTrail = new THREE.Line(geom, mat);
      this.ballTrail.frustumCulled = false;
      this.ballTrail.visible = false;
      this.scene.add(this.ballTrail);
    }

    /**
     * Arco 3D luminoso para tiros a puerta y goles
     */
    spawnShotArc(sx, sy, sz, tx, ty, tz, peakY, curveX, curveZ, colorHex) {
      if (!this.scene) return;
      const steps = 22;
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = sx + (tx - sx) * t + 4 * curveX * t * (1 - t);
        const z = sz + (tz - sz) * t + 4 * curveZ * t * (1 - t);
        const y = sy + (ty - sy) * t + 4 * peakY * t * (1 - t);
        pts.push(new THREE.Vector3(x, Math.max(0.2, y), z));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9 });
      const line = new THREE.Line(geo, mat);
      this.scene.add(line);
      this.activeShotArcs.push({ line, geo, mat, startTime: performance.now(), duration: 1650 });
    }

    buildGrandstands() {
      const standGroup = new THREE.Group();
      const concreteMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.88, metalness: 0.1 });
      const seatBlueMat = new THREE.MeshStandardMaterial({ color: 0x172554, roughness: 0.72 });
      const seatSlateMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 });
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x0b1220, metalness: 0.85, roughness: 0.25 });
      const fasciaMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
      const rimGlowMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });

      const NUM_STEPS = 8;
      const STEP_H = 1.85;
      const STEP_D = 2.4;
      const FRONT_Z = HALF_W + 6.5;
      const FRONT_X = HALF_L + 7.5;

      this.standDims = { NUM_STEPS, STEP_H, STEP_D, FRONT_Z, FRONT_X };

      const createTieredStand = (width, numSteps, depthStep, heightStep) => {
        const group = new THREE.Group();
        for (let s = 0; s < numSteps; s++) {
          const totalH = (s + 1) * heightStep;
          const geo = new THREE.BoxGeometry(width, totalH, depthStep);
          const mat = (s === 3) ? concreteMat : (s % 2 === 0 ? seatBlueMat : seatSlateMat);
          const step = new THREE.Mesh(geo, mat);
          step.position.set(0, totalH / 2, -(s * depthStep + depthStep / 2));
          step.receiveShadow = true;
          group.add(step);
        }
        return group;
      };

      const nStand = createTieredStand(PITCH_L + 14, NUM_STEPS, STEP_D, STEP_H);
      nStand.position.set(0, 0, -FRONT_Z);
      standGroup.add(nStand);

      const sStand = createTieredStand(PITCH_L + 14, NUM_STEPS, STEP_D, STEP_H);
      sStand.position.set(0, 0, FRONT_Z);
      sStand.rotation.y = Math.PI;
      standGroup.add(sStand);

      const wStand = createTieredStand(PITCH_W + 12, NUM_STEPS, STEP_D, STEP_H);
      wStand.position.set(-FRONT_X, 0, 0);
      wStand.rotation.y = Math.PI / 2;
      standGroup.add(wStand);

      const eStand = createTieredStand(PITCH_W + 12, NUM_STEPS, STEP_D, STEP_H);
      eStand.position.set(FRONT_X, 0, 0);
      eStand.rotation.y = -Math.PI / 2;
      standGroup.add(eStand);

      // 4 Esquinas enlazadas a 45°
      const corners = [
        { x: -FRONT_X + 2, z: -FRONT_Z + 2, rotY: Math.PI / 4 },
        { x: FRONT_X - 2, z: -FRONT_Z + 2, rotY: -Math.PI / 4 },
        { x: -FRONT_X + 2, z: FRONT_Z - 2, rotY: (3 * Math.PI) / 4 },
        { x: FRONT_X - 2, z: FRONT_Z - 2, rotY: (-3 * Math.PI) / 4 }
      ];
      corners.forEach(c => {
        const cornerBlock = createTieredStand(24, NUM_STEPS, STEP_D, STEP_H);
        cornerBlock.position.set(c.x, 0, c.z);
        cornerBlock.rotation.y = c.rotY;
        standGroup.add(cornerBlock);
      });

      // Túnel central de vestuarios en tribuna Norte con iluminación interior
      const tunnelFrame = new THREE.Mesh(
        new THREE.BoxGeometry(7.2, 4.1, 3.5),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.3 })
      );
      tunnelFrame.position.set(0, 2.05, -FRONT_Z + 0.3);
      standGroup.add(tunnelFrame);

      const tunnelArchSign = new THREE.Mesh(
        new THREE.BoxGeometry(7.2, 0.45, 0.4),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      tunnelArchSign.position.set(0, 4.15, -FRONT_Z + 2.0);
      standGroup.add(tunnelArchSign);

      const tunnelVoid = new THREE.Mesh(
        new THREE.BoxGeometry(5.4, 3.2, 3.7),
        new THREE.MeshBasicMaterial({ color: 0x0c4a6e })
      );
      tunnelVoid.position.set(0, 1.6, -FRONT_Z + 0.35);
      standGroup.add(tunnelVoid);

      const fasciaY = 4 * STEP_H + 0.35;
      const fasciaN = new THREE.Mesh(new THREE.BoxGeometry(PITCH_L + 12, 0.7, 0.35), fasciaMat);
      fasciaN.position.set(0, fasciaY, -(FRONT_Z + 3 * STEP_D));
      standGroup.add(fasciaN);

      const fasciaS = new THREE.Mesh(new THREE.BoxGeometry(PITCH_L + 12, 0.7, 0.35), fasciaMat);
      fasciaS.position.set(0, fasciaY, FRONT_Z + 3 * STEP_D);
      standGroup.add(fasciaS);

      const roofY = NUM_STEPS * STEP_H + 5.0;
      const roofN = new THREE.Mesh(new THREE.BoxGeometry(PITCH_L + 36, 1.0, 20), roofMat);
      roofN.position.set(0, roofY, -(FRONT_Z + 12));
      roofN.rotation.x = 0.08;
      standGroup.add(roofN);

      const roofRimN = new THREE.Mesh(new THREE.BoxGeometry(PITCH_L + 16, 0.28, 0.35), rimGlowMat);
      roofRimN.position.set(0, roofY - 0.9, -(FRONT_Z + 2.2));
      standGroup.add(roofRimN);

      const roofS = new THREE.Mesh(new THREE.BoxGeometry(PITCH_L + 36, 1.0, 14), roofMat);
      roofS.position.set(0, roofY + 1.5, FRONT_Z + 18);
      roofS.rotation.x = -0.08;
      standGroup.add(roofS);

      const roofW = new THREE.Mesh(new THREE.BoxGeometry(20, 1.0, PITCH_W + 34), roofMat);
      roofW.position.set(-(FRONT_X + 12), roofY, 0);
      roofW.rotation.z = -0.08;
      standGroup.add(roofW);

      const roofRimW = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, PITCH_W + 14), rimGlowMat);
      roofRimW.position.set(-(FRONT_X + 2.2), roofY - 0.9, 0);
      standGroup.add(roofRimW);

      const roofE = new THREE.Mesh(new THREE.BoxGeometry(20, 1.0, PITCH_W + 34), roofMat);
      roofE.position.set(FRONT_X + 12, roofY, 0);
      roofE.rotation.z = 0.08;
      standGroup.add(roofE);

      const roofRimE = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, PITCH_W + 14), rimGlowMat);
      roofRimE.position.set(FRONT_X + 2.2, roofY - 0.9, 0);
      standGroup.add(roofRimE);

      const pillarGeo = new THREE.CylinderGeometry(0.35, 0.45, roofY, 8);
      for (let px = -52; px <= 52; px += 26) {
        const pN = new THREE.Mesh(pillarGeo, roofMat);
        pN.position.set(px, roofY / 2, -(FRONT_Z + 20));
        standGroup.add(pN);
      }

      this.scene.add(standGroup);
    }

    /**
     * Videomarcador 3D gigante (Jumbotron) suspendido en la cubierta Norte
     */
    buildJumbotron() {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 280;
      this.jumboCanvas = canvas;
      this.jumboCtx = canvas.getContext('2d');
      this.jumboTex = new THREE.CanvasTexture(canvas);

      const group = new THREE.Group();
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(26, 7.6, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.25 })
      );
      group.add(frame);

      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(24.6, 6.4),
        new THREE.MeshBasicMaterial({ map: this.jumboTex })
      );
      screen.position.z = 0.65;
      group.add(screen);

      // Soportes hacia cubierta
      const strutGeo = new THREE.CylinderGeometry(0.22, 0.22, 4.5, 8);
      const strutMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
      [-8, 8].forEach(sx => {
        const strut = new THREE.Mesh(strutGeo, strutMat);
        strut.position.set(sx, 5.2, -0.2);
        group.add(strut);
      });

      group.position.set(0, 16.8, -(this.standDims.FRONT_Z + 2.2));
      group.rotation.x = 0.16;
      this.scene.add(group);

      this.updateJumbotron(this.homeTeamName, this.awayTeamName, 0, 0, 0, 'EN VIVO');
    }

    updateJumbotron(homeTeam, awayTeam, hScore, aScore, minute, statusTxt = 'EN VIVO') {
      if (!this.jumboCtx || !this.jumboCanvas || !this.jumboTex) return;
      const ctx = this.jumboCtx;
      const W = this.jumboCanvas.width;
      const H = this.jumboCanvas.height;

      const homeKit = getClubKit(homeTeam);
      const awayKit = getClubKit(awayTeam);

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, W, H);

      // Barras laterales de color de cada club
      ctx.fillStyle = hexToCss(homeKit.shirt);
      ctx.fillRect(0, 0, 22, H);
      ctx.fillStyle = hexToCss(awayKit.shirt);
      ctx.fillRect(W - 22, 0, 22, H);

      // Borde superior e inferior neón
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(22, 0, W - 44, 6);
      ctx.fillRect(22, H - 6, W - 44, 6);

      // Nombres y Marcador
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 38px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(homeTeam || 'LOCAL').toUpperCase().slice(0, 13), 50, H * 0.48);

      ctx.textAlign = 'right';
      ctx.fillText(String(awayTeam || 'VISITANTE').toUpperCase().slice(0, 13), W - 50, H * 0.48);

      // Marcador central
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(W / 2 - 140, 38, 280, 132);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(W / 2 - 140, 38, 280, 132);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 84px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${hScore} - ${aScore}`, W / 2, 108);

      // Reloj y estado
      ctx.fillStyle = statusTxt.includes('GOL') || statusTxt.includes('CAMPE') ? '#facc15' : '#38bdf8';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(`${statusTxt}  •  ${String(minute).padStart(2, '0')}:00`, W / 2, 226);

      this.jumboTex.needsUpdate = true;
    }

    updateClockMinute(min) {
      this.currentMinute = min;
      this.updateJumbotron(this.homeTeamName, this.awayTeamName, this.currentHomeScore, this.currentAwayScore, min, min < 45 ? '1T EN VIVO' : '2T EN VIVO');
    }

    buildDugouts() {
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.28,
        roughness: 0.15,
        metalness: 0.3
      });
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
      const seatMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 });
      const bibMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.6 });
      const suitMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.7 });

      [-18, 18].forEach((posX, dIdx) => {
        const dugout = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.25, 2.2), frameMat);
        base.position.y = 0.12;
        dugout.add(base);

        const backGlass = new THREE.Mesh(new THREE.BoxGeometry(9.5, 2.1, 0.12), glassMat);
        backGlass.position.set(0, 1.15, -1.0);
        dugout.add(backGlass);

        const canopy = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.14, 2.3), glassMat);
        canopy.position.set(0, 2.25, 0.05);
        dugout.add(canopy);

        for (let s = -3.6; s <= 3.6; s += 1.2) {
          const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.6), seatMat);
          seat.position.set(s, 0.65, -0.3);
          dugout.add(seat);
        }

        // 3 Suplentes con petos naranjas sentados en el banquillo
        [-2.4, 0, 2.4].forEach(sx => {
          const subTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.75, 6), bibMat);
          subTorso.position.set(sx, 1.05, -0.15);
          dugout.add(subTorso);
          const subHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), skinMat);
          subHead.position.set(sx, 1.58, -0.15);
          dugout.add(subHead);
        });

        // Entrenador de pie junto al área técnica
        const coachX = dIdx === 0 ? 5.6 : -5.6;
        const coachBody = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 1.45, 8), suitMat);
        coachBody.position.set(coachX, 0.9, 0.9);
        dugout.add(coachBody);
        const coachHead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), skinMat);
        coachHead.position.set(coachX, 1.82, 0.9);
        dugout.add(coachHead);

        dugout.position.set(posX, 0, -HALF_W - 4.4);
        this.scene.add(dugout);
      });
    }

    /**
     * Construye afición 360° (incluyendo esquinas) con torso, cabeza y bufandas ondeantes
     */
    buildCrowd() {
      const { NUM_STEPS, STEP_H, STEP_D, FRONT_Z, FRONT_X } = this.standDims;
      const crowdPositions = [];

      for (let s = 0; s < NUM_STEPS; s++) {
        if (s === 3) continue;
        const surfaceY = (s + 1) * STEP_H;
        const zN = -(FRONT_Z + s * STEP_D + STEP_D * 0.5);
        const zS = +(FRONT_Z + s * STEP_D + STEP_D * 0.5);

        for (let x = -HALF_L - 4; x <= HALF_L + 4; x += 1.8) {
          const jx = (Math.random() - 0.5) * 0.35;
          const jz = (Math.random() - 0.5) * 0.35;
          const sideN = x < -8 ? 'home' : (x > 14 ? 'away' : 'neutral');
          crowdPositions.push({ x: x + jx, y: surfaceY, z: zN + jz, baseAngle: x * 0.08, side: sideN });

          const sideS = x < 8 ? 'home' : (x > 22 ? 'away' : 'neutral');
          crowdPositions.push({ x: x + jx, y: surfaceY, z: zS + jz, baseAngle: x * 0.08 + Math.PI, side: sideS });
        }

        const xW = -(FRONT_X + s * STEP_D + STEP_D * 0.5);
        const xE = +(FRONT_X + s * STEP_D + STEP_D * 0.5);
        for (let z = -HALF_W - 3; z <= HALF_W + 3; z += 1.8) {
          const jx = (Math.random() - 0.5) * 0.35;
          const jz = (Math.random() - 0.5) * 0.35;
          crowdPositions.push({ x: xW + jx, y: surfaceY, z: z + jz, baseAngle: z * 0.08, side: 'home' });
          crowdPositions.push({ x: xE + jx, y: surfaceY, z: z + jz, baseAngle: z * 0.08, side: 'away' });
        }

        // Población de las 4 esquinas a 45° para un anillo 360° sin huecos
        const corners = [
          { cx: -FRONT_X + 2, cz: -FRONT_Z + 2, rotY: Math.PI / 4, side: 'home' },
          { cx: FRONT_X - 2, cz: -FRONT_Z + 2, rotY: -Math.PI / 4, side: 'away' },
          { cx: -FRONT_X + 2, cz: FRONT_Z - 2, rotY: (3 * Math.PI) / 4, side: 'home' },
          { cx: FRONT_X - 2, cz: FRONT_Z - 2, rotY: (-3 * Math.PI) / 4, side: 'away' }
        ];
        corners.forEach(c => {
          const localZ = -(s * STEP_D + STEP_D * 0.5);
          const cosR = Math.cos(c.rotY);
          const sinR = Math.sin(c.rotY);
          for (let lx = -9; lx <= 9; lx += 2.0) {
            const wx = c.cx + lx * cosR + localZ * sinR;
            const wz = c.cz - lx * sinR + localZ * cosR;
            crowdPositions.push({ x: wx, y: surfaceY, z: wz, baseAngle: lx * 0.12, side: c.side });
          }
        });
      }

      this.crowdCount = crowdPositions.length;
      this.crowdData = crowdPositions;

      const torsoGeo = new THREE.CylinderGeometry(0.3, 0.36, 0.95, 6);
      const torsoMat = new THREE.MeshStandardMaterial({ roughness: 0.65 });
      this.crowdMesh = new THREE.InstancedMesh(torsoGeo, torsoMat, this.crowdCount);

      const headGeo = new THREE.SphereGeometry(0.22, 7, 6);
      const headMat = new THREE.MeshStandardMaterial({ roughness: 0.72 });
      this.crowdHeadsMesh = new THREE.InstancedMesh(headGeo, headMat, this.crowdCount);

      // Bufandas ondeantes sobre la afición
      const scarfGeo = new THREE.BoxGeometry(1.05, 0.18, 0.12);
      const scarfMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      this.crowdScarvesMesh = new THREE.InstancedMesh(scarfGeo, scarfMat, this.crowdCount);

      const dummy = this._crowdDummy;
      const headCol = this._tempColor;
      const skinPalette = [0xe0ac69, 0xd4a373, 0xc68642, 0x8d5524, 0xf1c27d];

      for (let i = 0; i < this.crowdCount; i++) {
        const p = crowdPositions[i];
        dummy.scale.set(1, 1, 1);
        dummy.rotation.set(0, 0, 0);

        dummy.position.set(p.x, p.y + 0.48, p.z);
        dummy.updateMatrix();
        this.crowdMesh.setMatrixAt(i, dummy.matrix);

        dummy.position.set(p.x, p.y + 1.12, p.z);
        dummy.updateMatrix();
        this.crowdHeadsMesh.setMatrixAt(i, dummy.matrix);

        dummy.scale.set(0.01, 0.01, 0.01);
        dummy.position.set(p.x, p.y + 1.65, p.z);
        dummy.updateMatrix();
        this.crowdScarvesMesh.setMatrixAt(i, dummy.matrix);

        headCol.setHex(skinPalette[i % skinPalette.length]);
        this.crowdHeadsMesh.setColorAt(i, headCol);
      }

      this.crowdMesh.instanceMatrix.needsUpdate = true;
      this.crowdHeadsMesh.instanceMatrix.needsUpdate = true;
      this.crowdScarvesMesh.instanceMatrix.needsUpdate = true;
      if (this.crowdHeadsMesh.instanceColor) this.crowdHeadsMesh.instanceColor.needsUpdate = true;

      this.refreshCrowdColors();
      this.scene.add(this.crowdMesh);
      this.scene.add(this.crowdHeadsMesh);
      this.scene.add(this.crowdScarvesMesh);

      this.buildCrowdFlashes();
    }

    refreshCrowdColors() {
      if (!this.crowdMesh || this.crowdCount === 0) return;
      const homeKit = getClubKit(this.homeTeamName);
      const awayKit = getClubKit(this.awayTeamName);
      const neutralPalette = [homeKit.shirt, homeKit.accent, awayKit.shirt, awayKit.accent, 0xe2e8f0, 0x64748b];
      const col = this._tempColor;

      for (let i = 0; i < this.crowdCount; i++) {
        const side = this.crowdData[i].side;
        let hex;
        if (side === 'home') {
          hex = (i % 5 === 0) ? homeKit.accent : homeKit.shirt;
        } else if (side === 'away') {
          hex = (i % 5 === 0) ? awayKit.accent : awayKit.shirt;
        } else {
          hex = neutralPalette[i % neutralPalette.length];
        }
        col.setHex(hex);
        this.crowdMesh.setColorAt(i, col);
        if (this.crowdScarvesMesh) {
          this.crowdScarvesMesh.setColorAt(i, col);
        }
      }

      if (this.crowdMesh.instanceColor) this.crowdMesh.instanceColor.needsUpdate = true;
      if (this.crowdScarvesMesh && this.crowdScarvesMesh.instanceColor) this.crowdScarvesMesh.instanceColor.needsUpdate = true;
    }

    /**
     * Pancartas Tifo panorámicas sobre los fondos Local y Visitante
     */
    buildTifoBanners() {
      const makeTifo = (teamName, isHome) => {
        const kit = getClubKit(teamName);
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 160;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = hexToCss(kit.shirt);
        ctx.fillRect(0, 0, 512, 160);
        ctx.fillStyle = hexToCss(kit.accent);
        ctx.fillRect(0, 0, 512, 22);
        ctx.fillRect(0, 138, 512, 22);
        ctx.fillStyle = kit.numCol || '#ffffff';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(teamName).toUpperCase(), 256, 82);

        const tex = new THREE.CanvasTexture(canvas);
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(24, 6.5),
          new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
        );
        mesh.userData = { canvas, ctx, tex };
        if (isHome) {
          mesh.position.set(-(this.standDims.FRONT_X + 2.5), 7.2, 0);
          mesh.rotation.y = Math.PI / 2;
          mesh.rotation.z = 0;
        } else {
          mesh.position.set(this.standDims.FRONT_X + 2.5, 7.2, 0);
          mesh.rotation.y = -Math.PI / 2;
        }
        mesh.visible = false;
        this.scene.add(mesh);
        return mesh;
      };

      this.tifoHome = makeTifo(this.homeTeamName, true);
      this.tifoAway = makeTifo(this.awayTeamName, false);
    }

    refreshTifoTextures() {
      [
        { mesh: this.tifoHome, name: this.homeTeamName },
        { mesh: this.tifoAway, name: this.awayTeamName }
      ].forEach(item => {
        if (!item.mesh || !item.mesh.userData) return;
        const { ctx, tex } = item.mesh.userData;
        const kit = getClubKit(item.name);
        ctx.fillStyle = hexToCss(kit.shirt);
        ctx.fillRect(0, 0, 512, 160);
        ctx.fillStyle = hexToCss(kit.accent);
        ctx.fillRect(0, 0, 512, 22);
        ctx.fillRect(0, 138, 512, 22);
        ctx.fillStyle = kit.numCol || '#ffffff';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(item.name).toUpperCase(), 256, 82);
        tex.needsUpdate = true;
      });
    }

    triggerTifo(side, durationMs = 4500) {
      const until = performance.now() + durationMs;
      if (side === 'home' || side === 'all') {
        if (this.tifoHome) { this.tifoHome.visible = true; this.tifoHomeUntil = until; }
      }
      if (side === 'away' || side === 'all') {
        if (this.tifoAway) { this.tifoAway.visible = true; this.tifoAwayUntil = until; }
      }
    }

    buildCrowdFlashes() {
      const flashCount = 70;
      const flashGeo = new THREE.BufferGeometry();
      const flashPos = new Float32Array(flashCount * 3);

      for (let i = 0; i < flashCount; i++) {
        const randFan = this.crowdData[Math.floor(Math.random() * this.crowdData.length)];
        flashPos[i * 3] = randFan.x;
        flashPos[i * 3 + 1] = randFan.y + 1.3;
        flashPos[i * 3 + 2] = randFan.z;
      }

      flashGeo.setAttribute('position', new THREE.BufferAttribute(flashPos, 3));
      const flashMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.8,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      this.flashPoints = new THREE.Points(flashGeo, flashMat);
      this.scene.add(this.flashPoints);
    }

    buildSupporterFlags() {
      const homeKit = getClubKit(this.homeTeamName);
      const awayKit = getClubKit(this.awayTeamName);

      const flagConfigs = [
        { x: -HALF_L - 5, z: -12, color: homeKit.shirt, team: 'home', kind: 'shirt' },
        { x: -HALF_L - 5, z: 12, color: homeKit.accent, team: 'home', kind: 'accent' },
        { x: HALF_L + 5, z: -12, color: awayKit.shirt, team: 'away', kind: 'shirt' },
        { x: HALF_L + 5, z: 12, color: awayKit.accent, team: 'away', kind: 'accent' }
      ];

      const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.75, roughness: 0.25 });
      const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 8.5, 8);
      const flagGeo = new THREE.PlaneGeometry(3.8, 2.3, 8, 4);

      flagConfigs.forEach(fc => {
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(fc.x, 4.25, fc.z);
        this.scene.add(pole);

        const flagMat = new THREE.MeshStandardMaterial({ color: fc.color, side: THREE.DoubleSide, roughness: 0.75 });
        const flagMesh = new THREE.Mesh(flagGeo, flagMat);
        flagMesh.position.set(fc.x, 7.0, fc.z + 1.9);
        flagMesh.userData = { team: fc.team, kind: fc.kind };
        this.scene.add(flagMesh);

        this.flags.push(flagMesh);
        if (fc.team === 'home') this.homeFlags.push(flagMesh);
        else this.awayFlags.push(flagMesh);
      });
    }

    /**
     * Genera textura auténtica de camiseta por club (rayas, franja o lisa) + dorsal legible
     */
    createKitTexture(kit) {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      this.paintKitCanvas(ctx, kit);
      const tex = new THREE.CanvasTexture(canvas);
      if (THREE.sRGBEncoding !== undefined) tex.encoding = THREE.sRGBEncoding;
      return { canvas, ctx, tex };
    }

    paintKitCanvas(ctx, kit) {
      const baseCol = hexToCss(kit.shirt);
      const accCol = hexToCss(kit.accent);
      ctx.fillStyle = baseCol;
      ctx.fillRect(0, 0, 256, 256);

      if (kit.pattern === 'stripes') {
        ctx.fillStyle = accCol;
        for (let x = 0; x < 256; x += 42) {
          ctx.fillRect(x, 0, 21, 256);
        }
      } else if (kit.pattern === 'hoops') {
        ctx.fillStyle = accCol;
        for (let y = 0; y < 256; y += 52) {
          ctx.fillRect(0, y, 256, 26);
        }
      } else if (kit.pattern === 'sash') {
        ctx.strokeStyle = accCol;
        ctx.lineWidth = 34;
        ctx.beginPath();
        ctx.moveTo(-20, 20);
        ctx.lineTo(276, 236);
        ctx.stroke();
      } else {
        // Borde inferior / cuello acento
        ctx.fillStyle = accCol;
        ctx.fillRect(0, 0, 256, 22);
      }
    }

    createNumberTexture(numStr, kit) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      this.paintNumberCanvas(ctx, numStr, kit);
      const tex = new THREE.CanvasTexture(canvas);
      if (THREE.sRGBEncoding !== undefined) tex.encoding = THREE.sRGBEncoding;
      return { canvas, ctx, tex, numStr };
    }

    paintNumberCanvas(ctx, numStr, kit) {
      ctx.clearRect(0, 0, 64, 64);
      ctx.fillStyle = hexToCss(kit.shirt);
      ctx.globalAlpha = 0.78;
      ctx.fillRect(4, 4, 56, 56);
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = kit.numCol || '#ffffff';
      ctx.font = 'bold 40px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(numStr), 32, 34);
    }

    buildPlayers() {
      const homeKit = getClubKit(this.homeTeamName);
      const awayKit = getClubKit(this.awayTeamName);

      this.homeKitTexData = this.createKitTexture(homeKit);
      this.awayKitTexData = this.createKitTexture(awayKit);

      this.homeMaterials = {
        shirt: new THREE.MeshStandardMaterial({ map: this.homeKitTexData.tex, roughness: 0.55 }),
        sleeve: new THREE.MeshStandardMaterial({ color: homeKit.shirt, roughness: 0.55 }),
        shorts: new THREE.MeshStandardMaterial({ color: homeKit.shorts, roughness: 0.65 }),
        accent: new THREE.MeshStandardMaterial({ color: homeKit.accent, roughness: 0.5 }),
        socks: new THREE.MeshStandardMaterial({ color: homeKit.socks || homeKit.shirt, roughness: 0.65 }),
        kit: homeKit,
        numberBadges: []
      };

      this.awayMaterials = {
        shirt: new THREE.MeshStandardMaterial({ map: this.awayKitTexData.tex, roughness: 0.55 }),
        sleeve: new THREE.MeshStandardMaterial({ color: awayKit.shirt, roughness: 0.55 }),
        shorts: new THREE.MeshStandardMaterial({ color: awayKit.shorts, roughness: 0.65 }),
        accent: new THREE.MeshStandardMaterial({ color: awayKit.accent, roughness: 0.5 }),
        socks: new THREE.MeshStandardMaterial({ color: awayKit.socks || awayKit.shirt, roughness: 0.65 }),
        kit: awayKit,
        numberBadges: []
      };

      const gkMatHome = {
        shirt: new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.55 }),
        sleeve: new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.55 }),
        shorts: new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.65 }),
        accent: new THREE.MeshStandardMaterial({ color: 0xa7f3d0, roughness: 0.5 }),
        socks: new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.65 }),
        kit: { shirt: 0x10b981, numCol: '#ffffff' },
        isGK: true
      };
      const gkMatAway = {
        shirt: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.55 }),
        sleeve: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.55 }),
        shorts: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.65 }),
        accent: new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 }),
        socks: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.65 }),
        kit: { shirt: 0xf59e0b, numCol: '#111827' },
        isGK: true
      };
      const refMats = {
        shirt: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6 }),
        sleeve: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6 }),
        shorts: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 }),
        accent: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 }),
        socks: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 }),
        isRef: true
      };

      const torsoGeo = new THREE.CylinderGeometry(0.42, 0.32, 0.88, 10);
      const shoulderGeo = new THREE.SphereGeometry(0.41, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const collarGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.14, 10);
      const shortsPelvisGeo = new THREE.CylinderGeometry(0.34, 0.32, 0.34, 10);
      const numberPatchGeo = new THREE.PlaneGeometry(0.38, 0.38);

      const neckGeo = new THREE.CylinderGeometry(0.11, 0.12, 0.18, 8);
      const headGeo = new THREE.SphereGeometry(0.26, 14, 12);
      const hairGeo = new THREE.SphereGeometry(0.275, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.58);

      const thighGeo = new THREE.CylinderGeometry(0.14, 0.11, 0.44, 8);
      const kneeSkinGeo = new THREE.CylinderGeometry(0.1, 0.095, 0.14, 8);
      const sockGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.38, 8);
      const bootGeo = new THREE.BoxGeometry(0.16, 0.11, 0.34);

      const sleeveGeo = new THREE.CylinderGeometry(0.11, 0.095, 0.34, 8);
      const forearmGeo = new THREE.CylinderGeometry(0.085, 0.07, 0.38, 8);
      const gloveGeo = new THREE.SphereGeometry(0.11, 8, 8);
      const armbandGeo = new THREE.CylinderGeometry(0.115, 0.11, 0.1, 8);
      const shadowGeo = new THREE.PlaneGeometry(1.65, 1.65);

      const skinTones = [0xe0ac69, 0xd4a373, 0xc68642, 0x8d5524, 0xf1c27d];
      const hairTones = [0x111827, 0x292524, 0x78350f, 0xd97706];
      const skinMats = skinTones.map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.72 }));
      const hairMats = hairTones.map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }));

      const bootMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.2 });
      const gloveMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 });
      const armbandMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.3 });
      const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.44, depthWrite: false });

      let playerSeed = 0;

      const createPlayerFigure = (mats, squadNum = null, isCaptain = false) => {
        const idx = playerSeed++;
        const skinMat = skinMats[idx % skinMats.length];
        const hairMat = hairMats[idx % hairMats.length];

        const playerGroup = new THREE.Group();
        const bodyTiltGroup = new THREE.Group();
        playerGroup.add(bodyTiltGroup);

        // Variación orgánica de estatura
        const heightScale = mats.isRef ? 1.0 : (0.96 + (idx % 5) * 0.02);
        bodyTiltGroup.scale.set(1, heightScale, 1);

        const pelvis = new THREE.Mesh(shortsPelvisGeo, mats.shorts);
        pelvis.position.y = 1.08;
        pelvis.castShadow = true;
        bodyTiltGroup.add(pelvis);

        const torso = new THREE.Mesh(torsoGeo, mats.shirt);
        torso.position.y = 1.66;
        torso.castShadow = true;
        bodyTiltGroup.add(torso);

        const shoulders = new THREE.Mesh(shoulderGeo, mats.sleeve);
        shoulders.position.y = 2.02;
        shoulders.scale.set(1.05, 0.55, 0.75);
        bodyTiltGroup.add(shoulders);

        const collar = new THREE.Mesh(collarGeo, mats.accent);
        collar.position.y = 2.15;
        bodyTiltGroup.add(collar);

        // Dorsal legible en la espalda
        if (squadNum !== null && mats.kit) {
          const numData = this.createNumberTexture(squadNum, mats.kit);
          const numMat = new THREE.MeshBasicMaterial({ map: numData.tex, transparent: true });
          const numPatch = new THREE.Mesh(numberPatchGeo, numMat);
          numPatch.position.set(0, 1.7, -0.4);
          numPatch.rotation.y = Math.PI;
          bodyTiltGroup.add(numPatch);
          if (mats.numberBadges) mats.numberBadges.push(numData);
        }

        const neck = new THREE.Mesh(neckGeo, skinMat);
        neck.position.y = 2.26;
        bodyTiltGroup.add(neck);

        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 2.48;
        head.castShadow = true;
        bodyTiltGroup.add(head);

        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.y = 2.5;
        hair.rotation.x = -0.15;
        bodyTiltGroup.add(hair);

        const buildLeg = (sideSign) => {
          const hipPivot = new THREE.Group();
          hipPivot.position.set(sideSign * 0.2, 1.0, 0);

          const thigh = new THREE.Mesh(thighGeo, mats.shorts);
          thigh.position.y = -0.22;
          thigh.castShadow = true;
          hipPivot.add(thigh);

          const kneePivot = new THREE.Group();
          kneePivot.position.set(0, -0.44, 0);

          const knee = new THREE.Mesh(kneeSkinGeo, skinMat);
          knee.position.y = -0.04;
          kneePivot.add(knee);

          const sock = new THREE.Mesh(sockGeo, mats.socks);
          sock.position.y = -0.27;
          sock.castShadow = true;
          kneePivot.add(sock);

          const boot = new THREE.Mesh(bootGeo, bootMat);
          boot.position.set(0, -0.5, 0.06);
          boot.castShadow = true;
          kneePivot.add(boot);

          hipPivot.add(kneePivot);
          bodyTiltGroup.add(hipPivot);
          return { hip: hipPivot, knee: kneePivot };
        };

        const legObjL = buildLeg(-1);
        const legObjR = buildLeg(1);

        const buildArm = (sideSign) => {
          const shoulderPivot = new THREE.Group();
          shoulderPivot.position.set(sideSign * 0.48, 2.02, 0);

          const sleeve = new THREE.Mesh(sleeveGeo, mats.sleeve);
          sleeve.position.y = -0.17;
          sleeve.castShadow = true;
          shoulderPivot.add(sleeve);

          if (isCaptain && sideSign === -1) {
            const band = new THREE.Mesh(armbandGeo, armbandMat);
            band.position.y = -0.22;
            shoulderPivot.add(band);
          }

          const forearm = new THREE.Mesh(forearmGeo, skinMat);
          forearm.position.y = -0.5;
          forearm.castShadow = true;
          shoulderPivot.add(forearm);

          if (mats.isGK) {
            const glove = new THREE.Mesh(gloveGeo, gloveMat);
            glove.position.y = -0.72;
            shoulderPivot.add(glove);
          }

          shoulderPivot.rotation.z = -sideSign * 0.16;
          bodyTiltGroup.add(shoulderPivot);
          return shoulderPivot;
        };

        const armL = buildArm(-1);
        const armR = buildArm(1);

        // Tarjeta amarilla 3D en mano derecha del árbitro
        if (mats.isRef) {
          const cardMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.16, 0.25, 0.03),
            new THREE.MeshBasicMaterial({ color: 0xfacc15 })
          );
          cardMesh.position.set(0, -0.78, 0.06);
          cardMesh.visible = false;
          armR.add(cardMesh);
          this.refereeCardMesh = cardMesh;
        }

        const shadow = new THREE.Mesh(shadowGeo, shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.03;
        playerGroup.add(shadow);

        return {
          group: playerGroup,
          bodyTilt: bodyTiltGroup,
          legL: legObjL.hip,
          legR: legObjR.hip,
          kneeL: legObjL.knee,
          kneeR: legObjR.knee,
          armL, armR,
          basePos: new THREE.Vector3(0, 0, 0),
          targetPos: new THREE.Vector3(0, 0, 0),
          baseRotY: 0,
          isKicking: false,
          kickStart: 0,
          kickUntil: 0,
          celebrateUntil: 0,
          jumpUntil: 0,
          diveDir: 0,
          diveUntil: 0,
          onPodium: false
        };
      };

      this.playersHome = [];
      this.playersAway = [];

      const homePositions = [
        { x: -34, z: -20 }, { x: -36, z: -7 }, { x: -36, z: 7 }, { x: -34, z: 20 },
        { x: -18, z: -14 }, { x: -20, z: 0 }, { x: -18, z: 14 },
        { x: -4, z: -18 }, { x: -6, z: 0 }, { x: -4, z: 18 }
      ];

      homePositions.forEach((pos, idx) => {
        const p = createPlayerFigure(this.homeMaterials, idx + 2, idx === 9);
        p.group.position.set(pos.x, 0, pos.z);
        p.group.rotation.y = Math.PI / 2;
        p.baseRotY = Math.PI / 2;
        p.basePos.set(pos.x, 0, pos.z);
        p.targetPos.set(pos.x, 0, pos.z);
        this.scene.add(p.group);
        this.playersHome.push(p);
      });

      this.goalkeeperHome = createPlayerFigure(gkMatHome, 1, false);
      this.goalkeeperHome.group.position.set(-50.5, 0, 0);
      this.goalkeeperHome.group.rotation.y = Math.PI / 2;
      this.goalkeeperHome.baseRotY = Math.PI / 2;
      this.goalkeeperHome.basePos.set(-50.5, 0, 0);
      this.goalkeeperHome.targetPos.set(-50.5, 0, 0);
      this.scene.add(this.goalkeeperHome.group);

      const awayPositions = [
        { x: 34, z: -20 }, { x: 36, z: -7 }, { x: 36, z: 7 }, { x: 34, z: 20 },
        { x: 18, z: -14 }, { x: 20, z: 0 }, { x: 18, z: 14 },
        { x: 4, z: -18 }, { x: 6, z: 0 }, { x: 4, z: 18 }
      ];

      awayPositions.forEach((pos, idx) => {
        const p = createPlayerFigure(this.awayMaterials, idx + 2, idx === 9);
        p.group.position.set(pos.x, 0, pos.z);
        p.group.rotation.y = -Math.PI / 2;
        p.baseRotY = -Math.PI / 2;
        p.basePos.set(pos.x, 0, pos.z);
        p.targetPos.set(pos.x, 0, pos.z);
        this.scene.add(p.group);
        this.playersAway.push(p);
      });

      this.goalkeeperAway = createPlayerFigure(gkMatAway, 1, false);
      this.goalkeeperAway.group.position.set(50.5, 0, 0);
      this.goalkeeperAway.group.rotation.y = -Math.PI / 2;
      this.goalkeeperAway.baseRotY = -Math.PI / 2;
      this.goalkeeperAway.basePos.set(50.5, 0, 0);
      this.goalkeeperAway.targetPos.set(50.5, 0, 0);
      this.scene.add(this.goalkeeperAway.group);

      this.referee = createPlayerFigure(refMats, null, false);
      this.referee.group.position.set(0, 0, -8);
      this.referee.basePos.set(0, 0, -8);
      this.referee.targetPos.set(0, 0, -8);
      this.scene.add(this.referee.group);
    }

    buildGoals() {
      const postRadius = 0.2;
      const goalW = 7.32;
      const goalH = 2.44;
      const goalDepth = 2.35;

      const netCanvas = document.createElement('canvas');
      netCanvas.width = 64;
      netCanvas.height = 64;
      const nCtx = netCanvas.getContext('2d');
      nCtx.clearRect(0, 0, 64, 64);
      nCtx.strokeStyle = 'rgba(241, 245, 249, 0.72)';
      nCtx.lineWidth = 2.5;
      for (let i = -64; i <= 128; i += 16) {
        nCtx.beginPath(); nCtx.moveTo(i, 0); nCtx.lineTo(i + 64, 64); nCtx.stroke();
        nCtx.beginPath(); nCtx.moveTo(i + 64, 0); nCtx.lineTo(i, 64); nCtx.stroke();
      }
      const netTex = new THREE.CanvasTexture(netCanvas);
      netTex.wrapS = THREE.RepeatWrapping;
      netTex.wrapT = THREE.RepeatWrapping;
      netTex.repeat.set(14, 5);

      const postMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.18, metalness: 0.75 });
      const stanchionMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.8 });
      const netMat = new THREE.MeshBasicMaterial({
        map: netTex,
        transparent: true,
        opacity: 0.82,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const createGoal = (isLeft) => {
        const goalGroup = new THREE.Group();
        const posX = isLeft ? -HALF_L : HALF_L;
        const dir = isLeft ? -1 : 1;

        const postLeft = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalH, 16), postMat);
        postLeft.position.set(0, goalH / 2, -goalW / 2);
        postLeft.castShadow = true;
        goalGroup.add(postLeft);

        const postRight = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalH, 16), postMat);
        postRight.position.set(0, goalH / 2, goalW / 2);
        postRight.castShadow = true;
        goalGroup.add(postRight);

        const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalW + postRadius * 2, 16), postMat);
        crossbar.rotation.x = Math.PI / 2;
        crossbar.position.set(0, goalH, 0);
        crossbar.castShadow = true;
        goalGroup.add(crossbar);

        const groundBar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, goalW, 8), stanchionMat);
        groundBar.rotation.x = Math.PI / 2;
        groundBar.position.set(dir * goalDepth, 0.08, 0);
        goalGroup.add(groundBar);

        [-goalW / 2, goalW / 2].forEach(zSide => {
          const sideBar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, goalDepth, 8), stanchionMat);
          sideBar.rotation.z = Math.PI / 2;
          sideBar.position.set(dir * (goalDepth / 2), 0.08, zSide);
          goalGroup.add(sideBar);

          const backSupport = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, goalH * 1.15, 8), stanchionMat);
          backSupport.position.set(dir * goalDepth * 0.88, goalH / 2, zSide);
          backSupport.rotation.z = dir * 0.25;
          goalGroup.add(backSupport);
        });

        const netGroup = new THREE.Group();
        // Malla trasera subdividida (16x8) para deformación física real de vértices en goles
        const backGeo = new THREE.PlaneGeometry(goalW, goalH, 16, 8);
        const backNet = new THREE.Mesh(backGeo, netMat);
        backNet.position.set(dir * goalDepth, goalH / 2, 0);
        backNet.rotation.y = Math.PI / 2;
        backNet.userData.basePositions = new Float32Array(backGeo.attributes.position.array);
        netGroup.add(backNet);

        const topNet = new THREE.Mesh(new THREE.PlaneGeometry(goalDepth, goalW), netMat);
        topNet.position.set(dir * (goalDepth / 2), goalH, 0);
        topNet.rotation.x = Math.PI / 2;
        netGroup.add(topNet);

        const sideNetL = new THREE.Mesh(new THREE.PlaneGeometry(goalDepth, goalH), netMat);
        sideNetL.position.set(dir * (goalDepth / 2), goalH / 2, -goalW / 2);
        netGroup.add(sideNetL);

        const sideNetR = new THREE.Mesh(new THREE.PlaneGeometry(goalDepth, goalH), netMat);
        sideNetR.position.set(dir * (goalDepth / 2), goalH / 2, goalW / 2);
        netGroup.add(sideNetR);

        goalGroup.add(netGroup);
        goalGroup.position.set(posX, 0, 0);

        // Cámaras TV / fotógrafos detrás de cada línea de meta
        const camMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });
        [-8.5, 8.5].forEach(cz => {
          const camTripod = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.35, 1.1, 6), camMat);
          camTripod.position.set(dir * 3.8, 0.55, cz);
          goalGroup.add(camTripod);
          const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.38, 0.38), camMat);
          camBody.position.set(dir * 3.8, 1.2, cz);
          goalGroup.add(camBody);
        });

        return { group: goalGroup, netMesh: netGroup, backMesh: backNet };
      };

      const gHome = createGoal(true);
      const gAway = createGoal(false);
      this.goalNetHome = gHome.netMesh;
      this.goalNetAway = gAway.netMesh;
      this.goalBackNetHome = gHome.backMesh;
      this.goalBackNetAway = gAway.backMesh;
      this.scene.add(gHome.group);
      this.scene.add(gAway.group);
    }

    buildLedPerimeter() {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 64;
      this.ledCanvas = canvas;
      this.ledCtx = canvas.getContext('2d');

      this.ledTex = new THREE.CanvasTexture(canvas);
      this.ledTex.wrapS = THREE.RepeatWrapping;
      this.ledTex.wrapT = THREE.RepeatWrapping;
      this.ledTex.repeat.set(3, 1);

      this.ledMaterial = new THREE.MeshBasicMaterial({ map: this.ledTex });
      const boardGeoLong = new THREE.BoxGeometry(PITCH_L + 4, 1.25, 0.35);

      const boardN = new THREE.Mesh(boardGeoLong, this.ledMaterial);
      boardN.position.set(0, 0.62, -HALF_W - 2.0);
      this.scene.add(boardN);

      const boardS = new THREE.Mesh(boardGeoLong, this.ledMaterial);
      boardS.position.set(0, 0.62, HALF_W + 2.0);
      this.scene.add(boardS);

      [-HALF_L - 4.2, HALF_L + 4.2].forEach(bx => {
        [-22, 22].forEach(bz => {
          const endBoard = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.25, 22), this.ledMaterial);
          endBoard.position.set(bx, 0.62, bz);
          this.scene.add(endBoard);
        });
      });

      this.updateScoreboardBanner(this.homeTeamName, this.awayTeamName, 0, 0, 0);
    }

    updateScoreboardBanner(homeTeam, awayTeam, homeScore = 0, awayScore = 0, minute = 0, customMsg = null) {
      this.currentHomeScore = homeScore;
      this.currentAwayScore = awayScore;
      this.currentMinute = minute;

      if (this.jumboCtx) {
        const statusTxt = customMsg ? '★ CAMPEÓN ★' : (minute >= 90 ? 'FINAL' : (minute >= 45 ? '2T EN VIVO' : '1T EN VIVO'));
        this.updateJumbotron(homeTeam, awayTeam, homeScore, awayScore, minute, statusTxt);
      }

      if (!this.ledCtx || !this.ledCanvas || !this.ledTex) return;
      const ctx = this.ledCtx;
      const W = this.ledCanvas.width;
      const H = this.ledCanvas.height;

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = customMsg ? '#f59e0b' : '#0ea5e9';
      ctx.fillRect(0, 0, W, 4);
      ctx.fillRect(0, H - 4, W, 4);

      const hShort = String(homeTeam || 'LOCAL').toUpperCase();
      const aShort = String(awayTeam || 'VISITANTE').toUpperCase();
      const bannerText = customMsg || `• LALIGA EA SPORTS • ${hShort} ${homeScore} - ${awayScore} ${aShort} • MIN ${String(minute).padStart(2, '0')}' • ESTADÍSTICA & ML •`;

      ctx.fillStyle = customMsg ? '#fde047' : '#38bdf8';
      ctx.font = 'bold 23px sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(bannerText, 24, H / 2);

      this.ledTex.needsUpdate = true;
    }

    buildBall() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 512, 256);

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      for (let x = 0; x <= 512; x += 64) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 32, 256); ctx.stroke();
      }

      const drawPanel = (x, y, r, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const px = x + r * Math.cos(a);
          const py = y + r * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      };
      drawPanel(80, 70, 26, '#0f172a');
      drawPanel(200, 165, 26, '#0f172a');
      drawPanel(330, 75, 26, '#0f172a');
      drawPanel(440, 165, 26, '#0f172a');
      drawPanel(140, 115, 16, '#0284c7');
      drawPanel(385, 125, 16, '#ef4444');

      const ballTex = new THREE.CanvasTexture(canvas);
      if (THREE.sRGBEncoding !== undefined) ballTex.encoding = THREE.sRGBEncoding;

      this.ballMesh = new THREE.Mesh(
        new THREE.SphereGeometry(BALL_RADIUS, 24, 24),
        new THREE.MeshStandardMaterial({ map: ballTex, roughness: 0.28, metalness: 0.08 })
      );
      this.ballMesh.position.set(0, BALL_RADIUS, 0);
      this.ballMesh.castShadow = true;
      this.scene.add(this.ballMesh);

      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = 64;
      shadowCanvas.height = 64;
      const sCtx = shadowCanvas.getContext('2d');
      const grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 30);
      grad.addColorStop(0, 'rgba(0,0,0,0.75)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0.3)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 64, 64);

      this.ballShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.05, 1.05),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false })
      );
      this.ballShadow.rotation.x = -Math.PI / 2;
      this.ballShadow.position.set(0, 0.03, 0);
      this.scene.add(this.ballShadow);
    }

    buildCornerFlags() {
      const flagMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
      const poleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
      const poleGeo = new THREE.CylinderGeometry(0.07, 0.07, 1.7, 8);
      const flagGeo = new THREE.PlaneGeometry(0.55, 0.38);
      const corners = [
        { x: -HALF_L, z: -HALF_W }, { x: HALF_L, z: -HALF_W },
        { x: -HALF_L, z: HALF_W }, { x: HALF_L, z: HALF_W }
      ];
      corners.forEach(c => {
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(c.x, 0.85, c.z);
        this.scene.add(pole);
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.set(c.x + 0.28, 1.5, c.z);
        this.scene.add(flag);
        this.flags.push(flag);
      });
    }

    buildTrophy() {
      const podium = new THREE.Group();
      const basePlat = new THREE.Mesh(
        new THREE.CylinderGeometry(2.6, 2.9, 0.35, 28),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.65, roughness: 0.25 })
      );
      basePlat.position.y = 0.175;
      basePlat.receiveShadow = true;
      podium.add(basePlat);

      const goldRing = new THREE.Mesh(
        new THREE.TorusGeometry(2.65, 0.07, 10, 36),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.18 })
      );
      goldRing.rotation.x = Math.PI / 2;
      goldRing.position.y = 0.35;
      podium.add(goldRing);

      const topPlaque = new THREE.Mesh(
        new THREE.CylinderGeometry(2.4, 2.4, 0.04, 28),
        new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.35, metalness: 0.3 })
      );
      topPlaque.position.y = 0.36;
      podium.add(topPlaque);

      podium.visible = false;
      this.podiumGroup = podium;
      this.scene.add(podium);

      const trophy = new THREE.Group();
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.92, roughness: 0.14 });
      const marbleMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.3, roughness: 0.2 });

      const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.26, 16), marbleMat);
      plinth.position.y = 0.13;
      trophy.add(plinth);

      const points = [
        new THREE.Vector2(0.0, 0.26),
        new THREE.Vector2(0.22, 0.28),
        new THREE.Vector2(0.11, 0.45),
        new THREE.Vector2(0.10, 0.72),
        new THREE.Vector2(0.32, 0.92),
        new THREE.Vector2(0.46, 1.32),
        new THREE.Vector2(0.42, 1.38),
        new THREE.Vector2(0.36, 1.32),
        new THREE.Vector2(0.16, 0.96),
        new THREE.Vector2(0.0, 0.92)
      ];
      const cupGeo = new THREE.LatheGeometry(points, 24);
      const cupMesh = new THREE.Mesh(cupGeo, goldMat);
      cupMesh.castShadow = true;
      trophy.add(cupMesh);

      const handleGeo = new THREE.TorusGeometry(0.22, 0.045, 10, 20, Math.PI * 1.15);
      const handleL = new THREE.Mesh(handleGeo, goldMat);
      handleL.position.set(-0.4, 1.12, 0);
      handleL.rotation.z = Math.PI * 0.42;
      trophy.add(handleL);

      const handleR = new THREE.Mesh(handleGeo, goldMat);
      handleR.position.set(0.4, 1.12, 0);
      handleR.rotation.z = -Math.PI * 0.42;
      handleR.rotation.y = Math.PI;
      trophy.add(handleR);

      const crown = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), goldMat);
      crown.position.y = 1.54;
      trophy.add(crown);

      trophy.visible = false;
      this.trophyGroup = trophy;
      this.scene.add(trophy);
    }

    spawnActionRing(x, z, colorHex = 0x38bdf8, maxScale = 6.5) {
      if (!this.scene) return;
      const ringGeo = new THREE.RingGeometry(0.5, 0.8, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(x, 0.06, z);
      this.scene.add(ringMesh);

      this.activeRings.push({
        mesh: ringMesh,
        geo: ringGeo,
        mat: ringMat,
        startTime: performance.now(),
        duration: 950,
        maxScale
      });
    }

    spawnTurfSpray(x, z) {
      if (!this.scene) return;
      const pCount = 22;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      const pVel = new Float32Array(pCount * 3);
      const pColors = new Float32Array(pCount * 3);

      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = x + (Math.random() - 0.5) * 0.5;
        pPos[i * 3 + 1] = 0.15;
        pPos[i * 3 + 2] = z + (Math.random() - 0.5) * 0.5;

        pVel[i * 3] = (Math.random() - 0.5) * 4.5;
        pVel[i * 3 + 1] = 2.2 + Math.random() * 3.0;
        pVel[i * 3 + 2] = (Math.random() - 0.5) * 4.5;

        pColors[i * 3] = 0.18;
        pColors[i * 3 + 1] = 0.55;
        pColors[i * 3 + 2] = 0.24;
      }

      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

      const pMat = new THREE.PointsMaterial({ size: 0.35, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false });
      const pSystem = new THREE.Points(pGeo, pMat);
      this.scene.add(pSystem);

      this.activeParticles.push({
        system: pSystem,
        geo: pGeo,
        mat: pMat,
        vel: pVel,
        count: pCount,
        startTime: performance.now(),
        duration: 700
      });
    }

    triggerCameraShake(amp = 0.45, durationMs = 550) {
      this.cameraShakeAmp = amp;
      this.cameraShakeUntil = performance.now() + durationMs;
    }

    /**
     * Pase real entre dos futbolistas del equipo con posesión + desmarque de apoyo
     */
    playRoutinePass(team = 'home') {
      if (!this.isInitialized || this.ceremonyMode || this.ballState.isMoving) return;
      const list = team === 'away' ? this.playersAway : this.playersHome;
      if (!list || list.length < 4) return;

      // Buscar pasador más cercano al balón
      let passer = list[0];
      let minD = Infinity;
      list.forEach(p => {
        const d = Math.hypot(p.group.position.x - this.ballState.currentX, p.group.position.z - this.ballState.currentZ);
        if (d < minD) { minD = d; passer = p; }
      });

      // Elegir receptor distinto
      const candidates = list.filter(p => p !== passer);
      const receiver = candidates[Math.floor(Math.random() * candidates.length)];
      const tx = Math.max(-44, Math.min(44, receiver.group.position.x + (team === 'home' ? 2.5 : -2.5)));
      const tz = Math.max(-28, Math.min(28, receiver.group.position.z + (Math.random() - 0.5) * 4));

      // Acercar balón al pasador y patear
      passer.targetPos.set(this.ballState.currentX, 0, this.ballState.currentZ);
      passer.isKicking = true;
      passer.kickStart = performance.now();
      passer.kickUntil = performance.now() + 500;

      this.animateBallToCoords({ x: tx, y: 0, z: tz }, {
        duration: 620,
        peakY: Math.random() < 0.25 ? 1.5 : 0.2,
        team,
        eventType: 'pass',
        silent: true,
        heatIntensity: 0.16,
        heatRadius: 32
      });
    }

    animateBallTo(zoneKey, options = {}) {
      const target = ZONE_COORDS[zoneKey] || ZONE_COORDS['midfield'];
      this.animateBallToCoords(target, options);
    }

    animateBallToCoords(target, options = {}) {
      if (!this.isInitialized || !this.ballMesh || this.ceremonyMode) return;
      const now = performance.now();
      const duration = Math.max(250, options.duration || 1000);
      const peakY = options.peakY !== undefined ? options.peakY : (options.isAerial ? 5.5 : 0.0);

      if (!options.silent) {
        this.spawnTurfSpray(this.ballMesh.position.x, this.ballMesh.position.z);
      }

      this.ballState.startX = this.ballMesh.position.x;
      this.ballState.startY = this.ballMesh.position.y;
      this.ballState.startZ = this.ballMesh.position.z;

      this.ballState.targetX = target.x;
      this.ballState.targetY = (target.y || 0) + BALL_RADIUS;
      this.ballState.targetZ = target.z;
      this.ballState.peakY = peakY;
      this.ballState.curveX = options.curveX || 0;
      this.ballState.curveZ = options.curveZ || 0;

      this.ballState.startTime = now;
      this.ballState.duration = duration;
      this.ballState.isMoving = true;
      this.ballState.bounceAmp = peakY > 1.2 ? Math.min(1.3, peakY * 0.22) : 0;

      if (options.showArc) {
        this.spawnShotArc(
          this.ballState.startX, this.ballState.startY, this.ballState.startZ,
          this.ballState.targetX, this.ballState.targetY, this.ballState.targetZ,
          peakY, this.ballState.curveX, this.ballState.curveZ,
          options.arcColor || 0x38bdf8
        );
      }

      this.recordHeatPoint(target.x, target.z, options.heatIntensity || 0.32, options.heatRadius || 46);
      this.updatePlayerTactics(target, options.eventType, options.team);

      if (!options.silent && window.StadiumAudio && typeof window.StadiumAudio.playBallKick === 'function') {
        window.StadiumAudio.playBallKick();
      }

      if (!this.isGoalZoom && !this.userOverrideCamera && this.cameraMode === 'broadcast') {
        this.cameraTarget.set(target.x * 0.42, 0.8, target.z * 0.25);
      }
    }

    handleMatchEvent(ev, options = {}) {
      if (!this.isInitialized || !ev) return;

      const now = performance.now();
      const targetZoneKey = options.targetZoneKey || ev.pitch_zone || 'midfield';
      const coords = ZONE_COORDS[targetZoneKey] || ZONE_COORDS['midfield'];

      if (ev.current_home_score !== undefined && ev.current_away_score !== undefined) {
        this.updateScoreboardBanner(
          this.homeTeamName,
          this.awayTeamName,
          ev.current_home_score,
          ev.current_away_score,
          ev.minute || 0
        );
      }

      if (ev.type === 'kickoff') {
        this.triggerTifo('all', 4200);
      }

      let showArc = false;
      let arcColor = 0x38bdf8;
      let curveX = 0;
      let curveZ = 0;
      let finalTarget = coords;

      if (ev.type === 'goal') {
        showArc = true;
        arcColor = 0x10b981;
        this.addShotPin(this.ballState.currentX, this.ballState.currentZ, 'goal');
        this.spawnActionRing(coords.x, coords.z, 0x10b981, 9.0);
        this.triggerGoalCelebration(ev.team === 'away');
      } else if (ev.type === 'shot_saved') {
        showArc = true;
        arcColor = 0x38bdf8;
        this.addShotPin(this.ballState.currentX, this.ballState.currentZ, 'shot_saved');
        this.spawnActionRing(coords.x, coords.z, 0x38bdf8, 6.5);
        const gk = ev.team === 'home' ? this.goalkeeperAway : this.goalkeeperHome;
        if (gk) {
          gk.diveDir = (Math.random() > 0.5 ? 1 : -1);
          gk.diveUntil = now + 950;
        }
      } else if (ev.type === 'shot_missed') {
        showArc = true;
        arcColor = 0xf97316;
        this.addShotPin(this.ballState.currentX, this.ballState.currentZ, 'shot_missed');
        this.spawnActionRing(coords.x, coords.z, 0xf97316, 6.0);
      } else if (ev.type === 'card_yellow') {
        this.spawnActionRing(coords.x, coords.z, 0xfacc15, 5.5);
        // Árbitro corre y saca tarjeta amarilla 3D
        this.refereeCardUntil = now + 2200;
        if (this.referee) {
          this.referee.targetPos.set(coords.x * 0.85, 0, coords.z);
        }
      } else if (ev.type === 'corner') {
        // Córner curvo hacia el área penal + salto de delanteros
        this.spawnActionRing(coords.x, coords.z, 0xf59e0b, 5.5);
        const isHomeCorner = ev.team === 'home';
        finalTarget = isHomeCorner ? { x: 42.5, z: 0, y: 0 } : { x: -42.5, z: 0, y: 0 };
        curveZ = 8.5;
        curveX = isHomeCorner ? -4.5 : 4.5;
        const jumpers = isHomeCorner ? this.playersHome : this.playersAway;
        if (jumpers[8]) jumpers[8].jumpUntil = now + 1100;
        if (jumpers[9]) jumpers[9].jumpUntil = now + 1100;
      }

      const heatIntensity = ev.type === 'goal' ? 0.72 : (ev.type === 'shot_saved' ? 0.55 : 0.35);
      this.animateBallToCoords(finalTarget, {
        duration: options.duration || 850,
        isAerial: options.isAerial,
        peakY: options.peakY,
        curveX,
        curveZ,
        showArc,
        arcColor,
        eventType: ev.type,
        team: ev.team,
        heatIntensity,
        heatRadius: ev.type === 'goal' ? 62 : 46
      });
    }

    updatePlayerTactics(ballTarget, eventType, team) {
      if (this.ceremonyMode) return;
      const now = performance.now();
      const isHomeAttacking = team ? (team === 'home') : (ballTarget.x >= 0);
      const attackers = isHomeAttacking ? this.playersHome : this.playersAway;
      const defenders = isHomeAttacking ? this.playersAway : this.playersHome;

      let closestAttacker = attackers[0];
      let minDist = Infinity;
      attackers.forEach((p, idx) => {
        const d = Math.hypot(p.group.position.x - ballTarget.x, p.group.position.z - ballTarget.z);
        if (d < minDist) {
          minDist = d;
          closestAttacker = p;
        }
        const pushFactor = idx >= 7 ? 0.42 : 0.28;
        const shiftX = Math.max(-46, Math.min(46, p.basePos.x + ballTarget.x * pushFactor));
        const shiftZ = Math.max(-30, Math.min(30, p.basePos.z + ballTarget.z * 0.24));
        p.targetPos.set(shiftX, 0, shiftZ);
      });

      defenders.forEach(p => {
        const shiftX = Math.max(-46, Math.min(46, p.basePos.x + ballTarget.x * 0.24));
        const shiftZ = Math.max(-30, Math.min(30, p.basePos.z + ballTarget.z * 0.2));
        p.targetPos.set(shiftX, 0, shiftZ);
      });

      if (closestAttacker) {
        closestAttacker.targetPos.set(
          Math.max(-48, Math.min(48, ballTarget.x - (isHomeAttacking ? 1.0 : -1.0))),
          0,
          Math.max(-31, Math.min(31, ballTarget.z))
        );
        closestAttacker.isKicking = true;
        closestAttacker.kickStart = now;
        closestAttacker.kickUntil = now + 750;
      }

      if (this.goalkeeperAway) {
        this.goalkeeperAway.targetPos.set(50.5, 0, ballTarget.x > 16 ? Math.max(-3.2, Math.min(3.2, ballTarget.z * 0.5)) : 0);
      }
      if (this.goalkeeperHome) {
        this.goalkeeperHome.targetPos.set(-50.5, 0, ballTarget.x < -16 ? Math.max(-3.2, Math.min(3.2, ballTarget.z * 0.5)) : 0);
      }

      if (this.referee && this.refereeCardUntil <= now) {
        this.referee.targetPos.set(ballTarget.x * 0.6, 0, ballTarget.z > 0 ? ballTarget.z - 9 : ballTarget.z + 9);
      }
    }

    triggerGoalCelebration(isLeftGoal) {
      const now = performance.now();
      this.isGoalZoom = true;
      this.goalZoomUntil = now + 4000;
      this.crowdExcitementUntil = now + 4800;
      this.crowdExcitementSide = isLeftGoal ? 'away' : 'home';
      this.userOverrideCamera = false;

      this.triggerTifo(isLeftGoal ? 'away' : 'home', 4500);
      this.triggerCameraShake(0.42, 550);

      const net = isLeftGoal ? this.goalNetHome : this.goalNetAway;
      const backMesh = isLeftGoal ? this.goalBackNetHome : this.goalBackNetAway;
      if (window.StadiumAudio && typeof window.StadiumAudio.playGoalRoar === 'function') {
        window.StadiumAudio.playGoalRoar();
      }

      if (net) {
        this.netShakeState = {
          active: true,
          net,
          backMesh,
          dir: isLeftGoal ? -1 : 1,
          startTime: now,
          duration: 950
        };
      }

      // Goleador + 2 compañeros corren a celebrar en abrazo grupal cerca del córner
      const teamPlayers = isLeftGoal ? this.playersAway : this.playersHome;
      const cornerX = isLeftGoal ? -46 : 46;
      const scorer = teamPlayers[teamPlayers.length - 1];
      if (scorer) {
        scorer.targetPos.set(cornerX, 0, 23);
        scorer.celebrateUntil = now + 4000;
      }
      if (teamPlayers[7]) {
        teamPlayers[7].targetPos.set(cornerX + (isLeftGoal ? 2 : -2), 0, 21.5);
        teamPlayers[7].celebrateUntil = now + 4000;
      }
      if (teamPlayers[8]) {
        teamPlayers[8].targetPos.set(cornerX + (isLeftGoal ? 2.5 : -2.5), 0, 24.5);
        teamPlayers[8].celebrateUntil = now + 4000;
      }

      const targetX = isLeftGoal ? -44 : 44;
      this.cameraTarget.set(targetX, 2.5, 0);

      this.spawnGoalParticles(isLeftGoal ? -HALF_L : HALF_L);
    }

    triggerTrophyCeremony(winnerSide, winnerName) {
      if (!this.isInitialized) return;
      const now = performance.now();
      this.ceremonyMode = 'trophy';
      this.ceremonyStart = now;
      this.ceremonyLastConfetti = now;
      this.crowdExcitementUntil = now + 18000;
      this.crowdExcitementSide = winnerSide;
      this.isGoalZoom = false;
      this.userOverrideCamera = false;

      this.triggerTifo(winnerSide, 15000);

      if (this.podiumGroup) this.podiumGroup.visible = true;
      if (this.trophyGroup) this.trophyGroup.visible = true;

      const winners = winnerSide === 'away' ? this.playersAway : this.playersHome;
      const winnerGK = winnerSide === 'away' ? this.goalkeeperAway : this.goalkeeperHome;
      const losers = winnerSide === 'away' ? this.playersHome : this.playersAway;
      const loserGK = winnerSide === 'away' ? this.goalkeeperHome : this.goalkeeperAway;

      const captain = winners[winners.length - 1];
      this.ceremonyCaptain = captain;
      if (captain) {
        captain.onPodium = true;
        captain.targetPos.set(0, 0.36, 0);
        captain.celebrateUntil = now + 20000;
      }

      const squadOthers = winners.slice(0, winners.length - 1);
      if (winnerGK) squadOthers.push(winnerGK);
      squadOthers.forEach((p, i) => {
        const angle = Math.PI + (i / Math.max(1, squadOthers.length - 1)) * Math.PI;
        const rad = 5.2 + (i % 2) * 1.6;
        p.targetPos.set(Math.cos(angle) * rad, 0, Math.sin(angle) * rad - 1.2);
        p.celebrateUntil = now + 20000;
      });

      const retreatX = winnerSide === 'away' ? -28 : 28;
      losers.forEach((p, i) => {
        p.targetPos.set(retreatX + (i % 3) * 3.5, 0, -14 + i * 3);
        p.celebrateUntil = 0;
      });
      if (loserGK) {
        loserGK.targetPos.set(winnerSide === 'away' ? -48 : 48, 0, 0);
      }

      if (this.ballMesh) {
        this.ballState.isMoving = false;
        this.ballMesh.position.set(1.9, BALL_RADIUS, 1.9);
        if (this.ballShadow) this.ballShadow.position.set(1.9, 0.03, 1.9);
      }

      this.updateScoreboardBanner(
        this.homeTeamName,
        this.awayTeamName,
        this.currentHomeScore,
        this.currentAwayScore,
        90,
        `★ CAMPEÓN DEL PARTIDO: ${String(winnerName || '').toUpperCase()} ★ LEVANTA LA COPA EN LALIGA 3D ★`
      );
      if (window.StadiumAudio && typeof window.StadiumAudio.playGoalRoar === 'function') {
        window.StadiumAudio.playGoalRoar();
      }
      this.spawnGoalParticles(0);
    }

    triggerDrawSalute() {
      if (!this.isInitialized) return;
      const now = performance.now();
      this.ceremonyMode = 'draw';
      this.ceremonyStart = now;
      this.userOverrideCamera = false;

      this.playersHome.forEach((p, i) => {
        p.targetPos.set(-4.5 - (i % 2) * 2.2, 0, -9 + i * 2.0);
        p.celebrateUntil = now + 4500;
      });
      this.playersAway.forEach((p, i) => {
        p.targetPos.set(4.5 + (i % 2) * 2.2, 0, -9 + i * 2.0);
        p.celebrateUntil = now + 4500;
      });
      this.cameraGoal.set(0, 14, 26);
      this.cameraTarget.set(0, 1.2, 0);
    }

    setCameraMode(mode) {
      this.cameraMode = mode;
      this.userOverrideCamera = false;
      if (!this.camera) return;

      switch (mode) {
        case 'pitchside':
          this.cameraGoal.set(0, 2.3, 35);
          this.cameraTarget.set(0, 1.6, 0);
          break;
        case 'goalcam':
          this.cameraGoal.set(-57, 4.5, 5);
          this.cameraTarget.set(-10, 1.4, 0);
          break;
        case 'aerial':
          this.cameraGoal.set(0, 84, 0.2);
          this.cameraTarget.set(0, 0, 0);
          break;
        case 'follow':
          this.cameraGoal.set(
            this.ballState.currentX * 0.6,
            15,
            Math.min(39, Math.max(18, this.ballState.currentZ + 24))
          );
          this.cameraTarget.set(this.ballState.currentX, 1.0, this.ballState.currentZ);
          break;
        case 'orbit':
          this.userOverrideCamera = true;
          break;
        case 'broadcast':
        default:
          this.cameraGoal.set(0, 27.5, 58);
          this.cameraTarget.set(0, 1.8, -4);
          break;
      }
    }

    resetCamera() {
      this.isGoalZoom = false;
      this.setCameraMode(this.cameraMode === 'orbit' ? 'broadcast' : this.cameraMode);
    }

    spawnGoalParticles(originX) {
      if (!this.scene) return;
      const pCount = 220;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      const pVel = new Float32Array(pCount * 3);
      const pColors = new Float32Array(pCount * 3);

      const homeKit = getClubKit(this.homeTeamName);
      const awayKit = getClubKit(this.awayTeamName);
      const palette = [
        new THREE.Color(0xfacc15),
        new THREE.Color(0xf59e0b),
        new THREE.Color(0x38bdf8),
        new THREE.Color(homeKit.shirt),
        new THREE.Color(awayKit.shirt)
      ];

      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = originX + (Math.random() - 0.5) * 6;
        pPos[i * 3 + 1] = 1.6 + Math.random() * 2.5;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 14;

        pVel[i * 3] = (Math.random() - 0.5) * 14;
        pVel[i * 3 + 1] = 9 + Math.random() * 11;
        pVel[i * 3 + 2] = (Math.random() - 0.5) * 14;

        const c = palette[i % palette.length];
        pColors[i * 3] = c.r;
        pColors[i * 3 + 1] = c.g;
        pColors[i * 3 + 2] = c.b;
      }

      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

      const pMat = new THREE.PointsMaterial({
        size: 0.95,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      });
      const pSystem = new THREE.Points(pGeo, pMat);
      this.scene.add(pSystem);

      this.activeParticles.push({
        system: pSystem,
        geo: pGeo,
        mat: pMat,
        vel: pVel,
        count: pCount,
        startTime: performance.now(),
        duration: 3200
      });
    }

    animate() {
      this.animFrameId = requestAnimationFrame(() => this.animate());

      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - (this.lastFrameTime || now)) / 1000));
      this.lastFrameTime = now;
      const timeSec = now / 1000;

      // 1. Balón con arco parabólico, curva lateral y rebote
      if (this.ballMesh) {
        if (this.ballState.isMoving) {
          const elapsed = now - this.ballState.startTime;
          const t = Math.min(1.0, elapsed / this.ballState.duration);
          const easeT = 1 - Math.pow(1 - t, 2.35);

          const curX = this.ballState.startX + (this.ballState.targetX - this.ballState.startX) * easeT + 4 * this.ballState.curveX * t * (1 - t);
          const curZ = this.ballState.startZ + (this.ballState.targetZ - this.ballState.startZ) * easeT + 4 * this.ballState.curveZ * t * (1 - t);
          const linearY = this.ballState.startY + (this.ballState.targetY - this.ballState.startY) * easeT;
          const arcY = 4 * this.ballState.peakY * t * (1 - t);
          const curY = Math.max(BALL_RADIUS, linearY + arcY);

          this.ballMesh.position.set(curX, curY, curZ);

          const deltaX = curX - this.ballState.currentX;
          const deltaZ = curZ - this.ballState.currentZ;
          this.ballMesh.rotation.z -= deltaX * 2.8;
          this.ballMesh.rotation.x += deltaZ * 2.8;

          this.ballState.currentX = curX;
          this.ballState.currentY = curY;
          this.ballState.currentZ = curZ;

          if (t >= 1.0) {
            this.ballState.isMoving = false;
            if (this.ballState.bounceAmp > 0.05) {
              this.ballState.bounceStart = now;
            }
          }
        } else if (this.ballState.bounceAmp > 0.05) {
          const bElapsed = now - this.ballState.bounceStart;
          const bt = bElapsed / this.ballState.bounceDuration;
          if (bt >= 1.0) {
            this.ballState.bounceAmp = 0;
            this.ballMesh.position.y = BALL_RADIUS;
          } else {
            const bounceOffset = Math.abs(Math.sin(bt * Math.PI * 2.0)) * this.ballState.bounceAmp * (1 - bt);
            this.ballMesh.position.y = BALL_RADIUS + bounceOffset;
          }
        }

        if (this.ballShadow) {
          const by = this.ballMesh.position.y;
          this.ballShadow.position.set(this.ballMesh.position.x, 0.04, this.ballMesh.position.z);
          const shadowScale = Math.max(0.42, 1.0 - (by - BALL_RADIUS) * 0.09);
          this.ballShadow.scale.set(shadowScale, shadowScale, shadowScale);
          this.ballShadow.material.opacity = Math.max(0.15, 0.75 - (by - BALL_RADIUS) * 0.07);
        }
      }

      // 2. Estela in-place
      if (this.ballMesh && this.ballTrail && this.ballTrailPositions) {
        if (this.ballState.isMoving) {
          this.ballTrail.visible = true;
          const posArr = this.ballTrailPositions;
          for (let i = (this.ballTrailMaxPts - 1) * 3; i >= 3; i -= 3) {
            posArr[i] = posArr[i - 3];
            posArr[i + 1] = posArr[i - 2];
            posArr[i + 2] = posArr[i - 1];
          }
          posArr[0] = this.ballMesh.position.x;
          posArr[1] = this.ballMesh.position.y;
          posArr[2] = this.ballMesh.position.z;
          this.ballTrail.geometry.attributes.position.needsUpdate = true;
        } else {
          this.ballTrail.visible = false;
        }
      }

      // 3. Arcos de tiro 3D que se desvanecen
      for (let i = this.activeShotArcs.length - 1; i >= 0; i--) {
        const arc = this.activeShotArcs[i];
        const p = (now - arc.startTime) / arc.duration;
        if (p >= 1) {
          this.scene.remove(arc.line);
          arc.geo.dispose();
          arc.mat.dispose();
          this.activeShotArcs.splice(i, 1);
        } else {
          arc.mat.opacity = 0.9 * (1 - p);
        }
      }

      // 4. Anillos tácticos
      for (let i = this.activeRings.length - 1; i >= 0; i--) {
        const ring = this.activeRings[i];
        const p = (now - ring.startTime) / ring.duration;
        if (p >= 1) {
          this.scene.remove(ring.mesh);
          ring.geo.dispose();
          ring.mat.dispose();
          this.activeRings.splice(i, 1);
        } else {
          const s = 1 + p * ring.maxScale;
          ring.mesh.scale.set(s, s, 1);
          ring.mat.opacity = 0.85 * (1 - p);
        }
      }

      // 5. Partículas físicas (césped + confeti)
      for (let i = this.activeParticles.length - 1; i >= 0; i--) {
        const ps = this.activeParticles[i];
        const p = (now - ps.startTime) / ps.duration;
        if (p >= 1) {
          this.scene.remove(ps.system);
          ps.geo.dispose();
          ps.mat.dispose();
          this.activeParticles.splice(i, 1);
        } else {
          const arr = ps.geo.attributes.position.array;
          const vel = ps.vel;
          for (let j = 0; j < ps.count; j++) {
            const idx = j * 3;
            vel[idx + 1] -= 9.8 * dt;
            arr[idx] += vel[idx] * dt;
            arr[idx + 1] += vel[idx + 1] * dt;
            arr[idx + 2] += vel[idx + 2] * dt;
            if (arr[idx + 1] < 0.15) {
              arr[idx + 1] = 0.15;
              vel[idx + 1] *= -0.35;
              vel[idx] *= 0.78;
              vel[idx + 2] *= 0.78;
            }
          }
          ps.geo.attributes.position.needsUpdate = true;
          ps.mat.opacity = Math.max(0, 1 - p * 0.9);
        }
      }

      // 6. Deformación real por vértices de la red en goles
      if (this.netShakeState.active && this.netShakeState.backMesh) {
        const elapsed = now - this.netShakeState.startTime;
        const backMesh = this.netShakeState.backMesh;
        const posAttr = backMesh.geometry.attributes.position;
        const baseArr = backMesh.userData.basePositions;

        if (elapsed >= this.netShakeState.duration) {
          posAttr.array.set(baseArr);
          posAttr.needsUpdate = true;
          this.netShakeState.active = false;
        } else {
          const decay = 1 - elapsed / this.netShakeState.duration;
          const ripple = Math.sin(elapsed * 0.035) * 0.85 * decay;
          for (let k = 0; k < posAttr.count; k++) {
            const bx = baseArr[k * 3];
            const by = baseArr[k * 3 + 1];
            const distFromCenter = Math.hypot(bx * 0.25, by * 0.6);
            const falloff = Math.max(0, 1 - distFromCenter);
            // En backNet (rotada 90° Y), Z local apunta hacia afuera del fondo de la red
            posAttr.array[k * 3 + 2] = baseArr[k * 3 + 2] + this.netShakeState.dir * (0.45 * decay + ripple) * falloff;
          }
          posAttr.needsUpdate = true;
        }
      }

      // 7. Visibilidad de tarjeta amarilla 3D del árbitro
      const showRefCard = this.refereeCardUntil > now;
      if (this.refereeCardMesh) {
        this.refereeCardMesh.visible = showRefCard;
      }

      // 8. Biomecánica de jugadores
      const animatePlayerList = (list, isRefList = false) => {
        for (let idx = 0; idx < list.length; idx++) {
          const p = list[idx];
          const dx = p.targetPos.x - p.group.position.x;
          const dz = p.targetPos.z - p.group.position.z;
          const dist = Math.hypot(dx, dz);

          if (dist > 0.2) {
            p.group.position.x = THREE.MathUtils.lerp(p.group.position.x, p.targetPos.x, Math.min(1, dt * 3.6));
            p.group.position.z = THREE.MathUtils.lerp(p.group.position.z, p.targetPos.z, Math.min(1, dt * 3.6));
            p.group.position.y = THREE.MathUtils.lerp(p.group.position.y, p.targetPos.y, Math.min(1, dt * 5));

            const desiredRot = Math.atan2(dx, dz);
            p.group.rotation.y = lerpAngle(p.group.rotation.y, desiredRot, Math.min(1, dt * 9));

            const phase = timeSec * 12.5 + idx * 0.9;
            const hipSwing = Math.sin(phase) * 0.68;
            p.legL.rotation.x = hipSwing;
            p.legR.rotation.x = -hipSwing;
            p.kneeL.rotation.x = Math.max(0.05, -Math.sin(phase) * 0.95);
            p.kneeR.rotation.x = Math.max(0.05, Math.sin(phase) * 0.95);

            p.bodyTilt.rotation.x = THREE.MathUtils.lerp(p.bodyTilt.rotation.x, 0.16, Math.min(1, dt * 6));
            p.bodyTilt.position.y = Math.abs(Math.sin(phase)) * 0.08;

            if (p.celebrateUntil <= now && !(isRefList && showRefCard)) {
              p.armL.rotation.x = -hipSwing * 0.75;
              p.armR.rotation.x = hipSwing * 0.75;
            }
          } else {
            p.group.position.y = THREE.MathUtils.lerp(p.group.position.y, p.targetPos.y, Math.min(1, dt * 6));
            p.bodyTilt.rotation.x = THREE.MathUtils.lerp(p.bodyTilt.rotation.x, 0, Math.min(1, dt * 7));
            p.bodyTilt.position.y = THREE.MathUtils.lerp(p.bodyTilt.position.y, 0, Math.min(1, dt * 8));
            p.legL.rotation.x = THREE.MathUtils.lerp(p.legL.rotation.x, 0, Math.min(1, dt * 8));
            p.legR.rotation.x = THREE.MathUtils.lerp(p.legR.rotation.x, 0, Math.min(1, dt * 8));
            p.kneeL.rotation.x = THREE.MathUtils.lerp(p.kneeL.rotation.x, 0, Math.min(1, dt * 8));
            p.kneeR.rotation.x = THREE.MathUtils.lerp(p.kneeR.rotation.x, 0, Math.min(1, dt * 8));
            p.armL.rotation.x = THREE.MathUtils.lerp(p.armL.rotation.x, 0, Math.min(1, dt * 8));
            if (!(isRefList && showRefCard)) {
              p.armR.rotation.x = THREE.MathUtils.lerp(p.armR.rotation.x, 0, Math.min(1, dt * 8));
            }

            if (this.ceremonyMode === 'trophy') {
              const lookTargetZ = p.onPodium ? 14 : 0;
              const angle = p.onPodium ? 0 : Math.atan2(-p.group.position.x, lookTargetZ - p.group.position.z);
              p.group.rotation.y = lerpAngle(p.group.rotation.y, angle, Math.min(1, dt * 6));
            } else {
              const bdx = this.ballState.currentX - p.group.position.x;
              const bdz = this.ballState.currentZ - p.group.position.z;
              if (Math.hypot(bdx, bdz) > 0.4) {
                p.group.rotation.y = lerpAngle(p.group.rotation.y, Math.atan2(bdx, bdz), Math.min(1, dt * 5));
              }
            }
          }

          // Salto para cabecear en córners
          if (p.jumpUntil > now) {
            const jLeft = (p.jumpUntil - now) / 1100;
            p.bodyTilt.position.y = Math.sin(jLeft * Math.PI) * 0.9;
          }

          // Brazo alzado del árbitro mostrando tarjeta amarilla
          if (isRefList && showRefCard) {
            p.armR.rotation.z = -2.6;
            p.armR.rotation.x = -0.3;
          }

          if (p.isKicking && p.kickUntil > now) {
            const kElapsed = now - p.kickStart;
            if (kElapsed < 160) {
              p.legR.rotation.x = 0.48;
              p.kneeR.rotation.x = 0.85;
            } else {
              p.legR.rotation.x = -1.2;
              p.kneeR.rotation.x = 0.12;
              p.bodyTilt.rotation.x = -0.1;
            }
          } else if (p.isKicking && p.kickUntil <= now) {
            p.isKicking = false;
          }

          if (p.celebrateUntil > now) {
            const cheer = p.onPodium ? 2.75 : (2.2 + Math.sin(timeSec * 8 + idx) * 0.25);
            p.armL.rotation.z = cheer;
            p.armR.rotation.z = -cheer;
            if (this.ceremonyMode === 'trophy' && !p.onPodium && dist <= 0.35) {
              p.bodyTilt.position.y = Math.abs(Math.sin(timeSec * 6.5 + idx)) * 0.22;
            }
          } else if (!(isRefList && showRefCard)) {
            p.armL.rotation.z = THREE.MathUtils.lerp(p.armL.rotation.z, 0.16, Math.min(1, dt * 6));
            p.armR.rotation.z = THREE.MathUtils.lerp(p.armR.rotation.z, -0.16, Math.min(1, dt * 6));
          }

          if (p.diveUntil > now) {
            p.group.position.y = THREE.MathUtils.lerp(p.group.position.y, 0.85, Math.min(1, dt * 10));
            p.group.rotation.z = THREE.MathUtils.lerp(p.group.rotation.z, p.diveDir * 1.15, Math.min(1, dt * 12));
            p.armL.rotation.z = 2.5;
            p.armR.rotation.z = -2.5;
          } else if (!p.onPodium) {
            p.group.rotation.z = THREE.MathUtils.lerp(p.group.rotation.z, 0, Math.min(1, dt * 8));
          }
        }
      };

      animatePlayerList(this.playersHome);
      animatePlayerList(this.playersAway);
      if (this.referee) animatePlayerList([this.referee], true);
      if (this.goalkeeperHome) animatePlayerList([this.goalkeeperHome]);
      if (this.goalkeeperAway) animatePlayerList([this.goalkeeperAway]);

      // 9. Copa 3D en las manos del capitán
      if (this.ceremonyMode === 'trophy' && this.trophyGroup && this.ceremonyCaptain) {
        const cap = this.ceremonyCaptain;
        const liftPulse = Math.sin(timeSec * 5) * 0.14;
        this.trophyGroup.position.set(
          cap.group.position.x,
          cap.group.position.y + 2.75 + liftPulse,
          cap.group.position.z + 0.15
        );
        this.trophyGroup.rotation.y = timeSec * 1.2;

        if (now - this.ceremonyLastConfetti > 2800 && now - this.ceremonyStart < 14000) {
          this.ceremonyLastConfetti = now;
          this.spawnGoalParticles((Math.random() - 0.5) * 8);
        }
      }

      // 10. Hinchas: torso + cabeza + bufandas ondeantes + reacción localizada por afición
      if (this.crowdMesh && this.crowdHeadsMesh && this.crowdScarvesMesh && this.crowdData.length > 0 && this._crowdDummy) {
        const dummy = this._crowdDummy;
        const isCelebrating = this.crowdExcitementUntil > now;
        const waveSpeed = isCelebrating ? 5.8 : 2.8;

        for (let i = 0; i < this.crowdCount; i += 2) {
          const c = this.crowdData[i];
          const isFanOfWinner = !isCelebrating || this.crowdExcitementSide === 'all' || c.side === this.crowdExcitementSide || c.side === 'neutral';
          const jumpAmp = (isCelebrating && isFanOfWinner) ? 1.85 : 0.9;
          const wave = Math.sin(timeSec * waveSpeed - c.baseAngle);
          const jumpY = wave > 0.55 ? (wave - 0.55) * jumpAmp : 0;

          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(1, 1, 1);
          dummy.position.set(c.x, c.y + 0.48 + jumpY, c.z);
          dummy.updateMatrix();
          this.crowdMesh.setMatrixAt(i, dummy.matrix);

          dummy.position.set(c.x, c.y + 1.12 + jumpY, c.z);
          dummy.updateMatrix();
          this.crowdHeadsMesh.setMatrixAt(i, dummy.matrix);

          // Bufandas ondeantes: 20% activas siempre, 100% para hinchas celebrando
          const showScarf = (isCelebrating && isFanOfWinner) || (i % 10 === 0);
          if (showScarf) {
            dummy.scale.set(1, 1, 1);
            dummy.rotation.set(0, 0, Math.sin(timeSec * 7 + i) * 0.25);
            dummy.position.set(c.x, c.y + 1.68 + jumpY + Math.abs(Math.sin(timeSec * 6 + i)) * 0.22, c.z);
          } else {
            dummy.scale.set(0.01, 0.01, 0.01);
            dummy.position.set(c.x, c.y, c.z);
          }
          dummy.updateMatrix();
          this.crowdScarvesMesh.setMatrixAt(i, dummy.matrix);
        }
        this.crowdMesh.instanceMatrix.needsUpdate = true;
        this.crowdHeadsMesh.instanceMatrix.needsUpdate = true;
        this.crowdScarvesMesh.instanceMatrix.needsUpdate = true;
      }

      // 11. Tifos temporales en fondos
      if (this.tifoHome && this.tifoHome.visible && now > this.tifoHomeUntil) this.tifoHome.visible = false;
      if (this.tifoAway && this.tifoAway.visible && now > this.tifoAwayUntil) this.tifoAway.visible = false;

      // 12. Flashes y banderas
      if (this.flashPoints) {
        const flashOpacity = (Math.sin(timeSec * 8) > 0.72) ? 0.88 : (Math.random() < 0.14 ? 0.68 : 0.06);
        this.flashPoints.material.opacity = flashOpacity;
      }

      for (let idx = 0; idx < this.flags.length; idx++) {
        this.flags[idx].rotation.y = Math.sin(timeSec * 4 + idx) * 0.24;
      }

      if (this.ledMaterial && this.ledMaterial.map) {
        this.ledOffset += dt * 0.11;
        this.ledMaterial.map.offset.x = this.ledOffset;
      }

      // 13. Cámara + Shake sutil en goles
      if (this.isGoalZoom && now > this.goalZoomUntil) {
        this.isGoalZoom = false;
        this.setCameraMode(this.cameraMode);
      }

      if (this.ceremonyMode === 'trophy' && !this.isUserOrbiting && !this.userOverrideCamera) {
        const cTime = (now - this.ceremonyStart) / 1000;
        this.cameraGoal.set(Math.sin(cTime * 0.45) * 6.5, 5.2, 14.5);
        this.cameraTarget.set(0, 2.2, 0);
      } else if (this.cameraMode === 'follow' && !this.isGoalZoom && !this.isUserOrbiting && !this.userOverrideCamera) {
        const bx = this.ballState.currentX;
        const bz = this.ballState.currentZ;
        this.cameraGoal.set(bx * 0.6, 15, Math.min(39, Math.max(18, bz + 24)));
        this.cameraTarget.set(bx, 1.0, bz);
      }

      if (this.camera) {
        if (!this.isUserOrbiting && !this.userOverrideCamera && this.cameraMode !== 'orbit') {
          const camAlpha = Math.min(1, dt * 2.8);
          this.camera.position.lerp(this.cameraGoal, camAlpha);
          if (this.controls) {
            this.controls.target.lerp(this.cameraTarget, camAlpha);
          }
        }
        if (this.controls) {
          this.controls.update();
        } else {
          this.camera.lookAt(this.cameraTarget);
        }
        if (this.cameraShakeUntil > now) {
          const sRem = (this.cameraShakeUntil - now) / 550;
          this.camera.position.x += (Math.random() - 0.5) * this.cameraShakeAmp * sRem;
          this.camera.position.y += (Math.random() - 0.5) * this.cameraShakeAmp * sRem;
        }
      }

      this.renderer.render(this.scene, this.camera);
    }

    updateTeams(homeTeam, awayTeam) {
      this.homeTeamName = homeTeam;
      this.awayTeamName = awayTeam;

      const homeKit = getClubKit(homeTeam);
      const awayKit = getClubKit(awayTeam);

      if (this.homeMaterials && this.homeKitTexData) {
        this.paintKitCanvas(this.homeKitTexData.ctx, homeKit);
        this.homeKitTexData.tex.needsUpdate = true;
        this.homeMaterials.sleeve.color.setHex(homeKit.shirt);
        this.homeMaterials.shorts.color.setHex(homeKit.shorts);
        this.homeMaterials.accent.color.setHex(homeKit.accent);
        this.homeMaterials.socks.color.setHex(homeKit.socks || homeKit.shirt);
        this.homeMaterials.kit = homeKit;
        (this.homeMaterials.numberBadges || []).forEach(b => {
          this.paintNumberCanvas(b.ctx, b.numStr, homeKit);
          b.tex.needsUpdate = true;
        });
      }

      if (this.awayMaterials && this.awayKitTexData) {
        this.paintKitCanvas(this.awayKitTexData.ctx, awayKit);
        this.awayKitTexData.tex.needsUpdate = true;
        this.awayMaterials.sleeve.color.setHex(awayKit.shirt);
        this.awayMaterials.shorts.color.setHex(awayKit.shorts);
        this.awayMaterials.accent.color.setHex(awayKit.accent);
        this.awayMaterials.socks.color.setHex(awayKit.socks || awayKit.shirt);
        this.awayMaterials.kit = awayKit;
        (this.awayMaterials.numberBadges || []).forEach(b => {
          this.paintNumberCanvas(b.ctx, b.numStr, awayKit);
          b.tex.needsUpdate = true;
        });
      }

      this.homeFlags.forEach(f => {
        f.material.color.setHex(f.userData.kind === 'accent' ? homeKit.accent : homeKit.shirt);
      });
      this.awayFlags.forEach(f => {
        f.material.color.setHex(f.userData.kind === 'accent' ? awayKit.accent : awayKit.shirt);
      });

      this.refreshCrowdColors();
      this.refreshTifoTextures();
      this.updateScoreboardBanner(homeTeam, awayTeam, 0, 0, 0);
      this.reset();
    }

    onResize() {
      if (!this.container || !this.renderer || !this.camera) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      if (width === 0 || height === 0) return;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }

    reset() {
      this.isGoalZoom = false;
      this.ceremonyMode = null;
      this.ceremonyCaptain = null;
      this.crowdExcitementUntil = 0;
      this.crowdExcitementSide = 'all';
      this.refereeCardUntil = 0;
      this.cameraShakeUntil = 0;
      this.netShakeState.active = false;
      this.ballState.isMoving = false;
      this.ballState.bounceAmp = 0;
      this.ballState.curveX = 0;
      this.ballState.curveZ = 0;
      this.ballState.currentX = 0;
      this.ballState.currentY = BALL_RADIUS;
      this.ballState.currentZ = 0;

      if (this.podiumGroup) this.podiumGroup.visible = false;
      if (this.trophyGroup) this.trophyGroup.visible = false;
      if (this.refereeCardMesh) this.refereeCardMesh.visible = false;
      if (this.tifoHome) this.tifoHome.visible = false;
      if (this.tifoAway) this.tifoAway.visible = false;
      this.clearShotMap();

      if (this.ballMesh) {
        this.ballMesh.position.set(0, BALL_RADIUS, 0);
        this.ballMesh.rotation.set(0, 0, 0);
      }
      if (this.ballShadow) {
        this.ballShadow.position.set(0, 0.04, 0);
        this.ballShadow.scale.set(1, 1, 1);
      }
      if (this.ballTrail) {
        this.ballTrail.visible = false;
      }

      const resetGroup = (list) => {
        list.forEach(p => {
          p.group.position.copy(p.basePos);
          p.targetPos.copy(p.basePos);
          p.group.rotation.set(0, p.baseRotY, 0);
          p.bodyTilt.rotation.set(0, 0, 0);
          p.bodyTilt.position.set(0, 0, 0);
          p.legL.rotation.set(0, 0, 0);
          p.legR.rotation.set(0, 0, 0);
          p.kneeL.rotation.set(0, 0, 0);
          p.kneeR.rotation.set(0, 0, 0);
          p.isKicking = false;
          p.celebrateUntil = 0;
          p.jumpUntil = 0;
          p.diveUntil = 0;
          p.onPodium = false;
        });
      };
      resetGroup(this.playersHome);
      resetGroup(this.playersAway);
      if (this.goalkeeperHome) resetGroup([this.goalkeeperHome]);
      if (this.goalkeeperAway) resetGroup([this.goalkeeperAway]);
      if (this.referee) resetGroup([this.referee]);

      this.resetHeatmap();
      this.setCameraMode(this.cameraMode);
    }

    destroy() {
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      window.removeEventListener('resize', this.onResize);
      if (this.controls && typeof this.controls.dispose === 'function') this.controls.dispose();
      if (this.renderer) this.renderer.dispose();
      this.isInitialized = false;
    }
  }

  window.Stadium3D = new Stadium3D();

})(window);
