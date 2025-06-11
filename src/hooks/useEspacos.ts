import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Espaco } from "@/pages/Particoes";

export const useEspacos = (selectedCompanyId: string) => {
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // Helper para headers com token
  function getAuthHeaders() {
    const accessToken = localStorage.getItem("authToken")?.replace(/^"|"$/g, "");
    return {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
  }

  // Busca espaços
  const fetchEspacos = async (): Promise<Espaco[]> => {
    if (!selectedCompanyId) return [];
    setIsFilterLoading(true);
    try {
      // Recupera o usuário do localStorage
      const rawUser = localStorage.getItem("user");
      let usuarioRole = "";
      let usuarioEmpresaId = "";
      if (rawUser) {
        try {
          const user = JSON.parse(rawUser);
          usuarioRole = user?.role || "";
          usuarioEmpresaId = user?.companyId || "";
        } catch { }
      }

      const apiUrl = import.meta.env.VITE_API_URL || "";
      let endpoint = apiUrl.startsWith("http")
        ? `${apiUrl}/spaces/query`
        : `http://${apiUrl}/spaces/query`;
      const headers = getAuthHeaders();

      // Monta os parâmetros de query string
      let urlParams = new URLSearchParams();
      if (usuarioRole === "admin" || usuarioRole === "Administrador") {
        // Admin: query vazio ou com params
        // (Se quiser passar params extras, adicione aqui)
      } else {
        // Outros: precisa mandar companyId
        urlParams.append("companyId", usuarioEmpresaId || selectedCompanyId);
      }

      const response = await fetch(`${endpoint}?${urlParams.toString()}`, {
        method: "GET",
        headers,
        credentials: "include",
      });
      const result = await response.json();
      return (result.data?.items || result.data || []).map((espaco: any) => ({
        id: espaco.id,
        name: espaco.name,
        companyId: espaco.companyId,
        companyName: espaco.company?.name || "",
        status: espaco.status,
        multipleBookings: espaco.multipleBookings,
        photoUrl: espaco.photoUrl,
        createdBy: espaco.createdBy,
        updatedBy: espaco.updatedBy,
        spaceManagers: espaco.spaceManagers,
        availabilities: espaco.availabilities,
        descricao: espaco.descricao,
        ...espaco
      }));
    } catch (error) {
      console.error("Erro ao buscar espaços:", error);
      throw new Error("Falha ao carregar espaços. Tente novamente mais tarde.");
    } finally {
      setIsFilterLoading(false);
    }
  };

  // Busca funcionários (usuários do tipo employee)
  const fetchFuncionarios = async (): Promise<any[]> => {
    if (!selectedCompanyId) return [];
    try {
      // Recupera o usuário do localStorage
      const rawUser = localStorage.getItem("user");
      let userRole = "";
      let usuarioEmpresaId = "";
      if (rawUser) {
        try {
          const user = JSON.parse(rawUser);
          userRole = user?.role || "";
          usuarioEmpresaId = user?.companyId || "";
        } catch {}
      }

      const apiUrl = import.meta.env.VITE_API_URL || "";
      let endpoint = apiUrl.startsWith("http")
        ? `${apiUrl}/users/query`
        : `http://${apiUrl}/users/query`;
      const headers = getAuthHeaders();

      // Monta os parâmetros de query string
      let urlParams = new URLSearchParams();
      if (userRole === "admin" || userRole === "Administrador") {
        // Admin: busca todos os usuários com role employee, sem companyId
        urlParams.append(
          "filters",
          JSON.stringify([
            { field: "permission", operator: "eq", value: "employee" },
          ])
        );
      } else {
        // Outros: busca funcionários da empresa
        urlParams.append(
          "filters",
          JSON.stringify([
            { field: "companyId", operator: "eq", value: usuarioEmpresaId || selectedCompanyId },
            { field: "permission", operator: "eq", value: "employee" },
          ])
        );
      }

      const response = await fetch(`${endpoint}?${urlParams.toString()}`,
        {
          method: "GET",
          headers: {
            ...headers,
            'Cache-Control': 'no-cache',
          },
          credentials: "include",
        }
      );
      if (response.status === 204) {
        console.log("[fetchFuncionarios] response 204 sem dados:", response);
        return [];
      }
      const result = await response.json();
      if (!result || !result.data) {
        console.log("[fetchFuncionarios] sem dados:", result);
        return [];
      }
      const users = result.data?.items || result.data || [];
      return users.map((user: any) => ({
        id: String(user.id),
        nome: user.person?.name || user.pessoa?.nome || "Nome Não Informado",
        email: user.username || user.login,
        role: user.permission || user.permissao?.descricao || "Cliente",
        empresaId: user.companyId || user.empresa || "Empresa Não Informada",
      }));
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      throw new Error("Falha ao carregar usuários. Tente novamente mais tarde.");
    }
  };

  // Garante que a query de funcionários só será ativada quando selectedCompanyId estiver disponível e não for vazio
  const shouldFetchFuncionarios = Boolean(selectedCompanyId && selectedCompanyId !== "");

  const { data: espacos = [], isLoading: isLoadingEspacos } = useQuery({
    queryKey: ["espacos-agendamento", selectedCompanyId],
    queryFn: fetchEspacos,
    enabled: !!selectedCompanyId,
  });

  const { data: funcionarios = [], isLoading: isLoadingFuncionarios } = useQuery({
    queryKey: ["funcionarios", selectedCompanyId],
    queryFn: fetchFuncionarios,
    enabled: shouldFetchFuncionarios,
  });

  return {
    espacos,
    isLoadingEspacos,
    isFilterLoading,
    funcionarios,
    isLoadingFuncionarios,
  };
};