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
import { log } from "console";
import { deleteUser, User } from "@/hooks/useUsers";

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
  const usuarioAtual = user || { id: "", person: { name: "Usuário Desconhecido" } }; 
  console.log("UserDeleteDialog - user:", user);

  const handleDelete = async () => {
    if (!user) return;
    try {
      const response = await deleteUser(user.id);
      if (!response.ok) {
        throw new Error("Erro ao deletar usuário");
      }
      onDelete();
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o usuário{" "}
            <span className="font-bold">{usuarioAtual.person.name}</span>? Esta ação não pode
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
