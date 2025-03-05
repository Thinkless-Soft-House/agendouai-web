
export type Agendamento = {
  id: string;
  empresaId: string;
  empresaNome: string;
  particaoId: string;
  particaoNome: string;
  clienteNome: string;
  clienteEmail: string;
  clienteTelefone: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  status: "confirmado" | "pendente" | "cancelado";
  observacoes?: string;
  requiresAction?: boolean;
  actionType?: "approval" | "response" | "update" | "review";
};

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
