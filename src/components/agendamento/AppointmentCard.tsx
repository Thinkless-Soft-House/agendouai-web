
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, User, Pencil, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Agendamento, StatusColors } from "@/types/agendamento";

interface AppointmentCardProps {
  agendamento: Agendamento;
  onEdit: (agendamento: Agendamento) => void;
  onDelete: (agendamento: Agendamento) => void;
}

export function AppointmentCard({ agendamento, onEdit, onDelete }: AppointmentCardProps) {
  return (
    <div
      key={agendamento.id}
      className={cn(
        "p-3 rounded-lg border transition-all duration-200 hover:shadow-md",
        agendamento.requiresAction 
          ? "border-l-4 border-amber-400" 
          : "hover:border-primary/50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-3 w-3 rounded-full",
            StatusColors[agendamento.status]
          )} />
          <h3 className="font-medium text-sm">{agendamento.clienteNome}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => onEdit(agendamento)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:bg-red-50 transition-colors cursor-pointer"
                onClick={() => onDelete(agendamento)}
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="mt-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{agendamento.horarioInicio} - {agendamento.horarioFim}</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <User className="h-3 w-3" />
          <span>{agendamento.particaoNome}</span>
        </div>
      </div>
      {agendamento.observacoes && (
        <div className="mt-2 bg-muted/30 p-2 rounded-sm text-xs">
          {agendamento.observacoes}
        </div>
      )}
    </div>
  );
}
