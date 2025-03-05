
import React, { useState } from "react";
import { isSameDay } from "date-fns";
import { Agendamento } from "@/types/agendamento";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  
  const todayAgendamentos = agendamentos.filter(agendamento => {
    const agendamentoDate = new Date(agendamento.data);
    return isSameDay(agendamentoDate, date);
  });

  const handleMouseEnter = (id: string) => {
    setOpenPopoverId(id);
  };

  const handleMouseLeave = () => {
    setOpenPopoverId(null);
  };

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
      <div className="divide-y">
        {timeSlots.map((hour) => {
          const hourAgendamentos = todayAgendamentos.filter(
            agendamento => parseInt(agendamento.horarioInicio) === hour
          );
          
          return (
            <div 
              key={hour} 
              className="h-16 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => handleCreateAgendamento(date, `${hour}:00`)}
            >
              {hourAgendamentos.length > 0 ? (
                <div className="flex flex-wrap gap-1 p-1 h-full overflow-hidden">
                  {hourAgendamentos.map(agendamento => (
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
                        <div 
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs truncate max-w-full border-l-2",
                            "hover:bg-muted transition-colors cursor-pointer",
                            agendamento.status === "confirmado" ? "border-l-green-500 bg-green-50" : 
                            agendamento.status === "pendente" ? "border-l-yellow-500 bg-yellow-50" : 
                            "border-l-red-500 bg-red-50"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateAgendamento(new Date(agendamento.data), agendamento.horarioInicio);
                          }}
                          onMouseEnter={() => handleMouseEnter(agendamento.id)}
                        >
                          <span className={cn(
                            "h-2 w-2 rounded-full flex-shrink-0",
                            agendamento.status === "confirmado" ? "bg-green-500" : 
                            agendamento.status === "pendente" ? "bg-yellow-500" : 
                            "bg-red-500"
                          )} />
                          <span className="font-medium truncate">{agendamento.clienteNome}</span>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent 
                        side="right" 
                        align="start"
                        className="p-3 w-80 pointer-events-auto"
                        onMouseEnter={() => handleMouseEnter(agendamento.id)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {renderAppointmentCard(agendamento)}
                      </PopoverContent>
                    </Popover>
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
