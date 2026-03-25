import { useEffect } from 'react';

// Triggers reveal animations on elements with 'reveal' class
export default function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('reveal-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}