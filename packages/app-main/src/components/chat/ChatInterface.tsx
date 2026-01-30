"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@common/components/ui/Button";
import {
  useChatStore,
  useActiveConversation,
  useIsLoading,
} from "@/lib/stores/chatStore";
import { cn } from "@common/lib/utils";

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    conversations,
    createConversation,
    setActiveConversation,
    deleteConversation,
    addMessage,
    setLoading,
  } = useChatStore();

  const activeConversation = useActiveConversation();
  const isLoading = useIsLoading();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

  // Create initial conversation if none exists
  useEffect(() => {
    if (conversations.length === 0) {
      createConversation();
    }
  }, [conversations.length, createConversation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !activeConversation) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message
    addMessage(activeConversation.id, "user", userMessage);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationId: activeConversation.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      addMessage(activeConversation.id, "assistant", data.response);
    } catch (error) {
      console.error("Chat error:", error);
      addMessage(
        activeConversation.id,
        "assistant",
        "Sorry, I encountered an error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={cn("flex h-full", className)}>
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-3 border-b">
          <Button
            onClick={() => createConversation()}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-muted",
                activeConversation?.id === conv.id && "bg-muted"
              )}
              onClick={() => setActiveConversation(conv.id)}
            >
              <span className="truncate text-sm">{conv.title}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeConversation?.messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">GTA Commuter Assistant</p>
                <p className="text-sm mt-1">
                  Ask about weather, commute times, or GO Train schedules
                </p>
              </div>
            </div>
          )}

          {activeConversation?.messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about weather, commute times, or GO Train schedules..."
              className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm min-h-[44px] max-h-32"
              rows={1}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
