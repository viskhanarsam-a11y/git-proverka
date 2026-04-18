"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type CoinOrb = {
  id: string;
  size: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  driftScale: number;
  rotation: number;
  rotationVelocity: number;
  glow: string;
  image: string;
  alt: string;
};

const ORBS: CoinOrb[] = [
  {
    id: "btc",
    size: 96,
    x: 0.12,
    y: 0.18,
    vx: 118,
    vy: 76,
    driftScale: 1,
    rotation: 0,
    rotationVelocity: 5,
    glow: "rgba(245, 158, 11, 0.18)",
    image: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400",
    alt: "Bitcoin logo",
  },
  {
    id: "eth",
    size: 88,
    x: 0.82,
    y: 0.22,
    vx: -110,
    vy: 82,
    driftScale: 1,
    rotation: 10,
    rotationVelocity: -6,
    glow: "rgba(148, 163, 184, 0.18)",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    alt: "Ethereum logo",
  },
  {
    id: "apt",
    size: 84,
    x: 0.48,
    y: 0.12,
    vx: 94,
    vy: 72,
    driftScale: 1,
    rotation: -12,
    rotationVelocity: 6,
    glow: "rgba(226, 232, 240, 0.16)",
    image: "https://assets.coingecko.com/coins/images/26455/large/aptos_round.png",
    alt: "Aptos logo",
  },
  {
    id: "sol",
    size: 102,
    x: 0.14,
    y: 0.68,
    vx: 102,
    vy: -88,
    driftScale: 1,
    rotation: -8,
    rotationVelocity: 4,
    glow: "rgba(45, 212, 191, 0.16)",
    image: "https://coin-images.coingecko.com/coins/images/4128/large/solana.png?1718769756",
    alt: "Solana logo",
  },
  {
    id: "link",
    size: 90,
    x: 0.58,
    y: 0.58,
    vx: -100,
    vy: 78,
    driftScale: 1,
    rotation: 9,
    rotationVelocity: -6,
    glow: "rgba(96, 165, 250, 0.18)",
    image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
    alt: "Chainlink logo",
  },
  {
    id: "atom",
    size: 100,
    x: 0.8,
    y: 0.72,
    vx: -98,
    vy: -74,
    driftScale: 1,
    rotation: 14,
    rotationVelocity: -5,
    glow: "rgba(96, 165, 250, 0.16)",
    image: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.svg",
    alt: "Cosmos Hub logo",
  },
  {
    id: "ada",
    size: 86,
    x: 0.28,
    y: 0.74,
    vx: 112,
    vy: -90,
    driftScale: 1.7,
    rotation: -10,
    rotationVelocity: 5,
    glow: "rgba(125, 211, 252, 0.16)",
    image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
    alt: "Cardano logo",
  },
];

type OrbState = CoinOrb & {
  phase: number;
  px: number;
  py: number;
};

const EDGE_PADDING = 28;
const COLLISION_DAMPING = 0.996;
const BOUNCE = 0.98;
const WANDER_FORCE_X = 22;
const WANDER_FORCE_Y = 18;

export function CoinOrbsBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let lastTime = 0;
    let states: OrbState[] = [];

    const applyTransforms = () => {
      states.forEach((orb, index) => {
        const node = orbRefs.current[index];
        if (!node) {
          return;
        }

        node.style.transform = `translate3d(${orb.px}px, ${orb.py}px, 0) rotate(${orb.rotation}deg)`;
      });
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      states = ORBS.map((orb) => ({
        ...orb,
        phase: Math.random() * Math.PI * 2,
        px: orb.x * Math.max(width - orb.size - EDGE_PADDING * 2, 1) + EDGE_PADDING,
        py: orb.y * Math.max(height - orb.size - EDGE_PADDING * 2, 1) + EDGE_PADDING,
      }));
      applyTransforms();
    };

    const handleBoundaryCollision = (orb: OrbState) => {
      const minX = EDGE_PADDING;
      const minY = EDGE_PADDING;
      const maxX = width - orb.size - EDGE_PADDING;
      const maxY = height - orb.size - EDGE_PADDING;

      if (orb.px <= minX) {
        orb.px = minX;
        orb.vx = Math.abs(orb.vx) * BOUNCE;
      } else if (orb.px >= maxX) {
        orb.px = maxX;
        orb.vx = -Math.abs(orb.vx) * BOUNCE;
      }

      if (orb.py <= minY) {
        orb.py = minY;
        orb.vy = Math.abs(orb.vy) * BOUNCE;
      } else if (orb.py >= maxY) {
        orb.py = maxY;
        orb.vy = -Math.abs(orb.vy) * BOUNCE;
      }
    };

    const handleOrbCollisions = () => {
      for (let index = 0; index < states.length; index += 1) {
        for (let nextIndex = index + 1; nextIndex < states.length; nextIndex += 1) {
          const first = states[index];
          const second = states[nextIndex];
          const firstCenterX = first.px + first.size / 2;
          const firstCenterY = first.py + first.size / 2;
          const secondCenterX = second.px + second.size / 2;
          const secondCenterY = second.py + second.size / 2;
          const dx = secondCenterX - firstCenterX;
          const dy = secondCenterY - firstCenterY;
          const distance = Math.hypot(dx, dy) || 0.001;
          const minDistance = first.size / 2 + second.size / 2 + 10;

          if (distance >= minDistance) {
            continue;
          }

          const nx = dx / distance;
          const ny = dy / distance;
          const overlap = minDistance - distance;
          const separationX = nx * overlap * 0.5;
          const separationY = ny * overlap * 0.5;

          first.px -= separationX;
          first.py -= separationY;
          second.px += separationX;
          second.py += separationY;

          const relativeVelocityX = first.vx - second.vx;
          const relativeVelocityY = first.vy - second.vy;
          const speedAlongNormal =
            relativeVelocityX * nx + relativeVelocityY * ny;

          if (speedAlongNormal > 0) {
            continue;
          }

          const impulse = (-1.08 * speedAlongNormal) / 2;
          const impulseX = impulse * nx;
          const impulseY = impulse * ny;

          first.vx += impulseX;
          first.vy += impulseY;
          second.vx -= impulseX;
          second.vy -= impulseY;
        }
      }
    };

    const animate = (timestamp: number) => {
      const delta = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.03) : 0.016;
      lastTime = timestamp;
      const time = timestamp / 1000;

      for (const orb of states) {
        const wanderX =
          (Math.sin(time * 0.65 + orb.phase) * WANDER_FORCE_X +
            Math.cos(time * 0.38 + orb.phase * 0.7) * 10) *
          orb.driftScale;
        const wanderY =
          (Math.cos(time * 0.58 + orb.phase) * WANDER_FORCE_Y +
            Math.sin(time * 0.44 + orb.phase * 0.85) * 8) *
          orb.driftScale;

        orb.vx += wanderX * delta;
        orb.vy += wanderY * delta;
        orb.px += orb.vx * delta;
        orb.py += orb.vy * delta;
        orb.rotation += orb.rotationVelocity * delta;
        orb.vx *= COLLISION_DAMPING;
        orb.vy *= COLLISION_DAMPING;

        if (Math.abs(orb.vx) < 56) {
          orb.vx += orb.vx >= 0 ? 0.56 : -0.56;
        }

        if (Math.abs(orb.vy) < 42) {
          orb.vy += orb.vy >= 0 ? 0.44 : -0.44;
        }
      }

      handleOrbCollisions();

      for (const orb of states) {
        handleBoundaryCollision(orb);
      }

      applyTransforms();
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
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
    >
      {ORBS.map((orb, index) => (
        <div
          key={orb.id}
          ref={(node) => {
            orbRefs.current[index] = node;
          }}
          className="crypto-orb absolute hidden sm:block"
          style={
            {
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              "--orb-glow": orb.glow,
            } as React.CSSProperties
          }
        >
          <div className="crypto-orb__inner">
            <Image
              src={orb.image}
              alt={orb.alt}
              className="crypto-orb__logo"
              width={Math.round(orb.size * 0.58)}
              height={Math.round(orb.size * 0.58)}
              sizes={`${Math.round(orb.size * 0.58)}px`}
              unoptimized
            />
          </div>
        </div>
      ))}
    </div>
  );
}
