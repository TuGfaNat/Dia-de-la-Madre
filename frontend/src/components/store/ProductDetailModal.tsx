'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Share2,
  Check,
  Palette,
} from 'lucide-react';
import { Product, CartItem } from '../../types';
import { getSeasonBadge } from '../../lib/season';

interface ProductDetailModalProps {
  product: Product | null;
  cart: CartItem[];
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedColor?: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  cart,
  onClose,
  onAddToCart,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Estado de zoom
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Estado de color seleccionado
  const initialColor =
    product?.colors && product.colors.length > 0 ? product.colors[0] : undefined;
  const [selectedColor, setSelectedColor] = useState<string | undefined>(initialColor);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!product) return null;

  // Carrito: buscar considerando el color si aplica
  const cartItem = cart.find(
    (item) =>
      item.id === product.id && (!selectedColor || item.selectedColor === selectedColor)
  );
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const maxAvailable = product.stock - qtyInCart;
  const isOutOfStock = product.stock <= 0;
  const isLimit = qtyInCart >= product.stock;

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const hasMultipleImages = images.length > 1;

  // Determinar si tiene opciones de color o si es producto 3D
  const availableColors =
    product.colors && product.colors.length > 0
      ? product.colors
      : product.category.toLowerCase().includes('3d') ||
        product.name.toLowerCase().includes('3d') ||
        product.description.toLowerCase().includes('3d')
      ? ['Blanco Hueso', 'Seda Dorado', 'Negro Mate', 'Rosa Pastel']
      : [];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedColor);
    setQuantity(1);
    onClose();
  };

  const handleShare = async () => {
    const shareData = {
      title: `${product.name} | Shiro Neko Lab 🐾`,
      text: `¡Mira este detalle en Shiro Neko Lab! ${product.name} - Bs. ${product.price}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Cancelado por el usuario
      }
    } else {
      await navigator.clipboard.writeText(`${shareData.text} ➡️ ${window.location.href}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-card-bg border border-card-border rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botones Flotantes: Cerrar y Compartir */}
        <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-card-bg/90 hover:bg-card-border/20 text-txt-secondary hover:text-rose-500 border border-card-border/50 transition-colors cursor-pointer"
            title="Compartir regalo"
            aria-label="Compartir regalo"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-card-bg/90 hover:bg-card-border/20 text-txt-secondary hover:text-txt-primary border border-card-border/50 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Columna Izquierda: Galería con Lupa de Zoom */}
        <div className="md:w-1/2 flex flex-col bg-rose-50/5 dark:bg-black/20 border-b md:border-b-0 md:border-r border-card-border">
          {/* Contenedor Principal con Zoom */}
          <div
            ref={imageContainerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onClick={() => setIsZoomed((prev) => !prev)}
            className="relative aspect-square w-full overflow-hidden flex items-center justify-center group cursor-crosshair select-none"
            onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
            onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
            onTouchEnd={() => {
              if (!touchStart || !touchEnd) return;
              const distance = touchStart - touchEnd;
              if (distance > 40) nextImage();
              else if (distance < -40) prevImage();
              setTouchStart(null);
              setTouchEnd(null);
            }}
          >
            <img
              src={images[activeImageIndex]}
              alt={`${product.name} - ${activeImageIndex + 1}`}
              className={`w-full h-full object-cover transition-transform duration-200 ${
                isZoomed ? 'scale-220' : 'scale-100'
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    }
                  : undefined
              }
            />

            {/* Indicador flotante de Zoom */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs pointer-events-none">
              {isZoomed ? <ZoomOut className="w-3 h-3 text-rose-300" /> : <ZoomIn className="w-3 h-3 text-rose-300" />}
              <span>{isZoomed ? 'Zoom activo' : 'Pasa el cursor para zoom'}</span>
            </div>

            {hasMultipleImages && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white transition-opacity cursor-pointer z-10"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white transition-opacity cursor-pointer z-10"
                  aria-label="Foto siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Miniaturas de la Galería */}
          {hasMultipleImages && (
            <div className="p-3 flex items-center gap-2 overflow-x-auto scrollbar-none border-t border-card-border/40">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setIsZoomed(false);
                  }}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-rose-500 scale-105 shadow-sm'
                      : 'border-card-border/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Información y Opciones de Compra */}
        <div className="md:w-1/2 p-5 sm:p-7 md:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider border border-rose-500/20">
                {product.category}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  getSeasonBadge(product.season).class
                }`}
              >
                {getSeasonBadge(product.season).label}
              </span>
            </div>

            {/* Nombre */}
            <h2 className="text-xl sm:text-2xl font-bold text-txt-primary leading-tight">
              {product.name}
            </h2>

            {/* Precio */}
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-500 font-sans">
              Bs. {product.price.toLocaleString('es-BO')}
            </div>

            {/* Selector de Color (Condicional para 3D / Productos con opciones) */}
            {availableColors.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-card-border/10 border border-card-border/60 space-y-2">
                <label className="text-xs font-bold text-txt-primary flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-rose-500" /> Acabado / Color de Impresión:
                  </span>
                  <span className="text-rose-500 font-black text-[11px]">{selectedColor || availableColors[0]}</span>
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {availableColors.map((color) => {
                    const isSelected = (selectedColor || availableColors[0]) === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                          isSelected
                            ? 'bg-rose-500 text-white border-rose-500 shadow-xs scale-102'
                            : 'bg-card-bg text-txt-secondary border-card-border hover:border-rose-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Descripción */}
            <div className="border-t border-card-border/50 pt-4 space-y-2">
              <h3 className="text-xs font-bold text-txt-muted uppercase tracking-wider">
                Detalles del Regalo & Fabricación
              </h3>
              <p className="text-xs sm:text-sm text-txt-secondary leading-relaxed font-medium">
                {product.description}
              </p>
            </div>
          </div>

          {/* Acciones y Selector de Cantidad */}
          <div className="border-t border-card-border/50 pt-4 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-txt-muted font-bold">Stock disponible:</span>
              {isOutOfStock ? (
                <span className="text-rose-600 font-extrabold uppercase">Sin unidades</span>
              ) : product.stock <= 3 ? (
                <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-md animate-pulse">
                  ¡Solo {product.stock} unidades!
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {product.stock} unidades en stock
                </span>
              )}
            </div>

            {!isOutOfStock && !isLimit && (
              <div className="flex items-center justify-between bg-card-border/5 border border-card-border rounded-2xl p-3">
                <span className="text-xs font-bold text-txt-secondary">Cantidad:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className="p-1.5 rounded-full bg-card-border/15 text-txt-secondary hover:bg-card-border/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-bold text-sm w-6 text-center text-txt-primary">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((prev) => Math.min(maxAvailable, prev + 1))}
                    disabled={quantity >= maxAvailable}
                    className="p-1.5 rounded-full bg-card-border/15 text-txt-secondary hover:bg-card-border/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={isOutOfStock || isLimit}
              className={`w-full py-3.5 px-4 rounded-full font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                isOutOfStock
                  ? 'bg-card-border/10 text-txt-muted cursor-not-allowed shadow-none'
                  : isLimit
                  ? 'bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 cursor-not-allowed shadow-none'
                  : 'bg-rose-500 hover:bg-rose-600 text-white hover:shadow-lg hover:shadow-rose-300/30'
              }`}
            >
              {isOutOfStock ? (
                'Agotado'
              ) : isLimit ? (
                'Límite de stock en el carrito'
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    Añadir {quantity > 1 ? `${quantity} unidades` : 'al carrito'} • Bs.{' '}
                    {(product.price * quantity).toLocaleString('es-BO')}
                  </span>
                </>
              )}
            </button>

            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold text-center flex items-center justify-center gap-1.5 bg-amber-500/10 py-2 px-3 rounded-xl border border-amber-500/20">
              <span>⚠️</span>
              <span>Reserva con el 50% de adelanto (sin derecho a devolución).</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
