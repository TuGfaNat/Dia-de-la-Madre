'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  Heart, 
  MessageCircle, 
  Search,
  Sparkles,
  Gift,
  Check,
  AlertCircle,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Users
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  images?: string[];
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Estado para las imágenes activas en los carruseles (id_producto -> indice_activo)
  const [activeImageIndexes, setActiveImageIndexes] = useState<Record<string, number>>({});

  // Estado para el modal de detalles de producto
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailsActiveImageIndex, setDetailsActiveImageIndex] = useState<number>(0);

  const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '59175767332';

  // Evitar problemas de hidratación de Next.js al usar localStorage y configurar tema
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

    // Forzar modo oscuro siempre
    document.documentElement.classList.add('dark');

    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
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
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        const names = data.map((c: any) => c.name);
        setCategories(['Todos', ...names]);
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  };

  // Ayudantes de navegación para carrusel de fotos múltiples
  const getActiveImageIndex = (productId: string) => {
    return activeImageIndexes[productId] || 0;
  };

  const nextImage = (productId: string, imagesLength: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentIndex = getActiveImageIndex(productId);
    const nextIndex = (currentIndex + 1) % imagesLength;
    setActiveImageIndexes(prev => ({ ...prev, [productId]: nextIndex }));
  };

  const prevImage = (productId: string, imagesLength: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentIndex = getActiveImageIndex(productId);
    const prevIndex = (currentIndex - 1 + imagesLength) % imagesLength;
    setActiveImageIndexes(prev => ({ ...prev, [productId]: prevIndex }));
  };

  // Guardar en localStorage cada vez que cambia el carrito
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

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (currentQty >= product.stock) {
      showNotification(`¡Lo sentimos! Solo quedan ${product.stock} unidades de este producto.`, 'error');
      return;
    }

    let newCart: CartItem[];
    if (existingItem) {
      newCart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      showNotification(`Añadido al carrito: ${product.name}`);
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
      showNotification(`Añadido al carrito: ${product.name}`);
    }
    saveCartToStorage(newCart);
  };

  const updateQuantity = (productId: string, amount: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newCart = cart.map(item => {
      if (item.id === productId) {
        const nextQty = item.quantity + amount;
        
        if (nextQty <= 0) return null;
        if (nextQty > product.stock) {
          showNotification(`Solo hay ${product.stock} unidades disponibles en inventario.`, 'error');
          return item;
        }
        return { ...item, quantity: nextQty };
      }
      return item;
    }).filter(Boolean) as CartItem[];

    saveCartToStorage(newCart);
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find(i => i.id !== productId);
    const newCart = cart.filter(i => i.id !== productId);
    saveCartToStorage(newCart);
    showNotification(`Eliminado del carrito`, 'error');
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const line = '---------------------------------------------';
    let message = `🌸 *¡NUEVO PEDIDO - DÍA DE LA MADRE!* 🌸\n${line}\n\n`;
    
    cart.forEach(item => {
      message += `🎁 *${item.quantity}x* ${item.name}\n`;
      message += `   _Precio unitario:_ Bs. ${item.price.toLocaleString('es-BO')}\n`;
      message += `   _Subtotal:_ Bs. ${(item.price * item.quantity).toLocaleString('es-BO')}\n\n`;
    });
    
    message += `${line}\n💝 *TOTAL A PAGAR:* Bs. ${calculateTotal().toLocaleString('es-BO')}\n${line}\n\n`;
    message += `💬 _Hola! Quiero coordinar el envío de estos regalos para Mamá. ¿Me envían los datos para transferencia o código QR?_`;

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-rose-bg text-rose-fg transition-colors duration-300">
      {/* Notificaciones flotantes */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg glassmorphism animate-bounce text-sm font-semibold max-w-sm">
          {notification.type === 'success' ? (
            <span className="p-1 rounded-full bg-emerald-100 text-emerald-600">
              <Check className="w-4 h-4" />
            </span>
          ) : (
            <span className="p-1 rounded-full bg-rose-100 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </span>
          )}
          <span className="text-txt-primary">{notification.message}</span>
        </div>
      )}

      {/* HEADER ELEGANTE */}
      <header className="sticky top-0 z-40 bg-card-bg/85 backdrop-blur-md border-b border-card-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-card-border shrink-0">
              <img src="/logo.jpg" alt="Shiro Neko Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-lg md:text-xl font-serif font-bold text-rose-500 dark:text-rose-400 tracking-wide">Mamá Especial</span>
              <span className="block text-[9px] text-txt-muted uppercase tracking-widest font-bold">por Shiro Neko Lab</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Buscador minimalista en desktop */}
            <div className="relative hidden md:block w-64">
              <input
                type="text"
                placeholder="Buscar regalo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-full bg-rose-50/20 dark:bg-rose-900/10 border border-card-border focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-card-bg transition-all text-txt-primary placeholder-txt-muted"
              />
              <Search className="w-4 h-4 text-rose-400 absolute left-3 top-2.5" />
            </div>

            {/* Botón Carrito */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 rounded-full bg-card-border/15 text-rose-500 hover:bg-card-border/30 transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Ver carrito"
            >
              <ShoppingBag className="w-4 h-4" />
              {mounted && getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {getCartCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-[#181d22] to-transparent border-b border-card-border">
        <div className="absolute top-10 left-10 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-rose-800/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center px-4 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/60 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Colección Exclusiva 2026</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-black text-txt-primary tracking-tight leading-tight mb-6">
            Celebra a Mamá con Detalles que <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 dark:from-rose-400 dark:to-amber-400">Perduran en el Corazón</span>
          </h1>
          
          <p className="text-base md:text-lg text-txt-secondary font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Hemos seleccionado los regalos más sofisticados y emotivos para demostrarle todo tu amor. 
            Envío exprés y coordinación sencilla por WhatsApp.
          </p>

          {/* Buscador móvil */}
          <div className="relative max-w-md mx-auto md:hidden px-2">
            <input
              type="text"
              placeholder="Buscar flores, joyas, chocolates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full bg-card-bg border border-card-border focus:outline-none focus:ring-2 focus:ring-rose-300 shadow-sm text-txt-primary placeholder-txt-muted text-sm"
            />
            <Search className="w-4 h-4 text-rose-400 absolute left-4 top-3.5" />
          </div>
        </div>
      </section>

      {/* BANNER REGALOS PERSONALIZADOS */}
      <section className="max-w-4xl mx-auto px-4 mt-8 w-full">
        <div className="bg-card-bg border border-card-border rounded-3xl p-6 md:p-8 elegant-shadow flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-txt-primary">💝 ¿Buscas un detalle único y personalizado?</h3>
              <p className="text-xs md:text-sm text-txt-secondary font-medium max-w-lg">
                Diseñamos ramos especiales, grabados en joyas o combinaciones de chocolates personalizadas para consentir a Mamá. Escríbenos directamente.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              const text = encodeURIComponent("🌸 *¡Hola! Me interesa solicitar un regalo personalizado para el Día de la Madre.* 🌸\n\n_Quiero coordinar detalles para crear un regalo único y especial para Mamá. ¿Me podrían asesorar con las opciones disponibles?_");
              window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
            }}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold rounded-full text-xs tracking-wide transition-all shadow-md shadow-rose-250/10 shrink-0 cursor-pointer flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-white text-rose-500" />
            Solicitar Regalo Personalizado
          </button>
        </div>
      </section>

      {/* BANNER DE NOVEDADES WHATSAPP GRUPO */}
      <section className="max-w-4xl mx-auto px-4 mt-6 w-full">
        <div className="bg-card-bg border border-card-border rounded-3xl p-6 md:p-8 elegant-shadow flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-12 h-12 rounded-2xl bg-rose-800/10 text-rose-800 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-txt-primary">📢 ¡Únete a nuestro Club de Novedades!</h3>
              <p className="text-xs md:text-sm text-txt-secondary font-medium max-w-lg">
                Sé el primero en enterarte de nuevos lanzamientos, ofertas exclusivas y novedades de Shiro Neko Lab directamente en tu celular.
              </p>
            </div>
          </div>
          
          <a
            href="https://chat.whatsapp.com/BTVNKDqgsFgAiuxTtb8clI"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold rounded-full text-xs tracking-wide transition-all shadow-md shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            Unirse al Grupo de Novedades
          </a>
        </div>
      </section>

      {/* SECCIÓN CARACTERÍSTICAS / VALORES */}
      <section className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Tarjeta 1 */}
        <div className="bg-card-bg border border-card-border rounded-2xl p-5 flex items-start gap-3 elegant-shadow transition-all duration-300 hover:-translate-y-1">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-txt-primary">✨ Materiales Finos y Duraderos</h4>
            <p className="text-xs text-txt-secondary font-medium mt-1 leading-relaxed">
              Seleccionamos solo elementos de calidad: flores frescas de exportación, plata de ley de alta pureza y chocolates finos que lucen hermosos y perduran.
            </p>
          </div>
        </div>

        {/* Tarjeta 2 */}
        <div className="bg-card-bg border border-card-border rounded-2xl p-5 flex items-start gap-3 elegant-shadow transition-all duration-300 hover:-translate-y-1">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-txt-primary">🎨 Personalización Sin Límites</h4>
            <p className="text-xs text-txt-secondary font-medium mt-1 leading-relaxed">
              ¡Se pueden hacer muchas cosas! Ajustamos colores de envolturas, grabamos dedicatorias personalizadas y combinamos productos para el regalo ideal de Mamá.
            </p>
          </div>
        </div>

        {/* Tarjeta 3 */}
        <div className="bg-card-bg border border-card-border rounded-2xl p-5 flex items-start gap-3 elegant-shadow transition-all duration-300 hover:-translate-y-1">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-350" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-txt-primary">💝 Hecho a Mano con Amor</h4>
            <p className="text-xs text-txt-secondary font-medium mt-1 leading-relaxed">
              Cada sorpresa es armada y detallada individualmente a mano con la mayor dedicación, garantizando un acabado perfecto y emotivo.
            </p>
          </div>
        </div>
      </section>

      {/* CATÁLOGO PRINCIPAL */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filtros de Categorías */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
          {mounted && categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer ${
                selectedCategory === category
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200 dark:shadow-none'
                  : 'bg-card-bg text-txt-secondary border border-card-border hover:border-rose-400 hover:text-rose-500'
              }`}
            >
              {category === 'Todos' ? (
                <span className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" /> Todos
                </span>
              ) : (
                category
              )}
            </button>
          ))}
        </div>

        {/* Productos Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card-bg rounded-3xl border border-card-border p-4 space-y-4 elegant-shadow animate-pulse">
                <div className="aspect-square bg-rose-100/10 rounded-2xl w-full"></div>
                <div className="h-4 bg-rose-100/20 rounded-md w-3/4"></div>
                <div className="h-4 bg-rose-100/20 rounded-md w-1/2"></div>
                <div className="h-8 bg-rose-100/20 rounded-full w-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-card-bg rounded-3xl border border-card-border max-w-md mx-auto">
            <Heart className="w-12 h-12 text-rose-300 mx-auto mb-4 animate-bounce" />
            <p className="text-txt-primary font-bold mb-4">{error}</p>
            <button 
              onClick={fetchProducts}
              className="px-6 py-2.5 bg-rose-500 text-white rounded-full font-bold hover:bg-rose-600 transition-colors cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-card-bg rounded-3xl border border-card-border max-w-xl mx-auto p-8 shadow-xs">
            <Gift className="w-12 h-12 text-rose-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-txt-primary mb-2">No encontramos ningún regalo así</h3>
            <p className="text-txt-secondary font-medium">Prueba buscando otra palabra clave o selecciona otra categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const cartItem = cart.find(item => item.id === product.id);
              const quantityInCart = cartItem ? cartItem.quantity : 0;
              const isOutOfStock = product.stock <= 0;
              const isLimitReached = quantityInCart >= product.stock;

              return (
                <div 
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setDetailsActiveImageIndex(0);
                  }}
                  className="group bg-card-bg rounded-3xl border border-card-border overflow-hidden elegant-shadow elegant-shadow-hover flex flex-col relative cursor-pointer"
                >
                  {/* Categoría Tag */}
                  <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-card-bg/95 text-rose-600 dark:text-rose-400 text-[10px] font-bold shadow-sm uppercase tracking-wider border border-card-border">
                    {product.category}
                  </span>

                  {/* Imagen */}
                  <div className="aspect-square w-full relative overflow-hidden bg-rose-50/5 dark:bg-rose-950/10 group/img">
                    {product.images && product.images.length > 1 ? (
                      <>
                        <img
                          src={product.images[getActiveImageIndex(product.id)]}
                          alt={`${product.name} - Imagen ${getActiveImageIndex(product.id) + 1}`}
                          className="w-full h-full object-cover transition-all duration-500"
                          loading="lazy"
                        />
                        {/* Botones de navegación (visibles en hover) */}
                        <button
                          onClick={(e) => prevImage(product.id, product.images!.length, e)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 z-10 cursor-pointer"
                          aria-label="Imagen anterior"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => nextImage(product.id, product.images!.length, e)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 z-10 cursor-pointer"
                          aria-label="Siguiente imagen"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        {/* Indicadores de puntos */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                          {product.images.map((_, idx) => (
                            <span
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                getActiveImageIndex(product.id) === idx
                                  ? 'bg-rose-500 scale-110'
                                  : 'bg-white/55'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        loading="lazy"
                      />
                    )}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-15">
                        <span className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-black tracking-widest uppercase shadow-md">
                          Agotado
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Detalles */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-bold text-txt-primary group-hover:text-rose-600 transition-colors leading-tight">
                          {product.name}
                        </h3>
                        <span className="text-base font-extrabold text-rose-500 shrink-0 font-sans">
                          Bs. {product.price.toLocaleString('es-BO')}
                        </span>
                      </div>
                      
                      <p className="text-xs text-txt-secondary leading-relaxed font-medium line-clamp-3">
                        {product.description}
                      </p>
                    </div>

                    {/* Stock y Botón */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-txt-muted font-bold">Stock disponible:</span>
                        {isOutOfStock ? (
                          <span className="text-rose-600 font-extrabold uppercase">Sin stock</span>
                        ) : product.stock <= 3 ? (
                          <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/20 px-2.5 py-0.5 rounded-md animate-pulse">
                            ¡Solo {product.stock} unidades!
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-450 font-bold">{product.stock} unidades</span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        disabled={isOutOfStock || isLimitReached}
                        className={`w-full py-3 px-4 rounded-full font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                          isOutOfStock 
                            ? 'bg-card-border/10 text-txt-muted cursor-not-allowed shadow-none'
                            : isLimitReached
                            ? 'bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 cursor-not-allowed shadow-none'
                            : 'bg-rose-500 hover:bg-rose-600 text-white hover:shadow-md hover:shadow-rose-300/30'
                        }`}
                      >
                        {isOutOfStock ? (
                          'Agotado'
                        ) : isLimitReached ? (
                          'Límite de stock añadido'
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" /> Añadir al carrito
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="bg-card-border/10 dark:bg-[#11090b] text-txt-secondary py-12 border-t border-card-border mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-card-border shadow-sm">
              <img src="/logo.jpg" alt="Shiro Neko Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-txt-primary font-serif font-bold text-lg">
              <a 
                href="https://www.instagram.com/shiro_neko_lab/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-rose-500 hover:text-rose-600 dark:text-rose-450 dark:hover:text-rose-400 hover:underline transition-colors"
              >
                Shiro Neko Lab
              </a>{' '}
              &{' '}
              <a 
                href="https://www.instagram.com/tugfanat/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-rose-500 hover:text-rose-600 dark:text-rose-450 dark:hover:text-rose-400 hover:underline transition-colors"
              >
                TuGfaNat
              </a>
            </span>
          </div>
          <p className="text-sm font-medium text-txt-secondary max-w-md mx-auto leading-relaxed">
            Creado para brindar la experiencia de compra más tierna, rápida y hermosa para el ser que nos dio la vida.
          </p>
          
          {/* Botones de Redes Sociales */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-txt-muted uppercase tracking-widest font-bold">Shiro Neko Lab</span>
              <div className="flex gap-2.5">
                <a 
                  href="https://www.instagram.com/shiro_neko_lab/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 rounded-full bg-card-border/20 text-rose-500 hover:text-white hover:bg-rose-500 transition-all duration-300 shadow-xs flex items-center justify-center"
                  aria-label="Instagram de Shiro Neko Lab"
                  title="Instagram Shiro Neko Lab"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a 
                  href="https://www.tiktok.com/@shiro.neko.lab" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 rounded-full bg-card-border/20 text-rose-500 hover:text-white hover:bg-rose-500 transition-all duration-300 shadow-xs flex items-center justify-center"
                  aria-label="TikTok de Shiro Neko Lab"
                  title="TikTok Shiro Neko Lab"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.94-1.78-.22-.22-.41-.47-.59-.73v5.02c.01 2.44-.94 4.85-2.77 6.49-1.92 1.8-4.72 2.45-7.22 1.78-2.61-.71-4.73-2.9-5.27-5.56-.69-3.17 1.03-6.66 4.09-7.79.82-.31 1.7-.44 2.57-.45v4.07c-1.07.03-2.18.52-2.77 1.45-.73 1.07-.63 2.64.29 3.56.91.95 2.45 1.09 3.52.32.74-.5 1.16-1.37 1.16-2.26V.02z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-[1px] bg-card-border"></div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-txt-muted uppercase tracking-widest font-bold">TuGfaNat</span>
              <div className="flex gap-2.5">
                <a 
                  href="https://www.instagram.com/tugfanat/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 rounded-full bg-card-border/20 text-rose-500 hover:text-white hover:bg-rose-500 transition-all duration-300 shadow-xs flex items-center justify-center"
                  aria-label="Instagram de TuGfaNat"
                  title="Instagram TuGfaNat"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a 
                  href="https://www.tiktok.com/@tugfanat" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 rounded-full bg-card-border/20 text-rose-500 hover:text-white hover:bg-rose-500 transition-all duration-300 shadow-xs flex items-center justify-center"
                  aria-label="TikTok de TuGfaNat"
                  title="TikTok TuGfaNat"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.94-1.78-.22-.22-.41-.47-.59-.73v5.02c.01 2.44-.94 4.85-2.77 6.49-1.92 1.8-4.72 2.45-7.22 1.78-2.61-.71-4.73-2.9-5.27-5.56-.69-3.17 1.03-6.66 4.09-7.79.82-.31 1.7-.44 2.57-.45v4.07c-1.07.03-2.18.52-2.77 1.45-.73 1.07-.63 2.64.29 3.56.91.95 2.45 1.09 3.52.32.74-.5 1.16-1.37 1.16-2.26V.02z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-card-border w-24 mx-auto"></div>
          <p className="text-xs text-txt-muted">
            © 2026{' '}
            <a 
              href="https://www.instagram.com/shiro_neko_lab/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-rose-500 hover:text-rose-600 dark:text-rose-450 dark:hover:text-rose-400 hover:underline transition-colors"
            >
              Shiro Neko Lab
            </a>{' '}
            &{' '}
            <a 
              href="https://www.instagram.com/tugfanat/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-rose-500 hover:text-rose-600 dark:text-rose-450 dark:hover:text-rose-400 hover:underline transition-colors"
            >
              TuGfaNat
            </a>
            . Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* CARRITO LATERAL (DRAWER) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop con Blur */}
            <div 
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            ></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md transform transition-transform duration-500 ease-in-out">
                <div className="flex h-full flex-col bg-card-bg shadow-2xl border-l border-card-border text-txt-primary">
                  {/* Cart Header */}
                  <div className="px-6 py-6 bg-card-border/5 border-b border-card-border flex items-center justify-between">
                    <h2 className="text-lg font-serif font-bold text-txt-primary flex items-center gap-2" id="slide-over-title">
                      <ShoppingBag className="w-5 h-5 text-rose-500" />
                      Tu Carrito de Regalos
                    </h2>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="p-1.5 rounded-full text-txt-muted hover:text-rose-500 hover:bg-card-border/10 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Cart Items List */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {cart.length === 0 ? (
                      <div className="text-center py-20 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-card-border/10 flex items-center justify-center mx-auto text-rose-400">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="font-bold text-txt-primary text-base">El carrito está vacío</h3>
                          <p className="text-xs text-txt-secondary font-medium mt-1">
                            Añade algunos hermosos detalles para Mamá de nuestra colección.
                          </p>
                        </div>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={item.id} className="flex gap-4 pb-6 border-b border-card-border">
                          {/* Thumbnail */}
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-rose-50/10 shrink-0 border border-card-border">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>

                          {/* Item Details */}
                          <div className="flex-grow space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-serif font-bold text-sm text-txt-primary line-clamp-1">{item.name}</h4>
                              <span className="text-sm font-extrabold text-rose-500">Bs. {(item.price * item.quantity).toLocaleString('es-BO')}</span>
                            </div>
                            
                            <p className="text-[10px] text-rose-500 dark:text-rose-400 uppercase tracking-widest font-extrabold">{item.category}</p>

                            <div className="flex justify-between items-center">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-1 bg-card-border/5 border border-card-border rounded-full px-1.5 py-0.5">
                                <button 
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="p-1 rounded-full hover:bg-card-border/10 text-txt-secondary transition-colors cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-bold text-txt-primary">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="p-1 rounded-full hover:bg-card-border/10 text-txt-secondary transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Remove Item */}
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="p-1.5 text-txt-muted hover:text-rose-500 transition-colors cursor-pointer"
                                title="Eliminar del carrito"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Cart Footer */}
                  {cart.length > 0 && (
                    <div className="border-t border-card-border px-6 py-6 bg-card-border/5 space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-txt-secondary text-sm">Total acumulado:</span>
                        <span className="text-xl font-black font-sans text-rose-500">Bs. {calculateTotal().toLocaleString('es-BO')}</span>
                      </div>
                      
                      <div className="space-y-3">
                        <button
                          onClick={handleCheckout}
                          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold tracking-wide transition-all shadow-md shadow-emerald-100/10 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <MessageCircle className="w-5 h-5 fill-white text-emerald-500" />
                          Finalizar compra por WhatsApp
                        </button>
                        <p className="text-[10px] text-txt-muted font-medium text-center">
                          El pedido se enviará detallado por chat para acordar la dirección de entrega y el pago (QR / Transferencia).
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETALLES DE PRODUCTO MODAL */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in duration-200 cursor-pointer"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="bg-card-bg rounded-3xl w-full max-w-4xl border border-card-border shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Columna Izquierda: Imagen / Slider */}
            <div className="md:w-1/2 relative bg-rose-50/5 dark:bg-rose-950/10 flex flex-col justify-center">
              {/* Imagen Grande Activa */}
              <div className="aspect-square w-full relative overflow-hidden flex items-center justify-center">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img
                    src={selectedProduct.images[detailsActiveImageIndex]}
                    alt={`${selectedProduct.name} - Detalle ${detailsActiveImageIndex + 1}`}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                ) : (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Botón cerrar para móviles (en la esquina de la imagen) */}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 md:hidden p-2 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors z-20 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Controles de slider si hay más de 1 imagen */}
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <>
                    <button
                      onClick={() => {
                        const len = selectedProduct.images!.length;
                        setDetailsActiveImageIndex((detailsActiveImageIndex - 1 + len) % len);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white transition-all z-10 cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        const len = selectedProduct.images!.length;
                        setDetailsActiveImageIndex((detailsActiveImageIndex + 1) % len);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white transition-all z-10 cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Tiras de miniaturas en la parte inferior si hay más de 1 imagen */}
              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto justify-center border-t border-card-border/50 bg-card-bg/50">
                  {selectedProduct.images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setDetailsActiveImageIndex(idx)}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                        detailsActiveImageIndex === idx ? 'border-rose-500 scale-105' : 'border-card-border opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Columna Derecha: Texto y Controles */}
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between relative bg-card-bg">
              {/* Botón cerrar para pantallas grandes */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 hidden md:block p-2 rounded-full text-txt-muted hover:text-rose-500 hover:bg-card-border/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                {/* Categoría */}
                <div>
                  <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider border border-rose-500/20">
                    {selectedProduct.category}
                  </span>
                </div>

                {/* Nombre */}
                <h3 className="text-xl md:text-2xl font-serif font-bold text-txt-primary leading-tight">
                  {selectedProduct.name}
                </h3>

                {/* Precio */}
                <div className="text-2xl font-extrabold text-rose-500 font-sans">
                  Bs. {selectedProduct.price.toLocaleString('es-BO')}
                </div>

                <div className="border-t border-card-border/50 pt-4">
                  <h4 className="text-xs font-bold text-txt-muted uppercase tracking-wider mb-2">Detalles del Regalo</h4>
                  <p className="text-xs md:text-sm text-txt-secondary leading-relaxed font-medium">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>

              {/* Botón comprar / añadir al carrito */}
              <div className="mt-8 pt-4 border-t border-card-border/50 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-txt-muted font-bold">Stock disponible:</span>
                  {selectedProduct.stock <= 0 ? (
                    <span className="text-rose-655 font-extrabold uppercase">Agotado</span>
                  ) : selectedProduct.stock <= 3 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/20 px-2.5 py-0.5 rounded-md animate-pulse">
                      ¡Solo {selectedProduct.stock} unidades!
                    </span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-450 font-bold">{selectedProduct.stock} unidades</span>
                  )}
                </div>

                {(() => {
                  const cartItem = cart.find(item => item.id === selectedProduct.id);
                  const qty = cartItem ? cartItem.quantity : 0;
                  const isOutOfStock = selectedProduct.stock <= 0;
                  const isLimit = qty >= selectedProduct.stock;

                  return (
                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                      }}
                      disabled={isOutOfStock || isLimit}
                      className={`w-full py-3.5 px-4 rounded-full font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                        isOutOfStock 
                          ? 'bg-card-border/10 text-txt-muted cursor-not-allowed shadow-none'
                          : isLimit
                          ? 'bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 cursor-not-allowed shadow-none'
                          : 'bg-rose-500 hover:bg-rose-600 text-white hover:shadow-lg hover:shadow-rose-300/30'
                      }`}
                    >
                      {isOutOfStock ? (
                        'Agotado'
                      ) : isLimit ? (
                        'Límite de stock añadido'
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" /> Añadir al carrito
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
