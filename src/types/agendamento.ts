export interface Agendamento {
  id: string | number;
  empresaId?: string;
  empresaid?: number;
  particaoId?: string;
  salaId?: string;
  salaNome?: string;
  particaoNome?: string;
  usuarioId?: number;
  usuarioNome?: string;
  clienteNome?: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  data?: string;
  date?: string | Date; // Add date as alternative to data
  horarioInicio?: string;
  horaInicio?: string;
  horarioFim?: string;
  horaFim?: string;
  status?: string;
  statusid?: number;
  observacoes?: string;
  observacao?: string;
  requiresAction?: boolean;
  actionType?: "approval" | "response" | "update" | "review";
  diaSemanaIndex?: number;
  createdAt?: string;
  updatedAt?: string;
  
  // Complex nested properties
  pessoa?: {
    id?: number;
    nome?: string;
    email?: string;
    telefone?: string;
    cpfCnpj?: string;
    funcao?: string | null;
    municipio?: string;
  };
  
  usuario?: {
    id?: number;
    login?: string;
    senha?: string;
    status?: number;
    resetPasswordCode?: string | null;
    pessoa?: any;
  };
  
  empresa?: {
    id?: number;
    logo?: string | null;
    nome?: string;
    telefone?: string;
    cpfCnpj?: string;
  };
  
  statusReserva?: Array<{
    statusId: number;
    status: string;
    reservaId: number;
  }>;
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
