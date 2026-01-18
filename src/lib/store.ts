import { create } from 'zustand';
import type { User, Patient, Provider } from '@/types/database';

interface AuthState {
  user: User | null;
  patient: Patient | null;
  provider: Provider | null;
  setUser: (user: User | null) => void;
  setPatient: (patient: Patient | null) => void;
  setProvider: (provider: Provider | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  patient: null,
  provider: null,
  setUser: (user) => set({ user }),
  setPatient: (patient) => set({ patient }),
  setProvider: (provider) => set({ provider }),
  clearAuth: () => set({ user: null, patient: null, provider: null }),
}));

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  setOpen: (isOpen: boolean) => void;
  setCollapsed: (isCollapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  isCollapsed: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (isOpen) => set({ isOpen }),
  setCollapsed: (isCollapsed) => set({ isCollapsed }),
}));

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
}));
