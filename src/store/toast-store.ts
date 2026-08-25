import { create } from "zustand";

export type ToastType = "success" | "error";

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toast: ToastState | null;
  show: (message: string, type?: ToastType) => void;
  hide: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  show: (message, type = "success") =>
    set({ toast: { id: Date.now(), message, type } }),
  hide: () => set({ toast: null }),
}));

