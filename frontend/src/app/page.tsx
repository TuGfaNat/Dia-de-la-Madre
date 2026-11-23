'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Product, CartItem, StoreSettings, NotificationState } from '../types';
import { getHeroContent } from '../lib/season';
import { StoreNavbar } from '../components/store/StoreNavbar';
import { StoreHero } from '../components/store/StoreHero';
import { StoreFeatures } from '../components/store/StoreFeatures';
import { SeasonSelector } from '../components/store/SeasonSelector';
import { CategoryFilterBar } from '../components/store/CategoryFilterBar';
import { ProductCard } from '../components/store/ProductCard';
import { ProductDetailModal } from '../components/store/ProductDetailModal';
import { CartDrawer } from '../components/store/CartDrawer';
import { StoreFooter } from '../components/store/StoreFooter';
import { NotificationToast } from '../components/common/NotificationToast';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Filtros & Navegación
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedSeason, setSelectedSeason] = useState('Navidad');

  // Carrito & Modales
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const WHATSAPP_NUMBER =
    settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '59175767332';
  const STORE_NAME = settings?.storeName || 'Shiro Neko Lab';
  const TAGLINE = settings?.tagline || 'Impresión 3D, Cajas de Regalo & Bazar Creativo';

  useEffect(() => {
    setMounted(true);

    // Cargar Carrito
    const savedCart = localStorage.getItem('mama_store_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error cargando el carrito:', e);
      }
    }

    // Cargar Tema
    const savedTheme = localStorage.getItem('shiro_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body?.setAttribute('data-theme', 'dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'warm');
      document.body?.setAttribute('data-theme', 'warm');
    }

    fetchProducts();
    fetchCategories();
    fetchSettings();
  }, []);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body?.setAttribute('data-theme', 'dark');
      localStorage.setItem('shiro_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'warm');
      document.body?.setAttribute('data-theme', 'warm');
      localStorage.setItem('shiro_theme', 'warm');
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        if (data.activeSeason) {
          setSelectedSeason(data.activeSeason);
        }
        const savedTheme = localStorage.getItem('shiro_theme');
        if (!savedTheme && data.themeMode) {
          const isDark = data.themeMode === 'dark';
          setIsDarkMode(isDark);
          if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body?.setAttribute('data-theme', 'dark');
          } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'warm');
            document.body?.setAttribute('data-theme', 'warm');
          }
        }
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) throw new Error('Error al conectar con el servidor');
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const names = data.map((c: any) => c.name);
        setCategories(['Todos', ...names]);
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  };

  const saveCartToStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('mama_store_cart', JSON.stringify(newCart));
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const addToCart = (product: Product, quantityToAdd: number = 1) => {
    const existingItem = cart.find((item) => item.id === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (currentQty + quantityToAdd > product.stock) {
      showNotification(`Solo quedan ${product.stock} unidades en stock`, 'error');
      return;
    }

    let newCart: CartItem[];
    if (existingItem) {
      newCart = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: quantityToAdd }];
    }

    saveCartToStorage(newCart);
    showNotification(
      `¡${product.name} (${quantityToAdd} ${quantityToAdd > 1 ? 'unidades' : 'unidad'}) añadido al carrito!`,
      'success'
    );
  };

  const updateQuantity = (productId: string, delta: number) => {
    const item = cart.find((i) => i.id === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > item.stock) {
      showNotification(`Solo quedan ${item.stock} unidades disponibles`, 'error');
      return;
    }

    const newCart = cart.map((i) => (i.id === productId ? { ...i, quantity: newQty } : i));
    saveCartToStorage(newCart);
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter((i) => i.id !== productId);
    saveCartToStorage(newCart);
    showNotification('Producto eliminado del pedido', 'success');
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Filtrado de productos
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    const prodSeason = product.season || 'General';
    const matchesSeason =
      selectedSeason === 'Todos' ||
      prodSeason === selectedSeason ||
      (selectedSeason === 'Permanente' && (prodSeason === 'General' || prodSeason === 'Permanente'));

    return matchesSearch && matchesCategory && matchesSeason;
  });

  const heroContent = getHeroContent(selectedSeason, settings);

  return (
    <div className="min-h-screen bg-rose-bg text-rose-fg flex flex-col font-sans transition-colors duration-300">
      {/* Notificaciones Flotantes */}
      <NotificationToast notification={notification} />

      {/* Barra de Navegación */}
      <StoreNavbar
        storeName={STORE_NAME}
        tagline={TAGLINE}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        cartCount={getCartCount()}
        openCart={() => setIsCartOpen(true)}
        mounted={mounted}
      />

      {/* Hero Dinámico de Temporada */}
      <StoreHero
        heroContent={heroContent}
        whatsappNumber={WHATSAPP_NUMBER}
        storeName={STORE_NAME}
      />

      {/* Selector de Campaña / Temporada */}
      <SeasonSelector
        selectedSeason={selectedSeason}
        setSelectedSeason={setSelectedSeason}
        activeSeasonName={settings?.activeSeason}
        seasons={settings?.seasons}
      />

      {/* 3 Pilares: Impresión 3D + Cajas + Bazar */}
      <StoreFeatures />

      {/* Catálogo Principal */}
      <main id="catalogo" className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Filtros de Categorías */}
        <CategoryFilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          mounted={mounted}
        />

        {/* Grid de Productos */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-card-bg rounded-3xl border border-card-border p-4 space-y-4 shadow-xs animate-pulse"
              >
                <div className="aspect-square bg-card-border/20 rounded-2xl w-full" />
                <div className="h-4 bg-card-border/30 rounded-md w-3/4" />
                <div className="h-4 bg-card-border/20 rounded-md w-1/2" />
                <div className="h-10 bg-card-border/20 rounded-full w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 space-y-4 bg-card-bg rounded-3xl border border-card-border p-8 max-w-lg mx-auto shadow-xs">
            <p className="text-rose-500 font-bold text-base">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-6 py-2.5 rounded-full bg-rose-500 text-white font-bold text-xs shadow-md hover:bg-rose-600 cursor-pointer transition-colors"
            >
              Reintentar carga
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-card-bg rounded-3xl border border-card-border p-8 max-w-md mx-auto shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-txt-primary">No encontramos regalos con ese criterio</h3>
              <p className="text-xs text-txt-secondary">
                Prueba buscando otro término o seleccionando &quot;Todos los Regalos&quot;.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Todos');
                setSelectedSeason('Todos');
              }}
              className="px-5 py-2.5 rounded-full bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors cursor-pointer"
            >
              Ver catálogo completo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cart={cart}
                onSelect={(prod) => setSelectedProduct(prod)}
                onAddToCart={(prod, qty) => addToCart(prod, qty || 1)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de Detalle de Producto */}
      <ProductDetailModal
        product={selectedProduct}
        cart={cart}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(prod, qty) => addToCart(prod, qty)}
      />

      {/* Carrito Lateral (Drawer) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        whatsappNumber={WHATSAPP_NUMBER}
        storeName={STORE_NAME}
      />

      {/* Pie de Página */}
      <StoreFooter />
    </div>
  );
}
