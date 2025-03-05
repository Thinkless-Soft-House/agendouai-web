
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Agendamento } from "@/types/agendamento";

export const useAgendamentos = (selectedEmpresaId: string, selectedParticaoId: string, date: Date, filterText: string) => {
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const fetchAgendamentos = async (): Promise<Agendamento[]> => {
    if (!selectedEmpresaId) return [];
    
    setIsFilterLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const currentMonth = date.getMonth();
      const currentYear = date.getFullYear();
      
      return Array.from({ length: 20 }, (_, i) => {
        const day = Math.floor(Math.random() * 28) + 1;
        const hora = Math.floor(Math.random() * 10) + 8; // Entre 8h e 18h
        const agendamentoDate = new Date(currentYear, currentMonth, day);
        
        const horarioInicio = `${hora}:00`;
        const horarioFim = `${hora + 1}:00`;
        
        const statusOptions = ["confirmado", "pendente", "cancelado"] as const;
        const status = statusOptions[Math.floor(Math.random() * 3)];
        
        const requiresAction = i % 4 === 0;
        const actionTypeOptions = ["approval", "response", "update", "review"] as const;
        const actionType = actionTypeOptions[i % 4];
        
        return {
          id: `agendamento-${i}`,
          empresaId: selectedEmpresaId,
          empresaNome: `Empresa ${selectedEmpresaId.split('-')[1]}`,
          particaoId: selectedParticaoId || `particao-${selectedEmpresaId}-${(i % 5) + 1}`,
          particaoNome: selectedParticaoId 
            ? `Partição ${selectedParticaoId.split('-')[2]}`
            : `Partição ${(i % 5) + 1}`,
          clienteNome: `Cliente ${i + 1}`,
          clienteEmail: `cliente${i + 1}@example.com`,
          clienteTelefone: `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
          data: agendamentoDate.toISOString(),
          horarioInicio,
          horarioFim,
          status,
          observacoes: i % 3 === 0 ? `Observações do agendamento ${i + 1}` : undefined,
          requiresAction,
          actionType: requiresAction ? actionType : undefined
        };
      });
    } finally {
      setIsFilterLoading(false);
    }
  };

  const { 
    data: agendamentos = [], 
    isLoading: isLoadingAgendamentos, 
    refetch 
  } = useQuery({
    queryKey: ["agendamentos", selectedEmpresaId, selectedParticaoId, date.getMonth(), date.getFullYear()],
    queryFn: fetchAgendamentos,
    enabled: !!selectedEmpresaId,
  });

  const filteredAgendamentos = agendamentos.filter(a => {
    if (!filterText) return true;
    
    const searchTerm = filterText.toLowerCase();
    return (
      a.clienteNome.toLowerCase().includes(searchTerm) ||
      a.particaoNome.toLowerCase().includes(searchTerm) ||
      a.empresaNome.toLowerCase().includes(searchTerm) ||
      (a.observacoes && a.observacoes.toLowerCase().includes(searchTerm))
    );
  });

  const actionsNeeded = filteredAgendamentos.filter(a => a.requiresAction);

  return {
    agendamentos: filteredAgendamentos,
    actionsNeeded,
    isLoadingAgendamentos,
    isFilterLoading,
    refetch
  };
};
