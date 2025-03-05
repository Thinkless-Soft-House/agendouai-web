import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmpresaTable } from "@/components/empresas/EmpresaTable";
import { EmpresaDialog } from "@/components/empresas/EmpresaDialog";
import { Button } from "@/components/ui/button";
import { EmpresaDeleteDialog } from "@/components/empresas/EmpresaDeleteDialog";
import { Plus, Building, Users, CreditCard, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";

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
  imageUrl?: string;
  categoriaId?: string;
  categoriaNome?: string;
  
  // Adicionando novas propriedades
  assinaturaStatus?: "trial" | "active" | "expired" | "canceled";
  plano?: "basic" | "professional" | "enterprise";
  dataVencimento?: string;
  totalClientes?: number;
  totalAgendamentos?: number;
  totalReceitaMes?: number;
  utilizacaoStorage?: number;
  ultimoAcesso?: string;
  inadimplente?: boolean;
  diasInadimplente?: number;
  historicoFaturamento?: {
    mes: string;
    valor: number;
  }[];
  historicoCrescimento?: {
    mes: string;
    percentual: number;
  }[];
  
  // Nova propriedade para disponibilidade padrão
  disponibilidadePadrao?: {
    segunda: { ativo: boolean; inicio: string; fim: string };
    terca: { ativo: boolean; inicio: string; fim: string };
    quarta: { ativo: boolean; inicio: string; fim: string };
    quinta: { ativo: boolean; inicio: string; fim: string };
    sexta: { ativo: boolean; inicio: string; fim: string };
    sabado: { ativo: boolean; inicio: string; fim: string };
    domingo: { ativo: boolean; inicio: string; fim: string };
  };
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
    
    return Array.from({ length: 30 }, (_, i) => {
      const planos = ["basic", "professional", "enterprise"];
      const assinaturaStatus = ["trial", "active", "expired", "canceled"];
      const inadimplente = Math.random() > 0.8;
      
      return {
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
        
        // Novos dados
        assinaturaStatus: assinaturaStatus[i % 4] as any,
        plano: planos[i % 3] as any,
        dataVencimento: new Date(Date.now() + (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000).toISOString(),
        totalClientes: Math.floor(Math.random() * 500) + 10,
        totalAgendamentos: Math.floor(Math.random() * 2000) + 50,
        totalReceitaMes: Math.floor(Math.random() * 10000) + 1000,
        utilizacaoStorage: Math.floor(Math.random() * 95) + 5,
        ultimoAcesso: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        inadimplente,
        diasInadimplente: inadimplente ? Math.floor(Math.random() * 90) + 1 : 0,
        historicoFaturamento: Array.from({ length: 6 }, (_, j) => ({
          mes: new Date(Date.now() - j * 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 7),
          valor: Math.floor(Math.random() * 10000) + 1000
        })),
        historicoCrescimento: Array.from({ length: 6 }, (_, j) => ({
          mes: new Date(Date.now() - j * 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 7),
          percentual: Math.floor(Math.random() * 40) - 10
        })),
        disponibilidadePadrao: {
          segunda: { ativo: true, inicio: "08:00", fim: "18:00" },
          terca: { ativo: true, inicio: "08:00", fim: "18:00" },
          quarta: { ativo: true, inicio: "08:00", fim: "18:00" },
          quinta: { ativo: true, inicio: "08:00", fim: "18:00" },
          sexta: { ativo: true, inicio: "08:00", fim: "18:00" },
          sabado: { ativo: false, inicio: "", fim: "" },
          domingo: { ativo: false, inicio: "", fim: "" }
        }
      };
    });
  };

  const { data: empresas = [], isLoading, refetch } = useQuery({
    queryKey: ["empresas"],
    queryFn: fetchEmpresas,
  });

  // Estatísticas gerais
  const estatisticas = {
    totalEmpresas: empresas.length,
    empresasAtivas: empresas.filter(e => e.status === "active").length,
    totalFaturamento: empresas.reduce((acc, empresa) => acc + (empresa.totalReceitaMes || 0), 0),
    empresasInadimplentes: empresas.filter(e => e.inadimplente).length,
  };

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

        {/* Estatísticas (Big Numbers) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Empresas"
            value={estatisticas.totalEmpresas}
            icon={Building}
          />
          <StatCard
            title="Empresas Ativas"
            value={estatisticas.empresasAtivas}
            icon={Users}
            change={{ 
              value: `${Math.round((estatisticas.empresasAtivas / estatisticas.totalEmpresas) * 100)}%`, 
              positive: true 
            }}
          />
          <StatCard
            title="Faturamento Total"
            value={`R$ ${(estatisticas.totalFaturamento / 1000).toFixed(1)}k`}
            icon={CreditCard}
            change={{ value: "12%", positive: true }}
          />
          <StatCard
            title="Inadimplentes"
            value={estatisticas.empresasInadimplentes}
            icon={AlertCircle}
            change={{ 
              value: `${Math.round((estatisticas.empresasInadimplentes / estatisticas.totalEmpresas) * 100)}%`, 
              positive: false 
            }}
          />
        </div>

        {/* Tabela e filtros */}
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
