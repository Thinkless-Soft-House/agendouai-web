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
import { useUsuarioLogado } from "@/hooks/useUsuarioLogado"; // Importe o hook useUsuarioLogado

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
  const { usuario } = useUsuarioLogado(); // Obtenha os dados do usuário logado

  const handleLogout = () => {
    try {
      logout();
      toast({
        title: "Logout realizado com sucesso",
        description: "Redirecionando para o login...",
      });
      navigate("/app/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  // Função para filtrar os itens do menu com base na permissão do usuário
  const getItensPermitidos = (): SidebarItem[] => {
    if (!usuario) return []; // Se não houver usuário logado, nenhum item é exibido

    const todosItens: SidebarItem[] = [
      {
        title: "Dashboard",
        icon: Home,
        href: "/app/dashboard",
        variant: "default",
      },
      {
        title: "Usuários",
        icon: Users,
        href: "/app/users",
        variant: "ghost",
      },
      {
        title: "Empresas",
        icon: Building,
        href: "/app/empresas",
        variant: "ghost",
      },
      {
        title: "Partições",
        icon: Box,
        href: "/app/particoes",
        variant: "ghost",
      },
      {
        title: "Categorias",
        icon: Layers,
        href: "/app/categorias",
        variant: "ghost",
      },
      {
        title: "Agendamentos",
        icon: Calendar,
        href: "/app/agendamento",
        variant: "ghost",
      },
      {
        title: "Configurações",
        icon: Settings,
        href: "/app/configuracoes",
        variant: "ghost",
      },
    ];

    switch (usuario.permissao.descricao) {
      case "Administrador":
        return todosItens; // Administrador pode ver todos os menus
      case "Empresa":
        return todosItens.filter(
          (item) =>
            item.title !== "Categorias" && item.title !== "Empresas"
        ); // Empresário não pode ver "Categorias" e "Empresas"
      case "Funcionario":
        return todosItens.filter(
          (item) =>
            item.title === "Agendamentos" || item.title === "Configurações"
        ); // Funcionário só pode ver "Agendamentos" e "Configurações"
      case "Cliente":
        return []; // Cliente não pode ver nenhum menu
      default:
        return [];
    }
  };

  // Itens permitidos para o usuário logado
  const itensPermitidos = getItensPermitidos();

  return (
    <div className={cn("pb-12 w-64 border-r bg-card h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 px-2">
            <LayoutGrid className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight">Agendou Aí</h2>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-10rem)] px-2">
          <div className="space-y-1 p-2">
            {itensPermitidos.map((item) => (
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