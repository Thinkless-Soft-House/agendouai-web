import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  Building,
  Box,
  Calendar,
  Layers,
  Settings,
  LogOut,
  Home,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/App";
import { useToast } from "@/hooks/use-toast";

type SidebarItem = {
  title: string;
  icon: React.ElementType;
  href: string;
  variant?: "default" | "ghost";
};

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado com sucesso",
      description: "Redirecionando para o login...",
    });
    navigate("/login");
  };

  const items: SidebarItem[] = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
      variant: "default",
    },
    {
      title: "Usuários",
      icon: Users,
      href: "/users",
      variant: "ghost",
    },
    {
      title: "Empresas",
      icon: Building,
      href: "/empresas",
      variant: "ghost",
    },
    {
      title: "Partições",
      icon: Box,
      href: "/particoes",
      variant: "ghost",
    },
    {
      title: "Categorias",
      icon: Layers,
      href: "/categorias",
      variant: "ghost",
    },
    {
      title: "Agendamentos",
      icon: Calendar,
      href: "/agendamento",
      variant: "ghost",
    },
    {
      title: "Configurações",
      icon: Settings,
      href: "/configuracoes",
      variant: "ghost",
    },
  ];

  return (
    <div className={cn("pb-12 w-64 border-r bg-card h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 px-2">
            <LayoutGrid className="h-6 w-6" />
            <h2 className="text-lg font-semibold tracking-tight">AgendaFácil</h2>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-10rem)] px-2">
          <div className="space-y-1 p-2">
            {items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  item.variant === "default" && "bg-accent text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </ScrollArea>
        <div className="px-3 py-2">
          <Separator className="my-2" />
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
