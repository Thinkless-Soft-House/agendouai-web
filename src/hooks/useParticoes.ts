import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Particao } from "@/pages/Particoes";

export const useParticoes = (selectedEmpresaId: string) => {
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const fetchParticoes = async (): Promise<Particao[]> => {
    if (!selectedEmpresaId) return [];

    setIsFilterLoading(true);

    try {
      const response = await axios.get<{ data: { data: any[] } }>(
        `http://localhost:3000/sala/empresa/${selectedEmpresaId}`
      );
      // console.log("Response [PARTICOES COMPANY]:", response.data);

      // Mapeia os dados da API para o tipo Particao
      return response.data.data.data.map((particao) => ({
        id: particao.id,
        nome: particao.nome || "Nome Não Informado",
        tipo: particao.tipo || "sala", // Define um valor padrão para o tipo
        empresaId: particao.empresaId || selectedEmpresaId,
        empresaNome: particao.empresaNome || "Empresa Não Informada",
        descricao: particao.descricao || "Descrição não informada",
        capacidade: particao.capacidade || 0, // Define um valor padrão para capacidade
        disponivel: particao.disponivel || false, // Define um valor padrão para disponibilidade
        criadoEm: particao.criadoEm || new Date().toISOString(),
        status: particao.status || "active", // Adiciona a propriedade status com um valor padrão
      }));
    } catch (error) {
      console.error("Erro ao buscar partições:", error);
      throw new Error("Falha ao carregar partições. Tente novamente mais tarde.");
    } finally {
      setIsFilterLoading(false);
    }
  };

  const { data: particoes = [], isLoading: isLoadingParticoes } = useQuery({
    queryKey: ["particoes-agendamento", selectedEmpresaId],
    queryFn: fetchParticoes,
    enabled: !!selectedEmpresaId, // A consulta só é executada se selectedEmpresaId estiver definido
  });

  return {
    particoes,
    isLoadingParticoes,
    isFilterLoading,
  };
};