
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Agendamento, StatusColors } from "@/pages/Agendamento";
import { cn } from "@/lib/utils";
import { format, isToday, isSameDay, addDays, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  ChevronDown
} from "lucide-react";

// ----------------- View Selector Component -----------------
interface ViewSelectorProps {
  view: "day" | "week" | "month";
  setView: (view: "day" | "week" | "month") => void;
}

export function ViewSelector({ view, setView }: ViewSelectorProps) {
  return (
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
  );
}

// ----------------- Calendar View Header Component -----------------
interface CalendarViewHeaderProps {
  view: "day" | "week" | "month";
  date: Date;
  monthView: Date;
  isMonthPickerOpen: boolean;
  setIsMonthPickerOpen: (open: boolean) => void;
  handlePreviousDay: () => void;
  handleNextDay: () => void;
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  handlePreviousMonth: () => void;
  handleNextMonth: () => void;
  handleMonthChange: (month: number) => void;
  handleYearChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  monthNames: string[];
}

export function CalendarViewHeader({
  view,
  date,
  monthView,
  isMonthPickerOpen,
  setIsMonthPickerOpen,
  handlePreviousDay,
  handleNextDay,
  handlePreviousWeek,
  handleNextWeek,
  handlePreviousMonth,
  handleNextMonth,
  handleMonthChange,
  handleYearChange,
  monthNames
}: CalendarViewHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Popover 
        open={isMonthPickerOpen} 
        onOpenChange={setIsMonthPickerOpen}
      >
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            {format(monthView, "MMMM yyyy", { locale: ptBR })}
            <ChevronDown className="ml-2 h-4 w-4" />
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
          onClick={() => {}}
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
  );
}

// ----------------- Day View Component -----------------
interface DayViewProps {
  date: Date;
  agendamentos: Agendamento[];
  selectedEmpresaId: string;
  handleCreateAgendamento: (date: Date, horario: string) => void;
  renderAppointmentCard: (agendamento: Agendamento) => React.ReactNode;
}

export function DayView({
  date,
  agendamentos,
  selectedEmpresaId,
  handleCreateAgendamento,
  renderAppointmentCard
}: DayViewProps) {
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

  const timeSlots = generateTimeSlots(date);
  
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
}

// ----------------- Week View Component -----------------
interface WeekViewProps {
  date: Date;
  setDate: (date: Date) => void;
  agendamentos: Agendamento[];
  handleCreateAgendamento: (date: Date, horario: string) => void;
  handleEditAgendamento: (agendamento: Agendamento) => void;
}

export function WeekView({
  date,
  setDate,
  agendamentos,
  handleCreateAgendamento,
  handleEditAgendamento
}: WeekViewProps) {
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

  const days = getWeekDays(date);
  
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
}

// ----------------- Month View Component -----------------
interface MonthViewProps {
  date: Date;
  setDate: (date: Date) => void;
  setView: (view: "day" | "week" | "month") => void;
  agendamentos: Agendamento[];
}

export function MonthView({
  date,
  setDate,
  setView,
  agendamentos
}: MonthViewProps) {
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
}
