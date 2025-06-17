import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const apiUrl = import.meta.env.VITE_API_URL || "";

// Tipos para as disponibilidades
export interface Availability {
  id?: number;
  openingTime: number;
  closingTime: number;
  weekday: string;
  weekdayIndex: number;
  minDaysCancel: number;
  intervalMinutes: number;
  configuration: Record<string, any>;
  companyId: number;
  spaceId?: number;
  isOpen: boolean;
  is24Hours: boolean;
}

export interface CreateAvailabilityPayload {
  openingTime: number;
  closingTime: number;
  weekday: string;
  weekdayIndex: number;
  minDaysCancel?: number;
  intervalMinutes?: number;
  configuration?: Record<string, any>;
  companyId: number;
  spaceId?: number;
  isOpen?: boolean;
  is24Hours: boolean;
}

// Função para obter headers de autenticação
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Função para buscar disponibilidades
export async function fetchAvailabilities(params: Record<string, any> = {}): Promise<Availability[]> {
  const endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/availabilities`
    : `http://${apiUrl}/availabilities`;

  const headers = getAuthHeaders();
  
  const urlParams = new URLSearchParams();
  if (Object.keys(params).length > 0) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        urlParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(`${endpoint}?${urlParams.toString()}`, {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar disponibilidades: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data?.items || result.data || [];
}

// Função para criar uma disponibilidade
export async function createAvailability(data: CreateAvailabilityPayload) {
  console.log("🔄 [useAvailabilities] Criando disponibilidade:", data);
  
  const endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/availabilities`
    : `http://${apiUrl}/availabilities`;

  console.log("🌐 [useAvailabilities] Endpoint:", endpoint);

  const headers = getAuthHeaders();
  console.log("🔑 [useAvailabilities] Headers:", headers);

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  console.log("📡 [useAvailabilities] Status da resposta:", response.status);

  const result = await response.json();
  console.log("📋 [useAvailabilities] Resposta completa:", result);

  if (!response.ok) {
    console.error("❌ [useAvailabilities] Erro na criação:", result);
    throw new Error(result.message || "Erro ao criar disponibilidade");
  }

  console.log("✅ [useAvailabilities] Disponibilidade criada com sucesso");
  return { ok: response.ok, data: result };
}

// Função para criar múltiplas disponibilidades
export async function createMultipleAvailabilities(availabilities: CreateAvailabilityPayload[]) {
  console.log("🔄 [useAvailabilities] Iniciando criação de múltiplas disponibilidades");
  console.log("📊 [useAvailabilities] Total de disponibilidades a criar:", availabilities.length);
  
  const results = [];
  const errors = [];

  for (let i = 0; i < availabilities.length; i++) {
    const availability = availabilities[i];
    console.log(`🔄 [useAvailabilities] Criando disponibilidade ${i + 1}/${availabilities.length} (${availability.weekday})`);
    
    try {
      const result = await createAvailability(availability);
      console.log(`✅ [useAvailabilities] Disponibilidade ${availability.weekday} criada com sucesso`);
      results.push(result);
    } catch (error) {
      console.error(`❌ [useAvailabilities] Erro ao criar disponibilidade para ${availability.weekday}:`, error);
      errors.push({ weekday: availability.weekday, error });
    }
  }

  console.log("📋 [useAvailabilities] Resumo da criação:");
  console.log(`   ✅ Sucessos: ${results.length}`);
  console.log(`   ❌ Erros: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log("📝 [useAvailabilities] Detalhes dos erros:", errors);
  }

  return { results, errors };
}

// Função para atualizar uma disponibilidade
export async function updateAvailability(id: number, data: Partial<CreateAvailabilityPayload>) {
  const endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/availabilities/${id}`
    : `http://${apiUrl}/availabilities/${id}`;

  const headers = getAuthHeaders();

  const response = await fetch(endpoint, {
    method: "PATCH",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Erro ao atualizar disponibilidade");
  }

  return { ok: response.ok, data: result };
}

// Função para deletar uma disponibilidade
export async function deleteAvailability(id: number) {
  const endpoint = apiUrl.startsWith("http")
    ? `${apiUrl}/availabilities/${id}`
    : `http://${apiUrl}/availabilities/${id}`;

  const headers = getAuthHeaders();

  const response = await fetch(endpoint, {
    method: "DELETE",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.message || "Erro ao deletar disponibilidade");
  }

  return { ok: response.ok };
}

// Função utilitária para converter "HH:mm" para minutos
export function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  const minutos = h * 60 + (m || 0);
  console.log(`⏰ [useAvailabilities] Convertendo ${hora} para ${minutos} minutos`);
  return minutos;
}

// Função utilitária para converter minutos para "HH:mm"
export function minutosParaHora(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

// Função para mapear disponibilidade do formulário para o formato do backend
export function mapDisponibilidadeParaBackend(disponibilidade: any, companyId: number): CreateAvailabilityPayload[] {
  console.log("🗺️ [useAvailabilities] Mapeando disponibilidades do formulário para backend");
  console.log("📋 [useAvailabilities] Dados do formulário:", disponibilidade);
  console.log("🆔 [useAvailabilities] Company ID:", companyId);
  
  const diasMap: Record<string, string> = {
    segunda: "MONDAY",
    terca: "TUESDAY",
    quarta: "WEDNESDAY",
    quinta: "THURSDAY",
    sexta: "FRIDAY",
    sabado: "SATURDAY",
    domingo: "SUNDAY",
  };

  const diasIndex: Record<string, number> = {
    segunda: 1,
    terca: 2,
    quarta: 3,
    quinta: 4,
    sexta: 5,
    sabado: 6,
    domingo: 0,
  };

  const availabilities: CreateAvailabilityPayload[] = [];

  Object.entries(disponibilidade || {}).forEach(([dia, val]: any) => {
    console.log(`📅 [useAvailabilities] Processando ${dia}:`, val);
    
    if (val) {
      const openingTime = val.is24Hours ? 0 : horaParaMinutos(val.inicio);
      const closingTime = val.is24Hours ? 1440 : horaParaMinutos(val.fim); // 1440 = 24 * 60

      const availability: CreateAvailabilityPayload = {
        openingTime,
        closingTime,
        weekday: diasMap[dia],
        weekdayIndex: diasIndex[dia],
        minDaysCancel: val.diasMinimosCancelamento || 1,
        intervalMinutes: val.intervaloMinutos || 30,
        configuration: {},
        companyId,
        isOpen: val.ativo,
        is24Hours: val.is24Hours,
      };

      console.log(`   ➡️ Mapeado para:`, availability);
      availabilities.push(availability);
    } else {
      console.log(`   ⚠️ ${dia} não tem dados válidos, pulando...`);
    }
  });

  console.log("📊 [useAvailabilities] Total de disponibilidades mapeadas:", availabilities.length);
  return availabilities;
}

// Função para mapear disponibilidade do formulário para o formato do backend (sem companyId)
export function mapDisponibilidadeParaEmpresa(disponibilidade: any): Omit<CreateAvailabilityPayload, 'companyId'>[] {
  console.log("🗺️ [useAvailabilities] Mapeando disponibilidades para criação com empresa");
  console.log("📋 [useAvailabilities] Dados do formulário:", disponibilidade);
  
  const diasMap: Record<string, string> = {
    segunda: "MONDAY",
    terca: "TUESDAY",
    quarta: "WEDNESDAY",
    quinta: "THURSDAY",
    sexta: "FRIDAY",
    sabado: "SATURDAY",
    domingo: "SUNDAY",
  };

  const diasIndex: Record<string, number> = {
    segunda: 1,
    terca: 2,
    quarta: 3,
    quinta: 4,
    sexta: 5,
    sabado: 6,
    domingo: 0,
  };

  const availabilities: Omit<CreateAvailabilityPayload, 'companyId'>[] = [];

  Object.entries(disponibilidade || {}).forEach(([dia, val]: any) => {
    console.log(`📅 [useAvailabilities] Processando ${dia}:`, val);
    
    if (val) {
      const openingTime = val.is24Hours ? 0 : horaParaMinutos(val.inicio);
      const closingTime = val.is24Hours ? 1440 : horaParaMinutos(val.fim); // 1440 = 24 * 60

      const availability: Omit<CreateAvailabilityPayload, 'companyId'> = {
        openingTime,
        closingTime,
        weekday: diasMap[dia],
        weekdayIndex: diasIndex[dia],
        minDaysCancel: val.diasMinimosCancelamento || 1,
        intervalMinutes: val.intervaloMinutos || 30,
        configuration: {},
        isOpen: val.ativo,
        is24Hours: val.is24Hours,
      };

      console.log(`   ➡️ Mapeado para:`, availability);
      availabilities.push(availability);
    } else {
      console.log(`   ⚠️ ${dia} não tem dados válidos, pulando...`);
    }
  });

  console.log("📊 [useAvailabilities] Total de disponibilidades mapeadas:", availabilities.length);
  return availabilities;
}

// Hook principal
export function useAvailabilities(params: Record<string, any> = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para buscar disponibilidades
  const availabilitiesQuery = useQuery({
    queryKey: ["availabilities", params],
    queryFn: () => fetchAvailabilities(params),
    enabled: Object.keys(params).length > 0, // Só executa se tiver parâmetros
  });

  // Mutation para criar disponibilidade
  const createMutation = useMutation({
    mutationFn: createAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availabilities"] });
    },
  });

  // Mutation para criar múltiplas disponibilidades
  const createMultipleMutation = useMutation({
    mutationFn: createMultipleAvailabilities,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["availabilities"] });
      if (result.errors.length === 0) {
        toast({
          title: "Sucesso",
          description: "Disponibilidades criadas com sucesso!",
        });
      } else {
        toast({
          title: "Atenção",
          description: `${result.results.length} disponibilidades criadas, ${result.errors.length} com erro.`,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar disponibilidades",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar disponibilidade
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateAvailabilityPayload> }) =>
      updateAvailability(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availabilities"] });
    },
  });

  // Mutation para deletar disponibilidade
  const deleteMutation = useMutation({
    mutationFn: deleteAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availabilities"] });
    },
  });

  return {
    // Dados
    availabilities: availabilitiesQuery.data || [],
    isLoadingAvailabilities: availabilitiesQuery.isLoading,
    isLoading,

    // Funções de criação
    createAvailability: createMutation.mutateAsync,
    createMultipleAvailabilities: createMultipleMutation.mutateAsync,
    isCreating: createMutation.isPending || createMultipleMutation.isPending,

    // Funções de atualização
    updateAvailability: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    // Funções de exclusão
    deleteAvailability: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,

    // Funções utilitárias
    mapDisponibilidadeParaBackend,
    mapDisponibilidadeParaEmpresa,
    horaParaMinutos,
    minutosParaHora,

    // Refresh
    refetch: availabilitiesQuery.refetch,
  };
}
