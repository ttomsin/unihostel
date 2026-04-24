import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  User, 
  MessageSquare, 
  Users, 
  Home, 
  Building2, 
  GraduationCap, 
  Church, 
  Settings, 
  LogOut,
  Menu,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['superadmin', 'admin', 'student'] },
    { label: 'Profile', icon: User, path: '/profile', roles: ['student', 'admin'] },
    { label: 'Complaints', icon: MessageSquare, path: '/complaints', roles: ['superadmin', 'admin', 'student'] },
    { label: 'Admins', icon: Users, path: '/admins', roles: ['superadmin'] },
    { label: 'Students', icon: Users, path: '/students', roles: ['superadmin', 'admin'] },
    { label: 'Rooms', icon: Home, path: '/rooms', roles: ['superadmin', 'admin', 'student'] },
    { label: 'Hostels', icon: Building2, path: '/hostels', roles: ['superadmin'] },
    { label: 'Faculties', icon: GraduationCap, path: '/faculties', roles: ['superadmin'] },
    { label: 'Chapels', icon: Church, path: '/chapels', roles: ['superadmin'] },
    { label: 'Settings', icon: Settings, path: '/settings', roles: ['superadmin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => user && item.roles.includes(user.role));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar collapsible="icon">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2 font-bold text-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="truncate group-data-[collapsible=icon]:hidden">UniHostel</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.path}
                    tooltip={item.label}
                  >
                    <Link to={item.path}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name}`} />
                <AvatarFallback>{user?.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium">{user?.full_name}</span>
                <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto group-data-[collapsible=icon]:hidden" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold capitalize">
                {location.pathname === '/dashboard' ? 'Dashboard' : location.pathname.substring(1)}
              </h1>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
