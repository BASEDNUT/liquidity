import { useEffect, useMemo, useState } from 'react';

export default function FallingNutsOverlay({ active = true, density = 'low', intervalMs = 20000 }) {
  const [items, setItems] = useState([]);
  const prefersReducedMotion = useMemo(() => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  useEffect(() => {
    if (!active || prefersReducedMotion) return;
    const spawn = () => {
      const count = density === 'med' ? 8 : 4;
      const next = Array.from({ length: count }).map((_, i) => ({
        id: `${Date.now()}-${i}`,
        left: Math.random() * 100,
        emoji: Math.random() > 0.5 ? '🥜' : '🌰',
        duration: 8000 + Math.random() * 4000,
      }));
      setItems((prev) => [...prev, ...next]);
      setTimeout(() => {
        setItems((prev) => prev.slice(next.length));
      }, Math.max(...next.map(n => n.duration)));
    };
    const id = setInterval(spawn, intervalMs + Math.random() * 5000);
    spawn();
    return () => clearInterval(id);
  }, [active, density, intervalMs, prefersReducedMotion]);

  if (!active || prefersReducedMotion) return null;

  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
      {items.map((it) => (
        <div key={it.id} style={{
          position: 'absolute',
          top: -40,
          left: `${it.left}%`,
          fontSize: 24,
          animation: `fall-${it.id} ${it.duration}ms linear`,
        }}>
          {it.emoji}
          <style jsx>{`
            @keyframes fall-${it.id} {
              0% { transform: translateY(-40px) rotate(0deg); opacity: 0.9; }
              100% { transform: translateY(110vh) rotate(180deg); opacity: 0; }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
}
