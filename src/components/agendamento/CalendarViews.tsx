import React from "react";
import { format, isToday, isSameDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Agendamento, StatusColors } from "@/pages/Agendamento";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface ViewSelectorProps {
  view: "day" | "week" | "month";
  setView: (view: "day" | "week" | "month") => void;
}

export function ViewSelector({ view, setView }: ViewSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant={view === "day" ? "default" : "outline"}
            onClick={() => setView("day")}
          >
            Dia
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Visualizar por dia</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant={view === "week" ? "default" : "outline"}
            onClick={() => setView("week")}
          >
            Semana
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Visualizar por semana</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant={view === "month" ? "default" : "outline"}
            onClick={() => setView("month")}
          >
            Mês
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Visualizar por mês</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

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
    <>
      {view === "day" && (
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handlePreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Dia anterior</p>
            </TooltipContent>
          </Tooltip>
          <h2 className="text-lg font-semibold">{format(date, "dd 'de' MMMM", { locale: ptBR })}</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Próximo dia</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {view === "week" && (
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handlePreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Semana anterior</p>
            </TooltipContent>
          </Tooltip>
          <h2 className="text-lg font-semibold">
            {format(startOfWeek(date, { locale: ptBR }), "dd 'de' MMMM", { locale: ptBR })} -{" "}
            {format(endOfWeek(date, { locale: ptBR }), "dd 'de' MMMM", { locale: ptBR })}
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Próxima semana</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {view === "month" && (
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mês anterior</p>
            </TooltipContent>
          </Tooltip>

          <Popover open={isMonthPickerOpen} onOpenChange={setIsMonthPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"ghost"}
                size="sm"
                className="font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>{format(monthView, "MMMM yyyy", { locale: ptBR })}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="bottom">
              <div className="grid grid-cols-4 gap-2 p-4">
                {monthNames.map((month, index) => (
                  <Button
                    key={month}
                    variant="ghost"
                    className={cn(
                      "h-9 w-full p-0 font-normal",
                      monthView.getMonth() === index ? "bg-accent text-accent-foreground" : ""
                    )}
                    onClick={() => {
                      handleMonthChange(index);
                      setIsMonthPickerOpen(false);
                    }}
                  >
                    {month}
                  </Button>
                ))}
              </div>
              <div className="flex items-center justify-between p-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsMonthPickerOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={monthView.getFullYear()}
                    onChange={handleYearChange}
                    className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setIsMonthPickerOpen(false)}
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Próximo mês</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </>
  );
}

interface DayViewProps {
  date: Date;
  agendamentos: Agendamento[];
  selectedEmpresaId: string;
  handleCreateAgendamento: (date: Date, horario: string) => void;
  renderAppointmentCard: (agendamento: Agendamento) => React.ReactNode;
  isLoading: boolean;
}

export function DayView({
  date,
  agendamentos,
  selectedEmpresaId,
  handleCreateAgendamento,
  renderAppointmentCard,
  isLoading
}: DayViewProps) {
  const start = 8;
  const end = 19;
  const timeSlots = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  
  const todayAgendamentos = agendamentos.filter(agendamento => {
    const agendamentoDate = new Date(agendamento.data);
    return isSameDay(agendamentoDate, date);
  });

  return (
    <div className="grid grid-cols-[70px_1fr] border rounded-md overflow-hidden">
      {/* Time slots */}
      <div className="border-r divide-y">
        {timeSlots.map((hour) => (
          <div key={hour} className="h-16 flex items-center justify-center text-xs text-muted-foreground">
            {`${hour}:00`}
          </div>
        ))}
      </div>

      {/* Appointments */}
      <div className="divide-y relative">
        {timeSlots.map((hour) => {
          const hourAgendamentos = todayAgendamentos.filter(
            agendamento => parseInt(agendamento.horarioInicio) === hour
          );
          
          return (
            <div 
              key={hour} 
              className="h-16 relative hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => handleCreateAgendamento(date, `${hour}:00`)}
            >
              {hourAgendamentos.length > 0 ? (
                <div className="absolute inset-0 p-2 overflow-y-auto">
                  {hourAgendamentos.map(agendamento => (
                    <div key={agendamento.id} className="h-full" onClick={(e) => e.stopPropagation()}>
                      {renderAppointmentCard(agendamento)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-xs text-muted-foreground">Clique para adicionar</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface WeekViewProps {
  date: Date;
  setDate: (date: Date) => void;
  agendamentos: Agendamento[];
  handleCreateAgendamento: (date: Date, horario: string) => void;
  handleEditAgendamento: (agendamento: Agendamento) => void;
  isLoading: boolean;
}

export function WeekView({
  date,
  setDate,
  agendamentos,
  handleCreateAgendamento,
  handleEditAgendamento,
  isLoading
}: WeekViewProps) {
  const startOfWeekDate = startOfWeek(date, { locale: ptBR });
  const endOfWeekDate = endOfWeek(date, { locale: ptBR });
  const days = eachDayOfInterval({ start: startOfWeekDate, end: endOfWeekDate });

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map(day => (
        <div key={day.toISOString()} className="border rounded-md p-2">
          <h3 className="text-sm font-semibold mb-2">{format(day, "dd/MM", { locale: ptBR })}</h3>
          {agendamentos.filter(agendamento => isSameDay(new Date(agendamento.data), day)).map(agendamento => (
            <div
              key={agendamento.id}
              className="bg-muted/50 p-2 rounded-md text-xs mb-1 cursor-pointer"
              onClick={() => handleEditAgendamento(agendamento)}
            >
              {agendamento.clienteNome} ({agendamento.horarioInicio})
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

interface MonthViewProps {
  date: Date;
  setDate: (date: Date) => void;
  setView: (view: "day" | "week" | "month") => void;
  agendamentos: Agendamento[];
  isLoading: boolean;
}

export function MonthView({
  date,
  setDate,
  setView,
  agendamentos,
  isLoading
}: MonthViewProps) {
  const startOfMonthDate = startOfMonth(date);
  const endOfMonthDate = endOfMonth(date);
  const days = eachDayOfInterval({ start: startOfMonthDate, end: endOfMonthDate });

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map(day => (
        <div
          key={day.toISOString()}
          className={cn(
            "border rounded-md p-2 h-24 overflow-y-auto hover:bg-muted/50 transition-colors cursor-pointer",
            isToday(day) ? "bg-accent/50" : ""
          )}
          onClick={() => {
            setDate(day);
            setView("day");
          }}
        >
          <h3 className="text-sm font-semibold mb-1">{format(day, "dd", { locale: ptBR })}</h3>
          {agendamentos.filter(agendamento => isSameDay(new Date(agendamento.data), day)).map(agendamento => (
            <Badge
              key={agendamento.id}
              className="text-[10px] rounded-md mt-0.5"
              variant="secondary"
            >
              {agendamento.clienteNome}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  );
}
