[中文版](./README_ZH.md)

# LP Dual-Asset Strategy Simulator

Interactive AMM Liquidity Provider (LP) dual-asset strategy simulator with real-time impermanent loss (IL) calculation, compounding fee yield, and farming reward depreciation modeling.

![License](https://img.shields.io/badge/license-MIT-blue)

## Overview

This tool helps you understand the **real P&L** of providing liquidity to a constant-product AMM (like Uniswap v2 / Aerodrome), from two different perspectives:

| Perspective | You originally held | Your benchmark |
|---|---|---|
| **Scenario A — USDC depositor** | Stablecoins | HODL USDC |
| **Scenario B — BTC depositor** | BTC | HODL BTC |

Both depositors end up with the **exact same LP position** (50/50 split). The difference is purely in **opportunity cost**.

## Core Formulas

The simulator uses the **constant product** AMM model:

```
x · y = k

where:
  x = BTC quantity in pool
  y = USDC quantity in pool
  k = constant
```

**Initial state** (50/50 split of investment `I` at price `p₀`):

```
y₀ = I / 2
x₀ = I / (2 · p₀)
k  = x₀ · y₀
```

**Final state** at price `p₁`:

```
x₁ = √(k / p₁)
y₁ = √(k · p₁)
LP value = x₁ · p₁ + y₁ = 2 · √(k · p₁)
```

**Impermanent Loss** vs 50/50 HODL:

```
HODL value = y₀ + x₀ · p₁
IL = (LP value − HODL value) / HODL value
   = 2√r / (1 + r) − 1     where r = p₁ / p₀
```

**Yield** (two sources with different mechanics):

```
Fee yield   = I × ((1 + feeAPR / 365)^days − 1)       // daily compounding
Farm yield  = I × farmAPR × (days / 365) × retention   // linear, with token depreciation
Total yield = Fee yield + Farm yield
```

**Net P&L**:

```
Scenario A (USDC):  Total = LP value + Total yield − Investment
Scenario B (BTC):   Total = (LP value + Total yield) / p₁ − Initial BTC amount
Net APY             = (Total / Investment)^(365/days) − 1
```

## Features

- **Bilingual UI** — toggle between English and Chinese
- 7 interactive sliders: investment, duration, entry/exit price, fee APR, farm APR, reward token retention
- **Duration slider** (7–730 days) — yield scales with holding period
- **Split yield model** — trading fee APR (daily compounding) vs farming reward APR (linear accrual)
- **Reward token depreciation** — adjustable retention rate to simulate farm token price decline
- Real-time dual-perspective P&L (fiat standard vs coin standard)
- **Yield breakdown card** — fee yield, farm yield, IL, and net annualized APY at a glance
- AMM mechanics breakdown showing pool composition changes
- IL calculation with visual indicators
- Clean Anthropic-inspired light theme

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/lp-strategy-simulator.git
cd lp-strategy-simulator
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build for Production

```bash
npm run build
```

Output in `dist/` — deploy to any static host (Vercel, Netlify, GitHub Pages, etc.).

## Tech Stack

- **React 18** + **Vite 5**
- **Lucide React** for icons
- Zero CSS framework — inline styles with a custom Anthropic-inspired palette

## Key Insights

1. **LP = selling volatility.** You give up extreme upside (or avoid extreme downside) in exchange for steady fee income.
2. **BTC depositor doing LP:** You'll underperform HODL when BTC pumps (half was converted to USDC). But if BTC dumps, LP cushions your fall.
3. **USDC depositor doing LP:** Opposite — you gain exposure to BTC upside, but suffer when BTC drops (half was converted to BTC).
4. **The decision:** Does `APR > IL + opportunity cost`?
5. **Compounding matters.** At 15% fee APR over 2 years, daily compounding earns ~5% more than simple interest.
6. **Farm token risk is real.** A 200% APR means nothing if the reward token drops 80% by the time you sell.

## Known Simplifications

- Price jumps instantly from entry to exit (no path simulation); IL is path-independent but fee income is not.
- Fee APR compounds on initial investment, not on the changing LP value.
- No pool share dilution — treats the user as the entire pool.
- No slippage, gas costs, or entry/exit fees.
- Assumes USDC is perfectly pegged at $1.
- Models Uniswap v2 full-range LP only (not concentrated liquidity).

## License

MIT
