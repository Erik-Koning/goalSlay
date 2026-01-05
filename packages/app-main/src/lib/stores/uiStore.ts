import { create } from "zustand";

export interface BannerMessage {
  title: string;
  message: string;
  dismissible?: boolean;
  buttonAction?: Record<string, string>;
  buttonUrl?: string;
  buttonTitle?: string;
}

export interface ModalMessage {
  title: string;
  message: string;
  priority?: number;
}

interface UIState {
  sideMenuOpen: boolean;
  bannerOpen: boolean;
  navbarBottomY: number;
  bannerMessages: BannerMessage[];
  closedBannerTitles: string[];
  modalMessages: ModalMessage[];
  modalOpen: boolean;
  notificationPriority: number;
  notificationSheetOpen: boolean;
  setSideMenuOpen: (open: boolean) => void;
  setBannerOpen: (open: boolean) => void;
  setNavbarBottomY: (y: number) => void;
  toggleSideMenu: () => void;
  addOrUpdateBannerMessage: (message: BannerMessage) => void;
  removeBannerMessage: (title: string) => void;
  setClosedBannerTitles: (titles: string[]) => void;
  addModalMessage: (message: ModalMessage) => void;
  removeModalMessage: (title: string) => void;
  setModalOpen: (open: boolean) => void;
  setNotificationPriority: (priority: number) => void;
  setNotificationSheetOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sideMenuOpen: false,
  bannerOpen: false,
  navbarBottomY: 64, // Default navbar height
  bannerMessages: [],
  closedBannerTitles: [],
  modalMessages: [],
  modalOpen: false,
  notificationPriority: 0,
  notificationSheetOpen: false,
  setSideMenuOpen: (open) => set({ sideMenuOpen: open }),
  setBannerOpen: (open) => set({ bannerOpen: open }),
  setNavbarBottomY: (y) => set({ navbarBottomY: y }),
  toggleSideMenu: () => set((state) => ({ sideMenuOpen: !state.sideMenuOpen })),
  addOrUpdateBannerMessage: (message) =>
    set((state) => {
      const existingIndex = state.bannerMessages.findIndex((m) => m.title === message.title);
      if (existingIndex >= 0) {
        const updated = [...state.bannerMessages];
        updated[existingIndex] = message;
        return { bannerMessages: updated };
      }
      return { bannerMessages: [...state.bannerMessages, message] };
    }),
  removeBannerMessage: (title) =>
    set((state) => ({
      bannerMessages: state.bannerMessages.filter((m) => m.title !== title),
    })),
  setClosedBannerTitles: (titles) => set({ closedBannerTitles: titles }),
  addModalMessage: (message) =>
    set((state) => ({
      modalMessages: [...state.modalMessages, message],
    })),
  removeModalMessage: (title) =>
    set((state) => ({
      modalMessages: state.modalMessages.filter((m) => m.title !== title),
    })),
  setModalOpen: (open) => set({ modalOpen: open }),
  setNotificationPriority: (priority) => set({ notificationPriority: priority }),
  setNotificationSheetOpen: (open) => set({ notificationSheetOpen: open }),
}));

