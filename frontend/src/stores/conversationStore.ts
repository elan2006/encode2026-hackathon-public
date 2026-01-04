import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Conversation, Message, Attachment } from "@/types";
import { analyzeProduct } from "@/lib/api";

interface ConversationState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isAnalyzing: boolean;
  isOffline: boolean;

  // Actions
  setActiveConversation: (id: string | null) => void;
  startNewConversation: () => void;
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  setOffline: (offline: boolean) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const generateTitle = (content: string): string => {
  const words = content.trim().split(/\s+/).slice(0, 6);
  return words.join(" ") + (content.split(/\s+/).length > 6 ? "..." : "");
};

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isAnalyzing: false,
      isOffline: false,

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },

      startNewConversation: () => {
        set({ activeConversationId: null });
      },

      sendMessage: async (content, attachments) => {
        const state = get();

        const userMessage: Message = {
          id: generateId(),
          role: "user",
          content,
          attachments,
          timestamp: new Date(),
        };

        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isLoading: true,
        };

        let conversationId = state.activeConversationId;
        let conversations = [...state.conversations];

        if (!conversationId) {
          // Create new conversation
          conversationId = generateId();
          const newConversation: Conversation = {
            id: conversationId,
            title: generateTitle(content),
            messages: [userMessage, assistantMessage],
            status: "analyzing",
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          conversations = [newConversation, ...conversations];
        } else {
          // Add to existing conversation
          conversations = conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, userMessage, assistantMessage],
                  status: "analyzing" as const,
                  updatedAt: new Date(),
                }
              : conv,
          );
        }

        set({
          conversations,
          activeConversationId: conversationId,
          isAnalyzing: true,
        });

        try {
          // Get conversation history (exclude the current assistant message being generated)
          const currentConversation = conversations.find(
            (c) => c.id === conversationId,
          );
          const historyMessages =
            currentConversation?.messages.slice(0, -1) || [];

          const response = await analyzeProduct({
            message: content,
            image: attachments?.find((a) => a.type === "image")?.value,
            barcode: attachments?.find((a) => a.type === "barcode")?.value,
            conversationId,
            history: historyMessages,
          });

          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    messages: conv.messages.map((msg) =>
                      msg.id === assistantMessage.id
                        ? {
                            ...msg,
                            content: response.artifactMarkdown,
                            isLoading: false,
                          }
                        : msg,
                    ),
                    status: "done" as const,
                    updatedAt: new Date(),
                  }
                : conv,
            ),
            isAnalyzing: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Analysis failed";

          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    messages: conv.messages.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, error: errorMessage, isLoading: false }
                        : msg,
                    ),
                    status: "failed" as const,
                    updatedAt: new Date(),
                  }
                : conv,
            ),
            isAnalyzing: false,
          }));
        }
      },

      retryMessage: async (messageId) => {
        const state = get();
        const conversation = state.conversations.find(
          (c) => c.id === state.activeConversationId,
        );

        if (!conversation) return;

        const messageIndex = conversation.messages.findIndex(
          (m) => m.id === messageId,
        );
        if (messageIndex === -1) return;

        // Find the user message before this assistant message
        let userMessage: Message | undefined;
        for (let i = messageIndex - 1; i >= 0; i--) {
          if (conversation.messages[i].role === "user") {
            userMessage = conversation.messages[i];
            break;
          }
        }

        if (!userMessage) return;

        // Reset the message state
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === state.activeConversationId
              ? {
                  ...conv,
                  messages: conv.messages.map((msg) =>
                    msg.id === messageId
                      ? { ...msg, error: undefined, isLoading: true }
                      : msg,
                  ),
                  status: "analyzing" as const,
                }
              : conv,
          ),
          isAnalyzing: true,
        }));

        try {
          // Get conversation history (exclude the failed message)
          const historyMessages = conversation.messages.filter(
            (msg) => msg.id !== messageId,
          );

          const response = await analyzeProduct({
            message: userMessage.content,
            image: userMessage.attachments?.find((a) => a.type === "image")
              ?.value,
            barcode: userMessage.attachments?.find((a) => a.type === "barcode")
              ?.value,
            conversationId: conversation.id,
            history: historyMessages,
          });

          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === state.activeConversationId
                ? {
                    ...conv,
                    messages: conv.messages.map((msg) =>
                      msg.id === messageId
                        ? {
                            ...msg,
                            content: response.artifactMarkdown,
                            isLoading: false,
                          }
                        : msg,
                    ),
                    status: "done" as const,
                    updatedAt: new Date(),
                  }
                : conv,
            ),
            isAnalyzing: false,
          }));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Analysis failed";

          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === state.activeConversationId
                ? {
                    ...conv,
                    messages: conv.messages.map((msg) =>
                      msg.id === messageId
                        ? { ...msg, error: errorMessage, isLoading: false }
                        : msg,
                    ),
                    status: "failed" as const,
                  }
                : conv,
            ),
            isAnalyzing: false,
          }));
        }
      },

      setOffline: (offline) => {
        set({ isOffline: offline });
      },
    }),
    {
      name: "vitascan-conversations",
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
      }),
    },
  ),
);

// Selector hooks for performance
export const useActiveConversation = () => {
  return useConversationStore((state) => {
    if (!state.activeConversationId) return null;
    return (
      state.conversations.find((c) => c.id === state.activeConversationId) ||
      null
    );
  });
};
