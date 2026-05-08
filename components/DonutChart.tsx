interface DonutChartProps {
  value: number;
  size?: number;
  stroke?: number;
}

export default function DonutChart({ value, size = 200, stroke = 14 }: DonutChartProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: 'rotate(-90deg)' }}
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="hsl(var(--muted))"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="hsl(var(--fg))"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0, 0, 0.2, 1)' }}
      />
    </svg>
  );
}
