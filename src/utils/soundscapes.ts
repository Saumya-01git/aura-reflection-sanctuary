/**
 * Ambient Soundscape Generator using the Web Audio API
 * Generates continuous, soothing procedural soundscapes (Rain, Night Forest, Deep Focus Waves)
 * without external audio asset dependencies.
 */

export type SoundscapeType = 'off' | 'rain' | 'forest' | 'waves';
export type SoundscapePreset = SoundscapeType;

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private currentSoundscape: SoundscapeType = 'off';
  private volume: number = 0.35;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.gainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrent(): SoundscapeType {
    return this.currentSoundscape;
  }

  public stop() {
    this.activeNodes.forEach((node) => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else {
        try {
          if ('stop' in node && typeof (node as any).stop === 'function') {
            (node as any).stop();
          }
          node.disconnect();
        } catch (e) {
          // ignore cleanup errors
        }
      }
    });
    this.activeNodes = [];
    this.currentSoundscape = 'off';
  }

  public play(type: SoundscapeType) {
    this.initContext();
    if (!this.ctx || !this.gainNode) return;

    this.stop();
    if (type === 'off') return;

    this.currentSoundscape = type;

    if (type === 'rain') {
      this.startRain();
    } else if (type === 'forest') {
      this.startForest();
    } else if (type === 'waves') {
      this.startWaves();
    }
  }

  // Procedural Pink Noise + Filtered Rain
  private startRain() {
    if (!this.ctx || !this.gainNode) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(800, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    whiteNoise.connect(lowpass);
    lowpass.connect(rainGain);
    rainGain.connect(this.gainNode);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, lowpass, rainGain);
  }

  // Procedural Forest Ambient Swells
  private startForest() {
    if (!this.ctx || !this.gainNode) return;

    // Wind bed
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.gainNode);
    osc.start();

    // Gentle frequency modulation for breeze
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(15, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    this.activeNodes.push(osc, filter, windGain, lfo, lfoGain);
  }

  // Deep Focus Harmonic Waves
  private startWaves() {
    if (!this.ctx || !this.gainNode) return;

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(110, this.ctx.currentTime); // A2 harmonic

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    // Filter swell
    const swellFilter = this.ctx.createBiquadFilter();
    swellFilter.type = 'lowpass';
    swellFilter.frequency.setValueAtTime(200, this.ctx.currentTime);

    osc1.connect(swellFilter);
    osc2.connect(swellFilter);
    swellFilter.connect(waveGain);
    waveGain.connect(this.gainNode);

    osc1.start();
    osc2.start();

    // LFO for wave tide swell
    const tideLfo = this.ctx.createOscillator();
    tideLfo.type = 'sine';
    tideLfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 8 second wave cycle
    const tideGain = this.ctx.createGain();
    tideGain.gain.setValueAtTime(180, this.ctx.currentTime);
    tideLfo.connect(tideGain);
    tideGain.connect(swellFilter.frequency);
    tideLfo.start();

    this.activeNodes.push(osc1, osc2, swellFilter, waveGain, tideLfo, tideGain);
  }
}

export const soundscapeEngine = new SoundscapeEngine();
