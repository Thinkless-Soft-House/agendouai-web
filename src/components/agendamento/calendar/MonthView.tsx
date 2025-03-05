
import React from "react";
import { format, isToday, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Agendamento } from "@/pages/Agendamento";

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
