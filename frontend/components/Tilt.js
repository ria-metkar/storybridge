'use client';

import { useRef } from 'react';

/**
 * Tracks the mouse over the element and exposes --tilt-x / --tilt-y (degrees) and
 * --glare-x / --glare-y (%) as CSS variables. CSS decides what to rotate.
 * Touch and pen input are ignored so scrolling on phones stays smooth.
 */
export default function Tilt({ as: Tag = 'div', max = 12, className = '', children, ...rest }) {
  const ref = useRef(null);
  const frame = useRef(0);

  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = ref.current;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width - 0.5;
      const py = (clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--tilt-x', `${(-py * max).toFixed(2)}deg`);
      el.style.setProperty('--tilt-y', `${(px * max).toFixed(2)}deg`);
      el.style.setProperty('--glare-x', `${((px + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty('--glare-y', `${((py + 0.5) * 100).toFixed(1)}%`);
    });
  };

  const onPointerLeave = () => {
    cancelAnimationFrame(frame.current);
    const el = ref.current;
    el.style.setProperty('--tilt-x', '0deg');
    el.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <Tag ref={ref} className={`tilt ${className}`} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} {...rest}>
      {children}
    </Tag>
  );
}
