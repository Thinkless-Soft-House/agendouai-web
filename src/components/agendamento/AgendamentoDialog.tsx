
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
import {
  Form,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Agendamento } from "@/types/agendamento";
import { Empresa } from "@/pages/Empresas";
import { Particao } from "@/pages/Particoes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { agendamentoSchema, AgendamentoFormValues } from "./dialog/schema";
import { InfoTab } from "./dialog/InfoTab";
import { SchedulingTab } from "./dialog/SchedulingTab";
import { PreviewTab } from "./dialog/PreviewTab";

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

  const handleHorarioInicioChange = (value: string) => {
    form.setValue("horarioInicio", value);
    form.setValue("horarioFim", calcularHorarioFim(value));
  };

  const handleTimeSlotSelect = (horarioInicio: string, horarioFim: string) => {
    form.setValue("horarioInicio", horarioInicio);
    form.setValue("horarioFim", horarioFim);
  };

  const onSubmit = (values: AgendamentoFormValues) => {
    console.log("Form values:", values);
    
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="scheduling">Agendamento</TabsTrigger>
                <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-6 pt-4">
                <InfoTab 
                  form={form} 
                  isEditing={isEditing} 
                  empresas={empresas} 
                  particoes={particoes} 
                  horariosDisponiveis={horariosDisponiveis}
                  handleHorarioInicioChange={handleHorarioInicioChange}
                />
              </TabsContent>
              
              <TabsContent value="scheduling" className="pt-4">
                <SchedulingTab 
                  form={form} 
                  particoes={particoes} 
                  handleTimeSlotSelect={handleTimeSlotSelect}
                />
              </TabsContent>
              
              <TabsContent value="preview" className="pt-4">
                <PreviewTab 
                  form={form} 
                  empresas={empresas} 
                  particoes={particoes}
                />
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
