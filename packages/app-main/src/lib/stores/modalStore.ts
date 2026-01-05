import { create } from "zustand";

export interface ModalMessage {
  id?: string;
  title: string;
  desc?: string;
  jsx?: string;
  onConfirm?: string;
  onCloseOnDismiss?: boolean;
  openOnAdd?: boolean;
  className?: string;
  modalOverlayClassName?: string;
}

interface ModalState {
  modalOpen: boolean;
  modalMessages: ModalMessage[];
  triggerUIEvent: { type: string; targetId?: string; payload?: any } | null;
  
  setModalOpen: (open: boolean) => void;
  setModalMessages: (messages: ModalMessage[]) => void;
  addModalMessage: (message: ModalMessage) => void;
  removeModalMessage: (titleOrId: string) => void;
  clearModalMessages: () => void;
  setTriggerUIEvent: (event: { type: string; targetId?: string; payload?: any } | null) => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
  modalOpen: false,
  modalMessages: [],
  triggerUIEvent: null,

  setModalOpen: (open) => set({ modalOpen: open }),
  
  setModalMessages: (messages) => set({ modalMessages: messages }),
  
  addModalMessage: (message) => {
    const messages = get().modalMessages;
    set({ 
      modalMessages: [...messages, message],
      modalOpen: message.openOnAdd ?? false,
    });
  },
  
  removeModalMessage: (titleOrId) => {
    const messages = get().modalMessages.filter(
      (m) => m.title !== titleOrId && m.id !== titleOrId
    );
    set({ 
      modalMessages: messages,
      modalOpen: messages.length > 0,
    });
  },
  
  clearModalMessages: () => set({ modalMessages: [], modalOpen: false }),
  
  setTriggerUIEvent: (event) => set({ triggerUIEvent: event }),
}));

