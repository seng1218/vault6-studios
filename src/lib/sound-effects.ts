"use client";

// Web Audio API based sound synthesizer for premium customizable audio profiles
// Does not load any heavy audio files, operates procedurally in real-time.

export type SoundMode = "minimal" | "retro" | "mechanical" | "muted";

let audioCtx: AudioContext | null = null;
let activeMode: SoundMode = "minimal"; // default to minimal

// Restore sound mode from localStorage on client side
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("v6-sound-mode");
    if (saved === "minimal" || saved === "retro" || saved === "mechanical" || saved === "muted") {
      activeMode = saved;
    }
  } catch (e) {
    // Ignore localStorage failures
  }
}

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    // @ts-ignore
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

export function getSoundMode(): SoundMode {
  return activeMode;
}

export function setSoundMode(mode: SoundMode) {
  activeMode = mode;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("v6-sound-mode", mode);
    } catch (e) {
      // Ignore
    }
  }
}

export function playHoverSound() {
  if (activeMode === "muted") return;
  const ctx = getAudioContext();
  if (!ctx) return;
  
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (activeMode === "minimal") {
      // 1. Minimal Mode: Very quiet, subtle high-pitched sine click
      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      gain.gain.setValueAtTime(0.005, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.03);
    } 
    else if (activeMode === "retro") {
      // 2. Retro Mode: Original cyberpunk sweeping synth blip
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } 
    else if (activeMode === "mechanical") {
      // 3. Mechanical Mode: A short high-frequency tick simulating a physical relay
      osc.type = "square";
      osc.frequency.setValueAtTime(2400, ctx.currentTime);
      gain.gain.setValueAtTime(0.006, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.015);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.015);
    }
  } catch (e) {
    // Silently catch audio failures
  }
}

export function playClickSound() {
  if (activeMode === "muted") return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  try {
    if (activeMode === "minimal") {
      // 1. Minimal Mode: Short sine tone, very soft
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.012, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } 
    else if (activeMode === "retro") {
      // 2. Retro Mode: Deep, sweeping triangle click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.12);
    } 
    else if (activeMode === "mechanical") {
      // 3. Mechanical Mode: Simulates a physical double mechanical microswitch click
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.type = "square";
      osc1.frequency.setValueAtTime(1800, ctx.currentTime);
      gain1.gain.setValueAtTime(0.02, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.008);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.008);

      // Second release click
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.type = "square";
      osc2.frequency.setValueAtTime(1300, ctx.currentTime + 0.015);
      gain2.gain.setValueAtTime(0.015, ctx.currentTime + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025);
      osc2.start(ctx.currentTime + 0.015);
      osc2.stop(ctx.currentTime + 0.025);
    }
  } catch (e) {
    // Silently catch audio failures
  }
}

export function playSuccessSound() {
  if (activeMode === "muted") return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  try {
    if (activeMode === "minimal") {
      // 1. Minimal Mode: Clean double sine-wave chime chord
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.type = "sine";
      osc2.type = "sine";

      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.06); // E5

      osc2.frequency.setValueAtTime(783.99, ctx.currentTime); // G5
      osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.06); // C6

      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);
      osc2.stop(ctx.currentTime + 0.2);
    } 
    else if (activeMode === "retro") {
      // 2. Retro Mode: Cyberpunk upward major chime chord
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.type = "sine";
      osc2.type = "sine";
      
      osc1.frequency.setValueAtTime(600, ctx.currentTime);
      osc1.frequency.setValueAtTime(800, ctx.currentTime + 0.08);
      osc1.frequency.setValueAtTime(1200, ctx.currentTime + 0.16);

      osc2.frequency.setValueAtTime(750, ctx.currentTime);
      osc2.frequency.setValueAtTime(1000, ctx.currentTime + 0.08);
      osc2.frequency.setValueAtTime(1500, ctx.currentTime + 0.16);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } 
    else if (activeMode === "mechanical") {
      // 3. Mechanical Mode: A high speed double mechanical rattle chime
      const times = [0, 0.04, 0.08, 0.12];
      const freqs = [1800, 2000, 2200, 2400];
      
      times.forEach((timeOffset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "square";
        osc.frequency.setValueAtTime(freqs[idx], ctx.currentTime + timeOffset);
        gain.gain.setValueAtTime(0.015, ctx.currentTime + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + timeOffset + 0.03);
        
        osc.start(ctx.currentTime + timeOffset);
        osc.stop(ctx.currentTime + timeOffset + 0.03);
      });
    }
  } catch (e) {
    // Silently catch audio failures
  }
}
