import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Particao } from "@/pages/Particoes";
import { getApiEndpoint } from "@/lib/api";

export const useParticoes = (selectedEmpresaId: string) => {
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const fetchParticoes = async (): Promise<Particao[]> => {
    if (!selectedEmpresaId) return [];

    setIsFilterLoading(true);

    try {
      const response = await axios.get<{ data: { data: any[] } }>(
        getApiEndpoint(`sala/empresa/${selectedEmpresaId}`)
      );
      // console.log("Response [PARTICOES COMPANY]:", response.data);

      // Mapeia os dados da API para o tipo Particao
      return response.data.data.data.map((particao) => ({
        id: particao.id,
        nome: particao.nome || "Nome Não Informado",
        empresaId: particao.empresaId || selectedEmpresaId,
        empresaNome: particao.empresaNome || "Empresa Não Informada",
        descricao: particao.descricao || "Descrição não informada",
        criadoEm: particao.criadoEm || new Date().toISOString(),
        status: particao.status || 2,
        disponivel: particao.disponivel || false,
        foto: particao.foto || null,
        multiplasMarcacoes: particao.multiplasMarcacoes || false,
        disponibilidades: particao.disponibilidades || [],
        responsavel: particao.responsavel || []
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