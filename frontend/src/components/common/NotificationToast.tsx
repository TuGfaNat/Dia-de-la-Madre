'use client';

import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { NotificationState } from '../../types';

interface NotificationToastProps {
  notification: NotificationState | null;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification }) => {
  if (!notification) return null;

  return (
    <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-card-bg border border-card-border shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
      {notification.type === 'success' ? (
        <span className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-500">
          <Check className="w-4 h-4" />
        </span>
      ) : (
        <span className="p-1.5 rounded-full bg-rose-500/10 text-rose-500">
          <AlertCircle className="w-4 h-4" />
        </span>
      )}
      <span className="text-txt-primary text-xs font-bold">{notification.message}</span>
    </div>
  );
};
