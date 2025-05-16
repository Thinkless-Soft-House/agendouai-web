import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getApiEndpoint } from "@/lib/api";

// Define the User interface
export interface User {
  id: number;
  name: string;
  email: string;
  telefone?: string;
  permissionId: number;
  permissionName?: string;
  empresaId?: number;
  status?: string;
  criadoEm?: string;
}

export const useUsers = (initialSearchTerm: string = "") => {
  const [searchQuery, setSearchQuery] = useState(initialSearchTerm);

  const fetchUsers = async (): Promise<User[]> => {
    try {
      console.log('useUsers - Fetching users with searchQuery:', searchQuery);
      
      const usuarioLogado = JSON.parse(
        localStorage.getItem("authToken") || "{}"
      );
      
      console.log('useUsers - Usuario logado:', usuarioLogado);
      
      const usuarioRole = usuarioLogado?.permissao?.descricao || "";
      console.log('useUsers - Role do usuário:', usuarioRole);
      
      const usuarioEmpresaId = usuarioLogado?.empresaId || "";
      console.log('useUsers - ID da empresa do usuário:', usuarioEmpresaId);

      // Build query parameters for filtering
      let endpoint = getApiEndpoint("usuario");
      let params = new URLSearchParams();
      
      // Only fetch users with permissionId = 2 (Cliente)
      params.append("permissaoId", "2"); // Note: Changed from permissionId to permissaoId to match backend
      
      // Add search term if provided
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      console.log('useUsers - Query parameters:', params.toString());

      // Add different filters based on user role
      if (usuarioRole === "Administrador") {
        // Admin can see all clients
        console.log('useUsers - Usuário é admin, buscando todos os clientes');
      } else if (usuarioRole === "Empresa") {
        // Empresa can only see their own clients
        params.append("empresaId", usuarioEmpresaId.toString());
        console.log('useUsers - Usuário é empresa, filtrando por empresaId:', usuarioEmpresaId);
      } else {
        // Other roles may have restricted access
        console.log('useUsers - Usuário não tem permissão para listar clientes');
        return [];
      }

      const fullUrl = `${endpoint}?${params.toString()}`;
      console.log('useUsers - URL da requisição:', fullUrl);

      const response = await axios.get<{ data: any[] }>(fullUrl);
      console.log('useUsers - Resposta bruta da API:', response.data);

      // Check if we have a data array and log it
      if (response.data && Array.isArray(response.data.data)) {
        console.log('useUsers - Quantidade de usuários recebidos:', response.data.data.length);
      }

      const mappedUsers = response.data.data
        // Filter to ensure only users with permissionId 2 are included
        .filter(user => {
          const permissaoId = user.permissaoId || 0;
          const isClient = permissaoId === 2;
          console.log(`useUsers - Verificando usuário ${user.id}: permissaoId = ${permissaoId}, isClient = ${isClient}`);
          return isClient;
        })
        .map((user) => {
          // Access pessoa properties safely with optional chaining
          const mappedUser = {
            id: user.id,
            name: user.pessoa?.nome || "Nome não informado",
            email: user.login || "Email não informado",
            telefone: user.pessoa?.telefone || "Telefone não informado",
            permissionId: user.permissaoId || 0, // Store as received from API
            permissionName: user.permissao?.descricao || "Cliente",
            empresaId: user.empresaId,
            status: user.status || "active",
            criadoEm: user.criadoEm || new Date().toISOString(),
          };
          
          console.log('useUsers - Usuário mapeado:', mappedUser);
          return mappedUser;
        });
      
      console.log('useUsers - Total de usuários filtrados (apenas clientes):', mappedUsers.length);
      return mappedUsers;

    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      console.log('useUsers - Erro detalhado:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      throw new Error(
        "Falha ao carregar usuários. Tente novamente mais tarde."
      );
    }
  };

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["users", searchQuery],
    queryFn: fetchUsers,
    staleTime: 30000, // 30 seconds before considering data stale
  });

  console.log('useUsers - Hook retornando usuários:', users);

  // Function to update search term and trigger refetch
  const searchUsers = (term: string) => {
    console.log('useUsers - searchUsers chamado com termo:', term);
    setSearchQuery(term);
  };

  return {
    users,
    isLoading,
    searchUsers,
    refetch
  };
};
