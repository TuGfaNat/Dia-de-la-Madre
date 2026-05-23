'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Plus, 
  Trash2, 
  LogOut, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  PlusCircle, 
  X, 
  Check, 
  Loader2,
  RefreshCw,
  Search,
  ChevronRight,
  Eye,
  Sun,
  Moon
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Estados del catálogo y dashboard
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  // Estado de edición inline y guardado
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<'stock' | 'price' | 'all' | null>(null);

  // Estados del modal de agregar producto
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: '',
    category: 'Flores'
  });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Estados del modal de editar producto completo
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Estados de subida de imágenes
  const [uploadingAddImage, setUploadingAddImage] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  useEffect(() => {
    // Forzar modo oscuro siempre
    document.documentElement.classList.add('dark');

    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/admin/check');
      if (res.ok) {
        setIsAuthenticated(true);
        fetchProducts();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        fetchProducts();
      } else {
        setLoginError(data.error || 'Contraseña incorrecta');
      }
    } catch {
      setLoginError('Error de red al iniciar sesión');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setPassword('');
    } catch {
      alert('Error al cerrar sesión');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Error al cargar productos');
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setErrorProducts(err.message || 'Error de red');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Función para subir imágenes a la base de datos (local o Vercel Blob)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, formType: 'add' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formType === 'add') setUploadingAddImage(true);
    else setUploadingEditImage(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Error al subir imagen');
      const data = await res.json();
      
      if (formType === 'add') {
        setNewProduct(prev => ({ ...prev, image: data.url }));
      } else {
        setEditingProduct(prev => prev ? { ...prev, image: data.url } : null);
      }
    } catch (err) {
      alert('Error al subir la imagen. Intenta de nuevo.');
    } finally {
      if (formType === 'add') setUploadingAddImage(false);
      else setUploadingEditImage(false);
    }
  };

  // Guardar cambios rápidos de Stock y Precio (Inline)
  const handleQuickUpdate = async (productId: string, field: 'stock' | 'price', value: number) => {
    if (value < 0 || isNaN(value)) {
      alert('Por favor introduce un valor numérico válido mayor o igual a 0');
      return;
    }

    setSavingId(productId);
    setSavingField(field);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });

      if (!res.ok) throw new Error('Error al actualizar');
      
      const updated = await res.json();
      
      setProducts(products.map(p => p.id === productId ? updated : p));
    } catch (err) {
      alert('No se pudo guardar la actualización.');
    } finally {
      setSavingId(null);
      setSavingField(null);
    }
  };

  // Crear nuevo producto
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);

    const { name, description, price, stock, image, category } = newProduct;

    if (!name || !description || !price || !stock || !image || !category) {
      setAddError('Por favor completa todos los campos');
      setAddLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          image,
          category
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setProducts([...products, data]);
        setIsAddModalOpen(false);
        setNewProduct({
          name: '',
          description: '',
          price: '',
          stock: '',
          image: '',
          category: 'Flores'
        });
      } else {
        setAddError(data.error || 'Error al guardar el producto');
      }
    } catch {
      setAddError('Error de servidor al guardar');
    } finally {
      setAddLoading(false);
    }
  };

  // Editar producto completo
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setAddLoading(true);
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });

      if (res.ok) {
        const updated = await res.json();
        setProducts(products.map(p => p.id === editingProduct.id ? updated : p));
        setIsEditModalOpen(false);
        setEditingProduct(null);
      } else {
        alert('Error al guardar cambios');
      }
    } catch {
      alert('Error en servidor');
    } finally {
      setAddLoading(false);
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!confirm(`¿Estás seguro que deseas eliminar "${name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProducts(products.filter(p => p.id !== productId));
      } else {
        alert('No se pudo eliminar el producto.');
      }
    } catch {
      alert('Error en servidor al eliminar');
    }
  };

  // Métricas calculadas para el dashboard
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= 3).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

  // Filtrado de productos para la tabla
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todos' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

  // Render de carga de sesión inicial
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-bg text-rose-fg">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-rose-500 animate-spin mx-auto" />
          <p className="text-txt-secondary font-bold">Validando credenciales...</p>
        </div>
      </div>
    );
  }

  // 1. PANTALLA DE LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff2f4] dark:from-[#2a1318] via-rose-bg to-[#fffbfd] dark:to-rose-bg px-4 text-txt-primary transition-colors duration-300">
        <div className="max-w-md w-full bg-card-bg rounded-3xl border border-card-border p-8 elegant-shadow space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-black text-txt-primary">Acceso Administrativo</h2>
            <p className="text-txt-secondary font-medium text-sm">Ingresa la contraseña para gestionar el inventario de Mamá Especial.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-txt-muted mb-2">
                Contraseña Estática (ADMIN_PASSWORD)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-card-border bg-card-bg focus:outline-none focus:ring-2 focus:ring-rose-300 text-txt-primary text-center tracking-widest text-lg font-bold"
              />
            </div>

            {loginError && (
              <p className="text-xs text-rose-650 font-bold text-center bg-rose-500/10 py-2 rounded-lg">
                ❌ {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-rose-100/10"
            >
              {loginLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="text-center flex justify-between items-center px-2 border-t border-card-border pt-4">
            <Link href="/" className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1">
              Ver tienda pública <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            

          </div>
        </div>
      </div>
    );
  }

  // 2. PANEL DE CONTROL (DASHBOARD)
  return (
    <div className="min-h-screen bg-rose-bg text-rose-fg transition-colors duration-300 flex flex-col">
      <header className="sticky top-0 z-40 bg-card-bg border-b border-card-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-card-border shrink-0">
              <img src="/logo.jpg" alt="Shiro Neko Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black uppercase tracking-wider rounded">
                Admin
              </span>
              <h1 className="text-sm md:text-base font-serif font-bold text-txt-primary">Panel - Shiro Neko Lab</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="px-4 py-2 border border-card-border rounded-full text-xs font-bold text-txt-secondary hover:bg-card-border/10 transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" /> Ver Tienda
            </Link>


            
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-full text-txt-muted hover:text-rose-500 hover:bg-card-border/10 transition-colors flex items-center justify-center cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-grow">
        {/* Fila de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card Total Productos */}
          <div className="bg-card-bg p-6 rounded-2xl border border-card-border flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-txt-muted uppercase tracking-wider">Productos Totales</span>
              <span className="text-2xl font-bold text-txt-primary">{totalProducts}</span>
            </div>
          </div>

          {/* Card Bajo Stock */}
          <div className="bg-card-bg p-6 rounded-2xl border border-card-border flex items-center gap-4 shadow-xs">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              lowStockProducts > 0 ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 'bg-card-border/10 text-txt-muted'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-txt-muted uppercase tracking-wider">Bajo Stock (≤ 3)</span>
              <span className="text-2xl font-bold text-txt-primary">{lowStockProducts}</span>
            </div>
          </div>

          {/* Card Valor Inventario */}
          <div className="bg-card-bg p-6 rounded-2xl border border-card-border flex items-center gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-txt-muted uppercase tracking-wider">Valor Inventario</span>
              <span className="text-2xl font-bold text-txt-primary">Bs. {totalInventoryValue.toLocaleString('es-BO')}</span>
            </div>
          </div>
        </div>

        {/* Fila de Acciones de Inventario */}
        <div className="bg-card-bg rounded-2xl border border-card-border shadow-xs overflow-hidden">
          {/* Header de Tabla */}
          <div className="p-6 border-b border-card-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-txt-primary">Inventario de Productos</h2>
              <button 
                onClick={fetchProducts} 
                className="p-1 rounded text-txt-muted hover:text-rose-500 transition-colors cursor-pointer"
                title="Actualizar catálogo"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Buscador */}
              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  placeholder="Filtrar inventario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-full border border-card-border bg-rose-50/10 text-txt-primary focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
                <Search className="w-3.5 h-3.5 text-txt-muted absolute left-3 top-2.5" />
              </div>

              {/* Categorías */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs border border-card-border bg-card-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 text-txt-primary font-bold"
              >
                <option value="Todos">Todas las Categorías</option>
                {Array.from(new Set(products.map(p => p.category))).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Botón Agregar */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-rose-100/10 shrink-0"
              >
                <PlusCircle className="w-4 h-4" /> Agregar Producto
              </button>
            </div>
          </div>

          {/* Tabla de Productos */}
          {loadingProducts ? (
            <div className="p-20 text-center">
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-2" />
              <p className="text-txt-muted text-sm font-bold">Cargando inventario...</p>
            </div>
          ) : errorProducts ? (
            <div className="p-16 text-center text-txt-secondary">
              <p className="font-bold mb-2">Ocurrió un error al cargar catálogo</p>
              <p className="text-xs text-txt-muted mb-4">{errorProducts}</p>
              <button 
                onClick={fetchProducts} 
                className="px-4 py-2 bg-rose-500 hover:bg-rose-650 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-20 text-center text-txt-muted font-bold text-sm">
              No se encontraron productos para esta búsqueda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-card-border/5 text-[10px] font-bold uppercase tracking-wider text-txt-muted border-b border-card-border">
                    <th className="py-4 px-6 w-20">Imagen</th>
                    <th className="py-4 px-6">Producto</th>
                    <th className="py-4 px-6 w-32">Categoría</th>
                    <th className="py-4 px-6 w-36">Precio (Bs.)</th>
                    <th className="py-4 px-6 w-32">Stock (U)</th>
                    <th className="py-4 px-6 w-28 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/30">
                  {filteredProducts.map((product) => {
                    const isSaving = savingId === product.id;
                    return (
                      <tr key={product.id} className="hover:bg-card-border/5 transition-colors text-xs font-medium text-txt-secondary">
                        {/* Thumbnail */}
                        <td className="py-3 px-6">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-rose-50/5 border border-card-border">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                        </td>

                        {/* Info */}
                        <td className="py-3 px-6">
                          <div className="font-bold text-txt-primary text-sm">{product.name}</div>
                          <div className="text-xs text-txt-muted font-medium line-clamp-1 max-w-sm mt-0.5">{product.description}</div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-6">
                          <span className="text-[10px] px-2.5 py-1 bg-card-border/10 text-txt-secondary rounded-full font-bold uppercase tracking-wider border border-card-border/40">
                            {product.category}
                          </span>
                        </td>

                        {/* Price Input (Inline) */}
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-1.5">
                            <span className="text-txt-muted text-xs font-bold">Bs.</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              defaultValue={product.price}
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                if (val !== product.price) {
                                  handleQuickUpdate(product.id, 'price', val);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = parseFloat((e.target as HTMLInputElement).value);
                                  handleQuickUpdate(product.id, 'price', val);
                                  (e.target as HTMLInputElement).blur();
                                }
                              }}
                              className="w-20 px-2 py-1 text-xs border border-card-border rounded-md bg-card-bg focus:outline-none focus:ring-1 focus:ring-rose-400 text-txt-primary font-bold"
                            />
                            {isSaving && savingField === 'price' && (
                              <Loader2 className="w-3.5 h-3.5 text-rose-500 animate-spin" />
                            )}
                          </div>
                        </td>

                        {/* Stock Input (Inline) */}
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              defaultValue={product.stock}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (val !== product.stock) {
                                  handleQuickUpdate(product.id, 'stock', val);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = parseInt((e.target as HTMLInputElement).value, 10);
                                  handleQuickUpdate(product.id, 'stock', val);
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
                              <Loader2 className="w-3.5 h-3.5 text-rose-500 animate-spin" />
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Editar Producto Completo */}
                            <button
                              onClick={() => {
                                setEditingProduct({ ...product });
                                setIsEditModalOpen(true);
                              }}
                              className="p-1.5 text-txt-muted hover:text-blue-500 hover:bg-card-border/10 rounded transition-colors cursor-pointer"
                              title="Editar detalles completos"
                            >
                              <Package className="w-4 h-4" />
                            </button>

                            {/* Eliminar */}
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
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
      </main>

      {/* MODAL: AGREGAR NUEVO PRODUCTO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-card-bg rounded-3xl w-full max-w-xl border border-card-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-card-border/10 border-b border-card-border flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-txt-primary flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-rose-500" />
                Agregar Nuevo Producto
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-txt-muted hover:text-rose-500 hover:bg-card-border/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-txt-muted uppercase mb-1">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Ej: Ramo de Claveles Rosados"
                    className="w-full px-3.5 py-2.5 border border-card-border bg-card-bg rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-450 text-xs text-txt-primary font-medium"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-txt-muted uppercase mb-1">Descripción Emotiva</label>
                  <textarea
                    required
                    rows={3}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Describe los detalles, el amor y la dedicatoria..."
                    className="w-full px-3.5 py-2.5 border border-card-border bg-card-bg rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-450 text-xs text-txt-primary font-medium resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-txt-muted uppercase mb-1">Precio (Bs.)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="Precio"
                    className="w-full px-3.5 py-2.5 border border-card-border bg-card-bg rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-450 text-xs text-txt-primary font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-txt-muted uppercase mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="Cantidad"
                    className="w-full px-3.5 py-2.5 border border-card-border bg-card-bg rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-450 text-xs text-txt-primary font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-txt-muted uppercase mb-1">Categoría</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-card-border bg-card-bg rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-450 text-xs text-txt-primary font-bold"
                  >
                    <option value="Flores">Flores</option>
                    <option value="Joyería">Joyería</option>
                    <option value="Chocolates">Chocolates</option>
                    <option value="Spa">Spa</option>
                    <option value="Regalos">Regalos</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-txt-muted uppercase mb-1">Imagen del Producto (Foto)</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'add')}
                        className="block w-full text-xs text-txt-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-rose-500/10 file:text-rose-500 hover:file:bg-rose-500/20 cursor-pointer"
                      />
                      {uploadingAddImage && (
                        <Loader2 className="w-4 h-4 text-rose-500 animate-spin shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-txt-muted font-bold uppercase shrink-0">o pegar URL:</span>
                      <input
                        type="url"
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="flex-grow px-3 py-1.5 border border-card-border bg-card-bg rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-400 text-xs text-txt-primary font-medium"
                      />
                    </div>
                    
                    {newProduct.image && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-card-border shadow-xs">
                        <img src={newProduct.image} alt="Vista previa" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {addError && (
                <p className="text-xs text-rose-650 font-bold bg-rose-500/10 py-2 rounded-lg text-center">
                  ⚠️ {addError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-card-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 border border-card-border text-txt-secondary hover:bg-card-border/10 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {addLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Registrar Regalo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR DETALLES COMPLETOS */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-card-bg rounded-3xl w-full max-w-xl border border-card-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-card-border/10 border-b border-card-border flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-txt-primary flex items-center gap-2">
                <Package className="w-5 h-5 text-rose-500" />
                Editar Producto
              </h3>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 rounded-full text-txt-muted hover:text-rose-500 hover:bg-card-border/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-txt-muted uppercase mb-1">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-card-border bg-card-bg rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-450 text-xs text-txt-primary font-medium"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-txt-muted uppercase mb-1">Descripción</label>
                  <textarea
                    required
                    rows={3}
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-card-border bg-card-bg rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-450 text-xs text-txt-primary font-medium resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-txt-muted uppercase mb-1">Precio (Bs.)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 border border-card-border bg-card-bg rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-450 text-xs text-txt-primary font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-txt-muted uppercase mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2.5 border border-card-border bg-card-bg rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-450 text-xs text-txt-primary font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-txt-muted uppercase mb-1">Categoría</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-card-border bg-card-bg rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-450 text-xs text-txt-primary font-bold"
                  >
                    <option value="Flores">Flores</option>
                    <option value="Joyería">Joyería</option>
                    <option value="Chocolates">Chocolates</option>
                    <option value="Spa">Spa</option>
                    <option value="Regalos">Regalos</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-txt-muted uppercase mb-1">Imagen del Producto (Foto)</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'edit')}
                        className="block w-full text-xs text-txt-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-rose-500/10 file:text-rose-500 hover:file:bg-rose-500/20 cursor-pointer"
                      />
                      {uploadingEditImage && (
                        <Loader2 className="w-4 h-4 text-rose-500 animate-spin shrink-0" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-txt-muted font-bold uppercase shrink-0">o pegar URL:</span>
                      <input
                        type="url"
                        value={editingProduct.image}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        className="flex-grow px-3 py-1.5 border border-card-border bg-card-bg rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-400 text-xs text-txt-primary font-medium"
                      />
                    </div>
                    
                    {editingProduct.image && (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-card-border shadow-xs">
                        <img src={editingProduct.image} alt="Vista previa" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-card-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2.5 border border-card-border text-txt-secondary hover:bg-card-border/10 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {addLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
