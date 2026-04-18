"use client";

import { useEffect, useRef } from "react";

type Candle = {
  x: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

type MarketState = {
  drift: number;
  volatility: number;
  impulse: number;
  impulseDecay: number;
  regimeCandlesLeft: number;
  pullbackBias: number;
  lastDirection: number;
};

const CANDLE_WIDTH = 16;
const CANDLE_GAP = 9;
const STEP = CANDLE_WIDTH + CANDLE_GAP;
const SCROLL_SPEED = 42;
const MAX_WICK = 2.6;
const MIN_PRICE = 18;
const MAX_PRICE = 82;
const TOP_PADDING = 42;
const BOTTOM_PADDING = 42;
const GRID_ALPHA = 0.14;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomSigned(amount: number) {
  return randomBetween(-amount, amount);
}

function pickRegime(state: MarketState) {
  const direction = Math.random() > 0.52 ? 1 : -1;
  const trendStrength = randomBetween(0.08, 0.34) * direction;
  const volatility =
    Math.random() > 0.78 ? randomBetween(1.25, 2.3) : randomBetween(0.55, 1.2);
  const impulseChance = Math.random();
  const impulse =
    impulseChance > 0.72 ? direction * randomBetween(1.4, 4.8) : 0;

  state.drift = trendStrength;
  state.volatility = volatility;
  state.impulse = impulse;
  state.impulseDecay = impulse === 0 ? 0 : randomBetween(0.72, 0.9);
  state.regimeCandlesLeft = Math.round(randomBetween(8, 24));
  state.pullbackBias = -direction * randomBetween(0.02, 0.12);
}

function createMarketState(): MarketState {
  const state: MarketState = {
    drift: 0,
    volatility: 0.9,
    impulse: 0,
    impulseDecay: 0.84,
    regimeCandlesLeft: 0,
    pullbackBias: 0,
    lastDirection: 1,
  };

  pickRegime(state);
  return state;
}

function createNextCandle(previous: Candle, state: MarketState): Candle {
  if (state.regimeCandlesLeft <= 0 || Math.random() > 0.985) {
    pickRegime(state);
  }

  state.regimeCandlesLeft -= 1;

  const open = previous.close;
  const noise = randomSigned(state.volatility);
  const meanReversion = (50 - open) * 0.014;
  const continuation = state.lastDirection * randomBetween(-0.08, 0.18);
  const move =
    state.drift +
    state.pullbackBias * randomBetween(0.45, 1.2) +
    state.impulse +
    continuation +
    meanReversion +
    noise;

  let close = open + move;

  if (Math.abs(move) < 0.18) {
    close += randomSigned(0.34);
  }

  close = clamp(close, MIN_PRICE, MAX_PRICE);

  const bodySize = Math.max(Math.abs(close - open), 0.18);
  const upperWick = randomBetween(0.18, state.volatility * MAX_WICK) + bodySize * 0.16;
  const lowerWick = randomBetween(0.18, state.volatility * MAX_WICK) + bodySize * 0.16;

  const high = clamp(Math.max(open, close) + upperWick, MIN_PRICE, MAX_PRICE + 6);
  const low = clamp(Math.min(open, close) - lowerWick, MIN_PRICE - 6, MAX_PRICE);

  if (state.impulse !== 0) {
    state.impulse *= state.impulseDecay;

    if (Math.abs(state.impulse) < 0.12) {
      state.impulse = 0;
    }
  }

  state.lastDirection = close >= open ? 1 : -1;

  return {
    x: previous.x + STEP,
    open,
    high,
    low,
    close,
  };
}

function priceToY(price: number, height: number) {
  const drawableHeight = height - TOP_PADDING - BOTTOM_PADDING;
  const normalized = (price - (MIN_PRICE - 2)) / (MAX_PRICE - MIN_PRICE + 4);
  return TOP_PADDING + (1 - normalized) * drawableHeight;
}

export function CandlestickBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      return;
    }

    let width = 0;
    let height = 0;
    let ratio = 1;
    let animationFrame = 0;
    let lastTime = 0;
    let candles: Candle[] = [];
    let market = createMarketState();

    const seedCandles = () => {
      market = createMarketState();
      candles = [];

      const initialPrice = randomBetween(34, 62);
      const initialCandle: Candle = {
        x: -STEP * 8,
        open: initialPrice,
        high: initialPrice + randomBetween(0.8, 2.8),
        low: initialPrice - randomBetween(0.8, 2.8),
        close: clamp(initialPrice + randomSigned(1.4), MIN_PRICE, MAX_PRICE),
      };

      candles.push(initialCandle);

      const visibleCount = Math.ceil((width + STEP * 14) / STEP);
      for (let index = 1; index < visibleCount; index += 1) {
        candles.push(createNextCandle(candles[candles.length - 1], market));
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      seedCandles();
    };

    const drawBackground = () => {
      context.clearRect(0, 0, width, height);

      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgba(14, 30, 62, 0.9)");
      gradient.addColorStop(0.42, "rgba(7, 24, 52, 0.84)");
      gradient.addColorStop(0.78, "rgba(5, 16, 38, 0.9)");
      gradient.addColorStop(1, "rgba(3, 10, 28, 0.96)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      const leftGlow = context.createRadialGradient(
        width * 0.22,
        height * 0.28,
        0,
        width * 0.22,
        height * 0.28,
        width * 0.42,
      );
      leftGlow.addColorStop(0, "rgba(34, 211, 238, 0.16)");
      leftGlow.addColorStop(1, "rgba(34, 211, 238, 0)");
      context.fillStyle = leftGlow;
      context.fillRect(0, 0, width, height);

      const rightGlow = context.createRadialGradient(
        width * 0.82,
        height * 0.68,
        0,
        width * 0.82,
        height * 0.68,
        width * 0.38,
      );
      rightGlow.addColorStop(0, "rgba(56, 189, 248, 0.12)");
      rightGlow.addColorStop(1, "rgba(56, 189, 248, 0)");
      context.fillStyle = rightGlow;
      context.fillRect(0, 0, width, height);

      context.save();
      context.globalAlpha = GRID_ALPHA;
      context.strokeStyle = "rgba(148, 163, 184, 0.24)";
      context.lineWidth = 1;

      for (let lineY = TOP_PADDING; lineY <= height - BOTTOM_PADDING; lineY += 68) {
        context.beginPath();
        context.moveTo(0, lineY + 0.5);
        context.lineTo(width, lineY + 0.5);
        context.stroke();
      }

      for (let lineX = 0; lineX <= width; lineX += STEP * 5) {
        context.beginPath();
        context.moveTo(lineX + 0.5, 0);
        context.lineTo(lineX + 0.5, height);
        context.stroke();
      }

      context.restore();
    };

    const drawCandles = () => {
      for (const candle of candles) {
        const openY = priceToY(candle.open, height);
        const closeY = priceToY(candle.close, height);
        const highY = priceToY(candle.high, height);
        const lowY = priceToY(candle.low, height);
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(Math.abs(closeY - openY), 5);
        const centerX = candle.x + CANDLE_WIDTH / 2;
        const bullish = candle.close >= candle.open;

        context.lineWidth = 1.35;
        context.strokeStyle = bullish
          ? "rgba(74, 222, 128, 0.92)"
          : "rgba(248, 113, 113, 0.92)";
        context.beginPath();
        context.moveTo(centerX, highY);
        context.lineTo(centerX, lowY);
        context.stroke();

        context.shadowBlur = 26;
        context.shadowColor = bullish
          ? "rgba(34, 197, 94, 0.26)"
          : "rgba(239, 68, 68, 0.26)";
        context.fillStyle = bullish
          ? "rgba(34, 197, 94, 0.88)"
          : "rgba(239, 68, 68, 0.88)";
        context.fillRect(candle.x, bodyTop, CANDLE_WIDTH, bodyHeight);

        context.shadowBlur = 0;
        context.strokeStyle = bullish
          ? "rgba(187, 247, 208, 0.9)"
          : "rgba(254, 202, 202, 0.9)";
        context.strokeRect(candle.x, bodyTop, CANDLE_WIDTH, bodyHeight);
      }
    };

    const animate = (timestamp: number) => {
      const delta = lastTime ? (timestamp - lastTime) / 1000 : 0;
      lastTime = timestamp;

      const offset = Math.min(SCROLL_SPEED * delta, STEP);
      for (const candle of candles) {
        candle.x -= offset;
      }

      while (candles.length > 0 && candles[0].x + CANDLE_WIDTH < -STEP * 2) {
        candles.shift();
      }

      while (candles.length > 0 && candles[candles.length - 1].x < width + STEP * 4) {
        const last = candles[candles.length - 1];
        candles.push(createNextCandle(last, market));
      }

      drawBackground();
      drawCandles();

      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    animationFrame = window.requestAnimationFrame(animate);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.12),transparent_42%),linear-gradient(180deg,rgba(2,6,23,0.2),rgba(2,6,23,0.64))]" />
    </div>
  );
}
