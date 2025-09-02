
import React, { useState } from 'react';
import { MdSportsEsports } from 'react-icons/md';

export type TrophyBadgeProps = {
  username: string;
  place: 1 | 2 | 3 | 'loser';
  tournamentTitle: string;
  date: string;
};

const COLORS = {
  1: 'from-[#ffd700] to-yellow-400 border-[#a67c00]', // gold with dark brown border
  2: 'from-gray-200 to-gray-400 border-gray-300',
  3: 'from-orange-300 to-orange-600 border-orange-400',
  loser: 'from-red-400 to-red-700 border-red-400',
};
const LABELS = { 1: '1st', 2: '2nd', 3: '3rd', loser: 'Loser' };

// SVG arc text for edge, now brown for readability, only top and bottom
function EdgeText({ text, color = '#2d1a00', position = 'top' }: { text: string; color?: string; position?: 'top' | 'bottom' }) {
  if (position === 'top') {
    return (
      <svg viewBox="0 0 100 50" className="absolute w-full h-1/2 top-0 left-0 pointer-events-none select-none">
        <defs>
          <path id="edgePathTop" d="M15,50 A35,35 0 0,1 85,50" fill="none" />
        </defs>
        <text fill={color} fontSize="8" fontWeight="700" letterSpacing="2">
          <textPath xlinkHref="#edgePathTop" startOffset="50%" textAnchor="middle" dominantBaseline="middle">{text}</textPath>
        </text>
      </svg>
    );
  }
  // bottom: reverse path direction and center text
  return (
    <svg viewBox="0 0 100 50" className="absolute w-full h-1/2 bottom-0 left-0 pointer-events-none select-none">
      <defs>
        {/* path direction reversed so text sits upright along bottom */}
        <path id="edgePathBottom" d="M85,0 A35,35 0 0,0 15,0" fill="none" />
      </defs>
      <text fill={color} fontSize="8" fontWeight="700" letterSpacing="2">
        <textPath xlinkHref="#edgePathBottom" startOffset="50%" textAnchor="middle" dominantBaseline="middle">{text}</textPath>
      </text>
    </svg>
  );
}

export const TrophyBadge: React.FC<TrophyBadgeProps> = ({ username, place, tournamentTitle, date }) => {
  const [flipped, setFlipped] = useState(false);
  const color = COLORS[place];
  const label = LABELS[place];
  // place-specific styles
  const isGold = place === 1;
  const isSilver = place === 2;
  const isBronze = place === 3;
  const isLoser = place === 'loser';

  let outerBackground = ''
  let innerBackground = ''
  let borderColor = ''
  let iconClr = ''
  let accent = ''
  let textShadow = ''

  if (isGold) {
    outerBackground = 'linear-gradient(135deg,#ffd700 0%, #f0c419 40%, #d4a017 100%)'
    innerBackground = 'linear-gradient(180deg, rgba(255,245,200,0.95) 0%, rgba(255,220,40,0.95) 60%)'
    borderColor = '#2d1a00'
    iconClr = '#2d1a00'
    accent = '#2d1a00'
    textShadow = '0 2px 6px #fff8, 0 1px 0 #a67c00, 0 0 2px #fff8'
  } else if (isSilver) {
    outerBackground = 'linear-gradient(135deg,#f3f4f6 0%, #e5e7eb 50%, #d1d5db 100%)'
    innerBackground = 'linear-gradient(180deg, rgba(245,247,250,0.95) 0%, rgba(226,232,240,0.95) 60%)'
    borderColor = '#9ca3af' // silver border
    iconClr = '#374151' // dark gray icon
    accent = '#374151'
    textShadow = '0 1px 3px rgba(255,255,255,0.5)'
  } else if (isBronze) {
    outerBackground = 'linear-gradient(135deg,#d08a3a 0%, #c06a2b 50%, #a85a21 100%)'
    innerBackground = 'linear-gradient(180deg, rgba(245,215,175,0.95) 0%, rgba(205,140,70,0.95) 60%)'
    borderColor = '#8a4b1a'
    iconClr = '#5a3410'
    accent = '#5a3410'
    textShadow = '0 2px 6px rgba(0,0,0,0.12)'
  } else if (isLoser) {
    outerBackground = 'linear-gradient(135deg,#f87171 0%, #ef4444 50%, #dc2626 100%)'
    innerBackground = 'linear-gradient(180deg, rgba(255,200,200,0.95) 0%, rgba(240,100,100,0.95) 60%)'
    borderColor = '#7f1d1d'
    iconClr = '#4b0000'
    accent = '#4b0000'
    textShadow = '0 2px 6px rgba(0,0,0,0.12)'
  } else {
    outerBackground = 'linear-gradient(135deg,#e6e6e6 0%, #cfcfcf 50%, #b8b8b8 100%)'
    innerBackground = 'linear-gradient(180deg, rgba(255,245,200,0.95) 0%, rgba(255,220,40,0.95) 60%)'
    borderColor = '#9ca3af'
    iconClr = '#333'
    accent = '#222'
    textShadow = '0 2px 6px #fff8, 0 1px 0 #b45309'
  }
  // back side background per place
  let backBackground = ''
  let backTextColor = accent
  if (isGold) {
    backBackground = 'linear-gradient(135deg,#f7e18b 0%, #f1c64a 50%, #d9a210 100%)'
    backTextColor = '#2d1a00'
  } else if (isSilver) {
    backBackground = 'linear-gradient(135deg,#f8fafc 0%, #eef2f6 50%, #e2e8f0 100%)'
    backTextColor = '#374151'
  } else if (isBronze) {
    backBackground = 'linear-gradient(135deg,#f2e0c4 0%, #e0b98a 50%, #c18743 100%)'
    backTextColor = '#5a3410'
  } else if (isLoser) {
    backBackground = 'linear-gradient(135deg,#fdd6d6 0%, #f8b4b4 50%, #f87171 100%)'
    backTextColor = '#7f1d1d'
  } else {
    backBackground = outerBackground
    backTextColor = accent
  }
  return (
    <div
      className="relative w-36 h-36 cursor-pointer"
      onClick={() => setFlipped(f => !f)}
      title="Click to flip"
    >
      {/* Octagon outer */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`relative w-32 h-32 border-2 rounded-none`}
          style={{
            clipPath:
              'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)',
            background: outerBackground,
            boxShadow: isGold
              ? '0 6px 18px rgba(255,215,0,0.12), inset 0 -6px 12px rgba(0,0,0,0.15)'
              : '0 4px 12px rgba(0,0,0,0.08), inset 0 -4px 8px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px',
            borderColor: borderColor,
          }}
        >
          {/* inner octagon (faceted) */}
          <div
            style={{
              width: '100%',
              height: '100%',
              clipPath:
                'polygon(28% 4%,72% 4%,96% 28%,96% 72%,72% 96%,28% 96%,4% 72%,4% 28%)',
              background: innerBackground,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 6px 20px rgba(0,0,0,0.18), 0 6px 24px rgba(0,0,0,0.12)'
            }}
          >
            {/* center avatar */}
            <div className="relative flex flex-col items-center justify-center" style={{ width: '70%', height: '70%' }}>
              {isLoser && (
                <div className="text-[9px] font-medium mb-1 uppercase tracking-wide" style={{ color: accent, textShadow }}>Loser SBT</div>
              )}
              <MdSportsEsports
                className="text-[64px]"
                style={{ color: iconClr, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
              />
              <div 
                className="mt-1 text-center font-bold text-sm"
                style={{
                  color: accent,
                  textShadow,
                  WebkitTextStroke: '0.4px rgba(255,255,255,0.6)'
                }}
              >
                {username}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* engraved edge text - top & bottom */}
      <div className="absolute inset-0 pointer-events-none">
        <EdgeText text="SIGN GAMERS CABAL" color="#2d1a00" position="bottom" />
      </div>

      {/* back side (flip) */}
      {flipped && (
        <div className={`absolute inset-0 flex items-center justify-center`}>
          <div
            className={`relative w-32 h-32 rounded-none border-2`}
            style={{
              clipPath:
                'polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)',
              background: backBackground,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
              borderColor: borderColor
            }}
          >
            <div className="text-center">
              <div style={{ fontWeight: 700, color: backTextColor }}>{tournamentTitle}</div>
              <div style={{ fontSize: 12, color: backTextColor, marginTop: 6 }}>{date}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrophyBadge;
