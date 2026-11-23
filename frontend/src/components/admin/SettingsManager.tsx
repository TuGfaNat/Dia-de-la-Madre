'use client';

import React, { useState } from 'react';
import { Sparkles, Sun, Moon, MessageCircle, Check, Loader2, Plus, Trash2, X } from 'lucide-react';
import { StoreSettings, SeasonConfig } from '../../types';

interface SettingsManagerProps {
  settings: StoreSettings | null;
  setSettings: React.Dispatch<React.SetStateAction<StoreSettings | null>>;
  onSave: (e: React.FormEvent) => Promise<void>;
  savingSettings: boolean;
  settingsSuccess: string;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({
  settings,
  setSettings,
  onSave,
  savingSettings,
  settingsSuccess,
}) => {
  const [isAddingSeason, setIsAddingSeason] = useState(false);
  const [newSeason, setNewSeason] = useState({
    name: '',
    label: '',
    badge: '',
    bannerTitle: '',
    bannerHighlight: '',
    bannerSubtitle: '',
  });

  if (!settings) {
    return (
      <div className="p-20 text-center">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-2" />
        <p className="text-txt-muted text-sm font-bold">Cargando configuraciones...</p>
      </div>
    );
  }

  const updateSeasonCopy = (seasonId: string, field: string, val: string) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        seasons: prev.seasons.map((s) => (s.id === seasonId ? { ...s, [field]: val } : s)),
      };
    });
  };

  const handleAddSeason = () => {
    if (!newSeason.name.trim()) return;

    const id = newSeason.name.trim();
    if (settings.seasons.some((s) => s.id.toLowerCase() === id.toLowerCase())) {
      alert('Ya existe una temporada con ese nombre.');
      return;
    }

    const createdSeason: SeasonConfig = {
      id,
      name: newSeason.name.trim(),
      label: newSeason.label.trim() || `✨ ${newSeason.name.trim()}`,
      badge: newSeason.badge.trim() || `✨ Edición ${newSeason.name.trim()} 2026`,
      theme: 'warm_craft',
      bannerTitle:
        newSeason.bannerTitle.trim() || 'Impresiones 3D, Cajas de Autor & Detalles que',
      bannerHighlight: newSeason.bannerHighlight.trim() || 'Iluminan tus Fiestas',
      bannerSubtitle:
        newSeason.bannerSubtitle.trim() ||
        'Descubre nuestra colección especial de temporada personalizada en Shiro Neko Lab.',
    };

    setSettings({
      ...settings,
      seasons: [...settings.seasons, createdSeason],
    });

    setNewSeason({
      name: '',
      label: '',
      badge: '',
      bannerTitle: '',
      bannerHighlight: '',
      bannerSubtitle: '',
    });
    setIsAddingSeason(false);
  };

  const handleDeleteSeason = (seasonId: string) => {
    if (settings.activeSeason === seasonId) {
      alert('No puedes eliminar la temporada que está activa actualmente en la tienda. Cambia primero la temporada activa.');
      return;
    }

    if (settings.seasons.length <= 1) {
      alert('Debe existir al menos una temporada configurada.');
      return;
    }

    if (!window.confirm(`¿Estás seguro de eliminar la temporada "${seasonId}" y todos sus textos asociados?`)) {
      return;
    }

    setSettings({
      ...settings,
      seasons: settings.seasons.filter((s) => s.id !== seasonId),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {settingsSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <Check className="w-5 h-5 shrink-0" />
          <span>{settingsSuccess}</span>
        </div>
      )}

      <form onSubmit={onSave} className="space-y-6 sm:space-y-8">
        {/* TARJETA 1: TEMPORADA ACTIVA & MODO DE COLOR */}
        <div className="bg-card-bg p-5 sm:p-8 rounded-3xl border border-card-border shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-txt-primary">
                Temporada Activa & Estética Visual
              </h2>
              <p className="text-xs text-txt-secondary font-medium">
                Controla qué campaña ve el cliente por defecto y la paleta de colores.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Temporada Activa Dinámica */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-txt-secondary block">
                Campaña Activa en la Tienda *
              </label>
              <select
                value={settings.activeSeason}
                onChange={(e) => setSettings({ ...settings, activeSeason: e.target.value })}
                className="w-full px-4 py-3 text-xs sm:text-sm font-bold rounded-2xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
              >
                {settings.seasons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} {settings.activeSeason === s.id ? '(Activo ahora)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Tema Predeterminado */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-txt-secondary block">
                Tema Predeterminado de la Tienda *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, themeMode: 'warm' })}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    settings.themeMode === 'warm'
                      ? 'border-amber-400 bg-amber-500/10 text-txt-primary shadow-xs'
                      : 'border-card-border bg-card-bg text-txt-muted hover:text-txt-primary'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Modo Cálido</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, themeMode: 'dark' })}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    settings.themeMode === 'dark'
                      ? 'border-amber-400 bg-amber-500/10 text-txt-primary shadow-xs'
                      : 'border-card-border bg-card-bg text-txt-muted hover:text-txt-primary'
                  }`}
                >
                  <Moon className="w-4 h-4 text-amber-400" />
                  <span>Modo Noche</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TARJETA 2: DATOS DE LA MARCA & WHATSAPP */}
        <div className="bg-card-bg p-5 sm:p-8 rounded-3xl border border-card-border shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-txt-primary">
                Información de Marca & WhatsApp
              </h2>
              <p className="text-xs text-txt-secondary font-medium">
                Los clientes enviarán sus carritos a este número para coordinar el pago del 50%.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-txt-secondary">Nombre de la Tienda *</label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-txt-secondary">Eslogan / Subtítulo *</label>
              <input
                type="text"
                required
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
              />
            </div>

            <div className="space-y-1 sm:col-span-3">
              <label className="text-xs font-bold text-txt-secondary">
                Número de WhatsApp para Pedidos (con código de país) *
              </label>
              <input
                type="text"
                required
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="59175767332"
                className="w-full sm:w-1/2 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold font-mono"
              />
            </div>
          </div>
        </div>

        {/* TARJETA 3: TEMPORADAS & COPIES DE PORTADA */}
        <div className="bg-card-bg p-5 sm:p-8 rounded-3xl border border-card-border shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-txt-primary">
                Textos de Portada por Temporada
              </h2>
              <p className="text-xs text-txt-secondary font-medium">
                Personaliza los títulos y campañas, o crea una nueva temporada según las fechas festivas.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingSeason(!isAddingSeason)}
              className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Nueva Temporada</span>
            </button>
          </div>

          {/* Formulario Expandible para Agregar Temporada */}
          {isAddingSeason && (
            <div className="p-5 rounded-2xl bg-card-border/10 border-2 border-dashed border-rose-400/60 space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Crear Nueva Temporada o Campaña
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingSeason(false)}
                  className="p-1 rounded-full text-txt-muted hover:text-txt-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-txt-secondary">
                    Nombre / Identificador *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSeason.name}
                    onChange={(e) => setNewSeason({ ...newSeason, name: e.target.value })}
                    placeholder="Ej. Halloween, Día del Padre"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-card-border bg-card-bg text-txt-primary font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-txt-secondary">
                    Etiqueta Menú (con Emoji) *
                  </label>
                  <input
                    type="text"
                    value={newSeason.label}
                    onChange={(e) => setNewSeason({ ...newSeason, label: e.target.value })}
                    placeholder="Ej. 🎃 Especial Halloween"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-card-border bg-card-bg text-txt-primary font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-txt-secondary">
                    Insignia del Hero
                  </label>
                  <input
                    type="text"
                    value={newSeason.badge}
                    onChange={(e) => setNewSeason({ ...newSeason, badge: e.target.value })}
                    placeholder="Ej. 🎃 Edición Halloween 2026"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-card-border bg-card-bg text-txt-primary font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-txt-secondary">Título Principal del Hero</label>
                  <input
                    type="text"
                    value={newSeason.bannerTitle}
                    onChange={(e) => setNewSeason({ ...newSeason, bannerTitle: e.target.value })}
                    placeholder="Ej. Diseños 3D de Terror & Cajas que"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-card-border bg-card-bg text-txt-primary font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-txt-secondary">Frase con Color Destacado</label>
                  <input
                    type="text"
                    value={newSeason.bannerHighlight}
                    onChange={(e) => setNewSeason({ ...newSeason, bannerHighlight: e.target.value })}
                    placeholder="Ej. Sorprenden a Todos"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-card-border bg-card-bg text-txt-primary font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-txt-secondary">Descripción del Hero</label>
                <textarea
                  rows={2}
                  value={newSeason.bannerSubtitle}
                  onChange={(e) => setNewSeason({ ...newSeason, bannerSubtitle: e.target.value })}
                  placeholder="Ej. Figuras articuladas, lámparas de calabaza en 3D y regalos temáticos personalizados."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-card-border bg-card-bg text-txt-primary font-medium resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSeason(false)}
                  className="px-4 py-2 rounded-xl border border-card-border text-txt-secondary text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddSeason}
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-sm"
                >
                  Agregar a la Lista
                </button>
              </div>
            </div>
          )}

          {/* Lista de Temporadas Existentes */}
          <div className="space-y-6 divide-y divide-card-border/40">
            {settings.seasons.map((season) => (
              <div key={season.id} className="pt-6 first:pt-0 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-txt-primary flex items-center gap-2">
                    <span>{season.badge}</span>
                    <span className="text-xs text-txt-muted uppercase font-mono">({season.id})</span>
                    {settings.activeSeason === season.id && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                        Activa
                      </span>
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeleteSeason(season.id)}
                    className="p-1.5 text-txt-muted hover:text-rose-500 hover:bg-card-border/10 rounded-lg transition-colors cursor-pointer"
                    title={`Eliminar temporada "${season.name}"`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-txt-secondary">Título Principal</label>
                    <input
                      type="text"
                      value={season.bannerTitle}
                      onChange={(e) => updateSeasonCopy(season.id, 'bannerTitle', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-card-border bg-card-bg text-txt-primary font-medium focus:outline-none focus:ring-1 focus:ring-rose-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-txt-secondary">Frase con Color Destacado</label>
                    <input
                      type="text"
                      value={season.bannerHighlight}
                      onChange={(e) => updateSeasonCopy(season.id, 'bannerHighlight', e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-card-border bg-card-bg text-txt-primary font-bold focus:outline-none focus:ring-1 focus:ring-rose-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-txt-secondary">Descripción del Hero</label>
                  <textarea
                    rows={2}
                    value={season.bannerSubtitle}
                    onChange={(e) => updateSeasonCopy(season.id, 'bannerSubtitle', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-card-border bg-card-bg text-txt-primary font-medium focus:outline-none focus:ring-1 focus:ring-rose-400 resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón Guardar Flotante / Sticky */}
        <div className="sticky bottom-4 z-20 flex justify-end">
          <button
            type="submit"
            disabled={savingSettings}
            className="px-8 py-3.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
          >
            {savingSettings ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> Guardar Toda la Configuración
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
