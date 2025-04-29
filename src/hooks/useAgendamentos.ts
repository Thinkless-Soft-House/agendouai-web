import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Agendamento } from "@/types/agendamento";
import { format } from "date-fns";

interface AgendamentosParams {
  empresaId: string;
  particaoId?: string;
  date?: Date; // Make date optional
}

// Define the response structure
interface ApiResponse {
  data: any[];
  total: number;
}

export const useAgendamentos = ({ empresaId, particaoId, date }: AgendamentosParams) => {
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // Use current date as fallback if date is undefined
  const safeDate = date || new Date();
  
  // Extract month and year for query
  const month = safeDate.getMonth() + 1; // JavaScript months are 0-indexed
  const year = safeDate.getFullYear();

  // Function to fetch agendamentos
  const fetchAgendamentos = async (): Promise<Agendamento[]> => {
    if (!empresaId) return [];
    setIsFilterLoading(true);

    try {
      let response;

      if (particaoId) {
        // Use the sala/mes endpoint if particaoId is provided
        response = await axios.get<any>(
          `http://localhost:3000/reserva/sala/mes/${particaoId}/${month}/${year}`
        );
      } else {
        // Use the filter endpoint for more flexibility
        const params = new URLSearchParams();
        params.append('empresaId', empresaId);
        
        // Format date range for the entire month
        const startDate = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
        const endDate = format(new Date(year, month, 0), 'yyyy-MM-dd');
        params.append('dataInicio', startDate);
        params.append('dataFim', endDate);
        
        response = await axios.get<any>(
          `http://localhost:3000/reserva/filter?${params.toString()}`
        );
      }

      // Debug full response structure
      console.log("Full Response [AGENDAMENTOS]:", JSON.stringify(response.data, null, 2));
      
      // Handle deeply nested response structure
      let agendamentosData: any[] = [];
      
      // Check different levels of nesting
      if (Array.isArray(response.data)) {
        agendamentosData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        agendamentosData = response.data.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
        // Handle double-nested data array: response.data.data.data
        agendamentosData = response.data.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // Try to extract data from deeply nested structure
        const extractNestedData = (obj: any): any[] => {
          // Look for any array inside this object
          for (const key in obj) {
            if (Array.isArray(obj[key])) {
              return obj[key];
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              // Recursive check for arrays
              const result = extractNestedData(obj[key]);
              if (result.length > 0) return result;
            }
          }
          return [];
        };
        
        agendamentosData = extractNestedData(response.data);
      }
      
      console.log("Normalized agendamentosData:", agendamentosData);
      
      // Double check it's definitely an array before mapping
      if (!Array.isArray(agendamentosData)) {
        console.error("API response data is not an array after normalization:", response.data);
        return [];
      }

      // Map the API response to our Agendamento type with exact field matching
      return agendamentosData.map((item: any) => ({
        id: item.id,
        empresaId: item.empresaId || item.empresaid || empresaId,
        particaoId: item.salaId?.toString() || "",
        particaoNome: item.salaNome || "Sala não informada",
        usuarioId: item.usuarioId,
        usuarioNome: item.usuario?.login || item.usuarioNome || "Usuário não informado",
        clienteNome: item.pessoa?.nome || "Cliente não informado",
        clienteEmail: item.pessoa?.email || item.usuario?.login || "Email não informado",
        clienteTelefone: item.pessoa?.telefone || "Telefone não informado",
        data: item.date || item.data,
        horarioInicio: item.horaInicio || item.horarioInicio,
        horarioFim: item.horaFim || item.horarioFim,
        status: item.status || "pendente",
        observacoes: item.observacao || "",
        diaSemanaIndex: item.diaSemanaIndex || new Date(item.date || item.data).getDay(),
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      return []; 
    } finally {
      setIsFilterLoading(false);
    }
  };

  // Use React Query to fetch and cache data
  const { 
    data: agendamentos = [], 
    isLoading: isLoadingAgendamentos,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["agendamentos", empresaId, particaoId, month, year],
    queryFn: fetchAgendamentos,
    enabled: !!empresaId, // Only run query if empresaId is provided
  });

  return {
    agendamentos,
    isLoadingAgendamentos,
    isFilterLoading,
    isError,
    error,
    refetch,
  };
};
