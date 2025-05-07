import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ParticaoTable } from "@/components/particoes/ParticaoTable";
import { ParticaoDialog } from "@/components/particoes/ParticaoDialog";
import { Button } from "@/components/ui/button";
import { ParticaoDeleteDialog } from "@/components/particoes/ParticaoDeleteDialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEmpresas } from "@/hooks/useEmpresas"; // Ajuste o caminho conforme sua estrutura
import { useResponsaveis } from "@/hooks/useResponsaveis"; // Import the new hook
import { Empresa } from "./Empresas";
import axios from "axios";
import { log } from "console";
import { QrCodeDialog } from "@/components/particoes/QrCodeDialog";

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
export type Particao = {
  id: number;
  nome: string;
  empresaId: number;
  empresaNome: string;
  descricao?: string;
  status: number;
  criadoEm?: string;
  disponivel?: boolean;
  foto?: string | null;
  multiplasMarcacoes?: boolean;
  
  // Campos para responsáveis - diferentes formatos
  responsaveis?: string[]; // Formato antigo - array de IDs
  responsavel?: ResponsavelApi[]; // Formato da API - array de objetos
  responsaveisDaParticao?: ResponsavelEnriquecido[]; // Responsáveis enriquecidos com dados de usuário
  
  // Campo para disponibilidades
  disponibilidades?: Disponibilidade[];
  
  // Campos de categoria apenas para compatibilidade
  categoriaId?: string;
  categoriaNome?: string;
  
  // Campos para exceções
  excecoes?: {
    abrir: { data: string; inicio: string; fim: string }[];
    fechar: { data: string }[];
  };
};

export type Funcionario = {
  id: string;
  nome: string;
  email: string;
  empresaId: string;
  role: "Admin" | "Empresa" | "Funcionário" | "Cliente";
};

const Particoes = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [particaoToEdit, setParticaoToEdit] = useState<Particao | null>(null);
  const [particaoToDelete, setParticaoToDelete] = useState<Particao | null>(
    null
  );
  const [qrCodeParticao, setQrCodeParticao] = useState<Particao | null>(null);
  const [qrCodeType, setQrCodeType] = useState<"empresa" | "particao">("empresa");
  const { toast } = useToast();

  // Usando o hook useEmpresas
  const { empresas, isLoadingEmpresas: isLoadingEmpresas } = useEmpresas();
  const { responsaveis, isLoadingResponsaveis: isLoadingResponsaveis } = useResponsaveis();

  const fetchFuncionarios = async (): Promise<Funcionario[]> => {
    try {
      const usuarioLogado = JSON.parse(
        localStorage.getItem("authToken") || "{}"
      );
      const usuarioRole = usuarioLogado?.permissao?.descricao || "";
      const usuarioEmpresaId = usuarioLogado?.empresaId || "";

      if (usuarioRole === "Administrador") {
        const response = await axios.get<{ data: { data: any[] } }>(
          "http://localhost:3000/usuario/permissao/3"
        );
        return response.data.data.data.map((user) => ({
          id: String(user.id),
          nome: user.pessoa?.nome || "Nome Não Informado",
          email: user.login,
          role: user.permissao?.descricao || "Cliente",
          empresaId: user.empresa || "Empresa Não Informada",
        }));
      } else if (usuarioRole === "Empresa") {
        const response = await axios.get<{ data: { data: any[] } }>(
          `http://localhost:3000/usuario/empresa/${usuarioEmpresaId}`
        );

        // console.log("Response [FUNCIONARIOS PARTICOES]:", response.data);

        const funcionarios = response.data.data.data.filter(
          (user) => user.permissao?.id === 3
        );

        return funcionarios.map((user) => ({
          id: String(user.id),
          nome: user.pessoa?.nome || "Nome Não Informado",
          email: user.login,
          role: user.permissao?.descricao || "Cliente",
          empresaId: user.empresa || "Empresa Não Informada",
        }));
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar funcionarios:", error);
      throw new Error(
        "Falha ao carregar usuários. Tente novamente mais tarde."
      );
    }
  };

  const fetchParticoes = async (): Promise<Particao[]> => {
    try {
      const usuarioLogado = JSON.parse(
        localStorage.getItem("authToken") || "{}"
      );
      const usuarioRole = usuarioLogado?.permissao?.descricao || "";
      const usuarioEmpresaId = usuarioLogado?.empresaId || "";

      if (usuarioRole === "Administrador") {
        const response = await axios.get<{ data: any[] }>(
          "http://localhost:3000/sala"
        );
        return response.data.data;
      } else if (usuarioRole === "Empresa") {
        const response = await axios.get<{ data: { data: any[] } }>(
          `http://localhost:3000/sala/empresa/${usuarioEmpresaId}`
        );

        console.log("Response [PARTICOES COMPANY]:", response.data);

        return response.data.data.data.map((particao) => ({
          id: particao.id,
          nome: particao.nome,
          empresaId: particao.empresaId,
          empresaNome: particao.empresaNome,
          descricao: particao.descricao,
          disponivel: particao.disponivel,
          criadoEm: particao.criadoEm,
          status: particao.status,
          foto: particao.foto,
          multiplasMarcacoes: particao.multiplasMarcacoes,
          disponibilidades: particao.disponibilidades,
          responsavel: particao.responsavel,
        }));
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar partições:", error);
      throw new Error(
        "Falha ao carregar partições. Tente novamente mais tarde."
      );
    }
  };

  const {
    data: particoes = [],
    isLoading: isLoadingParticoes,
    refetch,
  } = useQuery({
    queryKey: ["particoes"],
    queryFn: fetchParticoes,
  });

  const { data: funcionarios = [], isLoading: isLoadingFuncionarios } =
    useQuery({
      queryKey: ["funcionarios"],
      queryFn: fetchFuncionarios,
    });

  const handleCreateParticao = () => setOpenCreateDialog(true);
  const handleEditParticao = (particao: Particao) => {
    console.log("Partição selecionada para edição:", particao);
    console.log("Disponibilidades:", particao.disponibilidades);
    console.log("Responsáveis:", particao.responsaveis);
    setParticaoToEdit(particao);
  };
  const handleDeleteParticao = (particao: Particao) =>
    setParticaoToDelete(particao);

  const handleGenerateQrCode = (particao: Particao, type: "empresa" | "particao") => {
    setQrCodeParticao(particao);
    setQrCodeType(type);
  };

  const handleParticaoSaved = () => {
    refetch();
    toast({
      title: "Sucesso",
      description: particaoToEdit
        ? "Partição atualizada com sucesso."
        : "Partição criada com sucesso.",
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

  const getBaseUrl = () => {
    return window.location.origin;
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
          isLoading={isLoadingParticoes}
          onEdit={handleEditParticao}
          onDelete={handleDeleteParticao}
          onGenerateQrCode={handleGenerateQrCode}
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

        <QrCodeDialog
          open={qrCodeParticao !== null}
          onOpenChange={(open) => {
            if (!open) setQrCodeParticao(null);
          }}
          particao={qrCodeParticao}
          qrCodeType={qrCodeType}
          baseUrl={getBaseUrl()}
        />
      </div>
    </DashboardLayout>
  );
};

export default Particoes;
