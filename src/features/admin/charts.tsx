/** Small inline-SVG charts for the admin console. No chart library needed. */

const C = {
  terracotta: "var(--color-terracotta)",
  turmeric: "var(--color-turmeric)",
  heritage: "var(--color-heritage)",
  alert: "var(--color-alert)",
  parchment: "var(--color-parchment)",
};

export function Sparkline({ values, color = C.turmeric, width = 88, height = 28 }: { values: number[]; color?: string; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (width - 4) + 2, height - 3 - ((v - min) / span) * (height - 6)]);
  const d = pts.map((p) => p.join(",")).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="overflow-visible shrink-0">
      <polyline points={d} fill="none" stroke={color} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={2.25} fill={color} />
    </svg>
  );
}

/**
 * Line chart of average HVS (0-100) with the band thresholds shaded.
 * Drawn left-to-right (time axis) even in RTL layouts.
 */
export function TrendChart({
  values,
  xLabels,
  valueLabel,
  bandLabels,
  ariaLabel,
}: {
  values: number[];
  xLabels: string[];
  valueLabel: (v: number) => string;
  bandLabels: { stable: string; vulnerable: string; critical: string };
  ariaLabel: string;
}) {
  const W = 640;
  const H = 240;
  const pad = { l: 34, r: 12, t: 12, b: 28 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const lo = Math.max(0, Math.floor((Math.min(...values) - 8) / 10) * 10);
  const hi = Math.min(100, Math.ceil((Math.max(...values) + 8) / 10) * 10);
  const y = (v: number) => pad.t + ih - ((v - lo) / (hi - lo || 1)) * ih;
  const x = (i: number) => pad.l + (i / Math.max(1, values.length - 1)) * iw;
  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(values.length - 1)},${pad.t + ih} L${x(0)},${pad.t + ih} Z`;
  const ticks = [lo, Math.round((lo + hi) / 2), hi];
  const band = (from: number, to: number, fill: string, label: string) => {
    const a = Math.max(lo, from);
    const b = Math.min(hi, to);
    if (b <= a) return null;
    return (
      <g key={label}>
        <rect x={pad.l} y={y(b)} width={iw} height={y(a) - y(b)} fill={fill} opacity={0.09} />
        <text x={W - pad.r - 4} y={y(b) + 12} textAnchor="end" fontSize={10} fill={fill} opacity={0.9}>
          {label}
        </text>
      </g>
    );
  };
  const labelIdx = [0, Math.floor((values.length - 1) / 2), values.length - 1];

  return (
    <div dir="ltr" className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="w-full h-auto">
        {band(0, 33, C.heritage, bandLabels.stable)}
        {band(33, 67, C.turmeric, bandLabels.vulnerable)}
        {band(67, 100, C.alert, bandLabels.critical)}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke={C.parchment} strokeOpacity={0.1} />
            <text x={pad.l - 6} y={y(t) + 3} textAnchor="end" fontSize={10} fill={C.parchment} opacity={0.5}>
              {valueLabel(t)}
            </text>
          </g>
        ))}
        <path d={area} fill={C.terracotta} opacity={0.14} />
        <path d={line} fill="none" stroke={C.terracotta} strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" />
        {values.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={i === values.length - 1 ? 4 : 2.5} fill={i === values.length - 1 ? C.turmeric : C.terracotta}>
            <title>{`${xLabels[i]}: ${valueLabel(Math.round(v))}`}</title>
          </circle>
        ))}
        {labelIdx.map((i, k) => (
          <text key={k} x={x(i)} y={H - 8} textAnchor={k === 0 ? "start" : k === 2 ? "end" : "middle"} fontSize={10} fill={C.parchment} opacity={0.55}>
            {xLabels[i]}
          </text>
        ))}
      </svg>
    </div>
  );
}

/** Horizontal stacked bar for the HVS band distribution. */
export function StackedBar({ parts }: { parts: { label: string; value: number; color: string; display: string }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div>
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-black/30" role="img" aria-label={parts.map((p) => `${p.label}: ${p.display}`).join(", ")}>
        {parts.map((p) => (
          <div key={p.label} data-keep style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />
        ))}
      </div>
      <ul className="mt-4 space-y-2">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-parchment/75">
              <span data-keep className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} aria-hidden="true" />
              {p.label}
            </span>
            <span className="tabular-nums text-parchment">{p.display}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const CHART_COLORS = C;
