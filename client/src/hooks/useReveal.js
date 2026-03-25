import { useEffect } from 'react';

export default function useReveal(selector = '.reveal, .reveal-left, .reveal-right') {
  useEffect(() => {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // stagger children if they have delay classes already
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}