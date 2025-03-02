
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const notificacoesSchema = z.object({
  emailAgendamentos: z.boolean().default(true),
  emailCancelamentos: z.boolean().default(true),
  emailLembrates: z.boolean().default(true),
  pushNotificacoes: z.boolean().default(true),
});

const agendasSchema = z.object({
  tempoMinAgendamento: z.string().min(1),
  intervaloPadrao: z.string().min(1),
  maxDiasAntecedencia: z.string().min(1),
  permitirAgendamentoAnonimo: z.boolean().default(false),
});

const aparenciaSchema = z.object({
  corPrimaria: z.string().min(1),
  corSecundaria: z.string().min(1),
  logotipo: z.string().optional(),
  favicon: z.string().optional(),
});

type NotificacoesFormValues = z.infer<typeof notificacoesSchema>;
type AgendasFormValues = z.infer<typeof agendasSchema>;
type AparenciaFormValues = z.infer<typeof aparenciaSchema>;

const Configuracoes = () => {
  const { toast } = useToast();

  const notificacoesForm = useForm<NotificacoesFormValues>({
    resolver: zodResolver(notificacoesSchema),
    defaultValues: {
      emailAgendamentos: true,
      emailCancelamentos: true,
      emailLembrates: true,
      pushNotificacoes: true,
    },
  });

  const agendasForm = useForm<AgendasFormValues>({
    resolver: zodResolver(agendasSchema),
    defaultValues: {
      tempoMinAgendamento: "30",
      intervaloPadrao: "60",
      maxDiasAntecedencia: "30",
      permitirAgendamentoAnonimo: false,
    },
  });

  const aparenciaForm = useForm<AparenciaFormValues>({
    resolver: zodResolver(aparenciaSchema),
    defaultValues: {
      corPrimaria: "#0284c7",
      corSecundaria: "#7c3aed",
      logotipo: "",
      favicon: "",
    },
  });

  const onSubmitNotificacoes = (data: NotificacoesFormValues) => {
    console.log("Notificações:", data);
    toast({
      title: "Configurações Salvas",
      description: "As configurações de notificações foram salvas com sucesso.",
    });
  };

  const onSubmitAgendas = (data: AgendasFormValues) => {
    console.log("Agendas:", data);
    toast({
      title: "Configurações Salvas",
      description: "As configurações de agendas foram salvas com sucesso.",
    });
  };

  const onSubmitAparencia = (data: AparenciaFormValues) => {
    console.log("Aparência:", data);
    toast({
      title: "Configurações Salvas",
      description: "As configurações de aparência foram salvas com sucesso.",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as configurações do seu sistema de agendamento.
          </p>
        </div>

        <Tabs defaultValue="notificacoes" className="w-full">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="agendas">Agendas</TabsTrigger>
            <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          </TabsList>

          <TabsContent value="notificacoes" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>
                  Gerencie como e quando as notificações são enviadas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificacoesForm}>
                  <form onSubmit={notificacoesForm.handleSubmit(onSubmitNotificacoes)} className="space-y-4">
                    <FormField
                      control={notificacoesForm.control}
                      name="emailAgendamentos"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Notificações de Novos Agendamentos</FormLabel>
                            <FormDescription>
                              Receba um email quando um novo agendamento for criado.
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

                    <FormField
                      control={notificacoesForm.control}
                      name="emailCancelamentos"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Notificações de Cancelamentos</FormLabel>
                            <FormDescription>
                              Receba um email quando um agendamento for cancelado.
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

                    <FormField
                      control={notificacoesForm.control}
                      name="emailLembrates"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Lembretes de Agendamentos</FormLabel>
                            <FormDescription>
                              Envie lembretes por email antes dos agendamentos.
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

                    <FormField
                      control={notificacoesForm.control}
                      name="pushNotificacoes"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Notificações Push</FormLabel>
                            <FormDescription>
                              Habilite notificações push no navegador.
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

                    <Button type="submit" className="w-full">Salvar Configurações</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agendas" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Agendas</CardTitle>
                <CardDescription>
                  Configure os parâmetros de tempo e funcionamento das agendas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...agendasForm}>
                  <form onSubmit={agendasForm.handleSubmit(onSubmitAgendas)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={agendasForm.control}
                        name="tempoMinAgendamento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tempo Mínimo de Agendamento (minutos)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={agendasForm.control}
                        name="intervaloPadrao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Intervalo Padrão (minutos)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={agendasForm.control}
                      name="maxDiasAntecedencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Máximo de Dias de Antecedência</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Número máximo de dias no futuro que um cliente pode agendar.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={agendasForm.control}
                      name="permitirAgendamentoAnonimo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Permitir Agendamento Anônimo</FormLabel>
                            <FormDescription>
                              Permitir que empresas criem agendamentos para clientes não cadastrados.
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

                    <Button type="submit" className="w-full">Salvar Configurações</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aparencia" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Aparência</CardTitle>
                <CardDescription>
                  Personalize a aparência da sua plataforma de agendamento.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...aparenciaForm}>
                  <form onSubmit={aparenciaForm.handleSubmit(onSubmitAparencia)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={aparenciaForm.control}
                        name="corPrimaria"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor Primária</FormLabel>
                            <div className="flex space-x-2">
                              <FormControl>
                                <Input type="text" {...field} />
                              </FormControl>
                              <div className="flex items-center">
                                <Input 
                                  type="color" 
                                  value={field.value} 
                                  onChange={field.onChange}
                                  className="w-10 h-10 p-1 rounded-md cursor-pointer"
                                />
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={aparenciaForm.control}
                        name="corSecundaria"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor Secundária</FormLabel>
                            <div className="flex space-x-2">
                              <FormControl>
                                <Input type="text" {...field} />
                              </FormControl>
                              <div className="flex items-center">
                                <Input 
                                  type="color" 
                                  value={field.value} 
                                  onChange={field.onChange}
                                  className="w-10 h-10 p-1 rounded-md cursor-pointer"
                                />
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <FormField
                        control={aparenciaForm.control}
                        name="logotipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logotipo</FormLabel>
                            <FormControl>
                              <div className="flex flex-col space-y-2">
                                <Input 
                                  type="file" 
                                  accept="image/*"
                                  className="cursor-pointer"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      field.onChange(URL.createObjectURL(file));
                                    }
                                  }}
                                />
                                {field.value && (
                                  <div className="mt-2 border rounded-md p-2 w-40 h-20 flex items-center justify-center">
                                    <img 
                                      src={field.value} 
                                      alt="Logotipo" 
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormDescription>
                              Imagem PNG ou JPG (máximo 2MB).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={aparenciaForm.control}
                        name="favicon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Favicon</FormLabel>
                            <FormControl>
                              <div className="flex flex-col space-y-2">
                                <Input 
                                  type="file" 
                                  accept="image/*"
                                  className="cursor-pointer"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      field.onChange(URL.createObjectURL(file));
                                    }
                                  }}
                                />
                                {field.value && (
                                  <div className="mt-2 border rounded-md p-2 w-16 h-16 flex items-center justify-center">
                                    <img 
                                      src={field.value} 
                                      alt="Favicon" 
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormDescription>
                              Imagem quadrada (recomendado 32x32px).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full">Salvar Configurações</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Configuracoes;
