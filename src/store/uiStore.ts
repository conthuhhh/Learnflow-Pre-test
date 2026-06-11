import { create } from 'zustand';
import type { Toast } from '@/types';
import { generateId } from '@/lib/utils';

interface UIState {
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
  };
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],

  addToast: (type, message) => {
    const id = generateId();
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => get().removeToast(id), 4000);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  toast: {
    success: (message) => get().addToast('success', message),
    error: (message) => get().addToast('error', message),
    info: (message) => get().addToast('info', message),
    warning: (message) => get().addToast('warning', message),
  },
}));
