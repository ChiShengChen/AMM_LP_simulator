import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, DollarSign, Bitcoin, AlertTriangle, Info, Clock } from 'lucide-react';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const readParam = (key, def, lo, hi) => {
  const v = Number(new URLSearchParams(window.location.search).get(key));
  return isNaN(v) ? def : clamp(v, lo, hi);
};

const i18n = {
  en: {
    title: 'Dual-Asset LP Strategy Simulator',
    subtitle: 'Simulate the impact of compounding fees, farming reward depreciation, and holding period on LP outcomes. Adjust parameters below to compare fiat vs coin standard.',
    basicSettings: 'BASIC SETTINGS',
    yieldSources: 'YIELD SOURCES',
    investment: 'Initial Investment (USD equivalent)',
    duration: 'Holding Period',
    entryPrice: 'BTC Entry Price',
    exitPrice: 'BTC Exit Price (simulate change)',
    priceChange: 'price change',
    feeApr: 'Trading Fee APR',
    farmApr: 'Farming Reward APR',
    retention: 'Reward Token Retention',
    feeDesc: 'Daily compounding, auto-reinvested',
    farmDesc: 'Linear accrual, claimed separately',
    retentionDesc: 'Value retained when selling rewards',
    scATitle: 'Scenario A: Deposit USDC',
    scASub: 'Fiat-standard \u2014 focused on USD growth',
    scBTitle: 'Scenario B: Deposit BTC',
    scBSub: 'Coin-standard \u2014 wants more BTC',
    deposit: 'Initial Deposit',
    finalValue: 'Final Value (incl. yield)',
    pnl: 'Profit / Loss',
    roi: 'Total ROI',
    depositEquiv: 'Initial Deposit (equiv.)',
    finalBtc: 'Exit Value (yield \u2192 buy BTC)',
    pnlCoins: 'Profit / Loss (coins)',
    tipHeld: 'Held for ',
    tipFee: ', fee compounding earned ',
    tipFarm: ', farming net earned ',
    tipIl: '. IL loss ',
    tipLp: '. LP principal worth ',
    tipBUp: 'When BTC rises, LP auto-sells your BTC for USDC. To exit back to BTC, you buy at a higher price \u2014 resulting in ',
    tipBUpBold: 'fewer coins',
    tipBDown: 'When BTC falls, LP auto-buys BTC for you. Total value drops, but you get back ',
    tipBDownBold: 'more BTC than you started with',
    tipBFlat: 'BTC price unchanged \u2014 zero impermanent loss. Pure fee + farming income.',
    yieldTitle: 'Yield vs Loss Breakdown',
    feeYield: 'Trading Fee Yield',
    farmYield: 'Farming Reward (net)',
    il: 'Impermanent Loss (IL)',
    netApy: 'Net Annualized (APY)',
    compoundExtra: 'Compound bonus ',
    tokenLoss: 'Token depreciation loss ',
    ilNote: ' vs HODL 50/50',
    apyNote: 'Incl. IL, annualized',
    ammTitle: 'AMM Mechanics (what happened?)',
    ammEntry: 'Pool assets at entry',
    ammExit: 'Pool assets at exit (after rebalancing)',
    ammIl: 'Impermanent Loss (IL) Impact',
    ammIlText: 'vs simply holding 50/50, LP value is less by ',
  },
  zh: {
    title: '\u96d9\u5e63\u7b56\u7565 (LP) \u4e92\u52d5\u6a21\u64ec\u5668',
    subtitle: '\u6a21\u64ec\u624b\u7e8c\u8cbb\u8907\u5229\u3001\u631c\u7926\u734e\u52f5\u8cb6\u503c\u8207\u6301\u5009\u671f\u9593\u5c0d LP \u7d50\u679c\u7684\u5f71\u97ff\u3002\u8abf\u6574\u4e0b\u65b9\u53c3\u6578\uff0c\u770b\u300cU\u672c\u4f4d\u300d\u8207\u300c\u5e63\u672c\u4f4d\u300d\u7684\u6b98\u9177\u5c0d\u6c7a\u3002',
    basicSettings: '\u57fa\u672c\u8a2d\u5b9a',
    yieldSources: '\u6536\u76ca\u4f86\u6e90',
    investment: '\u521d\u59cb\u6295\u5165\u91d1\u984d (\u7b49\u503c USD)',
    duration: '\u6301\u6709\u5929\u6578',
    entryPrice: '\u5165\u5834\u6642 BTC \u50f9\u683c',
    exitPrice: '\u51fa\u5834\u6642 BTC \u50f9\u683c (\u6a21\u64ec\u6f32\u8dcc)',
    priceChange: '\u50f9\u683c\u8b8a\u5316',
    feeApr: '\u4ea4\u6613\u624b\u7e8c\u8cbb APR',
    farmApr: '\u631c\u7926\u734e\u52f5 APR',
    retention: '\u734e\u52f5\u4ee3\u5e63\u7559\u5b58\u7387',
    feeDesc: '\u6bcf\u65e5\u8907\u5229\uff0c\u81ea\u52d5\u6ef4\u56de\u6c60\u5b50',
    farmDesc: '\u7dda\u6027\u7d2f\u8a08\uff0c\u53e6\u5916\u9818\u53d6',
    retentionDesc: '\u51fa\u5834\u6642\u734e\u52f5\u4ee3\u5e63\u5269\u4f59\u50f9\u503c\u6bd4\u4f8b',
    scATitle: '\u60c5\u5883 A\uff1a\u5b58\u5165 USDC',
    scASub: '\u300cU\u672c\u4f4d\u300d\u7528\u6236\uff0c\u770b\u91cd\u7f8e\u91d1\u589e\u503c',
    scBTitle: '\u60c5\u5883 B\uff1a\u5b58\u5165 BTC',
    scBSub: '\u300c\u5e63\u672c\u4f4d\u300d\u4fe1\u4ef0\u8005\uff0c\u60f3\u8b8a\u51fa\u66f4\u591a\u5e63',
    deposit: '\u521d\u59cb\u5b58\u5165',
    finalValue: '\u9000\u5834\u62ff\u56de\u7e3d\u503c (\u542b\u5229\u606f)',
    pnl: '\u6de8\u640d\u76ca (Profit/Loss)',
    roi: '\u7e3d\u56de\u5831\u7387 (ROI)',
    depositEquiv: '\u521d\u59cb\u5b58\u5165 (\u7b49\u503c)',
    finalBtc: '\u9000\u5834\u63db\u56de (\u542b\u5229\u606f\u5168\u8cb7 BTC)',
    pnlCoins: '\u6de8\u640d\u76ca (\u9846\u6578)',
    tipHeld: '\u6301\u6709 ',
    tipFee: '\uff0c\u624b\u7e8c\u8cbb\u8907\u5229\u8cfa ',
    tipFarm: '\u3001\u631c\u7926\u734e\u52f5\u6de8\u8cfa ',
    tipIl: '\u3002IL \u640d\u5931 ',
    tipLp: '\u3002LP \u672c\u91d1\u50f9\u503c ',
    tipBUp: 'BTC \u4e0a\u6f32\u6642\uff0cLP \u81ea\u52d5\u5e6b\u4f60\u8ce3\u6389 BTC \u63db\u6210 USDC\u3002\u51fa\u5834\u6642\u70ba\u4e86\u63db\u56de BTC\uff0c\u4f60\u53ea\u80fd\u7528\u9ad8\u50f9\u8cb7\u56de\uff0c\u5c0e\u81f4',
    tipBUpBold: '\u9846\u6578\u6e1b\u5c11',
    tipBDown: 'BTC \u4e0b\u8dcc\u6642\uff0cLP \u81ea\u52d5\u5e6b\u4f60\u6284\u5e95\u8cb7\u5165 BTC\u3002\u96d6\u7136\u7e3d\u5e02\u503c\u7e2e\u6c34\uff0c\u4f46\u4f60\u80fd\u62ff\u56de',
    tipBDownBold: '\u6bd4\u7576\u521d\u66f4\u591a\u7684\u6bd4\u7279\u5e63',
    tipBFlat: 'BTC \u50f9\u683c\u6301\u5e73\uff0c\u7121\u7121\u5e38\u640d\u5931\u3002\u7d14\u8cfa\u624b\u7e8c\u8cbb\u8207\u631c\u7926\u6536\u76ca\u3002',
    yieldTitle: '\u6536\u76ca vs \u640d\u5931\u62c6\u89e3',
    feeYield: '\u4ea4\u6613\u624b\u7e8c\u8cbb\u6536\u76ca',
    farmYield: '\u631c\u7926\u734e\u52f5\u6de8\u503c',
    il: '\u7121\u5e38\u640d\u5931 (IL)',
    netApy: '\u6de8\u5e74\u5316\u5831\u916c (APY)',
    compoundExtra: '\u8907\u5229\u591a\u8cfa ',
    tokenLoss: '\u4ee3\u5e63\u8cb6\u503c\u640d\u5931 ',
    ilNote: ' vs HODL 50/50',
    apyNote: '\u5df2\u542b IL\uff0c\u5e74\u5316\u63db\u7b97',
    ammTitle: '\u5e95\u5c64 AMM \u8b8a\u5316\u89e3\u6790 (\u767c\u751f\u4e86\u4ec0\u9ebc\u4e8b\uff1f)',
    ammEntry: '\u525b\u5165\u5834\u6642\u6c60\u5167\u8cc7\u7522',
    ammExit: '\u9000\u5834\u6642\u6c60\u5167\u8cc7\u7522 (\u81ea\u52d5\u505a\u5e02\u7d50\u679c)',
    ammIl: '\u7d14\u7121\u5e38\u640d\u5931 (IL) \u5f71\u97ff',
    ammIlText: '\u5c0d\u6bd4\u55ae\u7d14 Hold 50/50\uff0cLP \u50f9\u503c\u5c11\u4e86 ',
  },
};

export default function App() {
  const [lang, setLang] = useState(() => {
    const v = new URLSearchParams(window.location.search).get('lang');
    return v === 'en' ? 'en' : 'zh';
  });
  const [investment, setInvestment] = useState(() => readParam('inv', 10000, 1000, 100000));
  const [initialPrice, setInitialPrice] = useState(() => readParam('p0', 50000, 10000, 150000));
  const [finalPrice, setFinalPrice] = useState(() => readParam('p1', 50000, 10000, 150000));
  const [durationDays, setDurationDays] = useState(() => readParam('d', 365, 7, 730));
  const [feeApr, setFeeApr] = useState(() => readParam('fa', 15, 0, 50));
  const [farmApr, setFarmApr] = useState(() => readParam('fm', 30, 0, 200));
  const [rewardRetention, setRewardRetention] = useState(() => readParam('ret', 70, 0, 100));

  useEffect(() => {
    const p = new URLSearchParams();
    if (lang !== 'zh') p.set('lang', lang);
    if (investment !== 10000) p.set('inv', investment);
    if (initialPrice !== 50000) p.set('p0', initialPrice);
    if (finalPrice !== 50000) p.set('p1', finalPrice);
    if (durationDays !== 365) p.set('d', durationDays);
    if (feeApr !== 15) p.set('fa', feeApr);
    if (farmApr !== 30) p.set('fm', farmApr);
    if (rewardRetention !== 70) p.set('ret', rewardRetention);
    const qs = p.toString();
    window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [lang, investment, initialPrice, finalPrice, durationDays, feeApr, farmApr, rewardRetention]);

  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 640px)').matches);
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 640px)');
    const h = (e) => setMobile(e.matches);
    mql.addEventListener('change', h);
    return () => mql.removeEventListener('change', h);
  }, []);

  const t = i18n[lang];

  const results = useMemo(() => {
    const p0 = initialPrice;
    const p1 = finalPrice;
    const days = durationDays;

    // 1. Initial LP (50/50 split):  x·y = k
    const initialUsdc = investment / 2;
    const initialBtcAmount = initialUsdc / p0;
    const k = initialUsdc * initialBtcAmount;

    // 2. Final LP via constant product
    const finalUsdcInLp = Math.sqrt(k * p1);
    const finalBtcInLp = Math.sqrt(k / p1);
    const finalLpValueUsd = finalUsdcInLp + finalBtcInLp * p1;

    // 3. Fee yield — daily compounding (v2: fees reinvested into reserves)
    const feeYieldUsd = investment * (Math.pow(1 + feeApr / 100 / 365, days) - 1);
    const simpleFeeYield = investment * (feeApr / 100) * (days / 365);
    const compoundingGain = feeYieldUsd - simpleFeeYield;

    // 4. Farm yield — linear, reward token may depreciate
    const rawFarmYieldUsd = investment * (farmApr / 100) * (days / 365);
    const farmYieldUsd = rawFarmYieldUsd * (rewardRetention / 100);
    const farmDepreciationLoss = rawFarmYieldUsd - farmYieldUsd;

    const totalYieldUsd = feeYieldUsd + farmYieldUsd;
    const totalFinalUsd = finalLpValueUsd + totalYieldUsd;

    // 5. IL vs 50/50 HODL
    const holdValueUsd = initialUsdc + initialBtcAmount * p1;
    const ilUsd = finalLpValueUsd - holdValueUsd;
    const ilPercentage = holdValueUsd !== 0 ? (ilUsd / holdValueUsd) * 100 : 0;

    // 6. Scenario A: USDC depositor
    const usdcProfit = totalFinalUsd - investment;
    const usdcRoi = (usdcProfit / investment) * 100;

    // 7. Scenario B: BTC depositor
    const initialBtcInvestment = investment / p0;
    const totalFinalBtc = p1 !== 0 ? totalFinalUsd / p1 : 0;
    const btcProfit = totalFinalBtc - initialBtcInvestment;
    const btcRoi = initialBtcInvestment !== 0 ? (btcProfit / initialBtcInvestment) * 100 : 0;

    // 8. Net APY (annualized, includes IL)
    const totalReturn = totalFinalUsd / investment;
    const effectiveApy =
      days > 0 && totalReturn > 0
        ? (Math.pow(totalReturn, 365 / days) - 1) * 100
        : -100;

    return {
      initialUsdc, initialBtcAmount, finalUsdcInLp, finalBtcInLp, finalLpValueUsd,
      feeYieldUsd, simpleFeeYield, compoundingGain,
      farmYieldUsd, rawFarmYieldUsd, farmDepreciationLoss,
      totalYieldUsd, totalFinalUsd,
      ilUsd, ilPercentage, holdValueUsd,
      usdcProfit, usdcRoi,
      initialBtcInvestment, totalFinalBtc, btcProfit, btcRoi,
      effectiveApy,
    };
  }, [investment, initialPrice, finalPrice, feeApr, farmApr, durationDays, rewardRetention]);

  const formatUsd = (v) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

  const formatBtc = (v) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(v) + ' \u20bf';

  const formatPct = (v) =>
    new Intl.NumberFormat('en-US', { signDisplay: 'always', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v) + '%';

  const pl = (n, s, pp) => `${n} ${n === 1 ? s : pp}`;

  const formatDuration = (days) => {
    if (lang === 'zh') {
      if (days < 30) return `${days} \u5929`;
      const m = Math.round(days / 30);
      if (days < 365) return `${m} \u500b\u6708 (${days} \u5929)`;
      const y = Math.floor(days / 365);
      const rm = Math.round((days % 365) / 30);
      return rm > 0 ? `${y} \u5e74 ${rm} \u500b\u6708 (${days} \u5929)` : `${y} \u5e74 (${days} \u5929)`;
    }
    if (days < 30) return pl(days, 'day', 'days');
    const m = Math.round(days / 30);
    if (days < 365) return `${pl(m, 'month', 'months')} (${pl(days, 'day', 'days')})`;
    const y = Math.floor(days / 365);
    const rm = Math.round((days % 365) / 30);
    return rm > 0
      ? `${pl(y, 'year', 'years')} ${pl(rm, 'month', 'months')} (${pl(days, 'day', 'days')})`
      : `${pl(y, 'year', 'years')} (${pl(days, 'day', 'days')})`;
  };

  const priceChangePct = ((finalPrice - initialPrice) / initialPrice) * 100;

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

  const card = { background: c.surface, borderRadius: 16, border: `1px solid ${c.border}`, padding: mobile ? 16 : 24 };
  const sld = (color) => ({ flex: 1, height: 6, borderRadius: 3, appearance: 'none', WebkitAppearance: 'none', outline: 'none', background: c.surfaceAlt, cursor: 'pointer', accentColor: color });
  const secLabel = { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: c.textTertiary, marginBottom: 16 };

  const numIn = (w) => ({
    width: w, minWidth: w, padding: '4px 6px', border: `1px solid ${c.border}`, borderRadius: 6,
    background: c.surface, color: c.text, fontSize: 12, fontWeight: 600, textAlign: 'right',
    outline: 'none', fontFamily: 'inherit', MozAppearance: 'textfield',
  });

  const sliderRow = (color, value, setter, min, max, step, w) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => setter(Number(e.target.value))} style={sld(color)} />
      <input type="number" value={value} min={min} max={max} step={step}
        onChange={(e) => setter(Number(e.target.value))}
        onBlur={() => setter((v) => clamp(v, min, max))}
        style={numIn(w)} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", padding: mobile ? '16px 8px' : '24px 16px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ ...card, marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: mobile ? 10 : 14, flexWrap: 'wrap' }}>
          <div style={{ padding: 10, background: c.accentBg, borderRadius: 12, lineHeight: 0, flexShrink: 0 }}>
            <TrendingUp size={26} color={c.accent} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: mobile ? 20 : 24, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>{t.title}</h1>
            <p style={{ margin: '6px 0 0', fontSize: mobile ? 13 : 14, color: c.textSecondary, lineHeight: 1.5 }}>{t.subtitle}</p>
          </div>
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            style={{ padding: '6px 16px', borderRadius: 99, border: `1px solid ${c.border}`, background: c.surfaceAlt, color: c.textSecondary, fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
          >
            {lang === 'zh' ? 'EN' : '\u4e2d\u6587'}
          </button>
        </div>

        {/* Basic Settings */}
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={secLabel}>{t.basicSettings}</div>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: mobile ? 20 : 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: c.textSecondary }}>{t.investment}</span>
                  <span style={{ color: c.blue }}>{formatUsd(investment)}</span>
                </div>
                {sliderRow(c.blue, investment, setInvestment, 1000, 100000, 1000, 72)}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: c.textSecondary, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} />{t.duration}</span>
                  <span style={{ color: c.purple }}>{formatDuration(durationDays)}</span>
                </div>
                {sliderRow(c.purple, durationDays, setDurationDays, 7, 730, 1, 52)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: c.textSecondary }}>{t.entryPrice}</span>
                  <span style={{ color: c.orange }}>{formatUsd(initialPrice)}</span>
                </div>
                {sliderRow(c.orange, initialPrice, setInitialPrice, 10000, 150000, 1000, 72)}
              </div>
              <div style={{ background: c.orangeBg, border: `1px solid ${c.orangeBorder}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: c.textSecondary }}>{t.exitPrice}</span>
                  <span style={{ color: c.orange, fontSize: 18, fontWeight: 800 }}>{formatUsd(finalPrice)}</span>
                </div>
                {sliderRow(c.orange, finalPrice, setFinalPrice, 10000, 150000, 1000, 72)}
                <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: priceChangePct >= 0 ? c.green : c.red }}>
                  {formatPct(priceChangePct)} {t.priceChange}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Yield Sources */}
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={secLabel}>{t.yieldSources}</div>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr 1fr', gap: mobile ? 20 : 24 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, fontWeight: 600 }}>
                <span style={{ color: c.textSecondary }}>{t.feeApr}</span>
                <span style={{ color: c.green, fontSize: 15, fontWeight: 700 }}>{feeApr}%</span>
              </div>
              {sliderRow(c.green, feeApr, setFeeApr, 0, 50, 1, 44)}
              <div style={{ marginTop: 6, fontSize: 11, color: c.textTertiary }}>{t.feeDesc}</div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, fontWeight: 600 }}>
                <span style={{ color: c.textSecondary }}>{t.farmApr}</span>
                <span style={{ color: c.accent, fontSize: 15, fontWeight: 700 }}>{farmApr}%</span>
              </div>
              {sliderRow(c.accent, farmApr, setFarmApr, 0, 200, 5, 44)}
              <div style={{ marginTop: 6, fontSize: 11, color: c.textTertiary }}>{t.farmDesc}</div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13, fontWeight: 600 }}>
                <span style={{ color: c.textSecondary }}>{t.retention}</span>
                <span style={{ color: results.farmDepreciationLoss > 0 ? c.red : c.green, fontSize: 15, fontWeight: 700 }}>{rewardRetention}%</span>
              </div>
              {sliderRow(c.red, rewardRetention, setRewardRetention, 0, 100, 5, 44)}
              <div style={{ marginTop: 6, fontSize: 11, color: c.textTertiary }}>{t.retentionDesc}</div>
            </div>
          </div>
        </div>

        {/* Scenario A & B */}
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* A — USDC */}
          <div style={{ ...card, background: results.usdcProfit >= 0 ? c.blueBg : c.redBg, border: `2px solid ${results.usdcProfit >= 0 ? c.blueBorder : c.redBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ padding: 10, background: c.surface, borderRadius: 12, lineHeight: 0 }}><DollarSign size={22} color={c.blue} /></div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{t.scATitle}</div>
                <div style={{ fontSize: 12, color: c.textSecondary }}>{t.scASub}</div>
              </div>
            </div>
            {[[t.deposit, formatUsd(investment), false], [t.finalValue, formatUsd(results.totalFinalUsd), true]].map(([label, val, bold], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${c.border}` }}>
                <span style={{ fontSize: 13, color: c.textSecondary }}>{label}</span>
                <span style={{ fontSize: bold ? 16 : 14, fontWeight: bold ? 700 : 600 }}>{val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
              <span style={{ fontSize: 13, color: c.textSecondary }}>{t.pnl}</span>
              <span style={{ fontSize: mobile ? 20 : 24, fontWeight: 800, color: results.usdcProfit >= 0 ? c.blue : c.red }}>
                {results.usdcProfit >= 0 ? '+' : ''}{formatUsd(results.usdcProfit)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: c.textSecondary }}>{t.roi}</span>
              <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 99, background: results.usdcRoi >= 0 ? '#DBEAFE' : '#FEE2E2', color: results.usdcRoi >= 0 ? c.blue : c.red }}>
                {formatPct(results.usdcRoi)}
              </span>
            </div>
            <div style={{ marginTop: 16, padding: 14, background: 'rgba(255,255,255,0.7)', borderRadius: 10, fontSize: 13, color: c.textSecondary, lineHeight: 1.6, border: `1px solid ${c.border}` }}>
              {'\ud83d\udca1 '}{t.tipHeld}{formatDuration(durationDays)}
              {t.tipFee}<b style={{ color: c.green }}>{formatUsd(results.feeYieldUsd)}</b>
              {t.tipFarm}<b style={{ color: c.accent }}>{formatUsd(results.farmYieldUsd)}</b>
              {results.ilUsd < 0 && <>{t.tipIl}<b style={{ color: c.red }}>{formatUsd(Math.abs(results.ilUsd))}</b></>}
              {t.tipLp}<b style={{ color: c.text }}>{formatUsd(results.finalLpValueUsd)}</b>{'.'}
            </div>
          </div>

          {/* B — BTC */}
          <div style={{ ...card, background: results.btcProfit >= 0 ? c.orangeBg : c.redBg, border: `2px solid ${results.btcProfit >= 0 ? c.orangeBorder : c.redBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ padding: 10, background: c.surface, borderRadius: 12, lineHeight: 0 }}><Bitcoin size={22} color={c.orange} /></div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{t.scBTitle}</div>
                <div style={{ fontSize: 12, color: c.textSecondary }}>{t.scBSub}</div>
              </div>
            </div>
            {[[t.depositEquiv, formatBtc(results.initialBtcInvestment), false], [t.finalBtc, formatBtc(results.totalFinalBtc), true]].map(([label, val, bold], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${c.border}` }}>
                <span style={{ fontSize: 13, color: c.textSecondary }}>{label}</span>
                <span style={{ fontSize: bold ? 16 : 14, fontWeight: bold ? 700 : 600 }}>{val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
              <span style={{ fontSize: 13, color: c.textSecondary }}>{t.pnlCoins}</span>
              <span style={{ fontSize: mobile ? 20 : 24, fontWeight: 800, color: results.btcProfit >= 0 ? c.orange : c.red }}>
                {results.btcProfit >= 0 ? '+' : ''}{formatBtc(results.btcProfit)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: c.textSecondary }}>{t.roi}</span>
              <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 99, background: results.btcRoi >= 0 ? '#FFEDD5' : '#FEE2E2', color: results.btcRoi >= 0 ? c.orange : c.red }}>
                {formatPct(results.btcRoi)}
              </span>
            </div>
            <div style={{ marginTop: 16, padding: 14, background: 'rgba(255,255,255,0.7)', borderRadius: 10, fontSize: 13, color: c.textSecondary, lineHeight: 1.6, border: `1px solid ${c.border}` }}>
              {finalPrice > initialPrice
                ? <>{'\u26a0\ufe0f '}{t.tipBUp}<b style={{ color: c.red }}>{t.tipBUpBold}</b>{'.'}</>
                : finalPrice < initialPrice
                ? <>{'\ud83c\udfaf '}{t.tipBDown}<b style={{ color: c.green }}>{t.tipBDownBold}</b>{'!'}</>
                : <>{'\ud83d\udd04 '}{t.tipBFlat}</>}
            </div>
          </div>
        </div>

        {/* Yield Breakdown */}
        <div style={{ ...card, marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarSign size={18} color={c.textTertiary} />{t.yieldTitle}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: mobile ? 12 : 16 }}>
            <div style={{ padding: mobile ? 12 : 16, background: c.greenBg, borderRadius: 12, border: `1px solid ${c.greenBorder}` }}>
              <div style={{ fontSize: 12, color: c.green, fontWeight: 700, marginBottom: 6 }}>{t.feeYield}</div>
              <div style={{ fontSize: mobile ? 16 : 18, fontWeight: 700, color: c.green }}>+{formatUsd(results.feeYieldUsd)}</div>
              <div style={{ fontSize: 11, color: c.textTertiary, marginTop: 4 }}>{t.compoundExtra}{formatUsd(results.compoundingGain)}</div>
            </div>
            <div style={{ padding: mobile ? 12 : 16, background: c.accentBg, borderRadius: 12, border: `1px solid ${c.orangeBorder}` }}>
              <div style={{ fontSize: 12, color: c.accent, fontWeight: 700, marginBottom: 6 }}>{t.farmYield}</div>
              <div style={{ fontSize: mobile ? 16 : 18, fontWeight: 700, color: c.accent }}>+{formatUsd(results.farmYieldUsd)}</div>
              {results.farmDepreciationLoss > 0 && <div style={{ fontSize: 11, color: c.red, marginTop: 4 }}>{t.tokenLoss}{formatUsd(results.farmDepreciationLoss)}</div>}
            </div>
            <div style={{ padding: mobile ? 12 : 16, background: c.redBg, borderRadius: 12, border: `1px solid ${c.redBorder}` }}>
              <div style={{ fontSize: 12, color: c.red, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} />{t.il}</div>
              <div style={{ fontSize: mobile ? 16 : 18, fontWeight: 700, color: results.ilUsd === 0 ? c.textTertiary : c.red }}>{results.ilUsd === 0 ? '$0' : formatUsd(results.ilUsd)}</div>
              <div style={{ fontSize: 11, color: c.textTertiary, marginTop: 4 }}>{formatPct(results.ilPercentage)}{t.ilNote}</div>
            </div>
            <div style={{ padding: mobile ? 12 : 16, background: results.effectiveApy >= 0 ? c.purpleBg : c.redBg, borderRadius: 12, border: `1px solid ${results.effectiveApy >= 0 ? c.purpleBorder : c.redBorder}` }}>
              <div style={{ fontSize: 12, color: results.effectiveApy >= 0 ? c.purple : c.red, fontWeight: 700, marginBottom: 6 }}>{t.netApy}</div>
              <div style={{ fontSize: mobile ? 16 : 18, fontWeight: 700, color: results.effectiveApy >= 0 ? c.purple : c.red }}>{formatPct(results.effectiveApy)}</div>
              <div style={{ fontSize: 11, color: c.textTertiary, marginTop: 4 }}>{t.apyNote}</div>
            </div>
          </div>
        </div>

        {/* AMM Mechanics */}
        <div style={{ ...card }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={18} color={c.textTertiary} />{t.ammTitle}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr 1fr', gap: mobile ? 12 : 16 }}>
            <div style={{ padding: 16, background: c.surfaceAlt, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: c.textTertiary, marginBottom: 6 }}>{t.ammEntry}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{formatUsd(results.initialUsdc)} + {formatBtc(results.initialBtcAmount)}</div>
            </div>
            <div style={{ padding: 16, background: c.surfaceAlt, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: c.textTertiary, marginBottom: 6 }}>{t.ammExit}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{formatUsd(results.finalUsdcInLp)} + {formatBtc(results.finalBtcInLp)}</div>
            </div>
            <div style={{ padding: 16, background: c.redBg, borderRadius: 12, border: `1px solid ${c.redBorder}` }}>
              <div style={{ fontSize: 12, color: c.red, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertTriangle size={14} />{t.ammIl}
              </div>
              <div style={{ fontSize: 13 }}>
                {t.ammIlText}<b>{formatUsd(Math.abs(results.ilUsd))}</b>{' ('}<span style={{ color: c.red }}>{formatPct(results.ilPercentage)}</span>{')'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
