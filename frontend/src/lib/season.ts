import { SeasonConfig, StoreSettings } from '../types';

export const DEFAULT_SEASONS_LIST = [
  { id: 'Navidad', label: '🎄 Especial Navidad', short: 'Navidad' },
  { id: 'Permanente', label: '✨ Bazar & 3D', short: 'Permanente' },
  { id: 'San Valentín', label: '💖 San Valentín', short: 'San Valentín' },
  { id: 'Día de la Madre', label: '🌸 Día de la Madre', short: 'Día de la Madre' },
  { id: 'Todos', label: '🐾 Catálogo Completo', short: 'Todas' },
];

export const getSeasonBadge = (season?: string) => {
  switch (season) {
    case 'Navidad':
      return { 
        label: '🎄 Navidad', 
        class: 'bg-emerald-100/90 text-emerald-900 border-emerald-300 font-extrabold dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-500/50 shadow-2xs' 
      };
    case 'Día de la Madre':
      return { 
        label: '🌸 Mamá', 
        class: 'bg-rose-100/90 text-rose-900 border-rose-300 font-extrabold dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-500/50 shadow-2xs' 
      };
    case 'San Valentín':
      return { 
        label: '💖 San Valentín', 
        class: 'bg-pink-100/90 text-pink-900 border-pink-300 font-extrabold dark:bg-pink-950/70 dark:text-pink-300 dark:border-pink-500/50 shadow-2xs' 
      };
    case 'Halloween':
      return { 
        label: '🎃 Halloween', 
        class: 'bg-orange-100/90 text-orange-950 border-orange-300 font-extrabold dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-500/50 shadow-2xs' 
      };
    case 'Día del Padre':
      return { 
        label: '👔 Papá', 
        class: 'bg-blue-100/90 text-blue-950 border-blue-300 font-extrabold dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-500/50 shadow-2xs' 
      };
    case 'Graduaciones':
      return { 
        label: '🎓 Graduación', 
        class: 'bg-indigo-100/90 text-indigo-950 border-indigo-300 font-extrabold dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-500/50 shadow-2xs' 
      };
    case 'Permanente':
    case 'General':
    default:
      return { 
        label: season && season !== 'General' && season !== 'Permanente' ? `✨ ${season}` : '✨ Todo el Año', 
        class: 'bg-amber-100/90 text-amber-950 border-amber-300 font-extrabold dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-500/50 shadow-2xs' 
      };
  }
};

export const getHeroContent = (selectedSeason: string, settings: StoreSettings | null) => {
  if (settings && settings.seasons) {
    const found = settings.seasons.find(s => s.id === selectedSeason || s.name === selectedSeason);
    if (found) {
      return {
        badge: found.badge || `✨ Edición ${found.name}`,
        title: found.bannerTitle || 'Detalles Únicos, Impresiones 3D & Creaciones que',
        highlight: found.bannerHighlight || 'Inspiran Momentos',
        desc: found.bannerSubtitle || 'Descubre regalos y figuras personalizadas elaboradas con amor en Shiro Neko Lab.',
      };
    }
  }

  switch (selectedSeason) {
    case 'Navidad':
      return {
        badge: '🎄 Edición Navideña & 3D 2026',
        title: 'Magia, Impresiones 3D & Detalles Navideños que',
        highlight: 'Iluminan Corazones',
        desc: 'Figuras y adornos en 3D, cajas navideñas artesanales personalizadas y detalles únicos de Shiro Neko Lab para estas fiestas.',
      };
    case 'Día de la Madre':
      return {
        badge: '🌸 Edición Especial Mamá',
        title: 'Celebra a Mamá con Detalles que',
        highlight: 'Perduran en el Corazón',
        desc: 'Ramos con detalles en 3D, sombrereras y cajas de regalo pensadas para consentir a la reina del hogar.',
      };
    case 'San Valentín':
      return {
        badge: '💖 Colección Amor & Amistad',
        title: 'Sorprende a esa Persona Especial con',
        highlight: 'Detalles Únicos en 3D',
        desc: 'Cajas sorpresa, litofanías con fotos iluminadas y arreglos personalizados para celebrar el amor y la amistad.',
      };
    case 'Permanente':
    default:
      return {
        badge: '🐾 Shiro Neko Lab • Bazar Creativo & 3D',
        title: 'Impresiones 3D, Cajas Personalizadas &',
        highlight: 'Creaciones de Autor',
        desc: 'Litofanías, figuras coleccionables, macetas geométricas, papelería y detalles a medida hechos con amor.',
      };
  }
};
