import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CategoriaTable } from "@/components/categorias/CategoriaTable";
import { CategoriaDialog } from "@/components/categorias/CategoriaDialog";
import { CategoriaDeleteDialog } from "@/components/categorias/CategoriaDeleteDialog";
import { useCategorias } from "@/hooks/useCategorias";

// Tipo para representar uma categoria (agora usa o model do backend)
import type { Categoria as CategoriaModel } from "@/hooks/useCategorias";

const Categorias = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [categoriaToEdit, setCategoriaToEdit] = useState<CategoriaModel | null>(null);
  const [categoriaToDelete, setCategoriaToDelete] = useState<CategoriaModel | null>(null);
  const { toast } = useToast();

  // Use o hook useCategorias para buscar as categorias
  const { categorias, isLoadingCategorias, refetch } = useCategorias();

  const handleCreateCategoria = () => {
    setOpenCreateDialog(true);
  };

  const handleEditCategoria = (categoria: CategoriaModel) => {
    setCategoriaToEdit(categoria);
  };

  const handleDeleteCategoria = (categoria: CategoriaModel) => {
    setCategoriaToDelete(categoria);
  };

  const handleCategoriaSaved = () => {
    refetch();
    toast({
      title: "Sucesso",
      description: categoriaToEdit ? "Categoria atualizada com sucesso." : "Categoria criada com sucesso.",
    });
    setCategoriaToEdit(null);
    setOpenCreateDialog(false);
  };

  const handleCategoriaDeleted = () => {
    refetch();
    toast({
      title: "Sucesso",
      description: "Categoria excluída com sucesso.",
      variant: "destructive",
    });
    setCategoriaToDelete(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <Button onClick={handleCreateCategoria}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>

        <CategoriaTable 
          categorias={categorias} 
          isLoading={isLoadingCategorias} 
          onEdit={handleEditCategoria} 
          onDelete={handleDeleteCategoria} 
        />

        <CategoriaDialog 
          open={openCreateDialog || categoriaToEdit !== null}
          onOpenChange={(open) => {
            if (!open) {
              setCategoriaToEdit(null);
              setOpenCreateDialog(false);
            }
          }}
          categoria={categoriaToEdit}
          onSave={handleCategoriaSaved}
        />

        <CategoriaDeleteDialog
          open={categoriaToDelete !== null}
          onOpenChange={(open) => {
            if (!open) setCategoriaToDelete(null);
          }}
          categoria={categoriaToDelete}
          onDelete={handleCategoriaDeleted}
        />
      </div>
    </DashboardLayout>
  );
};

export default Categorias;