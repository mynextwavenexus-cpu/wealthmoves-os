"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Sparkles, Lightbulb, Target, TrendingUp, Loader2, Lock, ExternalLink } from "lucide-react";
import { useChat } from "@/lib/chat-context";
import Link from "next/link";

const quickPrompts = [
  { icon: Lightbulb, label: "Generate offer ideas", prompt: "Help me brainstorm offer ideas based on my skills" },
  { icon: Target, label: "Create action plan", prompt: "What's my next best action to generate revenue?" },
  { icon: TrendingUp, label: "Optimize pricing", prompt: "How should I price my current offer?" },
];

export default function CoachPage() {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, clearChat, isAuthenticated } = useChat();

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

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="heading-xl mb-2">AI Revenue Coach</h1>
        <p className="body-lg">
          Meet Emma J™ — your strategic partner for building revenue systems.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Chat Area */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="border-b border-[#E4DCD1]">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0F3F4C] to-[#1a5a6b] rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0F3F4C]">Emma J™</h3>
                <p className="text-xs text-[#AFA496]">AI Revenue Coach</p>
              </div>
              {!isAuthenticated && (
                <div className="ml-auto flex items-center gap-2 text-amber-600 text-xs bg-amber-50 px-3 py-1 rounded-full">
                  <Lock className="w-3 h-3" />
                  Sign in required
                </div>
              )}
            </CardTitle>
          </CardHeader>

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    {message.role === "assistant" ? (
                      <AvatarFallback className="bg-[#0F3F4C] text-white text-xs">EJ</AvatarFallback>
                    ) : (
                      <AvatarFallback className="bg-[#E4DCD1] text-[#0F3F4C] text-xs">You</AvatarFallback>
                    )}
                  </Avatar>
                  <div
                    className={`rounded-lg px-4 py-3 max-w-[80%] ${
                      message.role === "assistant"
                        ? "bg-[#E4DCD1] text-[#0F3F4C]"
                        : "bg-[#0F3F4C] text-white"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-[#0F3F4C] text-white text-xs">EJ</AvatarFallback>
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

          <CardContent className="border-t border-[#E4DCD1] p-4">
            {!isAuthenticated ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-[#AFA496] text-center">
                  Sign in to access personalized AI coaching
                </p>
                <div className="flex gap-2">
                  <Link href="/login" className="flex-1">
                    <Button className="w-full bg-[#0F3F4C] hover:bg-[#0a2f39]">
                      Sign In
                    </Button>
                  </Link>
                  <a 
                    href="https://wealthmoves.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full">
                      Get Access
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Ask Emma J about revenue strategy, offers, systems..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
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
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {!isAuthenticated && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-amber-800">
                  <Lock className="w-4 h-4" />
                  Premium Feature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-700 mb-3">
                  AI coaching is available to WealthMoves members. Sign in or get access to unlock personalized guidance.
                </p>
                <Link href="/login">
                  <Button size="sm" className="w-full bg-[#0F3F4C] hover:bg-[#0a2f39]">
                    Sign In to Access
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickPrompts.map((prompt, i) => {
                const Icon = prompt.icon;
                return (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => isAuthenticated && setInput(prompt.prompt)}
                    disabled={!isAuthenticated || isLoading}
                  >
                    <Icon className="w-4 h-4" />
                    {prompt.label}
                    {!isAuthenticated && <Lock className="w-3 h-3 ml-auto opacity-50" />}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={clearChat}
                disabled={!isAuthenticated || isLoading}
              >
                <Sparkles className="w-4 h-4" />
                New Conversation
                {!isAuthenticated && <Lock className="w-3 h-3 ml-auto opacity-50" />}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[#AFA496]">
                <li>• Revenue opportunity identification</li>
                <li>• Offer creation and pricing</li>
                <li>• System architecture</li>
                <li>• Content strategy</li>
                <li>• Business planning</li>
                <li>• Accountability coaching</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
