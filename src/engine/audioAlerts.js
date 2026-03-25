// ============================================================
// DIGITAL BANDHU — AUDIO ALERT ENGINE
// Generates alert sounds using Web Audio API (no files needed)
// ============================================================

class AudioAlertEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  // Lazily create AudioContext (browsers require user gesture first)
  _getCtx() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Core tone generator
  _playTone(frequency, duration, type = 'sine', gain = 0.3, startTime = 0) {
    const ctx = this._getCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

    gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
    gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  }

  // HIGH RISK — Harsh buzzer alert (descending aggressive tones)
  playHighRisk() {
    if (!this.enabled) return;
    const ctx = this._getCtx();
    if (!ctx) return;

    // Triple buzz — like a security alarm
    [0, 0.22, 0.44].forEach((delay) => {
      this._playTone(440, 0.18, 'sawtooth', 0.45, delay);
      this._playTone(220, 0.18, 'sawtooth', 0.3, delay + 0.09);
    });

    // Low danger rumble underneath
    this._playTone(80, 0.8, 'square', 0.15, 0);
  }

  // MEDIUM RISK — Warning beep (two-tone caution)
  playMediumRisk() {
    if (!this.enabled) return;
    this._playTone(880, 0.15, 'triangle', 0.3, 0);
    this._playTone(660, 0.15, 'triangle', 0.3, 0.2);
  }

  // SAFE — Pleasant success chime (ascending arpeggio)
  playSafe() {
    if (!this.enabled) return;
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      this._playTone(freq, 0.25, 'sine', 0.25, i * 0.1);
    });
  }

  // Play based on risk level string
  playForLevel(level) {
    if (!this.enabled) return;
    if (level === 'High') this.playHighRisk();
    else if (level === 'Medium') this.playMediumRisk();
    else this.playSafe();
  }

  setEnabled(val) {
    this.enabled = val;
  }
}

// Singleton export
const audioAlerts = new AudioAlertEngine();
export default audioAlerts;
