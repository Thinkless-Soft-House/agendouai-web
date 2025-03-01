
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ParticaoTable } from "@/components/particoes/ParticaoTable";
import { ParticaoDialog } from "@/components/particoes/ParticaoDialog";
import { Button } from "@/components/ui/button";
import { ParticaoDeleteDialog } from "@/components/particoes/ParticaoDeleteDialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Empresa } from "./Empresas";

// Tipo para representar uma partição
export type Particao = {
  id: string;
  nome: string;
  tipo: "sala" | "funcionario" | "equipamento";
  empresaId: string;
  empresaNome: string;
  descricao: string;
  capacidade?: number;
  disponivel: boolean;
  criadoEm: string;
};

const Particoes = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [particaoToEdit, setParticaoToEdit] = useState<Particao | null>(null);
  const [particaoToDelete, setParticaoToDelete] = useState<Particao | null>(null);
  const { toast } = useToast();

  // Simulação de dados de empresas para o dropdown
  const fetchEmpresas = async (): Promise<Empresa[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Array.from({ length: 10 }, (_, i) => ({
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

  // Simulação de dados de partições
  const fetchParticoes = async (): Promise<Particao[]> => {
    const empresas = await fetchEmpresas();
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return Array.from({ length: 40 }, (_, i) => {
      const empresaIndex = i % empresas.length;
      const empresa = empresas[empresaIndex];
      const tipoOptions = ["sala", "funcionario", "equipamento"] as const;
      const tipo = tipoOptions[i % 3];
      
      return {
        id: `particao-${i + 1}`,
        nome: tipo === "sala" 
          ? `Sala ${i + 1}` 
          : tipo === "funcionario" 
            ? `Funcionário ${i + 1}` 
            : `Equipamento ${i + 1}`,
        tipo,
        empresaId: empresa.id,
        empresaNome: empresa.nome,
        descricao: `Descrição da ${tipo === "sala" ? "sala" : tipo === "funcionario" ? "do funcionário" : "do equipamento"} ${i + 1}`,
        capacidade: tipo === "sala" ? Math.floor(Math.random() * 20) + 1 : undefined,
        disponivel: i % 5 !== 0,
        criadoEm: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      };
    });
  };

  const { data: particoes = [], isLoading, refetch } = useQuery({
    queryKey: ["particoes"],
    queryFn: fetchParticoes,
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ["empresas"],
    queryFn: fetchEmpresas,
  });

  const handleCreateParticao = () => {
    setOpenCreateDialog(true);
  };

  const handleEditParticao = (particao: Particao) => {
    setParticaoToEdit(particao);
  };

  const handleDeleteParticao = (particao: Particao) => {
    setParticaoToDelete(particao);
  };

  const handleParticaoSaved = () => {
    refetch();
    toast({
      title: "Sucesso",
      description: particaoToEdit ? "Partição atualizada com sucesso." : "Partição criada com sucesso.",
    });
    setParticaoToEdit(null);
    setOpenCreateDialog(false);
  };

  const handleParticaoDeleted = () => {
    refetch();
    toast({
      title: "Sucesso",
      description: "Partição excluída com sucesso.",
      variant: "destructive",
    });
    setParticaoToDelete(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Partições</h1>
          <Button onClick={handleCreateParticao}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Partição
          </Button>
        </div>

        <ParticaoTable 
          particoes={particoes} 
          isLoading={isLoading} 
          onEdit={handleEditParticao} 
          onDelete={handleDeleteParticao} 
        />

        <ParticaoDialog 
          open={openCreateDialog || particaoToEdit !== null}
          onOpenChange={(open) => {
            if (!open) {
              setParticaoToEdit(null);
              setOpenCreateDialog(false);
            }
          }}
          particao={particaoToEdit}
          empresas={empresas}
          onSave={handleParticaoSaved}
        />

        <ParticaoDeleteDialog
          open={particaoToDelete !== null}
          onOpenChange={(open) => {
            if (!open) setParticaoToDelete(null);
          }}
          particao={particaoToDelete}
          onDelete={handleParticaoDeleted}
        />
      </div>
    </DashboardLayout>
  );
};

export default Particoes;
