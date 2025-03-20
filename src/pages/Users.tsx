import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import UserTable from "@/components/users/UserTable";
import { UserDialog } from "@/components/users/UserDialog";
import { Button } from "@/components/ui/button";
import { UserDeleteDialog } from "@/components/users/UserDeleteDialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { log } from "console";

interface Empresa {
  id: number;
  nome: string;
}

// Tipo para representar um usuário
export type User = {
  id: string;
  name: string;
  email: string;
  role: "Administrador" | "Empresario" | "Funcionario" | "Cliente";
  status: "active" | "inactive";
  empresaId: Empresa;
  lastLogin?: string;
  // Campos adicionais para a entidade Pessoa
  cpf: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
};

const Users = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();

  const fetchUsers = async (): Promise<User[]> => {
    try {
      const usuarioLogado = JSON.parse(
        localStorage.getItem("authToken") || "{}"
      );
      console.log("Usuario Logado:", usuarioLogado);
  
      const usuarioRole = usuarioLogado?.permissao?.descricao || "";
      console.log("Usuario Role:", usuarioRole);
  
      const usuarioEmpresaId = usuarioLogado?.empresaId || "";
      console.log("Usuario Empresa ID:", usuarioEmpresaId);
  
      if (usuarioRole === "Administrador") {
        const response = await axios.get<{ data: any[] }>(
          "http://localhost:3000/usuario"
        );
        console.log("Response [USERS]:", response.data);
  
        // Acesse response.data.data para obter a lista de usuários
        return response.data.data.map((user) => ({
          id: String(user.id),
          name: user.pessoa?.nome || "Nome Não Informado", // Se não tiver, define um padrão
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
        console.log("Response [USERS COMPANY]:", response.data);
  
        // Acesse response.data.data.data para obter a lista de usuários
        const users = response.data.data.data;
        return users.map((user) => ({
          id: String(user.id),
          name: user.pessoa?.nome || "Nome Não Informado", // Se não tiver, define um padrão
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
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      throw new Error(
        "Falha ao carregar usuários. Tente novamente mais tarde."
      );
    }
  };

  const {
    data: users = [],
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  if (error) {
    console.error("Erro na consulta de usuários:", error);
  }

  const handleCreateUser = () => {
    setOpenCreateDialog(true);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
  };

  const handleUserSaved = () => {
    refetch();
    toast({
      title: "Sucesso",
      description: userToEdit
        ? "Usuário atualizado com sucesso."
        : "Usuário criado com sucesso.",
    });
    setUserToEdit(null);
    setOpenCreateDialog(false);
  };

  const handleUserDeleted = () => {
    refetch();
    toast({
      title: "Sucesso",
      description: "Usuário excluído com sucesso.",
      variant: "destructive",
    });
    setUserToDelete(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <Button onClick={handleCreateUser}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        <UserTable
          users={users}
          isLoading={isLoading}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />

        <UserDialog
          open={openCreateDialog || userToEdit !== null}
          onOpenChange={(open) => {
            if (!open) {
              setUserToEdit(null);
              setOpenCreateDialog(false);
            }
          }}
          user={userToEdit}
          onSave={handleUserSaved}
        />

        <UserDeleteDialog
          open={userToDelete !== null}
          onOpenChange={(open) => {
            if (!open) setUserToDelete(null);
          }}
          user={userToDelete}
          onDelete={handleUserDeleted}
        />
      </div>
    </DashboardLayout>
  );
};

export default Users;
