
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Layers, 
  Calendar,
  LogOut,
  Boxes,
  Settings
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Usuários', href: '/users', icon: Users },
  { name: 'Empresas', href: '/empresas', icon: Building2 },
  { name: 'Categorias', href: '/categorias', icon: Boxes },
  { name: 'Partições', href: '/particoes', icon: Layers },
  { name: 'Agendamento', href: '/agendamento', icon: Calendar },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  
  return (
    <aside className={cn("border-r bg-card h-screen p-6 flex flex-col", className)}>
      <div className="flex items-center gap-2 px-2">
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">A</div>
        <div className="font-semibold text-xl">Agendou Aí</div>
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
