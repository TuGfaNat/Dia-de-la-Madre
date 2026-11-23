'use client';

import React from 'react';
import { Package, Grid, Sparkles } from 'lucide-react';

interface AdminTabsProps {
  activeTab: 'products' | 'categories' | 'settings';
  setActiveTab: (tab: 'products' | 'categories' | 'settings') => void;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex gap-2 border-b border-card-border pb-2 overflow-x-auto scrollbar-none">
      <button
        onClick={() => setActiveTab('products')}
        className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
          activeTab === 'products'
            ? 'bg-rose-500 text-white shadow-md'
            : 'bg-card-bg text-txt-secondary border border-card-border hover:border-rose-450 hover:text-rose-500'
        }`}
      >
        <Package className="w-4 h-4" /> Productos
      </button>

      <button
        onClick={() => setActiveTab('categories')}
        className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
          activeTab === 'categories'
            ? 'bg-rose-500 text-white shadow-md'
            : 'bg-card-bg text-txt-secondary border border-card-border hover:border-rose-450 hover:text-rose-500'
        }`}
      >
        <Grid className="w-4 h-4" /> Categorías
      </button>

      <button
        onClick={() => setActiveTab('settings')}
        className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
          activeTab === 'settings'
            ? 'bg-rose-500 text-white shadow-md'
            : 'bg-card-bg text-txt-secondary border border-card-border hover:border-rose-450 hover:text-rose-500'
        }`}
      >
        <Sparkles className="w-4 h-4" /> Configuración & Temporadas
      </button>
    </div>
  );
};
