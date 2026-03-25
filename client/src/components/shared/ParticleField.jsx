import { useEffect, useRef } from 'react';

export default function ParticleField({ count = 40 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const left = Math.random() * 100;
      const dur  = 8 + Math.random() * 14;
      const del  = Math.random() * 12;
      const size = Math.random() > 0.8 ? 3 : 2;
      p.style.cssText = `
        left:${left}%; bottom:-4px;
        width:${size}px; height:${size}px;
        animation-duration:${dur}s;
        animation-delay:${del}s;
        opacity:0;
      `;
      ref.current.appendChild(p);
    }
  }, [count]);

  return <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none" />;
}