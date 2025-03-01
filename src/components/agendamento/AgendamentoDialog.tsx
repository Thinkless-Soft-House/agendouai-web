
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

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
  status: z.enum(["confirmado", "pendente", "cancelado"], { 
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
      <DialogContent className="sm:max-w-[600px]">
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
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={ptBR}
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
                    <FormLabel>Horário de Início</FormLabel>
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
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
