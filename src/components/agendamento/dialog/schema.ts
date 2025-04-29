import * as z from "zod";

export const agendamentoSchema = z.object({
  empresaId: z.string(),
  particaoId: z.string(),
  usuarioId: z.number(),
  data: z.date(),
  horarioInicio: z.string(),
  horarioFim: z.string(),
  diaSemanaIndex: z.number(),
  status: z.string(),
  observacoes: z.string().optional(),
});

export type AgendamentoFormValues = z.infer<typeof agendamentoSchema>;
