"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Zap, Loader2, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E4DCD1] p-4">
      <Card className="w-full max-w-md card-wealth">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#0F3F4C] rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#E4DCD1]" />
            </div>
          </div>
          <CardTitle className="text-2xl text-[#0F3F4C]">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-[#AFA496]">
            Sign in to access your WealthMoves dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#0F3F4C]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#0F3F4C]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white"
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-[#0F3F4C] hover:bg-[#0a2f39]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E4DCD1]">
            <div className="text-center">
              <p className="text-sm text-[#AFA496] mb-3">
                Don't have access yet?
              </p>
              <a
                href="https://dreamlife-blueprint.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#0F3F4C] font-medium hover:underline"
              >
                Get Access on Our Sales Page
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-[#AFA496]">
            <p>Each account has its own private, segmented data.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
