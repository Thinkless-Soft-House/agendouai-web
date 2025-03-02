
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Agendamento } from "@/pages/Agendamento";
import { Empresa } from "@/pages/Empresas";
import { Particao } from "@/pages/Particoes";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  CalendarIcon, 
  UserCircle, 
  MapPin, 
  Clock, 
  CheckCircle,
  AlertCircle 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AgendamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento: Agendamento | null;
  createData: { data: Date; horario: string } | null;
  empresaId: string;
  particaoId: string;
  empresas: Empresa[];
  particoes: Particao[];
  onSave: () => void;
}

// Esquema de validação
const agendamentoSchema = z.object({
  empresaId: z.string().min(1, { message: "Selecione uma empresa" }),
  particaoId: z.string().min(1, { message: "Selecione uma partição" }),
  clienteNome: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  clienteEmail: z.string().email({ message: "Email inválido" }),
  clienteTelefone: z.string().min(10, { message: "Telefone inválido" }),
  data: z.date({ required_error: "Selecione uma data" }),
  horarioInicio: z.string().min(1, { message: "Selecione um horário de início" }),
  horarioFim: z.string().min(1, { message: "Selecione um horário de fim" }),
  status: z.enum(["confirmado", "pendente", "cancelado", "finalizado"], { 
    errorMap: () => ({ message: "Selecione um status" }) 
  }),
  observacoes: z.string().optional(),
});

type AgendamentoFormValues = z.infer<typeof agendamentoSchema>;

const horariosDisponiveis = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

export function AgendamentoDialog({ 
  open, 
  onOpenChange, 
  agendamento, 
  createData,
  empresaId, 
  particaoId,
  empresas, 
  particoes, 
  onSave 
}: AgendamentoDialogProps) {
  const isEditing = !!agendamento;
  
  const form = useForm<AgendamentoFormValues>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: {
      empresaId: empresaId,
      particaoId: particaoId,
      clienteNome: "",
      clienteEmail: "",
      clienteTelefone: "",
      data: new Date(),
      horarioInicio: "09:00",
      horarioFim: "10:00",
      status: "pendente",
      observacoes: "",
    },
  });

  // Atualiza o formulário quando os dados mudam
  useEffect(() => {
    if (agendamento) {
      form.reset({
        empresaId: agendamento.empresaId,
        particaoId: agendamento.particaoId,
        clienteNome: agendamento.clienteNome,
        clienteEmail: agendamento.clienteEmail,
        clienteTelefone: agendamento.clienteTelefone,
        data: new Date(agendamento.data),
        horarioInicio: agendamento.horarioInicio,
        horarioFim: agendamento.horarioFim,
        status: agendamento.status,
        observacoes: agendamento.observacoes || "",
      });
    } else if (createData) {
      form.reset({
        empresaId: empresaId,
        particaoId: particaoId,
        clienteNome: "",
        clienteEmail: "",
        clienteTelefone: "",
        data: createData.data,
        horarioInicio: createData.horario,
        horarioFim: calcularHorarioFim(createData.horario),
        status: "pendente",
        observacoes: "",
      });
    } else {
      form.reset({
        empresaId: empresaId,
        particaoId: particaoId,
        clienteNome: "",
        clienteEmail: "",
        clienteTelefone: "",
        data: new Date(),
        horarioInicio: "09:00",
        horarioFim: "10:00",
        status: "pendente",
        observacoes: "",
      });
    }
  }, [agendamento, createData, empresaId, particaoId, form]);

  const calcularHorarioFim = (horarioInicio: string) => {
    const index = horariosDisponiveis.indexOf(horarioInicio);
    return index < horariosDisponiveis.length - 1 
      ? horariosDisponiveis[index + 1] 
      : horariosDisponiveis[index];
  };

  // Atualizar horário de fim quando horário de início mudar
  const handleHorarioInicioChange = (value: string) => {
    form.setValue("horarioInicio", value);
    form.setValue("horarioFim", calcularHorarioFim(value));
  };

  // Encontrar empresa e partição pelos IDs
  const empresaSelecionada = empresas.find(e => e.id === form.getValues().empresaId);
  const particaoSelecionada = particoes.find(p => p.id === form.getValues().particaoId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado":
        return <Badge className="bg-green-500">Confirmado</Badge>;
      case "pendente":
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case "cancelado":
        return <Badge className="bg-red-500">Cancelado</Badge>;
      case "finalizado":
        return <Badge className="bg-blue-500">Finalizado</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const onSubmit = (values: AgendamentoFormValues) => {
    // Aqui faríamos a chamada para a API
    console.log("Form values:", values);
    
    // Simular delay de API
    setTimeout(() => {
      onSave();
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite os detalhes do agendamento abaixo."
              : "Preencha os campos abaixo para criar um novo agendamento."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-6 pt-4">
                {/* Empresa e Partição */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="empresaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={isEditing}
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
                    name="particaoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partição</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={isEditing}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma partição" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {particoes.map((particao) => (
                              <SelectItem key={particao.id} value={particao.id}>
                                {particao.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Cliente */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Dados do Cliente</h3>
                  
                  <FormField
                    control={form.control}
                    name="clienteNome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clienteEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="email@exemplo.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clienteTelefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Data e Horário */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Data e Horário</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="data"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className="w-full pl-3 text-left font-normal flex justify-between items-center"
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                  ) : (
                                    <span>Selecione</span>
                                  )}
                                  <CalendarIcon className="h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                locale={ptBR}
                                disabled={(date) => 
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="horarioInicio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário Início</FormLabel>
                          <Select 
                            onValueChange={handleHorarioInicioChange} 
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {horariosDisponiveis.slice(0, -1).map((horario) => (
                                <SelectItem key={horario} value={horario}>
                                  {horario}
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
                      name="horarioFim"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário Fim</FormLabel>
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
                              {horariosDisponiveis.slice(
                                horariosDisponiveis.indexOf(form.getValues("horarioInicio")) + 1
                              ).map((horario) => (
                                <SelectItem key={horario} value={horario}>
                                  {horario}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Status e Observações */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="confirmado">Confirmado</SelectItem>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                            <SelectItem value="finalizado">Finalizado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="observacoes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Observações adicionais sobre o agendamento" 
                            className="resize-none h-24" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="pt-4">
                <Card>
                  <CardContent className="pt-6 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={empresaSelecionada?.imageUrl} />
                          <AvatarFallback>
                            {empresaSelecionada?.nome?.substring(0, 2) || "NA"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {empresaSelecionada?.nome || "Empresa não selecionada"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {particaoSelecionada?.nome || "Partição não selecionada"}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(form.getValues().status)}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {form.getValues().data
                            ? format(form.getValues().data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                            : "Data não selecionada"}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {`${form.getValues().horarioInicio} - ${form.getValues().horarioFim}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {form.getValues().clienteNome || "Cliente não informado"}
                        </span>
                      </div>
                      
                      {form.getValues().clienteTelefone && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{form.getValues().clienteTelefone}</span>
                        </div>
                      )}
                    </div>
                    
                    {form.getValues().observacoes && (
                      <>
                        <Separator className="my-4" />
                        <div className="text-sm">
                          <h4 className="font-medium mb-1">Observações:</h4>
                          <p className="text-muted-foreground">
                            {form.getValues().observacoes}
                          </p>
                        </div>
                      </>
                    )}
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {form.getValues().status === "pendente" ? (
                          <div className="flex items-center text-yellow-500">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span>Aguardando confirmação</span>
                          </div>
                        ) : form.getValues().status === "confirmado" ? (
                          <div className="flex items-center text-green-500">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span>Confirmado</span>
                          </div>
                        ) : (
                          <span>Status: {form.getValues().status}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? "Salvar Alterações" : "Criar Agendamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
