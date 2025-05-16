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
import { User } from "@/pages/Users";
import { log } from "console";
import { getApiEndpoint } from "@/lib/api";

interface UserDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onDelete: () => void;
}

export function UserDeleteDialog({
  open,
  onOpenChange,
  user,
  onDelete,
}: UserDeleteDialogProps) {
  const usuarioAtual = user || { id: "", nome: "este usuário" }; 

  const handleDelete = async () => {
    if (!user) return;

    try {
      const response = await fetch(getApiEndpoint(`usuario/${user.id}`), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar usuário");
      }

      // Chama a função onDelete para atualizar o estado ou fazer qualquer outra ação necessária
      onDelete();
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      // Aqui você pode adicionar uma lógica para exibir uma mensagem de erro ao usuário, se necessário
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o usuário{" "}
            <span className="font-bold">{usuarioAtual.nome}</span>? Esta ação não pode
            ser desfeita.
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
