
import React, { useState } from "react";
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Agendamento } from "@/types/agendamento";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const handleMouseEnter = (id: string) => {
    setOpenPopoverId(id);
  };

  const handleMouseLeave = () => {
    setOpenPopoverId(null);
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map(day => (
        <div key={day.toISOString()} className="border rounded-md p-2 overflow-hidden">
          <h3 className="text-sm font-semibold mb-2">{format(day, "dd/MM", { locale: ptBR })}</h3>
          <div className="space-y-1">
            {agendamentos.filter(agendamento => isSameDay(new Date(agendamento.data), day)).map(agendamento => (
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
                      "px-2 py-1 rounded-md text-xs truncate border-l-2",
                      "cursor-pointer hover:bg-muted transition-colors",
                      agendamento.status === "confirmado" ? "border-l-green-500 bg-green-50" : 
                      agendamento.status === "pendente" ? "border-l-yellow-500 bg-yellow-50" : 
                      "border-l-red-500 bg-red-50"
                    )}
                    onClick={() => handleEditAgendamento(agendamento)}
                    onMouseEnter={() => handleMouseEnter(agendamento.id)}
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
                </PopoverTrigger>
                <PopoverContent 
                  side="right" 
                  align="start"
                  className="p-3 w-72"
                  onMouseEnter={() => handleMouseEnter(agendamento.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm">{agendamento.clienteNome}</h4>
                      <div className="text-xs text-muted-foreground mt-1">
                        <div>{agendamento.horarioInicio} - {agendamento.horarioFim}</div>
                        <div>{agendamento.particaoNome}</div>
                      </div>
                      {agendamento.observacoes && (
                        <div className="mt-2 text-xs bg-muted/30 p-2 rounded">
                          {agendamento.observacoes}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 text-xs"
                        onClick={() => handleEditAgendamento(agendamento)}
                        onMouseEnter={() => handleMouseEnter(agendamento.id)}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          // This would be connected to handleDeleteAgendamento in a real implementation
                          // console.log("Delete clicked for:", agendamento.id);
                        }}
                        onMouseEnter={() => handleMouseEnter(agendamento.id)}
                      >
                        <Trash className="mr-1 h-3.5 w-3.5" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
