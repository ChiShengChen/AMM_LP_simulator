import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, DollarSign, Bitcoin, AlertTriangle, Info, Clock, Zap } from 'lucide-react';
import { i18n } from './i18n';
import { clamp, calcV2, calcV3 } from './calc';
import PresetBar from './components/PresetBar';
import ILChart from './components/ILChart';
import YieldChart from './components/YieldChart';
import MonteCarloChart from './components/MonteCarloChart';

const rp = (k, d, lo, hi) => { const v = Number(new URLSearchParams(window.location.search).get(k)); return isNaN(v) ? d : clamp(v, lo, hi); };
const rs = (k, d) => new URLSearchParams(window.location.search).get(k) || d;

export default function App() {
  const [lang, setLang] = useState(() => rs('lang', 'zh') === 'en' ? 'en' : 'zh');
  const [inv, setInv] = useState(() => rp('inv', 10000, 1000, 100000));
  const [p0, setP0] = useState(() => rp('p0', 50000, 10000, 150000));
  const [p1, setP1] = useState(() => rp('p1', 50000, 10000, 150000));
  const [dur, setDur] = useState(() => rp('d', 365, 7, 730));
  const [fApr, setFApr] = useState(() => rp('fa', 15, 0, 50));
  const [fmApr, setFmApr] = useState(() => rp('fm', 30, 0, 200));
  const [ret, setRet] = useState(() => rp('ret', 70, 0, 100));
  const [gas, setGas] = useState(() => rp('gas', 0, 0, 5000));
  const [tknA, setTknA] = useState(() => rs('ta', 'USDC'));
  const [tknB, setTknB] = useState(() => rs('tb', 'BTC'));
  const [v3, setV3] = useState(() => rs('v3', '0') === '1');
  const [pl, setPl] = useState(() => rp('pl', 25000, 1000, 150000));
  const [pu, setPu] = useState(() => rp('pu', 100000, 1000, 300000));

  useEffect(() => {
    const q = new URLSearchParams();
    if (lang !== 'zh') q.set('lang', lang);
    if (inv !== 10000) q.set('inv', inv); if (p0 !== 50000) q.set('p0', p0);
    if (p1 !== 50000) q.set('p1', p1); if (dur !== 365) q.set('d', dur);
    if (fApr !== 15) q.set('fa', fApr); if (fmApr !== 30) q.set('fm', fmApr);
    if (ret !== 70) q.set('ret', ret); if (gas !== 0) q.set('gas', gas);
    if (tknA !== 'USDC') q.set('ta', tknA); if (tknB !== 'BTC') q.set('tb', tknB);
    if (v3) { q.set('v3', '1'); q.set('pl', pl); q.set('pu', pu); }
    const s = q.toString();
    window.history.replaceState(null, '', s ? `${window.location.pathname}?${s}` : window.location.pathname);
  }, [lang, inv, p0, p1, dur, fApr, fmApr, ret, gas, tknA, tknB, v3, pl, pu]);

  const [mob, setMob] = useState(() => window.matchMedia('(max-width:640px)').matches);
  useEffect(() => { const m = window.matchMedia('(max-width:640px)'); const h = (e) => setMob(e.matches); m.addEventListener('change', h); return () => m.removeEventListener('change', h); }, []);

  const t = i18n[lang];
  const T = (s) => s.replace(/BTC/g, tknB).replace(/USDC/g, tknA);

  const res = useMemo(() => {
    const params = { investment: inv, initialPrice: p0, finalPrice: p1, durationDays: dur, feeApr: fApr, farmApr: fmApr, rewardRetention: ret, gasCost: gas, priceLower: pl, priceUpper: pu };
    return v3 ? calcV3(params) : calcV2(params);
  }, [inv, p0, p1, dur, fApr, fmApr, ret, gas, v3, pl, pu]);

  const fmt = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
  const fmtB = (v) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(v) + ` ${tknB}`;
  const fmtP = (v) => new Intl.NumberFormat('en-US', { signDisplay: 'always', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + '%';
  const plu = (n, s, pp) => `${n} ${n === 1 ? s : pp}`;
  const fmtDur = (d) => {
    if (lang === 'zh') { if (d < 30) return `${d} \u5929`; const m = Math.round(d / 30); if (d < 365) return `${m} \u500b\u6708 (${d} \u5929)`; const y = Math.floor(d / 365); const rm = Math.round((d % 365) / 30); return rm > 0 ? `${y} \u5e74 ${rm} \u500b\u6708` : `${y} \u5e74`; }
    if (d < 30) return plu(d, 'day', 'days'); const m = Math.round(d / 30); if (d < 365) return `${plu(m, 'mo', 'mo')} (${d}d)`; const y = Math.floor(d / 365); const rm = Math.round((d % 365) / 30); return rm > 0 ? `${y}y ${rm}mo` : `${y}y`;
  };
  const pxPct = ((p1 - p0) / p0) * 100;

  const c = {
    bg: '#FAF9F7', surface: '#FFFFFF', surfaceAlt: '#F5F3EF',
    border: '#E8E4DE', text: '#1F1915', textSecondary: '#6B635B', textTertiary: '#9B9389',
    accent: '#D97706', accentBg: '#FEF3C7',
    blue: '#2563EB', blueBg: '#EFF6FF', blueBorder: '#BFDBFE',
    green: '#059669', greenBg: '#ECFDF5', greenBorder: '#A7F3D0',
    red: '#DC2626', redBg: '#FEF2F2', redBorder: '#FECACA',
    orange: '#EA580C', orangeBg: '#FFF7ED', orangeBorder: '#FED7AA',
    purple: '#7C3AED', purpleBg: '#F5F3FF', purpleBorder: '#C4B5FD',
  };
  const cd = { background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: mob ? 16 : 24 };
  const sld = (clr) => ({ flex: 1, height: 6, borderRadius: 3, appearance: 'none', WebkitAppearance: 'none', outline: 'none', background: c.surfaceAlt, cursor: 'pointer', accentColor: clr });
  const nIn = (w) => ({ width: w, minWidth: w, padding: '4px 6px', border: `1px solid ${c.border}`, borderRadius: 6, background: c.surface, color: c.text, fontSize: 12, fontWeight: 600, textAlign: 'right', outline: 'none', fontFamily: 'inherit' });
  const sec = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: c.textTertiary, marginBottom: 16 };

  const SR = (clr, val, set, mn, mx, st, w) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input type="range" min={mn} max={mx} step={st} value={val} onChange={(e) => set(Number(e.target.value))} style={sld(clr)} />
      <input type="number" value={val} min={mn} max={mx} step={st} onChange={(e) => set(Number(e.target.value))} onBlur={() => set((v) => clamp(v, mn, mx))} style={nIn(w)} />
    </div>
  );

  const applyPreset = (p) => { setInv(p.inv); setP0(p.p0); setP1(p.p1); setDur(p.d); setFApr(p.fa); setFmApr(p.fm); setRet(p.ret); setGas(p.gas); };

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", padding: mob ? '16px 8px' : '24px 16px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ ...cd, marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: mob ? 10 : 14, flexWrap: 'wrap' }}>
          <div style={{ padding: 10, background: c.accentBg, borderRadius: 12, lineHeight: 0, flexShrink: 0 }}><TrendingUp size={26} color={c.accent} /></div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: mob ? 20 : 24, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>{t.title}</h1>
            <p style={{ margin: '6px 0 0', fontSize: mob ? 13 : 14, color: c.textSecondary, lineHeight: 1.5 }}>{t.subtitle}</p>
          </div>
          <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} style={{ padding: '6px 16px', borderRadius: 99, border: `1px solid ${c.border}`, background: c.surfaceAlt, color: c.textSecondary, fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
            {lang === 'zh' ? 'EN' : '\u4e2d\u6587'}
          </button>
        </div>

        {/* Presets */}
        <div style={{ ...cd, marginBottom: 12 }}>
          <div style={sec}>{t.presets}</div>
          <PresetBar t={t} c={c} apply={applyPreset} />
        </div>

        {/* Token Names */}
        <div style={{ ...cd, marginBottom: 12 }}>
          <div style={sec}>{t.tokenNames}</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ color: c.textSecondary, fontWeight: 600 }}>{t.stableToken}</span>
              <input value={tknA} onChange={(e) => setTknA(e.target.value || 'USDC')} style={{ ...nIn(72), textAlign: 'center', fontWeight: 700, color: c.blue }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ color: c.textSecondary, fontWeight: 600 }}>{t.volatileToken}</span>
              <input value={tknB} onChange={(e) => setTknB(e.target.value || 'BTC')} style={{ ...nIn(72), textAlign: 'center', fontWeight: 700, color: c.orange }} />
            </div>
          </div>
        </div>

        {/* Basic Settings */}
        <div style={{ ...cd, marginBottom: 12 }}>
          <div style={sec}>{t.basicSettings}</div>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: mob ? 16 : 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: c.textSecondary }}>{t.investment}</span><span style={{ color: c.blue }}>{fmt(inv)}</span>
                </div>
                {SR(c.blue, inv, setInv, 1000, 100000, 1000, 72)}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: c.textSecondary, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} />{t.duration}</span>
                  <span style={{ color: c.purple }}>{fmtDur(dur)}</span>
                </div>
                {SR(c.purple, dur, setDur, 7, 730, 1, 52)}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: c.textSecondary }}>{t.gasCost}</span><span style={{ color: c.red }}>{fmt(gas)}</span>
                </div>
                {SR(c.red, gas, setGas, 0, 5000, 10, 56)}
                <div style={{ marginTop: 4, fontSize: 11, color: c.textTertiary }}>{t.gasDesc}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: c.textSecondary }}>{t.entryPrice} ({tknB})</span><span style={{ color: c.orange }}>{fmt(p0)}</span>
                </div>
                {SR(c.orange, p0, setP0, 10000, 150000, 1000, 72)}
              </div>
              <div style={{ background: c.orangeBg, border: `1px solid ${c.orangeBorder}`, borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: c.textSecondary }}>{t.exitPrice}</span><span style={{ color: c.orange, fontSize: 18, fontWeight: 800 }}>{fmt(p1)}</span>
                </div>
                {SR(c.orange, p1, setP1, 10000, 150000, 1000, 72)}
                <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600, color: pxPct >= 0 ? c.green : c.red }}>{fmtP(pxPct)} {t.priceChange}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Yield Sources */}
        <div style={{ ...cd, marginBottom: 12 }}>
          <div style={sec}>{t.yieldSources}</div>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr 1fr', gap: mob ? 16 : 24 }}>
            {[[t.feeApr, fApr, setFApr, 0, 50, 1, c.green, t.feeDesc], [t.farmApr, fmApr, setFmApr, 0, 200, 5, c.accent, t.farmDesc], [t.retention, ret, setRet, 0, 100, 5, res.farmLoss > 0 ? c.red : c.green, t.retentionDesc]].map(([label, val, set, mn, mx, st, clr, desc], i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: c.textSecondary }}>{label}</span><span style={{ color: clr, fontSize: 15, fontWeight: 700 }}>{val}%</span>
                </div>
                {SR(clr, val, set, mn, mx, st, 44)}
                <div style={{ marginTop: 4, fontSize: 11, color: c.textTertiary }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* V3 Mode */}
        <div style={{ ...cd, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: v3 ? 16 : 0 }}>
            <div style={{ ...sec, marginBottom: 0 }}>{t.lpMode}</div>
            <div style={{ display: 'flex', borderRadius: 99, border: `1px solid ${c.border}`, overflow: 'hidden' }}>
              {[false, true].map((isV3) => (
                <button key={String(isV3)} onClick={() => setV3(isV3)}
                  style={{ padding: '5px 14px', border: 'none', background: v3 === isV3 ? c.purple : c.surfaceAlt, color: v3 === isV3 ? '#fff' : c.textSecondary, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {isV3 ? t.v3Concentrated : t.v2Full}
                </button>
              ))}
            </div>
            {v3 && <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: res.inRange ? c.greenBg : c.redBg, color: res.inRange ? c.green : c.red }}>{res.inRange ? t.inRangeLabel : t.outOfRange}</span>}
            {v3 && <span style={{ fontSize: 12, fontWeight: 700, color: c.purple }}>{t.capitalEff}: {res.capitalEff.toFixed(1)}x</span>}
          </div>
          {v3 && (
            <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: c.textSecondary }}>{t.rangeLower}</span><span style={{ color: c.purple }}>{fmt(pl)}</span>
                </div>
                {SR(c.purple, pl, setPl, 1000, p0 - 1000, 1000, 72)}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: c.textSecondary }}>{t.rangeUpper}</span><span style={{ color: c.purple }}>{fmt(pu)}</span>
                </div>
                {SR(c.purple, pu, setPu, p0 + 1000, 300000, 1000, 72)}
              </div>
            </div>
          )}
        </div>

        {/* Scenario A & B */}
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div style={{ ...cd, background: res.usdcProfit >= 0 ? c.blueBg : c.redBg, border: `2px solid ${res.usdcProfit >= 0 ? c.blueBorder : c.redBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 10, background: c.surface, borderRadius: 12, lineHeight: 0 }}><DollarSign size={22} color={c.blue} /></div>
              <div><div style={{ fontSize: 17, fontWeight: 700 }}>{t.scATitle} {tknA}</div><div style={{ fontSize: 12, color: c.textSecondary }}>{t.scASub}</div></div>
            </div>
            {[[t.deposit, fmt(inv), false], [t.finalValue, fmt(res.totalFinal), true]].map(([l, v, b], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${c.border}` }}>
                <span style={{ fontSize: 13, color: c.textSecondary }}>{l}</span><span style={{ fontSize: b ? 16 : 14, fontWeight: b ? 700 : 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
              <span style={{ fontSize: 13, color: c.textSecondary }}>{t.pnl}</span>
              <span style={{ fontSize: mob ? 20 : 24, fontWeight: 800, color: res.usdcProfit >= 0 ? c.blue : c.red }}>{res.usdcProfit >= 0 ? '+' : ''}{fmt(res.usdcProfit)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: c.textSecondary }}>{t.roi}</span>
              <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 99, background: res.usdcRoi >= 0 ? '#DBEAFE' : '#FEE2E2', color: res.usdcRoi >= 0 ? c.blue : c.red }}>{fmtP(res.usdcRoi)}</span>
            </div>
            <div style={{ marginTop: 14, padding: 12, background: 'rgba(255,255,255,0.7)', borderRadius: 10, fontSize: 13, color: c.textSecondary, lineHeight: 1.6, border: `1px solid ${c.border}` }}>
              {'\ud83d\udca1 '}{t.tipHeld}{fmtDur(dur)}{t.tipFee}<b style={{ color: c.green }}>{fmt(res.feeYield)}</b>{t.tipFarm}<b style={{ color: c.accent }}>{fmt(res.farmYield)}</b>
              {res.ilUsd < 0 && <>{t.tipIl}<b style={{ color: c.red }}>{fmt(Math.abs(res.ilUsd))}</b></>}
              {gas > 0 && <>{', Gas: '}<b style={{ color: c.red }}>{fmt(gas)}</b></>}
              {t.tipLp}<b style={{ color: c.text }}>{fmt(res.lpValue)}</b>{'.'}
            </div>
          </div>

          <div style={{ ...cd, background: res.btcProfit >= 0 ? c.orangeBg : c.redBg, border: `2px solid ${res.btcProfit >= 0 ? c.orangeBorder : c.redBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: 10, background: c.surface, borderRadius: 12, lineHeight: 0 }}><Bitcoin size={22} color={c.orange} /></div>
              <div><div style={{ fontSize: 17, fontWeight: 700 }}>{t.scBTitle} {tknB}</div><div style={{ fontSize: 12, color: c.textSecondary }}>{t.scBSub}</div></div>
            </div>
            {[[t.depositEquiv, fmtB(res.initBtcInv), false], [t.finalBtc, fmtB(res.finalBtcTotal), true]].map(([l, v, b], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${c.border}` }}>
                <span style={{ fontSize: 13, color: c.textSecondary }}>{l}</span><span style={{ fontSize: b ? 16 : 14, fontWeight: b ? 700 : 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
              <span style={{ fontSize: 13, color: c.textSecondary }}>{t.pnlCoins}</span>
              <span style={{ fontSize: mob ? 20 : 24, fontWeight: 800, color: res.btcProfit >= 0 ? c.orange : c.red }}>{res.btcProfit >= 0 ? '+' : ''}{fmtB(res.btcProfit)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: c.textSecondary }}>{t.roi}</span>
              <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 99, background: res.btcRoi >= 0 ? '#FFEDD5' : '#FEE2E2', color: res.btcRoi >= 0 ? c.orange : c.red }}>{fmtP(res.btcRoi)}</span>
            </div>
            <div style={{ marginTop: 14, padding: 12, background: 'rgba(255,255,255,0.7)', borderRadius: 10, fontSize: 13, color: c.textSecondary, lineHeight: 1.6, border: `1px solid ${c.border}` }}>
              {p1 > p0 ? <>{'\u26a0\ufe0f '}{T(t.tipBUp)}<b style={{ color: c.red }}>{T(t.tipBUpBold)}</b>{'.'}</> : p1 < p0 ? <>{'\ud83c\udfaf '}{T(t.tipBDown)}<b style={{ color: c.green }}>{T(t.tipBDownBold)}</b>{'!'}</> : <>{'\ud83d\udd04 '}{T(t.tipBFlat)}</>}
            </div>
          </div>
        </div>

        {/* Yield Breakdown */}
        <div style={{ ...cd, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}><DollarSign size={18} color={c.textTertiary} />{t.yieldTitle}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: mob ? 10 : 16 }}>
            <div style={{ padding: mob ? 10 : 16, background: c.greenBg, borderRadius: 12, border: `1px solid ${c.greenBorder}` }}>
              <div style={{ fontSize: 12, color: c.green, fontWeight: 700, marginBottom: 4 }}>{t.feeYield}</div>
              <div style={{ fontSize: mob ? 16 : 18, fontWeight: 700, color: c.green }}>+{fmt(res.feeYield)}</div>
              <div style={{ fontSize: 11, color: c.textTertiary, marginTop: 3 }}>{t.compoundExtra}{fmt(res.compoundGain)}</div>
            </div>
            <div style={{ padding: mob ? 10 : 16, background: c.accentBg, borderRadius: 12, border: `1px solid ${c.orangeBorder}` }}>
              <div style={{ fontSize: 12, color: c.accent, fontWeight: 700, marginBottom: 4 }}>{t.farmYield}</div>
              <div style={{ fontSize: mob ? 16 : 18, fontWeight: 700, color: c.accent }}>+{fmt(res.farmYield)}</div>
              {res.farmLoss > 0 && <div style={{ fontSize: 11, color: c.red, marginTop: 3 }}>{t.tokenLoss}{fmt(res.farmLoss)}</div>}
            </div>
            <div style={{ padding: mob ? 10 : 16, background: c.redBg, borderRadius: 12, border: `1px solid ${c.redBorder}` }}>
              <div style={{ fontSize: 12, color: c.red, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} />{t.il}</div>
              <div style={{ fontSize: mob ? 16 : 18, fontWeight: 700, color: res.ilUsd === 0 ? c.textTertiary : c.red }}>{res.ilUsd === 0 ? '$0' : fmt(res.ilUsd)}</div>
              <div style={{ fontSize: 11, color: c.textTertiary, marginTop: 3 }}>{fmtP(res.ilPct)}{t.ilNote}</div>
            </div>
            <div style={{ padding: mob ? 10 : 16, background: res.apy >= 0 ? c.purpleBg : c.redBg, borderRadius: 12, border: `1px solid ${res.apy >= 0 ? c.purpleBorder : c.redBorder}` }}>
              <div style={{ fontSize: 12, color: res.apy >= 0 ? c.purple : c.red, fontWeight: 700, marginBottom: 4 }}>{t.netApy}</div>
              <div style={{ fontSize: mob ? 16 : 18, fontWeight: 700, color: res.apy >= 0 ? c.purple : c.red }}>{fmtP(res.apy)}</div>
              <div style={{ fontSize: 11, color: c.textTertiary, marginTop: 3 }}>{t.apyNote}</div>
            </div>
          </div>
        </div>

        {/* IL Chart */}
        <div style={{ ...cd, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={18} color={c.textTertiary} />{t.ilChart}</h3>
          <ILChart t={t} c={c} currentPctChange={pxPct} mobile={mob} />
        </div>

        {/* Yield Timeline */}
        <div style={{ ...cd, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={18} color={c.textTertiary} />{t.yieldChart}</h3>
          <YieldChart t={t} c={c} params={{ investment: inv, durationDays: dur, feeApr: fApr, farmApr: fmApr, rewardRetention: ret, initialPrice: p0, finalPrice: p1 }} mobile={mob} />
        </div>

        {/* Monte Carlo */}
        <div style={{ ...cd, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={18} color={c.textTertiary} />{t.mcTitle}</h3>
          <MonteCarloChart t={t} c={c} params={{ investment: inv, initialPrice: p0, durationDays: dur, feeApr: fApr, farmApr: fmApr, rewardRetention: ret, gasCost: gas }} mobile={mob} />
        </div>

        {/* AMM Mechanics */}
        <div style={{ ...cd }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}><Info size={18} color={c.textTertiary} />{t.ammTitle}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : '1fr 1fr 1fr', gap: mob ? 10 : 16 }}>
            <div style={{ padding: 16, background: c.surfaceAlt, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: c.textTertiary, marginBottom: 4 }}>{t.ammEntry}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{fmt(res.initialUsdc)} {tknA} + {fmtB(res.initialBtc)}</div>
            </div>
            <div style={{ padding: 16, background: c.surfaceAlt, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: c.textTertiary, marginBottom: 4 }}>{t.ammExit}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{fmt(res.finalUsdc)} {tknA} + {fmtB(res.finalBtc)}</div>
            </div>
            <div style={{ padding: 16, background: c.redBg, borderRadius: 12, border: `1px solid ${c.redBorder}` }}>
              <div style={{ fontSize: 12, color: c.red, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={14} />{t.ammIl}</div>
              <div style={{ fontSize: 13 }}>{t.ammIlText}<b>{fmt(Math.abs(res.ilUsd))}</b>{' ('}<span style={{ color: c.red }}>{fmtP(res.ilPct)}</span>{')'}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
