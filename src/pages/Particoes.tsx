import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useEspacos } from "@/hooks/useEspacos";
import Empresa from "./Empresas";
import { EspacoTable } from "@/components/particoes/ParticaoTable";
import { EspacoDialog } from "@/components/particoes/ParticaoDialog";
import { EspacoDeleteDialog } from "@/components/particoes/ParticaoDeleteDialog";
import { QrCodeDialog } from "@/components/particoes/QrCodeDialog";
import axios from "axios";
import { log } from "console";

interface ResponsavelApi {
  id: number;
  salaId: number;
  usuarioId: number;
}

// Interface para responsável enriquecido
interface ResponsavelEnriquecido extends ResponsavelApi {
  usuario?: any; // Ou defina um tipo mais específico para usuário
}

// Interface para disponibilidade da API
interface Disponibilidade {
  id: number;
  diaSemana: string;
  diaSemanaIndex?: number;
  ativo: boolean;
  hrAbertura: string; // Nome usado pela API
  hrFim: string;      // Nome usado pela API
  inicio?: string;    // Alias para compatibilidade
  fim?: string;       // Alias para compatibilidade
  salaId?: number;
  minDiasCan?: number;
  intervaloMinutos?: number;
}

// Tipos
export type Espaco = {
  id: number;
  name: string;
  companyId: number;
  companyName?: string;
  status: 'active' | 'inactive';
  multipleBookings: boolean;
  photoUrl?: string | null;
  createdBy: number;
  updatedBy: number;
  // Relationships
  spaceManagers?: any[];
  availabilities?: any[];
  // Compatibilidade antiga
  descricao?: string;
  // Para QRCode e UI
  [key: string]: any;
};

export type Funcionario = {
  id: string;
  nome: string;
  email: string;
  empresaId: string;
  role: "admin" | "manager" | "employee" | "user";
};

const Espacos = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [espacoToEdit, setEspacoToEdit] = useState<Espaco | null>(null);
  const [espacoToDelete, setEspacoToDelete] = useState<Espaco | null>(null);
  const [qrCodeEspaco, setQrCodeEspaco] = useState<Espaco | null>(null);
  const [qrCodeType, setQrCodeType] = useState<"empresa" | "espaco">("empresa");
  const { toast } = useToast();

  // Usando o hook useEmpresas
  const { empresas, isLoading: isLoadingEmpresas } = useEmpresas();
  // Centraliza busca de espaços e funcionários
  const { espacos = [], isLoadingEspacos, funcionarios = [], isLoadingFuncionarios } = useEspacos(empresas[0]?.id ? String(empresas[0].id) : "");

  const handleCreateEspaco = () => setOpenCreateDialog(true);
  const handleEditEspaco = (espaco: Espaco) => setEspacoToEdit(espaco);
  const handleDeleteEspaco = (espaco: Espaco) => setEspacoToDelete(espaco);

  const handleGenerateQrCode = (espaco: Espaco, type: "empresa" | "espaco") => {
    setQrCodeEspaco(espaco);
    setQrCodeType(type);
  };

  const handleEspacoSaved = () => {
    window.location.reload(); // Força reload para garantir atualização dos dados
    toast({
      title: "Sucesso",
      description: espacoToEdit ? "Espaço atualizado com sucesso." : "Espaço criado com sucesso.",
    });
    setEspacoToEdit(null);
    setOpenCreateDialog(false);
  };
  const handleEspacoDeleted = () => {
    window.location.reload();
    toast({
      title: "Sucesso",
      description: "Espaço excluído com sucesso.",
      variant: "destructive",
    });
    setEspacoToDelete(null);
  };

  const getBaseUrl = () => window.location.origin;

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Espaços</h1>
          <Button onClick={handleCreateEspaco}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Espaço
          </Button>
        </div>
        <EspacoTable
          espacos={espacos}
          isLoading={isLoadingEspacos}
          onEdit={handleEditEspaco}
          onDelete={handleDeleteEspaco}
          onGenerateQrCode={handleGenerateQrCode}
          funcionarios={funcionarios}
          isLoadingFuncionarios={isLoadingFuncionarios}
        />
        <EspacoDialog
          open={openCreateDialog || espacoToEdit !== null}
          onOpenChange={(open) => {
            if (!open) {
              setEspacoToEdit(null);
              setOpenCreateDialog(false);
            }
          }}
          espaco={espacoToEdit}
          empresas={empresas}
          funcionarios={funcionarios}
          onSave={handleEspacoSaved}
        />
        <EspacoDeleteDialog
          open={espacoToDelete !== null}
          onOpenChange={(open) => {
            if (!open) setEspacoToDelete(null);
          }}
          espaco={espacoToDelete}
          onDelete={handleEspacoDeleted}
        />
        <QrCodeDialog
          open={qrCodeEspaco !== null}
          onOpenChange={(open) => {
            if (!open) setQrCodeEspaco(null);
          }}
          espaco={qrCodeEspaco}
          qrCodeType={qrCodeType}
          baseUrl={getBaseUrl()}
        />
      </div>
    </DashboardLayout>
  );
};

export default Espacos;
