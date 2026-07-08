"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./auth-context";
import { CoachingMode } from "./ai-modes";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  mode?: CoachingMode;
}

export interface SavedConversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  savedConversations: SavedConversation[];
  isAuthenticated: boolean;
  currentMode: CoachingMode;
  setCurrentMode: (mode: CoachingMode) => void;
  sendMessage: (content: string, mode?: CoachingMode) => Promise<void>;
  clearChat: () => void;
  saveConversation: (title?: string) => void;
  loadConversation: (conversation: SavedConversation) => void;
  deleteConversation: (id: string) => void;
  exportConversation: (format: "txt" | "pdf") => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = "wealthmoves_chat_messages";
const SAVED_CONVERSATIONS_KEY = "wealthmoves_saved_conversations";
const CHAT_MODE_KEY = "wealthmoves_chat_mode";

const defaultWelcomeMessage = (userName?: string): Message => ({
  id: "welcome",
  role: "assistant",
  content: `Hi${userName ? ` ${userName.split(" ")[0]}` : ""}! I'm Emma J™, your AI Revenue Coach. I'm here to help you identify income opportunities, build offers, and create systems that generate revenue. What would you like to work on today?`,
  timestamp: new Date(),
});

const unauthenticatedMessage: Message = {
  id: "unauthenticated",
  role: "assistant",
  content: "Hi! I'm Emma J™, your AI Revenue Coach. To access personalized coaching and save your conversations, please sign in to your WealthMoves account. If you don't have access yet, you can purchase access through our sales page.",
  timestamp: new Date(),
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  const [messages, setMessages] = useState<Message[]>(
    isAuthenticated ? [defaultWelcomeMessage(user?.name)] : [unauthenticatedMessage]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [savedConversations, setSavedConversations] = useState<SavedConversation[]>([]);
  const [currentMode, setCurrentModeState] = useState<CoachingMode>("general");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved mode from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem(CHAT_MODE_KEY) as CoachingMode;
      if (savedMode && ["general", "offer-review", "revenue-strategist", "accountability", "technical"].includes(savedMode)) {
        setCurrentModeState(savedMode);
      }
    }
  }, []);

  // Save mode to localStorage when it changes
  const setCurrentMode = useCallback((mode: CoachingMode) => {
    setCurrentModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem(CHAT_MODE_KEY, mode);
    }
  }, []);

  // Update welcome message when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      setMessages([defaultWelcomeMessage(user?.name)]);
    } else {
      setMessages([unauthenticatedMessage]);
    }
  }, [isAuthenticated, user?.name]);

  // Load messages and saved conversations from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated) {
      // Load current chat
      const savedMessages = localStorage.getItem(STORAGE_KEY);
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          if (parsed.length > 0) {
            setMessages(parsed.map((m: Message) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            })));
          }
        } catch (e) {
          console.error("Failed to load chat messages:", e);
          setMessages([defaultWelcomeMessage(user?.name)]);
        }
      }

      // Load saved conversations
      const saved = localStorage.getItem(SAVED_CONVERSATIONS_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSavedConversations(parsed.map((c: SavedConversation) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
            messages: c.messages.map((m: Message) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            })),
          })));
        } catch (e) {
          console.error("Failed to load saved conversations:", e);
        }
      }

      setIsInitialized(true);
    }
  }, [isAuthenticated, user?.name]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined" && isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, isInitialized, isAuthenticated]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined" && isAuthenticated) {
      localStorage.setItem(SAVED_CONVERSATIONS_KEY, JSON.stringify(savedConversations));
    }
  }, [savedConversations, isInitialized, isAuthenticated]);

  const sendMessage = useCallback(async (content: string, mode?: CoachingMode) => {
    if (!content.trim() || isLoading) return;

    const messageMode = mode || currentMode;

    // If not authenticated, show sign-in prompt
    if (!isAuthenticated) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      
      const signInPrompt: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'd love to help you with that! To access personalized AI coaching, please sign in to your WealthMoves account. Don't have access yet? Visit our sales page to get started.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, userMessage, signInPrompt]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, mode: messageMode }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(data.timestamp),
          mode: data.mode,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else if (res.status === 401) {
        const signInPrompt: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Please sign in to continue our conversation. If you need access, visit our sales page to get started.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, signInPrompt]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isAuthenticated, currentMode]);

  const clearChat = useCallback(() => {
    setMessages(isAuthenticated ? [defaultWelcomeMessage(user?.name)] : [unauthenticatedMessage]);
    if (typeof window !== "undefined" && isAuthenticated) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isAuthenticated, user?.name]);

  const saveConversation = useCallback((title?: string) => {
    if (!isAuthenticated) {
      alert("Please sign in to save conversations!");
      return;
    }
    
    if (messages.length <= 1) {
      alert("Start a conversation before saving!");
      return;
    }

    const conversationTitle = title?.trim() || `Conversation ${savedConversations.length + 1}`;
    const newConversation: SavedConversation = {
      id: Date.now().toString(),
      title: conversationTitle,
      messages: [...messages],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSavedConversations((prev) => [newConversation, ...prev]);
  }, [messages, savedConversations.length, isAuthenticated]);

  const loadConversation = useCallback((conversation: SavedConversation) => {
    if (!isAuthenticated) {
      alert("Please sign in to load saved conversations!");
      return;
    }
    setMessages([...conversation.messages]);
  }, [isAuthenticated]);

  const deleteConversation = useCallback((id: string) => {
    if (!isAuthenticated) return;
    setSavedConversations((prev) => prev.filter((c) => c.id !== id));
  }, [isAuthenticated]);

  const exportConversation = useCallback((format: "txt" | "pdf") => {
    if (messages.length <= 1) {
      alert("No conversation to export!");
      return;
    }

    const chatText = messages
      .map((m) => `${m.role === "user" ? "You" : "Emma J™"} (${new Date(m.timestamp).toLocaleString()}):\n${m.content}\n`)
      .join("\n---\n\n");

    if (format === "txt") {
      const blob = new Blob([chatText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `emma-j-chat-${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // PDF export would require a library like jsPDF
      // For now, fall back to text
      const blob = new Blob([chatText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `emma-j-chat-${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        savedConversations,
        isAuthenticated,
        currentMode,
        setCurrentMode,
        sendMessage,
        clearChat,
        saveConversation,
        loadConversation,
        deleteConversation,
        exportConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
