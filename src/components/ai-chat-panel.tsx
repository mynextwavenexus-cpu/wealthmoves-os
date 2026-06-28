"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Minimize2, Maximize2, Loader2, Save, History, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useChat } from "@/lib/chat-context";

export function AIChatPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [input, setInput] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showRecallDialog, setShowRecallDialog] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    isLoading, 
    savedConversations, 
    sendMessage, 
    clearChat, 
    saveConversation, 
    loadConversation, 
    deleteConversation 
  } = useChat();

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
      <div className="p-4 border-b border-[#E4DCD1] flex items-center justify-between">
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
          {/* Save Button */}
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger>
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
            <DialogTrigger>
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

      {/* Input */}
      <div className="p-4 border-t border-[#E4DCD1]">
        <div className="flex gap-2">
          <Input
            placeholder="Ask Emma J..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleSend}
            className="bg-[#0F3F4C] hover:bg-[#0a2f39]"
            disabled={isLoading}
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
            Powered by WealthMoves AI
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
