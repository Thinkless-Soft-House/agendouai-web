import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  MoonIcon,
  SunIcon,
  Bell,
  Palette,
  Mail,
  Building,
  User,
  AlertTriangle,
  Save,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEmpresas } from "@/hooks/useEmpresas"; // Importe o hook useEmpresas
import { useUsuarioLogado } from "@/hooks/useUsuarioLogado"; // Importe o hook useUsuarioLogado
import { EmpresaDeleteDialog } from "@/components/empresas/EmpresaDeleteDialog";
import { UserDeleteDialog } from "@/components/users/UserDeleteDialog";

const Configuracoes = () => {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("geral");

  // Estados para configurações
  const [notificacoes, setNotificacoes] = useState({
    emailAgendamentos: true,
    emailCancelamentos: true,
    emailLembretes: true,
  });

  const [perfil, setPerfil] = useState({
    nome: "",
    email: "",
    telefone: "",
    bio: "",
  });

  // Estados para os dados da empresa
  const [empresa, setEmpresa] = useState({
    nome: "",
    cnpj: "",
    endereco: "",
    telefone: "",
  });

  const { empresas, isLoadingEmpresas } = useEmpresas();

  const { usuario, isLoading: isLoadingUsuario } = useUsuarioLogado();

  const [openDeleteEmpresa, setOpenDeleteEmpresa] = useState(false);
  const [openDeleteUsuario, setOpenDeleteUsuario] = useState(false);

  React.useEffect(() => {
    if (empresas.length > 0) {
      const empresaData = empresas[0];
      setEmpresa({
        nome: empresaData.nome,
        cnpj: empresaData.cnpj,
        endereco: empresaData.endereco,
        telefone: empresaData.telefone,
      });
    }
  }, [empresas]);

    // Preencha os dados do usuário quando os dados forem carregados
    React.useEffect(() => {
      if (usuario) {
        setPerfil({
          nome: usuario.pessoa.nome,
          email: usuario.login,
          telefone: usuario.pessoa.telefone || "",
          bio: "Administradora do sistema e coordenadora de agendamentos.", // Exemplo de biografia
        });
      }
    }, [usuario]);
  

  const handleSaveGeneral = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas configurações gerais foram atualizadas com sucesso.",
    });
  };

  const handleSaveEmpresa = () => {
    toast({
      title: "Dados da empresa salvos",
      description: "As informações da empresa foram atualizadas com sucesso.",
    });
  };

  const handleDeleteEmpresa = () => {
    toast({
      title: "Empresa excluída",
      description: "Todos os dados da empresa foram excluídos permanentemente.",
      variant: "destructive",
    });
  };

  const handleDeleteUsuario = () => {
    // Remove o token e dados do usuário do localStorage
    localStorage.removeItem("authToken");
    localStorage.clear();
    toast({
      title: "Usuário excluído",
      description: "Sua conta e todos os seus dados foram excluídos permanentemente.",
      variant: "destructive",
    });
    // Redireciona para a tela de login ou página inicial
    window.location.href = "/login";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências, notificações e dados da conta.
          </p>
        </div>
        <Separator />

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="avancado">Avançado</TabsTrigger>
          </TabsList>

          {/* Configurações Gerais */}
          <TabsContent value="geral" className="space-y-6">
          <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Atualize suas informações de perfil e contato.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input
                      id="nome"
                      value={perfil.nome}
                      onChange={(e) =>
                        setPerfil({ ...perfil, nome: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={perfil.email}
                      onChange={(e) =>
                        setPerfil({ ...perfil, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={perfil.telefone}
                      onChange={(e) =>
                        setPerfil({ ...perfil, telefone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={perfil.bio}
                    onChange={(e) =>
                      setPerfil({ ...perfil, bio: e.target.value })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveGeneral}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informações da Empresa
                </CardTitle>
                <CardDescription>
                  Gerencie os dados da sua empresa e configurações comerciais.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="empresa-nome">Nome da empresa</Label>
                    <Input
                      id="empresa-nome"
                      value={empresa.nome}
                      onChange={(e) =>
                        setEmpresa({ ...empresa, nome: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="empresa-cnpj">CNPJ</Label>
                    <Input
                      id="empresa-cnpj"
                      value={empresa.cnpj}
                      onChange={(e) =>
                        setEmpresa({ ...empresa, cnpj: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="empresa-endereco">Endereço</Label>
                    <Input
                      id="empresa-endereco"
                      value={empresa.endereco}
                      onChange={(e) =>
                        setEmpresa({ ...empresa, endereco: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="empresa-telefone">Telefone comercial</Label>
                    <Input
                      id="empresa-telefone"
                      value={empresa.telefone}
                      onChange={(e) =>
                        setEmpresa({ ...empresa, telefone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveEmpresa}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Aparência
                </CardTitle>
                <CardDescription>
                  Personalize a aparência do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      className="gap-2"
                      onClick={() => setTheme("light")}
                    >
                      <SunIcon className="h-5 w-5" />
                      Claro
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      className="gap-2"
                      onClick={() => setTheme("dark")}
                    >
                      <MoonIcon className="h-5 w-5" />
                      Escuro
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      className="gap-2"
                      onClick={() => setTheme("system")}
                    >
                      Sistema
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Notificações */}
          <TabsContent value="notificacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Notificações por Email
                </CardTitle>
                <CardDescription>
                  Configure quais emails você deseja receber.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-agendamentos">
                      Novos agendamentos
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receba emails quando novos agendamentos forem criados.
                    </p>
                  </div>
                  <Switch
                    id="email-agendamentos"
                    checked={notificacoes.emailAgendamentos}
                    onCheckedChange={(checked) =>
                      setNotificacoes({
                        ...notificacoes,
                        emailAgendamentos: checked,
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-cancelamentos">Cancelamentos</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba emails quando agendamentos forem cancelados.
                    </p>
                  </div>
                  <Switch
                    id="email-cancelamentos"
                    checked={notificacoes.emailCancelamentos}
                    onCheckedChange={(checked) =>
                      setNotificacoes({
                        ...notificacoes,
                        emailCancelamentos: checked,
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-lembretes">Lembretes</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba lembretes por email sobre próximos agendamentos.
                    </p>
                  </div>
                  <Switch
                    id="email-lembretes"
                    checked={notificacoes.emailLembretes}
                    onCheckedChange={(checked) =>
                      setNotificacoes({
                        ...notificacoes,
                        emailLembretes: checked,
                      })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() =>
                    toast({
                      title: "Preferências salvas",
                      description:
                        "Suas configurações de notificação foram atualizadas.",
                    })
                  }
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Preferências
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações no Aplicativo
                </CardTitle>
                <CardDescription>
                  Configure as notificações dentro do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="app-agendamentos">Agendamentos</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar notificações para novos agendamentos.
                    </p>
                  </div>
                  <Switch id="app-agendamentos" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="app-mensagens">Mensagens</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar notificações para novas mensagens.
                    </p>
                  </div>
                  <Switch id="app-mensagens" defaultChecked />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() =>
                    toast({
                      title: "Preferências salvas",
                      description:
                        "Suas configurações de notificação foram atualizadas.",
                    })
                  }
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Preferências
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Configurações Avançadas */}
          <TabsContent value="avancado" className="space-y-6">
            <Card className="border-red-200">
              <CardHeader className="text-red-600">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Zona de Perigo
                </CardTitle>
                <CardDescription className="text-red-400">
                  Ações irreversíveis que podem resultar na exclusão permanente
                  de dados.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-md border border-red-200 p-4 bg-red-50">
                  <h3 className="text-lg font-medium text-red-700 mb-2">
                    Excluir Dados da Empresa
                  </h3>
                  <p className="text-sm text-red-600 mb-4">
                    Esta ação excluirá permanentemente todos os dados
                    relacionados à sua empresa, incluindo agendamentos,
                    partições, configurações e preferências. Esta ação não pode
                    ser desfeita.
                  </p>
                  <EmpresaDeleteDialog
                    open={openDeleteEmpresa}
                    onOpenChange={setOpenDeleteEmpresa}
                    empresa={empresas[0]}
                    onDelete={handleDeleteEmpresa}
                  />
                  <Button
                    variant="destructive"
                    onClick={() => setOpenDeleteEmpresa(true)}
                  >
                    Excluir Dados da Empresa
                  </Button>
                </div>
                <div className="rounded-md border border-red-200 p-4 bg-red-50">
                  <h3 className="text-lg font-medium text-red-700 mb-2">
                    Excluir Conta de Usuário
                  </h3>
                  <p className="text-sm text-red-600 mb-4">
                    Esta ação excluirá permanentemente sua conta de usuário e todos os dados associados. Esta ação não pode ser desfeita.
                  </p>
                  <UserDeleteDialog
                    open={openDeleteUsuario}
                    onOpenChange={setOpenDeleteUsuario}
                    user={{
                      id: String(usuario?.id ?? ""),
                      nome: usuario?.pessoa?.nome ?? "",
                      email: usuario?.login ?? "",
                      role: "Administrador", // ou outro valor padrão se necessário
                      status: "active", // ou outro valor padrão se necessário
                      empresaId: { id: usuario?.empresa?.id ?? 0, nome: usuario?.empresa?.nome ?? "" },
                      cpf: usuario?.pessoa?.cpfCnpj ?? "",
                      telefone: usuario?.pessoa?.telefone ?? "",
                      endereco: undefined,
                      cidade: undefined,
                      estado: undefined,
                      cep: undefined,
                    }}
                    onDelete={handleDeleteUsuario}
                  />
                  <Button
                    variant="destructive"
                    onClick={() => setOpenDeleteUsuario(true)}
                  >
                    Excluir Minha Conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Configuracoes;
