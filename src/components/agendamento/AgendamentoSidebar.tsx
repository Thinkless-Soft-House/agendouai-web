
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
  Search,
  AlertCircle,
  CalendarIcon,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AgendamentoSidebarProps {
  selectedEmpresaId: string;
  setSelectedEmpresaId: (id: string) => void;
  selectedParticaoId: string;
  setSelectedParticaoId: (id: string) => void;
  filterText: string;
  setFilterText: (text: string) => void;
  empresas: Empresa[];
  particoes: Particao[];
  isFilterLoading: boolean;
  isLoadingEmpresas: boolean;
  isLoadingParticoes: boolean;
  actionsNeeded: Agendamento[];
  handleEditAgendamento: (agendamento: Agendamento) => void;
}

export function AgendamentoSidebar({
  selectedEmpresaId,
  setSelectedEmpresaId,
  selectedParticaoId,
  setSelectedParticaoId,
  filterText,
  setFilterText,
  empresas,
  particoes,
  isFilterLoading,
  isLoadingEmpresas,
  isLoadingParticoes,
  actionsNeeded,
  handleEditAgendamento
}: AgendamentoSidebarProps) {
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
                onValueChange={(value) => {
                  setSelectedEmpresaId(value);
                  setSelectedParticaoId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
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
                value={selectedParticaoId} 
                onValueChange={setSelectedParticaoId}
                disabled={!selectedEmpresaId || particoes.length === 0 || isLoadingParticoes}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedEmpresaId 
                      ? "Selecione uma empresa primeiro" 
                      : isLoadingParticoes
                        ? "Carregando partições..."
                        : particoes.length === 0 
                          ? "Nenhuma partição disponível" 
                          : "Selecione uma partição"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {particoes.map((particao) => (
                    <SelectItem key={particao.id} value={particao.id}>
                      {particao.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Busca
            </label>
            <Input
              placeholder="Buscar agendamentos..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="transition-all duration-300"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ações necessárias */}
      <Card className={cn(
        "transition-all duration-300",
        actionsNeeded.length > 0 ? "border-amber-200 bg-amber-50/50" : ""
      )}>
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
              <Skeleton className="h-4 w-48" />
            ) : (
              actionsNeeded.length === 0 
                ? "Não há ações pendentes" 
                : `${actionsNeeded.length} ações requerem sua atenção`
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
          actionsNeeded.length > 0 && (
            <CardContent className="max-h-[300px] overflow-y-auto space-y-2">
              {actionsNeeded.map(agendamento => (
                <div
                  key={agendamento.id}
                  className="p-2 rounded-md border-l-2 border-amber-400 bg-amber-50 text-sm cursor-pointer hover:bg-amber-100 transition-colors"
                  onClick={() => handleEditAgendamento(agendamento)}
                >
                  <div className="font-medium">{agendamento.clienteNome}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <CalendarIcon className="h-3 w-3" />
                    {format(new Date(agendamento.data), "dd/MM/yyyy")}
                    <span className="mx-1">•</span>
                    <Clock className="h-3 w-3" />
                    {agendamento.horarioInicio}
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
