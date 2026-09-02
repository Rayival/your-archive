import React, { useState, useEffect } from 'react';
import { Sparkles, Image, Home, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'gallery', label: 'Galeri', icon: Image },
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex justify-center px-3 sm:px-6 pt-2 sm:pt-4 transition-all duration-500">
      <div 
        className={`w-full transition-all duration-500 rounded-2xl sm:rounded-3xl flex items-center justify-between px-4 sm:px-6 ${
          isScrolled
            ? 'max-w-4xl h-13 sm:h-14 bg-slate-950/85 backdrop-blur-2xl border border-amber-500/20 shadow-2xl shadow-black/80'
            : 'max-w-6xl h-16 sm:h-20 bg-slate-950/40 backdrop-blur-md border border-white/10'
        }`}
      >
        {/* Brand Identity: YOUR ARCHIVE */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-amber-400/10 border border-amber-500/30 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-md">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 group-hover:scale-110 transition duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 text-xs sm:text-base tracking-tight font-mono">
              YOUR ARCHIVE
            </span>
            <span className="text-[7px] sm:text-[8px] text-amber-400/80 uppercase tracking-widest -mt-1 font-mono font-semibold">
              Private Vault
            </span>
          </div>
        </div>

        {/* Animated Navigation Tabs - Mobile Optimized */}
        <nav className="relative flex items-center gap-0.5 sm:gap-1 bg-slate-900/60 p-1 rounded-xl sm:rounded-2xl border border-white/10 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium transition-all duration-300 z-10 ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/80 to-rose-500/80 rounded-lg sm:rounded-xl -z-10 shadow-lg shadow-rose-500/20 animate-in fade-in zoom-in-95 duration-200" />
                )}
                
                <Icon className={`w-3.5 h-3.5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}