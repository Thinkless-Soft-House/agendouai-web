
import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { AlertCircle } from "lucide-react";

// Esquema de validação para notificações
const notificationsFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  emailAgendamentosCriados: z.boolean().default(true),
  emailAgendamentosCancelados: z.boolean().default(true),
  emailLembretesAgendamentos: z.boolean().default(true),
});

// Esquema de validação para aparência
const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  fontSize: z.enum(["small", "medium", "large"]),
});

// Esquema de validação para avançado
const advancedFormSchema = z.object({
  confirmDelete: z.literal(true, {
    errorMap: () => ({ message: "Você deve confirmar esta ação" }),
  }),
});

const Configuracoes = () => {
  const { toast } = useToast();
  const [openDeleteEmpresa, setOpenDeleteEmpresa] = useState(false);
  const [openDeleteUsuario, setOpenDeleteUsuario] = useState(false);
  
  // Formulários
  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      emailAgendamentosCriados: true,
      emailAgendamentosCancelados: true,
      emailLembretesAgendamentos: true,
    },
  });

  const appearanceForm = useForm<z.infer<typeof appearanceFormSchema>>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "light",
      fontSize: "medium",
    },
  });

  const advancedFormEmpresa = useForm<z.infer<typeof advancedFormSchema>>({
    resolver: zodResolver(advancedFormSchema),
    defaultValues: {
      confirmDelete: false,
    },
  });

  const advancedFormUsuario = useForm<z.infer<typeof advancedFormSchema>>({
    resolver: zodResolver(advancedFormSchema),
    defaultValues: {
      confirmDelete: false,
    },
  });

  // Handlers
  const onNotificationsSubmit = (data: z.infer<typeof notificationsFormSchema>) => {
    console.log("Configurações de notificações:", data);
    toast({
      title: "Configurações de notificações salvas",
      description: "Suas preferências de notificações foram atualizadas.",
    });
  };

  const onAppearanceSubmit = (data: z.infer<typeof appearanceFormSchema>) => {
    console.log("Configurações de aparência:", data);
    toast({
      title: "Configurações de aparência salvas",
      description: "Suas preferências de aparência foram atualizadas.",
    });
  };

  const handleDeleteEmpresa = () => {
    console.log("Excluindo dados da empresa...");
    toast({
      title: "Empresa excluída",
      description: "Todos os dados da empresa foram excluídos permanentemente.",
      variant: "destructive",
    });
    setOpenDeleteEmpresa(false);
  };

  const handleDeleteUsuario = () => {
    console.log("Excluindo dados do usuário...");
    toast({
      title: "Usuário excluído",
      description: "Todos os dados do usuário foram excluídos permanentemente.",
      variant: "destructive",
    });
    setOpenDeleteUsuario(false);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Configurações</h1>
        
        <Tabs defaultValue="geral">
          <TabsList className="mb-6">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="aparencia">Aparência</TabsTrigger>
            <TabsTrigger value="avancado">Avançado</TabsTrigger>
          </TabsList>
          
          {/* Tab Geral */}
          <TabsContent value="geral">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Gerencie as configurações gerais da sua conta.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Informações da Conta</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome</label>
                      <Input placeholder="Seu nome" defaultValue="Usuário Exemplo" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input placeholder="Seu email" defaultValue="usuario@exemplo.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea 
                      placeholder="Uma breve descrição sobre você" 
                      className="min-h-[100px]"
                      defaultValue="Administrador da empresa de exemplo."
                    />
                  </div>
                  <Button>Salvar Alterações</Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Idioma e Região</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Idioma</label>
                      <select className="w-full px-3 py-2 border rounded-md">
                        <option value="pt_BR">Português (Brasil)</option>
                        <option value="en_US">English (US)</option>
                        <option value="es">Español</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fuso Horário</label>
                      <select className="w-full px-3 py-2 border rounded-md">
                        <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                        <option value="America/New_York">New York (GMT-4)</option>
                        <option value="Europe/London">London (GMT+1)</option>
                      </select>
                    </div>
                  </div>
                  <Button>Salvar Alterações</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab Notificações */}
          <TabsContent value="notificacoes">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificações</CardTitle>
                <CardDescription>
                  Escolha como e quando deseja receber notificações.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationsForm}>
                  <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Email</h3>
                      
                      <FormField
                        control={notificationsForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Notificações por Email</FormLabel>
                              <FormDescription>
                                Ativar todas as notificações por email
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {notificationsForm.watch("emailNotifications") && (
                        <div className="space-y-4 rounded-lg border p-4">
                          <FormField
                            control={notificationsForm.control}
                            name="emailAgendamentosCriados"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-sm">Agendamentos Criados</FormLabel>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationsForm.control}
                            name="emailAgendamentosCancelados"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-sm">Agendamentos Cancelados</FormLabel>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationsForm.control}
                            name="emailLembretesAgendamentos"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-sm">Lembretes de Agendamentos</FormLabel>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                    
                    <Button type="submit">Salvar Preferências</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab Aparência */}
          <TabsContent value="aparencia">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Aparência</CardTitle>
                <CardDescription>
                  Personalize o visual do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...appearanceForm}>
                  <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)} className="space-y-6">
                    <FormField
                      control={appearanceForm.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tema</FormLabel>
                          <div className="grid grid-cols-3 gap-4">
                            <div
                              className={`flex flex-col items-center border rounded-lg p-4 cursor-pointer transition-all ${
                                field.value === "light" ? "border-primary bg-primary/10" : ""
                              }`}
                              onClick={() => appearanceForm.setValue("theme", "light")}
                            >
                              <div className="h-24 w-full bg-white border rounded-md mb-2"></div>
                              <span>Claro</span>
                            </div>
                            
                            <div
                              className={`flex flex-col items-center border rounded-lg p-4 cursor-pointer transition-all ${
                                field.value === "dark" ? "border-primary bg-primary/10" : ""
                              }`}
                              onClick={() => appearanceForm.setValue("theme", "dark")}
                            >
                              <div className="h-24 w-full bg-gray-900 border rounded-md mb-2"></div>
                              <span>Escuro</span>
                            </div>
                            
                            <div
                              className={`flex flex-col items-center border rounded-lg p-4 cursor-pointer transition-all ${
                                field.value === "system" ? "border-primary bg-primary/10" : ""
                              }`}
                              onClick={() => appearanceForm.setValue("theme", "system")}
                            >
                              <div className="h-24 w-full bg-gradient-to-r from-white to-gray-900 border rounded-md mb-2"></div>
                              <span>Sistema</span>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={appearanceForm.control}
                      name="fontSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tamanho da Fonte</FormLabel>
                          <div className="grid grid-cols-3 gap-4">
                            <div
                              className={`flex items-center justify-center border rounded-lg p-4 cursor-pointer text-sm transition-all ${
                                field.value === "small" ? "border-primary bg-primary/10" : ""
                              }`}
                              onClick={() => appearanceForm.setValue("fontSize", "small")}
                            >
                              <span>Pequeno</span>
                            </div>
                            
                            <div
                              className={`flex items-center justify-center border rounded-lg p-4 cursor-pointer transition-all ${
                                field.value === "medium" ? "border-primary bg-primary/10" : ""
                              }`}
                              onClick={() => appearanceForm.setValue("fontSize", "medium")}
                            >
                              <span>Médio</span>
                            </div>
                            
                            <div
                              className={`flex items-center justify-center border rounded-lg p-4 cursor-pointer text-lg transition-all ${
                                field.value === "large" ? "border-primary bg-primary/10" : ""
                              }`}
                              onClick={() => appearanceForm.setValue("fontSize", "large")}
                            >
                              <span>Grande</span>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit">Salvar Preferências</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab Avançado */}
          <TabsContent value="avancado">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Avançadas</CardTitle>
                <CardDescription>
                  Ações que não podem ser desfeitas. Tenha cuidado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="rounded-lg border border-destructive/50 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                      <h3 className="text-lg font-medium text-destructive">Zona de Perigo</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-destructive/10 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Excluir Dados da Empresa</h4>
                        <p className="text-sm mb-4">
                          Esta ação excluirá todos os dados da empresa, incluindo usuários, partições,
                          categorias e agendamentos. Esta ação não pode ser desfeita.
                        </p>
                        <AlertDialog open={openDeleteEmpresa} onOpenChange={setOpenDeleteEmpresa}>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">Excluir Empresa</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação excluirá permanentemente todos os dados da empresa.
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Form {...advancedFormEmpresa}>
                              <div className="py-4">
                                <FormField
                                  control={advancedFormEmpresa.control}
                                  name="confirmDelete"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                      <FormControl>
                                        <input
                                          type="checkbox"
                                          checked={field.value}
                                          onChange={(e) => field.onChange(e.target.checked)}
                                          className="h-4 w-4"
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        Eu entendo que esta ação excluirá permanentemente todos os dados da empresa.
                                      </FormLabel>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </Form>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.preventDefault();
                                  const isValid = advancedFormEmpresa.trigger();
                                  if (isValid && advancedFormEmpresa.getValues("confirmDelete")) {
                                    handleDeleteEmpresa();
                                  }
                                }}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Excluir Empresa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      
                      <div className="bg-destructive/10 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Excluir Conta de Usuário</h4>
                        <p className="text-sm mb-4">
                          Esta ação excluirá sua conta de usuário e todos os dados associados.
                          Esta ação não pode ser desfeita.
                        </p>
                        <AlertDialog open={openDeleteUsuario} onOpenChange={setOpenDeleteUsuario}>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">Excluir Minha Conta</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação excluirá permanentemente sua conta de usuário.
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <Form {...advancedFormUsuario}>
                              <div className="py-4">
                                <FormField
                                  control={advancedFormUsuario.control}
                                  name="confirmDelete"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                      <FormControl>
                                        <input
                                          type="checkbox"
                                          checked={field.value}
                                          onChange={(e) => field.onChange(e.target.checked)}
                                          className="h-4 w-4"
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        Eu entendo que esta ação excluirá permanentemente minha conta.
                                      </FormLabel>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </Form>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={(e) => {
                                  e.preventDefault();
                                  const isValid = advancedFormUsuario.trigger();
                                  if (isValid && advancedFormUsuario.getValues("confirmDelete")) {
                                    handleDeleteUsuario();
                                  }
                                }}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Excluir Minha Conta
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
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
