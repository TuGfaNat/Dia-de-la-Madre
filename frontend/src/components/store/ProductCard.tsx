'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Share2, Check } from 'lucide-react';
import { Product, CartItem } from '../../types';
import { getSeasonBadge } from '../../lib/season';

interface ProductCardProps {
  product: Product;
  cart: CartItem[];
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cart,
  onSelect,
  onAddToCart,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  // Contar cantidad total de este producto en el carrito (independiente de colores)
  const quantityInCart = cart
    .filter((item) => item.id === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const isOutOfStock = product.stock <= 0;
  const isLimitReached = quantityInCart >= product.stock;

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const hasMultipleImages = images.length > 1;

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title: `${product.name} | Shiro Neko Lab 🐾`,
      text: `¡Mira este regalo artesanal en Shiro Neko Lab! ${product.name} - Bs. ${product.price}`,
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
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-card-bg rounded-3xl border border-card-border overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col relative cursor-pointer"
    >
      {/* Categoría Badge */}
      <span className="absolute top-3.5 left-3.5 z-10 px-3 py-1 rounded-full bg-card-bg/95 text-rose-600 dark:text-rose-400 text-[10px] font-bold shadow-sm uppercase tracking-wider border border-card-border backdrop-blur-xs">
        {product.category}
      </span>

      {/* Temporada Badge & Botón Compartir */}
      <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm border whitespace-nowrap ${
            getSeasonBadge(product.season).class
          }`}
        >
          {getSeasonBadge(product.season).label}
        </span>
        <button
          onClick={handleShare}
          className="p-1.5 rounded-full bg-card-bg/90 hover:bg-card-border/20 text-txt-secondary hover:text-rose-500 border border-card-border shadow-xs backdrop-blur-xs transition-colors cursor-pointer"
          title="Compartir regalo"
          aria-label="Compartir regalo"
        >
          {copiedShare ? <Check className="w-3 h-3 text-emerald-500" /> : <Share2 className="w-3 h-3" />}
        </button>
      </div>

      {/* Imagen / Slider */}
      <div className="aspect-square w-full relative overflow-hidden bg-rose-50/5 dark:bg-rose-950/10 group/img">
        {hasMultipleImages ? (
          <>
            <img
              src={images[activeImageIndex]}
              alt={`${product.name} - Imagen ${activeImageIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-500"
              loading="lazy"
              onTouchStart={(e) => {
                e.stopPropagation();
                setTouchStart(e.targetTouches[0].clientX);
              }}
              onTouchMove={(e) => {
                e.stopPropagation();
                setTouchEnd(e.targetTouches[0].clientX);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                if (!touchStart || !touchEnd) return;
                const distance = touchStart - touchEnd;
                if (distance > 40) {
                  setActiveImageIndex((prev) => (prev + 1) % images.length);
                } else if (distance < -40) {
                  setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
                }
                setTouchStart(null);
                setTouchEnd(null);
              }}
            />

            {/* Flechas de navegación */}
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white opacity-90 md:opacity-0 md:group-hover/img:opacity-100 transition-opacity duration-300 z-10 cursor-pointer"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white opacity-90 md:opacity-0 md:group-hover/img:opacity-100 transition-opacity duration-300 z-10 cursor-pointer"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Indicadores */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    activeImageIndex === idx ? 'bg-rose-500 scale-125' : 'bg-white/60'
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

      {/* Contenido Card */}
      <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between">
        <div className="space-y-2.5 mb-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm sm:text-base font-bold text-txt-primary group-hover:text-rose-500 transition-colors leading-snug line-clamp-2">
              {product.name}
            </h3>
            <span className="text-sm sm:text-base font-extrabold text-rose-500 shrink-0 font-sans">
              Bs. {product.price.toLocaleString('es-BO')}
            </span>
          </div>

          <p className="text-xs text-txt-secondary leading-relaxed font-medium line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Stock y Botón Añadir */}
        <div className="space-y-3 pt-2 border-t border-card-border/40">
          <div className="flex justify-between items-center text-xs">
            <span className="text-txt-muted font-bold text-[11px]">Stock:</span>
            {isOutOfStock ? (
              <span className="text-rose-600 font-extrabold uppercase text-[11px]">Sin stock</span>
            ) : product.stock <= 3 ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded text-[11px] animate-pulse">
                ¡Solo {product.stock} unidades!
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                {product.stock} disponibles
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={isOutOfStock || isLimitReached}
            className={`w-full py-2.5 sm:py-3 px-4 rounded-full font-bold text-xs tracking-wide transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
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
              'Límite de stock'
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Añadir al carrito</span>
                {quantityInCart > 0 && (
                  <span className="ml-1 bg-white/20 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {quantityInCart}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
