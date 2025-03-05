
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
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
import { format, isToday, isSameDay, addDays, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  CalendarDays,
  Search,
  LayoutDashboard,
  Pencil,
  Trash
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  ViewSelector, 
  CalendarViewHeader 
} from "@/components/agendamento/CalendarViews";
import { AgendamentoSidebar } from "@/components/agendamento/AgendamentoSidebar";
import { DayView, WeekView, MonthView } from "@/components/agendamento/CalendarViews";
import { AgendamentoDialog } from "@/components/agendamento/AgendamentoDialog";
import { AgendamentoDeleteDialog } from "@/components/agendamento/AgendamentoDeleteDialog";
import { Empresa } from "./Empresas";
import { Particao } from "./Particoes";

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

export const StatusColors = {
  confirmado: "bg-green-500",
  pendente: "bg-yellow-500",
  cancelado: "bg-red-500"
};

export const ActionTypeInfo = {
  approval: {
    label: "Aprovação Pendente",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600",
    borderColor: "border-blue-500/20"
  },
  response: {
    label: "Resposta Pendente",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-600",
    borderColor: "border-purple-500/20"
  },
  update: {
    label: "Atualização Necessária",
    bgColor: "bg-orange-500/10", 
    textColor: "text-orange-600",
    borderColor: "border-orange-500/20"
  },
  review: {
    label: "Revisão Pendente",
    bgColor: "bg-teal-500/10",
    textColor: "text-teal-600",
    borderColor: "border-teal-500/20"
  }
};

const Agendamento = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [monthView, setMonthView] = useState<Date>(new Date());
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>("");
  const [selectedParticaoId, setSelectedParticaoId] = useState<string>("");
  const [filterText, setFilterText] = useState<string>("");
  const [view, setView] = useState<"day" | "week" | "month">("day");
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [agendamentoToCreate, setAgendamentoToCreate] = useState<{
    data: Date;
    horario: string;
  } | null>(null);
  const [agendamentoToEdit, setAgendamentoToEdit] = useState<Agendamento | null>(null);
  const [agendamentoToDelete, setAgendamentoToDelete] = useState<Agendamento | null>(null);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMonthView(new Date(date.getFullYear(), date.getMonth(), 1));
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
    if (!selectedEmpresaId) return [];
    
    setIsFilterLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const currentMonth = date.getMonth();
      const currentYear = date.getFullYear();
      
      return Array.from({ length: 20 }, (_, i) => {
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
          particaoId: selectedParticaoId || `particao-${selectedEmpresaId}-${(i % 5) + 1}`,
          particaoNome: selectedParticaoId 
            ? `Partição ${selectedParticaoId.split('-')[2]}`
            : `Partição ${(i % 5) + 1}`,
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
    enabled: !!selectedEmpresaId,
  });

  const filteredAgendamentos = agendamentos.filter(a => {
    if (!filterText) return true;
    
    const searchTerm = filterText.toLowerCase();
    return (
      a.clienteNome.toLowerCase().includes(searchTerm) ||
      a.particaoNome.toLowerCase().includes(searchTerm) ||
      a.empresaNome.toLowerCase().includes(searchTerm) ||
      (a.observacoes && a.observacoes.toLowerCase().includes(searchTerm))
    );
  });

  const actionsNeeded = filteredAgendamentos.filter(a => a.requiresAction);

  const handleMonthChange = (month: number) => {
    const newDate = new Date(monthView);
    newDate.setMonth(month);
    setMonthView(newDate);
    setDate(new Date(newDate.getFullYear(), newDate.getMonth(), date.getDate()));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const yearValue = parseInt(event.target.value);
    if (!isNaN(yearValue) && yearValue >= 1900 && yearValue <= 2100) {
      const newDate = new Date(monthView);
      newDate.setFullYear(yearValue);
      setMonthView(newDate);
      setDate(new Date(newDate.getFullYear(), newDate.getMonth(), date.getDate()));
    }
  };

  const handlePreviousDay = () => {
    setDate(prevDate => addDays(prevDate, -1));
  };

  const handleNextDay = () => {
    setDate(prevDate => addDays(prevDate, 1));
  };

  const handlePreviousWeek = () => {
    setDate(prevDate => addDays(prevDate, -7));
  };

  const handleNextWeek = () => {
    setDate(prevDate => addDays(prevDate, 7));
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    setDate(newDate);
    setMonthView(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    setDate(newDate);
    setMonthView(newDate);
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

  const renderAppointmentCard = (agendamento: Agendamento) => {
    return (
      <div
        key={agendamento.id}
        className={cn(
          "p-3 rounded-lg border transition-all hover:shadow-md",
          agendamento.requiresAction 
            ? "border-l-4 border-amber-400" 
            : "hover:border-primary/50"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "h-3 w-3 rounded-full",
              StatusColors[agendamento.status]
            )} />
            <h3 className="font-medium text-sm">{agendamento.clienteNome}</h3>
            {agendamento.requiresAction && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ação necessária: {agendamento.actionType ? ActionTypeInfo[agendamento.actionType].label : "Verificar"}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => handleEditAgendamento(agendamento)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive"
                  onClick={() => handleDeleteAgendamento(agendamento)}
                >
                  <Trash className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Excluir</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="mt-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{agendamento.horarioInicio} - {agendamento.horarioFim}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <User className="h-3 w-3" />
            <span>{agendamento.particaoNome}</span>
          </div>
        </div>
        {agendamento.observacoes && (
          <div className="mt-2 bg-muted/30 p-2 rounded-sm text-xs">
            {agendamento.observacoes}
          </div>
        )}
      </div>
    );
  };

  const monthNames = Array.from({ length: 12 }, (_, i) => 
    format(new Date(2021, i, 1), "MMMM", { locale: ptBR })
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie sua agenda e visualize agendamentos de clientes
            </p>
          </div>
          <Button 
            onClick={() => handleCreateAgendamento(new Date(), "09:00")}
            disabled={!selectedEmpresaId}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <AgendamentoSidebar 
            selectedEmpresaId={selectedEmpresaId}
            setSelectedEmpresaId={setSelectedEmpresaId}
            selectedParticaoId={selectedParticaoId}
            setSelectedParticaoId={setSelectedParticaoId}
            filterText={filterText}
            setFilterText={setFilterText}
            empresas={empresas}
            particoes={particoes}
            isFilterLoading={isFilterLoading}
            actionsNeeded={actionsNeeded}
            handleEditAgendamento={handleEditAgendamento}
          />

          {/* Main content */}
          <div className="lg:col-span-9">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2 flex-none">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle>Agenda</CardTitle>
                      {isFilterLoading && (
                        <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <ViewSelector view={view} setView={setView} />
                      
                      <CalendarViewHeader 
                        view={view}
                        date={date}
                        monthView={monthView}
                        isMonthPickerOpen={isMonthPickerOpen}
                        setIsMonthPickerOpen={setIsMonthPickerOpen}
                        handlePreviousDay={handlePreviousDay}
                        handleNextDay={handleNextDay}
                        handlePreviousWeek={handlePreviousWeek}
                        handleNextWeek={handleNextWeek}
                        handlePreviousMonth={handlePreviousMonth}
                        handleNextMonth={handleNextMonth}
                        handleMonthChange={handleMonthChange}
                        handleYearChange={handleYearChange}
                        monthNames={monthNames}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow overflow-auto">
                {!selectedEmpresaId ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 space-y-4">
                    <CalendarRange className="h-16 w-16 text-muted-foreground" />
                    <div className="max-w-md text-center space-y-2">
                      <h3 className="text-xl font-semibold">Selecione uma empresa</h3>
                      <p className="text-muted-foreground">
                        Para visualizar os agendamentos, selecione uma empresa no painel lateral.
                      </p>
                    </div>
                  </div>
                ) : isLoadingAgendamentos || isFilterLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center">
                      <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                      <p className="mt-2 text-muted-foreground">Carregando agendamentos...</p>
                    </div>
                  </div>
                ) : agendamentos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 space-y-4">
                    <CalendarIcon className="h-16 w-16 text-muted-foreground" />
                    <div className="max-w-md text-center space-y-2">
                      <h3 className="text-xl font-semibold">Nenhum agendamento encontrado</h3>
                      <p className="text-muted-foreground">
                        Não há agendamentos para o período selecionado. Crie um novo agendamento clicando no botão abaixo.
                      </p>
                      <Button 
                        onClick={() => handleCreateAgendamento(date, "09:00")}
                        className="mt-2"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Agendamento
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {view === "day" && (
                      <DayView 
                        date={date}
                        agendamentos={filteredAgendamentos}
                        selectedEmpresaId={selectedEmpresaId}
                        handleCreateAgendamento={handleCreateAgendamento}
                        renderAppointmentCard={renderAppointmentCard}
                      />
                    )}
                    {view === "week" && (
                      <WeekView 
                        date={date}
                        setDate={setDate}
                        agendamentos={filteredAgendamentos}
                        handleCreateAgendamento={handleCreateAgendamento}
                        handleEditAgendamento={handleEditAgendamento}
                      />
                    )}
                    {view === "month" && (
                      <MonthView 
                        date={date}
                        setDate={setDate}
                        setView={setView}
                        agendamentos={filteredAgendamentos}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

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
