import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const apiUrl = import.meta.env.VITE_API_URL || "";

export interface People {
  id: number;
  phoneNumber: string;
  createdBy?: number;
  updatedBy?: number;
  cpf?: string;
  cep?: string;
  photoUrl?: string;
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  addressNumber?: string;
  birthDate?: Date | string;
  companyId?: number;
  userId: number;
  user?: any;
}

function getAuthHeaders() {
  const accessToken = localStorage.getItem("authToken")?.replace(/^"|"$/g, "");
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export async function fetchPeople(params: Record<string, any> = {}): Promise<People[]> {
  let endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/people/query`
    : `http://${apiUrl}/people/query`;

  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      urlParams.append(key, String(value));
    }
  });

  const fullUrl = `${endpoint}?${urlParams.toString()}`;
  const headers = getAuthHeaders();

  const response = await fetch(fullUrl, {
    method: "GET",
    headers,
    credentials: "include",
  });

  const result = await response.json();
  return result.data.items || [];
}

export async function createPerson(data: Partial<People>) {
  const endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/people`
    : `http://${apiUrl}/people`;
  const headers = getAuthHeaders();
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return {
    ok: response.ok,
    status: response.status,
    data: result,
  };
}

export async function updatePerson(id: number, data: Partial<People>) {
  const endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/people/${id}`
    : `http://${apiUrl}/people/${id}`;
  const headers = getAuthHeaders();
  const response = await fetch(endpoint, {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return {
    ok: response.ok,
    status: response.status,
    data: result,
  };
}

export async function deletePerson(id: number) {
  const endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/people/${id}`
    : `http://${apiUrl}/people/${id}`;
  const headers = getAuthHeaders();
  const response = await fetch(endpoint, {
    method: "DELETE",
    headers,
    credentials: "include",
  });
  const result = await response.json().catch(() => ({}));
  return {
    ok: response.ok,
    status: response.status,
    data: result,
  };
}

export function usePeople(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ["people", params],
    queryFn: () => fetchPeople(params),
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<People> }) => updatePerson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["people"] });
    },
  });
}
