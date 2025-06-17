import { useQuery } from "@tanstack/react-query";
import { Agendamento } from "@/types/agendamento";

const apiUrl = import.meta.env.VITE_API_URL || "";

// Helper para headers com token
function getAuthHeaders() {
  const accessToken = localStorage.getItem("authToken")?.replace(/^"|"$/g, "");
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

// Busca lista de agendamentos (com filtros opcionais)
export async function fetchAgendamentos(params: Record<string, any> = {}): Promise<Agendamento[]> {
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
    ? `${apiUrl}/bookings/query`
    : `http://${apiUrl}/bookings/query`;

  const filters: Record<string, any> = { ...params };
  if (usuarioRole === "manager") {
    filters.companyId = usuarioEmpresaId;
  } else if (usuarioRole !== "admin") {
    return [];
  }

  if (!filters.relations) {
    filters.relations = "space:space,user:user,company:company";
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
  console.log("[fetchAgendamentos] Resultado da requisição:", result);
  return (result.data.items || []).map((item: any) => {
    // Converte minutos para string de horário (ex: 630 -> "10:30")
    function minutosParaHorario(minutos: number) {
      if (typeof minutos !== "number" || isNaN(minutos)) return "";
      const h = Math.floor(minutos / 60).toString().padStart(2, "0");
      const m = (minutos % 60).toString().padStart(2, "0");
      return `${h}:${m}`;
    }
    // Converte bookingDate para string local (YYYY-MM-DD)
    function dataLocal(dateStr: string) {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      // Retorna no formato ISO local (sem fuso)
      return d.toISOString().slice(0, 10);
    }
    // Tradução de status do backend para frontend
    function traduzirStatus(status: string) {
      switch (status) {
        case "active": return "confirmado";
        case "pending": return "pendente";
        case "canceled": return "cancelado";
        case "completed": return "finalizado";
        default: return status;
      }
    }
    return {
      id: String(item.id),
      companyId: String(item.companyId),
      spaceId: String(item.spaceId),
      userId: item.userId,
      clientName: item.user?.person?.name || item.user?.username || "",
      clientEmail: item.user?.person?.email || item.user?.username || "",
      clientTelefone: item.user?.person?.phoneNumber || "",
      data: item.bookingDate, // Mantém a string ISO completa para funcionar com isSameDay
      startTime: minutosParaHorario(item.startTime),
      endTime: minutosParaHorario(item.endTime),
      status: traduzirStatus(item.status),
      notes: item.notes,
      spaceName: item.space?.name || "",
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });
}

// Cria um novo agendamento
export async function createAgendamento(data: Partial<Agendamento>) {
  const endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/bookings`
    : `http://${apiUrl}/bookings`;

  const headers = getAuthHeaders();

  // Convert time string to minutes (e.g., "09:30" -> 570)
  function timeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Convert status from frontend to backend format
  function statusToBackend(frontendStatus: string): string {
    switch (frontendStatus) {
      case "confirmado": return "active";
      case "pendente": return "pending";
      case "cancelado": return "canceled";
      case "finalizado": return "completed";
      default: return "pending"; // Default for new bookings
    }
  }

  // Convert the data to the format expected by your backend
  const bookingPayload = {
    bookingDate: data.data, // Keep as ISO string
    weekdayIndex: new Date(data.data || new Date()).getDay(),
    spaceId: parseInt(data.spaceId || "0"),
    userId: data.userId || 0,
    companyId: parseInt(data.companyId || "0"),
    startTime: timeToMinutes(data.startTime || ""),
    endTime: timeToMinutes(data.endTime || ""),
    notes: data.notes || "",
    status: statusToBackend(data.status || "pending")
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(bookingPayload),
  });

  const result = await response.json();
  console.log("[createAgendamento] result:", result);
  return {
    ok: response.ok,
    status: response.status,
    data: result,
  };
}

// Atualiza um agendamento existente
export async function updateAgendamento(id: string, data: Partial<Agendamento>) {
  const endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/bookings/${id}`
    : `http://${apiUrl}/bookings/${id}`;

  const headers = getAuthHeaders();

  // Convert time string to minutes (e.g., "09:30" -> 570)
  function timeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Convert status from frontend to backend format
  function statusToBackend(frontendStatus: string): string {
    switch (frontendStatus) {
      case "confirmado": return "active";
      case "pendente": return "pending";
      case "cancelado": return "canceled";
      case "finalizado": return "completed";
      default: return frontendStatus; // Preserve original if not mapped
    }
  }

  // Convert the data to the format expected by your backend
  const bookingPayload = {
    bookingDate: data.data, // Keep as ISO string
    weekdayIndex: new Date(data.data || new Date()).getDay(),
    spaceId: parseInt(data.spaceId || "0"),
    userId: data.userId || 0,
    companyId: parseInt(data.companyId || "0"),
    startTime: timeToMinutes(data.startTime || ""),
    endTime: timeToMinutes(data.endTime || ""),
    notes: data.notes || "",
    status: statusToBackend(data.status || "pending")
  };

  const response = await fetch(endpoint, {
    method: "PUT",
    headers,
    credentials: "include",
    body: JSON.stringify(bookingPayload),
  });

  const result = await response.json();
  console.log("[updateAgendamento] result:", result);
  return {
    ok: response.ok,
    status: response.status,
    data: result,
  };
}

// Deleta um agendamento
export async function deleteAgendamento(id: string) {
  const endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/bookings/${id}`
    : `http://${apiUrl}/bookings/${id}`;

  const headers = getAuthHeaders();

  const response = await fetch(endpoint, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  const result = await response.json().catch(() => ({}));
  console.log("[deleteAgendamento] result:", result);
  return {
    ok: response.ok,
    status: response.status,
    data: result,
  };
}

// Exporta o hook useAgendamento para uso no frontend
export function useAgendamento(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ["agendamentos", params],
    queryFn: () => fetchAgendamentos(params),
  });
}
