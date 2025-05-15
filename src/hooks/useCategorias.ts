import { useQuery } from "@tanstack/react-query";

const apiUrl = import.meta.env.VITE_API_URL || "";

// Interface conforme o model do backend
export interface Categoria {
  id: number;
  description: string;
  partitionPrefix?: string;
  // Relationships (opcional)
  companies?: any[];
}

// Helper para headers com token
function getAuthHeaders() {
  const accessToken = localStorage.getItem("authToken")?.replace(/^"|"$/g, "");
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

// Busca lista de categorias
export async function fetchCategorias(): Promise<Categoria[]> {
  const endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/company-categories`
    : `http://${apiUrl}/company-categories`;

  const headers = getAuthHeaders();

  const response = await fetch(endpoint, {
    method: "GET",
    headers,
    credentials: "include",
  });

  const result = await response.json();
  console.log("[fetchCategorias] result:", result);

  // Ajuste conforme o formato do backend
  return (result.data?.items || result.data || []).map((cat: any) => ({
    id: cat.id,
    description: cat.description,
    partitionPrefix: cat.partitionPrefix,
    companies: cat.companies,
  }));
}

// Hook para usar categorias
export function useCategorias() {
  const query = useQuery({
    queryKey: ["categorias"],
    queryFn: fetchCategorias,
  });
  return {
    categorias: query.data || [],
    isLoadingCategorias: query.isLoading,
    ...query,
  };
}
