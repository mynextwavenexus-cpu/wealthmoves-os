"use client";

import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { AIChatPanel } from "@/components/ai-chat-panel";
import { AuthProvider } from "@/lib/auth-context";
import { DataProvider } from "@/lib/data-context";
import { ChatProvider } from "@/lib/chat-context";
import { useState } from "react";

export function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <DataProvider>
        <ChatProvider>
          <div className="flex h-screen bg-[#E4DCD1] overflow-hidden">
            {/* Left Sidebar - Always overlay */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content - Full width */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
              <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
                {children}
              </main>
            </div>

            {/* Right AI Chat Panel - Always overlay */}
            <AIChatPanel />
          </div>
        </ChatProvider>
      </DataProvider>
    </AuthProvider>
  );
}
