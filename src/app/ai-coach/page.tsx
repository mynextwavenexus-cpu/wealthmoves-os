"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Send, Sparkles, Loader2, Mic, MicOff, Download, Search, X, ChevronDown } from "lucide-react";
import { coachingModes, CoachingMode, getRelevantQuickActions, QuickAction, UserContext } from "@/lib/ai-modes";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  mode?: CoachingMode;
}

export default function AICoach() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [currentMode, setCurrentMode] = useState<CoachingMode>("general");
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modeSelectorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history and user context on mount
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      loadChatHistory();
      loadUserContext();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close mode selector when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modeSelectorRef.current && !modeSelectorRef.current.contains(event.target as Node)) {
        setShowModeSelector(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Update quick actions when context changes
  useEffect(() => {
    if (userContext) {
      setQuickActions(getRelevantQuickActions(userContext));
    }
  }, [userContext]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function loadChatHistory() {
    try {
      const response = await fetch("/api/chat");
      if (response.ok) {
        const data = await response.json();
        setMessages(
          data.history.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            mode: msg.mode,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function loadUserContext() {
    try {
      const response = await fetch("/api/chat", { method: "PATCH" });
      if (response.ok) {
        const data = await response.json();
        setUserContext(data.context);
      }
    } catch (error) {
      console.error("Failed to load user context:", error);
    }
  }

  async function sendMessage(customMessage?: string) {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || sending) return;

    const userMessage: Message = {
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend, mode: currentMode }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          mode: data.mode,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Refresh context after each message for up-to-date quick actions
        loadUserContext();
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

  function handleQuickAction(action: QuickAction) {
    sendMessage(action.prompt);
  }

  function toggleVoiceInput() {
    if (!isRecording) {
      // Start recording
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        
        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
        };
        recognition.onerror = () => setIsRecording(false);
        
        recognition.start();
      } else {
        alert("Voice input is not supported in your browser.");
      }
    } else {
      setIsRecording(false);
    }
  }

  function exportChat() {
    const chatText = messages
      .map((m) => `${m.role === "user" ? "You" : "Emma J™"} (${m.timestamp.toLocaleString()}):\n${m.content}\n`)
      .join("\n---\n\n");
    
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

  const filteredMessages = searchQuery
    ? messages.filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const currentModeConfig = coachingModes.find((m) => m.id === currentMode);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F3F4C]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-[#0F3F4C]/10 px-6 py-4">
        <div className="flex items-center justify-between">
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
          
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-lg hover:bg-[#E4DCD1]/50 transition-colors"
              title="Search chat history"
            >
              <Search className="w-5 h-5 text-[#0F3F4C]/60" />
            </button>
            
            {/* Export Button */}
            <button
              onClick={exportChat}
              className="p-2 rounded-lg hover:bg-[#E4DCD1]/50 transition-colors"
              title="Export conversation"
            >
              <Download className="w-5 h-5 text-[#0F3F4C]/60" />
            </button>
            
            {/* Mode Selector */}
            <div className="relative" ref={modeSelectorRef}>
              <button
                onClick={() => setShowModeSelector(!showModeSelector)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E4DCD1]/30 hover:bg-[#E4DCD1]/50 transition-colors"
              >
                <span>{currentModeConfig?.icon}</span>
                <span className="text-sm font-medium text-[#0F3F4C]">{currentModeConfig?.name}</span>
                <ChevronDown className="w-4 h-4 text-[#0F3F4C]/60" />
              </button>
              
              {showModeSelector && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-[#0F3F4C]/10 z-50 py-2">
                  <div className="px-3 py-2 text-xs font-semibold text-[#0F3F4C]/40 uppercase tracking-wider">
                    Coaching Mode
                  </div>
                  {coachingModes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setCurrentMode(mode.id);
                        setShowModeSelector(false);
                      }}
                      className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-[#E4DCD1]/20 transition-colors ${
                        currentMode === mode.id ? "bg-[#E4DCD1]/30" : ""
                      }`}
                    >
                      <span className="text-xl">{mode.icon}</span>
                      <div className="text-left">
                        <div className="font-medium text-[#0F3F4C]">{mode.name}</div>
                        <div className="text-xs text-[#0F3F4C]/60">{mode.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        {showSearch && (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F3F4C]/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversation history..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#0F3F4C]/20 focus:outline-none focus:border-[#0F3F4C]"
                autoFocus
              />
            </div>
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
              className="p-2 rounded-lg hover:bg-[#E4DCD1]/50 transition-colors"
            >
              <X className="w-5 h-5 text-[#0F3F4C]/60" />
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#E4DCD1]/30">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-[#0F3F4C] animate-spin" />
          </div>
        ) : filteredMessages.length === 0 && !searchQuery ? (
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
            
            {/* Quick Actions */}
            {quickActions.length > 0 && (
              <div className="w-full max-w-2xl">
                <p className="text-sm font-medium text-[#0F3F4C]/60 mb-3">Quick Actions</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      className="p-4 text-left rounded-lg border border-[#0F3F4C]/20 hover:border-[#0F3F4C]/40 hover:bg-white transition-colors"
                    >
                      <div className="font-medium text-[#0F3F4C]">{action.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : filteredMessages.length === 0 && searchQuery ? (
          <div className="flex items-center justify-center h-full text-[#0F3F4C]/60">
            No messages found matching "{searchQuery}"
          </div>
        ) : (
          <>
            {filteredMessages.map((msg, idx) => (
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
                      {msg.mode && msg.mode !== "general" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#0F3F4C]/10">
                          {coachingModes.find((m) => m.id === msg.mode)?.name}
                        </span>
                      )}
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

      {/* Quick Actions Bar (when there are messages) */}
      {messages.length > 0 && !searchQuery && quickActions.length > 0 && (
        <div className="bg-white border-t border-[#0F3F4C]/10 px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-xs font-medium text-[#0F3F4C]/40 whitespace-nowrap">Quick:</span>
            {quickActions.slice(0, 4).map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="px-3 py-1.5 text-sm rounded-full bg-[#E4DCD1]/30 hover:bg-[#E4DCD1]/50 text-[#0F3F4C] whitespace-nowrap transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-[#0F3F4C]/10 p-4">
        <div className="flex gap-3">
          {/* Voice Input Button */}
          <button
            onClick={toggleVoiceInput}
            className={`p-3 rounded-xl transition-colors ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-[#E4DCD1]/30 text-[#0F3F4C] hover:bg-[#E4DCD1]/50"
            }`}
            title={isRecording ? "Stop recording" : "Voice input"}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask Emma J${currentMode !== "general" ? ` (${currentModeConfig?.name})` : ""}...`}
            className="flex-1 resize-none rounded-xl border border-[#0F3F4C]/20 px-4 py-3 focus:outline-none focus:border-[#0F3F4C] transition-colors"
            rows={1}
            style={{ minHeight: "48px", maxHeight: "200px" }}
            disabled={sending}
          />
          <button
            onClick={() => sendMessage()}
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
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-[#0F3F4C]/40">
            Mode: <span className="font-medium">{currentModeConfig?.name}</span> • 
            Conversations are saved automatically
          </p>
          {isRecording && (
            <p className="text-xs text-red-500 animate-pulse">Listening...</p>
          )}
        </div>
      </div>
    </div>
  );
}
