import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const apiUrl = import.meta.env.VITE_API_URL || "";

export interface SpaceManager {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  spaceId: number;
  userId: number;
  companyId?: number;
  user?: {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: number | null;
    updatedBy?: number | null;
    permission: string;
    username: string;
    status: string;
    resetCode?: string | null;
    companyId?: number | null;
    pushToken?: string | null;
    people?: {
      id: number;
      createdAt?: string;
      updatedAt?: string;
      phoneNumber: string;
      createdBy?: number | null;
      updatedBy?: number | null;
      cpf?: string;
      cep?: string;
      photoUrl?: string | null;
      name: string;
      city?: string;
      state?: string;
      country?: string | null;
      address?: string;
      userId?: number;
      addressNumber?: string;
      birthDate?: string;
    };
  };
  company?: {
    id: number;
    createdAt?: string;
    updatedAt?: string;
    name: string;
    cpfCnpj?: string;
    createdBy?: number | null;
    updatedBy?: number | null;
    status?: string;
    categoryId?: number;
    cep?: string;
    logoUrl?: string;
    currentPlanId?: number;
    currentPaymentStatus?: string;
    stripeCustomerId?: string;
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
    address?: string;
    addressNumber?: string;
  };
  // Campos de compatibilidade (legacy)
  usuarioId?: string;
  role?: string;
  usuario?: {
    id: string;
    pessoa: {
      nome: string;
      email?: string;
    };
    role?: string;
  };
}

export interface UseSpaceManagersReturn {
  spaceManagers: SpaceManager[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSpaceManagers(): UseSpaceManagersReturn {
  const [spaceManagers, setSpaceManagers] = useState<SpaceManager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSpaceManagers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const endpoint = apiUrl.startsWith("http")
        ? `${apiUrl}/space-managers/query`
        : `http://${apiUrl}/space-managers/query`;

      // Adicionar parâmetros de relations seguindo o padrão do useUsers
      const filters: Record<string, any> = {
        relations: "user:user,user.people:people,company:company"
      };

      const urlParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          urlParams.append(key, String(value));
        }
      });

      const fullUrl = `${endpoint}?${urlParams.toString()}`;

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `Erro ao buscar responsáveis: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      
      // Garantir que retornamos um array com a estrutura correta
      let managersArray = [];
      if (data.success && data.data && data.data.items) {
        managersArray = data.data.items;
      } else if (Array.isArray(data)) {
        managersArray = data;
      } else if (data.data && Array.isArray(data.data)) {
        managersArray = data.data;
      }
      
      setSpaceManagers(managersArray);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar responsáveis';
      setError(errorMessage);
      console.error('Erro ao buscar space managers:', err);
      
      toast({
        variant: "destructive",
        title: "Erro ao carregar responsáveis",
        description: errorMessage,
      });
      
      // Em caso de erro, definir array vazio
      setSpaceManagers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaceManagers();
  }, []);

  const refetch = () => {
    fetchSpaceManagers();
  };

  return {
    spaceManagers,
    isLoading,
    error,
    refetch,
  };
}
