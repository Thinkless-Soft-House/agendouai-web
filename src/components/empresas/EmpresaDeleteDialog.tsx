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
  const empresaAtual = empresa || { id: "", nome: "esta empresa" };

  const handleDelete = async () => {
    if (!empresa) return null;

    try {
      console.log("empresa", empresa);
      const response = await fetch(`http://localhost:3000/empresa/${empresa.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir empresa");
      }

      // Chama a função onDelete para atualizar o estado ou fazer qualquer outra ação necessária
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
            empresa <span className="font-semibold">{empresaAtual.nome}</span> e
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
