import React from "react";
import { format, isToday, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Agendamento } from "@/types/agendamento";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pencil, Trash } from "lucide-react";

interface MonthViewProps {
  date: Date;
  setDate: (date: Date) => void;
  setView: (view: "day" | "week" | "month") => void;
  agendamentos: Agendamento[];
  isLoading: boolean;
  renderAppointmentCard?: (agendamento: Agendamento) => React.ReactNode;
  handleEditAgendamento?: (agendamento: Agendamento) => void;
  handleDeleteAgendamento?: (agendamento: Agendamento) => void;
}

export function MonthView({
  date,
  setDate,
  setView,
  agendamentos,
  isLoading,
  renderAppointmentCard,
  handleEditAgendamento,
  handleDeleteAgendamento
}: MonthViewProps) {
  const startOfMonthDate = startOfMonth(date);
  const endOfMonthDate = endOfMonth(date);
  const days = eachDayOfInterval({ start: startOfMonthDate, end: endOfMonthDate });

  // Get days of the week in Portuguese
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Function to get appointment count for a day
  const getAppointmentsForDay = (day: Date) => {
    return agendamentos.filter(agendamento => isSameDay(new Date(agendamento.data), day));
  };

  // Get status color for appointment visualization
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado": return "bg-green-500";
      case "pendente": return "bg-yellow-500";
      case "cancelado": return "bg-red-500";
      case "finalizado": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const [openPopoverId, setOpenPopoverId] = React.useState<string | null>(null);

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center text-sm font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const appointmentsForDay = getAppointmentsForDay(day);
          const appointmentCount = appointmentsForDay.length;
          
          // Group appointments by status for visual indicators
          const statusCounts: Record<string, number> = {};
          appointmentsForDay.forEach(appointment => {
            statusCounts[appointment.status] = (statusCounts[appointment.status] || 0) + 1;
          });
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "border rounded-md p-2 h-28 overflow-y-auto hover:bg-muted/50 transition-colors cursor-pointer",
                isToday(day) ? "bg-accent/50 border-primary" : ""
              )}
              onClick={() => {
                setDate(day);
                setView("day");
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className={cn(
                  "text-sm font-semibold",
                  isToday(day) ? "text-primary" : ""
                )}>
                  {format(day, "dd", { locale: ptBR })}
                </h3>
                
                {appointmentCount > 0 && (
                  <Badge className="text-[10px] h-5 px-1.5" variant="secondary">
                    {appointmentCount}
                  </Badge>
                )}
              </div>
              
              {/* Visual status indicators */}
              {appointmentCount > 0 && (
                <div className="flex items-center space-x-0.5 mb-1.5">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div 
                      key={status}
                      className={cn(
                        "h-1.5 rounded-full", 
                        getStatusColor(status)
                      )}
                      style={{ width: `${(count / appointmentCount) * 100}%` }}
                      title={`${count} ${status}`}
                    />
                  ))}
                </div>
              )}
              
              {/* List of appointments */}
              <div className="space-y-1">
                {appointmentsForDay.slice(0, 3).map(agendamento => (
                  <Popover
                    key={agendamento.id}
                    open={openPopoverId === agendamento.id}
                    onOpenChange={(open) => {
                      if (open) {
                        setOpenPopoverId(agendamento.id);
                      } else if (openPopoverId === agendamento.id) {
                        setOpenPopoverId(null);
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <span
                        onMouseEnter={() => setOpenPopoverId(agendamento.id)}
                        onMouseLeave={() => setTimeout(() => { if (openPopoverId === agendamento.id) setOpenPopoverId(null); }, 200)}
                        style={{ display: 'block' }}
                      >
                        <Badge
                          className={cn(
                            "text-[10px] w-full justify-start font-normal border-l-2 bg-background rounded-sm px-1 py-0.5 cursor-pointer",
                            agendamento.status === "confirmado" ? "border-l-green-500" : 
                            agendamento.status === "pendente" ? "border-l-yellow-500" : 
                            "border-l-red-500"
                          )}
                          variant="outline"
                        >
                          <span className="truncate">{agendamento.startTime} {agendamento.clientName}</span>
                        </Badge>
                      </span>
                    </PopoverTrigger>
                    <PopoverContent 
                      side="right" 
                      align="start"
                      className="p-3 w-80 pointer-events-auto"
                      onMouseEnter={() => setOpenPopoverId(agendamento.id)}
                      onMouseLeave={() => setOpenPopoverId(null)}
                    >
                      {renderAppointmentCard
                        ? renderAppointmentCard(agendamento)
                        : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-medium text-sm">{agendamento.clientName}</div>
                              <div className="flex gap-1">
                                {handleEditAgendamento && (
                                  <button
                                    className="p-1 rounded hover:bg-muted transition-colors"
                                    title="Editar"
                                    onClick={() => handleEditAgendamento(agendamento)}
                                  >
                                    <Pencil className="h-4 w-4 text-primary" />
                                  </button>
                                )}
                                {handleDeleteAgendamento && (
                                  <button
                                    className="p-1 rounded hover:bg-red-100 transition-colors"
                                    title="Excluir"
                                    onClick={() => handleDeleteAgendamento(agendamento)}
                                  >
                                    <Trash className="h-4 w-4 text-red-500" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              <div>{agendamento.startTime} - {agendamento.endTime}</div>
                              <div>{agendamento.spaceName}</div>
                            </div>
                            {agendamento.notes && (
                              <div className="mt-2 text-xs bg-muted/30 p-2 rounded">
                                {agendamento.notes}
                              </div>
                            )}
                          </div>
                        )}
                    </PopoverContent>
                  </Popover>
                ))}
                
                {appointmentCount > 3 && (
                  <div className="text-[10px] text-muted-foreground text-center">
                    + {appointmentCount - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
