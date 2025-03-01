
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
import { Empresa } from "@/pages/Empresas";

interface EmpresaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: Empresa | null;
  onDelete: () => void;
}

export function EmpresaDeleteDialog({
  open,
  onOpenChange,
  empresa,
  onDelete,
}: EmpresaDeleteDialogProps) {
  if (!empresa) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente a empresa{" "}
            <span className="font-semibold">{empresa.nome}</span> e todos os dados associados a ela.
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
