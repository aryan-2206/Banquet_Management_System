import { useEffect, useRef } from 'react';

export default function Cursor() {
  const dot  = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0;

    const move = (e) => { mx = e.clientX; my = e.clientY; };
    document.addEventListener('mousemove', move);

    let raf;
    const animate = () => {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      if (dot.current)  { dot.current.style.left  = mx + 'px'; dot.current.style.top  = my + 'px'; }
      if (ring.current) { ring.current.style.left = rx + 'px'; ring.current.style.top = ry + 'px'; }
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => { document.removeEventListener('mousemove', move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div id="cursor-dot"  ref={dot}  />
      <div id="cursor-ring" ref={ring} />
    </>
  );
}