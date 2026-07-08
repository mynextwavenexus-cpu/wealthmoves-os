"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Send, Sparkles, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AICoach() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function loadChatHistory() {
    try {
      const response = await fetch("/api/chat");
      if (response.ok) {
        const history = await response.json();
        setMessages(
          history.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F3F4C]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#0F3F4C]/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F3F4C] to-[#0F3F4C]/80 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0F3F4C]">Emma J™ AI Revenue Coach</h1>
            <p className="text-sm text-[#0F3F4C]/60">
              Your personal AI coach for building revenue systems
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#E4DCD1]/30">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-[#0F3F4C] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0F3F4C] to-[#0F3F4C]/80 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#0F3F4C] mb-2">
              Hey {user.name?.split(" ")[0]}! 👋
            </h2>
            <p className="text-[#0F3F4C]/60 max-w-md mb-6">
              I'm Emma J™, your AI revenue coach. I'm here to help you build profitable systems, 
              create offers, and grow your income. What would you like to work on today?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              <button
                onClick={() => setInput("Help me create my first revenue stream")}
                className="p-4 text-left rounded-lg border border-[#0F3F4C]/20 hover:border-[#0F3F4C]/40 hover:bg-white transition-colors"
              >
                <div className="font-medium text-[#0F3F4C] mb-1">💰 First Revenue Stream</div>
                <div className="text-sm text-[#0F3F4C]/60">Get started making money</div>
              </button>
              <button
                onClick={() => setInput("How do I build an automated revenue system?")}
                className="p-4 text-left rounded-lg border border-[#0F3F4C]/20 hover:border-[#0F3F4C]/40 hover:bg-white transition-colors"
              >
                <div className="font-medium text-[#0F3F4C] mb-1">⚙️ Automate Revenue</div>
                <div className="text-sm text-[#0F3F4C]/60">Build systems that work 24/7</div>
              </button>
              <button
                onClick={() => setInput("What's the fastest way to hit $10K/month?")}
                className="p-4 text-left rounded-lg border border-[#0F3F4C]/20 hover:border-[#0F3F4C]/40 hover:bg-white transition-colors"
              >
                <div className="font-medium text-[#0F3F4C] mb-1">🎯 Hit $10K/Month</div>
                <div className="text-sm text-[#0F3F4C]/60">Fast-track to 5 figures</div>
              </button>
              <button
                onClick={() => setInput("Review my dream life blueprint and revenue plan")}
                className="p-4 text-left rounded-lg border border-[#0F3F4C]/20 hover:border-[#0F3F4C]/40 hover:bg-white transition-colors"
              >
                <div className="font-medium text-[#0F3F4C] mb-1">📊 Strategy Review</div>
                <div className="text-sm text-[#0F3F4C]/60">Optimize your plan</div>
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-[#0F3F4C] text-white"
                      : "bg-white text-[#0F3F4C] border border-[#0F3F4C]/10"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2 text-sm opacity-70">
                      <Sparkles className="w-3 h-3" />
                      <span>Emma J™</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div
                    className={`text-xs mt-2 ${
                      msg.role === "user" ? "text-white/60" : "text-[#0F3F4C]/40"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white text-[#0F3F4C] border border-[#0F3F4C]/10 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-sm opacity-70 mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>Emma J™</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-[#0F3F4C]/10 p-4">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about building revenue systems..."
            className="flex-1 resize-none rounded-xl border border-[#0F3F4C]/20 px-4 py-3 focus:outline-none focus:border-[#0F3F4C] transition-colors"
            rows={1}
            style={{ minHeight: "48px", maxHeight: "120px" }}
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="bg-[#0F3F4C] text-white rounded-xl px-6 hover:bg-[#0F3F4C]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-[#0F3F4C]/40 mt-2 text-center">
          Emma J™ is powered by Claude AI. Conversations are saved to help track your progress.
        </p>
      </div>
    </div>
  );
}
