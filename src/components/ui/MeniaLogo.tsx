import React from 'react';

interface MeniaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  showTagline?: boolean;
  className?: string;
}

export const MeniaLogo: React.FC<MeniaLogoProps> = ({
  size = 'md',
  variant = 'full',
  showTagline = true,
  className = ''
}) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-13 h-13',
    xl: 'w-16 h-16'
  }[size];

  const titleSize = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl sm:text-4xl'
  }[size];

  const taglineSize = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
    xl: 'text-xs'
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Icon Emblem */}
      <div className={`relative ${iconDimensions} shrink-0`}>
        {/* Glow Layer */}
        <div className="absolute inset-0 bg-linear-to-br from-amber-400 to-amber-600 rounded-2xl blur-[6px] opacity-40 group-hover:opacity-75 transition-opacity"></div>
        
        {/* Emblem Frame */}
        <div className="relative w-full h-full rounded-2xl bg-linear-to-br from-slate-900 via-slate-950 to-black p-0.5 border border-amber-500/40 shadow-lg shadow-amber-500/10 flex items-center justify-center overflow-hidden">
          
          {/* Background Radial Highlight */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(245,158,11,0.25),transparent_70%)] pointer-events-none"></div>

          {/* SVG Vector Monogram & Cloche Crown */}
          <svg viewBox="0 0 100 100" className="w-full h-full p-1.5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="meniaGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="meniaShine" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Haute Cuisine Cloche Arc on Top */}
            <path
              d="M 28 34 C 28 22, 72 22, 72 34"
              stroke="url(#meniaGold)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Cloche Knob / Gastronomy Star */}
            <circle cx="50" cy="20" r="3.5" fill="url(#meniaGold)" />
            <circle cx="50" cy="20" r="1.5" fill="#ffffff" />

            {/* Geometric Haute Monogram "M" for MENIA */}
            <path
              d="M 26 74 L 26 40 L 37 40 L 50 60 L 63 40 L 74 40 L 74 74 L 64 74 L 64 54 L 54 69 L 46 69 L 36 54 L 36 74 Z"
              fill="url(#meniaGold)"
            />

            {/* Gourmet Plate Underline */}
            <path
              d="M 22 80 L 78 80"
              stroke="url(#meniaGold)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="50" cy="80" r="2" fill="#fef08a" />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      {variant === 'full' && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-serif font-black tracking-[0.12em] ${titleSize} text-slate-900 dark:text-white`}>
              MENIA
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
          </div>
          {showTagline && (
            <span className={`font-sans font-semibold tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mt-0.5 ${taglineSize}`}>
              Restaurant & Cuisine
            </span>
          )}
        </div>
      )}
    </div>
  );
};
