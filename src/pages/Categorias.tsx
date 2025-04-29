import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CategoriaTable } from "@/components/categorias/CategoriaTable";
import { CategoriaDialog } from "@/components/categorias/CategoriaDialog";
import { CategoriaDeleteDialog } from "@/components/categorias/CategoriaDeleteDialog";
import axios from "axios";
import { log } from "console";

// Tipo para representar uma categoria
export type Categoria = {
  id: string;
  descricao: string;
  prefixParticao: string;
  totalEmpresas: number;
  // criadoEm: string;
};

const Categorias = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [categoriaToEdit, setCategoriaToEdit] = useState<Categoria | null>(null);
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null);
  const { toast } = useToast();

  // Função para buscar categorias do endpoint
  const fetchCategorias = async (): Promise<Categoria[]> => {
    const response = await axios.get<{ data: any[] }>(
      "http://localhost:3000/categoriaEmpresa/estatisticas"
    );

    // console.log("Categorias:", response.data.data);

    return response.data.data.map((categoria) => ({
      id: String(categoria.id),
      descricao: categoria.descricao || "Nome Não Informado",
      prefixParticao: categoria.prefixParticao || "Nome Não Informado",
      totalEmpresas: categoria.totalEmpresas || 0,
      // criadoEm: categoria.criadoEm || new Date().toISOString(),
    }));;
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