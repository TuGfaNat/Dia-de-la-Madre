'use client';

import React from 'react';
import { Gift } from 'lucide-react';

interface CategoryFilterBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  mounted: boolean;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  mounted,
}) => {
  return (
    <div className="flex items-center justify-start sm:justify-center gap-2 mb-8 sm:mb-10 overflow-x-auto pb-3 pt-1 px-1 scrollbar-none">
      {mounted && categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold tracking-wide transition-all shrink-0 cursor-pointer ${
            selectedCategory === category
              ? 'bg-rose-500 text-white shadow-md shadow-rose-300/30'
              : 'bg-card-bg text-txt-secondary border border-card-border hover:border-rose-400 hover:text-rose-500 shadow-2xs'
          }`}
        >
          {category === 'Todos' ? (
            <span className="flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5" /> Todos los Regalos
            </span>
          ) : (
            category
          )}
        </button>
      ))}
    </div>
  );
};
