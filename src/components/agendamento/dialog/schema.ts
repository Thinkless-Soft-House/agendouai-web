
import * as z from "zod";

export const agendamentoSchema = z.object({
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

export type AgendamentoFormValues = z.infer<typeof agendamentoSchema>;
