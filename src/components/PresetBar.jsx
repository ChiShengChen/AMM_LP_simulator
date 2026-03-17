import React from 'react';

const presets = [
  { key: 'presetConservative', inv: 10000, d: 365, p0: 50000, p1: 50000, fa: 8, fm: 0, ret: 100, gas: 5 },
  { key: 'presetBalanced', inv: 10000, d: 365, p0: 50000, p1: 60000, fa: 15, fm: 30, ret: 70, gas: 20 },
  { key: 'presetAggressive', inv: 10000, d: 180, p0: 50000, p1: 55000, fa: 25, fm: 150, ret: 40, gas: 50 },
  { key: 'presetCrash', inv: 10000, d: 365, p0: 50000, p1: 25000, fa: 15, fm: 30, ret: 50, gas: 20 },
  { key: 'presetMoon', inv: 10000, d: 365, p0: 50000, p1: 150000, fa: 15, fm: 30, ret: 70, gas: 20 },
];

export default function PresetBar({ t, c, apply }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {presets.map((p) => (
        <button key={p.key} onClick={() => apply(p)}
          style={{ padding: '6px 14px', borderRadius: 99, border: `1px solid ${c.border}`, background: c.surfaceAlt, color: c.textSecondary, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {t[p.key]}
        </button>
      ))}
    </div>
  );
}
