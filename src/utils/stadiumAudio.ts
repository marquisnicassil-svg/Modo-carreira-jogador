// Synthesizes a realistic football stadium entrance soundscape using Web Audio API:
// - Stadium Convolver Reverb (open-air arena echo)
// - Torcida Surdo/Bumbo drum cadence + rhythmic crowd claps
// - Warm stadium brass/chorus entrance chord
// - Authentic trilled referee kickoff whistle

export interface StadiumCheerController {
  started: boolean;
  needsGesture: boolean;
  unlockAndPlay: () => Promise<boolean>;
  stop: () => void;
}

let sharedAudioCtx: AudioContext | null = null;
let cachedReverbImpulse: AudioBuffer | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioCtx();
    cachedReverbImpulse = null;
  }
  return sharedAudioCtx;
}

function getStadiumImpulse(ctx: AudioContext): AudioBuffer {
  if (cachedReverbImpulse && cachedReverbImpulse.sampleRate === ctx.sampleRate) {
    return cachedReverbImpulse;
  }

  const duration = 1.45;
  const length = Math.floor(ctx.sampleRate * duration);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < length; i++) {
      const t = i / length;
      // Smooth stadium reflection decay with natural high-frequency damping
      const env = Math.pow(1 - t, 2.6);
      const white = Math.random() * 2 - 1;
      lp = lp * 0.65 + white * 0.35;
      data[i] = lp * env * 0.45;
    }
  }

  cachedReverbImpulse = impulse;
  return impulse;
}

function scheduleSurdoDrum(
  ctx: AudioContext,
  dest: AudioNode,
  time: number,
  intensity = 1
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(108, time);
  osc.frequency.exponentialRampToValueAtTime(44, time + 0.14);

  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(0.55 * intensity, time + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0008, time + 0.36);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(time);
  osc.stop(time + 0.38);
}

function scheduleCrowdClapBurst(
  ctx: AudioContext,
  dest: AudioNode,
  clapNoiseBuffer: AudioBuffer,
  time: number,
  intensity = 1
) {
  // Layer 6 slightly staggered micro-claps across stereo width for real crowd feel
  const offsets = [0, 0.011, 0.023, 0.034, 0.048, 0.062];
  for (let i = 0; i < offsets.length; i++) {
    const t = time + offsets[i];
    const src = ctx.createBufferSource();
    src.buffer = clapNoiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1150 + (i % 3) * 320, t);
    filter.Q.setValueAtTime(1.6, t);

    const gain = ctx.createGain();
    const peak = (0.13 + (i % 2) * 0.04) * intensity;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(peak, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.055);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    src.start(t);
    src.stop(t + 0.065);
  }
}

function scheduleRefereeWhistle(
  ctx: AudioContext,
  dest: AudioNode,
  startTime: number,
  duration: number
) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const trillLfo = ctx.createOscillator();
  const trillDepth1 = ctx.createGain();
  const trillDepth2 = ctx.createGain();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc2.type = 'triangle';
  osc1.frequency.setValueAtTime(2820, startTime);
  osc2.frequency.setValueAtTime(3010, startTime);

  // Classic spinning-pea whistle modulation (~38Hz trill)
  trillLfo.type = 'sine';
  trillLfo.frequency.setValueAtTime(38, startTime);
  trillDepth1.gain.setValueAtTime(95, startTime);
  trillDepth2.gain.setValueAtTime(110, startTime);

  trillLfo.connect(trillDepth1);
  trillLfo.connect(trillDepth2);
  trillDepth1.connect(osc1.frequency);
  trillDepth2.connect(osc2.frequency);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(0.11, startTime + 0.02);
  gain.gain.setValueAtTime(0.1, startTime + duration - 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(dest);

  trillLfo.start(startTime);
  osc1.start(startTime);
  osc2.start(startTime);

  trillLfo.stop(startTime + duration + 0.02);
  osc1.stop(startTime + duration + 0.02);
  osc2.stop(startTime + duration + 0.02);
}

function scheduleStadiumChord(
  ctx: AudioContext,
  dest: AudioNode,
  startTime: number,
  duration: number
) {
  // Warm stadium brass/organ swell (C major / G5 athletic stadium progression)
  const freqs = [130.81, 196.0, 261.63, 329.63, 392.0];
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(420, startTime);
  filter.frequency.exponentialRampToValueAtTime(1650, startTime + 0.85);
  filter.frequency.exponentialRampToValueAtTime(750, startTime + duration);
  filter.Q.setValueAtTime(0.8, startTime);

  const chordGain = ctx.createGain();
  chordGain.gain.setValueAtTime(0.0001, startTime);
  chordGain.gain.linearRampToValueAtTime(0.12, startTime + 0.35);
  chordGain.gain.linearRampToValueAtTime(0.16, startTime + 0.95);
  chordGain.gain.exponentialRampToValueAtTime(0.0005, startTime + duration);

  filter.connect(chordGain);
  chordGain.connect(dest);

  for (let i = 0; i < freqs.length; i++) {
    const osc = ctx.createOscillator();
    osc.type = i < 2 ? 'triangle' : 'sawtooth';
    osc.frequency.setValueAtTime(freqs[i], startTime);
    osc.detune.setValueAtTime((i - 2) * 5, startTime);

    const voiceGain = ctx.createGain();
    voiceGain.gain.setValueAtTime(i < 2 ? 0.35 : 0.18, startTime);

    osc.connect(voiceGain);
    voiceGain.connect(filter);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }
}

export function startStadiumCheer(durationSec = 2.9): StadiumCheerController {
  const ctx = getAudioContext();
  if (!ctx) {
    return {
      started: false,
      needsGesture: false,
      unlockAndPlay: async () => false,
      stop: () => {},
    };
  }

  let masterGain: GainNode | null = null;
  let hasPlayed = false;
  let isStopped = false;

  const triggerGraph = () => {
    if (hasPlayed || isStopped) return;
    hasPlayed = true;

    const now = ctx.currentTime;
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85, now);
    masterGain.connect(ctx.destination);

    // Dry + Stadium Reverb mix
    const dryBus = ctx.createGain();
    dryBus.gain.setValueAtTime(0.75, now);
    dryBus.connect(masterGain);

    const convolver = ctx.createConvolver();
    convolver.buffer = getStadiumImpulse(ctx);
    const wetBus = ctx.createGain();
    wetBus.gain.setValueAtTime(0.55, now);
    convolver.connect(wetBus);
    wetBus.connect(masterGain);

    const bus = ctx.createGain();
    bus.gain.setValueAtTime(1, now);
    bus.connect(dryBus);
    bus.connect(convolver);

    // Short clap noise buffer (80ms)
    const clapLen = Math.floor(ctx.sampleRate * 0.08);
    const clapBuf = ctx.createBuffer(1, clapLen, ctx.sampleRate);
    const clapData = clapBuf.getChannelData(0);
    for (let i = 0; i < clapLen; i++) {
      clapData[i] = Math.random() * 2 - 1;
    }

    // Iconic stadium crowd drum & clap cadence:
    // BOOM (clap) ... BOOM (clap) ... BOOM-BOOM-BOOM (clap-clap-clap)!
    const beats = [
      { t: 0.08, power: 0.85 },
      { t: 0.56, power: 0.92 },
      { t: 1.04, power: 1.0 },
      { t: 1.24, power: 0.95 },
      { t: 1.44, power: 1.1 },
    ];

    for (const beat of beats) {
      if (beat.t < durationSec - 0.3) {
        scheduleSurdoDrum(ctx, bus, now + beat.t, beat.power);
        scheduleCrowdClapBurst(ctx, bus, clapBuf, now + beat.t + 0.015, beat.power);
      }
    }

    // Triumphant stadium entrance chord swelling through the golden star reveal
    if (durationSec >= 1.6) {
      scheduleStadiumChord(ctx, bus, now + 0.55, Math.min(2.1, durationSec - 0.6));
    }

    // Authentic referee kickoff whistle signaling career start
    if (durationSec >= 2.0) {
      scheduleRefereeWhistle(ctx, bus, now + 1.72, 0.13);
      scheduleRefereeWhistle(ctx, bus, now + 1.92, 0.36);
    }
  };

  const stop = () => {
    isStopped = true;
    if (!hasPlayed || !masterGain) return;
    try {
      const now = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(Math.max(0.0001, masterGain.gain.value), now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    } catch {
      // Ignore already finished audio nodes
    }
  };

  const unlockAndPlay = async (): Promise<boolean> => {
    if (isStopped) return false;
    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      if (ctx.state === 'running') {
        triggerGraph();
        return true;
      }
    } catch {
      // Ignore Web Audio autoplay rejection
    }
    return false;
  };

  let started = false;
  let needsGesture = false;

  if (ctx.state === 'running') {
    triggerGraph();
    started = true;
  } else {
    needsGesture = true;
    void ctx
      .resume()
      .then(() => {
        if (!isStopped && ctx.state === 'running') {
          triggerGraph();
        }
      })
      .catch(() => {
        // Browser requires a user tap/click before playing audio
      });
  }

  return {
    started,
    needsGesture,
    unlockAndPlay,
    stop,
  };
}
