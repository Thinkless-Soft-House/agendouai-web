
import React from "react";
import { format, isToday, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Agendamento } from "@/types/agendamento";

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
                  <Badge
                    key={agendamento.id}
                    className={cn(
                      "text-[10px] w-full justify-start font-normal border-l-2 bg-background rounded-sm px-1 py-0.5",
                      agendamento.status === "confirmado" ? "border-l-green-500" : 
                      agendamento.status === "pendente" ? "border-l-yellow-500" : 
                      "border-l-red-500"
                    )}
                    variant="outline"
                  >
                    <span className="truncate">{agendamento.horarioInicio} {agendamento.clienteNome}</span>
                  </Badge>
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
