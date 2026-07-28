'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none group cursor-pointer ${className}`}>
      {/* Corporate Abstract Icon (TCS / Infosys style) */}
      <div className={`relative shrink-0 flex items-center justify-center transition-opacity duration-300 group-hover:opacity-85 ${iconSizes[size]}`}>
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Outer Corporate Hexagon */}
          <path d="M32 4L60 18V46L32 60L4 46V18L32 4Z" fill="#0A3D62"/>
          {/* Inner Layer */}
          <path d="M32 10L52 20V42L32 52L12 42V20L32 10Z" fill="#1572B6"/>
          {/* Core White Geometric Shape */}
          <path d="M32 20L44 26V38L32 44L20 38V26L32 20Z" fill="#FFFFFF"/>
          {/* Center Dot */}
          <circle cx="32" cy="32" r="4" fill="#0A3D62"/>
        </svg>
      </div>

      {/* Corporate Typography */}
      {showText && (
        <div className={`flex items-baseline font-bold tracking-tight font-sans ${textSizes[size]}`}>
          <span className="text-[#0A3D62] dark:text-white">
            Placement
          </span>
          <span className="text-[#1572B6] mx-0.5 font-black">
            2
          </span>
          <span className="text-[#0A3D62] dark:text-white">
            Job
          </span>
        </div>
      )}
    </div>
  );
}
