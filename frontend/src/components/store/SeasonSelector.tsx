'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { SeasonConfig } from '../../types';
import { DEFAULT_SEASONS_LIST } from '../../lib/season';

interface SeasonSelectorProps {
  selectedSeason: string;
  setSelectedSeason: (season: string) => void;
  activeSeasonName?: string;
  seasons?: SeasonConfig[];
}

export const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  selectedSeason,
  setSelectedSeason,
  activeSeasonName = 'Navidad',
  seasons,
}) => {
  const displayList = seasons && seasons.length > 0
    ? [...seasons.map((s) => ({ id: s.id, label: s.label })), { id: 'Todos', label: '🐾 Catálogo Completo' }]
    : DEFAULT_SEASONS_LIST;

  const getActiveBadgeColor = (id: string) => {
    switch (id) {
      case 'Navidad':
        return 'bg-emerald-600 text-white shadow-emerald-600/30';
      case 'San Valentín':
        return 'bg-pink-600 text-white shadow-pink-600/30';
      case 'Día de la Madre':
        return 'bg-rose-600 text-white shadow-rose-600/30';
      case 'Halloween':
        return 'bg-orange-600 text-white shadow-orange-600/30';
      case 'Día del Padre':
        return 'bg-blue-600 text-white shadow-blue-600/30';
      case 'Graduaciones':
        return 'bg-indigo-600 text-white shadow-indigo-600/30';
      case 'Permanente':
        return 'bg-amber-600 text-white shadow-amber-600/30';
      default:
        return 'bg-teal-700 text-white shadow-teal-700/30';
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 w-full">
      <div className="bg-card-bg border border-card-border rounded-3xl p-5 sm:p-6 shadow-xs transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-txt-muted flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Colecciones por Temporada
            </span>
            <p className="text-xs text-txt-secondary font-medium mt-0.5">
              Elige la campaña activa o explora nuestro catálogo completo:
            </p>
          </div>
          {activeSeasonName && (
            <span className="self-start sm:self-auto text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
              <span>✨</span> Campaña Principal: {activeSeasonName}
            </span>
          )}
        </div>

        {/* Scroll horizontal fluido en móviles */}
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {displayList.map((season) => {
            const isActive = selectedSeason === season.id;
            const activeColor = getActiveBadgeColor(season.id);

            return (
              <button
                key={season.id}
                onClick={() => setSelectedSeason(season.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? `${activeColor} shadow-md scale-[1.02]`
                    : 'bg-card-border/10 text-txt-secondary hover:text-txt-primary hover:bg-card-border/20 border border-card-border/40'
                }`}
              >
                <span>{season.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
