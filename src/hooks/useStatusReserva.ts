import { useEffect, useState } from "react";
import axios from "axios";
import { getApiEndpoint } from "@/lib/api";

// Ajuste a interface para refletir o backend real
export interface StatusReserva {
  id: number;
  reservaId: number;
  statusId: number;
  reserva: any; // Use o tipo correto se desejar
  status: {
    id: number;
    nome: string;
    // ...outros campos do StatusEntity se necessário
  };
}

export function useStatusReserva() {
  const [statusReserva, setStatusReserva] = useState<StatusReserva[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatusReserva = async (): Promise<StatusReserva[]> => {
    setLoading(true);
    try {
      const response = await axios.get<{ data: StatusReserva[] }>(
        getApiEndpoint("statusReserva")
      );
      // O backend retorna { data: StatusReserva[] }
      console.log("Response [STATUS RESERVA]:", response.data);

      return response.data.data || [];
    } catch (err: any) {
      console.error("Erro ao buscar status das reservas:", err);
      throw new Error("Falha ao carregar status das reservas. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusReserva()
      .then(setStatusReserva)
      .catch(setError);
  }, []);

  return { statusReserva, loading, error };
}
