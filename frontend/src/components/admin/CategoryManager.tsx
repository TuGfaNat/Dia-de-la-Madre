'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';
import { Category } from '../../types';

interface CategoryManagerProps {
  categoriesList: Category[];
  loadingCategories: boolean;
  onAddCategory: (name: string) => Promise<void>;
  onUpdateCategory: (id: string, name: string) => Promise<void>;
  onDeleteCategory: (id: string, name: string) => Promise<void>;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categoriesList,
  loadingCategories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setAddingCategory(true);
      await onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingCategoryName.trim()) return;
    await onUpdateCategory(id, editingCategoryName.trim());
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  return (
    <div className="space-y-6">
      {/* Formulario Agregar Categoría */}
      <div className="bg-card-bg p-5 sm:p-6 rounded-2xl border border-card-border shadow-xs">
        <h2 className="text-sm sm:text-base font-bold text-txt-primary mb-3">
          ✨ Crear Nueva Categoría
        </h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Ej. Impresión 3D, Cajas de Autor, Arreglos..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-card-border rounded-xl bg-card-bg text-txt-primary focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
          />
          <button
            type="submit"
            disabled={addingCategory}
            className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shrink-0"
          >
            {addingCategory ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>Crear Categoría</span>
          </button>
        </form>
      </div>

      {/* Tabla de Categorías Responsiva */}
      <div className="bg-card-bg rounded-2xl border border-card-border shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-card-border">
          <h2 className="text-sm sm:text-base font-bold text-txt-primary">Categorías Existentes</h2>
          <p className="text-xs text-txt-secondary font-medium">
            Se mostrarán como filtros directos para los clientes en la tienda.
          </p>
        </div>

        {loadingCategories ? (
          <div className="p-20 text-center">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-2" />
            <p className="text-txt-muted text-sm font-bold">Cargando categorías...</p>
          </div>
        ) : categoriesList.length === 0 ? (
          <div className="p-20 text-center text-txt-muted font-bold text-sm">
            No hay categorías registradas.
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[540px] text-left border-collapse">
              <thead>
                <tr className="bg-card-border/5 text-[10px] font-bold uppercase tracking-wider text-txt-muted border-b border-card-border">
                  <th className="py-4 px-6 min-w-[200px]">Nombre de Categoría</th>
                  <th className="py-4 px-6 w-36 whitespace-nowrap">Identificador</th>
                  <th className="py-4 px-6 w-36 text-center whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/30">
                {categoriesList.map((cat) => {
                  const isEditing = editingCategoryId === cat.id;
                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-card-border/5 transition-colors text-xs font-medium text-txt-secondary"
                    >
                      {/* Nombre */}
                      <td className="py-4 px-6">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingCategoryName}
                            onChange={(e) => setEditingCategoryName(e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-card-border rounded-lg bg-card-bg focus:outline-none focus:ring-2 focus:ring-rose-450 text-txt-primary font-bold"
                            autoFocus
                          />
                        ) : (
                          <span className="font-bold text-txt-primary text-sm">{cat.name}</span>
                        )}
                      </td>

                      {/* Identificador slug */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="text-[10px] px-2.5 py-0.5 bg-card-border/10 text-txt-muted rounded font-mono font-bold uppercase">
                          {cat.id}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(cat.id)}
                                className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded transition-colors cursor-pointer"
                                title="Guardar cambios"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCategoryId(null);
                                  setEditingCategoryName('');
                                }}
                                className="p-1.5 text-txt-muted hover:text-rose-500 hover:bg-card-border/10 rounded transition-colors cursor-pointer"
                                title="Cancelar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingCategoryId(cat.id);
                                  setEditingCategoryName(cat.name);
                                }}
                                className="p-1.5 text-txt-muted hover:text-blue-500 hover:bg-card-border/10 rounded transition-colors cursor-pointer"
                                title="Editar nombre"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteCategory(cat.id, cat.name)}
                                className="p-1.5 text-txt-muted hover:text-rose-500 hover:bg-card-border/10 rounded transition-colors cursor-pointer"
                                title="Eliminar categoría"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
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
    </div>
  );
};
