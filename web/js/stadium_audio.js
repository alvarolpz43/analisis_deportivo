/**
 * Motor de Audio Sintetizado del Estadio (StadiumAudio)
 * Genera efectos acústicos inmersivos 100% nativos mediante la Web Audio API:
 * - Sin archivos externos ni dependencias: funciona de forma instantánea y offline
 * - Silbatazo reglamentario del árbitro (Whistle) con modulación de frecuencia dual
 * - Golpeo de balón (Ball Kick Thud) con caída de tono sub-grave
 * - Murmullo ambiental de estadio lleno (Crowd Ambience) con ruido filtrado
 * - Explosión de rugido de gol y celebración multitudinaria (Goal Celebration Roar)
 * - Control de volumen y botón de silenciado interactivo
 */

(function(window) {
  'use strict';

  class StadiumAudio {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.ambientGain = null;
      this.ambientSource = null;
      this.isAmbientPlaying = false;
    }

    /**
     * Asegura que el AudioContext esté inicializado tras interacción de usuario
     */
    init() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    /**
     * Alterna el estado de silencio
     */
    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.ambientGain) {
        this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
      }
      return this.isMuted;
    }

    /**
     * Silbato de árbitro profesional (doble oscilador con trino modulado)
     */
    playWhistle() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Frecuencias duales típicas de silbato Fox 40 Classic (2800 Hz y 3100 Hz)
      osc1.type = 'triangle';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(2850, now);
      osc2.frequency.setValueAtTime(3120, now);

      // Trino / vibrato
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(26, now);
      lfoGain.gain.setValueAtTime(140, now);
      lfo.connect(osc1.frequency);
      lfo.connect(osc2.frequency);

      // Envolvente de volumen (dos toques: pi-piiii)
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.12);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.16);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      lfo.start(now);
      osc1.start(now);
      osc2.start(now);

      lfo.stop(now + 0.46);
      osc1.stop(now + 0.46);
      osc2.stop(now + 0.46);
    }

    /**
     * Golpeo de balón (Impacto con el botín)
     */
    playBallKick() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Caída rápida de tono (120 Hz a 45 Hz)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.12);

      // Envolvente de impacto percusivo
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    }

    /**
     * Explosión y rugido de gol multitudinario (Gol de estadio)
     */
    playGoalRoar() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 2.8; // 2.8 segundos de euforia
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // Ruido rosa/marrón para emular miles de gargantas
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.025 * white) / 1.025;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // Filtro pasa banda resonante centrado en frecuencia vocal multitudinaria
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650, now);
      filter.frequency.linearRampToValueAtTime(1100, now + 0.6);
      filter.frequency.linearRampToValueAtTime(500, now + 2.5);
      filter.Q.setValueAtTime(1.8, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.4); // Crescendo explosivo
      gain.gain.linearRampToValueAtTime(0.25, now + 1.2);
      gain.gain.linearRampToValueAtTime(0.001, now + 2.8);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
    }

    /**
     * Inicia murmullo ambiental de fondo de estadio
     */
    startAmbientCrowd() {
      if (this.isAmbientPlaying || this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 2.0;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1;
        output[i] = (last + 0.02 * w) / 1.02;
        last = output[i];
      }

      this.ambientSource = this.ctx.createBufferSource();
      this.ambientSource.buffer = noiseBuffer;
      this.ambientSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 450;

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.06, this.ctx.currentTime);

      this.ambientSource.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientSource.start();
      this.isAmbientPlaying = true;
    }

    /**
     * Alias para compatibilidad con el simulador
     */
    startAmbience() {
      this.startAmbientCrowd();
    }

    /**
     * Detiene el murmullo ambiental
     */
    stopAmbience() {
      if (this.ambientSource) {
        try {
          this.ambientSource.stop();
        } catch (e) {}
        this.ambientSource = null;
        this.isAmbientPlaying = false;
      }
    }
  }

  window.StadiumAudio = new StadiumAudio();

})(window);
