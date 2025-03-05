
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
import { format, isToday, isSameDay, parse, setMonth, setYear, addDays, subDays, startOfMonth, endOfMonth } from "date-fns";
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
  LayoutDashboard
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

const StatusColors = {
  confirmado: "bg-green-500",
  pendente: "bg-yellow-500",
  cancelado: "bg-red-500"
};

const ActionTypeInfo = {
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
  
  // Determine if it's a weekend for time slot display
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };
  
  // Get business hours based on day type
  const getBusinessHours = (date: Date) => {
    if (isWeekend(date)) {
      return { start: 10, end: 16 }; // 10 AM to 4 PM on weekends
    }
    return { start: 8, end: 18 }; // 8 AM to 6 PM on weekdays
  };
  
  // Generate time slots for the day view
  const generateTimeSlots = (date: Date) => {
    const hours = getBusinessHours(date);
    const slots = [];
    
    for (let i = hours.start; i < hours.end; i++) {
      slots.push({
        time: `${i}:00`,
        endTime: `${i + 1}:00`,
        appointments: agendamentos.filter(a => {
          const appointmentDate = new Date(a.data);
          const hour = parseInt(a.horarioInicio.split(':')[0]);
          return isSameDay(appointmentDate, date) && hour === i;
        })
      });
    }
    
    return slots;
  };
  
  // Get days for the week view
  const getWeekDays = (date: Date) => {
    const days = [];
    // Find the start of the week (Monday)
    let startDay = new Date(date);
    const dayOfWeek = startDay.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days, otherwise adjust to Monday
    startDay = addDays(startDay, diff);
    
    // Create array of 7 days
    for (let i = 0; i < 7; i++) {
      days.push(addDays(startDay, i));
    }
    
    return days;
  };
  
  // Get days for month view (including days from previous/next month)
  const getMonthDays = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    
    const days = [];
    
    // Get the first day of the week for the first day of the month
    let firstDayOfWeek = start.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convert to Monday = 0, Sunday = 6
    
    // Add days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push(subDays(start, i + 1));
    }
    
    // Add all days of the current month
    let currentDay = start;
    while (currentDay <= end) {
      days.push(new Date(currentDay));
      currentDay = addDays(currentDay, 1);
    }
    
    // Add days from next month to complete the grid (6 rows of 7 days)
    const daysNeeded = 42 - days.length;
    for (let i = 1; i <= daysNeeded; i++) {
      days.push(addDays(end, i));
    }
    
    return days;
  };

  const getDayAgendamentos = (day: Date) => {
    return agendamentos.filter(agendamento => 
      isSameDay(new Date(agendamento.data), day)
    );
  };

  const getDateStatusInfo = (date: Date) => {
    const appointments = getDayAgendamentos(date);
    
    if (appointments.length === 0) return null;
    
    const counts = {
      total: appointments.length,
      confirmado: appointments.filter(a => a.status === "confirmado").length,
      pendente: appointments.filter(a => a.status === "pendente").length,
      cancelado: appointments.filter(a => a.status === "cancelado").length,
      requiresAction: appointments.filter(a => a.requiresAction).length
    };
    
    return counts;
  };

  // Custom calendar day rendering
  const renderCalendarDay = (day: Date, statusInfo: ReturnType<typeof getDateStatusInfo>) => {
    if (!statusInfo) return null;
    
    return (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <div className="flex space-x-0.5 mb-0.5">
          {statusInfo.confirmado > 0 && (
            <div className="h-1 w-1 rounded-full bg-green-500"></div>
          )}
          {statusInfo.pendente > 0 && (
            <div className="h-1 w-1 rounded-full bg-yellow-500"></div>
          )}
          {statusInfo.cancelado > 0 && (
            <div className="h-1 w-1 rounded-full bg-red-500"></div>
          )}
        </div>
        {statusInfo.requiresAction > 0 && (
          <div className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-amber-500"></div>
        )}
      </div>
    );
  };

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

  const monthNames = Array.from({ length: 12 }, (_, i) => 
    format(new Date(2021, i, 1), "MMMM", { locale: ptBR })
  );

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
                  <pencilIcon className="h-3.5 w-3.5" />
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
                  <trashIcon className="h-3.5 w-3.5" />
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

  const renderTimeSlot = (slot: { time: string; endTime: string; appointments: Agendamento[] }) => {
    return (
      <div className="group relative min-h-[100px] border-b border-l border-r last:border-b-0 p-1">
        <div className="absolute -left-[40px] top-0 text-xs text-muted-foreground mt-2">
          {slot.time}
        </div>
        
        <div className="h-full pt-2 pl-1 flex flex-col gap-1">
          {slot.appointments.length === 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 self-start text-xs h-auto py-1 transition-opacity"
              onClick={() => handleCreateAgendamento(date, slot.time)}
              disabled={!selectedEmpresaId}
            >
              <Plus className="h-3 w-3 mr-1" />
              Novo
            </Button>
          )}
          
          {slot.appointments.map(agendamento => renderAppointmentCard(agendamento))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const timeSlots = generateTimeSlots(date);
    
    return (
      <div className="flex flex-col mt-2">
        <div className="text-center mb-2">
          <h2 className="text-xl font-semibold">
            {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h2>
        </div>
        
        <div className="relative pl-10 border-t rounded-md">
          {timeSlots.map((slot, index) => (
            <div key={index}>
              {renderTimeSlot(slot)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getWeekDays(date);
    const timeSlots = days.map(day => ({
      day,
      slots: generateTimeSlots(day)
    }));
    
    return (
      <div className="flex flex-col mt-2 overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {days.map((day, index) => (
            <div 
              key={index} 
              className={cn(
                "text-center py-2 rounded-md",
                isToday(day) && "bg-primary/5 font-bold",
                isSameDay(day, date) && "border-2 border-primary"
              )}
              onClick={() => setDate(day)}
            >
              <div className="text-sm">{format(day, "EEE", { locale: ptBR })}</div>
              <div className="text-lg font-medium">{format(day, "dd")}</div>
            </div>
          ))}
        </div>
        
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-background border-r">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-[100px] border-b flex items-start pt-2 justify-end pr-2">
                <span className="text-xs text-muted-foreground">{i + 8}:00</span>
              </div>
            ))}
          </div>
          
          <div className="ml-12 grid grid-cols-7 gap-1">
            {days.map((day, dayIndex) => (
              <div key={dayIndex} className={cn(
                "flex flex-col",
                isToday(day) && "bg-primary/5"
              )}>
                {Array.from({ length: 12 }).map((_, hourIndex) => {
                  const hour = hourIndex + 8;
                  const currentSlot = `${hour}:00`;
                  const appointments = agendamentos.filter(a => {
                    const appointmentDate = new Date(a.data);
                    const appointmentHour = parseInt(a.horarioInicio.split(':')[0]);
                    return isSameDay(appointmentDate, day) && appointmentHour === hour;
                  });
                  
                  return (
                    <div 
                      key={hourIndex} 
                      className={cn(
                        "group relative h-[100px] border-b border-r p-1",
                        appointments.length > 0 && "bg-primary/5"
                      )}
                      onClick={() => {
                        setDate(day);
                        if (appointments.length === 0) {
                          handleCreateAgendamento(day, currentSlot);
                        }
                      }}
                    >
                      {appointments.length === 0 ? (
                        <div className="opacity-0 group-hover:opacity-100 h-full flex items-center justify-center text-xs text-muted-foreground transition-opacity">
                          <Plus className="h-3 w-3 mr-1" />
                          Agendar
                        </div>
                      ) : (
                        <div className="h-full overflow-y-auto scrollbar-thin">
                          {appointments.map(appointment => (
                            <div 
                              key={appointment.id} 
                              className={cn(
                                "mb-1 p-1 rounded text-xs cursor-pointer",
                                StatusColors[appointment.status] + "/10",
                                "border-l-2 " + StatusColors[appointment.status]
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAgendamento(appointment);
                              }}
                            >
                              <div className="font-medium">{appointment.clienteNome}</div>
                              <div className="text-[10px] text-muted-foreground">{appointment.particaoNome}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const days = getMonthDays(date);
    
    return (
      <div className="mt-2">
        <div className="grid grid-cols-7 gap-2">
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, i) => (
            <div key={i} className="text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === date.getMonth();
            const statusInfo = getDateStatusInfo(day);
            const isSame = isSameDay(day, date);
            
            return (
              <div
                key={index}
                className={cn(
                  "relative aspect-square rounded-md flex flex-col cursor-pointer p-1.5 hover:bg-accent transition-colors",
                  !isCurrentMonth && "text-muted-foreground/50",
                  isToday(day) && "bg-primary/5",
                  isSame && "border-2 border-primary"
                )}
                onClick={() => {
                  setDate(day);
                  setView("day");
                }}
              >
                <div className="self-start text-sm font-medium">
                  {day.getDate()}
                </div>
                
                {statusInfo && statusInfo.total > 0 && (
                  <div className="mt-auto self-center">
                    <Badge variant="outline" className="h-5 text-[10px]">
                      {statusInfo.total} agend.
                    </Badge>
                  </div>
                )}
                
                {renderCalendarDay(day, statusInfo)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderViewContent = () => {
    switch (view) {
      case "day":
        return renderDayView();
      case "week":
        return renderWeekView();
      case "month":
        return renderMonthView();
      default:
        return null;
    }
  };

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
          <div className="lg:col-span-3 space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </CardTitle>
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

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Busca
                  </label>
                  <Input
                    placeholder="Buscar agendamentos..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ações necessárias */}
            <Card className={cn(
              actionsNeeded.length > 0 ? "border-amber-200 bg-amber-50/50" : ""
            )}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Ações Necessárias
                </CardTitle>
                <CardDescription>
                  {actionsNeeded.length === 0 
                    ? "Não há ações pendentes" 
                    : `${actionsNeeded.length} ações requerem sua atenção`}
                </CardDescription>
              </CardHeader>
              {actionsNeeded.length > 0 && (
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
                            "mt-2 text-[10px]",
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
              )}
            </Card>

            {/* Legenda */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Legenda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
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
              </CardContent>
            </Card>
          </div>

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
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(view === "day" && "bg-primary text-primary-foreground")}
                          onClick={() => setView("day")}
                        >
                          Dia
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(view === "week" && "bg-primary text-primary-foreground")}
                          onClick={() => setView("week")}
                        >
                          Semana
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(view === "month" && "bg-primary text-primary-foreground")}
                          onClick={() => setView("month")}
                        >
                          Mês
                        </Button>
                      </div>
                      
                      <Popover 
                        open={isMonthPickerOpen} 
                        onOpenChange={setIsMonthPickerOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm">
                            {format(monthView, "MMMM yyyy", { locale: ptBR })}
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-0" align="center">
                          <div className="p-3 space-y-3">
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">Mês</label>
                              <Select 
                                value={monthView.getMonth().toString()} 
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
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium">Ano</label>
                              <Input 
                                type="number" 
                                min="1900" 
                                max="2100"
                                value={monthView.getFullYear().toString()}
                                onChange={handleYearChange}
                              />
                            </div>
                            <div className="flex justify-end">
                              <Button 
                                size="sm" 
                                onClick={() => setIsMonthPickerOpen(false)}
                              >
                                Aplicar
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={view === "day" 
                            ? handlePreviousDay 
                            : view === "week" 
                              ? handlePreviousWeek 
                              : handlePreviousMonth
                          }
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setDate(new Date())}
                        >
                          Hoje
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={view === "day" 
                            ? handleNextDay 
                            : view === "week" 
                              ? handleNextWeek 
                              : handleNextMonth
                          }
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
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
                  renderViewContent()
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

// These icons are missing in the imports, but used in the component
// Just defining them here for the code to work
const pencilIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const trashIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);
