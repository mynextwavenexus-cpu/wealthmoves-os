import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { AIChatPanel } from "@/components/ai-chat-panel";
import { AuthProvider } from "@/lib/auth-context";
import { DataProvider } from "@/lib/data-context";
import { ChatProvider } from "@/lib/chat-context";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "WealthMoves OS - Dream. Plan. Build. Automate. Generate Revenue.",
  description: "The complete operating system for building AI-powered revenue systems. Dream Life Blueprint, Revenue Planner, Offer Builder, and AI Revenue Coach in one platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <DataProvider>
            <ChatProvider>
              <div className="flex h-screen bg-[#E4DCD1]">
                {/* Left Sidebar */}
                <Sidebar />
                
                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                  <TopBar />
                  <main className="flex-1 overflow-auto p-6">
                    {children}
                  </main>
                </div>
                
                {/* Right AI Chat Panel */}
                <AIChatPanel />
              </div>
            </ChatProvider>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
