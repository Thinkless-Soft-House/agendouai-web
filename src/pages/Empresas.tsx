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
import axios from "axios";
import { log } from "console";

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

  const categoriaMap = {
    Advogado: "Advogado",
    Dentista: "Dentista",
    Coworking: "Coworking",
    Saude: "Saude",
    "Prestação de Serviços": "Prestação de Serviços",
  };

  const fetchEmpresas = async (): Promise<Empresa[]> => {
    try {
      const response = await axios.get<{ data: any[] }>(
        "http://localhost:3000/empresa"
      );
      // console.log("Response", response.data.data);

      return response.data.data.map((empresa) => ({
        id: String(empresa.id),
        nome: empresa.nome || "Nome Não Informado",
        cnpj: empresa.cpfCnpj || "00.000.000/0000-00",
        categoriaId: empresa.categoria?.id ? String(empresa.categoria.id) : "", // Convertendo para string
        categoriaNome: empresa.categoria?.descricao || "Sem categoria",
        endereco: empresa.endereco || "Endereço não informado",
        telefone: empresa.telefone || "Telefone não informado",
        email: empresa.email || "Email não informado",
        status: empresa.status || "inactive",
        criadoEm: empresa.criadoEm || new Date().toISOString(),

        // Campos adicionais se existirem na API
        assinaturaStatus: empresa.assinaturaStatus || "trial",
        plano: empresa.plano || "basic",
        dataVencimento: empresa.dataVencimento || null,
        totalClientes: empresa.totalClientes || 0,
        totalAgendamentos: empresa.totalAgendamentos || 0,
        totalReceitaMes: empresa.totalReceitaMes || 0,
        utilizacaoStorage: empresa.utilizacaoStorage || 0,
        ultimoAcesso: empresa.ultimoAcesso || null,
        inadimplente: empresa.inadimplente || true,
        diasInadimplente: empresa.diasInadimplente || 0,
        disponibilidadePadrao: empresa.disponibilidadePadrao || null,
      }));
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      throw new Error(
        "Falha ao carregar empresas. Tente novamente mais tarde."
      );
    }
  };

  const {
    data: empresas = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["empresas"],
    queryFn: fetchEmpresas,
  });

  // Estatísticas gerais
  const estatisticas = {
    totalEmpresas: empresas.length,
    empresasAtivas: empresas.filter((e) => e.status === "active").length,
    totalFaturamento: empresas.reduce(
      (acc, empresa) => acc + (empresa.totalReceitaMes || 0),
      0
    ),
    empresasInadimplentes: empresas.filter((e) => e.inadimplente).length,
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
      description: empresaToEdit
        ? "Empresa atualizada com sucesso."
        : "Empresa criada com sucesso.",
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
              value: `${Math.round(
                (estatisticas.empresasAtivas / estatisticas.totalEmpresas) * 100
              )}%`,
              positive: true,
            }}
          />
          {/* <StatCard
            title="Faturamento Total"
            value={`R$ ${(estatisticas.totalFaturamento / 1000).toFixed(1)}k`}
            icon={CreditCard}
            change={{ value: "12%", positive: true }}
          /> */}
          <StatCard
            title="Faturamento Total"
            value={`Em breve`}
            icon={CreditCard}
          />
          <StatCard
            title="Inadimplentes"
            value={estatisticas.empresasInadimplentes}
            icon={AlertCircle}
            change={{
              value: `${Math.round(
                (estatisticas.empresasInadimplentes /
                  estatisticas.totalEmpresas) *
                  100
              )}%`,
              positive: false,
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
