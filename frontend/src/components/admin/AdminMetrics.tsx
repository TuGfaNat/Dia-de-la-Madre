'use client';

import React from 'react';
import { Package, AlertTriangle, DollarSign } from 'lucide-react';
import { Product } from '../../types';

interface AdminMetricsProps {
  products: Product[];
}

export const AdminMetrics: React.FC<AdminMetricsProps> = ({ products }) => {
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock <= 3).length;
  const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      {/* Total Productos */}
      <div className="bg-card-bg p-5 sm:p-6 rounded-2xl border border-card-border flex items-center gap-4 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <span className="block text-[10px] font-bold text-txt-muted uppercase tracking-wider">
            Productos Totales
          </span>
          <span className="text-xl sm:text-2xl font-bold text-txt-primary">{totalProducts}</span>
        </div>
      </div>

      {/* Bajo Stock */}
      <div className="bg-card-bg p-5 sm:p-6 rounded-2xl border border-card-border flex items-center gap-4 shadow-xs">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            lowStockProducts > 0
              ? 'bg-amber-500/10 text-amber-500 animate-pulse'
              : 'bg-card-border/10 text-txt-muted'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <span className="block text-[10px] font-bold text-txt-muted uppercase tracking-wider">
            Bajo Stock (≤ 3 u.)
          </span>
          <span className="text-xl sm:text-2xl font-bold text-txt-primary">{lowStockProducts}</span>
        </div>
      </div>

      {/* Valor Inventario */}
      <div className="bg-card-bg p-5 sm:p-6 rounded-2xl border border-card-border flex items-center gap-4 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <span className="block text-[10px] font-bold text-txt-muted uppercase tracking-wider">
            Valor del Inventario
          </span>
          <span className="text-xl sm:text-2xl font-bold text-txt-primary">
            Bs. {totalInventoryValue.toLocaleString('es-BO')}
          </span>
        </div>
      </div>
    </div>
  );
};
