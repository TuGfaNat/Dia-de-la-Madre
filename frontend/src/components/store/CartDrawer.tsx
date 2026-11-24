'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  X,
  Minus,
  Plus,
  Trash2,
  MessageCircle,
  Truck,
  Store,
  HeartHandshake,
  User,
  MapPin,
  Palette,
} from 'lucide-react';
import { CartItem } from '../../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number, selectedColor?: string) => void;
  onRemoveItem: (id: string, selectedColor?: string) => void;
  whatsappNumber: string;
  storeName: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  whatsappNumber,
  storeName,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [giftCardNote, setGiftCardNote] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);

  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    let message = `¡Hola ${storeName}! 🐾👋 Me gustaría coordinar el siguiente pedido:\n\n`;

    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      if (item.selectedColor) {
        message += `   • Acabado/Color: ${item.selectedColor}\n`;
      }
      message += `   • Cantidad: ${item.quantity}\n`;
      message += `   • Subtotal: Bs. ${(item.price * item.quantity).toLocaleString('es-BO')}\n`;
    });

    message += `\n💰 *Total del pedido: Bs. ${total.toLocaleString('es-BO')}*`;

    // Información de Entrega y Dedicatoria
    message += `\n\n📋 *Detalles del Pedido:*`;
    if (customerName.trim()) {
      message += `\n• Cliente: ${customerName.trim()}`;
    }
    message += `\n• Modalidad: ${
      deliveryType === 'delivery'
        ? `Envío a domicilio 🚚${deliveryAddress.trim() ? ` (${deliveryAddress.trim()})` : ''}`
        : 'Recojo en taller 🏪'
    }`;

    if (giftCardNote.trim()) {
      message += `\n• 💌 *Dedicatoria para la tarjetita de regalo:* "${giftCardNote.trim()}"`;
    }

    message += `\n\n📌 Entiendo que se confirma el encargo con el 50% de anticipo. ¿Podrían confirmarme disponibilidad y los datos de pago vía QR? ¡Muchas gracias! ✨`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      aria-labelledby="cart-drawer-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop con Blur */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-card-bg border-l border-card-border shadow-2xl flex flex-col justify-between text-txt-primary animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-card-border/5 border-b border-card-border flex items-center justify-between">
            <h2
              className="text-base sm:text-lg font-bold text-txt-primary flex items-center gap-2"
              id="cart-drawer-title"
            >
              <ShoppingBag className="w-5 h-5 text-rose-500" />
              <span>Tu Carrito de Regalos</span>
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-txt-muted hover:text-rose-500 hover:bg-card-border/10 transition-colors cursor-pointer"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List & Checkout Form */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {cart.length === 0 ? (
              <div className="text-center py-16 sm:py-24 space-y-4">
                <div className="w-16 h-16 rounded-full bg-card-border/10 flex items-center justify-center mx-auto text-rose-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-txt-primary text-base">El carrito está vacío</h3>
                  <p className="text-xs text-txt-secondary font-medium mt-1 max-w-xs mx-auto">
                    Explora nuestra colección y añade figuras 3D, cajas de autor o detalles de temporada.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Lista de Productos */}
                <div className="space-y-3">
                  {cart.map((item) => {
                    const itemUniqueId = item.selectedColor
                      ? `${item.id}__${item.selectedColor}`
                      : item.id;
                    return (
                      <div
                        key={itemUniqueId}
                        className="flex gap-3 sm:gap-4 p-3 rounded-2xl bg-card-border/5 border border-card-border/60 transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-rose-50/10 shrink-0 border border-card-border">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Detalle */}
                        <div className="flex-grow min-w-0 space-y-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-xs sm:text-sm text-txt-primary line-clamp-1">
                                {item.name}
                              </h4>
                              <span className="text-xs sm:text-sm font-extrabold text-rose-500 shrink-0 font-sans">
                                Bs. {(item.price * item.quantity).toLocaleString('es-BO')}
                              </span>
                            </div>

                            {/* Color / Acabado si aplica */}
                            {item.selectedColor && (
                              <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-0.5">
                                <Palette className="w-3 h-3" />
                                <span>{item.selectedColor}</span>
                              </p>
                            )}

                            <p className="text-[10px] text-txt-muted uppercase tracking-wider font-extrabold truncate mt-0.5">
                              {item.category}
                            </p>
                          </div>

                          <div className="flex justify-between items-center pt-1">
                            {/* Controles de cantidad */}
                            <div className="flex items-center gap-1.5 bg-card-bg border border-card-border rounded-full px-2 py-0.5 shadow-2xs">
                              <button
                                onClick={() => onUpdateQuantity(item.id, -1, item.selectedColor)}
                                className="p-1 text-txt-secondary hover:text-rose-500 transition-colors cursor-pointer"
                                aria-label="Restar unidad"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center text-xs font-bold text-txt-primary">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, 1, item.selectedColor)}
                                disabled={item.quantity >= item.stock}
                                className="p-1 text-txt-secondary hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                aria-label="Sumar unidad"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Eliminar */}
                            <button
                              onClick={() => onRemoveItem(item.id, item.selectedColor)}
                              className="p-1.5 text-txt-muted hover:text-rose-500 transition-colors cursor-pointer"
                              title="Eliminar del pedido"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Formulario de Datos de Entrega & Tarjetita de Regalo */}
                <div className="border border-card-border/80 rounded-2xl p-4 bg-card-border/5 space-y-3.5">
                  <div
                    onClick={() => setShowOrderForm((prev) => !prev)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-xs font-bold text-txt-primary flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-rose-500" />
                      <span>Datos para tu Pedido & Tarjetita</span>
                    </span>
                    <span className="text-[11px] font-bold text-rose-500">
                      {showOrderForm ? 'Ocultar ▲' : 'Completar ▼'}
                    </span>
                  </div>

                  <div className={`space-y-3 ${showOrderForm ? 'block' : 'hidden'}`}>
                    {/* Nombre del cliente */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-txt-secondary flex items-center gap-1">
                        <User className="w-3 h-3 text-txt-muted" /> Tu Nombre (Opcional):
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ej. Camila Morales"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-1 focus:ring-rose-400 font-medium"
                      />
                    </div>

                    {/* Modalidad de Entrega */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-txt-secondary">Modalidad de Entrega:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDeliveryType('delivery')}
                          className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            deliveryType === 'delivery'
                              ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                              : 'bg-card-bg text-txt-secondary border-card-border hover:border-rose-300'
                          }`}
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>A domicilio</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryType('pickup')}
                          className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            deliveryType === 'pickup'
                              ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                              : 'bg-card-bg text-txt-secondary border-card-border hover:border-rose-300'
                          }`}
                        >
                          <Store className="w-3.5 h-3.5" />
                          <span>Recojo en taller</span>
                        </button>
                      </div>
                    </div>

                    {/* Dirección / Zona si es a domicilio */}
                    {deliveryType === 'delivery' && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-txt-secondary flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-txt-muted" /> Dirección o Zona de Entrega:
                        </label>
                        <input
                          type="text"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Ej. Sopocachi, Av. 6 de Agosto / Calacoto..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-1 focus:ring-rose-400 font-medium"
                        />
                      </div>
                    )}

                    {/* Dedicatoria para la tarjetita de regalo */}
                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] font-bold text-txt-secondary flex items-center gap-1">
                        <span>💌</span> Mensaje para la tarjetita de regalo (Opcional):
                      </label>
                      <textarea
                        rows={2}
                        value={giftCardNote}
                        onChange={(e) => setGiftCardNote(e.target.value)}
                        placeholder="Ej. ¡Feliz día mamá! Gracias por iluminar siempre nuestros días con tu amor..."
                        className="w-full px-3 py-2 text-xs rounded-xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-1 focus:ring-rose-400 font-medium resize-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer de Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-card-border p-5 sm:p-6 bg-card-border/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-txt-secondary text-sm">Total del Pedido:</span>
                <span className="text-xl sm:text-2xl font-black text-rose-500 font-sans">
                  Bs. {total.toLocaleString('es-BO')}
                </span>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 sm:py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-bold tracking-wide transition-all shadow-md hover:shadow-emerald-300/30 flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                >
                  <MessageCircle className="w-5 h-5 fill-white text-emerald-500" />
                  <span>Enviar Pedido a WhatsApp</span>
                </button>

                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold text-center flex items-center justify-center gap-1.5 bg-amber-500/10 py-1.5 px-3 rounded-lg border border-amber-500/20">
                  <span>⚠️</span>
                  <span>Reserva con el 50% de anticipo (pago vía QR o transferencia).</span>
                </p>

                <p className="text-[10px] text-txt-muted font-medium text-center">
                  Te responderemos al instante para coordinar la entrega y el detalle de tu tarjetita.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
