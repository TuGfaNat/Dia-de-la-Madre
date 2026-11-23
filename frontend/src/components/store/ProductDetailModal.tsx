'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, CartItem } from '../../types';
import { getSeasonBadge } from '../../lib/season';

interface ProductDetailModalProps {
  product: Product | null;
  cart: CartItem[];
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
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

  if (!product) return null;

  const cartItem = cart.find((item) => item.id === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const maxAvailable = product.stock - qtyInCart;
  const isOutOfStock = product.stock <= 0;
  const isLimit = qtyInCart >= product.stock;

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-card-bg border border-card-border rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-card-bg/90 hover:bg-card-border/20 text-txt-secondary hover:text-txt-primary border border-card-border/50 transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Columna Izquierda: Galería de Fotos */}
        <div className="md:w-1/2 flex flex-col bg-rose-50/5 dark:bg-black/20 border-b md:border-b-0 md:border-r border-card-border">
          {/* Imagen Principal Grande con soporte Touch */}
          <div
            className="relative aspect-square w-full overflow-hidden flex items-center justify-center group"
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
              className="w-full h-full object-cover transition-all duration-300"
            />

            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white transition-opacity cursor-pointer z-10"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white transition-opacity cursor-pointer z-10"
                  aria-label="Foto siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Miniaturas */}
          {hasMultipleImages && (
            <div className="p-3 flex items-center gap-2 overflow-x-auto scrollbar-none border-t border-card-border/40">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
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

        {/* Columna Derecha: Información y Compra */}
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
