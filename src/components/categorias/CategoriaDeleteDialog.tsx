
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
import { Categoria } from "@/pages/Categorias";

interface CategoriaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria: Categoria | null;
  onDelete: () => void;
}

export function CategoriaDeleteDialog({
  open,
  onOpenChange,
  categoria,
  onDelete,
}: CategoriaDeleteDialogProps) {
  const handleDelete = () => {
    // Simulação de chamada à API
    setTimeout(() => {
      onDelete();
    }, 500);
  };

  if (!categoria) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a categoria <span className="font-bold">{categoria.nome}</span>?
            Esta ação não pode ser desfeita e removerá todas as partições associadas a esta categoria.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
