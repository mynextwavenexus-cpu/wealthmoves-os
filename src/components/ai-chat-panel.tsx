"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Minimize2, Maximize2, Loader2, Save, History, Trash2, X, ChevronDown, Mic, MicOff, Download, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useChat } from "@/lib/chat-context";
import { usePathname } from "next/navigation";
import { coachingModes, getRelevantQuickActions, UserContext } from "@/lib/ai-modes";
import { cn } from "@/lib/utils";

export function AIChatPanel() {
  const pathname = usePathname();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [input, setInput] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showRecallDialog, setShowRecallDialog] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("");
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [quickActions, setQuickActions] = useState<ReturnType<typeof getRelevantQuickActions>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const modeSelectorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    messages, 
    isLoading, 
    savedConversations, 
    currentMode,
    setCurrentMode,
    sendMessage, 
    clearChat, 
    saveConversation, 
    loadConversation, 
    deleteConversation,
    exportConversation,
  } = useChat();

  const currentModeConfig = coachingModes.find((m) => m.id === currentMode);

  // Listen for expand event from revenue page
  useEffect(() => {
    const handleExpand = () => {
      setIsExpanded(true);
      setIsMobileOpen(true);
    };
    window.addEventListener('expand-chat', handleExpand);
    return () => window.removeEventListener('expand-chat', handleExpand);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [input]);

  // Load user context for quick actions
  useEffect(() => {
    async function loadContext() {
      try {
        const response = await fetch("/api/chat", { method: "PATCH" });
        if (response.ok) {
          const data = await response.json();
          setUserContext(data.context);
        }
      } catch (error) {
        console.error("Failed to load context:", error);
      }
    }
    loadContext();
  }, []);

  // Update quick actions when context changes
  useEffect(() => {
    if (userContext) {
      setQuickActions(getRelevantQuickActions(userContext));
    }
  }, [userContext]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    await sendMessage(input);
    setInput("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleSave = () => {
    if (messages.length <= 1) {
      alert("Start a conversation before saving!");
      return;
    }
    setShowSaveDialog(true);
  };

  const confirmSave = () => {
    saveConversation(conversationTitle);
    setConversationTitle("");
    setShowSaveDialog(false);
  };

  const handleRecall = (conversation: typeof savedConversations[0]) => {
    loadConversation(conversation);
    setShowRecallDialog(false);
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const toggleVoiceInput = () => {
    if (!isRecording) {
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Collapsed state - desktop only
  if (!isExpanded) {
    return (
      <div className="hidden md:flex w-16 bg-white border-l border-[#E4DCD1] flex-col items-center py-4 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(true)}
          className="mb-4 h-10 w-10"
        >
          <Maximize2 className="w-5 h-5 text-[#AFA496]" />
        </Button>
        <div className="w-10 h-10 bg-[#0F3F4C] rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Floating Action Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed bottom-4 right-4 z-30 md:hidden w-14 h-14 bg-[#0F3F4C] rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Open AI Coach"
      >
        <MessageSquare className="w-6 h-6 text-white" />
      </button>

      {/* Chat Panel - Always overlay, never takes up layout space */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 bg-white border-l border-[#E4DCD1] flex flex-col transition-transform duration-300 ease-in-out",
        "w-full sm:w-[380px] md:w-80",
        isMobileOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-[#E4DCD1] shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#0F3F4C] to-[#1a5a6b] rounded-full flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[#0F3F4C] text-sm sm:text-base truncate">Emma J™</h3>
                <p className="text-xs text-[#AFA496]">AI Revenue Coach</p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Export Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => exportConversation("txt")}
                title="Export Conversation"
                className="hidden sm:flex h-9 w-9"
              >
                <Download className="w-4 h-4 text-[#AFA496]" />
              </Button>

              {/* Save Button */}
              <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                <DialogTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSave}
                    title="Save Conversation"
                    className="hidden sm:flex h-9 w-9"
                  >
                    <Save className="w-4 h-4 text-[#AFA496]" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md mx-4">
                  <DialogHeader>
                    <DialogTitle>Save Conversation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      placeholder="Enter a title for this conversation..."
                      value={conversationTitle}
                      onChange={(e) => setConversationTitle(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={confirmSave} className="bg-[#0F3F4C] hover:bg-[#0a2f39]">
                        Save
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Recall Button */}
              <Dialog open={showRecallDialog} onOpenChange={setShowRecallDialog}>
                <DialogTrigger >
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Recall Saved Conversations"
                    className="hidden sm:flex h-9 w-9"
                  >
                    <History className="w-4 h-4 text-[#AFA496]" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md max-h-[80vh] mx-4">
                  <DialogHeader>
                    <DialogTitle>Saved Conversations</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 py-4 overflow-y-auto max-h-[60vh]">
                    {savedConversations.length === 0 ? (
                      <p className="text-center text-[#AFA496] py-8">No saved conversations yet.</p>
                    ) : (
                      savedConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className="flex items-center justify-between p-3 bg-[#E4DCD1]/30 rounded-lg hover:bg-[#E4DCD1]/50 transition-colors"
                        >
                          <div
                            className="flex-1 cursor-pointer min-w-0"
                            onClick={() => handleRecall(conversation)}
                          >
                            <p className="font-medium text-[#0F3F4C] text-sm truncate">{conversation.title}</p>
                            <p className="text-xs text-[#AFA496]">
                              {conversation.messages.length} messages • {new Date(conversation.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteConversation(conversation.id)}
                            className="text-red-500 hover:text-red-700 h-8 w-8 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Close button for mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileOpen(false)}
                className="md:hidden h-9 w-9"
              >
                <X className="w-5 h-5 text-[#AFA496]" />
              </Button>

              {/* Collapse button for desktop */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
                className="hidden md:flex h-9 w-9"
              >
                <Minimize2 className="w-4 h-4 text-[#AFA496]" />
              </Button>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="relative" ref={modeSelectorRef}>
            <button
              onClick={() => setShowModeSelector(!showModeSelector)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-[#E4DCD1]/30 hover:bg-[#E4DCD1]/50 transition-colors text-sm min-h-[44px]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0">{currentModeConfig?.icon}</span>
                <span className="font-medium text-[#0F3F4C] truncate">{currentModeConfig?.name}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#0F3F4C]/60 shrink-0" />
            </button>
            
            {showModeSelector && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-[#E4DCD1] z-50 py-1">
                {coachingModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setCurrentMode(mode.id);
                      setShowModeSelector(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2.5 flex items-center gap-2 hover:bg-[#E4DCD1]/20 transition-colors text-left min-h-[44px]",
                      currentMode === mode.id ? "bg-[#E4DCD1]/30" : ""
                    )}
                  >
                    <span className="shrink-0">{mode.icon}</span>
                    <span className="text-sm text-[#0F3F4C] truncate">{mode.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollRef}>
          <div className="space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2 sm:gap-3",
                  message.role === "user" ? "flex-row-reverse" : ""
                )}
              >
                <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
                  {message.role === "assistant" ? (
                    <AvatarFallback className="bg-[#0F3F4C] text-white text-[10px] sm:text-xs">
                      EJ
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-[#E4DCD1] text-[#0F3F4C] text-[10px] sm:text-xs">
                      You
                    </AvatarFallback>
                  )}
                </Avatar>
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 max-w-[85%] sm:max-w-[80%] text-sm",
                    message.role === "assistant"
                      ? "bg-[#E4DCD1] text-[#0F3F4C]"
                      : "bg-[#0F3F4C] text-white"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 sm:gap-3">
                <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
                  <AvatarFallback className="bg-[#0F3F4C] text-white text-[10px] sm:text-xs">
                    EJ
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-3 bg-[#E4DCD1] text-[#0F3F4C] flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#0F3F4C] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-[#0F3F4C] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-[#0F3F4C] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div className="px-3 sm:px-4 py-2 border-t border-[#E4DCD1]/50 shrink-0">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {quickActions.slice(0, 3).map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="px-2 py-1 text-xs rounded-full bg-[#E4DCD1]/30 hover:bg-[#E4DCD1]/50 text-[#0F3F4C] transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 sm:p-4 border-t border-[#E4DCD1] shrink-0">
          <div className="flex gap-2">
            {/* Voice Input */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoiceInput}
              className={cn(
                "shrink-0 h-11 w-11",
                isRecording ? "text-red-500 animate-pulse" : ""
              )}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            <textarea
              ref={textareaRef}
              placeholder="Ask Emma J..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 resize-none rounded-lg border border-[#E4DCD1] px-3 py-2.5 text-sm focus:outline-none focus:border-[#0F3F4C] focus:ring-1 focus:ring-[#0F3F4C] min-h-[44px] max-h-[100px]"
              disabled={isLoading}
              rows={1}
            />
            <Button
              size="icon"
              onClick={handleSend}
              className="bg-[#0F3F4C] hover:bg-[#0a2f39] shrink-0 h-11 w-11"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-[#AFA496] truncate">
              {currentModeConfig?.name} mode
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-xs text-[#AFA496] hover:text-[#0F3F4C] h-auto py-1 px-2"
            >
              New Chat
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
