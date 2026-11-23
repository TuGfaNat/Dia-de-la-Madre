'use client';

import React from 'react';
import { Gift, MessageCircle } from 'lucide-react';

interface StoreHeroProps {
  heroContent: {
    badge: string;
    title: string;
    highlight: string;
    desc: string;
  };
  whatsappNumber: string;
  storeName: string;
}

export const StoreHero: React.FC<StoreHeroProps> = ({
  heroContent,
  whatsappNumber,
  storeName,
}) => {
  return (
    <section className="relative overflow-hidden py-10 sm:py-16 md:py-20 px-4 text-center">
      {/* Glow ambiental de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] md:w-[650px] h-[300px] sm:h-[500px] md:h-[650px] bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Badge de Temporada */}
        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-card-bg border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-extrabold tracking-wide shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-500">
          <span>{heroContent.badge}</span>
        </div>

        {/* Título Principal */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-txt-primary tracking-tight leading-tight">
          {heroContent.title}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600">
            {heroContent.highlight}
          </span>
        </h1>

        {/* Descripción */}
        <p className="text-xs sm:text-base md:text-lg text-txt-secondary max-w-2xl mx-auto font-medium leading-relaxed px-2">
          {heroContent.desc}
        </p>

        {/* Botones de Acción */}
        <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <a
            href="#catalogo"
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md hover:shadow-rose-300/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Gift className="w-4 h-4" /> Explorar Colección
          </a>

          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`¡Hola ${storeName}! 👋 Me gustaría consultar sobre pedidos personalizados en 3D y regalos de temporada.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 rounded-full bg-card-bg hover:bg-card-border/10 border border-card-border text-txt-primary font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-500" /> Consulta por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};
