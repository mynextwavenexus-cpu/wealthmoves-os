"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bell, Shield, CreditCard, Loader2, Crown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setTimezone("America/Los_Angeles");
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    setMessage("");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMessage("Settings saved successfully!");
    setIsLoading(false);
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="heading-xl mb-2">Settings</h1>
        <Card className="card-wealth">
          <CardContent className="p-6">
            <p className="text-[#AFA496]">Please log in to view your settings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-xl mb-2">Settings</h1>
        <p className="body-lg">
          Manage your account, preferences, and billing.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Membership Level Card */}
          <Card className="card-wealth bg-gradient-to-r from-[#0F3F4C] to-[#1a5a6b] text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Crown className="w-5 h-5" />
                Membership Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold capitalize">{user.tier || "Free"} Plan</p>
                  <p className="text-white/70 text-sm mt-1">
                    {user.tier === "sprint" 
                      ? "Full access to all features" 
                      : user.tier === "pro" 
                        ? "Pro features enabled" 
                        : "Upgrade to unlock more features"}
                  </p>
                </div>
                {user.tier !== "sprint" && (
                  <Button 
                    variant="secondary" 
                    className="bg-white text-[#0F3F4C] hover:bg-white/90"
                    onClick={() => window.location.href = "https://dreamlife-blueprint.vercel.app/#pricing"}
                  >
                    Upgrade
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-[#0F3F4C] text-white text-2xl">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" disabled>Change Avatar</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    value={email} 
                    disabled
                    type="email"
                  />
                  <p className="text-xs text-[#AFA496]">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input 
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="America/Los_Angeles"
                  />
                </div>
              </div>

              {message && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                  {message}
                </div>
              )}

              <Button 
                className="bg-[#0F3F4C] hover:bg-[#0a2f39]"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#AFA496]">Notification settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#AFA496]">Billing settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#AFA496]">Security settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
