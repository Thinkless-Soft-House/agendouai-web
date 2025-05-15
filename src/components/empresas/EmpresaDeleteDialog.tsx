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
import { Company, deleteEmpresa } from "@/hooks/useEmpresas";

interface EmpresaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: Company | null;
  onDelete: () => void;
}

export function EmpresaDeleteDialog({
  open,
  onOpenChange,
  empresa,
  onDelete,
}: EmpresaDeleteDialogProps) {
  const empresaAtual = empresa || { id: "", name: "esta empresa" };

  const handleDelete = async () => {
    if (!empresa) return null;

    try {
      await deleteEmpresa(empresa.id);
      onDelete();
    } catch (error) {
      console.error("Erro ao excluir empresa:", error);
      // Aqui você pode adicionar uma lógica para exibir uma mensagem de erro ao usuário, se necessário
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente a
            empresa <span className="font-semibold">{empresaAtual.name}</span> e
            todos os dados associados a ela.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
