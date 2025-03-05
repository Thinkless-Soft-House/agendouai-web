
import React from "react";
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Agendamento } from "@/pages/Agendamento";

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
        <div key={day.toISOString()} className="border rounded-md p-2 overflow-hidden">
          <h3 className="text-sm font-semibold mb-2">{format(day, "dd/MM", { locale: ptBR })}</h3>
          <div className="space-y-1">
            {agendamentos.filter(agendamento => isSameDay(new Date(agendamento.data), day)).map(agendamento => (
              <div
                key={agendamento.id}
                className="bg-muted/50 p-2 rounded-md text-xs cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handleEditAgendamento(agendamento)}
              >
                {agendamento.clienteNome} ({agendamento.horarioInicio})
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
