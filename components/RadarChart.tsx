interface RadarChartProps {
  values: number[];
  labels: string[];
  size?: number;
}

export default function RadarChart({ values, labels, size = 440 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 36;
  const n = values.length;

  const angle = (i: number) => -Math.PI / 2 + (i / n) * 2 * Math.PI;
  const point = (i: number, v: number): [number, number] => [
    cx + Math.cos(angle(i)) * r * (v / 100),
    cy + Math.sin(angle(i)) * r * (v / 100),
  ];
  const labelPoint = (i: number): [number, number] => [
    cx + Math.cos(angle(i)) * (r + 28),
    cy + Math.sin(angle(i)) * (r + 28),
  ];

  const gridPcts = [25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
      {/* Grid polygons */}
      {gridPcts.map(pct => {
        const pts = Array.from({ length: n }, (_, i) => {
          const [x, y] = point(i, pct);
          return `${x},${y}`;
        }).join(' ');
        return (
          <polygon
            key={pct}
            points={pts}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
        );
      })}

      {/* Axis lines */}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = point(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={values.map((v, i) => {
          const [x, y] = point(i, v);
          return `${x},${y}`;
        }).join(' ')}
        fill="hsl(var(--fg) / 0.08)"
        stroke="hsl(var(--fg))"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Dots */}
      {values.map((v, i) => {
        const [x, y] = point(i, v);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={4}
            fill="white"
            stroke="hsl(var(--fg))"
            strokeWidth={2}
          />
        );
      })}

      {/* Labels */}
      {labels.map((l, i) => {
        const [x, y] = labelPoint(i);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fontWeight={700}
            fill="hsl(var(--fg))"
          >
            {l}
          </text>
        );
      })}

      {/* Values near dots */}
      {values.map((v, i) => {
        const [x, y] = labelPoint(i);
        return (
          <text
            key={i}
            x={x}
            y={y + 14}
            textAnchor="middle"
            fontSize={10}
            fill="hsl(var(--muted-fg))"
          >
            {v}
          </text>
        );
      })}
    </svg>
  );
}
