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
import { Particao, Funcionario } from "@/pages/Particoes";
import { Empresa } from "@/pages/Empresas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Categoria } from "@/pages/Categorias";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Schema para validação do formulário - Corrigindo para aceitar strings vazias quando o dia estiver inativo
const particaoFormSchema = z.object({
  nome: z
    .string()
    .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })
    .max(50, { message: "Nome deve ter no máximo 50 caracteres" }),
  empresaId: z.string({ required_error: "Por favor selecione uma empresa" }),
  categoriaId: z.string().optional(),
  descricao: z
    .string()
    .min(5, { message: "Descrição deve ter pelo menos 5 caracteres" })
    .max(200, { message: "Descrição deve ter no máximo 200 caracteres" }),
  disponivel: z.boolean().default(true),
  responsaveis: z.array(z.string()).default([]),
  disponibilidade: z.object({
    segunda: z.object({
      ativo: z.boolean().default(true),
      inicio: z.string().default("08:00"),
      fim: z.string().default("18:00"),
    }),
    terca: z.object({
      ativo: z.boolean().default(true),
      inicio: z.string().default("08:00"),
      fim: z.string().default("18:00"),
    }),
    quarta: z.object({
      ativo: z.boolean().default(true),
      inicio: z.string().default("08:00"),
      fim: z.string().default("18:00"),
    }),
    quinta: z.object({
      ativo: z.boolean().default(true),
      inicio: z.string().default("08:00"),
      fim: z.string().default("18:00"),
    }),
    sexta: z.object({
      ativo: z.boolean().default(true),
      inicio: z.string().default("08:00"),
      fim: z.string().default("18:00"),
    }),
    sabado: z.object({
      ativo: z.boolean().default(false),
      inicio: z.string().default("08:00"),
      fim: z.string().default("12:00"),
    }),
    domingo: z.object({
      ativo: z.boolean().default(false),
      inicio: z.string().default("08:00"),
      fim: z.string().default("12:00"),
    }),
  }),
});

type ParticaoFormValues = z.infer<typeof particaoFormSchema>;

interface ParticaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  particao: Particao | null;
  empresas: Empresa[];
  funcionarios: Funcionario[];
  onSave: () => void;
}

// Simular categorias disponíveis
const categorias: Categoria[] = [
  {
    id: "cat-1",
    nome: "Barbearia",
    nomeParticao: "Cadeira",
    empresasVinculadas: 12,
    criadoEm: new Date().toISOString(),
  },
  {
    id: "cat-2",
    nome: "Consultório",
    nomeParticao: "Sala",
    empresasVinculadas: 8,
    criadoEm: new Date().toISOString(),
  },
  {
    id: "cat-3",
    nome: "Coworking",
    nomeParticao: "Mesa",
    empresasVinculadas: 5,
    criadoEm: new Date().toISOString(),
  },
];

// Horários disponíveis para seleção
const horariosDisponiveis = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", 
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", 
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", 
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
];

// Dias da semana formatados
const diasDaSemana = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo",
};

export function ParticaoDialog({
  open,
  onOpenChange,
  particao,
  empresas,
  funcionarios,
  onSave,
}: ParticaoDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("geral");
  const [selectedResponsaveis, setSelectedResponsaveis] = useState<Funcionario[]>([]);

  // Configuração do formulário com React Hook Form e Zod
  const form = useForm<ParticaoFormValues>({
    resolver: zodResolver(particaoFormSchema),
    defaultValues: {
      nome: "",
      empresaId: "",
      categoriaId: "",
      descricao: "",
      disponivel: true,
      responsaveis: [],
      disponibilidade: {
        segunda: { ativo: true, inicio: "08:00", fim: "18:00" },
        terca: { ativo: true, inicio: "08:00", fim: "18:00" },
        quarta: { ativo: true, inicio: "08:00", fim: "18:00" },
        quinta: { ativo: true, inicio: "08:00", fim: "18:00" },
        sexta: { ativo: true, inicio: "08:00", fim: "18:00" },
        sabado: { ativo: false, inicio: "08:00", fim: "12:00" },
        domingo: { ativo: false, inicio: "08:00", fim: "12:00" },
      },
    },
  });

  // Preencher o formulário com os dados da partição quando estiver editando
  useEffect(() => {
    if (particao) {
      form.reset({
        nome: particao.nome,
        empresaId: particao.empresaId,
        categoriaId: particao.categoriaId || "",
        descricao: particao.descricao,
        disponivel: particao.disponivel,
        responsaveis: particao.responsaveis || [],
        disponibilidade: particao.disponibilidade || {
          segunda: { ativo: true, inicio: "08:00", fim: "18:00" },
          terca: { ativo: true, inicio: "08:00", fim: "18:00" },
          quarta: { ativo: true, inicio: "08:00", fim: "18:00" },
          quinta: { ativo: true, inicio: "08:00", fim: "18:00" },
          sexta: { ativo: true, inicio: "08:00", fim: "18:00" },
          sabado: { ativo: false, inicio: "08:00", fim: "12:00" },
          domingo: { ativo: false, inicio: "08:00", fim: "12:00" },
        },
      });

      // Preencher os responsáveis selecionados
      if (particao.responsaveis && particao.responsaveis.length > 0) {
        const selectedUsers = funcionarios.filter(f => 
          particao.responsaveis?.includes(f.id)
        );
        setSelectedResponsaveis(selectedUsers);
      } else {
        setSelectedResponsaveis([]);
      }
    } else {
      // Definir valores padrão quando estiver criando uma nova partição
      let defaultEmpresaId = "";
      if (empresas.length > 0) {
        defaultEmpresaId = empresas[0].id;
      }
      
      form.reset({
        nome: "",
        empresaId: defaultEmpresaId,
        categoriaId: "",
        descricao: "",
        disponivel: true,
        responsaveis: [],
        disponibilidade: {
          segunda: { ativo: true, inicio: "08:00", fim: "18:00" },
          terca: { ativo: true, inicio: "08:00", fim: "18:00" },
          quarta: { ativo: true, inicio: "08:00", fim: "18:00" },
          quinta: { ativo: true, inicio: "08:00", fim: "18:00" },
          sexta: { ativo: true, inicio: "08:00", fim: "18:00" },
          sabado: { ativo: false, inicio: "08:00", fim: "12:00" },
          domingo: { ativo: false, inicio: "08:00", fim: "12:00" },
        },
      });
      setSelectedResponsaveis([]);
    }
  }, [particao, empresas, funcionarios, form]);

  // Adicionar responsável
  const addResponsavel = (userId: string) => {
    const user = funcionarios.find(f => f.id === userId);
    if (user && !selectedResponsaveis.some(r => r.id === userId)) {
      setSelectedResponsaveis([...selectedResponsaveis, user]);
      
      // Atualizar o valor no formulário
      const currentValues = form.getValues().responsaveis;
      form.setValue("responsaveis", [...currentValues, userId]);
    }
  };

  // Remover responsável
  const removeResponsavel = (userId: string) => {
    setSelectedResponsaveis(selectedResponsaveis.filter(r => r.id !== userId));
    
    // Atualizar o valor no formulário
    const currentValues = form.getValues().responsaveis;
    form.setValue("responsaveis", currentValues.filter(id => id !== userId));
  };

  // Função para lidar com o envio do formulário
  function onSubmit(data: ParticaoFormValues) {
    // Garantir que os dias inativos tenham valores válidos para os horários
    const formattedData = {
      ...data,
      disponibilidade: {
        ...data.disponibilidade,
        // Garantir que os dias inativos tenham valores padrão
        sabado: data.disponibilidade.sabado.ativo 
          ? data.disponibilidade.sabado 
          : { ativo: false, inicio: "08:00", fim: "12:00" },
        domingo: data.disponibilidade.domingo.ativo 
          ? data.disponibilidade.domingo 
          : { ativo: false, inicio: "08:00", fim: "12:00" },
      }
    };
    
    // Em um cenário real, aqui enviaríamos os dados para a API
    console.log("Dados do formulário formatados:", formattedData);
    
    // Notificar o componente pai que a operação foi concluída
    onSave();
  }

  // Renderização condicional dos horários baseado no estado ativo/inativo do dia
  const renderHorarioFields = (dia: string) => {
    const isAtivo = form.watch(`disponibilidade.${dia}.ativo` as any);
    
    if (!isAtivo) {
      return null;
    }
    
    return (
      <div className="grid grid-cols-2 gap-4 mt-2">
        <FormField
          control={form.control}
          name={`disponibilidade.${dia}.inicio` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de Início</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
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
          name={`disponibilidade.${dia}.fim` as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de Fim</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {particao ? "Editar Partição" : "Nova Partição"}
          </DialogTitle>
          <DialogDescription>
            {particao
              ? "Atualize os detalhes da partição existente."
              : "Preencha os campos para criar uma nova partição."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="responsaveis">Responsáveis</TabsTrigger>
                <TabsTrigger value="disponibilidade">Disponibilidade</TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome da partição" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="empresaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma empresa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {empresas.map((empresa) => (
                            <SelectItem key={empresa.id} value={empresa.id}>
                              {empresa.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva a partição"
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
                  name="disponivel"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Disponibilidade</FormLabel>
                        <FormDescription>
                          Marque se a partição está disponível para agendamento
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
              </TabsContent>

              <TabsContent value="responsaveis" className="space-y-4 mt-4">
                <div className="flex flex-col space-y-4">
                  <FormField
                    name="responsaveis"
                    render={() => (
                      <FormItem>
                        <FormLabel>Adicionar Responsáveis</FormLabel>
                        <Select
                          onValueChange={(value) => addResponsavel(value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione funcionários" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {funcionarios
                              .filter(f => f.role === "Funcionario")
                              .map((funcionario) => (
                                <SelectItem key={funcionario.id} value={funcionario.id}>
                                  {funcionario.nome} ({funcionario.email})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Os responsáveis selecionados poderão gerenciar esta partição
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="border rounded-md p-4">
                    <p className="text-sm font-medium mb-2">Responsáveis Selecionados</p>
                    <ScrollArea className="h-[150px]">
                      {selectedResponsaveis.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum responsável selecionado</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {selectedResponsaveis.map(responsavel => (
                            <Badge key={responsavel.id} variant="secondary" className="flex items-center gap-1">
                              {responsavel.nome}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 ml-1"
                                onClick={() => removeResponsavel(responsavel.id)}
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
                  Configure os horários de disponibilidade para cada dia da semana
                </p>
                
                <div className="space-y-4">
                  {Object.entries(diasDaSemana).map(([dia, diaNome]) => (
                    <div key={dia} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <FormField
                          control={form.control}
                          name={`disponibilidade.${dia}.ativo` as any}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-medium">{diaNome}</FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {renderHorarioFields(dia)}
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
                {particao ? "Salvar Alterações" : "Criar Partição"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
