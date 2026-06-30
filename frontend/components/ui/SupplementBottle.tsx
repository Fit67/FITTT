import React from 'react';

interface SupplementBottleProps {
  brand: string;
  name: string;
  flavorOrType: string;
  colorTheme: 'red' | 'black-gold' | 'blue-white' | 'green' | 'purple' | 'amber' | 'dark-grey';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const SupplementBottle: React.FC<SupplementBottleProps> = ({
  brand,
  name,
  flavorOrType,
  colorTheme,
  size = 'md',
  className = '',
}) => {
  // Size classes
  const sizeMap = {
    sm: { container: 'w-24 h-32', cap: 'w-16 h-4', labelHeight: 'h-16' },
    md: { container: 'w-36 h-48', cap: 'w-24 h-6', labelHeight: 'h-24' },
    lg: { container: 'w-52 h-64', cap: 'w-36 h-8', labelHeight: 'h-32' },
    xl: { container: 'w-72 h-96', cap: 'w-48 h-12', labelHeight: 'h-48' },
  };

  const dims = sizeMap[size];

  // Theme styling configurations
  const themeConfig = {
    red: {
      bottleBg: 'bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950',
      capBg: 'bg-gradient-to-r from-red-800 via-red-600 to-red-900 border-b border-red-500',
      capRidge: 'bg-red-950/20',
      labelBg: 'bg-gradient-to-br from-red-700 via-red-800 to-red-950 border-y border-red-500/30',
      labelTitleColor: 'text-white',
      labelTextAccent: 'text-red-300',
      glow: 'shadow-red-900/30',
    },
    'black-gold': {
      bottleBg: 'bg-gradient-to-b from-neutral-900 via-neutral-950 to-black',
      capBg: 'bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-900 border-b border-neutral-600',
      capRidge: 'bg-black/20',
      labelBg: 'bg-gradient-to-br from-amber-600 via-neutral-900 to-neutral-950 border-y border-amber-500/40',
      labelTitleColor: 'text-amber-400',
      labelTextAccent: 'text-yellow-100',
      glow: 'shadow-amber-500/10',
    },
    'blue-white': {
      bottleBg: 'bg-gradient-to-b from-neutral-100 via-white to-neutral-200 border border-neutral-300/30',
      capBg: 'bg-gradient-to-r from-blue-700 via-blue-500 to-blue-800 border-b border-blue-400',
      capRidge: 'bg-blue-950/20',
      labelBg: 'bg-gradient-to-br from-blue-800 via-blue-600 to-blue-950 border-y border-blue-400/30',
      labelTitleColor: 'text-white',
      labelTextAccent: 'text-blue-200',
      glow: 'shadow-blue-500/10',
    },
    purple: {
      bottleBg: 'bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950',
      capBg: 'bg-gradient-to-r from-purple-800 via-purple-600 to-purple-900 border-b border-purple-500',
      capRidge: 'bg-purple-950/20',
      labelBg: 'bg-gradient-to-br from-purple-900 via-purple-700 to-neutral-950 border-y border-purple-500/30',
      labelTitleColor: 'text-white',
      labelTextAccent: 'text-purple-300',
      glow: 'shadow-purple-900/20',
    },
    green: {
      bottleBg: 'bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950',
      capBg: 'bg-gradient-to-r from-emerald-800 via-emerald-600 to-emerald-900 border-b border-emerald-500',
      capRidge: 'bg-emerald-950/20',
      labelBg: 'bg-gradient-to-br from-emerald-900 via-zinc-900 to-black border-y border-emerald-500/30',
      labelTitleColor: 'text-emerald-400',
      labelTextAccent: 'text-emerald-200',
      glow: 'shadow-emerald-950/20',
    },
    amber: {
      bottleBg: 'bg-gradient-to-b from-amber-950/90 via-amber-900/80 to-amber-950/90 border border-amber-800/20',
      capBg: 'bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-950 border-b border-neutral-700',
      capRidge: 'bg-black/30',
      labelBg: 'bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border-y border-amber-500/30',
      labelTitleColor: 'text-amber-500',
      labelTextAccent: 'text-neutral-300',
      glow: 'shadow-amber-900/10',
    },
    'dark-grey': {
      bottleBg: 'bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950',
      capBg: 'bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-950 border-b border-neutral-700',
      capRidge: 'bg-black/40',
      labelBg: 'bg-gradient-to-br from-neutral-800 via-neutral-900 to-black border-y border-neutral-700/40',
      labelTitleColor: 'text-zinc-100',
      labelTextAccent: 'text-red-500',
      glow: 'shadow-neutral-950/40',
    },
  };

  const theme = themeConfig[colorTheme];

  // Ridges for the cap
  const numRidges = size === 'xl' ? 12 : size === 'lg' ? 9 : size === 'md' ? 6 : 4;
  const ridges = Array.from({ length: numRidges });

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* 3D Bottle Base Shadow */}
      <div className={`absolute bottom-0 w-[90%] h-6 bg-black/60 blur-md rounded-full transform translate-y-1`} />

      {/* The Lid / Cap */}
      <div className={`relative ${dims.cap} ${theme.capBg} rounded-t-lg shadow-md flex justify-between px-1 overflow-hidden z-10`}>
        {ridges.map((_, i) => (
          <div key={i} className={`w-[2px] h-full ${theme.capRidge}`} />
        ))}
        {/* Cap reflective shine */}
        <div className="absolute top-0 left-1/4 w-[15%] h-full bg-white/20 skew-x-12 blur-xs pointer-events-none" />
      </div>

      {/* The Neck */}
      <div className={`w-[85%] h-2 bg-neutral-950/80 -mt-[1px] relative z-0`} />

      {/* Bottle Body */}
      <div className={`relative ${dims.container} ${theme.bottleBg} rounded-[2rem] shadow-2xl flex flex-col items-center justify-between overflow-hidden border border-white/5`}>
        {/* Shiny highlights (Gloss effect) */}
        <div className="absolute top-0 left-1/5 w-[12%] h-full bg-gradient-to-r from-white/15 via-white/5 to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 right-1/4 w-[6%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-10" />

        {/* Brand Header */}
        <div className="text-center pt-3 z-20 w-full px-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-neutral-400 font-bold truncate">
            {brand}
          </p>
        </div>

        {/* Product Label Block */}
        <div className={`w-full ${dims.labelHeight} ${theme.labelBg} flex flex-col justify-center items-center px-4 py-2 text-center relative overflow-hidden`}>
          {/* Label pattern backgrounds */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          {/* Red Rex custom graphics if applicable */}
          {colorTheme === 'red' && brand.includes('REX') && (
            <div className="absolute -right-2 -bottom-2 opacity-15 pointer-events-none">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" className="text-red-200">
                <path d="M19 4h-4L12 2l-3 2H5v3h14V4zM5 9v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9H5zm4 11H7v-9h2v9zm4 0h-2v-9h2v9zm4 0h-2v-9h2v9z"/>
              </svg>
            </div>
          )}

          {/* Label text */}
          <h4 className={`font-sans font-black tracking-tight leading-none uppercase ${theme.labelTitleColor} ${
            size === 'xl' ? 'text-2xl' : size === 'lg' ? 'text-lg' : size === 'md' ? 'text-sm' : 'text-[11px]'
          }`}>
            {name.split(' ').slice(0, 2).join(' ')}
          </h4>
          
          <h5 className={`font-sans font-extrabold uppercase tracking-wide leading-none ${theme.labelTextAccent} mt-0.5 ${
            size === 'xl' ? 'text-base' : size === 'lg' ? 'text-xs' : 'text-[9px]'
          }`}>
            {name.split(' ').slice(2).join(' ') || brand}
          </h5>

          {/* Flavor/Type footer on label */}
          <div className="mt-2 flex items-center justify-center gap-1 z-10">
            <span className={`font-mono font-medium rounded-xs px-1 py-0.5 uppercase tracking-wider text-white bg-black/40 truncate max-w-[80%] ${
              size === 'xl' ? 'text-[10px]' : 'text-[8px]'
            }`}>
              {flavorOrType.split(' ').slice(0, 2).join(' ')}
            </span>
          </div>
        </div>

        {/* Bottle Base */}
        <div className="w-full pb-3 text-center z-20">
          <p className="font-sans font-bold text-[8px] text-neutral-400 tracking-wider">
            {colorTheme === 'red' ? '30 SERVINGS' : 'PREMIUM FORMULA'}
          </p>
        </div>
      </div>
    </div>
  );
};
