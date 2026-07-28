'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
}

export function Logo({ className = '', showText = true, size = 'md', href = '/' }: LogoProps) {
  const iconSizes = {
    sm: 32,
    md: 40,
    lg: 52,
    xl: 64,
  };
  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const px = iconSizes[size];

  const mark = (
    <div className={`relative shrink-0 select-none`} style={{ width: px, height: px }}>
      <svg viewBox="0 0 64 64" width={px} height={px} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main black square */}
        <rect width="64" height="64" fill="#000000"/>
        {/* Pink corner accent */}
        <rect x="44" y="0" width="20" height="20" fill="#FF90E8"/>
        {/* Yellow corner accent */}
        <rect x="0" y="44" width="20" height="20" fill="#FFE500"/>
        {/* Teal corner accent */}
        <rect x="44" y="44" width="20" height="20" fill="#23A094"/>
        {/* P letter */}
        <text x="7" y="46" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="42" fill="#FFFFFF">P</text>
        {/* 2 accent */}
        <text x="36" y="27" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="22" fill="#FF90E8">2</text>
      </svg>
    </div>
  );

  const text = showText && (
    <div className={`flex items-baseline font-black tracking-tighter leading-none ${textSizes[size]}`}>
      <span className="text-black dark:text-white">Placement</span>
      <span
        className="mx-0.5 font-black"
        style={{
          background: 'linear-gradient(135deg, #FF90E8 0%, #23A094 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        2
      </span>
      <span className="text-black dark:text-white">Job</span>
    </div>
  );

  return (
    <Link href={href} className={`inline-flex items-center gap-3 group cursor-pointer ${className}`}>
      <div className="transition-transform duration-200 group-hover:scale-95 group-hover:-rotate-1">
        {mark}
      </div>
      {text}
    </Link>
  );
}
