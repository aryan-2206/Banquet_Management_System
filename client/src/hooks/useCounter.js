import { useState } from 'react';

// Simple counter hook that animates from 0 to target
export default function useCounter(target, duration = 2000, inView = true) {
  const [count, setCount] = useState(0);

  // Use useState + useEffect pattern
  const [ran, setRan] = useState(false);

  if (inView && !ran) {
    setRan(true);
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  return count;
}