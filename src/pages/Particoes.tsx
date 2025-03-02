
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
  empresaId: string;
  empresaNome: string;
  descricao: string;
  disponivel: boolean;
  criadoEm: string;
  categoriaId?: string;
  categoriaNome?: string;
  responsaveis?: string[]; // IDs dos funcionários responsáveis
  disponibilidade?: {
    segunda: { ativo: boolean; inicio: string; fim: string; };
    terca: { ativo: boolean; inicio: string; fim: string; };
    quarta: { ativo: boolean; inicio: string; fim: string; };
    quinta: { ativo: boolean; inicio: string; fim: string; };
    sexta: { ativo: boolean; inicio: string; fim: string; };
    sabado: { ativo: boolean; inicio: string; fim: string; };
    domingo: { ativo: boolean; inicio: string; fim: string; };
  };
  excecoes?: {
    abrir: { data: string; inicio: string; fim: string; }[];
    fechar: { data: string; }[];
  };
};

// Tipo para representar um funcionário
export type Funcionario = {
  id: string;
  nome: string;
  email: string;
  empresaId: string;
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
      categoriaId: `categoria-${(i % 5) + 1}`,
      categoriaNome: i % 5 === 0 ? "Barbearia" : i % 5 === 1 ? "Consultório" : i % 5 === 2 ? "Coworking" : i % 5 === 3 ? "Salão de Beleza" : "Escritório",
    }));
  };

  // Simulação de dados de funcionários
  const fetchFuncionarios = async (): Promise<Funcionario[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Array.from({ length: 20 }, (_, i) => ({
      id: `funcionario-${i + 1}`,
      nome: `Funcionário ${i + 1}`,
      email: `funcionario${i + 1}@exemplo.com`,
      empresaId: `empresa-${(i % 10) + 1}`,
    }));
  };

  // Simulação de dados de partições
  const fetchParticoes = async (): Promise<Particao[]> => {
    const empresas = await fetchEmpresas();
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return Array.from({ length: 40 }, (_, i) => {
      const empresaIndex = i % empresas.length;
      const empresa = empresas[empresaIndex];
      
      return {
        id: `particao-${i + 1}`,
        nome: `Partição ${i + 1}`,
        empresaId: empresa.id,
        empresaNome: empresa.nome,
        descricao: `Descrição da partição ${i + 1}`,
        disponivel: i % 5 !== 0,
        criadoEm: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        categoriaId: i % 2 === 0 ? empresa.categoriaId : undefined,
        categoriaNome: i % 2 === 0 ? empresa.categoriaNome : undefined,
        responsaveis: [
          `funcionario-${(i % 20) + 1}`,
          `funcionario-${((i + 5) % 20) + 1}`,
        ],
        disponibilidade: {
          segunda: { ativo: true, inicio: "09:00", fim: "18:00" },
          terca: { ativo: true, inicio: "09:00", fim: "18:00" },
          quarta: { ativo: true, inicio: "09:00", fim: "18:00" },
          quinta: { ativo: true, inicio: "09:00", fim: "18:00" },
          sexta: { ativo: true, inicio: "09:00", fim: "18:00" },
          sabado: { ativo: i % 2 === 0, inicio: "10:00", fim: "15:00" },
          domingo: { ativo: false, inicio: "", fim: "" },
        },
        excecoes: {
          abrir: [
            { data: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), inicio: "08:00", fim: "20:00" }
          ],
          fechar: [
            { data: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() }
          ],
        },
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

  const { data: funcionarios = [] } = useQuery({
    queryKey: ["funcionarios"],
    queryFn: fetchFuncionarios,
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
          funcionarios={funcionarios}
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
