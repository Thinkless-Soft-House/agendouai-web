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
import { getApiEndpoint } from "@/lib/api";

interface Empresa {
  id: number;
  nome: string;
}

// Tipo para representar um usuário
export type User = {
  id: string;
  nome: string;
  email: string;
  role: "Administrador" | "Empresa" | "Funcionário" | "Cliente";
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
      // console.log("Usuario Logado:", usuarioLogado);
  
      const usuarioRole = usuarioLogado?.permissao?.descricao || "";
      // console.log("Usuario Role:", usuarioRole);
  
      const usuarioEmpresaId = usuarioLogado?.empresaId || "";
      // console.log("Usuario Empresa ID:", usuarioEmpresaId);
  
      if (usuarioRole === "Administrador") {
        const response = await axios.get<{ data: any[] }>(
          getApiEndpoint("usuario")
        );
        
        // Normalize role values to match the expected enum values
        return response.data.data.map((user) => {
          // Ensure the role exactly matches one of the expected enum values
          let role = user.permissao?.descricao || "Cliente";
          
          // Normalize role to ensure it matches the enum type
          if (role !== "Administrador" && role !== "Empresa" && 
              role !== "Funcionário" && role !== "Cliente") {
            // Map any unexpected values to the closest match
            if (role === "Empresario") role = "Empresa";
            else role = "Cliente"; // Default fallback
          }
          
          return {
            id: String(user.id),
            nome: user.pessoa?.nome || "Nome Não Informado",
            email: user.login,
            role: role,
            status: user.status === 1 ? "active" : "inactive",
            lastLogin: user.lastLogin || undefined,
            empresaId: user.empresa || "Empresa Não Informada",
            cpf: user.pessoa?.cpfCnpj || "000.000.000-00",
            telefone: user.pessoa?.telefone || "",
            endereco: user.pessoa?.endereco || "",
            cidade: user.pessoa?.municipio || "",
            estado: user.pessoa?.estado || "",
            cep: user.pessoa?.cep || "",
          };
        });
      } else if (usuarioRole === "Empresa") {
        const response = await axios.get<{ data: { data: any[] } }>(
          getApiEndpoint(`usuario/empresa/${usuarioEmpresaId}`)
        );
        
        const users = response.data.data.data;
        return users.map((user) => {
          // Same normalization logic for role
          console.log("User:", user.permissao.descricao);

          let role = user.permissao?.descricao || "Cliente";
          
          if (role !== "Administrador" && role !== "Empresa" && 
              role !== "Funcionário" && role !== "Cliente") {
            if (role === "Empresario") role = "Empresa";
            else role = "Cliente";
          }
          
          return {
            id: String(user.id),
            nome: user.pessoa?.nome || "Nome Não Informado",
            email: user.login,
            role: role,
            status: user.status === 1 ? "active" : "inactive",
            lastLogin: user.lastLogin || undefined,
            empresaId: user.empresa || "Empresa Não Informada",
            cpf: user.pessoa?.cpfCnpj || "000.000.000-00",
            telefone: user.pessoa?.telefone || "",
            endereco: user.pessoa?.endereco || "",
            cidade: user.pessoa?.municipio || "",
            estado: user.pessoa?.estado || "",
            cep: user.pessoa?.cep || "",
          };
        });
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
