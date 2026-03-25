import { useCallback, useRef } from 'react';

/**
 * useSound — Web Audio API synth for scan feedback.
 * No external files needed. Off by default.
 */
export default function useSound(enabled = false) {
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      try { ctxRef.current = new (window.AudioContext || window.webkitAudioContext)(); }
      catch { return null; }
    }
    return ctxRef.current;
  }, []);

  /** Success beep: 880Hz, 80ms, clean sine */
  const playSuccess = useCallback(() => {
    if (!enabled) return;
    const ctx = getCtx(); if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine'; osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.14);
  }, [enabled, getCtx]);

  /** Error beep: two 440Hz bursts, 100ms each, 50ms gap */
  const playError = useCallback(() => {
    if (!enabled) return;
    const ctx = getCtx(); if (!ctx) return;
    [0, 0.15].forEach(offset => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.1);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.1);
    });
  }, [enabled, getCtx]);

  return { playSuccess, playError };
}
