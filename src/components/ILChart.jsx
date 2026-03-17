import React, { useMemo } from 'react';

export default function ILChart({ t, c, currentPctChange, mobile }) {
  const W = 480, H = 220, ml = 48, mr = 12, mt = 12, mb = 36;
  const iw = W - ml - mr, ih = H - mt - mb;

  const data = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 200; i++) {
      const r = 0.1 + (i / 200) * 9.9;
      const pct = (r - 1) * 100;
      const il = (2 * Math.sqrt(r) / (1 + r) - 1) * 100;
      pts.push({ pct, il });
    }
    return pts;
  }, []);

  const xMin = -90, xMax = 900, yMin = -60, yMax = 2;
  const sx = (v) => ml + ((v - xMin) / (xMax - xMin)) * iw;
  const sy = (v) => mt + ih - ((v - yMin) / (yMax - yMin)) * ih;

  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${sx(d.pct).toFixed(1)},${sy(d.il).toFixed(1)}`).join(' ');

  const clampedPct = Math.max(xMin, Math.min(xMax, currentPctChange));
  const r = clampedPct / 100 + 1;
  const currentIL = r > 0 ? (2 * Math.sqrt(r) / (1 + r) - 1) * 100 : 0;
  const cx = sx(clampedPct), cy = sy(Math.max(yMin, currentIL));

  const xTicks = [-50, 0, 100, 300, 500, 700, 900];
  const yTicks = [0, -10, -20, -30, -40, -50, -60];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block' }}>
      <rect x={ml} y={mt} width={iw} height={ih} fill={c.surfaceAlt} rx={4} />
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={ml} x2={ml + iw} y1={sy(v)} y2={sy(v)} stroke={c.border} strokeWidth={0.5} />
          <text x={ml - 6} y={sy(v) + 4} textAnchor="end" fontSize={9} fill={c.textTertiary}>{v}%</text>
        </g>
      ))}
      {xTicks.map((v) => (
        <text key={v} x={sx(v)} y={mt + ih + 16} textAnchor="middle" fontSize={9} fill={c.textTertiary}>{v > 0 ? '+' : ''}{v}%</text>
      ))}
      <line x1={sx(0)} x2={sx(0)} y1={mt} y2={mt + ih} stroke={c.border} strokeDasharray="4,3" />
      <path d={pathD} fill="none" stroke={c.red} strokeWidth={2} />
      <circle cx={cx} cy={cy} r={5} fill={c.orange} stroke="#fff" strokeWidth={2} />
      <text x={cx + 8} y={cy - 8} fontSize={10} fontWeight={700} fill={c.orange}>{currentIL.toFixed(1)}%</text>
      <text x={ml + iw / 2} y={H - 2} textAnchor="middle" fontSize={10} fill={c.textTertiary}>{t.ilChartSub}</text>
    </svg>
  );
}
