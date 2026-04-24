import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Home, 
  MessageSquare, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  BarChart3,
  GraduationCap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let endpoint = '';
        if (user?.role === 'superadmin') endpoint = '/superadmin/dashboard';
        else if (user?.role === 'admin') endpoint = '/admins/dashboard';
        else if (user?.role === 'student') endpoint = '/students/dashboard';

        if (endpoint) {
          const response = await api.get(endpoint);
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (isLoading) {
    return (
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
    );
  }

  const renderSuperAdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_students || 0}</div>
            <p className="text-xs text-muted-foreground">Across all hostels</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hostels</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_hostels || 0}</div>
            <p className="text-xs text-muted-foreground">University property</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_rooms || 0}</div>
            <p className="text-xs text-muted-foreground">Total capacity: {stats?.occupancy?.total_capacity || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_admins || 0}</div>
            <p className="text-xs text-muted-foreground">Hostel administrators</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Occupancy</CardTitle>
          <CardDescription>University-wide hostel occupancy status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Occupied Beds</span>
            <span className="font-medium">
              {stats?.occupied_beds || 0} / {stats?.total_capacity || 0}
            </span>
          </div>
          <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all" 
              style={{ 
                width: `${stats?.total_capacity ? (stats.occupied_beds / stats.total_capacity) * 100 : 0}%` 
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students in Hostel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_students || 0}</div>
            <p className="text-xs text-muted-foreground">Current residents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_rooms || 0}</div>
            <p className="text-xs text-muted-foreground">In your assigned hostel</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_complaints || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting resolution</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_capacity ? Math.round((stats.occupied_beds / stats.total_capacity) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.occupied_beds || 0} / {stats?.total_capacity || 0} beds
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hostel Occupancy Details</CardTitle>
          <CardDescription>Real-time bed availability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all" 
              style={{ 
                width: `${stats?.total_capacity ? (stats.occupied_beds / stats.total_capacity) * 100 : 0}%` 
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Occupied</span>
              <span className="font-bold">{stats?.occupied_beds || 0}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Total Capacity</span>
              <span className="font-bold">{stats?.total_capacity || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStudentDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Room</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.profile?.room_number ? `Room: ${stats.profile.room_number}` : 'Not Assigned'}</div>
            <p className="text-xs text-muted-foreground">Hostel: {stats?.profile?.hostel_name || 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roommates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.roommates || 0}</div>
            <p className="text-xs text-muted-foreground">In your current room</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Level</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.profile?.level || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Academic progress</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome back, {stats?.profile?.full_name || user?.full_name}!</CardTitle>
          <CardDescription>Here's a quick overview of your hostel status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              Important Notices
            </h3>
            <p className="text-sm text-muted-foreground">
              Welcome to the Student Hostel Management System. Please ensure your profile is up to date.
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Profile Details</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Matric Number: {stats?.profile?.matric_number || 'N/A'}</li>
                <li>Email: {stats?.profile?.email || 'N/A'}</li>
                <li>Gender: {stats?.profile?.gender || 'N/A'}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quick Actions</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/complaints">Report Issue</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/rooms">Browse Rooms</a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4">
      {user?.role === 'superadmin' && renderSuperAdminDashboard()}
      {user?.role === 'admin' && renderAdminDashboard()}
      {user?.role === 'student' && renderStudentDashboard()}
    </div>
  );
};

export default Dashboard;
