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
import { Particao } from "@/pages/Particoes";
import { Loader2 } from "lucide-react";

interface ParticaoDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  particao: Particao | null;
  onDelete: () => void;
}

export function ParticaoDeleteDialog({
  open,
  onOpenChange,
  particao,
  onDelete,
}: ParticaoDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  if (!particao) return null;

  const handleDelete = async () => {
    if (!particao) return;
    
    setIsDeleting(true);
    try {
      // Make DELETE request to the sala endpoint
      await axios.delete(`http://localhost:3000/sala/${particao.id}`);
      
      // Call onDelete callback to notify parent component
      onDelete();
      
      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting partition:", error);
      alert("Failed to delete the partition. Please try again.");
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
            Esta ação não pode ser desfeita. Isso excluirá permanentemente a partição{" "}
            <span className="font-semibold">{particao.nome}</span> e todos os dados associados a ela.
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
