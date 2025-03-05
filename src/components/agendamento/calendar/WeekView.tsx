
import React, { useState } from "react";
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Agendamento } from "@/pages/Agendamento";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);

  return (
    <TooltipProvider delayDuration={100}>
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => (
          <div key={day.toISOString()} className="border rounded-md p-2 overflow-hidden">
            <h3 className="text-sm font-semibold mb-2">{format(day, "dd/MM", { locale: ptBR })}</h3>
            <div className="space-y-1">
              {agendamentos.filter(agendamento => isSameDay(new Date(agendamento.data), day)).map(agendamento => (
                <Tooltip 
                  key={agendamento.id}
                  open={openTooltipId === agendamento.id}
                  onOpenChange={(open) => {
                    if (open) {
                      setOpenTooltipId(agendamento.id);
                    } else if (openTooltipId === agendamento.id) {
                      setOpenTooltipId(null);
                    }
                  }}
                >
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "px-2 py-1 rounded-md text-xs truncate border-l-2",
                        "cursor-pointer hover:bg-muted transition-colors",
                        agendamento.status === "confirmado" ? "border-l-green-500 bg-green-50" : 
                        agendamento.status === "pendente" ? "border-l-yellow-500 bg-yellow-50" : 
                        "border-l-red-500 bg-red-50"
                      )}
                      onClick={() => handleEditAgendamento(agendamento)}
                      onMouseEnter={() => setOpenTooltipId(agendamento.id)}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "h-2 w-2 rounded-full flex-shrink-0",
                          agendamento.status === "confirmado" ? "bg-green-500" : 
                          agendamento.status === "pendente" ? "bg-yellow-500" : 
                          "bg-red-500"
                        )} />
                        <span className="font-medium truncate">{agendamento.clienteNome}</span>
                      </div>
                      <div className="text-muted-foreground mt-0.5 text-[10px]">
                        {agendamento.horarioInicio}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    className="p-0 pointer-events-auto" 
                    onMouseEnter={() => setOpenTooltipId(agendamento.id)}
                    onMouseLeave={() => setOpenTooltipId(null)}
                  >
                    <div className="p-3 w-full pointer-events-auto">
                      <div className="font-medium pointer-events-auto">{agendamento.clienteNome}</div>
                      <div className="text-xs text-muted-foreground mt-1 pointer-events-auto">
                        <div className="pointer-events-auto">{agendamento.horarioInicio} - {agendamento.horarioFim}</div>
                        <div className="pointer-events-auto">{agendamento.particaoNome}</div>
                      </div>
                      {agendamento.observacoes && (
                        <div className="mt-2 text-xs bg-muted/30 p-1 rounded pointer-events-auto">
                          {agendamento.observacoes}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
