
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ptBR } from "date-fns/locale";
import { AgendamentoDialog } from "@/components/agendamento/AgendamentoDialog";
import { AgendamentoDeleteDialog } from "@/components/agendamento/AgendamentoDeleteDialog";
import { format, isToday, isSameDay } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar as CalendarIcon,
  Clock,
  ClipboardList
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Empresa } from "./Empresas";
import { Particao } from "./Particoes";
import { useToast } from "@/hooks/use-toast";

// Tipo para representar um agendamento
export type Agendamento = {
  id: string;
  empresaId: string;
  empresaNome: string;
  particaoId: string;
  particaoNome: string;
  clienteNome: string;
  clienteEmail: string;
  clienteTelefone: string;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  status: "confirmado" | "pendente" | "cancelado";
  observacoes?: string;
};

const Agendamento = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>("");
  const [selectedParticaoId, setSelectedParticaoId] = useState<string>("");
  const [agendamentoToCreate, setAgendamentoToCreate] = useState<{
    data: Date;
    horario: string;
  } | null>(null);
  const [agendamentoToEdit, setAgendamentoToEdit] = useState<Agendamento | null>(null);
  const [agendamentoToDelete, setAgendamentoToDelete] = useState<Agendamento | null>(null);
  const { toast } = useToast();

  // Simulação de dados de empresas
  const fetchEmpresas = async (): Promise<Empresa[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Array.from({ length: 10 }, (_, i) => ({
      id: `empresa-${i + 1}`,
      nome: `Empresa ${i + 1}`,
      cnpj: `${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
      endereco: `Rua ${i + 1}, ${Math.floor(Math.random() * 1000)}, Cidade ${i % 5}`,
      telefone: `(${10 + i % 90}) ${9}${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      email: `contato@empresa${i + 1}.com.br`,
      status: i % 4 === 0 ? "inactive" : "active",
      criadoEm: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  };

  // Simulação de dados de partições
  const fetchParticoes = async (): Promise<Particao[]> => {
    if (!selectedEmpresaId) return [];
    
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return Array.from({ length: 5 }, (_, i) => {
      const tipoOptions = ["sala", "funcionario", "equipamento"] as const;
      const tipo = tipoOptions[i % 3];
      
      return {
        id: `particao-${selectedEmpresaId}-${i + 1}`,
        nome: tipo === "sala" 
          ? `Sala ${i + 1}` 
          : tipo === "funcionario" 
            ? `Funcionário ${i + 1}` 
            : `Equipamento ${i + 1}`,
        tipo,
        empresaId: selectedEmpresaId,
        empresaNome: `Empresa ${selectedEmpresaId.split('-')[1]}`,
        descricao: `Descrição da ${tipo === "sala" ? "sala" : tipo === "funcionario" ? "do funcionário" : "do equipamento"} ${i + 1}`,
        capacidade: tipo === "sala" ? Math.floor(Math.random() * 20) + 1 : undefined,
        disponivel: i % 5 !== 0,
        criadoEm: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      };
    });
  };

  // Simulação de dados de agendamentos
  const fetchAgendamentos = async (): Promise<Agendamento[]> => {
    if (!selectedEmpresaId || !selectedParticaoId) return [];
    
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();
    
    // Gerar agendamentos para o mês selecionado
    return Array.from({ length: 15 }, (_, i) => {
      const day = Math.floor(Math.random() * 28) + 1;
      const hora = Math.floor(Math.random() * 10) + 8; // Entre 8h e 18h
      const agendamentoDate = new Date(currentYear, currentMonth, day);
      
      const horarioInicio = `${hora}:00`;
      const horarioFim = `${hora + 1}:00`;
      
      const statusOptions = ["confirmado", "pendente", "cancelado"] as const;
      const status = statusOptions[Math.floor(Math.random() * 3)];
      
      return {
        id: `agendamento-${i}`,
        empresaId: selectedEmpresaId,
        empresaNome: `Empresa ${selectedEmpresaId.split('-')[1]}`,
        particaoId: selectedParticaoId,
        particaoNome: `Partição ${selectedParticaoId.split('-')[2]}`,
        clienteNome: `Cliente ${i + 1}`,
        clienteEmail: `cliente${i + 1}@example.com`,
        clienteTelefone: `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        data: agendamentoDate.toISOString(),
        horarioInicio,
        horarioFim,
        status,
        observacoes: i % 3 === 0 ? `Observações do agendamento ${i + 1}` : undefined,
      };
    });
  };

  const { data: empresas = [], isLoading: isLoadingEmpresas } = useQuery({
    queryKey: ["empresas-agendamento"],
    queryFn: fetchEmpresas,
  });

  const { data: particoes = [], isLoading: isLoadingParticoes } = useQuery({
    queryKey: ["particoes-agendamento", selectedEmpresaId],
    queryFn: fetchParticoes,
    enabled: !!selectedEmpresaId,
  });

  const { data: agendamentos = [], isLoading: isLoadingAgendamentos, refetch } = useQuery({
    queryKey: ["agendamentos", selectedEmpresaId, selectedParticaoId, date.getMonth(), date.getFullYear()],
    queryFn: fetchAgendamentos,
    enabled: !!selectedEmpresaId && !!selectedParticaoId,
  });

  // Função para renderizar os agendamentos do dia selecionado
  const getDayAgendamentos = (day: Date) => {
    return agendamentos.filter(agendamento => 
      isSameDay(new Date(agendamento.data), day)
    );
  };

  // Função para renderizar indicadores no calendário
  const renderCalendarDayContent = (day: Date) => {
    const dayAgendamentos = getDayAgendamentos(day);
    
    if (dayAgendamentos.length === 0) return null;
    
    const statusCounts = {
      confirmado: 0,
      pendente: 0,
      cancelado: 0
    };
    
    dayAgendamentos.forEach(agendamento => {
      statusCounts[agendamento.status]++;
    });
    
    return (
      <div className="flex flex-col items-center mt-1 gap-0.5">
        <div className="flex -space-x-1">
          {statusCounts.confirmado > 0 && (
            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
          )}
          {statusCounts.pendente > 0 && (
            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
          )}
          {statusCounts.cancelado > 0 && (
            <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
          )}
        </div>
      </div>
    );
  };
  
  const handlePreviousMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  const handleCreateAgendamento = (data: Date, horario: string) => {
    setAgendamentoToCreate({ data, horario });
  };

  const handleEditAgendamento = (agendamento: Agendamento) => {
    setAgendamentoToEdit(agendamento);
  };

  const handleDeleteAgendamento = (agendamento: Agendamento) => {
    setAgendamentoToDelete(agendamento);
  };

  const handleAgendamentoSaved = () => {
    refetch();
    toast({
      title: "Sucesso",
      description: agendamentoToEdit 
        ? "Agendamento atualizado com sucesso." 
        : "Agendamento criado com sucesso.",
    });
    setAgendamentoToEdit(null);
    setAgendamentoToCreate(null);
  };

  const handleAgendamentoDeleted = () => {
    refetch();
    toast({
      title: "Sucesso",
      description: "Agendamento excluído com sucesso.",
      variant: "destructive",
    });
    setAgendamentoToDelete(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Agendamento</h1>
          <Button 
            onClick={() => handleCreateAgendamento(new Date(), "09:00")}
            disabled={!selectedEmpresaId || !selectedParticaoId}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>
                Selecione a empresa e a partição para visualizar os agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Empresa</label>
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Partição</label>
                <Select 
                  value={selectedParticaoId} 
                  onValueChange={setSelectedParticaoId}
                  disabled={!selectedEmpresaId || particoes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !selectedEmpresaId 
                        ? "Selecione uma empresa primeiro" 
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
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Legenda</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Confirmado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Pendente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Cancelado</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Calendário</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousMonth}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="w-[110px] text-center">
                    {format(date, "MMMM yyyy", { locale: ptBR })}
                  </div>
                  <Button variant="outline" size="icon" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                className="rounded-md border"
                locale={ptBR}
                disabled={!selectedEmpresaId || !selectedParticaoId}
                components={{
                  DayContent: ({ day, ...props }) => (
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`h-8 w-8 ${
                          isToday(day) 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-accent"
                        } rounded-full flex items-center justify-center`}
                        {...props}
                      >
                        {day.getDate()}
                      </div>
                      {renderCalendarDayContent(day)}
                    </div>
                  ),
                }}
              />
            </CardContent>
          </Card>
        </div>

        {selectedEmpresaId && selectedParticaoId && (
          <Card>
            <CardHeader>
              <CardTitle>
                Agendamentos do dia {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
              <CardDescription>
                {getDayAgendamentos(date).length === 0
                  ? "Nenhum agendamento para este dia."
                  : `${getDayAgendamentos(date).length} agendamento(s) para este dia.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAgendamentos ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-pulse flex flex-col space-y-4 w-full">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded-md w-full"></div>
                    ))}
                  </div>
                </div>
              ) : getDayAgendamentos(date).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground" />
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">Nenhum agendamento</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Não há agendamentos para este dia. Clique no botão abaixo para criar um novo agendamento.
                    </p>
                  </div>
                  <Button onClick={() => handleCreateAgendamento(date, "09:00")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Agendamento
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {getDayAgendamentos(date)
                    .sort((a, b) => {
                      return a.horarioInicio.localeCompare(b.horarioInicio);
                    })
                    .map((agendamento) => (
                      <div
                        key={agendamento.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="rounded-full p-2 bg-primary/10">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{agendamento.clienteNome}</div>
                            <div className="text-sm text-muted-foreground">
                              {agendamento.horarioInicio} - {agendamento.horarioFim}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={
                                agendamento.status === "confirmado" 
                                  ? "success" 
                                  : agendamento.status === "pendente" 
                                    ? "outline" 
                                    : "destructive"
                              }>
                                {agendamento.status === "confirmado" 
                                  ? "Confirmado" 
                                  : agendamento.status === "pendente" 
                                    ? "Pendente" 
                                    : "Cancelado"}
                              </Badge>
                              {agendamento.observacoes && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{agendamento.observacoes}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAgendamento(agendamento)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteAgendamento(agendamento)}
                          >
                            Excluir
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <AgendamentoDialog
          open={(agendamentoToCreate !== null) || (agendamentoToEdit !== null)}
          onOpenChange={(open) => {
            if (!open) {
              setAgendamentoToEdit(null);
              setAgendamentoToCreate(null);
            }
          }}
          agendamento={agendamentoToEdit}
          createData={agendamentoToCreate}
          empresaId={selectedEmpresaId}
          particaoId={selectedParticaoId}
          empresas={empresas}
          particoes={particoes}
          onSave={handleAgendamentoSaved}
        />

        <AgendamentoDeleteDialog
          open={agendamentoToDelete !== null}
          onOpenChange={(open) => {
            if (!open) setAgendamentoToDelete(null);
          }}
          agendamento={agendamentoToDelete}
          onDelete={handleAgendamentoDeleted}
        />
      </div>
    </DashboardLayout>
  );
};

export default Agendamento;
