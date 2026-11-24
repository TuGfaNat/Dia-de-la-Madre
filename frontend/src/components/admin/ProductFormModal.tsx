'use client';

import React, { useState, useRef } from 'react';
import { X, Loader2, Plus, Trash2, Image as ImageIcon, Upload, Palette, Check } from 'lucide-react';
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

  const [colorsText, setColorsText] = useState(
    initialData?.colors && initialData.colors.length > 0 ? initialData.colors.join(', ') : ''
  );
  const [extraImageUrl, setExtraImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const [error, setError] = useState('');

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const extraFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const uploadFile = async (file: File): Promise<string> => {
    const body = new FormData();
    body.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body,
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'Error al subir la imagen');
    }
    const data = await res.json();
    return data.url;
  };

  const handleMainFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingMain(true);
      setError('');
      const url = await uploadFile(file);
      setFormData((prev) => ({ ...prev, image: url }));
    } catch (err: any) {
      setError(err.message || 'Error al subir la imagen principal');
    } finally {
      setUploadingMain(false);
    }
  };

  const handleExtraFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingExtra(true);
      setError('');
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i]);
        newUrls.push(url);
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newUrls],
      }));
    } catch (err: any) {
      setError(err.message || 'Error al subir las imágenes adicionales');
    } finally {
      setUploadingExtra(false);
    }
  };

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

    const colors = colorsText
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    try {
      setLoading(true);
      setError('');
      await onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10) || 0,
        colors,
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
              Completa los detalles de fabricación, precios, fotos y acabados.
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

          {/* Opciones de Colores / Acabados (3D o artesanías) */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-card-border/5 border border-card-border/60">
            <label className="text-xs font-bold text-txt-secondary flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-rose-500" />
              <span>Colores / Acabados disponibles (Opcional, separados por comas):</span>
            </label>
            <input
              type="text"
              value={colorsText}
              onChange={(e) => setColorsText(e.target.value)}
              placeholder="Ej. Blanco Hueso, Seda Dorado, Negro Mate, Rosa Pastel"
              className="w-full px-3 py-2 text-xs rounded-xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-1 focus:ring-rose-400 font-medium"
            />
            {colorsText.trim() && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {colorsText
                  .split(',')
                  .map((c) => c.trim())
                  .filter(Boolean)
                  .map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-500/20"
                    >
                      {c}
                    </span>
                  ))}
              </div>
            )}
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

          {/* Imagen Principal: Drag & Drop + URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-txt-secondary flex items-center justify-between">
              <span>Imagen Principal *</span>
              <span className="text-[10px] text-txt-muted font-normal">Puedes subir archivo o pegar URL</span>
            </label>

            {/* Zona de subida Drag & Drop */}
            <div
              onClick={() => mainFileInputRef.current?.click()}
              className="border-2 border-dashed border-card-border hover:border-rose-400 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-card-border/5 hover:bg-card-border/10 flex flex-col items-center justify-center gap-1.5 group"
            >
              <input
                ref={mainFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleMainFileChange}
                className="hidden"
              />
              {uploadingMain ? (
                <div className="flex items-center gap-2 text-rose-500 font-bold text-xs py-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Subiendo imagen...
                </div>
              ) : formData.image ? (
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-card-border shrink-0 shadow-xs">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-txt-primary group-hover:text-rose-500 transition-colors flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Imagen cargada
                    </p>
                    <p className="text-[10px] text-txt-muted">Haz clic para cambiar la foto</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-txt-primary group-hover:text-rose-500 transition-colors">
                    Haz clic aquí para seleccionar o arrastra una foto
                  </p>
                  <p className="text-[10px] text-txt-muted">Formatos JPG, PNG, WEBP (hasta 10MB)</p>
                </>
              )}
            </div>

            {/* Input URL alternativo */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                required
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="O pega una URL: https://..."
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-1 focus:ring-rose-400 font-medium"
              />
            </div>
          </div>

          {/* Galería Adicional (Fotos extras para el carrusel y zoom) */}
          <div className="space-y-2 pt-3 border-t border-card-border/50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-txt-secondary flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-500" /> Fotos Adicionales (Galería Carrusel)
              </label>
              <button
                type="button"
                onClick={() => extraFileInputRef.current?.click()}
                disabled={uploadingExtra}
                className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {uploadingExtra ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Upload className="w-3 h-3" />
                )}
                <span>Subir fotos de tu equipo</span>
              </button>
              <input
                ref={extraFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleExtraFilesChange}
                className="hidden"
              />
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={extraImageUrl}
                onChange={(e) => setExtraImageUrl(e.target.value)}
                placeholder="O pegar URL de foto adicional..."
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

          {/* Botones de acción */}
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
              disabled={loading || uploadingMain || uploadingExtra}
              className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5 disabled:opacity-50"
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
