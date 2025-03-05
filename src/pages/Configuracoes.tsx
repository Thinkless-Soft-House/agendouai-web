
import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const Configuracoes = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [theme, setTheme] = useState("light");
  const { toast } = useToast();

  const handleDeleteUserData = () => {
    toast({
      title: "Dados do usuário excluídos",
      description: "Todos os seus dados pessoais foram removidos do sistema.",
    });
  };

  const handleDeleteCompanyData = () => {
    toast({
      title: "Dados da empresa excluídos",
      description: "Todos os dados da empresa foram removidos do sistema.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações de conta.
          </p>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 md:grid-cols-3 h-auto">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Gerais</CardTitle>
                <CardDescription>
                  Configure as opções gerais da sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema da Interface</Label>
                  <Select
                    value={theme}
                    onValueChange={(value) => setTheme(value)}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Selecione um tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Salvar Alterações</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>
                  Escolha como deseja receber notificações.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações por email.
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Salvar Preferências</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                <CardDescription>
                  Ações destrutivas que não podem ser desfeitas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        Excluir Dados do Usuário
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente seus dados pessoais do sistema.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUserData}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        Excluir Dados da Empresa
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente todos os dados da empresa, incluindo agendamentos, partições e categorias.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteCompanyData}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
