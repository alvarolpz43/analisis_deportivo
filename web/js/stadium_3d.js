/**
 * Motor Tridimensional Avanzado del Estadio LaLiga (Stadium3D)
 * Three.js + WebGL a 60 FPS con:
 * - Afición multitudinaria en las graderías con animación de oleada ("La Ola") y destellos de flashes
 * - Banderas gigantes ondeantes en los fondos de animación
 * - 22 Jugadores 3D en formación táctica (4-3-3) con camisetas de los clubes seleccionados
 * - Árbitro y porteros con equipaciones oficiales
 * - Animaciones de carrera de jugadores, golpeo de balón y paradas de los porteros
 * - Modo Inmersivo "Dentro del Estadio / A Pie de Campo", Modo Detrás del Arco y Modo Broadcast
 * - Controles orbitales 360° con ratón y efectos de celebración de gol con pirotecnia
 */

(function(window) {
  'use strict';

  const PITCH_L = 105;
  const PITCH_W = 68;
  const HALF_L = PITCH_L / 2;
  const HALF_W = PITCH_W / 2;

  // Catálogo de colores de equipaciones para los 31 clubes de LaLiga
  const CLUB_KIT_COLORS = {
    'Real Madrid': { shirt: 0xffffff, shorts: 0xffffff, accent: 0xd4af37 },
    'Barcelona': { shirt: 0x004d98, shorts: 0xa50044, accent: 0xedbb00 },
    'Ath Madrid': { shirt: 0xcb3524, shorts: 0x002d62, accent: 0xffffff },
    'Ath Bilbao': { shirt: 0xee2524, shorts: 0x000000, accent: 0xffffff },
    'Sevilla': { shirt: 0xffffff, shorts: 0xffffff, accent: 0xd4001f },
    'Betis': { shirt: 0x0bb365, shorts: 0xffffff, accent: 0xffffff },
    'Sociedad': { shirt: 0x0067b1, shorts: 0xffffff, accent: 0xffffff },
    'Villarreal': { shirt: 0xfacc15, shorts: 0xfacc15, accent: 0x1e3a8a },
    'Valencia': { shirt: 0xffffff, shorts: 0x000000, accent: 0xf97316 },
    'Celta': { shirt: 0x8ac3ee, shorts: 0xffffff, accent: 0xffffff },
    'Espanol': { shirt: 0x007ac2, shorts: 0x007ac2, accent: 0xffffff },
    'Girona': { shirt: 0xcd2027, shorts: 0xcd2027, accent: 0xffffff },
    'Osasuna': { shirt: 0x0a1c3e, shorts: 0x0a1c3e, accent: 0xcb3524 },
    'Vallecano': { shirt: 0xffffff, shorts: 0xffffff, accent: 0xde2128 },
    'Mallorca': { shirt: 0xe20613, shorts: 0x000000, accent: 0x000000 },
    'Alaves': { shirt: 0x0055a5, shorts: 0x0055a5, accent: 0xffffff },
    'Getafe': { shirt: 0x0055a5, shorts: 0x0055a5, accent: 0xffffff },
    'Las Palmas': { shirt: 0xf7e017, shorts: 0x004077, accent: 0x004077 },
    'Cadiz': { shirt: 0xffe600, shorts: 0x004077, accent: 0x004077 },
    'Granada': { shirt: 0xa61c31, shorts: 0x003366, accent: 0xffffff },
    'Almeria': { shirt: 0xe30613, shorts: 0xe30613, accent: 0xffffff },
    'Elche': { shirt: 0xffffff, shorts: 0xffffff, accent: 0x008559 },
    'Leganes': { shirt: 0x0055a5, shorts: 0xffffff, accent: 0xffffff },
    'Levante': { shirt: 0x004d98, shorts: 0x004d98, accent: 0xa50044 },
    'Valladolid': { shirt: 0x552781, shorts: 0xffffff, accent: 0xffffff },
    'Eibar': { shirt: 0x003366, shorts: 0x003366, accent: 0xa50044 },
    'Huesca': { shirt: 0x003366, shorts: 0x003366, accent: 0xa50044 },
    'La Coruna': { shirt: 0x0055a5, shorts: 0xffffff, accent: 0xffffff },
    'Malaga': { shirt: 0x8ac3ee, shorts: 0xffffff, accent: 0xffffff },
    'Oviedo': { shirt: 0x0055a5, shorts: 0xffffff, accent: 0xffffff },
    'Sp Gijon': { shirt: 0xde2128, shorts: 0x003366, accent: 0xffffff }
  };

  function getClubKit(name) {
    return CLUB_KIT_COLORS[name] || { shirt: 0xffffff, shorts: 0xffffff, accent: 0x2563eb };
  }

  const ZONE_COORDS = {
    'home_box': { x: -41.0, z: 0.0, y: 0.0 },
    'home_def': { x: -28.0, z: 6.0, y: 0.0 },
    'midfield': { x: 0.0, z: 0.0, y: 0.0 },
    'away_att': { x: 28.0, z: -6.0, y: 0.0 },
    'away_box': { x: 41.0, z: 0.0, y: 0.0 },
    'attack_home': { x: 34.0, z: 5.0, y: 0.0 },
    'attack_away': { x: -34.0, z: -5.0, y: 0.0 },
    'home_goal_net': { x: -53.2, z: 0.0, y: 1.2 },
    'away_goal_net': { x: 53.2, z: 0.0, y: 1.2 },
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

      // Elementos del estadio
      this.ballMesh = null;
      this.ballShadow = null;
      this.goalNetHome = null;
      this.goalNetAway = null;
      this.ledMaterial = null;
      this.ledOffset = 0;

      // Jugadores y multitud
      this.playersHome = [];
      this.playersAway = [];
      this.goalkeeperHome = null;
      this.goalkeeperAway = null;
      this.referee = null;
      this.crowdMesh = null;
      this.crowdCount = 0;
      this.crowdData = [];
      this.flashPoints = null;
      this.flags = [];

      // Estado de animación del balón
      this.ballState = {
        startX: 0, startY: 0, startZ: 0,
        targetX: 0, targetY: 0, targetZ: 0,
        peakY: 0,
        startTime: 0,
        duration: 1000,
        isMoving: false,
        currentX: 0, currentY: 0, currentZ: 0
      };

      // Modos de cámara
      this.cameraMode = 'broadcast'; // 'broadcast', 'pitchside', 'goalcam', 'aerial', 'orbit'
      this.cameraTarget = new THREE.Vector3(0, 0, 0);
      this.cameraGoal = new THREE.Vector3(0, 50, 68);
      this.isGoalZoom = false;
      this.isInitialized = false;

      // Nombres de equipos
      this.homeTeamName = 'Real Madrid';
      this.awayTeamName = 'Barcelona';
    }

    init(containerId, homeTeam = 'Real Madrid', awayTeam = 'Barcelona') {
      this.homeTeamName = homeTeam;
      this.awayTeamName = awayTeam;

      this.container = document.getElementById(containerId);
      if (!this.container) return;

      this.canvas = document.getElementById('stadium-3d-canvas');
      if (!this.canvas) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'stadium-3d-canvas';
        this.container.appendChild(this.canvas);
      }

      if (this.isInitialized) {
        this.updateTeams(homeTeam, awayTeam);
        return;
      }

      const width = this.container.clientWidth || 530;
      const height = this.container.clientHeight || 345;

      // Renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Escena
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x060b14);
      this.scene.fog = new THREE.FogExp2(0x060b14, 0.0035);

      // Cámara
      this.camera = new THREE.PerspectiveCamera(48, width / height, 1, 600);
      this.camera.position.set(0, 50, 68);
      this.camera.lookAt(0, 0, 0);

      // Controles orbitales
      if (typeof THREE.OrbitControls !== 'undefined') {
        this.controls = new THREE.OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.06;
        this.controls.maxPolarAngle = Math.PI / 2.05;
        this.controls.minDistance = 6;
        this.controls.maxDistance = 145;
        this.controls.target.set(0, 0, 0);
      }

      // Construcción
      this.buildLighting();
      this.buildPitch();
      this.buildGrandstands();
      this.buildCrowd();
      this.buildSupporterFlags();
      this.buildGoals();
      this.buildLedPerimeter();
      this.buildPlayers();
      this.buildBall();
      this.buildCornerFlags();

      this.onResize = this.onResize.bind(this);
      window.addEventListener('resize', this.onResize);

      this.isInitialized = true;
      this.animate();
    }

    /**
     * Construye las luces de noche de estadio y focos en las 4 torres
     */
    buildLighting() {
      const ambient = new THREE.AmbientLight(0x384a68, 0.75);
      this.scene.add(ambient);

      const sun = new THREE.DirectionalLight(0x93c5fd, 0.5);
      sun.position.set(0, 80, 20);
      this.scene.add(sun);

      const towers = [
        { x: -62, z: -42 }, { x: 62, z: -42 },
        { x: -62, z: 42 }, { x: 62, z: 42 }
      ];

      towers.forEach(pos => {
        const towerGeo = new THREE.CylinderGeometry(0.7, 1.3, 44, 6);
        const towerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.set(pos.x, 22, pos.z);
        this.scene.add(tower);

        const headMesh = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.8, 2.5), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        headMesh.position.set(pos.x, 44, pos.z);
        this.scene.add(headMesh);

        const spot = new THREE.SpotLight(0xfef08a, 1.4);
        spot.position.set(pos.x, 44, pos.z);
        spot.target.position.set(pos.x * 0.25, 0, pos.z * 0.25);
        spot.angle = Math.PI / 4.2;
        spot.penumbra = 0.55;
        spot.distance = 180;
        spot.castShadow = true;
        this.scene.add(spot);
        this.scene.add(spot.target);

        // Cono de haz de luz translúcido
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(24, 46, 16, 1, true),
          new THREE.MeshBasicMaterial({
            color: 0xfef08a, transparent: true, opacity: 0.05,
            side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
          })
        );
        cone.position.set(pos.x * 0.6, 22, pos.z * 0.6);
        cone.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(pos.x * 0.25 - pos.x, -44, pos.z * 0.25 - pos.z).normalize()
        );
        this.scene.add(cone);
      });
    }

    /**
     * Césped con franjas cortadas alternadas y marcaciones reglamentarias FIFA
     */
    buildPitch() {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 1326;
      const ctx = canvas.getContext('2d');
      const W = canvas.width;
      const H = canvas.height;

      const stripes = 15;
      const sw = W / stripes;
      for (let i = 0; i < stripes; i++) {
        ctx.fillStyle = (i % 2 === 0) ? '#134e2b' : '#15803d';
        ctx.fillRect(i * sw, 0, sw, H);
      }

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 10;
      const padX = 70;
      const padY = 70;
      const fw = W - padX * 2;
      const fh = H - padY * 2;
      const mx = W / 2;
      const my = H / 2;

      ctx.strokeRect(padX, padY, fw, fh);
      ctx.beginPath();
      ctx.moveTo(mx, padY);
      ctx.lineTo(mx, padY + fh);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(mx, my, (9.15 / PITCH_L) * fw, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(mx, my, 9, 0, Math.PI * 2);
      ctx.fill();

      // Áreas de penal
      const penW = (16.5 / PITCH_L) * fw;
      const penH = (40.32 / PITCH_W) * fh;
      const penY = my - penH / 2;
      ctx.strokeRect(padX, penY, penW, penH);
      ctx.strokeRect(padX + fw - penW, penY, penW, penH);

      // Áreas chicas
      const gBoxW = (5.5 / PITCH_L) * fw;
      const gBoxH = (18.32 / PITCH_W) * fh;
      const gBoxY = my - gBoxH / 2;
      ctx.strokeRect(padX, gBoxY, gBoxW, gBoxH);
      ctx.strokeRect(padX + fw - gBoxW, gBoxY, gBoxW, gBoxH);

      // Puntos de penal
      const pDist = (11.0 / PITCH_L) * fw;
      ctx.beginPath();
      ctx.arc(padX + pDist, my, 8, 0, Math.PI * 2);
      ctx.arc(padX + fw - pDist, my, 8, 0, Math.PI * 2);
      ctx.fill();

      // Arcos de penal
      const arcR = (9.15 / PITCH_L) * fw;
      ctx.beginPath();
      ctx.arc(padX + pDist, my, arcR, -0.65, 0.65);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(padX + fw - pDist, my, arcR, Math.PI - 0.65, Math.PI + 0.65);
      ctx.stroke();

      const pitchTex = new THREE.CanvasTexture(canvas);
      pitchTex.anisotropy = 4;

      const pitchMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(PITCH_L, PITCH_W),
        new THREE.MeshStandardMaterial({ map: pitchTex, roughness: 0.85, metalness: 0.05 })
      );
      pitchMesh.rotation.x = -Math.PI / 2;
      pitchMesh.receiveShadow = true;
      this.scene.add(pitchMesh);

      // Apron exterior
      const apron = new THREE.Mesh(
        new THREE.PlaneGeometry(PITCH_L + 18, PITCH_W + 16),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 })
      );
      apron.position.y = -0.05;
      apron.rotation.x = -Math.PI / 2;
      this.scene.add(apron);
    }

    /**
     * Tribunas volumétricas y marquesinas de cubierta
     */
    buildGrandstands() {
      const standGroup = new THREE.Group();
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.25 });
      const tierColors = [0x1e3a8a, 0xd97706, 0x1d4ed8, 0x334155];

      const createStand = (width, numSteps, depthStep, heightStep, isHorizontal) => {
        const group = new THREE.Group();
        for (let s = 0; s < numSteps; s++) {
          const w = width;
          const d = depthStep * (numSteps - s);
          const h = heightStep;
          const geo = new THREE.BoxGeometry(isHorizontal ? w : d, h, isHorizontal ? d : w);
          const mat = new THREE.MeshStandardMaterial({ color: tierColors[s % tierColors.length], roughness: 0.7 });
          const step = new THREE.Mesh(geo, mat);
          step.position.y = s * heightStep + heightStep / 2;
          group.add(step);
        }
        return group;
      };

      // Norte y Sur
      const nStand = createStand(PITCH_L + 6, 7, 2.5, 2.2, true);
      nStand.position.set(0, 0, -HALF_W - 10);
      standGroup.add(nStand);

      const roofN = new THREE.Mesh(new THREE.BoxGeometry(PITCH_L + 10, 1.2, 18), roofMat);
      roofN.position.set(0, 18, -HALF_W - 8);
      roofN.rotation.x = 0.08;
      standGroup.add(roofN);

      const sStand = createStand(PITCH_L + 6, 7, 2.5, 2.2, true);
      sStand.position.set(0, 0, HALF_W + 10);
      sStand.rotation.y = Math.PI;
      standGroup.add(sStand);

      const roofS = new THREE.Mesh(new THREE.BoxGeometry(PITCH_L + 10, 1.2, 18), roofMat);
      roofS.position.set(0, 18, HALF_W + 8);
      roofS.rotation.x = -0.08;
      standGroup.add(roofS);

      // Este y Oeste
      const wStand = createStand(PITCH_W + 4, 7, 2.5, 2.2, false);
      wStand.position.set(-HALF_L - 10, 0, 0);
      standGroup.add(wStand);

      const roofW = new THREE.Mesh(new THREE.BoxGeometry(18, 1.2, PITCH_W + 8), roofMat);
      roofW.position.set(-HALF_L - 8, 18, 0);
      roofW.rotation.z = -0.08;
      standGroup.add(roofW);

      const eStand = createStand(PITCH_W + 4, 7, 2.5, 2.2, false);
      eStand.position.set(HALF_L + 10, 0, 0);
      eStand.rotation.y = Math.PI;
      standGroup.add(eStand);

      const roofE = new THREE.Mesh(new THREE.BoxGeometry(18, 1.2, PITCH_W + 8), roofMat);
      roofE.position.set(HALF_L + 8, 18, 0);
      roofE.rotation.z = 0.08;
      standGroup.add(roofE);

      this.scene.add(standGroup);
    }

    /**
     * Genera miles de personas animadas en las graderías (Afición con animación de oleada)
     */
    buildCrowd() {
      const crowdPositions = [];
      const crowdColors = [];
      const homeKit = getClubKit(this.homeTeamName);
      const awayKit = getClubKit(this.awayTeamName);

      const fanColors = [
        homeKit.shirt, homeKit.shirt, homeKit.accent,
        awayKit.shirt, awayKit.accent,
        0xffffff, 0xf59e0b, 0xef4444, 0x3b82f6
      ];

      // Generar asientos en las gradas
      const numSteps = 7;
      const stepH = 2.2;
      const stepD = 2.5;

      // Tribuna Norte
      for (let s = 0; s < numSteps; s++) {
        const y = s * stepH + stepH + 0.6;
        const z = -HALF_W - 10 - (s * stepD * 0.45);
        for (let x = -HALF_L; x <= HALF_L; x += 1.8) {
          crowdPositions.push({ x: x + (Math.random() - 0.5) * 0.5, y, z, baseAngle: x * 0.08 });
          const colorHex = (x < 0) ? homeKit.shirt : ((x > 15) ? awayKit.shirt : fanColors[Math.floor(Math.random() * fanColors.length)]);
          crowdColors.push(new THREE.Color(colorHex));
        }
      }

      // Tribuna Sur
      for (let s = 0; s < numSteps; s++) {
        const y = s * stepH + stepH + 0.6;
        const z = HALF_W + 10 + (s * stepD * 0.45);
        for (let x = -HALF_L; x <= HALF_L; x += 1.8) {
          crowdPositions.push({ x: x + (Math.random() - 0.5) * 0.5, y, z, baseAngle: x * 0.08 + Math.PI });
          const colorHex = (x < 0) ? homeKit.shirt : fanColors[Math.floor(Math.random() * fanColors.length)];
          crowdColors.push(new THREE.Color(colorHex));
        }
      }

      // Tribuna Oeste (Fondo Local)
      for (let s = 0; s < numSteps; s++) {
        const y = s * stepH + stepH + 0.6;
        const x = -HALF_L - 10 - (s * stepD * 0.45);
        for (let z = -HALF_W + 4; z <= HALF_W - 4; z += 1.8) {
          crowdPositions.push({ x, y, z: z + (Math.random() - 0.5) * 0.5, baseAngle: z * 0.08 });
          crowdColors.push(new THREE.Color(homeKit.shirt));
        }
      }

      // Tribuna Este (Fondo Visitante)
      for (let s = 0; s < numSteps; s++) {
        const y = s * stepH + stepH + 0.6;
        const x = HALF_L + 10 + (s * stepD * 0.45);
        for (let z = -HALF_W + 4; z <= HALF_W - 4; z += 1.8) {
          crowdPositions.push({ x, y, z: z + (Math.random() - 0.5) * 0.5, baseAngle: z * 0.08 });
          crowdColors.push(new THREE.Color(awayKit.shirt));
        }
      }

      this.crowdCount = crowdPositions.length;
      this.crowdData = crowdPositions;

      // Geometría del aficionado (cápsula / torso estilizado)
      const spectatorGeo = new THREE.CylinderGeometry(0.35, 0.42, 1.4, 6);
      const spectatorMat = new THREE.MeshStandardMaterial({ roughness: 0.6 });

      this.crowdMesh = new THREE.InstancedMesh(spectatorGeo, spectatorMat, this.crowdCount);
      const dummy = new THREE.Object3D();

      for (let i = 0; i < this.crowdCount; i++) {
        const p = crowdPositions[i];
        dummy.position.set(p.x, p.y, p.z);
        dummy.updateMatrix();
        this.crowdMesh.setMatrixAt(i, dummy.matrix);
        this.crowdMesh.setColorAt(i, crowdColors[i]);
      }

      this.crowdMesh.instanceMatrix.needsUpdate = true;
      if (this.crowdMesh.instanceColor) this.crowdMesh.instanceColor.needsUpdate = true;
      this.scene.add(this.crowdMesh);

      // Flashes de móviles en la grada (destellos de luz blanca)
      this.buildCrowdFlashes();
    }

    /**
     * Crea destellos luminosos de móviles de aficionados tomando fotos en las gradas
     */
    buildCrowdFlashes() {
      const flashCount = 60;
      const flashGeo = new THREE.BufferGeometry();
      const flashPos = new Float32Array(flashCount * 3);

      for (let i = 0; i < flashCount; i++) {
        const randFan = this.crowdData[Math.floor(Math.random() * this.crowdData.length)];
        flashPos[i * 3] = randFan.x;
        flashPos[i * 3 + 1] = randFan.y + 0.8;
        flashPos[i * 3 + 2] = randFan.z;
      }

      flashGeo.setAttribute('position', new THREE.BufferAttribute(flashPos, 3));
      const flashMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2.2,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      });

      this.flashPoints = new THREE.Points(flashGeo, flashMat);
      this.scene.add(this.flashPoints);
    }

    /**
     * Banderas gigantes ondeantes en los fondos
     */
    buildSupporterFlags() {
      const homeKit = getClubKit(this.homeTeamName);
      const awayKit = getClubKit(this.awayTeamName);

      const flagConfigs = [
        { x: -HALF_L - 3, z: -10, color: homeKit.shirt },
        { x: -HALF_L - 3, z: 10, color: homeKit.accent },
        { x: HALF_L + 3, z: -10, color: awayKit.shirt },
        { x: HALF_L + 3, z: 10, color: awayKit.accent }
      ];

      flagConfigs.forEach(fc => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 8, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
        pole.position.set(fc.x, 4, fc.z);
        this.scene.add(pole);

        const flagGeo = new THREE.PlaneGeometry(3.5, 2.2, 8, 4);
        const flagMat = new THREE.MeshStandardMaterial({ color: fc.color, side: THREE.DoubleSide, roughness: 0.8 });
        const flagMesh = new THREE.Mesh(flagGeo, flagMat);
        flagMesh.position.set(fc.x, 6.5, fc.z + 1.8);
        this.scene.add(flagMesh);
        this.flags.push(flagMesh);
      });
    }

    /**
     * Construye los 22 jugadores 3D en formación táctica (4-3-3), porteros y árbitro
     */
    buildPlayers() {
      const homeKit = getClubKit(this.homeTeamName);
      const awayKit = getClubKit(this.awayTeamName);

      this.playersHome = [];
      this.playersAway = [];

      // Función generadora de figura humana low-poly de jugador
      const createPlayerFigure = (kit, isGK = false, isRef = false) => {
        const playerGroup = new THREE.Group();

        let shirtCol = isRef ? 0x0a0a0a : (isGK ? 0x10b981 : kit.shirt);
        let shortsCol = isRef ? 0x0a0a0a : (isGK ? 0x047857 : kit.shorts);
        let socksCol = isRef ? 0x0a0a0a : kit.shirt;

        // Torso / Camiseta
        const torso = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.42, 1.25, 8),
          new THREE.MeshStandardMaterial({ color: shirtCol, roughness: 0.6 })
        );
        torso.position.y = 1.6;
        playerGroup.add(torso);

        // Cabeza
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.32, 12, 12),
          new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.8 })
        );
        head.position.y = 2.45;
        playerGroup.add(head);

        // Piernas articuladas
        const legGeo = new THREE.CylinderGeometry(0.16, 0.14, 1.0, 8);
        const legMat = new THREE.MeshStandardMaterial({ color: shortsCol, roughness: 0.7 });

        const legL = new THREE.Mesh(legGeo, legMat);
        legL.position.set(-0.25, 0.5, 0);
        playerGroup.add(legL);

        const legR = new THREE.Mesh(legGeo, legMat);
        legR.position.set(0.25, 0.5, 0);
        playerGroup.add(legR);

        // Brazos
        const armGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.85, 6);
        const armMat = new THREE.MeshStandardMaterial({ color: shirtCol, roughness: 0.7 });

        const armL = new THREE.Mesh(armGeo, armMat);
        armL.position.set(-0.6, 1.5, 0);
        armL.rotation.z = 0.2;
        playerGroup.add(armL);

        const armR = new THREE.Mesh(armGeo, armMat);
        armR.position.set(0.6, 1.5, 0);
        armR.rotation.z = -0.2;
        playerGroup.add(armR);

        // Sombra de jugador
        const shadow = new THREE.Mesh(
          new THREE.PlaneGeometry(1.6, 1.6),
          new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.03;
        playerGroup.add(shadow);

        return {
          group: playerGroup,
          legL, legR, armL, armR,
          basePos: new THREE.Vector3(0, 0, 0),
          targetPos: new THREE.Vector3(0, 0, 0),
          isKicking: false
        };
      };

      // Formación 4-3-3 Equipo Local (Izquierda hacia Centro)
      const homePositions = [
        // 4 Defensas
        { x: -34, z: -20 }, { x: -36, z: -7 }, { x: -36, z: 7 }, { x: -34, z: 20 },
        // 3 Centrocampistas
        { x: -18, z: -14 }, { x: -20, z: 0 }, { x: -18, z: 14 },
        // 3 Delanteros
        { x: -4, z: -18 }, { x: -6, z: 0 }, { x: -4, z: 18 }
      ];

      homePositions.forEach(pos => {
        const p = createPlayerFigure(homeKit, false, false);
        p.group.position.set(pos.x, 0, pos.z);
        p.basePos.set(pos.x, 0, pos.z);
        p.targetPos.set(pos.x, 0, pos.z);
        this.scene.add(p.group);
        this.playersHome.push(p);
      });

      // Portero Local
      this.goalkeeperHome = createPlayerFigure(homeKit, true, false);
      this.goalkeeperHome.group.position.set(-50.5, 0, 0);
      this.goalkeeperHome.basePos.set(-50.5, 0, 0);
      this.scene.add(this.goalkeeperHome.group);

      // Formación 4-3-3 Equipo Visitante (Derecha hacia Centro)
      const awayPositions = [
        // 4 Defensas
        { x: 34, z: -20 }, { x: 36, z: -7 }, { x: 36, z: 7 }, { x: 34, z: 20 },
        // 3 Centrocampistas
        { x: 18, z: -14 }, { x: 20, z: 0 }, { x: 18, z: 14 },
        // 3 Delanteros
        { x: 4, z: -18 }, { x: 6, z: 0 }, { x: 4, z: 18 }
      ];

      awayPositions.forEach(pos => {
        const p = createPlayerFigure(awayKit, false, false);
        p.group.position.set(pos.x, 0, pos.z);
        p.basePos.set(pos.x, 0, pos.z);
        p.targetPos.set(pos.x, 0, pos.z);
        p.group.rotation.y = Math.PI; // Mirando hacia la izquierda
        this.scene.add(p.group);
        this.playersAway.push(p);
      });

      // Portero Visitante
      this.goalkeeperAway = createPlayerFigure(awayKit, true, false);
      this.goalkeeperAway.group.position.set(50.5, 0, 0);
      this.goalkeeperAway.basePos.set(50.5, 0, 0);
      this.goalkeeperAway.group.rotation.y = Math.PI;
      this.scene.add(this.goalkeeperAway.group);

      // Árbitro principal
      this.referee = createPlayerFigure(null, false, true);
      this.referee.group.position.set(0, 0, -8);
      this.scene.add(this.referee.group);
    }

    /**
     * Porterías y redes 3D
     */
    buildGoals() {
      const postRadius = 0.22;
      const goalW = 7.32;
      const goalH = 2.44;
      const goalDepth = 2.4;

      const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.8 });
      const netMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, wireframe: true, transparent: true, opacity: 0.4 });

      const createGoal = (isLeft) => {
        const goalGroup = new THREE.Group();
        const posX = isLeft ? -HALF_L : HALF_L;
        const dir = isLeft ? -1 : 1;

        const postLeft = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalH, 16), postMat);
        postLeft.position.set(0, goalH / 2, -goalW / 2);
        goalGroup.add(postLeft);

        const postRight = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalH, 16), postMat);
        postRight.position.set(0, goalH / 2, goalW / 2);
        goalGroup.add(postRight);

        const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalW, 16), postMat);
        crossbar.rotation.x = Math.PI / 2;
        crossbar.position.set(0, goalH, 0);
        goalGroup.add(crossbar);

        const netGeo = new THREE.BoxGeometry(goalDepth, goalH, goalW);
        const netMesh = new THREE.Mesh(netGeo, netMat);
        netMesh.position.set(dir * goalDepth / 2, goalH / 2, 0);
        goalGroup.add(netMesh);

        goalGroup.position.set(posX, 0, 0);
        return { group: goalGroup, netMesh };
      };

      const gHome = createGoal(true);
      const gAway = createGoal(false);
      this.goalNetHome = gHome.netMesh;
      this.goalNetAway = gAway.netMesh;
      this.scene.add(gHome.group);
      this.scene.add(gAway.group);
    }

    /**
     * Vallas LED perimetrales con marquesina luminosa
     */
    buildLedPerimeter() {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, 1024, 64);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('★ LALIGA EA SPORTS ★ CIENCIA DE DATOS & ESTADÍSTICA INFERENCIAL ★ COLEGIO MAYOR DEL CAUCA ★', 20, 42);

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 1);

      this.ledMaterial = new THREE.MeshBasicMaterial({ map: tex });
      const boardGeo = new THREE.BoxGeometry(PITCH_L + 4, 1.3, 0.4);

      const boardN = new THREE.Mesh(boardGeo, this.ledMaterial);
      boardN.position.set(0, 0.65, -HALF_W - 1.8);
      this.scene.add(boardN);

      const boardS = new THREE.Mesh(boardGeo, this.ledMaterial);
      boardS.position.set(0, 0.65, HALF_W + 1.8);
      this.scene.add(boardS);
    }

    /**
     * Balón de fútbol con pentágonos de cuero
     */
    buildBall() {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 128);
      ctx.fillStyle = '#1e293b';

      const drawP = (x, y, r) => {
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
      drawP(40, 40, 16);
      drawP(120, 80, 16);
      drawP(200, 40, 16);

      const ballTex = new THREE.CanvasTexture(canvas);
      this.ballMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.75, 24, 24),
        new THREE.MeshStandardMaterial({ map: ballTex, roughness: 0.35, metalness: 0.1 })
      );
      this.ballMesh.position.set(0, 0.75, 0);
      this.ballMesh.castShadow = true;
      this.scene.add(this.ballMesh);

      // Sombra dinámica
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
        new THREE.PlaneGeometry(2.4, 2.4),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true, depthWrite: false })
      );
      this.ballShadow.rotation.x = -Math.PI / 2;
      this.ballShadow.position.set(0, 0.03, 0);
      this.scene.add(this.ballShadow);
    }

    buildCornerFlags() {
      const flagMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const poleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const corners = [
        { x: -HALF_L, z: -HALF_W }, { x: HALF_L, z: -HALF_W },
        { x: -HALF_L, z: HALF_W }, { x: HALF_L, z: HALF_W }
      ];
      corners.forEach(c => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8), poleMat);
        pole.position.set(c.x, 0.9, c.z);
        this.scene.add(pole);
        const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.4), flagMat);
        flag.position.set(c.x + 0.3, 1.6, c.z);
        this.scene.add(flag);
      });
    }

    /**
     * Mueve el balón y desplaza tácticamente a los jugadores hacia la jugada
     */
    animateBallTo(zoneKey, options = {}) {
      const target = ZONE_COORDS[zoneKey] || ZONE_COORDS['midfield'];
      const duration = options.duration || 1000;
      const peakY = options.peakY !== undefined ? options.peakY : (options.isAerial ? 6.5 : 0.0);

      this.ballState.startX = this.ballMesh.position.x;
      this.ballState.startY = this.ballMesh.position.y;
      this.ballState.startZ = this.ballMesh.position.z;

      this.ballState.targetX = target.x;
      this.ballState.targetY = target.y + 0.75;
      this.ballState.targetZ = target.z;
      this.ballState.peakY = peakY;

      this.ballState.startTime = performance.now();
      this.ballState.duration = duration;
      this.ballState.isMoving = true;

      // Desplazamiento reactivo de jugadores
      this.updatePlayerTactics(target);

      // Reproducir sonido de golpeo de balón
      if (window.StadiumAudio) {
        window.StadiumAudio.playBallKick();
      }

      // Si la cámara está en modo broadcast y no hay zoom de gol, seguir la pelota
      if (!this.isGoalZoom && this.cameraMode === 'broadcast') {
        this.cameraTarget.set(target.x * 0.45, 0, target.z * 0.25);
      }
    }

    /**
     * Actualiza las posiciones y animaciones de carrera de los jugadores
     */
    updatePlayerTactics(ballTarget) {
      // Determinar si ataca local o visitante
      const isHomeAttacking = ballTarget.x > 0;
      const attackers = isHomeAttacking ? this.playersHome : this.playersAway;
      const defenders = isHomeAttacking ? this.playersAway : this.playersHome;

      // El jugador atacante más cercano avanza hacia el balón
      let closestAttacker = attackers[0];
      let minDist = 999;
      attackers.forEach(p => {
        const d = p.group.position.distanceTo(new THREE.Vector3(ballTarget.x, 0, ballTarget.z));
        if (d < minDist) {
          minDist = d;
          closestAttacker = p;
        }
      });

      if (closestAttacker) {
        closestAttacker.targetPos.set(ballTarget.x - (isHomeAttacking ? 1.5 : -1.5), 0, ballTarget.z);
        closestAttacker.isKicking = true;
        setTimeout(() => { closestAttacker.isKicking = false; }, 800);
      }

      // Los porteros reaccionan si el balón se acerca a su área
      if (ballTarget.x > 30 && this.goalkeeperAway) {
        this.goalkeeperAway.targetPos.set(50.5, 0, ballTarget.z * 0.55);
      } else if (ballTarget.x < -30 && this.goalkeeperHome) {
        this.goalkeeperHome.targetPos.set(-50.5, 0, ballTarget.z * 0.55);
      }

      // El árbitro se mantiene a distancia prudencial
      if (this.referee) {
        this.referee.targetPos.set(ballTarget.x * 0.6, 0, ballTarget.z > 0 ? ballTarget.z - 10 : ballTarget.z + 10);
      }
    }

    /**
     * Festejo de gol: Celebración del goleador, cámara lenta, rugido y confeti
     */
    triggerGoalCelebration(isLeftGoal) {
      this.isGoalZoom = true;
      const net = isLeftGoal ? this.goalNetHome : this.goalNetAway;

      // Rugido del estadio sintetizado con Web Audio
      if (window.StadiumAudio) {
        window.StadiumAudio.playGoalRoar();
      }

      // Vibración física de la red de la portería
      if (net) {
        let count = 0;
        const netInterval = setInterval(() => {
          net.position.x += (Math.random() - 0.5) * 0.8;
          net.position.y += (Math.random() - 0.5) * 0.4;
          count++;
          if (count > 16) {
            clearInterval(netInterval);
            net.position.set(isLeftGoal ? -1.2 : 1.2, 1.22, 0);
          }
        }, 50);
      }

      // Carrera de festejo del delantero hacia el banderín de córner
      const scorer = isLeftGoal ? this.playersAway[this.playersAway.length - 1] : this.playersHome[this.playersHome.length - 1];
      if (scorer) {
        scorer.targetPos.set(isLeftGoal ? -46 : 46, 0, 24);
        scorer.armL.rotation.z = 2.4; // brazos levantados
        scorer.armR.rotation.z = -2.4;
        setTimeout(() => {
          scorer.armL.rotation.z = 0.2;
          scorer.armR.rotation.z = -0.2;
        }, 4000);
      }

      // Enfoque dramático de cámara hacia el gol
      const targetX = isLeftGoal ? -44 : 44;
      this.cameraTarget.set(targetX, 3.5, 0);

      this.spawnGoalParticles(isLeftGoal ? -HALF_L : HALF_L);

      setTimeout(() => {
        this.isGoalZoom = false;
        this.setCameraMode(this.cameraMode);
      }, 4200);
    }

    /**
     * Modos de Cámara ("Dentro del Estadio / A Pie de Campo", "Detrás del Arco", "Broadcast", etc.)
     */
    setCameraMode(mode) {
      this.cameraMode = mode;
      if (!this.camera) return;

      switch (mode) {
        case 'pitchside': // DENTRO DEL ESTADIO (A pie de campo / Banquillo)
          this.cameraGoal.set(0, 2.4, 32);
          this.cameraTarget.set(0, 1.8, 0);
          break;
        case 'goalcam': // DETRÁS DEL ARCO
          this.cameraGoal.set(-58, 3.8, 0);
          this.cameraTarget.set(-15, 1.5, 0);
          break;
        case 'aerial': // VISTA AÉREA CENITAL
          this.cameraGoal.set(0, 85, 0.1);
          this.cameraTarget.set(0, 0, 0);
          break;
        case 'orbit': // MODO LIBRE 360°
          // Los controles se manejan directamente con el ratón
          break;
        case 'broadcast':
        default: // TRANSMISIÓN TELEVISIVA CLÁSICA
          this.cameraGoal.set(0, 48, 62);
          this.cameraTarget.set(0, 0, 0);
          break;
      }
    }

    /**
     * Sistema de confeti y fuegos artificiales en gol
     */
    spawnGoalParticles(originX) {
      const pCount = 200;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      const pColors = new Float32Array(pCount * 3);

      const colors = [
        new THREE.Color(0xf59e0b),
        new THREE.Color(0x38bdf8),
        new THREE.Color(0xef4444),
        new THREE.Color(0x10b981)
      ];

      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] = originX + (Math.random() - 0.5) * 8;
        pPos[i * 3 + 1] = 2 + Math.random() * 4;
        pPos[i * 3 + 2] = (Math.random() - 0.5) * 16;

        const c = colors[Math.floor(Math.random() * colors.length)];
        pColors[i * 3] = c.r;
        pColors[i * 3 + 1] = c.g;
        pColors[i * 3 + 2] = c.b;
      }

      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

      const pMat = new THREE.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, opacity: 0.95 });
      const pSystem = new THREE.Points(pGeo, pMat);
      this.scene.add(pSystem);

      const startTime = performance.now();
      const pAnim = () => {
        const elapsed = (performance.now() - startTime) / 1000;
        if (elapsed > 2.8) {
          this.scene.remove(pSystem);
          pGeo.dispose();
          pMat.dispose();
          return;
        }

        const positions = pSystem.geometry.attributes.position.array;
        for (let i = 0; i < pCount; i++) {
          positions[i * 3 + 1] += 0.16;
          positions[i * 3] += (Math.random() - 0.5) * 0.12;
        }
        pSystem.geometry.attributes.position.needsUpdate = true;
        pMat.opacity = Math.max(0, 1 - elapsed / 2.8);

        requestAnimationFrame(pAnim);
      };
      pAnim();
    }

    /**
     * Bucle de Renderizado a 60 FPS
     */
    animate() {
      this.animFrameId = requestAnimationFrame(() => this.animate());

      const now = performance.now();
      const timeSec = now / 1000;

      // 1. Animación del Balón en 3D
      if (this.ballState.isMoving && this.ballMesh) {
        const elapsed = now - this.ballState.startTime;
        const t = Math.min(1.0, elapsed / this.ballState.duration);
        const easeT = 1 - Math.pow(1 - t, 2.5);

        const curX = this.ballState.startX + (this.ballState.targetX - this.ballState.startX) * easeT;
        const curZ = this.ballState.startZ + (this.ballState.targetZ - this.ballState.startZ) * easeT;
        const linearY = this.ballState.startY + (this.ballState.targetY - this.ballState.startY) * easeT;
        const arcY = 4 * this.ballState.peakY * t * (1 - t);
        const curY = Math.max(0.75, linearY + arcY);

        this.ballMesh.position.set(curX, curY, curZ);

        const deltaX = curX - (this.ballState.currentX || curX);
        const deltaZ = curZ - (this.ballState.currentZ || curZ);
        this.ballMesh.rotation.z -= deltaX * 1.5;
        this.ballMesh.rotation.x += deltaZ * 1.5;

        this.ballState.currentX = curX;
        this.ballState.currentY = curY;
        this.ballState.currentZ = curZ;

        if (this.ballShadow) {
          this.ballShadow.position.set(curX, 0.04, curZ);
          const shadowScale = Math.max(0.4, 1.0 - (curY - 0.75) * 0.08);
          this.ballShadow.scale.set(shadowScale, shadowScale, shadowScale);
          this.ballShadow.material.opacity = Math.max(0.15, 0.75 - (curY - 0.75) * 0.06);
        }

        if (t >= 1.0) this.ballState.isMoving = false;
      }

      // 2. Animación de Jugadores (Carrera de piernas y brazos)
      const animatePlayerList = (list) => {
        list.forEach((p, idx) => {
          // Desplazar hacia targetPos
          const dist = p.group.position.distanceTo(p.targetPos);
          if (dist > 0.2) {
            p.group.position.lerp(p.targetPos, 0.04);
            // Braceo y paso de carrera
            const legSwing = Math.sin(timeSec * 12 + idx) * 0.55;
            p.legL.rotation.x = legSwing;
            p.legR.rotation.x = -legSwing;
            p.armL.rotation.x = -legSwing * 0.7;
            p.armR.rotation.x = legSwing * 0.7;
          } else {
            // Regresar suavemente a pose de espera
            p.legL.rotation.x = THREE.MathUtils.lerp(p.legL.rotation.x, 0, 0.1);
            p.legR.rotation.x = THREE.MathUtils.lerp(p.legR.rotation.x, 0, 0.1);
          }

          // Animación de remate / patada
          if (p.isKicking) {
            p.legR.rotation.x = -1.2;
          }
        });
      };

      animatePlayerList(this.playersHome);
      animatePlayerList(this.playersAway);
      if (this.referee) animatePlayerList([this.referee]);
      if (this.goalkeeperHome) animatePlayerList([this.goalkeeperHome]);
      if (this.goalkeeperAway) animatePlayerList([this.goalkeeperAway]);

      // 3. Oleada de la Afición en las Gradas ("La Ola")
      if (this.crowdMesh && this.crowdData.length > 0) {
        const dummy = new THREE.Object3D();
        const waveSpeed = 3.2;
        for (let i = 0; i < this.crowdCount; i += 3) {
          const c = this.crowdData[i];
          const wave = Math.sin(timeSec * waveSpeed - c.baseAngle);
          const jumpY = wave > 0.6 ? (wave - 0.6) * 1.6 : 0;

          dummy.position.set(c.x, c.y + jumpY, c.z);
          dummy.updateMatrix();
          this.crowdMesh.setMatrixAt(i, dummy.matrix);
        }
        this.crowdMesh.instanceMatrix.needsUpdate = true;
      }

      // 4. Destellos de móviles en las gradas
      if (this.flashPoints) {
        const flashOpacity = (Math.sin(timeSec * 8) > 0.7) ? 0.95 : (Math.random() < 0.2 ? 0.8 : 0.05);
        this.flashPoints.material.opacity = flashOpacity;
      }

      // 5. Banderas ondeantes
      this.flags.forEach((f, idx) => {
        f.rotation.y = Math.sin(timeSec * 4 + idx) * 0.2;
      });

      // 6. Scroll de vallas LED
      if (this.ledMaterial && this.ledMaterial.map) {
        this.ledOffset += 0.0018;
        this.ledMaterial.map.offset.x = this.ledOffset;
      }

      // 7. Transición y seguimiento suave de la cámara
      if (this.camera && !this.controls?.state) {
        if (this.cameraMode !== 'orbit') {
          this.camera.position.lerp(this.cameraGoal, 0.035);
        }
        if (this.controls) {
          this.controls.target.lerp(this.cameraTarget, 0.04);
          this.controls.update();
        } else {
          this.camera.lookAt(this.cameraTarget);
        }
      } else if (this.controls) {
        this.controls.update();
      }

      this.renderer.render(this.scene, this.camera);
    }

    /**
     * Actualiza los colores de los jugadores cuando se cambian los clubes
     */
    updateTeams(homeTeam, awayTeam) {
      this.homeTeamName = homeTeam;
      this.awayTeamName = awayTeam;
      if (this.scene) {
        this.reset();
      }
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
      if (this.ballMesh) {
        this.ballMesh.position.set(0, 0.75, 0);
        this.ballMesh.rotation.set(0, 0, 0);
      }
      if (this.ballShadow) {
        this.ballShadow.position.set(0, 0.04, 0);
        this.ballShadow.scale.set(1, 1, 1);
      }
      this.setCameraMode(this.cameraMode);
    }

    destroy() {
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      window.removeEventListener('resize', this.onResize);
      if (this.renderer) this.renderer.dispose();
      this.isInitialized = false;
    }
  }

  window.Stadium3D = new Stadium3D();

})(window);
