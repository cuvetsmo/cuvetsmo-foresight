/**
 * Sparkline — tiny inline price chart of YES probability history.
 *
 * Pure SVG, no deps. Auto-scales to data range; takes a stroke color
 * from the caller so it can match the surrounding outcome direction
 * (emerald for trending YES, slate for trending NO).
 */
export function Sparkline({
  data,
  width = 96,
  height = 28,
  stroke = "var(--color-emerald)",
  fill,
}: {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
}) {
  if (!data.length) {
    return (
      <svg width={width} height={height} aria-hidden role="presentation">
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="var(--color-border)"
          strokeDasharray="3 4"
        />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : 0;
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });
  const polyline = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath =
    `M0,${height} ` +
    points.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(" ") +
    ` L${width},${height} Z`;

  return (
    <svg width={width} height={height} aria-hidden role="presentation">
      {fill ? <path d={areaPath} fill={fill} /> : null}
      <polyline
        points={polyline}
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
