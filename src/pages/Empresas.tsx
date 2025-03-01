
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmpresaTable } from "@/components/empresas/EmpresaTable";
import { EmpresaDialog } from "@/components/empresas/EmpresaDialog";
import { Button } from "@/components/ui/button";
import { EmpresaDeleteDialog } from "@/components/empresas/EmpresaDeleteDialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Tipo para representar uma empresa
export type Empresa = {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  status: "active" | "inactive";
  criadoEm: string;
};

const Empresas = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [empresaToEdit, setEmpresaToEdit] = useState<Empresa | null>(null);
  const [empresaToDelete, setEmpresaToDelete] = useState<Empresa | null>(null);
  const { toast } = useToast();

  // Simulação de dados de empresas
  const fetchEmpresas = async (): Promise<Empresa[]> => {
    // Simular uma chamada de API
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return Array.from({ length: 30 }, (_, i) => ({
      id: `empresa-${i + 1}`,
      nome: `Empresa ${i + 1}`,
      cnpj: `${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
      endereco: `Rua ${i + 1}, ${Math.floor(Math.random() * 1000)}, Cidade ${i % 5}`,
      telefone: `(${10 + i % 90}) ${9}${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      email: `contato@empresa${i + 1}.com.br`,
      status: i % 4 === 0 ? "inactive" : "active",
      criadoEm: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  };

  const { data: empresas = [], isLoading, refetch } = useQuery({
    queryKey: ["empresas"],
    queryFn: fetchEmpresas,
  });

  const handleCreateEmpresa = () => {
    setOpenCreateDialog(true);
  };

  const handleEditEmpresa = (empresa: Empresa) => {
    setEmpresaToEdit(empresa);
  };

  const handleDeleteEmpresa = (empresa: Empresa) => {
    setEmpresaToDelete(empresa);
  };

  const handleEmpresaSaved = () => {
    refetch();
    toast({
      title: "Sucesso",
      description: empresaToEdit ? "Empresa atualizada com sucesso." : "Empresa criada com sucesso.",
    });
    setEmpresaToEdit(null);
    setOpenCreateDialog(false);
  };

  const handleEmpresaDeleted = () => {
    refetch();
    toast({
      title: "Sucesso",
      description: "Empresa excluída com sucesso.",
      variant: "destructive",
    });
    setEmpresaToDelete(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <Button onClick={handleCreateEmpresa}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Empresa
          </Button>
        </div>

        <EmpresaTable 
          empresas={empresas} 
          isLoading={isLoading} 
          onEdit={handleEditEmpresa} 
          onDelete={handleDeleteEmpresa} 
        />

        <EmpresaDialog 
          open={openCreateDialog || empresaToEdit !== null}
          onOpenChange={(open) => {
            if (!open) {
              setEmpresaToEdit(null);
              setOpenCreateDialog(false);
            }
          }}
          empresa={empresaToEdit}
          onSave={handleEmpresaSaved}
        />

        <EmpresaDeleteDialog
          open={empresaToDelete !== null}
          onOpenChange={(open) => {
            if (!open) setEmpresaToDelete(null);
          }}
          empresa={empresaToDelete}
          onDelete={handleEmpresaDeleted}
        />
      </div>
    </DashboardLayout>
  );
};

export default Empresas;
