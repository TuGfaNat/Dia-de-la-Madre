'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (password: string) => Promise<boolean>;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Por favor ingresa la contraseña');
      return;
    }

    setLoading(true);
    setError('');
    const success = await onLogin(password);
    setLoading(false);
    if (!success) {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="min-h-screen bg-rose-bg text-rose-fg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card-bg border border-card-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500/30 mx-auto shadow-md">
            <img src="/logo.jpg" alt="Shiro Neko Lab" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-txt-primary">Acceso Administrativo</h2>
          <p className="text-xs text-txt-secondary font-medium">
            Ingresa tu contraseña para gestionar productos, temporadas y configuraciones.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-txt-secondary block">Contraseña de Administrador</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa la contraseña..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm rounded-xl border border-card-border bg-card-bg text-txt-primary focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
                autoFocus
              />
              <Lock className="w-4 h-4 text-txt-muted absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-txt-muted hover:text-txt-primary cursor-pointer p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold text-center animate-in shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
              </>
            ) : (
              'Entrar al Panel'
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-card-border/50">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-txt-muted hover:text-rose-500 font-bold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
};
