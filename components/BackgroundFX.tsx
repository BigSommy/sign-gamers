// Animated global background with grid, glow, floating particles, and game icons
'use client';

import React, { useEffect, useState } from 'react';
import { FaGamepad, FaChessKnight, FaDice, FaTrophy } from 'react-icons/fa';
import { GiConsoleController, GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { MdSportsEsports } from 'react-icons/md';

type Dot = { x: number; y: number; delay: number };
type Particle = { x: number; y: number; r: number; dur: number; delay: number };

export default function BackgroundFX() {
  // Start with deterministic values so server and client markup match
  const gridDots: Dot[] = Array.from({ length: 40 }).map((_, i) => ({
    x: (i % 8) * 12.5 + 6.25,
    y: Math.floor(i / 8) * 12.5 + 6.25,
    delay: i * 0.12
  }));

  const initialParticles: Particle[] = Array.from({ length: 18 }).map((_, i) => ({
    x: (i * 7) % 100,
    y: (i * 13) % 100,
    r: 8,
    dur: 8,
    delay: (i % 4) * 0.6
  }));

  const [particles, setParticles] = useState<Particle[]>(initialParticles);
  const [icons, setIcons] = useState<Array<any>>([])

  // Randomize positions on client only (after mount) to avoid hydration mismatch
  useEffect(() => {
    const newParticles = Array.from({ length: 18 }).map(() => {
      const randX = Math.random() * 100;
      const randY = Math.random() * 100;
      const randR = 6 + Math.random() * 10;
      const randDur = 6 + Math.random() * 6;
      const randDelay = Math.random() * 4;
      return { x: randX, y: randY, r: randR, dur: randDur, delay: randDelay };
    });
    setParticles(newParticles);

    setIcons([
      { Icon: FaGamepad, color: '#f23900', size: 38, style: { left: '12%', top: '18%', animationDelay: '0s' } },
      { Icon: FaChessKnight, color: '#ffb300', size: 32, style: { left: '70%', top: '12%', animationDelay: '1.2s' } },
      { Icon: FaDice, color: '#fff', size: 30, style: { left: '30%', top: '70%', animationDelay: '2.1s' } },
      { Icon: GiConsoleController, color: '#f23900', size: 36, style: { left: '80%', top: '60%', animationDelay: '0.7s' } },
      { Icon: MdSportsEsports, color: '#ffb300', size: 34, style: { left: '55%', top: '80%', animationDelay: '1.7s' } },
      { Icon: FaTrophy, color: '#fff', size: 32, style: { left: '20%', top: '50%', animationDelay: '2.7s' } },
      { Icon: GiPerspectiveDiceSixFacesRandom, color: '#f23900', size: 30, style: { left: '60%', top: '35%', animationDelay: '1.4s' } },
    ])
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none z-0">

      {/* Animated glowing dots at grid intersections */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0" style={{ display: 'block' }}>
          {gridDots.map((d, i) => (
            <circle key={i} cx={`${d.x}%`} cy={`${d.y}%`} r="2.5" fill="#f23900" opacity="0.18">
              <animate attributeName="opacity" values="0.18;0.7;0.18" dur="2.5s" begin={`${d.delay}s`} repeatCount="indefinite" />
              <animate attributeName="r" values="2.5;5;2.5" dur="2.5s" begin={`${d.delay}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
      </div>

      {/* Pulsing orange glow overlay (original) */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none animate-pulse-slow" style={{
        background: 'radial-gradient(circle at 60% 40%, rgba(242,57,0,0.18) 0%, rgba(242,57,0,0.08) 40%, transparent 80%)',
        filter: 'blur(32px)',
        opacity: 0.7
      }} />

      {/* Diagonal Lines (subtle, animated shimmer) */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(249,115,22,0.07)_46%,rgba(249,115,22,0.07)_54%,transparent_55%)] animate-diag-shimmer z-0 pointer-events-none"></div>

      {/* Floating Particles Layer */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0" style={{ display: 'block' }}>
          {particles.map((p, i) => (
            <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r={p.r} fill="#f23900" opacity="0.12">
              <animate attributeName="cy" values={`${p.y}%;${(p.y - 20) < 0 ? 100 : p.y - 20}%;${p.y}%`} dur={`${p.dur}s`} begin={`${p.delay}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.12;0.32;0.12" dur={`${p.dur}s`} begin={`${p.delay}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>

        {/* Floating Game Icons */}
        {icons.map(({ Icon, color, size, style }: any, idx: number) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              ...style,
              zIndex: 20,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 16px ' + color + '88)',
              animation: 'floatY 7s ease-in-out infinite',
              animationDelay: style.animationDelay,
            }}
          >
            <Icon color={color} size={size} />
          </div>
        ))}

        {/* Floating animation keyframes */}
        <style>{`
          @keyframes floatY {
            0% { transform: translateY(0px) scale(1); opacity: 0.7; }
            50% { transform: translateY(-32px) scale(1.08); opacity: 1; }
            100% { transform: translateY(0px) scale(1); opacity: 0.7; }
          }
        `}</style>
      </div>
    </div>
  );
}
