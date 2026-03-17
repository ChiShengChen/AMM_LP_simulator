export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function calcV2({ investment, initialPrice: p0, finalPrice: p1, durationDays: days, feeApr, farmApr, rewardRetention, gasCost = 0 }) {
  const initialUsdc = investment / 2;
  const initialBtc = initialUsdc / p0;
  const k = initialUsdc * initialBtc;
  const finalUsdc = Math.sqrt(k * p1);
  const finalBtc = Math.sqrt(k / p1);
  const lpValue = finalUsdc + finalBtc * p1;

  const feeYield = investment * (Math.pow(1 + feeApr / 100 / 365, days) - 1);
  const simpleFee = investment * (feeApr / 100) * (days / 365);
  const compoundGain = feeYield - simpleFee;
  const rawFarm = investment * (farmApr / 100) * (days / 365);
  const farmYield = rawFarm * (rewardRetention / 100);
  const farmLoss = rawFarm - farmYield;

  const totalYield = feeYield + farmYield;
  const totalFinal = lpValue + totalYield - gasCost;
  const hodl = initialUsdc + initialBtc * p1;
  const ilUsd = lpValue - hodl;
  const ilPct = hodl !== 0 ? (ilUsd / hodl) * 100 : 0;

  const usdcProfit = totalFinal - investment;
  const usdcRoi = (usdcProfit / investment) * 100;
  const initBtcInv = investment / p0;
  const finalBtcTotal = p1 !== 0 ? totalFinal / p1 : 0;
  const btcProfit = finalBtcTotal - initBtcInv;
  const btcRoi = initBtcInv !== 0 ? (btcProfit / initBtcInv) * 100 : 0;
  const ret = totalFinal / investment;
  const apy = days > 0 && ret > 0 ? (Math.pow(ret, 365 / days) - 1) * 100 : -100;

  return {
    initialUsdc, initialBtc, finalUsdc, finalBtc, lpValue,
    feeYield, simpleFee, compoundGain, farmYield, rawFarm, farmLoss,
    totalYield, totalFinal, gasCost,
    ilUsd, ilPct, hodl, usdcProfit, usdcRoi,
    initBtcInv, finalBtcTotal, btcProfit, btcRoi, apy,
    capitalEff: 1, inRange: true,
  };
}

export function calcV3({ investment, initialPrice: p0, finalPrice: p1, durationDays: days, feeApr, farmApr, rewardRetention, gasCost = 0, priceLower: pa, priceUpper: pb }) {
  if (pa >= pb || pa <= 0 || p0 <= pa || p0 >= pb) return calcV2({ investment, initialPrice: p0, finalPrice: p1, durationDays: days, feeApr, farmApr, rewardRetention, gasCost });

  const sp0 = Math.sqrt(p0), sp1 = Math.sqrt(p1), spa = Math.sqrt(pa), spb = Math.sqrt(pb);
  const L = investment / (2 * sp0 - spa - p0 / spb);
  const x0 = L * (1 / sp0 - 1 / spb), y0 = L * (sp0 - spa);

  let x1, y1, inRange;
  if (p1 <= pa) { x1 = L * (1 / spa - 1 / spb); y1 = 0; inRange = false; }
  else if (p1 >= pb) { x1 = 0; y1 = L * (spb - spa); inRange = false; }
  else { x1 = L * (1 / sp1 - 1 / spb); y1 = L * (sp1 - spa); inRange = true; }

  const lpValue = x1 * p1 + y1;
  const Lv2 = investment / (2 * sp0);
  const capitalEff = L / Lv2;
  const effFeeApr = feeApr * capitalEff;

  const feeYield = investment * (Math.pow(1 + effFeeApr / 100 / 365, days) - 1);
  const simpleFee = investment * (effFeeApr / 100) * (days / 365);
  const compoundGain = feeYield - simpleFee;
  const rawFarm = investment * (farmApr / 100) * (days / 365);
  const farmYield = rawFarm * (rewardRetention / 100);
  const farmLoss = rawFarm - farmYield;

  const totalYield = feeYield + farmYield;
  const totalFinal = lpValue + totalYield - gasCost;
  const hodl = y0 + x0 * p1;
  const ilUsd = lpValue - hodl;
  const ilPct = hodl !== 0 ? (ilUsd / hodl) * 100 : 0;

  const usdcProfit = totalFinal - investment;
  const usdcRoi = (usdcProfit / investment) * 100;
  const initBtcInv = investment / p0;
  const finalBtcTotal = p1 !== 0 ? totalFinal / p1 : 0;
  const btcProfit = finalBtcTotal - initBtcInv;
  const btcRoi = initBtcInv !== 0 ? (btcProfit / initBtcInv) * 100 : 0;
  const ret = totalFinal / investment;
  const apy = days > 0 && ret > 0 ? (Math.pow(ret, 365 / days) - 1) * 100 : -100;

  return {
    initialUsdc: y0, initialBtc: x0, finalUsdc: y1, finalBtc: x1, lpValue,
    feeYield, simpleFee, compoundGain, farmYield, rawFarm, farmLoss,
    totalYield, totalFinal, gasCost,
    ilUsd, ilPct, hodl, usdcProfit, usdcRoi,
    initBtcInv, finalBtcTotal, btcProfit, btcRoi, apy,
    capitalEff, inRange,
  };
}

export function ilCurveData(n = 200) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const r = 0.1 + (i / n) * 9.9;
    pts.push({ pctChange: (r - 1) * 100, il: (2 * Math.sqrt(r) / (1 + r) - 1) * 100 });
  }
  return pts;
}

export function yieldTimelineData({ investment, durationDays, feeApr, farmApr, rewardRetention, initialPrice, finalPrice }) {
  const pts = [];
  const max = Math.min(durationDays, 730);
  const step = Math.max(1, Math.floor(max / 100));
  for (let d = 0; d <= max; d += step) {
    const fee = investment * (Math.pow(1 + feeApr / 100 / 365, d) - 1);
    const farm = investment * (farmApr / 100) * (d / 365) * (rewardRetention / 100);
    const p = initialPrice + (finalPrice - initialPrice) * (d / max);
    const r = p / initialPrice;
    const il = investment * Math.sqrt(r) - investment * (1 + r) / 2;
    pts.push({ day: d, fee, farm, il, net: fee + farm + il });
  }
  if (pts.length && pts[pts.length - 1].day !== max) {
    const d = max;
    const fee = investment * (Math.pow(1 + feeApr / 100 / 365, d) - 1);
    const farm = investment * (farmApr / 100) * (d / 365) * (rewardRetention / 100);
    const r = finalPrice / initialPrice;
    const il = investment * Math.sqrt(r) - investment * (1 + r) / 2;
    pts.push({ day: d, fee, farm, il, net: fee + farm + il });
  }
  return pts;
}

function boxMuller() {
  let u = Math.random(); while (u === 0) u = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

export function monteCarlo({ investment, initialPrice, durationDays, feeApr, farmApr, rewardRetention, gasCost = 0, volatility, numSims = 500 }) {
  const dt = 1 / 365, sig = volatility / 100, results = [];
  for (let s = 0; s < numSims; s++) {
    let price = initialPrice, fees = 0;
    for (let d = 0; d < durationDays; d++) {
      price *= Math.exp(-0.5 * sig * sig * dt + sig * Math.sqrt(dt) * boxMuller());
      fees += investment * Math.sqrt(price / initialPrice) * (feeApr / 100 / 365);
    }
    const lp = investment * Math.sqrt(price / initialPrice);
    const farm = investment * (farmApr / 100) * (durationDays / 365) * (rewardRetention / 100);
    const total = lp + fees + farm - gasCost;
    results.push({ returnPct: (total / investment - 1) * 100 });
  }
  results.sort((a, b) => a.returnPct - b.returnPct);
  const n = results.length;
  const p10 = results[Math.floor(n * 0.1)].returnPct;
  const median = results[Math.floor(n * 0.5)].returnPct;
  const p90 = results[Math.floor(n * 0.9)].returnPct;
  const mean = results.reduce((s, r) => s + r.returnPct, 0) / n;

  const lo = results[0].returnPct, hi = results[n - 1].returnPct;
  const binW = (hi - lo) / 30 || 1;
  const bins = Array.from({ length: 30 }, (_, i) => ({ x: lo + (i + 0.5) * binW, count: 0 }));
  for (const r of results) { const idx = Math.min(Math.floor((r.returnPct - lo) / binW), 29); bins[idx].count++; }

  return { p10, median, p90, mean, bins, binW };
}
