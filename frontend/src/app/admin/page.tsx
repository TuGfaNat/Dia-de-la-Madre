'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Product, Category, StoreSettings } from '../../types';
import { AdminLogin } from '../../components/admin/AdminLogin';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminTabs } from '../../components/admin/AdminTabs';
import { AdminMetrics } from '../../components/admin/AdminMetrics';
import { ProductTable } from '../../components/admin/ProductTable';
import { ProductFormModal } from '../../components/admin/ProductFormModal';
import { CategoryManager } from '../../components/admin/CategoryManager';
import { SettingsManager } from '../../components/admin/SettingsManager';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Estados de catálogo & productos
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [seasonFilter, setSeasonFilter] = useState('Todos');

  // Pestaña activa
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'settings'>('products');

  // Categorías
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Settings
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Modales de productos
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Edición rápida inline
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<'stock' | 'price' | 'all' | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('shiro_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'warm');
    }

    checkSession();
  }, []);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('shiro_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'warm');
      localStorage.setItem('shiro_theme', 'warm');
    }
  };

  const checkSession = async () => {
    try {
      const res = await fetch('/api/admin/check');
      if (res.ok) {
        setIsAuthenticated(true);
        fetchProducts();
        fetchCategories();
        fetchSettings();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setIsAuthenticated(true);
        fetchProducts();
        fetchCategories();
        fetchSettings();
        return { success: true };
      }
      return { success: false, error: data.error || 'Contraseña incorrecta' };
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    setIsAuthenticated(false);
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    setSettingsSuccess('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSettingsSuccess('¡Configuraciones y textos de temporada guardados con éxito!');
        setTimeout(() => setSettingsSuccess(''), 4000);
      }
    } catch (e) {
      console.error('Error saving settings:', e);
    } finally {
      setSavingSettings(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      setErrorProducts('');
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) throw new Error('Error al conectar con la base de datos');
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setErrorProducts(err.message || 'Error al cargar productos');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCategoriesList(data);
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleQuickUpdate = async (id: string, field: 'stock' | 'price', value: number) => {
    setSavingId(id);
    setSavingField(field);
    try {
      const prod = products.find((p) => p.id === id);
      if (!prod) return;
      const updated = { ...prod, [field]: value };
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setProducts(products.map((p) => (p.id === id ? updated : p)));
      }
    } catch (e) {
      console.error('Error updating product field:', e);
    } finally {
      setSavingId(null);
      setSavingField(null);
    }
  };

  const handleCreateProduct = async (formData: any) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al crear producto');
    }
    const created = await res.json();
    setProducts([created, ...products]);
  };

  const handleUpdateProduct = async (formData: any) => {
    if (!editingProduct) return;
    const res = await fetch(`/api/products/${editingProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al actualizar producto');
    }
    const updated = await res.json();
    setProducts(products.map((p) => (p.id === editingProduct.id ? updated : p)));
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${name}" del catálogo?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error('Error deleting product:', e);
    }
  };

  const handleAddCategory = async (name: string) => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const created = await res.json();
      setCategoriesList([...categoriesList, created]);
    }
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setCategoriesList(categoriesList.map((c) => (c.id === id ? { ...c, name } : c)));
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la categoría "${name}"?`)) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCategoriesList(categoriesList.filter((c) => c.id !== id));
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-rose-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-rose-bg text-rose-fg flex flex-col font-sans transition-colors duration-300">
      {/* Header Panel */}
      <AdminHeader
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      {/* Contenido Principal */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-grow">
        {/* Pestañas de Navegación */}
        <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* 1. Pestaña de Productos */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <AdminMetrics products={products} />
            <ProductTable
              products={products}
              categoriesList={categoriesList}
              seasonsList={settings?.seasons}
              loadingProducts={loadingProducts}
              errorProducts={errorProducts}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              seasonFilter={seasonFilter}
              setSeasonFilter={setSeasonFilter}
              onRefresh={fetchProducts}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              onOpenEditModal={(prod) => {
                setEditingProduct(prod);
                setIsEditModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              onQuickUpdate={handleQuickUpdate}
              savingId={savingId}
              savingField={savingField}
            />
          </div>
        )}

        {/* 2. Pestaña de Categorías */}
        {activeTab === 'categories' && (
          <CategoryManager
            categoriesList={categoriesList}
            loadingCategories={loadingCategories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {/* 3. Pestaña de Configuración & Temporadas */}
        {activeTab === 'settings' && (
          <SettingsManager
            settings={settings}
            setSettings={setSettings}
            onSave={handleSaveSettings}
            savingSettings={savingSettings}
            settingsSuccess={settingsSuccess}
          />
        )}
      </main>

      {/* Modal Crear Producto */}
      <ProductFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateProduct}
        categoriesList={categoriesList}
        seasonsList={settings?.seasons}
        mode="add"
      />

      {/* Modal Editar Producto */}
      {editingProduct && (
        <ProductFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProduct(null);
          }}
          onSubmit={handleUpdateProduct}
          initialData={editingProduct}
          categoriesList={categoriesList}
          seasonsList={settings?.seasons}
          mode="edit"
        />
      )}
    </div>
  );
}
