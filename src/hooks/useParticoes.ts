
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Particao } from "@/pages/Particoes";

export const useParticoes = (selectedEmpresaId: string) => {
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const fetchParticoes = async (): Promise<Particao[]> => {
    if (!selectedEmpresaId) return [];
    
    setIsFilterLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      return Array.from({ length: 5 }, (_, i) => {
        const tipoOptions = ["sala", "funcionario", "equipamento"] as const;
        const tipo = tipoOptions[i % 3];
        
        return {
          id: `particao-${selectedEmpresaId}-${i + 1}`,
          nome: tipo === "sala" 
            ? `Sala ${i + 1}` 
            : tipo === "funcionario" 
              ? `Funcionário ${i + 1}` 
              : `Equipamento ${i + 1}`,
          tipo,
          empresaId: selectedEmpresaId,
          empresaNome: `Empresa ${selectedEmpresaId.split('-')[1]}`,
          descricao: `Descrição da ${tipo === "sala" ? "sala" : tipo === "funcionario" ? "do funcionário" : "do equipamento"} ${i + 1}`,
          capacidade: tipo === "sala" ? Math.floor(Math.random() * 20) + 1 : undefined,
          disponivel: i % 5 !== 0,
          criadoEm: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        };
      });
    } finally {
      setIsFilterLoading(false);
    }
  };

  const { data: particoes = [], isLoading: isLoadingParticoes } = useQuery({
    queryKey: ["particoes-agendamento", selectedEmpresaId],
    queryFn: fetchParticoes,
    enabled: !!selectedEmpresaId,
  });

  return {
    particoes,
    isLoadingParticoes,
    isFilterLoading
  };
};
