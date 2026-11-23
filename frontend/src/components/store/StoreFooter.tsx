'use client';

import React from 'react';
import Link from 'next/link';
import { Settings, Users, MessageCircle } from 'lucide-react';

export const StoreFooter: React.FC = () => {
  return (
    <footer className="bg-card-border/10 text-txt-secondary py-12 border-t border-card-border mt-16 sm:mt-24 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Banner Invitación al Club / Comunidad */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card-bg border border-card-border shadow-xs max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-txt-primary">
                📢 ¡Únete a nuestro Club de Novedades!
              </h3>
              <p className="text-xs text-txt-secondary font-medium mt-0.5 max-w-md">
                Entérate de las nuevas colecciones en 3D, regalos exclusivos de temporada y promociones directas en WhatsApp.
              </p>
            </div>
          </div>

          <a
            href="https://chat.whatsapp.com/BTVNKDqgsFgAiuxTtb8clI"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold rounded-full text-xs tracking-wide transition-all shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Unirse al Grupo</span>
          </a>
        </div>

        {/* Marca & Logo */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-card-border shadow-sm">
            <img src="/logo.jpg" alt="Shiro Neko Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-txt-primary font-bold text-lg">
            <a
              href="https://www.instagram.com/shiro_neko_lab/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-500 hover:text-rose-600 hover:underline transition-colors"
            >
              Shiro Neko Lab
            </a>{' '}
            &{' '}
            <a
              href="https://www.instagram.com/tugfanat/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-500 hover:text-rose-600 hover:underline transition-colors"
            >
              TuGfaNat
            </a>
          </span>
          <p className="text-xs sm:text-sm font-medium text-txt-secondary max-w-md mx-auto leading-relaxed">
            Impresiones 3D personalizadas, cajas sorpresa de autor y detalles inolvidables hechos con dedicación y calidez.
          </p>
        </div>

        {/* Redes Sociales */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] text-txt-muted uppercase tracking-widest font-bold">
              Shiro Neko Lab
            </span>
            <div className="flex gap-2.5">
              <a
                href="https://www.instagram.com/shiro_neko_lab/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-card-border/20 text-rose-500 hover:text-white hover:bg-rose-500 transition-all duration-300 shadow-xs flex items-center justify-center"
                aria-label="Instagram de Shiro Neko Lab"
                title="Instagram Shiro Neko Lab"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@shiro.neko.lab"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-card-border/20 text-rose-500 hover:text-white hover:bg-rose-500 transition-all duration-300 shadow-xs flex items-center justify-center"
                aria-label="TikTok de Shiro Neko Lab"
                title="TikTok Shiro Neko Lab"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.94-1.78-.22-.22-.41-.47-.59-.73v5.02c.01 2.44-.94 4.85-2.77 6.49-1.92 1.8-4.72 2.45-7.22 1.78-2.61-.71-4.73-2.9-5.27-5.56-.69-3.17 1.03-6.66 4.09-7.79.82-.31 1.7-.44 2.57-.45v4.07c-1.07.03-2.18.52-2.77 1.45-.73 1.07-.63 2.64.29 3.56.91.95 2.45 1.09 3.52.32.74-.5 1.16-1.37 1.16-2.26V.02z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-[1px] bg-card-border"></div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] text-txt-muted uppercase tracking-widest font-bold">
              TuGfaNat
            </span>
            <div className="flex gap-2.5">
              <a
                href="https://www.instagram.com/tugfanat/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-card-border/20 text-rose-500 hover:text-white hover:bg-rose-500 transition-all duration-300 shadow-xs flex items-center justify-center"
                aria-label="Instagram de TuGfaNat"
                title="Instagram TuGfaNat"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@tugfanat"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-card-border/20 text-rose-500 hover:text-white hover:bg-rose-500 transition-all duration-300 shadow-xs flex items-center justify-center"
                aria-label="TikTok de TuGfaNat"
                title="TikTok TuGfaNat"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.94-1.78-.22-.22-.41-.47-.59-.73v5.02c.01 2.44-.94 4.85-2.77 6.49-1.92 1.8-4.72 2.45-7.22 1.78-2.61-.71-4.73-2.9-5.27-5.56-.69-3.17 1.03-6.66 4.09-7.79.82-.31 1.7-.44 2.57-.45v4.07c-1.07.03-2.18.52-2.77 1.45-.73 1.07-.63 2.64.29 3.56.91.95 2.45 1.09 3.52.32.74-.5 1.16-1.37 1.16-2.26V.02z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Separador y Copyright con link a Admin */}
        <div className="h-[1px] bg-card-border w-24 mx-auto"></div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-txt-muted">
          <p>
            © 2026 Shiro Neko Lab & TuGfaNat. Todos los derechos reservados.
          </p>
          <span className="hidden sm:inline">•</span>
          <Link
            href="/admin"
            className="text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Acceso Administración</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};
