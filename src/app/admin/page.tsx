"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Settings,
  Shield,
  BarChart3,
  Loader2,
  RefreshCw,
  UserCheck,
  Crown,
  Search,
  Filter,
  Download,
  UserCog,
  Eye,
  Trash2,
  ArrowUpDown,
  Zap,
  Target,
  CreditCard,
  Clock,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  email: string;
  name: string;
  tier: "starter" | "pro" | "sprint" | "elite";
  createdAt: string;
  lastLogin: string;
  totalRevenue: number;
  blueprintsCount: number;
  offersCount: number;
  sprintsCompleted: number;
  isActive: boolean;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  newUsersToday: number;
  retentionRate: number;
  growthRate: number;
  tierDistribution: {
    starter: number;
    pro: number;
    sprint: number;
    elite: number;
  };
  revenueByTier: {
    starter: number;
    pro: number;
    sprint: number;
    elite: number;
  };
  paymentCount: number;
  refunds: number;
  revenueForecast: {
    next30Days: number;
    next90Days: number;
  };
  featureUsage: {
    blueprintsCreated: number;
    offersCreated: number;
    systemsBuilt: number;
    sprintsActive: number;
    aiCoachChats: number;
  };
}

interface Activity {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

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
      const usersData = usersRes.ok ? await usersRes.json() : { users: [] };
      setUsers(usersData.users || []);

      // Fetch stats
      const statsRes = await fetch("/api/admin/stats");
      const statsData = statsRes.ok ? await statsRes.json() : null;
      setStats(statsData);

      // Fetch activity
      const activityRes = await fetch("/api/admin/activity?limit=20");
      const activityData = activityRes.ok ? await activityRes.json() : { activities: [] };
      setActivities(activityData.activities || []);
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

  async function toggleUserStatus(userId: string, isActive: boolean) {
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !isActive }),
      });
      loadAdminData();
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  }

  async function impersonateUser(userId: string) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "impersonate" }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Impersonating ${data.user.name}. In production, this would redirect to the user's dashboard.`);
      }
    } catch (error) {
      console.error("Failed to impersonate user:", error);
    }
  }

  async function exportUserData(userId: string) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "export" }),
      });
      const data = await res.json();
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.exportData, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `user-export-${userId}.json`;
        a.click();
      }
    } catch (error) {
      console.error("Failed to export user data:", error);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    try {
      await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      loadAdminData();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  }

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === "all" || u.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "elite":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Crown className="w-3 h-3 mr-1" />
            Elite
          </Badge>
        );
      case "sprint":
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <Zap className="w-3 h-3 mr-1" />
            Sprint
          </Badge>
        );
      case "pro":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Target className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            Starter
          </Badge>
        );
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "upgraded":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "login":
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case "blueprint_created":
        return <FileText className="w-4 h-4 text-purple-500" />;
      case "offer_created":
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case "sprint_started":
        return <Zap className="w-4 h-4 text-orange-500" />;
      case "ai_chat":
        return <Activity className="w-4 h-4 text-cyan-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

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
            <p className="text-sm text-green-600 mt-1">
              +{stats?.newUsersToday || 0} today
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
            <p className="text-sm text-[#AFA496] mt-1">
              {stats?.retentionRate || 0}% retention
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
              ${(stats?.revenue || 0).toLocaleString()}
            </p>
            <p className="text-sm text-green-600 mt-1">
              +{stats?.growthRate || 0}% growth
            </p>
          </CardContent>
        </Card>

        <Card className="card-wealth">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-[#AFA496]">Transactions</span>
            </div>
            <p className="text-3xl font-bold text-[#0F3F4C]">
              {stats?.paymentCount || 0}
            </p>
            <p className="text-sm text-red-500 mt-1">
              {stats?.refunds || 0} refunds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card className="card-wealth">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#AFA496]" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={tierFilter} onValueChange={(value) => setTierFilter(value || "all")}>
                    <SelectTrigger className="w-32">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="sprint">Sprint</SelectItem>
                      <SelectItem value="elite">Elite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardDescription>
                {filteredUsers.length} users found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-[#AFA496]">
                  No users found
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-4 bg-[#E4DCD1]/20 rounded-lg hover:bg-[#E4DCD1]/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#0F3F4C] rounded-full flex items-center justify-center text-white font-semibold">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-[#0F3F4C]">
                            {u.name}
                          </div>
                          <div className="text-sm text-[#AFA496]">{u.email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {getTierBadge(u.tier)}
                            <span className="text-xs text-[#AFA496]">
                              Joined: {new Date(u.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <div className="text-sm font-medium text-[#0F3F4C]">
                            ${u.totalRevenue}
                          </div>
                          <div className="text-xs text-[#AFA496]">
                            {u.blueprintsCount} blueprints • {u.offersCount} offers
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => impersonateUser(u.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Impersonate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportUserData(u.id)}>
                              <Download className="w-4 h-4 mr-2" />
                              Export Data
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleUserStatus(u.id, u.isActive)}
                            >
                              <UserCog className="w-4 h-4 mr-2" />
                              {u.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteUser(u.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Select
                          value={u.tier}
                          onValueChange={(tier) => tier && updateUserTier(u.id, tier)}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="starter">Starter</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="sprint">Sprint</SelectItem>
                            <SelectItem value="elite">Elite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {/* Tier Distribution */}
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Tier Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#0F3F4C]">
                    {stats?.tierDistribution?.starter || 0}
                  </div>
                  <div className="text-sm text-[#AFA496]">Starter</div>
                  <div className="text-xs text-gray-400 mt-1">
                    ${((stats?.revenueByTier?.starter || 0) / 100).toFixed(0)}
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#0F3F4C]">
                    {stats?.tierDistribution?.pro || 0}
                  </div>
                  <div className="text-sm text-[#AFA496]">Pro</div>
                  <div className="text-xs text-gray-400 mt-1">
                    ${((stats?.revenueByTier?.pro || 0) / 100).toFixed(0)}
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#0F3F4C]">
                    {stats?.tierDistribution?.sprint || 0}
                  </div>
                  <div className="text-sm text-[#AFA496]">Sprint</div>
                  <div className="text-xs text-gray-400 mt-1">
                    ${((stats?.revenueByTier?.sprint || 0) / 100).toFixed(0)}
                  </div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#0F3F4C]">
                    {stats?.tierDistribution?.elite || 0}
                  </div>
                  <div className="text-sm text-[#AFA496]">Elite</div>
                  <div className="text-xs text-gray-400 mt-1">
                    ${((stats?.revenueByTier?.elite || 0) / 100).toFixed(0)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Usage */}
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Feature Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-[#E4DCD1]/20 rounded-lg">
                  <div className="text-2xl font-bold text-[#0F3F4C]">
                    {stats?.featureUsage?.blueprintsCreated || 0}
                  </div>
                  <div className="text-sm text-[#AFA496]">Blueprints</div>
                </div>
                <div className="text-center p-4 bg-[#E4DCD1]/20 rounded-lg">
                  <div className="text-2xl font-bold text-[#0F3F4C]">
                    {stats?.featureUsage?.offersCreated || 0}
                  </div>
                  <div className="text-sm text-[#AFA496]">Offers</div>
                </div>
                <div className="text-center p-4 bg-[#E4DCD1]/20 rounded-lg">
                  <div className="text-2xl font-bold text-[#0F3F4C]">
                    {stats?.featureUsage?.systemsBuilt || 0}
                  </div>
                  <div className="text-sm text-[#AFA496]">Systems</div>
                </div>
                <div className="text-center p-4 bg-[#E4DCD1]/20 rounded-lg">
                  <div className="text-2xl font-bold text-[#0F3F4C]">
                    {stats?.featureUsage?.sprintsActive || 0}
                  </div>
                  <div className="text-sm text-[#AFA496]">Active Sprints</div>
                </div>
                <div className="text-center p-4 bg-[#E4DCD1]/20 rounded-lg">
                  <div className="text-2xl font-bold text-[#0F3F4C]">
                    {stats?.featureUsage?.aiCoachChats || 0}
                  </div>
                  <div className="text-sm text-[#AFA496]">AI Chats</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Revenue Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-[#AFA496]">Current Revenue</div>
                  <div className="text-2xl font-bold text-[#0F3F4C]">
                    ${(stats?.revenue || 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-[#AFA496]">Next 30 Days</div>
                  <div className="text-2xl font-bold text-[#0F3F4C]">
                    ${(stats?.revenueForecast?.next30Days || 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-[#AFA496]">Next 90 Days</div>
                  <div className="text-2xl font-bold text-[#0F3F4C]">
                    ${(stats?.revenueForecast?.next90Days || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-wealth">
            <CardHeader>
              <CardTitle>Revenue by Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.revenueByTier &&
                  Object.entries(stats.revenueByTier).map(([tier, revenue]) => (
                    <div key={tier} className="flex items-center gap-4">
                      <div className="w-20 capitalize text-[#0F3F4C]">{tier}</div>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0F3F4C] rounded-full"
                          style={{
                            width: `${
                              stats.revenue > 0
                                ? (revenue / stats.revenue) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <div className="w-24 text-right font-medium">
                        ${(revenue / 100).toFixed(0)}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card className="card-wealth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-[#AFA496]">
                    No recent activity
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 bg-[#E4DCD1]/20 rounded-lg"
                    >
                      <div className="mt-0.5">{getActionIcon(activity.action)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#0F3F4C]">
                            {activity.userName}
                          </span>
                          <span className="text-sm text-[#AFA496]">
                            {activity.details}
                          </span>
                        </div>
                        <div className="text-xs text-[#AFA496] mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings Section */}
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
              <div className="font-semibold text-[#0F3F4C]">
                Maintenance Mode
              </div>
              <div className="text-sm text-[#AFA496]">
                Temporarily disable user access
              </div>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-[#E4DCD1]/20 rounded-lg">
            <div>
              <div className="font-semibold text-[#0F3F4C]">
                Email Notifications
              </div>
              <div className="text-sm text-[#AFA496]">
                Send welcome emails to new users
              </div>
            </div>
            <Button variant="outline" size="sm" className="bg-green-100">
              Enabled
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-[#E4DCD1]/20 rounded-lg">
            <div>
              <div className="font-semibold text-[#0F3F4C]">
                New User Registration
              </div>
              <div className="text-sm text-[#AFA496]">
                Allow new users to sign up
              </div>
            </div>
            <Button variant="outline" size="sm" className="bg-green-100">
              Open
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
