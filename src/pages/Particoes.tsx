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
import axios from "axios";

// Tipo para representar uma partição
export type Particao = {
  id: string;
  nome: string;
  empresaId: string;
  empresaNome: string;
  descricao: string;
  disponivel: boolean;
  criadoEm: string;
  // campos de categoria apenas para compatibilidade
  categoriaId?: string;
  categoriaNome?: string;
  responsaveis?: string[];
  disponibilidade?: {
    segunda: { ativo: boolean; inicio: string; fim: string };
    terca: { ativo: boolean; inicio: string; fim: string };
    quarta: { ativo: boolean; inicio: string; fim: string };
    quinta: { ativo: boolean; inicio: string; fim: string };
    sexta: { ativo: boolean; inicio: string; fim: string };
    sabado: { ativo: boolean; inicio: string; fim: string };
    domingo: { ativo: boolean; inicio: string; fim: string };
  };
  excecoes?: {
    abrir: { data: string; inicio: string; fim: string }[];
    fechar: { data: string }[];
  };
  status: number;
};

// Tipo para representar um funcionário
export type Funcionario = {
  id: string;
  nome: string;
  email: string;
  empresaId: string;
  role: "Admin" | "Empresa" | "Funcionario" | "Cliente";
};

const Particoes = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [particaoToEdit, setParticaoToEdit] = useState<Particao | null>(null);
  const [particaoToDelete, setParticaoToDelete] = useState<Particao | null>(
    null
  );
  const { toast } = useToast();

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

  const fetchFuncionarios = async(): Promise<Funcionario[]> => {
    try {
      const usuarioLogado = JSON.parse(
        localStorage.getItem("authToken") || "{}"
      );
      const usuarioRole = usuarioLogado?.permissao?.descricao || "";
      const usuarioEmpresaId = usuarioLogado?.empresaId || "";

      if (usuarioRole === "Administrador") {
        const response = await axios.get<{ data: { data: any[] } }>(
          "http://localhost:3000/usuario/permissao/4"
        );
      
        // console.log("Response [FUNCIONARIOS PARTICOES]:", response.data);
      
        // Acesse response.data.data.data para obter a lista de usuários
        return response.data.data.data.map((user) => ({
          id: String(user.id),
          nome: user.pessoa?.nome || "Nome Não Informado", // Se não tiver, define um padrão
          email: user.login, // `login` parece ser o email
          role: user.permissao?.descricao || "Cliente",
          status: user.status === 1 ? "active" : "inactive",
          lastLogin: user.lastLogin || undefined,
          empresaId: user.empresa || "Empresa Não Informada",
          cpf: user.pessoa?.cpfCnpj || "000.000.000-00",
          telefone: user.pessoa?.telefone || "",
          endereco: user.pessoa?.endereco || "",
          cidade: user.pessoa?.municipio || "",
          estado: user.pessoa?.estado || "",
          cep: user.pessoa?.cep || "",
        }));
      } else if (usuarioRole === "Empresario") {
        const response = await axios.get<{ data: { data: any[] } }>(
          "http://localhost:3000/usuario/empresa/" + usuarioEmpresaId
        );
      
        // Acesse response.data.data.data para obter a lista de usuários
        const users = response.data.data.data;
        // console.log("Users:", users);

        // Filtrar apenas os usuários com permissão de id = 4 (funcionários)
        const funcionarios = users.filter((user) => user.permissao?.id === 4);
      
        return funcionarios.map((user) => ({
          id: String(user.id),
          nome: user.pessoa?.nome || "Nome Não Informado", // Se não tiver, define um padrão
          email: user.login, // `login` parece ser o email
          role: user.permissao?.descricao || "Cliente",
          status: user.status === 1 ? "active" : "inactive",
          lastLogin: user.lastLogin || undefined,
          empresaId: user.empresa || "Empresa Não Informada",
          cpf: user.pessoa?.cpfCnpj || "000.000.000-00",
          telefone: user.pessoa?.telefone || "",
          endereco: user.pessoa?.endereco || "",
          cidade: user.pessoa?.municipio || "",
          estado: user.pessoa?.estado || "",
          cep: user.pessoa?.cep || "",
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error("Erro ao buscar funcionarios:", error);
      throw new Error(
        "Falha ao carregar usuários. Tente novamente mais tarde."
      );
    }
  }

  const fetchParticoes = async (): Promise<Particao[]> => {
    try {
      const usuarioLogado = JSON.parse(
        localStorage.getItem("authToken") || "{}"
      );
      // console.log("Usuario Logado:", usuarioLogado);

      const usuarioRole = usuarioLogado?.permissao?.descricao || "";
      // console.log("Usuario Role:", usuarioRole);

      const usuarioEmpresaId = usuarioLogado?.empresaId || "";
      // console.log("Usuario Empresa ID:", usuarioEmpresaId);

      if (usuarioRole === "Administrador") {
        const response = await axios.get<{ data: any[] }>(
          "http://localhost:3000/sala"
        );
        // console.log("Response [PARTICOES]:", response.data.data);
  
        // Acesse response.data.data para obter a lista de usuários
        return response.data.data
      } else if (usuarioRole === "Empresario") {
        const response = await axios.get<{ data: { data: any[] } }>(
          "http://localhost:3000/sala/empresa/" + usuarioEmpresaId
        );
        // console.log("Response [PARTICOES COMPANY]:", response.data);
  
        return response.data.data.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      throw new Error(
        "Falha ao carregar usuários. Tente novamente mais tarde."
      );
    }
  };
  const {
    data: particoes = [],
    isLoading,
    refetch,
  } = useQuery({
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
