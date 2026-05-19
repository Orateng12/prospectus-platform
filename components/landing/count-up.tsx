'use client';

import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

interface CountUpProps {
  from: number;
  to: number;
  duration?: number;
  delay?: number;
}

export default function CountUp({ from, to, duration = 1, delay = 0 }: CountUpProps) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    const controls = animate(from, to, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (value) => setCount(Math.round(value)),
    });
    return () => controls.stop();
  }, [from, to, duration, delay]);

  return <span>{count}</span>;
}
