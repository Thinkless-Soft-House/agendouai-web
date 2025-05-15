import { useUsuarioLogado } from "./useUsuarioLogado";

const apiUrl = import.meta.env.VITE_API_URL || "";

// Enums conforme o model do backend
export enum UserStatus {
  ACTIVE = "ativo",
  INACTIVE = "inativo",
  PENDING = "pendente",
  CANCELED = "cancelado",
  COMPLETED = "concluido",
}

export enum UserPermission {
  ADMIN = "admin",
  MANAGER = "gestor",
  EMPLOYEE = "funcionario",
  USER = "usuario",
}

// Interfaces conforme o model do backend
export interface Person {
  phoneNumber: string;
  createdBy?: number;
  updatedBy?: number;
  companyId?: number;

  // Nullable
  cpf?: string;
  cep?: string;
  photoUrl?: string;
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  addressNumber?: string;
  birthDate?: Date;
}

export interface Company {
  id: number;
  nome: string;
}

export interface User {
  id: number;
  createdBy?: number;
  updatedBy?: number;
  permission: UserPermission;
  username: string;
  password: string;
  status?: UserStatus;
  resetCode?: string;
  pushToken?: string;
  companyId?: number;
  personId?: number;
  company?: Company;
  person?: Person;
}

// Helper para headers com token
function getAuthHeaders() {
  const accessToken = localStorage.getItem("authToken")?.replace(/^"|"$/g, "");
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

// Busca lista de usuários (com filtros opcionais)
// Para incluir relations, adicione o parâmetro relations na query string, por exemplo: relations=person
export async function fetchUsers(params: Record<string, any> = {}): Promise<User[]> {
  // Use a role e companyId do usuário logado via hook
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

  // Recupera o token salvo no localStorage
  const accessToken = localStorage.getItem("authToken")?.replace(/^"|"$/g, "");

  let endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/users/query`
    : `http://${apiUrl}/users/query`;

  // Monta os filtros como query params
  const filters: Record<string, any> = { ...params };
  if (usuarioRole === "Empresa") {
    filters.companyId = usuarioEmpresaId;
  } else if (usuarioRole !== "admin" && usuarioRole !== "Administrador") {
    // Outros papéis não podem listar usuários
    return [];
  }

  // Para incluir a relação com a tabela people/person, adicione relations=person
  if (!filters.relations) {
    filters.relations = "person";
  }

  const urlParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
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
  console.log("[fetchUsers] Resultado da requisição:", result);
  // Mapeia os dados recebidos para o model do backend
  return (result.data.items || []).map((user: any) => ({
    id: user.id,
    createdBy: user.createdBy,
    updatedBy: user.updatedBy,
    permission: user.permission || user.permissao || UserPermission.USER,
    username: user.username || user.login,
    status: user.status,
    resetCode: user.resetCode,
    pushToken: user.pushToken,
    companyId: user.companyId,
    personId: user.personId,
    company: user.company,
    person: user.person,
    name: user.person?.name 

  }));
}

// Cria um novo usuário
export async function createUser(data: Partial<User>) {
  const endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/users`
    : `http://${apiUrl}/users`;

  const headers = getAuthHeaders();

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();
  console.log("[createUser] result:", result);
  return {
    ok: response.ok,
    status: response.status,
    data: result,
  };
}

// Atualiza um usuário existente
export async function updateUser(id: number, data: Partial<User>) {
  const endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/users/${id}`
    : `http://${apiUrl}/users/${id}`;

  const headers = getAuthHeaders();

  const response = await fetch(endpoint, {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();
  console.log("[updateUser] result:", result);
  return {
    ok: response.ok,
    status: response.status,
    data: result,
  };
}

// Deleta um usuário
export async function deleteUser(id: number) {
  const endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/usuario/${id}`
    : `http://${apiUrl}/usuario/${id}`;

  const headers = getAuthHeaders();

  const response = await fetch(endpoint, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  const result = await response.json().catch(() => ({}));
  console.log("[deleteUser] result:", result);
  return {
    ok: response.ok,
    status: response.status,
    data: result,
  };
}
