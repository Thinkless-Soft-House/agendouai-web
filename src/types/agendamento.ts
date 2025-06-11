export interface Agendamento {
  id: string;
  companyId: string;
  spaceId: string;
  userId: number;
  clientName: string;
  clientEmail: string;
  clientTelefone: string;
  data: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  spaceName?: string;
  createdAt?: string;
  updatedAt?: string;
  requiresAction?: boolean;
  actionType?: "approval" | "response" | "update" | "review";
}

export const StatusColors = {
  confirmado: "bg-green-500",
  pendente: "bg-yellow-500",
  cancelado: "bg-red-500"
};

export const ActionTypeInfo = {
  approval: {
    label: "Aprovação Pendente",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600",
    borderColor: "border-blue-500/20"
  },
  response: {
    label: "Resposta Pendente",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-600",
    borderColor: "border-purple-500/20"
  },
  update: {
    label: "Atualização Necessária",
    bgColor: "bg-orange-500/10", 
    textColor: "text-orange-600",
    borderColor: "border-orange-500/20"
  },
  review: {
    label: "Revisão Pendente",
    bgColor: "bg-teal-500/10",
    textColor: "text-teal-600",
    borderColor: "border-teal-500/20"
  }
};
