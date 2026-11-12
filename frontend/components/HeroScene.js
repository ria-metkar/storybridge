'use client';

import { useEffect, useRef, useState } from 'react';
import { isRtl, langNative } from '@/lib/languages';

const SPREADS = [
  {
    emoji: '🌙',
    a: { lang: 'en', text: 'Every night, the moon visits the old mango tree.' },
    b: { lang: 'es', text: 'Cada noche, la luna visita el viejo árbol de mango.' },
  },
  {
    emoji: '🪁',
    a: { lang: 'en', text: 'Grandma made a kite of red and gold.' },
    b: { lang: 'hi', text: 'दादी ने लाल और सुनहरी पतंग बनाई।' },
  },
  {
    emoji: '🐉',
    a: { lang: 'en', text: 'A small dragon lived on a cloud.' },
    b: { lang: 'zh', text: '一条小龙住在云朵上。' },
  },
  {
    emoji: '🦊',
    a: { lang: 'en', text: 'Little Fox finds one red apple.' },
    b: { lang: 'fr', text: 'Petit Renard trouve une pomme rouge.' },
  },
];

// Floating letters from the scripts we publish in, at different depths (z) for parallax.
const GLYPHS = [
  { t: 'A', x: 6, y: 14, z: 140, s: 2.6, d: 7 },
  { t: 'अ', x: 84, y: 8, z: 90, s: 2.8, d: 9 },
  { t: '字', x: 90, y: 66, z: 160, s: 2.2, d: 8 },
  { t: 'É', x: 2, y: 70, z: 60, s: 2, d: 10 },
  { t: 'ب', x: 74, y: 88, z: 40, s: 1.8, d: 11 },
  { t: 'ñ', x: 20, y: 92, z: 110, s: 1.6, d: 6.5 },
  { t: '♪', x: 48, y: 2, z: 70, s: 1.5, d: 8.5 },
  { t: '✦', x: 64, y: 22, z: 180, s: 1.1, d: 5.5 },
  { t: '✦', x: 30, y: 6, z: 30, s: 0.9, d: 7.5 },
];

export default function HeroScene() {
  const ref = useRef(null);
  const [index, setIndex] = useState(0);
  const spread = SPREADS[index];

  // Mouse parallax: expose --mx / --my in the range -1..1.
  useEffect(() => {
    const el = ref.current;
    let frame = 0;
    const onMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty('--mx', ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        el.style.setProperty('--my', ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div className="scene" ref={ref} aria-hidden="true">
      {GLYPHS.map((g, i) => (
        <span
          key={i}
          className="glyph"
          style={{ '--x': `${g.x}%`, '--y': `${g.y}%`, '--z': g.z, '--s': g.s, '--dur': `${g.d}s` }}
        >
          <span>{g.t}</span>
        </span>
      ))}

      <div className="scene-float">
        <div className="open-book">
          <div className="ob-cover" />
          <div className="ob-page ob-left" key={`l${index}`}>
            <span className="ob-emoji">{spread.emoji}</span>
            <p lang={spread.a.lang}>{spread.a.text}</p>
            <span className="ob-lang">{langNative(spread.a.lang)}</span>
          </div>
          <div className="ob-page ob-right" key={`r${index}`}>
            <p lang={spread.b.lang} dir={isRtl(spread.b.lang) ? 'rtl' : undefined}>
              <span className="ob-hl">{spread.b.text}</span>
            </p>
            <span className="ob-lang">{langNative(spread.b.lang)}</span>
            <span className="ob-wave">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>
          <div className="ob-leaf" onAnimationIteration={() => setIndex((n) => (n + 1) % SPREADS.length)}>
            <div className="ob-leaf-face ob-leaf-front" />
            <div className="ob-leaf-face ob-leaf-back" />
          </div>
        </div>
        <div className="ob-shadow" />
      </div>
    </div>
  );
}
