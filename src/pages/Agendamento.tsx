import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ptBR } from "date-fns/locale";
import { AgendamentoDialog } from "@/components/agendamento/AgendamentoDialog";
import { AgendamentoDeleteDialog } from "@/components/agendamento/AgendamentoDeleteDialog";
import { format, isToday, isSameDay, parse, setMonth, setYear } from "date-fns";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar as CalendarIcon,
  Clock,
  ClipboardList,
  Filter,
  Building,
  User,
  CalendarRange,
  AlertCircle,
  CheckCircle,
  LoaderCircle,
  CalendarDays
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Empresa } from "./Empresas";
import { Particao } from "./Particoes";
import { useToast } from "@/hooks/use-toast";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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
  requiresAction?: boolean;
  actionType?: "approval" | "response" | "update" | "review";
};

const Agendamento = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [monthYearDate, setMonthYearDate] = useState<Date>(new Date());
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>("");
  const [selectedParticaoId, setSelectedParticaoId] = useState<string>("");
  const [isMonthYearPickerOpen, setIsMonthYearPickerOpen] = useState(false);
  const [agendamentoToCreate, setAgendamentoToCreate] = useState<{
    data: Date;
    horario: string;
  } | null>(null);
  const [agendamentoToEdit, setAgendamentoToEdit] = useState<Agendamento | null>(null);
  const [agendamentoToDelete, setAgendamentoToDelete] = useState<Agendamento | null>(null);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMonthYearDate(new Date(date.getFullYear(), date.getMonth(), 1));
  }, [date]);

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

  const fetchParticoes = async (): Promise<Particao[]> => {
    if (!selectedEmpresaId) return [];
    
    setIsFilterLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
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
    } finally {
      setIsFilterLoading(false);
    }
  };

  const fetchAgendamentos = async (): Promise<Agendamento[]> => {
    if (!selectedEmpresaId || !selectedParticaoId) return [];
    
    setIsFilterLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const currentMonth = date.getMonth();
      const currentYear = date.getFullYear();
      
      return Array.from({ length: 15 }, (_, i) => {
        const day = Math.floor(Math.random() * 28) + 1;
        const hora = Math.floor(Math.random() * 10) + 8; // Entre 8h e 18h
        const agendamentoDate = new Date(currentYear, currentMonth, day);
        
        const horarioInicio = `${hora}:00`;
        const horarioFim = `${hora + 1}:00`;
        
        const statusOptions = ["confirmado", "pendente", "cancelado"] as const;
        const status = statusOptions[Math.floor(Math.random() * 3)];
        
        const requiresAction = i % 4 === 0;
        const actionTypeOptions = ["approval", "response", "update", "review"] as const;
        const actionType = actionTypeOptions[i % 4];
        
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
          requiresAction,
          actionType: requiresAction ? actionType : undefined
        };
      });
    } finally {
      setIsFilterLoading(false);
    }
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

  const upcomingAppointments = agendamentos
    .filter(a => new Date(a.data) >= new Date())
    .slice(0, 5)
    .map(a => ({
      id: a.id,
      title: `Agendamento com ${a.clienteNome}`,
      client: a.clienteNome,
      time: `${a.horarioInicio} - ${a.horarioFim}`,
      date: format(new Date(a.data), "dd/MM/yyyy"),
      status: a.status as any,
      empresa: a.empresaNome,
      particao: a.particaoNome,
      requiresAction: a.requiresAction,
      actionType: a.actionType
    }));

  const getDayAgendamentos = (day: Date) => {
    return agendamentos.filter(agendamento => 
      isSameDay(new Date(agendamento.data), day)
    );
  };

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

  const handleMonthChange = (month: number) => {
    const newDate = new Date(monthYearDate);
    newDate.setMonth(month);
    setMonthYearDate(newDate);
    setDate(new Date(newDate.getFullYear(), newDate.getMonth(), date.getDate()));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const yearValue = parseInt(event.target.value);
    if (!isNaN(yearValue) && yearValue >= 1900 && yearValue <= 2100) {
      const newDate = new Date(monthYearDate);
      newDate.setFullYear(yearValue);
      setMonthYearDate(newDate);
      setDate(new Date(newDate.getFullYear(), newDate.getMonth(), date.getDate()));
    }
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    setDate(newDate);
    setMonthYearDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    setDate(newDate);
    setMonthYearDate(newDate);
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

  const monthNames = Array.from({ length: 12 }, (_, i) => 
    format(new Date(2021, i, 1), "MMMM", { locale: ptBR })
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agendamento</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus agendamentos e visualize sua agenda
            </p>
          </div>
          <Button 
            onClick={() => handleCreateAgendamento(new Date(), "09:00")}
            disabled={!selectedEmpresaId || !selectedParticaoId}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        <Tabs defaultValue="calendario" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="calendario">
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="lista">
              <CalendarRange className="mr-2 h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="acoes">
              <AlertCircle className="mr-2 h-4 w-4" />
              Ações Necessárias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendario" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <Card className="md:col-span-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filtros
                    </CardTitle>
                    {isFilterLoading && (
                      <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <CardDescription>
                    Selecione a empresa e a partição para visualizar os agendamentos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Empresa
                    </label>
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
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Partição
                    </label>
                    <Select 
                      value={selectedParticaoId} 
                      onValueChange={setSelectedParticaoId}
                      disabled={!selectedEmpresaId || particoes.length === 0 || isFilterLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedEmpresaId 
                            ? "Selecione uma empresa primeiro" 
                            : isFilterLoading
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
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Legenda</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
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
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                        <span className="text-sm">Requer ação</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedEmpresaId && selectedParticaoId && (
                    <div className="pt-2">
                      <Button 
                        onClick={() => handleCreateAgendamento(date, "09:00")}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Agendamento
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-8">
                <CardHeader className="pb-2">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <CardTitle>Calendário</CardTitle>
                      <div className="flex items-center gap-2">
                        <Popover 
                          open={isMonthYearPickerOpen} 
                          onOpenChange={setIsMonthYearPickerOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                              {format(monthYearDate, "MMMM yyyy", { locale: ptBR })}
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0" align="center">
                            <div className="p-4 space-y-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Mês</label>
                                <Select 
                                  value={monthYearDate.getMonth().toString()} 
                                  onValueChange={(value) => handleMonthChange(parseInt(value))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o mês" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {monthNames.map((month, index) => (
                                      <SelectItem key={index} value={index.toString()}>
                                        {month}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Ano</label>
                                <Input 
                                  type="number" 
                                  min="1900" 
                                  max="2100"
                                  value={monthYearDate.getFullYear().toString()}
                                  onChange={handleYearChange}
                                />
                              </div>
                              <div className="flex justify-end">
                                <Button 
                                  size="sm" 
                                  onClick={() => setIsMonthYearPickerOpen(false)}
                                >
                                  Aplicar
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handlePreviousMonth}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={handleNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
                      DayContent: (props) => {
                        const currentDate = props.date;
                        
                        return (
                          <div className="relative flex flex-col items-center">
                            <div
                              className={`h-8 w-8 ${
                                isToday(currentDate) 
                                  ? "bg-primary text-primary-foreground" 
                                  : "hover:bg-accent"
                              } rounded-full flex items-center justify-center`}
                              {...props}
                            >
                              {currentDate.getDate()}
                            </div>
                            {renderCalendarDayContent(currentDate)}
                          </div>
                        );
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {selectedEmpresaId && selectedParticaoId && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        Agendamentos do dia {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </CardTitle>
                      <CardDescription>
                        {getDayAgendamentos(date).length === 0
                          ? "Nenhum agendamento para este dia."
                          : `${getDayAgendamentos(date).length} agendamento(s) para este dia.`}
                      </CardDescription>
                    </div>
                    {isFilterLoading && (
                      <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingAgendamentos || isFilterLoading ? (
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
                            className={cn(
                              "flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors",
                              agendamento.requiresAction && "border-l-4 border-amber-400"
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <div className={cn(
                                "rounded-full p-2",
                                agendamento.status === "confirmado" 
                                  ? "bg-green-500/10" 
                                  : agendamento.status === "pendente"
                                    ? "bg-yellow-500/10"
                                    : "bg-red-500/10"
                              )}>
                                <Clock className={cn(
                                  "h-5 w-5",
                                  agendamento.status === "confirmado"
                                    ? "text-green-500"
                                    : agendamento.status === "pendente"
                                      ? "text-yellow-500"
                                      : "text-red-500"
                                )} />
                              </div>
                              <div>
                                <div className="font-medium flex items-center gap-1">
                                  {agendamento.requiresAction && (
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                  )}
                                  {agendamento.clienteNome}
                                </div>
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
          </TabsContent>

          <TabsContent value="lista" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Lista de Agendamentos</CardTitle>
                  {isFilterLoading && (
                    <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                </div>
                <CardDescription>
                  Visualize todos os agendamentos em formato de lista
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Empresa
                      </label>
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
                      <label className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Partição
                      </label>
                      <Select 
                        value={selectedParticaoId} 
                        onValueChange={setSelectedParticaoId}
                        disabled={!selectedEmpresaId || particoes.length === 0 || isFilterLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !selectedEmpresaId 
                              ? "Selecione uma empresa primeiro" 
                              : isFilterLoading
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
                    </div>
                  </div>

                  <div className="md:col-span-8">
                    {!selectedEmpresaId || !selectedParticaoId ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center h-64">
                        <Filter className="h-12 w-12 text-muted-foreground" />
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold">Selecione os filtros</h3>
                          <p className="text-sm text-muted-foreground max-w-md">
                            Selecione uma empresa e uma partição para visualizar os agendamentos.
                          </p>
                        </div>
                      </div>
                    ) : isLoadingAgendamentos || isFilterLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="animate-pulse flex flex-col space-y-4 w-full">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded-md w-full"></div>
                          ))}
                        </div>
                      </div>
                    ) : agendamentos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center h-64">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground" />
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold">Nenhum agendamento</h3>
                          <p className="text-sm text-muted-foreground max-w-md">
                            Não há agendamentos para os filtros selecionados.
                          </p>
                        </div>
                        <Button onClick={() => handleCreateAgendamento(date, "09:00")}>
                          <Plus className="mr-2 h-4 w-4" />
                          Novo Agendamento
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {agendamentos
                          .sort((a, b) => {
                            // Sort by date and then by time
                            const dateA = new Date(a.data);
                            const dateB = new Date(b.data);
                            
                            if (dateA.getTime() !== dateB.getTime()) {
                              return dateA.getTime() - dateB.getTime();
                            }
                            
                            return a.horarioInicio.localeCompare(b.horarioInicio);
                          })
                          .map((agendamento) => (
                            <div
                              key={agendamento.id}
                              className={cn(
                                "flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors",
                                agendamento.requiresAction && "border-l-4 border-amber-400"
                              )}
                            >
                              <div className="flex items-start gap-4">
                                <div className={cn(
                                  "rounded-full p-2",
                                  agendamento.status === "confirmado" 
                                    ? "bg-green-500/10" 
                                    : agendamento.status === "pendente"
                                      ? "bg-yellow-500/10"
                                      : "bg-red-500/10"
                                )}>
                                  <CalendarDays className={cn(
                                    "h-5 w-5",
                                    agendamento.status === "confirmado"
                                      ? "text-green-500"
                                      : agendamento.status === "pendente"
                                        ? "text-yellow-500"
                                        : "text-red-500"
                                  )} />
                                </div>
                                <div>
                                  <div className="font-medium flex items-center gap-1">
                                    {agendamento.requiresAction && (
                                      <AlertCircle className="h-4 w-4 text-amber-500" />
                                    )}
                                    {agendamento.clienteNome}
                                  </div>
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    {format(new Date(agendamento.data), "dd/MM/yyyy")}
                                    <span className="mx-1">•</span>
                                    <Clock className="h-3 w-3 mr-1" />
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
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="acoes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      Ações Necessárias
                    </CardTitle>
                    <CardDescription>
                      Agendamentos que requerem sua atenção
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!selectedEmpresaId ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
                        <Filter className="h-12 w-12 text-muted-foreground" />
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold">Selecione uma empresa</h3>
                          <p className="text-sm text-muted-foreground max-w-md">
                            Selecione uma empresa para visualizar as ações necessárias.
                          </p>
                        </div>
                      </div>
                    ) : isLoadingAgendamentos || isFilterLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <div className="animate-pulse flex flex-col space-y-4 w-full">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded-md w-full"></div>
                          ))}
                        </div>
                      </div>
                    ) : agendamentos.filter(a => a.requiresAction).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold">Tudo em dia!</h3>
                          <p className="text-sm text-muted-foreground max-w-md">
                            Não há ações pendentes que requeiram sua atenção no momento.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {agendamentos
                          .filter(a => a.requiresAction)
                          .sort((a, b) => {
                            // Sort by date and then by time
                            const dateA = new Date(a.data);
                            const dateB = new Date(b.data);
                            
                            if (dateA.getTime() !== dateB.getTime()) {
                              return dateA.getTime() - dateB.getTime();
                            }
                            
                            return a.horarioInicio.localeCompare(b.horarioInicio);
                          })
                          .map((agendamento) => (
                            <div
                              key={agendamento.id}
                              className="flex items-center justify-between p-4 rounded-lg border-l-4 border-amber-400 hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex items-start gap-4">
                                <div className="rounded-full p-2 bg-amber-500/10">
                                  <AlertCircle className="h-5 w-5 text-amber-500" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {agendamento.clienteNome}
                                  </div>
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    {format(new Date(agendamento.data), "dd/MM/yyyy")}
                                    <span className="mx-1">•</span>
                                    <Clock className="h-3 w-3 mr-1" />
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
                                    {agendamento.actionType && (
                                      <Badge variant="outline" className={cn(
                                        agendamento.actionType === "approval" 
                                          ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                          : agendamento.actionType === "response"
                                            ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                            : agendamento.actionType === "update"
                                              ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                              : "bg-teal-500/10 text-teal-600 border-teal-500/20"
                                      )}>
                                        {agendamento.actionType === "approval" 
                                          ? "Aprovação Pendente"
                                          : agendamento.actionType === "response"
                                            ? "Resposta Pendente"
                                            : agendamento.actionType === "update"
                                              ? "Atualização Necessária"
                                              : "Revisão Pendente"}
                                      </Badge>
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
              </div>
              
              <div className="md:col-span-4">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Filtros</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Empresa
                        </label>
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
                    </CardContent>
                  </Card>
                  
                  {agendamentos.filter(a => a.requiresAction).length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        Tipos de Ação
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                            Aprovação Pendente
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {agendamentos.filter(a => a.actionType === "approval").length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                            Resposta Pendente
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {agendamentos.filter(a => a.actionType === "response").length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                            Atualização Necessária
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {agendamentos.filter(a => a.actionType === "update").length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-500/20">
                            Revisão Pendente
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {agendamentos.filter(a => a.actionType === "review").length}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
