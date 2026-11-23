'use client';

import React, { useState } from 'react';
import { X, Loader2, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { Product, Category, SeasonConfig } from '../../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  initialData?: Product | null;
  categoriesList: Category[];
  seasonsList?: SeasonConfig[];
  mode: 'add' | 'edit';
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categoriesList,
  seasonsList,
  mode,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData ? String(initialData.price) : '',
    stock: initialData ? String(initialData.stock) : '',
    image: initialData?.image || '',
    images: initialData?.images ? [...initialData.images] : [],
    category: initialData?.category || (categoriesList[0]?.name || 'Cajas de Regalo'),
    season: initialData?.season || 'Navidad',
  });

  const [extraImageUrl, setExtraImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddExtraImage = () => {
    if (!extraImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, extraImageUrl.trim()],
    }));
    setExtraImageUrl('');
  };

  const handleRemoveExtraImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.image) {
      setError('Nombre, precio e imagen principal son requeridos.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10) || 0,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div
        className="bg-card-bg border border-card-border rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-card-border pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-txt-primary">
              {mode === 'add' ? '✨ Crear Nuevo Producto' : '✏️ Editar Producto'}
            </h2>
            <p className="text-xs text-txt-secondary font-medium">
              Completa los detalles de fabricación, precios y fotos del regalo.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-txt-muted hover:text-rose-500 hover:bg-card-border/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-txt-secondary">Nombre del Producto *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Litofanía Navideña 3D con Luz Cálida"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
            />
          </div>

          {/* Categoría & Temporada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-txt-secondary">Categoría *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold cursor-pointer"
              >
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-txt-secondary">Temporada / Campaña *</label>
              <select
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold cursor-pointer"
              >
                {seasonsList && seasonsList.length > 0 ? (
                  seasonsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Navidad">🎄 Especial Navidad</option>
                    <option value="Permanente">✨ Permanente / Todo el Año</option>
                    <option value="Día de la Madre">🌸 Día de la Madre</option>
                    <option value="San Valentín">💖 San Valentín</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Precio & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-txt-secondary">Precio (Bs.) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-txt-secondary">Stock Inicial (unidades) *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="10"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-2 focus:ring-rose-400 font-bold"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-txt-secondary">Descripción y Detalles del Regalo</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe dimensiones, material PLA / resina, presentación en caja, dedicatoria..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium resize-none"
            />
          </div>

          {/* Imagen Principal */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-txt-secondary">URL Imagen Principal *</label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/... o /img.jpg"
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
              />
              {formData.image && (
                <div className="w-11 h-11 rounded-xl overflow-hidden border border-card-border shrink-0">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Galería Adicional */}
          <div className="space-y-2 pt-2 border-t border-card-border/50">
            <label className="text-xs font-bold text-txt-secondary flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-amber-500" /> Fotos Adicionales (Galería Carrusel)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={extraImageUrl}
                onChange={(e) => setExtraImageUrl(e.target.value)}
                placeholder="Pegar URL de foto adicional..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
              />
              <button
                type="button"
                onClick={handleAddExtraImage}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar
              </button>
            </div>

            {formData.images.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-14 h-14 rounded-xl overflow-hidden border border-card-border group"
                  >
                    <img src={img} alt="Extra" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveExtraImage(idx)}
                      className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Quitar foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="pt-4 flex justify-end gap-3 border-t border-card-border">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-card-border text-txt-secondary hover:bg-card-border/10 text-xs font-bold cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                </>
              ) : mode === 'add' ? (
                'Publicar Producto'
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
