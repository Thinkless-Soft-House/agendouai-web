import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { id } from "date-fns/locale";

export interface Responsavel {
  id: number;
  salaId: number;
  usuarioId: number;
}

export const useResponsaveis = () => {
  const fetchResponsaveis = async (): Promise<Responsavel[]> => {
    try {

      const response = await axios.get<{ data: any }>(
        `http://localhost:3000/responsavel/`
      );

      return response.data.data.map((responsavel: Responsavel) => ({
        id: responsavel.id,
        salaId: responsavel.salaId,
        usuarioId: responsavel.usuarioId,
      }));
      
    } catch (error) {
      console.error("Erro ao buscar responsáveis:", error);
      throw new Error(
        "Falha ao carregar responsáveis. Tente novamente mais tarde."
      );
    }
  };

  // Usar useQuery para buscar os responsáveis
  const {
    data: responsaveis = [],
    isLoading: isLoadingResponsaveis
  } = useQuery({
    // Usar os IDs como parte da chave para invalidação de cache
    queryKey: ["responsaveis"],
    queryFn: fetchResponsaveis,
  });

  return {
    responsaveis,
    isLoadingResponsaveis,
  };
};