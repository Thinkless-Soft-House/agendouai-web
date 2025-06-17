import * as z from "zod";

export const agendamentoSchema = z.object({
  id: z.string().optional(),
  companyId: z.string(),
  spaceId: z.string(),
  userId: z.number(),
  clientName: z.string().optional(),
  clientEmail: z.string().optional(), 
  clientTelefone: z.string().optional(),
  data: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.string(),
  notes: z.string().optional(),
  spaceName: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  requiresAction: z.boolean().optional(),
  actionType: z.enum(["approval", "response", "update", "review"]).optional(),
});

export type AgendamentoFormValues = z.infer<typeof agendamentoSchema>;
