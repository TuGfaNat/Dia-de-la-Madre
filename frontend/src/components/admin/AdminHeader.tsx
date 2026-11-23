'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, LogOut, Sun, Moon } from 'lucide-react';

interface AdminHeaderProps {
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onLogout,
  isDarkMode,
  toggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-card-bg border-b border-card-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-card-border shrink-0 shadow-sm">
            <img src="/logo.jpg" alt="Shiro Neko Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider rounded shrink-0">
              Admin
            </span>
            <h1 className="text-xs sm:text-sm md:text-base font-bold text-txt-primary truncate">
              Panel - Shiro Neko Lab
            </h1>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Toggle Modo Oscuro */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-full border border-card-border bg-card-bg text-txt-secondary hover:text-amber-500 hover:border-amber-400 transition-colors cursor-pointer shadow-2xs"
            title={isDarkMode ? "Cambiar a Modo Cálido" : "Cambiar a Modo Noche"}
            aria-label="Cambiar tema"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-txt-secondary" />}
          </button>

          {/* Ver Tienda */}
          <Link
            href="/"
            className="px-3 sm:px-4 py-2 border border-card-border rounded-full text-xs font-bold text-txt-secondary hover:bg-card-border/10 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Eye className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">Ver Tienda</span>
          </Link>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-2 sm:p-2.5 rounded-full text-txt-muted hover:text-rose-500 hover:bg-card-border/10 transition-colors flex items-center justify-center cursor-pointer"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
