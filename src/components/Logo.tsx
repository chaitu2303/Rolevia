'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  href?: string;
}

export function Logo({ 
  size = 'md', 
  className = '', 
  showText = true,
  href = '/dashboard'
}: LogoProps) {
  
  const sizes = {
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64
  };

  const px = sizes[size];

  return (
    <Link href={href} className={`inline-flex items-center gap-3 group cursor-pointer ${className}`}>
      <div className="transition-transform duration-200 group-hover:scale-95 group-hover:-rotate-1 flex items-center justify-center shrink-0">
        <Image 
          src="/icon.svg" 
          alt="Rolevia Logo" 
          width={px * 4} 
          height={px * 4} 
          className="object-contain"
          style={{ height: px, width: 'auto' }}
          priority
        />
      </div>
      {showText && (
        <div className={`font-serif font-black tracking-tight leading-none text-xl`}>
          <span className="text-foreground">Role</span>
          <span className="text-emerald-500 font-sans font-medium">via</span>
        </div>
      )}
    </Link>
  );
}
