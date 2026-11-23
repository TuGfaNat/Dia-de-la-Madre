'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Sun, Moon, ShoppingBag, Settings, X } from 'lucide-react';

interface StoreNavbarProps {
  storeName: string;
  tagline: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  cartCount: number;
  openCart: () => void;
  mounted: boolean;
}

export const StoreNavbar: React.FC<StoreNavbarProps> = ({
  storeName,
  tagline,
  searchTerm,
  setSearchTerm,
  isDarkMode,
  toggleTheme,
  cartCount,
  openCart,
  mounted,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-card-bg/90 backdrop-blur-md border-b border-card-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-amber-500/30 shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <img src="/logo.jpg" alt={storeName} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <span className="text-base sm:text-lg md:text-xl font-bold text-txt-primary tracking-tight truncate block group-hover:text-amber-500 transition-colors">
              {storeName}
            </span>
            <span className="block text-[10px] text-txt-muted uppercase tracking-wider font-extrabold truncate max-w-[200px] sm:max-w-none">
              {tagline}
            </span>
          </div>
        </Link>

        {/* Desktop Search */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <input
            type="text"
            placeholder="Buscar figuras 3D, cajas, flores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-full bg-card-border/10 border border-card-border focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-card-bg transition-all text-txt-primary placeholder-txt-muted font-medium"
          />
          <Search className="w-4 h-4 text-amber-500 absolute left-3 top-2.5" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-txt-muted hover:text-txt-primary p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Actions Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="p-2 sm:p-2.5 rounded-full border border-card-border bg-card-bg text-txt-secondary hover:text-amber-500 md:hidden transition-colors cursor-pointer"
            aria-label="Abrir buscador"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Toggle (Warm / Night) */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-full border border-card-border bg-card-bg text-txt-secondary hover:text-amber-500 hover:border-amber-400 transition-colors cursor-pointer shadow-xs"
            title={isDarkMode ? "Cambiar a Modo Cálido Amigable" : "Cambiar a Modo Noche Acogedor"}
            aria-label="Cambiar tema"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-txt-secondary" />}
          </button>

          {/* Admin shortcut */}
          <Link
            href="/admin"
            className="p-2 sm:p-2.5 rounded-full border border-card-border bg-card-bg text-txt-secondary hover:text-amber-500 hover:border-amber-400 transition-colors shadow-xs"
            title="Panel de Administración"
            aria-label="Panel de Administración"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="relative p-2 sm:p-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-all duration-300 flex items-center justify-center cursor-pointer shadow-md hover:shadow-rose-400/30"
            aria-label="Ver carrito"
          >
            <ShoppingBag className="w-4 h-4" />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-stone-900 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Expandable Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-3 border-t border-card-border/50 pt-2 animate-in slide-in-from-top-2 duration-200">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar figuras 3D, cajas, flores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-8 py-2 text-xs rounded-full bg-card-border/10 border border-card-border focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-card-bg transition-all text-txt-primary placeholder-txt-muted font-medium"
            />
            <Search className="w-4 h-4 text-amber-500 absolute left-3 top-2.5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-txt-muted hover:text-txt-primary p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
