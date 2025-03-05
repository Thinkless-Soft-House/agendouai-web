
import React from "react";
import { isSameDay } from "date-fns";
import { Agendamento } from "@/pages/Agendamento";

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
                <div className="h-full p-1">
                  {hourAgendamentos.map(agendamento => (
                    <div 
                      key={agendamento.id} 
                      className="h-full" 
                      onClick={(e) => e.stopPropagation()}
                    >
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
