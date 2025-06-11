import React, { useState } from "react";
import axios from "axios";
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
import { Espaco } from "@/pages/Particoes";
import { Loader2 } from "lucide-react";

interface EspacoDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  espaco: Espaco | null;
  onDelete: () => void;
}

export function EspacoDeleteDialog({
  open,
  onOpenChange,
  espaco,
  onDelete,
}: EspacoDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!espaco) return null;

  const handleDelete = async () => {
    if (!espaco) return;

    setIsDeleting(true);
    try {
      // Make DELETE request to the sala endpoint
      await axios.delete(`/spaces/${espaco.id}`);

      // Call onDelete callback to notify parent component
      onDelete();

      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting space:", error);
      alert("Failed to delete the space. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o espaço{" "}
            <span className="font-semibold">{espaco.nome}</span> e todos os dados associados a ele.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
