import { Howl } from 'howler';

// Sound effect types
export type SoundEffect =
  | 'click'
  | 'hover'
  | 'coin'
  | 'win'
  | 'lose'
  | 'roulette-spin'
  | 'slot-spin'
  | 'slot-stop'
  | 'card-flip'
  | 'timer-tick'
  | 'timer-complete'
  | 'purchase'
  | 'sell';

// Web Audio API context
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
};

// Generate sound using Web Audio API
const generateSound = (
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
): Promise<ArrayBuffer> => {
  return new Promise((resolve) => {
    const ctx = getAudioContext();
    const sampleRate = ctx.sampleRate;
    const numSamples = sampleRate * duration;
    const buffer = ctx.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    const oscillator = ctx.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;

    // Generate waveform data
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-3 * t / duration); // Exponential decay

      if (type === 'sine') {
        data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * volume;
      } else if (type === 'square') {
        data[i] = (Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1) * envelope * volume;
      } else if (type === 'triangle') {
        data[i] = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t)) * envelope * volume;
      }
    }

    // Convert to WAV
    const wav = bufferToWave(buffer, buffer.length);
    resolve(wav);
  });
};

// Convert AudioBuffer to WAV
const bufferToWave = (abuffer: AudioBuffer, len: number): ArrayBuffer => {
  const numOfChan = abuffer.numberOfChannels;
  const length = len * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit (hardcoded in this demo)

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  // write interleaved data
  for (i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(pos, sample, true); // write 16-bit sample
      pos += 2;
    }
    offset++; // next source sample
  }

  // create Blob
  return buffer;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
};

// Generate complex sounds
const generateClickSound = async (): Promise<ArrayBuffer> => {
  return generateSound(800, 0.05, 'sine', 0.2);
};

const generateHoverSound = async (): Promise<ArrayBuffer> => {
  return generateSound(1200, 0.03, 'sine', 0.1);
};

const generateCoinSound = async (): Promise<ArrayBuffer> => {
  // Multi-tone coin sound
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const duration = 0.3;
  const numSamples = sampleRate * duration;
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  const frequencies = [587.33, 880, 1174.66]; // D5, A5, D6

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-5 * t / duration);

    let sample = 0;
    frequencies.forEach((freq) => {
      sample += Math.sin(2 * Math.PI * freq * t) * envelope * (0.3 / frequencies.length);
    });

    data[i] = sample;
  }

  return bufferToWave(buffer, buffer.length);
};

const generateWinSound = async (): Promise<ArrayBuffer> => {
  // Ascending arpeggio
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const duration = 0.6;
  const numSamples = sampleRate * duration;
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C (major chord)
  const noteLength = duration / notes.length;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const noteIndex = Math.min(Math.floor(t / noteLength), notes.length - 1);
    const freq = notes[noteIndex];
    const envelope = Math.exp(-3 * (t - noteIndex * noteLength) / noteLength);

    data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
  }

  return bufferToWave(buffer, buffer.length);
};

const generateLoseSound = async (): Promise<ArrayBuffer> => {
  // Descending tone
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const duration = 0.4;
  const numSamples = sampleRate * duration;
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  const startFreq = 440;
  const endFreq = 220;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = startFreq + (endFreq - startFreq) * (t / duration);
    const envelope = Math.exp(-2 * t / duration);

    data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
  }

  return bufferToWave(buffer, buffer.length);
};

const generateRouletteSpinSound = async (): Promise<ArrayBuffer> => {
  // Mechanical spinning sound
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const duration = 2.0;
  const numSamples = sampleRate * duration;
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const speed = 1 - (t / duration); // Slowing down
    const freq = 50 + speed * 100;
    const noise = (Math.random() - 0.5) * 0.1;

    data[i] = (Math.sin(2 * Math.PI * freq * t) * 0.2 + noise) * speed;
  }

  return bufferToWave(buffer, buffer.length);
};

const generateSlotSpinSound = async (): Promise<ArrayBuffer> => {
  return generateSound(200, 0.5, 'square', 0.2);
};

const generateSlotStopSound = async (): Promise<ArrayBuffer> => {
  return generateSound(150, 0.15, 'triangle', 0.3);
};

const generateCardFlipSound = async (): Promise<ArrayBuffer> => {
  return generateSound(300, 0.08, 'triangle', 0.2);
};

const generateTimerTickSound = async (): Promise<ArrayBuffer> => {
  return generateSound(1000, 0.05, 'sine', 0.15);
};

const generateTimerCompleteSound = async (): Promise<ArrayBuffer> => {
  return generateWinSound(); // Reuse win sound
};

const generatePurchaseSound = async (): Promise<ArrayBuffer> => {
  return generateCoinSound(); // Reuse coin sound
};

const generateSellSound = async (): Promise<ArrayBuffer> => {
  // Similar to coin but lower pitch
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const duration = 0.3;
  const numSamples = sampleRate * duration;
  const buffer = ctx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  const frequencies = [293.66, 440, 587.33]; // D4, A4, D5

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-5 * t / duration);

    let sample = 0;
    frequencies.forEach((freq) => {
      sample += Math.sin(2 * Math.PI * freq * t) * envelope * (0.3 / frequencies.length);
    });

    data[i] = sample;
  }

  return bufferToWave(buffer, buffer.length);
};

// Sound manager class
class SoundManager {
  private sounds: Map<SoundEffect, Howl> = new Map();
  private backgroundMusic: Howl | null = null;
  private initialized = false;

  async init() {
    if (this.initialized) return;

    try {
      // Check if audio context is available
      if (!window.AudioContext && !(window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext) {
        console.warn('Web Audio API not supported in this browser');
        return;
      }

      // Generate and cache all sound effects
      const soundGenerators: Record<SoundEffect, () => Promise<ArrayBuffer>> = {
        click: generateClickSound,
        hover: generateHoverSound,
        coin: generateCoinSound,
        win: generateWinSound,
        lose: generateLoseSound,
        'roulette-spin': generateRouletteSpinSound,
        'slot-spin': generateSlotSpinSound,
        'slot-stop': generateSlotStopSound,
        'card-flip': generateCardFlipSound,
        'timer-tick': generateTimerTickSound,
        'timer-complete': generateTimerCompleteSound,
        purchase: generatePurchaseSound,
        sell: generateSellSound,
      };

      for (const [name, generator] of Object.entries(soundGenerators)) {
        try {
          const audioBuffer = await generator();
          const blob = new Blob([audioBuffer], { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);

          this.sounds.set(name as SoundEffect, new Howl({
            src: [url],
            volume: 0.5,
            html5: true, // Use HTML5 Audio to avoid some browser issues
            preload: false, // Lazy load to avoid warnings
          }));
        } catch (err) {
          console.warn(`Failed to generate sound: ${name}`, err);
        }
      }

      // Initialize background music (simple casino-style loop)
      this.initBackgroundMusic();

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize sound manager:', error);
    }
  }

  private async initBackgroundMusic() {
    try {
      // Generate a simple looping background track
      const ctx = getAudioContext();
      const sampleRate = ctx.sampleRate;
      const duration = 8.0; // 8-second loop
      const numSamples = sampleRate * duration;
      const buffer = ctx.createBuffer(2, numSamples, sampleRate); // Stereo

      // Simple chord progression: C - Am - F - G
      const chordProgression = [
        [261.63, 329.63, 392.00], // C major
        [220.00, 261.63, 329.63], // A minor
        [174.61, 220.00, 261.63], // F major
        [196.00, 246.94, 293.66], // G major
      ];

      const chordDuration = duration / chordProgression.length;

      for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);

        for (let i = 0; i < numSamples; i++) {
          const t = i / sampleRate;
          const chordIndex = Math.floor(t / chordDuration) % chordProgression.length;
          const chord = chordProgression[chordIndex];

          let sample = 0;
          chord.forEach((freq) => {
            const phase = channel === 0 ? 0 : Math.PI / 4; // Slight stereo effect
            sample += Math.sin(2 * Math.PI * freq * t + phase) * 0.08;
          });

          // Add subtle rhythm
          const beat = Math.floor(t * 2) % 2;
          const beatEnvelope = beat === 0 ? 1.2 : 0.8;

          data[i] = sample * beatEnvelope;
        }
      }

      const wav = bufferToWave(buffer, buffer.length);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);

      this.backgroundMusic = new Howl({
        src: [url],
        loop: true,
        volume: 0.3,
        html5: true,
        preload: false,
      });
    } catch (error) {
      console.warn('Failed to initialize background music:', error);
    }
  }

  play(effect: SoundEffect, volume: number = 0.5) {
    if (!this.initialized) {
      this.init().then(() => this.playSound(effect, volume));
    } else {
      this.playSound(effect, volume);
    }
  }

  private playSound(effect: SoundEffect, volume: number) {
    const sound = this.sounds.get(effect);
    if (sound) {
      sound.volume(volume);
      sound.play();
    }
  }

  playMusic(volume: number = 0.3) {
    if (!this.initialized) {
      this.init().then(() => {
        if (this.backgroundMusic) {
          this.backgroundMusic.volume(volume);
          this.backgroundMusic.play();
        }
      });
    } else if (this.backgroundMusic) {
      this.backgroundMusic.volume(volume);
      this.backgroundMusic.play();
    }
  }

  stopMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }
  }

  setMusicVolume(volume: number) {
    if (this.backgroundMusic) {
      this.backgroundMusic.volume(volume);
    }
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
