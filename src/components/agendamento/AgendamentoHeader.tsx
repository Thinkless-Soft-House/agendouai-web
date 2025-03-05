
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

interface AgendamentoHeaderProps {
  onNewAgendamento: () => void;
  selectedEmpresaId: string;
  isLoading: boolean;
}

export function AgendamentoHeader({ onNewAgendamento, selectedEmpresaId, isLoading }: AgendamentoHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie sua agenda e visualize agendamentos de clientes
        </p>
      </div>
      <Button 
        onClick={onNewAgendamento}
        disabled={!selectedEmpresaId || isLoading}
        className="transition-all duration-200"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Plus className="mr-2 h-4 w-4" />
        )}
        Novo Agendamento
      </Button>
    </div>
  );
}
