
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CategoriaTable } from "@/components/categorias/CategoriaTable";
import { CategoriaDialog } from "@/components/categorias/CategoriaDialog";
import { CategoriaDeleteDialog } from "@/components/categorias/CategoriaDeleteDialog";

// Tipo para representar uma categoria
export type Categoria = {
  id: string;
  nome: string;
  nomeParticao: string;
  empresasVinculadas: number;
  criadoEm: string;
};

const Categorias = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [categoriaToEdit, setCategoriaToEdit] = useState<Categoria | null>(null);
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null);
  const { toast } = useToast();

  // Simulação de dados de categorias
  const fetchCategorias = async (): Promise<Categoria[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const hoje = new Date();
    
    return [
      {
        id: "cat-1",
        nome: "Barbearia",
        nomeParticao: "Cadeira",
        empresasVinculadas: 12,
        criadoEm: new Date(hoje.getFullYear(), hoje.getMonth() - 5, 15).toISOString(),
      },
      {
        id: "cat-2",
        nome: "Consultório",
        nomeParticao: "Sala",
        empresasVinculadas: 8,
        criadoEm: new Date(hoje.getFullYear(), hoje.getMonth() - 4, 10).toISOString(),
      },
      {
        id: "cat-3",
        nome: "Coworking",
        nomeParticao: "Mesa",
        empresasVinculadas: 5,
        criadoEm: new Date(hoje.getFullYear(), hoje.getMonth() - 3, 5).toISOString(),
      },
      {
        id: "cat-4",
        nome: "Salão de Beleza",
        nomeParticao: "Estação",
        empresasVinculadas: 7,
        criadoEm: new Date(hoje.getFullYear(), hoje.getMonth() - 2, 20).toISOString(),
      },
      {
        id: "cat-5",
        nome: "Academia",
        nomeParticao: "Equipamento",
        empresasVinculadas: 3,
        criadoEm: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 10).toISOString(),
      }
    ];
  };

  const { data: categorias = [], isLoading, refetch } = useQuery({
    queryKey: ["categorias"],
    queryFn: fetchCategorias,
  });

  const handleCreateCategoria = () => {
    setOpenCreateDialog(true);
  };

  const handleEditCategoria = (categoria: Categoria) => {
    setCategoriaToEdit(categoria);
  };

  const handleDeleteCategoria = (categoria: Categoria) => {
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
          isLoading={isLoading} 
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
