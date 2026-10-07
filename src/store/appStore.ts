import { create } from 'zustand';

export interface AppStore {
  // Reserved for client-only state as the app grows.
}

export const useAppStore = create<AppStore>(() => ({}));
