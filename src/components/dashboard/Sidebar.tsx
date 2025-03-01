
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Bell, 
  LogOut 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  
  return (
    <aside className={cn("border-r bg-card h-screen p-6 flex flex-col", className)}>
      <div className="flex items-center gap-2 px-2">
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">D</div>
        <div className="font-semibold text-xl">Dashboard</div>
      </div>
      
      <Separator className="my-6" />
      
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "dashboard-nav-item",
                isActive && "active"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto">
        <Separator className="my-6" />
        <Link to="/logout" className="dashboard-nav-item text-muted-foreground hover:text-foreground">
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </Link>
      </div>
    </aside>
  );
}
