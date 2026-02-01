'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface HeaderProps {
  isScrolled?: boolean;
  transparent?: boolean;
}

export default function Header({ isScrolled = false, transparent = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(isScrolled);

  useEffect(() => {
    if (transparent) {
      const handleScroll = () => {
        setScrolled(window.scrollY > 50);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [transparent]);

  const bgClass = transparent
    ? scrolled ? 'bg-black/50 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
    : 'fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10';

  return (
    <header className={`${bgClass} ${transparent ? 'fixed top-0 w-full z-50 transition-all duration-300' : ''}`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold hover:text-gray-300 transition">
            <img src="/logo-synapse.svg" alt="Logo Synapse" className="w-8 h-8 object-contain" style={{marginRight: 4}} />
            SYNAPSE
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/pricing" className="hover:text-gray-300 transition text-sm">Tarifs</Link>
            <Link href="/chat" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition">
              Commencer
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
