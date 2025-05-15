import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmpresaTable } from "@/components/empresas/EmpresaTable";
import { EmpresaDialog } from "@/components/empresas/EmpresaDialog";
import { Button } from "@/components/ui/button";
import { EmpresaDeleteDialog } from "@/components/empresas/EmpresaDeleteDialog";
import { Plus, Building, Users, CreditCard, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { useEmpresas, Company } from "@/hooks/useEmpresas";

const Empresas = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [empresaToEdit, setEmpresaToEdit] = useState<Company | null>(null);
  const [empresaToDelete, setEmpresaToDelete] = useState<Company | null>(null);
  const { toast } = useToast();

  const { empresas, isLoadingEmpresas, refetch } = useEmpresas();

  console.log("Empresas:", empresas);

  // const estatisticas = {
  //   totalEmpresas: empresas.length,
  //   empresasAtivas: empresas.filter((e) => e.status === "active").length,
  //   totalFaturamento: empresas.reduce(
  //     (acc, empresa) => acc + (empresa.totalReceitaMes || 0),
  //     0
  //   ),
  //   empresasInadimplentes: empresas.filter((e) => e.inadimplente).length,
  // };

  const handleCreateEmpresa = () => {
    setOpenCreateDialog(true);
  };

  const handleEditEmpresa = (empresa: Company) => {
    setEmpresaToEdit(empresa);
  };

  const handleDeleteEmpresa = (empresa: Company) => {
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
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        </div> */}

        {/* Tabela e filtros */}
        <EmpresaTable
          empresas={empresas}
          isLoadingEmpresas={isLoadingEmpresas}
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
