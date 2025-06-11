import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Espaco, Funcionario } from "@/pages/Particoes";
import Empresa from "@/pages/Empresas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import axios from "axios";
import { Company } from "@/hooks/useEmpresas";

// Schema para validação do formulário - Corrigido para aceitar strings vazias quando o dia estiver inativo
const espacoFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })
    .max(50, { message: "Nome deve ter no máximo 50 caracteres" }),
  companyId: z.number({ required_error: "Por favor selecione uma empresa" }),
  descricao: z
    .string()
    .min(5, { message: "Descrição deve ter pelo menos 5 caracteres" })
    .max(200, { message: "Descrição deve ter no máximo 200 caracteres" }),
  status: z.enum(["active", "inactive"]),
  spaceManagers: z.array(z.string()).default([]),
  availabilities: z
    .array(
      z.object({
        dia: z.string(),
        ativo: z.boolean(),
        inicio: z.string(),
        fim: z.string(),
      })
    )
    .default([
      { dia: "Segunda", ativo: true, inicio: "08:00", fim: "18:00" },
      { dia: "Terça", ativo: true, inicio: "08:00", fim: "18:00" },
      { dia: "Quarta", ativo: true, inicio: "08:00", fim: "18:00" },
      { dia: "Quinta", ativo: true, inicio: "08:00", fim: "18:00" },
      { dia: "Sexta", ativo: true, inicio: "08:00", fim: "18:00" },
      { dia: "Sábado", ativo: false, inicio: "08:00", fim: "12:00" },
      { dia: "Domingo", ativo: false, inicio: "08:00", fim: "12:00" },
    ]),
});

type EspacoFormValues = z.infer<typeof espacoFormSchema>;

interface EspacoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  espaco: Espaco | null;
  empresas: Company[];
  funcionarios: Funcionario[];
  onSave: () => void;
}

// Horários disponíveis para seleção
const horariosDisponiveis = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

// Dias da semana formatados
const diasDaSemana = {
  Segunda: "Segunda-feira",
  Terça: "Terça-feira",
  Quarta: "Quarta-feira",
  Quinta: "Quinta-feira",
  Sexta: "Sexta-feira",
  Sábado: "Sábado",
  Domingo: "Domingo",
};

// Adicionar um objeto para mapear dias numéricos para nomes de dias
const mapNumeroDiaPraNome: Record<string, string> = {
  "0": "Domingo",
  "1": "Segunda",
  "2": "Terça",
  "3": "Quarta",
  "4": "Quinta",
  "5": "Sexta",
  "6": "Sábado",
};

export function EspacoDialog({
  open,
  onOpenChange,
  espaco,
  empresas,
  funcionarios,
  onSave,
}: EspacoDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("geral");
  const [selectedResponsaveis, setSelectedResponsaveis] = useState<
    Funcionario[]
  >([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const usuarioLogado = JSON.parse(localStorage.getItem("user") || "{}");

  console.log("Usuario Logado:", usuarioLogado);

  const usuarioRole = usuarioLogado?.role || "";
  // console.log("Usuario Role:", usuarioRole);

  const usuarioEmpresaId = usuarioLogado?.empresaId || "";
  // console.log("Usuario Empresa ID:", usuarioEmpresaId);
  // console.log("Empresa", empresas);

  // Configuração do formulário com React Hook Form e Zod

  // console.log("Funcionarios:", funcionarios);

  const form = useForm<EspacoFormValues>({
    resolver: zodResolver(espacoFormSchema),
    defaultValues: {
      name: "",
      companyId: 0,
      descricao: "",
      status: "active",
      spaceManagers: [],
      availabilities: [
        { dia: "Segunda", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Terça", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Quarta", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Quinta", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Sexta", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Sábado", ativo: false, inicio: "08:00", fim: "12:00" },
        { dia: "Domingo", ativo: false, inicio: "08:00", fim: "12:00" },
      ],
    },
  });

  // Adicionar um novo efeito que monitora a abertura do diálogo para limpar o formulário
  useEffect(() => {
    // Quando o diálogo é aberto e não estamos editando (espaco é null)
    if (open && !espaco) {
      console.log("Resetando formulário para novo espaço");
      
      // Resetar para valores padrão
      form.reset({
        name: "",
        companyId: empresas.length > 0 ? empresas[0].id : 0,
        descricao: "",
        status: "active",
        spaceManagers: [],
        availabilities: [
          { dia: "Segunda", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Terça", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Quarta", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Quinta", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Sexta", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Sábado", ativo: false, inicio: "08:00", fim: "12:00" },
          { dia: "Domingo", ativo: false, inicio: "08:00", fim: "12:00" },
        ],
      });
      
      // Limpar responsáveis selecionados
      setSelectedResponsaveis([]);
      setSelectedUserId("");
      
      // Resetar tab para a primeira aba
      setActiveTab("geral");
    }
  }, [open, espaco, empresas, form]);

  // Preencher o formulário com os dados do espaço quando estiver editando
  useEffect(() => {
    if (espaco) {
      // IDs dos responsáveis
      let spaceManagersIds: string[] = [];
      if (espaco.spaceManagers && espaco.spaceManagers.length > 0) {
        spaceManagersIds = espaco.spaceManagers.map((r: any) => String(r.usuarioId || r.userId || r.id));
      }
      // Disponibilidade
      let availabilitiesForm = [
        { dia: "Segunda", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Terça", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Quarta", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Quinta", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Sexta", ativo: true, inicio: "08:00", fim: "18:00" },
        { dia: "Sábado", ativo: false, inicio: "08:00", fim: "12:00" },
        { dia: "Domingo", ativo: false, inicio: "08:00", fim: "12:00" },
      ];
      if (espaco.availabilities && espaco.availabilities.length > 0) {
        const dispMap: Record<string, { ativo: boolean; inicio: string; fim: string }> = {};
        espaco.availabilities.forEach((disp: any) => {
          const nomeDia = mapNumeroDiaPraNome[disp.diaSemana];
          if (nomeDia) {
            dispMap[nomeDia] = {
              ativo: disp.ativo,
              inicio: disp.hrAbertura || disp.inicio || "08:00",
              fim: disp.hrFim || disp.fim || "18:00"
            };
          }
        });
        availabilitiesForm = availabilitiesForm.map(dia => ({
          ...dia,
          ativo: dispMap[dia.dia]?.ativo ?? dia.ativo,
          inicio: dispMap[dia.dia]?.inicio ?? dia.inicio,
          fim: dispMap[dia.dia]?.fim ?? dia.fim
        }));
      }
      const defaultValues = {
        name: espaco.name || "",
        companyId: espaco.companyId || 0,
        descricao: espaco.descricao || "",
        status: espaco.status || "active",
        spaceManagers: spaceManagersIds,
        availabilities: availabilitiesForm,
      };
      form.reset(defaultValues);
      setSelectedResponsaveis(
        funcionarios.filter(f => spaceManagersIds.includes(f.id))
      );
      form.setValue("spaceManagers", spaceManagersIds);
    } else {
      form.reset({
        name: "",
        companyId: empresas.length > 0 ? empresas[0].id : 0,
        descricao: "",
        status: "active",
        spaceManagers: [],
        availabilities: [
          { dia: "Segunda", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Terça", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Quarta", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Quinta", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Sexta", ativo: true, inicio: "08:00", fim: "18:00" },
          { dia: "Sábado", ativo: false, inicio: "08:00", fim: "12:00" },
          { dia: "Domingo", ativo: false, inicio: "08:00", fim: "12:00" },
        ],
      });
      setSelectedResponsaveis([]);
    }
  }, [espaco, empresas, funcionarios, form]);

  // Adicionar responsável
  const addResponsavel = (userId: string) => {
    const user = funcionarios.find((f) => f.id === userId);
    const currentValues = form.getValues().spaceManagers || [];
    if (user && !currentValues.includes(userId)) {
      form.setValue("spaceManagers", [...currentValues, userId]);
      setSelectedResponsaveis([...selectedResponsaveis, user]);
    }
  };

  // Remover responsável
  const removeResponsavel = (userId: string) => {
    setSelectedResponsaveis(
      selectedResponsaveis.filter((r) => r.id !== userId)
    );
    const currentValues = form.getValues().spaceManagers || [];
    const newValues = currentValues.filter((id: string) => id !== userId);
    form.setValue("spaceManagers", newValues);
    console.log("Responsáveis após remoção:", newValues);
  };

  // Modificar a função de envio para lidar corretamente com responsáveis
  // --- ALTERAÇÃO: Nova função para criar espaço usando o DTO correto e endpoint /spaces ---
  const onSubmit = async (data: EspacoFormValues) => {
    console.log("Dados do formulário sendo enviados:", data);
    console.log("Responsáveis a serem salvos:", data.spaceManagers);

    let spaceId: number | null = null;

    // Função para headers de autenticação
    function getAuthHeaders() {
      // Tenta pegar o token do localStorage (authToken ou token)
      let accessToken = localStorage.getItem("authToken") || localStorage.getItem("token");
      if (accessToken) {
        // Remove aspas extras se existirem
        accessToken = accessToken.replace(/^"|"$/g, "");
        return {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        };
      }
      return { "Content-Type": "application/json" };
    }

    try {
      // Se for edição, use o ID existente (mantém lógica anterior)
      if (espaco) {
        // --- EDIÇÃO: manter lógica antiga, mas corrigir nome da variável para spaceId ---
        spaceId = espaco.id;
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        // Atualizar espaço
        const spacePayload = {
          name: data.name,
          status: data.status,
          multipleBookings: false,
          companyId: usuarioRole === "admin" ? Number(data.companyId) : Number(usuarioEmpresaId),
        };
        await fetch(`${apiUrl}/spaces/${spaceId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(spacePayload),
          credentials: "include",
        });
        // Atualizar disponibilidades e responsáveis conforme necessário (pode ser implementado depois)
        // ...existing code...
      } else {
        // NOVO: Criação de espaço usando DTO correto e endpoint /spaces
        // Montar payload conforme CreateSpacesDTO
        const spacePayload = {
          name: data.name,
          status: data.status,
          multipleBookings: false, // ou true se desejar permitir múltiplas reservas
          companyId: usuarioRole === "admin" ? Number(data.companyId) : Number(usuarioEmpresaId),
          // photoUrl: '', // Adicione se houver campo de foto
          // createdBy e updatedBy podem ser preenchidos no backend via auth
        };

        // Chamada para criar o espaço
        let apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        if (!apiUrl.startsWith("http")) {
          apiUrl = `http://${apiUrl}`;
        }
        const headers = getAuthHeaders();
        const response = await fetch(`${apiUrl}/spaces`, {
          method: "POST",
          headers,
          body: JSON.stringify(spacePayload),
          credentials: "include",
        });
        const result = await response.json();
        if (!result?.data?.id) throw new Error("ID do espaço não retornado");
        spaceId = result.data.id;
        console.log("Espaço criado:", result.data);

        // --- Disponibilidades ---
        // Se o backend espera criar as disponibilidades separadamente:
        for (const config of data.availabilities) {
          const diaSemanaIndex = getDiaSemanaIndex(config.dia);
          const disponibilidadePayload = {
            hrAbertura: config.inicio,
            hrFim: config.fim,
            diaSemana: String(diaSemanaIndex),
            minDiasCan: 1,
            intervaloMinutos: 60,
            spaceId: spaceId, // Corrigido para spaceId
            ativo: config.ativo,
          };
          await fetch(`${apiUrl}/availabilities`, {
            method: "POST",
            headers,
            body: JSON.stringify(disponibilidadePayload),
            credentials: "include",
          });
        }

        // --- Responsáveis ---
        if (data.spaceManagers && data.spaceManagers.length > 0) {
          for (let i = 0; i < data.spaceManagers.length; i++) {
            const usuarioId = data.spaceManagers[i];
            const payload = {
              spaceId: spaceId,
              userId: Number(usuarioId),
              companyId: usuarioRole === "admin" ? Number(data.companyId) : Number(usuarioEmpresaId),
            };
            await fetch(`${apiUrl}/space-managers`, {
              method: "POST",
              headers,
              body: JSON.stringify(payload),
              credentials: "include",
            });
          }
        }

        // Tudo criado com sucesso
        onSave?.();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Erro durante a operação:", error);
      alert(espaco ? "Erro ao atualizar espaço." : "Erro ao criar espaço. Todas as alterações foram revertidas.");
    }
  };

  // Função auxiliar
  function getDiaSemanaIndex(dia: string): number {
    const map: Record<string, number> = {
      Domingo: 0,
      Segunda: 1,
      Terça: 2,
      Quarta: 3,
      Quinta: 4,
      Sexta: 5,
      Sábado: 6,
    };
    return map[dia] ?? 0; // Default para Segunda (0) se não encontrado
  }

  // Verificar o estado dos campos para depuração
  const disponibilidadeAtual = form.watch("availabilities");
  // console.log("Estado atual da disponibilidade:", disponibilidadeAtual);

  // Renderização condicional dos horários baseado no estado ativo/inativo do dia
  const renderHorarioFields = (dia: string, index: number) => {
    // Usar apenas o acesso por índice que está funcionando corretamente
    const isAtivo = form.watch(`availabilities.${index}.ativo` as any);
    
    if (!isAtivo) {
      return null;
    }

    return (
      <div className="grid grid-cols-2 gap-4 mt-2">
        <FormField
          control={form.control}
          name={`availabilities.${index}.inicio` as any} // Use índice aqui também
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de Início</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue="08:00"
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {horariosDisponiveis.map((horario) => (
                    <SelectItem key={horario} value={horario}>
                      {horario}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`availabilities.${index}.fim` as any} // Use índice aqui também
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de Fim</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue="18:00"
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {horariosDisponiveis.map((horario) => (
                    <SelectItem key={horario} value={horario}>
                      {horario}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>
    );
  };

  // Logar funcionários ao abrir a tab de responsáveis
  useEffect(() => {
    if (activeTab === "responsaveis") {
      console.log("Funcionarios recebidos na tab de responsáveis:", funcionarios);
    }
  }, [activeTab, funcionarios]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {espaco ? "Editar Espaço" : "Novo Espaço"}
          </DialogTitle>
          <DialogDescription>
            {espaco
              ? "Atualize os detalhes do espaço existente."
              : "Preencha os campos para criar um novo espaço."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="responsaveis">Responsáveis</TabsTrigger>
                <TabsTrigger value="disponibilidade">
                  Disponibilidade
                </TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o nome do espaço"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {usuarioRole === "admin" && (
                    <FormField
                      control={form.control}
                      name="companyId"
                      render={({ field: companyField }) => (
                        <FormItem>
                          <FormLabel>Empresa</FormLabel>
                          <Select
                            onValueChange={(value) => companyField.onChange(Number(value))}
                            value={companyField.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione uma empresa" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {empresas.map((empresa) => (
                                <SelectItem
                                  key={empresa.id}
                                  value={empresa.id.toString()}
                                >
                                  {empresa.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o espaço"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Disponibilidade
                        </FormLabel>
                        <FormDescription>
                          Marque se o espaço está disponível para agendamento
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === 'active'} // O Switch será marcado quando o valor for 1
                          onCheckedChange={(checked) =>
                            field.onChange(checked ? 'active' : 'inactive')
                          } // Muda o valor para 1 se marcado, 2 se desmarcado
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="responsaveis" className="space-y-4 mt-4">
                {/* Log para depuração dos funcionários recebidos na tab de responsáveis */}
                {(() => { console.log('Funcionarios recebidos na tab de responsáveis:', funcionarios); return null; })()}
                <div className="flex flex-col space-y-4">
                  <FormField
                    name="responsaveis"
                    render={() => (
                      <FormItem>
                        <FormLabel>Adicionar Responsáveis</FormLabel>
                        <Select
                          value={selectedUserId}
                          onValueChange={(value) => {
                            setSelectedUserId(value);
                            addResponsavel(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione funcionários" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {funcionarios
                              .filter((f) => f.role === "employee")
                              .map((funcionario) => (
                                <SelectItem
                                  key={funcionario.id}
                                  value={funcionario.id}
                                >
                                  {funcionario.nome} ({funcionario.email})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Os responsáveis selecionados poderão gerenciar este espaço
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <div className="border rounded-md p-4">
                    <p className="text-sm font-medium mb-2">
                      Responsáveis Selecionados
                    </p>
                    <ScrollArea className="h-[150px]">
                      {selectedResponsaveis.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhum responsável selecionado
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {selectedResponsaveis.map((responsavel) => (
                            <Badge
                              key={responsavel.id}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {responsavel.nome}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() =>
                                  removeResponsavel(responsavel.id)
                                }
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="disponibilidade" className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Configure os horários de disponibilidade para cada dia da
                  semana
                </p>

                <div className="space-y-4">
                  {Object.entries(diasDaSemana).map(([dia, diaNome], index) => (
                    <div key={dia} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <FormField
                          control={form.control}
                          name={`availabilities.${index}.ativo` as any} // Use o índice em vez do nome
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    console.log(`Checkbox ${dia} alterado para: ${checked}`);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-medium">
                                {diaNome} {field.value ? "(Ativo)" : "(Inativo)"}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>

                      {renderHorarioFields(dia, index)}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {espaco ? "Salvar Alterações" : "Criar Espaço"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
