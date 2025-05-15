import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || "";

// Enums conforme o model do backend
export enum CompanyStatus {
  ATIVO = "ativo",
  INATIVO = "inativo",
  PENDENTE = "pendente",
  CANCELADO = "cancelado",
  CONCLUIDO = "concluido",
}

export enum PaymentStatus {
  ATIVO = "ativo",
  CANCELADO = "cancelado",
  PENDENTE = "pendente",
  FALHA = "falha",
  TRIAL = "trial",
  EXPIRADO = "expirado",
}

export interface Company {
  id: number;
  cpfCnpj: string;
  createdBy: number;
  updatedBy: number;
  status: CompanyStatus;
  cep?: string;
  logoUrl?: string;
  provider?: number;
  name?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  addressNumber?: string;
  defaultAvailability?: object;
  categoryId?: number;
  currentPlanId?: number;
  currentPaymentStatus?: PaymentStatus;
  stripeCustomerId?: string;
  // Relationships
  category?: {
    id: number;
    description: string;
    partitionPrefix?: string;
  };
}

// Helper para headers com token
function getAuthHeaders() {
  const accessToken = localStorage.getItem("authToken")?.replace(/^"|"$/g, "");
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

// Busca lista de empresas (com filtros opcionais)
export async function fetchEmpresas(params: Record<string, any> = {}): Promise<Company[]> {
  let usuarioRole = "";
  let usuarioEmpresaId = "";

  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw);
      usuarioRole = user?.role || "";
      usuarioEmpresaId = user?.companyId || "";
    }
  } catch {
    usuarioRole = "";
    usuarioEmpresaId = "";
  }

  let endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/companies`
    : `http://${apiUrl}/companies`;

  const filters: Record<string, any> = { ...params };
  if (usuarioRole === "Empresa") {
    endpoint = apiUrl.startsWith("http")
      ? `${apiUrl}/companies/${usuarioEmpresaId}`
      : `http://${apiUrl}/companies/${usuarioEmpresaId}`;
  }

  const headers = getAuthHeaders();

  let response;
  if (usuarioRole === "Empresa") {
    response = await fetch(endpoint, {
      method: "GET",
      headers,
      credentials: "include",
    });
    const result = await response.json();
    console.log("[fetchEmpresas] (Empresa) result:", result);
    return result.data ? [result.data] : [];
  } else if (usuarioRole === "admin" || usuarioRole === "Administrador") {
    // Adiciona filtros como query params se houver
    const urlParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        urlParams.append(key, String(value));
      }
    });
    const fullUrl = `${endpoint}?${urlParams.toString()}`;
    response = await fetch(fullUrl, {
      method: "GET",
      headers,
      credentials: "include",
    });
    const result = await response.json();
    console.log("[fetchEmpresas] (Admin) result:", result);
    return (result.data?.items || result.data || []).map((empresa: any) => ({
      id: empresa.id,
      cpfCnpj: empresa.cpfCnpj,
      createdBy: empresa.createdBy,
      updatedBy: empresa.updatedBy,
      status: empresa.status,
      cep: empresa.cep,
      logoUrl: empresa.logoUrl,
      provider: empresa.provider,
      name: empresa.name,
      phone: empresa.phone,
      city: empresa.city,
      state: empresa.state,
      country: empresa.country,
      address: empresa.address,
      addressNumber: empresa.addressNumber,
      defaultAvailability: empresa.defaultAvailability,
      categoryId: empresa.categoryId,
      currentPlanId: empresa.currentPlanId,
      currentPaymentStatus: empresa.currentPaymentStatus,
      stripeCustomerId: empresa.stripeCustomerId,
      category: empresa.category,
    }));
  } else {
    console.log("[fetchEmpresas] (Outro papel) retorna vazio");
    return [];
  }
}

// Cria uma nova empresa
export async function createEmpresa(data: Partial<Company>) {
  const endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/companies`
    : `http://${apiUrl}/companies`;

  const headers = getAuthHeaders();

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();
  console.log("[createEmpresa] result:", result);
  return {
    ok: response.ok,
    status: response.status,
    data: result,
  };
}

// Atualiza uma empresa existente
export async function updateEmpresa(id: number, data: Partial<Company>) {
  const endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/companies/${id}`
    : `http://${apiUrl}/companies/${id}`;

  const headers = getAuthHeaders();

  const response = await fetch(endpoint, {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();
  console.log("[updateEmpresa] result:", result);
  return {
    ok: response.ok,
    status: response.status,
    data: result,
  };
}

// Deleta uma empresa
export async function deleteEmpresa(id: number) {
  const endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/companies/${id}`
    : `http://${apiUrl}/companies/${id}`;

  const headers = getAuthHeaders();

  const response = await fetch(endpoint, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  const result = await response.json().catch(() => ({}));
  console.log("[deleteEmpresa] result:", result);
  return {
    ok: response.ok,
    status: response.status,
    data: result,
  };
}

// Hook para usar empresas
export function useEmpresas(params: Record<string, any> = {}) {
  const query = useQuery({
    queryKey: ["empresas", params],
    queryFn: () => fetchEmpresas(params),
  });
  return {
    empresas: query.data || [],
    isLoadingEmpresas: query.isLoading,
    ...query,
  };
}