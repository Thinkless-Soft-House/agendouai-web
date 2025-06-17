import React, { useEffect, useState } from "react"; // Adicione o useEffect
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
// import { Empresa } from "@/pages/Empresas";
import { Espaco } from "@/pages/Particoes";
import { Agendamento, ActionTypeInfo } from "@/types/agendamento";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Filter,
  Building,
  User,
  AlertCircle,
  CalendarIcon,
  Clock,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Company } from "@/hooks/useEmpresas";
import { updateAgendamento } from "@/hooks/useAgendamento";
import { useToast } from "@/hooks/use-toast";

interface AgendamentoSidebarProps {
  selectedEmpresaId: string;
  setSelectedEmpresaId: (id: string) => void;
  selectedSalaId: string;
  setSelectedSalaId: (id: string) => void;
  filterText: string;
  setFilterText: (text: string) => void;
  empresas: Company[];
  espacos: Espaco[];
  isFilterLoading: boolean;
  isLoadingEmpresas: boolean;
  isLoadingEspacos: boolean;
  actionsNeeded: Agendamento[];
  handleEditAgendamento: (agendamento: Agendamento) => void;
  onRefresh?: () => void; // Função para atualizar a lista após mudanças
}

export function AgendamentoSidebar({
  selectedEmpresaId,
  setSelectedEmpresaId,
  selectedSalaId,
  setSelectedSalaId,
  filterText,
  setFilterText,
  empresas = [],
  espacos = [],
  isFilterLoading,
  isLoadingEmpresas,
  isLoadingEspacos,
  actionsNeeded = [],
  handleEditAgendamento,
  onRefresh,
}: AgendamentoSidebarProps) {
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const { toast } = useToast();

  // Efeito para selecionar automaticamente a única empresa disponível
  useEffect(() => {
    if (empresas?.length === 1) { // Add optional chaining
      setSelectedEmpresaId(String(empresas[0].id)); // Convert to string
    }
  }, [empresas, setSelectedEmpresaId]); 

  // Função para aceitar um agendamento
  const handleAcceptAgendamento = async (agendamento: Agendamento, e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o click de edição seja ativado
    setLoadingActionId(agendamento.id);
    
    try {
      const result = await updateAgendamento(agendamento.id, {
        ...agendamento,
        status: "confirmado"
      });
      
      if (result.ok) {
        toast({
          title: "Agendamento aceito",
          description: `O agendamento de ${agendamento.clientName} foi confirmado com sucesso.`,
        });
        
        // Atualiza a lista
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error("Erro ao aceitar agendamento");
      }
    } catch (error) {
      console.error("Erro ao aceitar agendamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aceitar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingActionId(null);
    }
  };

  // Função para rejeitar um agendamento
  const handleRejectAgendamento = async (agendamento: Agendamento, e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o click de edição seja ativado
    setLoadingActionId(agendamento.id);
    
    try {
      const result = await updateAgendamento(agendamento.id, {
        ...agendamento,
        status: "cancelado"
      });
      
      if (result.ok) {
        toast({
          title: "Agendamento rejeitado",
          description: `O agendamento de ${agendamento.clientName} foi cancelado.`,
        });
        
        // Atualiza a lista
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error("Erro ao rejeitar agendamento");
      }
    } catch (error) {
      console.error("Erro ao rejeitar agendamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingActionId(null);
    }
  }; 

  return (
    <div className="lg:col-span-3 space-y-6 transition-all duration-300">
      {/* Filtros */}
      <Card className="transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {(isFilterLoading || isLoadingEmpresas || isLoadingEspacos) && (
              <Loader2 className="h-3.5 w-3.5 animate-spin ml-1 text-muted-foreground" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Empresa
            </label>
            {isLoadingEmpresas ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <Select
                value={selectedEmpresaId}
                onValueChange={(value) => setSelectedEmpresaId(value)}
                disabled={empresas?.length === 1} // Add optional chaining
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {(empresas || []).map((empresa) => ( // Add safeguard
                    <SelectItem key={empresa.id} value={String(empresa.id)}>
                      {empresa.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Espaço
              {isLoadingEspacos && (
                <Loader2 className="h-3.5 w-3.5 animate-spin ml-1 text-muted-foreground" />
              )}
            </label>
            {isLoadingEspacos && selectedEmpresaId ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <Select
                value={selectedSalaId}
                onValueChange={setSelectedSalaId}
                disabled={
                  !selectedEmpresaId ||
                  (espacos || []).length === 0 ||
                  isLoadingEspacos
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedEmpresaId
                        ? "Selecione uma empresa primeiro"
                        : isLoadingEspacos
                        ? "Carregando espaços..."
                        : (espacos || []).length === 0
                        ? "Nenhum espaço disponível"
                        : "Selecione um espaço"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(espacos || []).map((espaco) => (
                    <SelectItem key={espaco.id} value={String(espaco.id)}>
                      {espaco.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ações necessárias */}
      <Card
        className={cn(
          "transition-all duration-300",
          actionsNeeded?.length > 0 ? "border-amber-200 bg-amber-50/50" : "" // Add optional chaining
        )}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Ações Necessárias
            {isFilterLoading && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500 ml-1" />
            )}
          </CardTitle>
          <CardDescription>
            {isFilterLoading ? (
              <span className="inline-block h-4 w-48 bg-muted rounded animate-pulse" />
            ) : (actionsNeeded || [])?.length === 0 ? (
              "Não há ações pendentes"
            ) : (
              `${actionsNeeded?.length} ações requerem sua atenção` // Add optional chaining
            )}
          </CardDescription>
        </CardHeader>
        {isFilterLoading ? (
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-md" />
            ))}
          </CardContent>
        ) : (
          (actionsNeeded || [])?.length > 0 && ( // Add safeguard
            <CardContent className="max-h-[300px] overflow-y-auto space-y-2">
              {(actionsNeeded || []).map((agendamento) => ( // Add safeguard
                <div
                  key={agendamento.id}
                  className="p-3 rounded-md border-l-2 border-amber-400 bg-amber-50 text-sm transition-colors"
                >
                  <div 
                    className="cursor-pointer hover:bg-amber-100 -m-3 p-3 mb-3 rounded-md transition-colors"
                    onClick={() => handleEditAgendamento(agendamento)}
                  >
                    <div className="font-medium">{agendamento.clientName}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <CalendarIcon className="h-3 w-3" />
                      {format(new Date(agendamento.data), "dd/MM/yyyy")}
                      <span className="mx-1">•</span>
                      <Clock className="h-3 w-3" />
                      {agendamento.startTime}
                    </div>
                    {agendamento.actionType && (
                      <Badge
                        className={cn(
                          "mt-2 text-[10px] transition-all",
                          ActionTypeInfo[agendamento.actionType].bgColor,
                          ActionTypeInfo[agendamento.actionType].textColor
                        )}
                        variant="outline"
                      >
                        {ActionTypeInfo[agendamento.actionType].label}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Botões de ação */}
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
                      onClick={(e) => handleAcceptAgendamento(agendamento, e)}
                      disabled={loadingActionId === agendamento.id}
                    >
                      {loadingActionId === agendamento.id ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Check className="h-3 w-3 mr-1" />
                      )}
                      Aceitar
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
                      onClick={(e) => handleRejectAgendamento(agendamento, e)}
                      disabled={loadingActionId === agendamento.id}
                    >
                      {loadingActionId === agendamento.id ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <X className="h-3 w-3 mr-1" />
                      )}
                      Rejeitar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          )
        )}
      </Card>

      {/* Legenda */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Legenda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Confirmado</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Agendamento confirmado</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Pendente</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Aguardando confirmação</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-sm">Cancelado</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Agendamento cancelado</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <AlertCircle className="h-3 w-3 text-amber-500" />
                <span className="text-sm">Requer ação</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Necessita de atenção</p>
            </TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>
    </div>
  );
}