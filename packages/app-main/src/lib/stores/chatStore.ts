/**
 * Chat Store
 *
 * Zustand store for managing chat conversation state.
 * Persists conversations in sessionStorage.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;

  // Conversation actions
  createConversation: () => Conversation;
  setActiveConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;

  // Message actions
  addMessage: (
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ) => void;

  // Loading state
  setLoading: (isLoading: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  conversations: [] as Conversation[],
  activeConversationId: null as string | null,
  isLoading: false,
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      ...initialState,

      createConversation: () => {
        const newConversation: Conversation = {
          id: crypto.randomUUID(),
          title: "New Chat",
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          activeConversationId: newConversation.id,
        }));

        return newConversation;
      },

      setActiveConversation: (id: string | null) => {
        set({ activeConversationId: id });
      },

      deleteConversation: (id: string) => {
        set((state) => {
          const filtered = state.conversations.filter((c) => c.id !== id);
          return {
            conversations: filtered,
            activeConversationId:
              state.activeConversationId === id
                ? filtered[0]?.id || null
                : state.activeConversationId,
          };
        });
      },

      addMessage: (
        conversationId: string,
        role: "user" | "assistant",
        content: string
      ) => {
        const message: ChatMessage = {
          id: crypto.randomUUID(),
          role,
          content,
          timestamp: new Date(),
        };

        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.id !== conversationId) return conv;

            // Update title from first user message
            const title =
              conv.messages.length === 0 && role === "user"
                ? content.slice(0, 30) + (content.length > 30 ? "..." : "")
                : conv.title;

            return {
              ...conv,
              title,
              messages: [...conv.messages, message],
              updatedAt: new Date(),
            };
          }),
        }));
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
      }),
    }
  )
);

// Selector hooks
export const useActiveConversation = () => {
  const { conversations, activeConversationId } = useChatStore();
  return conversations.find((c) => c.id === activeConversationId) || null;
};

export const useIsLoading = () => useChatStore((state) => state.isLoading);
