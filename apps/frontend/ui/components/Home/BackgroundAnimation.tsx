import React from 'react';

export function BackgroundAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-1/3 -left-1/2 w-full h-full bg-gradient-to-br from-green-400/50 via-emerald-500/30 to-transparent rounded-full blur-[120px] animate-[float_20s_ease-in-out_infinite]" />
      <div className="absolute top-1/2 left-1/2 w-2/3 h-2/3 bg-gradient-to-tr from-blue-400/30 via-sky-500/20 to-transparent rounded-full blur-[80px] animate-[float_15s_ease-in-out_infinite_alternate]" />
      <div className="absolute -bottom-1/3 -right-1/3 w-full h-full bg-gradient-to-tl from-slate-400/30 via-gray-500/20 to-transparent rounded-full blur-[100px] animate-[float_25s_ease-in-out_infinite_reverse]" />
      {/* Air particle effect */}
      <div className="absolute inset-0 bg-noise-pattern opacity-[0.03] mix-blend-soft-light"></div>
    </div>
  );
}
