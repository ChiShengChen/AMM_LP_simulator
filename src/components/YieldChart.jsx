import React, { useMemo } from 'react';
import { yieldTimelineData } from '../calc';

export default function YieldChart({ t, c, params, mobile }) {
  const data = useMemo(() => yieldTimelineData(params), [params.investment, params.durationDays, params.feeApr, params.farmApr, params.rewardRetention, params.initialPrice, params.finalPrice]);

  const W = 480, H = 220, ml = 56, mr = 12, mt = 12, mb = 36;
  const iw = W - ml - mr, ih = H - mt - mb;

  if (!data.length) return null;

  const allVals = data.flatMap((d) => [d.fee, d.farm, d.il, d.net]);
  const yMin = Math.min(0, ...allVals) * 1.1;
  const yMax = Math.max(0, ...allVals) * 1.1 || 1;
  const xMax = data[data.length - 1].day || 1;

  const sx = (v) => ml + (v / xMax) * iw;
  const sy = (v) => mt + ih - ((v - yMin) / (yMax - yMin)) * ih;

  const line = (key) => data.map((d, i) => `${i === 0 ? 'M' : 'L'}${sx(d.day).toFixed(1)},${sy(d[key]).toFixed(1)}`).join(' ');

  const lines = [
    { key: 'fee', color: c.green, label: t.fee },
    { key: 'farm', color: c.accent, label: t.farm },
    { key: 'il', color: c.red, label: 'IL' },
    { key: 'net', color: c.purple, label: t.net },
  ];

  const yTicks = [];
  const step = (yMax - yMin) / 5;
  for (let i = 0; i <= 5; i++) { const v = yMin + step * i; yTicks.push(Math.round(v)); }

  const formatK = (v) => Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block' }}>
      <rect x={ml} y={mt} width={iw} height={ih} fill={c.surfaceAlt} rx={4} />
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={ml} x2={ml + iw} y1={sy(v)} y2={sy(v)} stroke={v === 0 ? c.text : c.border} strokeWidth={v === 0 ? 1 : 0.5} />
          <text x={ml - 6} y={sy(v) + 4} textAnchor="end" fontSize={9} fill={c.textTertiary}>${formatK(v)}</text>
        </g>
      ))}
      {lines.map((l) => (
        <path key={l.key} d={line(l.key)} fill="none" stroke={l.color} strokeWidth={1.5} />
      ))}
      <g transform={`translate(${ml + 8}, ${mt + 8})`}>
        {lines.map((l, i) => (
          <g key={l.key} transform={`translate(${i * 64}, 0)`}>
            <rect width={10} height={10} rx={2} fill={l.color} />
            <text x={14} y={9} fontSize={9} fontWeight={600} fill={c.textSecondary}>{l.label}</text>
          </g>
        ))}
      </g>
      <text x={ml + iw / 2} y={H - 2} textAnchor="middle" fontSize={10} fill={c.textTertiary}>{t.yieldChartSub}</text>
    </svg>
  );
}
