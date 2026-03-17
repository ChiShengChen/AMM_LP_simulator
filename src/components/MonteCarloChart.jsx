import React, { useState, useCallback } from 'react';
import { monteCarlo } from '../calc';

export default function MonteCarloChart({ t, c, params, mobile }) {
  const [vol, setVol] = useState(80);
  const [nSims, setNSims] = useState(500);
  const [result, setResult] = useState(null);

  const run = useCallback(() => {
    setResult(monteCarlo({ ...params, volatility: vol, numSims: nSims }));
  }, [params, vol, nSims]);

  const W = 480, H = 200, ml = 48, mr = 12, mt = 12, mb = 32;
  const iw = W - ml - mr, ih = H - mt - mb;

  const numIn = { width: 56, padding: '4px 6px', border: `1px solid ${c.border}`, borderRadius: 6, background: c.surface, color: c.text, fontSize: 12, fontWeight: 600, textAlign: 'right', outline: 'none', fontFamily: 'inherit' };

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <span style={{ color: c.textSecondary, fontWeight: 600 }}>{t.mcVolatility}</span>
          <input type="range" min={10} max={200} step={5} value={vol} onChange={(e) => setVol(Number(e.target.value))} style={{ width: 100, accentColor: c.purple }} />
          <input type="number" value={vol} min={10} max={200} step={5} onChange={(e) => setVol(Number(e.target.value))} style={numIn} />
          <span style={{ color: c.textTertiary, fontSize: 11 }}>%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <span style={{ color: c.textSecondary, fontWeight: 600 }}>{t.mcRuns}</span>
          <select value={nSims} onChange={(e) => setNSims(Number(e.target.value))}
            style={{ padding: '4px 8px', border: `1px solid ${c.border}`, borderRadius: 6, background: c.surface, fontSize: 12, fontWeight: 600, outline: 'none' }}>
            <option value={200}>200</option><option value={500}>500</option><option value={1000}>1000</option>
          </select>
        </div>
        <button onClick={run}
          style={{ padding: '6px 20px', borderRadius: 99, border: 'none', background: c.purple, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          {t.mcRun}
        </button>
      </div>

      {result && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[
              [t.mcP10, result.p10, c.red],
              [t.mcMedian, result.median, c.purple],
              [t.mcMean, result.mean, c.blue],
              [t.mcP90, result.p90, c.green],
            ].map(([label, val, color]) => (
              <div key={label} style={{ padding: 10, background: c.surfaceAlt, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: c.textTertiary, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color }}>{val >= 0 ? '+' : ''}{val.toFixed(1)}%</div>
              </div>
            ))}
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block' }}>
            <rect x={ml} y={mt} width={iw} height={ih} fill={c.surfaceAlt} rx={4} />
            {(() => {
              const maxCount = Math.max(...result.bins.map((b) => b.count)) || 1;
              const bw = iw / result.bins.length;
              return result.bins.map((bin, i) => {
                const bh = (bin.count / maxCount) * ih;
                const x = ml + i * bw;
                return (
                  <rect key={i} x={x + 1} y={mt + ih - bh} width={bw - 2} height={bh}
                    rx={2} fill={bin.x >= 0 ? c.green : c.red} opacity={0.7} />
                );
              });
            })()}
            {[result.p10, result.median, result.p90].map((v, i) => {
              const bins = result.bins;
              const lo = bins[0].x - result.binW / 2;
              const hi = bins[bins.length - 1].x + result.binW / 2;
              const px = ml + ((v - lo) / (hi - lo)) * iw;
              const colors = [c.red, c.purple, c.green];
              const labels = ['P10', 'P50', 'P90'];
              return (
                <g key={i}>
                  <line x1={px} x2={px} y1={mt} y2={mt + ih} stroke={colors[i]} strokeWidth={1.5} strokeDasharray="4,3" />
                  <text x={px} y={mt - 2} textAnchor="middle" fontSize={9} fontWeight={700} fill={colors[i]}>{labels[i]}</text>
                </g>
              );
            })}
            <text x={ml + iw / 2} y={H - 4} textAnchor="middle" fontSize={10} fill={c.textTertiary}>{t.mcDistribution} (%)</text>
          </svg>
          <div style={{ fontSize: 11, color: c.textTertiary, marginTop: 6 }}>{t.mcPathNote}</div>
        </>
      )}
    </div>
  );
}
