"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  tier: "starter" | "pro" | "sprint" | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  upgrade: (tier: "starter" | "pro" | "sprint") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await res.json();
    setUser(data.user);
    // Store user's tier for access control
    localStorage.setItem("wealthmoves_tier", data.user.tier || "starter");
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", email, password, name }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Registration failed");
    }

    const data = await res.json();
    setUser(data.user);
    // Store user's tier for access control
    localStorage.setItem("wealthmoves_tier", data.user.tier || "starter");
  };

  const logout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    // Clear user-specific localStorage data
    localStorage.removeItem("wealthmoves_tier");
    localStorage.removeItem("wealthmoves_dreamlife");
    localStorage.removeItem("wealthmoves_chat_history");
    setUser(null);
  };

  const upgrade = async (tier: "starter" | "pro" | "sprint") => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upgrade", tier }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Upgrade failed");
    }

    const data = await res.json();
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, upgrade }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
