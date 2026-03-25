import { useState, useEffect, useRef } from 'react';

export default function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.floor(ease * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
      else setCount(target);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, start]);

  return count;
}