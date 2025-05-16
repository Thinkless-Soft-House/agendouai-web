import React, { useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Empresa } from "@/pages/Empresas";
import { Particao } from "@/pages/Particoes";
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
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface AgendamentoSidebarProps {
  selectedEmpresaId: string;
  setSelectedEmpresaId: (id: string) => void;
  selectedSalaId: string;
  setSelectedSalaId: (id: string) => void;
  filterText: string;
  setFilterText: (text: string) => void;
  empresas: Empresa[];
  particoes: Particao[];
  isFilterLoading: boolean;
  isLoadingEmpresas: boolean;
  isLoadingParticoes: boolean;
  agendamentos: Agendamento[]; // Changed from actionsNeeded to agendamentos
  handleEditAgendamento: (agendamento: Agendamento) => void;
  onConfirmAgendamento: (agendamento: Agendamento) => void;
  onCancelAgendamento: (agendamento: Agendamento) => void;
  isApproving: number | null; // Add loading state for approve action
  isRejecting: number | null; // Add loading state for reject action
}

export function AgendamentoSidebar({
  selectedEmpresaId,
  setSelectedEmpresaId,
  selectedSalaId,
  setSelectedSalaId,
  filterText,
  setFilterText,
  empresas = [],
  particoes = [],
  isFilterLoading,
  isLoadingEmpresas,
  isLoadingParticoes,
  agendamentos = [], // Changed from actionsNeeded to agendamentos
  handleEditAgendamento,
  onConfirmAgendamento,
  onCancelAgendamento,
  isApproving,
  isRejecting,
}: AgendamentoSidebarProps) {
  // Efeito para selecionar automaticamente a única empresa disponível
  useEffect(() => {
    if (empresas?.length === 1) {
      setSelectedEmpresaId(String(empresas[0].id));
    }
  }, [empresas, setSelectedEmpresaId]); 

  // Filtra os agendamentos com status === "1"
  const pendingAgendamentos = React.useMemo(() => {
    return agendamentos.filter(agendamento => agendamento.status === "1");
  }, [agendamentos]);

  // Conta quantos agendamentos estão pendentes
  const pendingCount = pendingAgendamentos.length;

  return (
    <div className="lg:col-span-3 space-y-6 transition-all duration-300">
      {/* Filtros */}
      <Card className="transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {(isFilterLoading || isLoadingEmpresas || isLoadingParticoes) && (
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
                disabled={empresas?.length === 1}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {(empresas || []).map((empresa) => (
                    <SelectItem key={empresa.id} value={String(empresa.id)}>
                      {empresa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Partição
              {isLoadingParticoes && (
                <Loader2 className="h-3.5 w-3.5 animate-spin ml-1 text-muted-foreground" />
              )}
            </label>
            {isLoadingParticoes && selectedEmpresaId ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <Select
                value={selectedSalaId}
                onValueChange={setSelectedSalaId}
                disabled={
                  !selectedEmpresaId ||
                  (particoes || [])?.length === 0 ||
                  isLoadingParticoes
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedEmpresaId
                        ? "Selecione uma empresa primeiro"
                        : isLoadingParticoes
                        ? "Carregando partições..."
                        : (particoes || [])?.length === 0
                        ? "Nenhuma partição disponível"
                        : "Selecione uma partição"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(particoes || []).map((particao) => (
                    <SelectItem key={particao.id} value={String(particao.id)}>
                      {particao.nome}
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
          pendingCount > 0 ? "border-amber-200 bg-amber-50/50" : ""
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
            ) : pendingCount === 0 ? (
              "Não há ações pendentes"
            ) : (
              `${pendingCount} ações requerem sua atenção`
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
          pendingCount > 0 && (
            <CardContent className="max-h-[300px] overflow-y-auto space-y-2">
              {pendingAgendamentos.map((agendamento) => (
                <div
                  key={agendamento.id}
                  className="p-2 rounded-md border-l-2 border-amber-400 bg-amber-50 text-sm transition-colors"
                >
                  <div className="font-medium">
                    {agendamento.pessoa?.nome || agendamento.clienteNome || "Cliente não informado"}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <CalendarIcon className="h-3 w-3" />
                    {format(new Date(agendamento.data || agendamento.date), "dd/MM/yyyy")}
                    <span className="mx-1">•</span>
                    <Clock className="h-3 w-3" />
                    {agendamento.horarioInicio || agendamento.horaInicio}
                  </div>
                  {/* Sala info */}
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Sala: {agendamento.salaNome || agendamento.particaoNome || "Não informada"}
                  </div>
                  {/* Botões de ação */}
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                      onClick={() => onConfirmAgendamento(agendamento)}
                      disabled={isApproving === Number(agendamento.id) || isRejecting === Number(agendamento.id)}
                    >
                      {isApproving === Number(agendamento.id) ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-1 h-4 w-4" />
                      )}
                      Aprovar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => onCancelAgendamento(agendamento)}
                      disabled={isApproving === Number(agendamento.id) || isRejecting === Number(agendamento.id)}
                    >
                      {isRejecting === Number(agendamento.id) ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <X className="mr-1 h-4 w-4" />
                      )}
                      Rejeitar
                    </Button>
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