'use client';

import React from 'react';
import { RefreshCw, Search, PlusCircle, Loader2, Edit2, Trash2 } from 'lucide-react';
import { Product, Category, SeasonConfig } from '../../types';
import { getSeasonBadge } from '../../lib/season';

interface ProductTableProps {
  products: Product[];
  categoriesList: Category[];
  seasonsList?: SeasonConfig[];
  loadingProducts: boolean;
  errorProducts: string;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  seasonFilter: string;
  setSeasonFilter: (s: string) => void;
  onRefresh: () => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onDeleteProduct: (id: string, name: string) => void;
  onQuickUpdate: (id: string, field: 'stock' | 'price', value: number) => void;
  savingId: string | null;
  savingField: 'stock' | 'price' | 'all' | null;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  categoriesList,
  seasonsList,
  loadingProducts,
  errorProducts,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  seasonFilter,
  setSeasonFilter,
  onRefresh,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteProduct,
  onQuickUpdate,
  savingId,
  savingField,
}) => {
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todos' || product.category === categoryFilter;
    const matchesSeason = seasonFilter === 'Todos' || (product.season || 'General') === seasonFilter;
    return matchesSearch && matchesCategory && matchesSeason;
  });

  return (
    <div className="bg-card-bg rounded-2xl border border-card-border shadow-xs overflow-hidden">
      {/* Header de Tabla & Filtros Responsivos */}
      <div className="p-4 sm:p-6 border-b border-card-border flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <h2 className="text-sm sm:text-base font-bold text-txt-primary">Inventario de Productos</h2>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg text-txt-muted hover:text-rose-500 hover:bg-card-border/10 transition-colors cursor-pointer"
            title="Actualizar catálogo"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full xl:w-auto">
          {/* Buscador */}
          <div className="relative flex-1 sm:w-56 min-w-[180px]">
            <input
              type="text"
              placeholder="Filtrar inventario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-card-border bg-rose-50/10 text-txt-primary focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <Search className="w-3.5 h-3.5 text-txt-muted absolute left-3 top-2.5" />
          </div>

          {/* Selector de Categorías */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs border border-card-border bg-card-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 text-txt-primary font-bold cursor-pointer"
          >
            <option value="Todos">Todas las Categorías</option>
            {categoriesList.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Selector de Temporadas */}
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs border border-card-border bg-card-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 text-txt-primary font-bold cursor-pointer"
          >
            <option value="Todos">Todas las Temporadas</option>
            {seasonsList && seasonsList.length > 0 ? (
              seasonsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))
            ) : (
              <>
                <option value="Navidad">🎄 Navidad</option>
                <option value="Permanente">✨ Permanente / Todo el Año</option>
                <option value="Día de la Madre">🌸 Día de la Madre</option>
                <option value="San Valentín">💖 San Valentín</option>
              </>
            )}
          </select>

          {/* Botón Agregar */}
          <button
            onClick={onOpenAddModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-rose-100/10 shrink-0 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" /> Agregar Producto
          </button>
        </div>
      </div>

      {/* Contenido Tabla */}
      {loadingProducts ? (
        <div className="p-20 text-center">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-2" />
          <p className="text-txt-muted text-sm font-bold">Cargando inventario...</p>
        </div>
      ) : errorProducts ? (
        <div className="p-16 text-center text-txt-secondary">
          <p className="font-bold mb-2">Ocurrió un error al cargar el catálogo</p>
          <p className="text-xs text-txt-muted mb-4">{errorProducts}</p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-20 text-center text-txt-muted font-bold text-sm">
          No se encontraron productos para esta búsqueda.
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[960px] text-left border-collapse">
            <thead>
              <tr className="bg-card-border/5 text-[10px] font-bold uppercase tracking-wider text-txt-muted border-b border-card-border">
                <th className="py-4 px-6 w-20 min-w-[80px]">Imagen</th>
                <th className="py-4 px-6 min-w-[240px]">Producto</th>
                <th className="py-4 px-6 w-40 min-w-[140px]">Categoría</th>
                <th className="py-4 px-6 w-40 min-w-[140px]">Temporada</th>
                <th className="py-4 px-6 w-36 min-w-[130px]">Precio (Bs.)</th>
                <th className="py-4 px-6 w-32 min-w-[100px]">Stock (U)</th>
                <th className="py-4 px-6 w-28 min-w-[90px] text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/30">
              {filteredProducts.map((product) => {
                const isSaving = savingId === product.id;
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-card-border/5 transition-colors text-xs font-medium text-txt-secondary"
                  >
                    {/* Thumbnail */}
                    <td className="py-3 px-6 whitespace-nowrap">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-rose-50/5 border border-card-border shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    </td>

                    {/* Info */}
                    <td className="py-3 px-6">
                      <div className="font-bold text-txt-primary text-sm">{product.name}</div>
                      <div className="text-xs text-txt-muted font-medium line-clamp-1 max-w-sm mt-0.5">
                        {product.description}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-6 whitespace-nowrap">
                      <span className="inline-block text-[11px] px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-full font-bold uppercase tracking-wider border border-stone-300 dark:border-stone-700 whitespace-nowrap shadow-2xs">
                        {product.category}
                      </span>
                    </td>

                    {/* Season */}
                    <td className="py-3 px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full uppercase tracking-wider border whitespace-nowrap ${
                          getSeasonBadge(product.season).class
                        }`}
                      >
                        {getSeasonBadge(product.season).label}
                      </span>
                    </td>

                    {/* Price Input (Inline) */}
                    <td className="py-3 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-txt-muted text-xs font-bold shrink-0">Bs.</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue={product.price}
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            if (val !== product.price) {
                              onQuickUpdate(product.id, 'price', val);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = parseFloat((e.target as HTMLInputElement).value);
                              onQuickUpdate(product.id, 'price', val);
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className="w-20 px-2 py-1 text-xs border border-card-border rounded-md bg-card-bg focus:outline-none focus:ring-1 focus:ring-rose-400 text-txt-primary font-bold"
                        />
                        {isSaving && savingField === 'price' && (
                          <Loader2 className="w-3.5 h-3.5 text-rose-500 animate-spin shrink-0" />
                        )}
                      </div>
                    </td>

                    {/* Stock Input (Inline) */}
                    <td className="py-3 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          defaultValue={product.stock}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (val !== product.stock) {
                              onQuickUpdate(product.id, 'stock', val);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = parseInt((e.target as HTMLInputElement).value, 10);
                              onQuickUpdate(product.id, 'stock', val);
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className={`w-16 px-2 py-1 text-xs border rounded-md bg-card-bg focus:outline-none focus:ring-1 focus:ring-rose-400 font-bold text-txt-primary ${
                            product.stock <= 3
                              ? 'border-amber-300/60 bg-amber-500/10'
                              : 'border-card-border'
                          }`}
                        />
                        {isSaving && savingField === 'stock' && (
                          <Loader2 className="w-3.5 h-3.5 text-rose-500 animate-spin shrink-0" />
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-6 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {/* Editar Completo */}
                        <button
                          onClick={() => onOpenEditModal(product)}
                          className="p-1.5 text-txt-muted hover:text-blue-500 hover:bg-card-border/10 rounded transition-colors cursor-pointer"
                          title="Editar detalles completos"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Eliminar */}
                        <button
                          onClick={() => onDeleteProduct(product.id, product.name)}
                          className="p-1.5 text-txt-muted hover:text-rose-500 hover:bg-card-border/10 rounded transition-colors cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
