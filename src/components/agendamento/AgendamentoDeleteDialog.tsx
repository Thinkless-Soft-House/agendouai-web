
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Agendamento } from "@/pages/Agendamento";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgendamentoDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento: Agendamento | null;
  onDelete: () => void;
}

export function AgendamentoDeleteDialog({
  open,
  onOpenChange,
  agendamento,
  onDelete,
}: AgendamentoDeleteDialogProps) {
  if (!agendamento) return null;

  const dataFormatada = format(new Date(agendamento.data), "dd/MM/yyyy", { locale: ptBR });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o agendamento de{" "}
            <span className="font-semibold">{agendamento.clienteNome}</span> para o dia{" "}
            <span className="font-semibold">{dataFormatada}</span> às{" "}
            <span className="font-semibold">{agendamento.horarioInicio}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
