'use client';

import React from 'react';
import { Sparkles, Gift, Heart } from 'lucide-react';

export const StoreFeatures: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Pilar 1: Impresión 3D */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card-bg border border-card-border shadow-xs hover:border-amber-400/50 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-lg">
              🖨️
            </div>
            <h3 className="text-base sm:text-lg font-bold text-txt-primary">Impresión 3D de Precisión</h3>
            <p className="text-xs sm:text-sm text-txt-secondary leading-relaxed font-medium">
              Litofanías iluminadas con tus recuerdos, figuras articuladas, macetas geométricas y cortadores temáticos con alta resolución.
            </p>
          </div>
          <span className="mt-4 text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Fabricación a Medida
          </span>
        </div>

        {/* Pilar 2: Cajas de Autor */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card-bg border border-card-border shadow-xs hover:border-rose-400/50 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-lg">
              🎁
            </div>
            <h3 className="text-base sm:text-lg font-bold text-txt-primary">Cajas de Regalo Personalizadas</h3>
            <p className="text-xs sm:text-sm text-txt-secondary leading-relaxed font-medium">
              Embalaje artesanal premium con lazo de tela, viruta protectora, dedicatoria sellada y detalles listos para entregar y emocionar.
            </p>
          </div>
          <span className="mt-4 text-[11px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <Gift className="w-3.5 h-3.5" /> Presentación Lista para Regalar
          </span>
        </div>

        {/* Pilar 3: Arreglos & Bazar */}
        <div className="p-5 sm:p-6 rounded-3xl bg-card-bg border border-card-border shadow-xs hover:border-pink-400/50 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold text-lg">
              💐
            </div>
            <h3 className="text-base sm:text-lg font-bold text-txt-primary">Arreglos & Bazar Creativo</h3>
            <p className="text-xs sm:text-sm text-txt-secondary leading-relaxed font-medium">
              Combinaciones armoniosas de flores eternas, papelería fina, tazas y accesorios de temporada que convierten cualquier momento en un recuerdo inolvidable.
            </p>
          </div>
          <span className="mt-4 text-[11px] font-extrabold text-pink-600 dark:text-pink-400 uppercase tracking-wider flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" /> Detalles con Amor
          </span>
        </div>
      </div>
    </section>
  );
};
