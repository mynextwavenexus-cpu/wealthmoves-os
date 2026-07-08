"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Minimize2, Maximize2, Loader2, Save, History, Trash2, X, ChevronDown, Mic, MicOff, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useChat } from "@/lib/chat-context";
import { usePathname } from "next/navigation";
import { coachingModes, CoachingMode, getRelevantQuickActions, UserContext } from "@/lib/ai-modes";

export function AIChatPanel() {
  const pathname = usePathname();
  
  const [isExpanded, setIsExpanded] = useState(true);
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
    const handleExpand = () => setIsExpanded(true);
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
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

  if (!isExpanded) {
    return (
      <div className="w-16 bg-white border-l border-[#E4DCD1] flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(true)}
          className="mb-4"
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
    <div className="w-80 bg-white border-l border-[#E4DCD1] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#E4DCD1]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0F3F4C] to-[#1a5a6b] rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0F3F4C]">Emma J™</h3>
              <p className="text-xs text-[#AFA496]">AI Revenue Coach</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Export Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => exportConversation("txt")}
              title="Export Conversation"
            >
              <Download className="w-4 h-4 text-[#AFA496]" />
            </Button>

            {/* Save Button */}
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSave}
                  title="Save Conversation"
                >
                  <Save className="w-4 h-4 text-[#AFA496]" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
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
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Recall Saved Conversations"
                >
                  <History className="w-4 h-4 text-[#AFA496]" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md max-h-[80vh]">
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
                          className="flex-1 cursor-pointer"
                          onClick={() => handleRecall(conversation)}
                        >
                          <p className="font-medium text-[#0F3F4C] text-sm">{conversation.title}</p>
                          <p className="text-xs text-[#AFA496]">
                            {conversation.messages.length} messages • {new Date(conversation.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteConversation(conversation.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(false)}
            >
              <Minimize2 className="w-4 h-4 text-[#AFA496]" />
            </Button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="relative" ref={modeSelectorRef}>
          <button
            onClick={() => setShowModeSelector(!showModeSelector)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#E4DCD1]/30 hover:bg-[#E4DCD1]/50 transition-colors text-sm"
          >
            <div className="flex items-center gap-2">
              <span>{currentModeConfig?.icon}</span>
              <span className="font-medium text-[#0F3F4C]">{currentModeConfig?.name}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#0F3F4C]/60" />
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
                  className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-[#E4DCD1]/20 transition-colors text-left ${
                    currentMode === mode.id ? "bg-[#E4DCD1]/30" : ""
                  }`}
                >
                  <span>{mode.icon}</span>
                  <span className="text-sm text-[#0F3F4C]">{mode.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="w-8 h-8 shrink-0">
                {message.role === "assistant" ? (
                  <>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-[#0F3F4C] text-white text-xs">
                      EJ
                    </AvatarFallback>
                  </>
                ) : (
                  <>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-[#E4DCD1] text-[#0F3F4C] text-xs">
                      You
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] text-sm ${
                  message.role === "assistant"
                    ? "bg-[#E4DCD1] text-[#0F3F4C]"
                    : "bg-[#0F3F4C] text-white"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-[#0F3F4C] text-white text-xs">
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
        <div className="px-4 py-2 border-t border-[#E4DCD1]/50">
          <div className="flex flex-wrap gap-2">
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
      <div className="p-4 border-t border-[#E4DCD1]">
        <div className="flex gap-2">
          {/* Voice Input */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleVoiceInput}
            className={isRecording ? "text-red-500 animate-pulse" : ""}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          <textarea
            ref={textareaRef}
            placeholder={`Ask Emma J...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none rounded-lg border border-[#E4DCD1] px-3 py-2 text-sm focus:outline-none focus:border-[#0F3F4C] min-h-[40px] max-h-[100px]"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleSend}
            className="bg-[#0F3F4C] hover:bg-[#0a2f39]"
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
          <p className="text-xs text-[#AFA496]">
            {currentModeConfig?.name} mode
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-xs text-[#AFA496] hover:text-[#0F3F4C]"
          >
            New Chat
          </Button>
        </div>
      </div>
    </div>
  );
}
