/**
 * AudioManager - Web Audio API Procedural Synthesizer
 * Zero-dependency, lightweight, reliable procedural audio engine.
 * Generates custom dynamic SFX and upbeat background music in real-time.
 */
export class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.bgmGain = null;

        this.sfxVolume = 0.8;
        this.bgmVolume = 0.5;
        this.isMuted = false;
        this.isBgmEnabled = true;
        this.isSfxEnabled = true;

        this.isBgmPlaying = false;
        this.bgmTimer = null;
        this.bgmStep = 0;

        // Continuous cooking sizzle node reference
        this.activeSizzleNode = null;
        this.sizzleSourceCount = 0;
    }

    /**
     * Lazy initialization of Web Audio context on first user gesture
     */
    init() {
        if (this.ctx) {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            return;
        }

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            console.warn('[AudioManager] Web Audio API is not supported in this browser.');
            return;
        }

        this.ctx = new AudioContextClass();

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // SFX Sub-bus
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.isSfxEnabled ? this.sfxVolume : 0, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        // BGM Sub-bus
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(this.isBgmEnabled ? this.bgmVolume : 0, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);
    }

    /**
     * Set Master Mute
     * @param {boolean} muted 
     */
    setMuted(muted) {
        this.isMuted = !!muted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime, 0.05);
        }
    }

    /**
     * Enable or disable BGM music playback
     * @param {boolean} enabled 
     */
    setBgmEnabled(enabled) {
        this.isBgmEnabled = !!enabled;
        if (this.bgmGain && this.ctx) {
            const target = this.isBgmEnabled ? this.bgmVolume : 0;
            this.bgmGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
        }
    }

    /**
     * Enable or disable SFX playback
     * @param {boolean} enabled 
     */
    setSfxEnabled(enabled) {
        this.isSfxEnabled = !!enabled;
        if (this.sfxGain && this.ctx) {
            const target = this.isSfxEnabled ? this.sfxVolume : 0;
            this.sfxGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
        }
    }

    /**
     * Set SFX Volume (0.0 to 1.0)
     * @param {number} vol 
     */
    setSFXVolume(vol) {
        this.sfxVolume = Math.max(0, Math.min(1, vol));
        if (this.sfxGain && this.ctx) {
            const target = this.isSfxEnabled ? this.sfxVolume : 0;
            this.sfxGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
        }
    }

    /**
     * Set BGM Volume (0.0 to 1.0)
     * @param {number} vol 
     */
    setBGMVolume(vol) {
        this.bgmVolume = Math.max(0, Math.min(1, vol));
        if (this.bgmGain && this.ctx) {
            const target = this.isBgmEnabled ? this.bgmVolume : 0;
            this.bgmGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
        }
    }

    // ==========================================
    // PROCEDURAL SFX GENERATION
    // ==========================================

    /**
     * Play snappy UI pop / click
     */
    playClick() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    /**
     * Play knife chopping sound
     */
    playChop() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.06);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    /**
     * Play dish pickup or place snap
     */
    playPlateSnap() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    /**
     * Play delightful coin / tip clink
     */
    playCoin() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        [1046.5, 1318.5, 1567.98].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + idx * 0.04;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.25, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(start);
            osc.stop(start + 0.2);
        });
    }

    /**
     * Play high-reward "PERFECT!" bell chime
     */
    playPerfect() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6 arpeggio

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + idx * 0.06;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.3, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(start);
            osc.stop(start + 0.4);
        });
    }

    /**
     * Play burnt food warning or failure buzz
     */
    playFail() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.25);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    /**
     * Play trash bin discard whoosh
     */
    playTrash() {
        this.init();
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    /**
     * Start/Increment continuous grill sizzle loop using white noise
     */
    startSizzle() {
        this.sizzleSourceCount++;
        if (this.activeSizzleNode) return;

        this.init();
        if (!this.ctx) return;

        // Generate 2 seconds of pink/white noise buffer for sizzling (cached once)
        if (!this.cachedSizzleBuffer) {
            const bufferSize = Math.round(this.ctx.sampleRate * 1.5);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            let b0 = 0, b1 = 0, b2 = 0;

            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99 * b0 + white * 0.05;
                b1 = 0.95 * b1 + white * 0.1;
                b2 = 0.85 * b2 + white * 0.25;
                data[i] = (b0 + b1 + b2) * 0.15;
            }
            this.cachedSizzleBuffer = buffer;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.cachedSizzleBuffer;
        noise.loop = true;


        // Bandpass filter to make it sound like frying oil
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2400;
        filter.Q.value = 1.2;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start();
        this.activeSizzleNode = { noise, gain };
    }

    /**
     * Stop/Decrement continuous grill sizzle
     */
    stopSizzle() {
        this.sizzleSourceCount = Math.max(0, this.sizzleSourceCount - 1);
        if (this.sizzleSourceCount === 0 && this.activeSizzleNode) {
            try {
                this.activeSizzleNode.noise.stop();
                this.activeSizzleNode.noise.disconnect();
            } catch (e) {
                // Safe ignore if already stopped
            }
            this.activeSizzleNode = null;
        }
    }

    // ==========================================
    // PROCEDURAL BACKGROUND MUSIC (BGM)
    // ==========================================

    /**
     * Start the upbeat cheerful diner soundtrack loop
     */
    startBGM() {
        if (this.isBgmPlaying) return;
        this.init();
        this.isBgmPlaying = true;
        this.bgmStep = 0;

        // Cheerful casual chord progression: C - Am - F - G (I - vi - IV - V)
        const chords = [
            [261.63, 329.63, 392.00], // C4, E4, G4
            [220.00, 261.63, 329.63], // A3, C4, E4
            [174.61, 220.00, 261.63], // F3, A3, C4
            [196.00, 246.94, 293.66]  // G3, B3, D4
        ];

        const melodyNotes = [
            523.25, 659.25, 783.99, 659.25,
            587.33, 523.25, 440.00, 523.25,
            440.00, 523.25, 659.25, 523.25,
            587.33, 659.25, 783.99, 987.77
        ];

        const stepDurationMs = 280; // Upbeat bouncy tempo

        const tick = () => {
            if (!this.isBgmPlaying || !this.ctx || this.isMuted) {
                this.bgmTimer = setTimeout(tick, stepDurationMs);
                return;
            }

            const now = this.ctx.currentTime;
            const currentChord = chords[Math.floor(this.bgmStep / 4) % chords.length];
            const currentMelody = melodyNotes[this.bgmStep % melodyNotes.length];

            // Play background chord pluck on beat 1 and 3 of the bar
            if (this.bgmStep % 2 === 0) {
                currentChord.forEach((freq) => {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now);

                    gain.gain.setValueAtTime(0.04, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

                    osc.connect(gain);
                    gain.connect(this.bgmGain);

                    osc.start(now);
                    osc.stop(now + 0.4);
                });
            }

            // Play upbeat melody pluck
            const melOsc = this.ctx.createOscillator();
            const melGain = this.ctx.createGain();
            melOsc.type = 'sine';
            melOsc.frequency.setValueAtTime(currentMelody, now);

            melGain.gain.setValueAtTime(0.08, now);
            melGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

            melOsc.connect(melGain);
            melGain.connect(this.bgmGain);

            melOsc.start(now);
            melOsc.stop(now + 0.24);

            this.bgmStep = (this.bgmStep + 1) % 64;
            this.bgmTimer = setTimeout(tick, stepDurationMs);
        };

        this.bgmTimer = setTimeout(tick, stepDurationMs);
    }

    /**
     * Stop background music loop
     */
    stopBGM() {
        this.isBgmPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}

export const globalAudioManager = new AudioManager();
