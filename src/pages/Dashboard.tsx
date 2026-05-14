import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Users,
  Home,
  MessageSquare,
  Building2,
  AlertCircle,
  TrendingUp,
  GraduationCap,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  Megaphone,
  Plus,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Colors for charts
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#6366f1",
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: "", content: "" });
  const [isPostingNotice, setIsPostingNotice] = useState(false);

  const fetchStats = async () => {
    try {
      let endpoint = "";
      if (user?.role === "superadmin") endpoint = "/superadmin/dashboard";
      else if (user?.role === "admin") endpoint = "/admins/dashboard";
      else if (user?.role === "student") endpoint = "/students/dashboard";

      if (endpoint) {
        const response = await api.get(endpoint);
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsPostingNotice(true);
    try {
      await api.post("/admins/notices", newNotice);
      toast.success("Notice published successfully");
      setNewNotice({ title: "", content: "" });
      setIsNoticeDialogOpen(false);
      fetchStats(); // Refresh to show new data if needed
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to publish notice");
    } finally {
      setIsPostingNotice(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="mt-2 h-3 w-[120px]" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  const renderSuperAdminDashboard = () => (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Super Admin Command Center
          </h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive analytics for all University Hostels.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
          <div className="h-1 bg-blue-500 w-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Total Students
            </CardTitle>
            <Users className="h-5 w-5 text-blue-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">
              {stats?.total_students || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
              Across all assigned hostels
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
          <div className="h-1 bg-emerald-500 w-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Active Hostels
            </CardTitle>
            <Building2 className="h-5 w-5 text-emerald-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">
              {stats?.total_hostels || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              System total
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
          <div className="h-1 bg-violet-500 w-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Total Rooms
            </CardTitle>
            <Home className="h-5 w-5 text-violet-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">
              {stats?.total_rooms || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {stats?.total_capacity || 0} Bedspaces
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white dark:bg-slate-900 overflow-hidden">
          <div className="h-1 bg-amber-500 w-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Admin Staff
            </CardTitle>
            <Activity className="h-5 w-5 text-amber-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">
              {stats?.total_admins || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Assigned personnel
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>System-wide Occupancy</CardTitle>
              <CardDescription>
                Real-time data across all hostels
              </CardDescription>
            </div>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.hostel_occupancy || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar
                    dataKey="occupied"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    name="Occupied"
                    barSize={40}
                  />
                  <Bar
                    dataKey="total"
                    fill="#cbd5e1"
                    radius={[6, 6, 0, 0]}
                    name="Total Capacity"
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Level Distribution</CardTitle>
            <CardDescription>Breakdown by academic year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex flex-col justify-between">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.level_distribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {(stats?.level_distribution || []).map(
                        (entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ),
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 px-2 mt-4 pb-2 border-t pt-4">
                {(stats?.level_distribution || []).map(
                  (item: any, index: number) => (
                    <div key={item.name} className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-2.5 h-2.5 rounded-sm"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-4.5">
                        {item.count} Students
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {stats?.hostel_name || "Hostel Dashboard"}
          </h2>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Building2 className="h-4 w-4" /> Assigned Management Console
          </p>
        </div>

        <Dialog open={isNoticeDialogOpen} onOpenChange={setIsNoticeDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" /> Post Notice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreateNotice}>
              <DialogHeader>
                <DialogTitle>Create Hostel Notice</DialogTitle>
                <DialogDescription>
                  This announcement will be visible to all students in your
                  hostel.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Notice Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Curfew Update"
                    value={newNotice.title}
                    onChange={(e) =>
                      setNewNotice({ ...newNotice, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Announcement Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your announcement here..."
                    className="min-h-[120px]"
                    value={newNotice.content}
                    onChange={(e) =>
                      setNewNotice({ ...newNotice, content: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPostingNotice}>
                  {isPostingNotice ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Publish Announcement
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-none shadow-sm">
          <CardHeader className="pb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 w-fit rounded-lg mb-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-tight">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats?.total_students || 0}
            </div>
            <div className="flex items-center mt-2 text-xs font-medium text-slate-500">
              Active residents in hostel
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-none shadow-sm">
          <CardHeader className="pb-2">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 w-fit rounded-lg mb-2">
              <MessageSquare className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-tight">
              Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats?.total_complaints || 0}
            </div>
            <div className="flex items-center mt-2 text-xs font-medium text-rose-500">
              Requiring attention
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-none shadow-sm">
          <CardHeader className="pb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 w-fit rounded-lg mb-2">
              <Home className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-tight">
              Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats?.occupied_beds || 0} / {stats?.total_capacity || 0}
            </div>
            <div className="flex items-center mt-2 text-xs font-medium text-emerald-500">
              Occupied bedspaces
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-none shadow-sm">
          <CardHeader className="pb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 w-fit rounded-lg mb-2">
              <Home className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-tight">
              Total Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats?.total_rooms || 0}
            </div>
            <div className="flex items-center mt-2 text-xs font-medium text-slate-500">
              Available for allocation
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
        <Card className="col-span-12 lg:col-span-8 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-xl">
                Student Block Distribution
              </CardTitle>
              <CardDescription>
                Occupancy breakdown by Room Block
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.block_distribution || []}>
                  <defs>
                    <linearGradient
                      id="colorStudents"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorStudents)"
                    name="Student Count"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-4 border-none shadow-md">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-xl">Level Breakdown</CardTitle>
            <CardDescription>Residents by academic year</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {(stats?.level_distribution || []).map(
                (level: any, idx: number) => (
                  <div key={level.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {level.name}
                      </span>
                      <span className="text-slate-500 font-medium">
                        {level.count} students
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${level.count > 0 ? (level.count / (stats.total_students || 1)) * 100 : 0}%`,
                          backgroundColor: COLORS[idx % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStudentDashboard = () => (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Portal</h2>
          <p className="text-muted-foreground">
            Welcome back, {stats?.profile?.full_name || user?.full_name}!
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/profile">Edit Profile</Link>
          </Button>
          <Button size="sm" className="bg-blue-600" asChild>
            <Link to="/rooms">Browse Rooms</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Allocation
            </CardTitle>
            <Home className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.profile?.room_number || "Not Assigned"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.profile?.hostel_name || "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roommates</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.roommates || 0}</div>
            <p className="text-xs text-muted-foreground">Sharing with you</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-violet-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Academic Level
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.profile?.level || "N/A"} Level
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.profile?.faculty_name || "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-md">
          <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest hostel interactions</CardDescription>
            </div>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-8">
              {stats?.recent_activity?.length > 0 ? (
                stats.recent_activity.map((activity: any) => (
                  <div key={activity.id} className="flex items-center">
                    <div
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full ${
                        activity.type === "success"
                          ? "bg-emerald-100 dark:bg-emerald-900/30"
                          : activity.type === "alert"
                            ? "bg-rose-100 dark:bg-rose-900/30"
                            : "bg-blue-100 dark:bg-blue-900/30"
                      }`}
                    >
                      {activity.type === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : activity.type === "alert" ? (
                        <AlertCircle className="h-5 w-5 text-rose-600" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-bold leading-none text-slate-800 dark:text-slate-200">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp
                          ? format(new Date(activity.timestamp), "PPP p")
                          : ""}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground italic">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Hostel Notice Board</CardTitle>
              <CardDescription>
                Official announcements from administration
              </CardDescription>
            </div>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {stats?.notifications?.length > 0 ? (
              stats.notifications.map((notice: any) => (
                <div
                  key={notice.id}
                  className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50"
                >
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {notice.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {notice.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground italic">
                No notices at the moment
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {stats?.roommate_details && stats.roommate_details.length > 0 && (
        <Card className="border-none shadow-md">
          <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Roommates</CardTitle>
              <CardDescription>
                Details of students sharing your room
              </CardDescription>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {stats.roommate_details.map((roommate: any) => (
                <div key={roommate.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-500" />{" "}
                    {/* Placeholder icon */}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-200">
                      {roommate.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {roommate.matric_number} - {roommate.level} Level
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {user?.role === "superadmin" && renderSuperAdminDashboard()}
      {user?.role === "admin" && renderAdminDashboard()}
      {user?.role === "student" && renderStudentDashboard()}
    </div>
  );
};

export default Dashboard;
