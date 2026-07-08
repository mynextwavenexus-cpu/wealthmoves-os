"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Settings,
  Shield,
  Mail,
  BarChart3,
  Loader2,
  RefreshCw,
  UserCheck,
  UserX,
  Crown,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  tier: "starter" | "pro" | "sprint" | null;
  createdAt: string;
  lastLogin: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  newUsersToday: number;
}

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    // Check if user is admin
    if (user && user.email !== "emma@wealthmoves.ai") {
      router.push("/dashboard");
      return;
    }

    if (user) {
      loadAdminData();
    }
  }, [user, isLoading, router]);

  async function loadAdminData() {
    try {
      setLoading(true);
      
      // Fetch users
      const usersRes = await fetch("/api/admin/users");
      const usersData = usersRes.ok ? await usersRes.json() : [];
      setUsers(usersData.users || []);

      // Fetch stats
      const statsRes = await fetch("/api/admin/stats");
      const statsData = statsRes.ok ? await statsRes.json() : null;
      setStats(statsData);
      
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateUserTier(userId: string, tier: string) {
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tier }),
      });
      loadAdminData();
    } catch (error) {
      console.error("Failed to update user tier:", error);
    }
  }

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3F4C]" />
      </div>
    );
  }

  if (!user || user.email !== "emma@wealthmoves.ai") {
    return null;
  }

  const starterUsers = users.filter(u => u.tier === "starter" || !u.tier).length;
  const proUsers = users.filter(u => u.tier === "pro").length;
  const sprintUsers = users.filter(u => u.tier === "sprint").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-xl mb-2">Admin Dashboard</h1>
          <p className="body-lg">
            Manage users, view analytics, and control platform settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-700">
            <Shield className="w-3 h-3 mr-1" />
            Admin Access
          </Badge>
          <Button variant="outline" size="sm" onClick={loadAdminData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[#AFA496]">Total Users</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">
              {stats?.totalUsers || users.length}
            </p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-[#AFA496]">Active Today</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">
              {stats?.activeUsers || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-[#AFA496]">Total Revenue</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">
              ${stats?.revenue?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-[#AFA496]">New Today</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">
              {stats?.newUsersToday || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Distribution */}
      <Card className="card-wealth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            User Tiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#0F3F4C]">{starterUsers}</div>
              <div className="text-sm text-[#AFA496]">Starter</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-[#0F3F4C]">{proUsers}</div>
              <div className="text-sm text-[#AFA496]">Pro</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-[#0F3F4C]">{sprintUsers}</div>
              <div className="text-sm text-[#AFA496]">Sprint</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Management */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8 text-[#AFA496]">
                  No users found
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-4 bg-[#E4DCD1]/20 rounded-lg"
                    >
                      <div>
                        <div className="font-semibold text-[#0F3F4C]">{u.name}</div>
                        <div className="text-sm text-[#AFA496]">{u.email}</div>
                        <div className="text-xs text-[#AFA496] mt-1">
                          Joined: {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            u.tier === "sprint"
                              ? "bg-purple-100 text-purple-700"
                              : u.tier === "pro"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {u.tier || "starter"}
                        </Badge>
                        <select
                          className="text-sm border rounded px-2 py-1"
                          value={u.tier || "starter"}
                          onChange={(e) => updateUserTier(u.id, e.target.value)}
                        >
                          <option value="starter">Starter</option>
                          <option value="pro">Pro</option>
                          <option value="sprint">Sprint</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Platform Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#E4DCD1]/20 rounded-lg">
                  <span className="text-[#0F3F4C]">Total Blueprints Created</span>
                  <span className="font-bold text-[#0F3F4C]">--</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#E4DCD1]/20 rounded-lg">
                  <span className="text-[#0F3F4C]">Active Sprints</span>
                  <span className="font-bold text-[#0F3F4C]">--</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#E4DCD1]/20 rounded-lg">
                  <span className="text-[#0F3F4C]">Revenue Generated</span>
                  <span className="font-bold text-[#0F3F4C]">--</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Platform Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#E4DCD1]/20 rounded-lg">
                <div>
                  <div className="font-semibold text-[#0F3F4C]">Maintenance Mode</div>
                  <div className="text-sm text-[#AFA496]">Temporarily disable user access</div>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#E4DCD1]/20 rounded-lg">
                <div>
                  <div className="font-semibold text-[#0F3F4C]">Email Notifications</div>
                  <div className="text-sm text-[#AFA496]">Send welcome emails to new users</div>
                </div>
                <Button variant="outline" size="sm" className="bg-green-100">Enabled</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#E4DCD1]/20 rounded-lg">
                <div>
                  <div className="font-semibold text-[#0F3F4C]">Clear Cache</div>
                  <div className="text-sm text-[#AFA496]">Force refresh of all cached data</div>
                </div>
                <Button variant="outline" size="sm">Clear</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
