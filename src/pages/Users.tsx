
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { UserTable } from "@/components/users/UserTable";
import { UserDialog } from "@/components/users/UserDialog";
import { Button } from "@/components/ui/button";
import { UserDeleteDialog } from "@/components/users/UserDeleteDialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Tipo para representar um usuário
export type User = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Empresa" | "Funcionario" | "Cliente";
  status: "active" | "inactive";
  lastLogin?: string;
  // Campos adicionais para a entidade Pessoa
  cpf?: string;
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

  // Simulação de dados de usuários
  const fetchUsers = async (): Promise<User[]> => {
    // Simular uma chamada de API
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: `user-${i + 1}`,
      name: `Usuário ${i + 1}`,
      email: `usuario${i + 1}@example.com`,
      role: i % 4 === 0 ? "Admin" : i % 4 === 1 ? "Empresa" : i % 4 === 2 ? "Funcionario" : "Cliente",
      status: i % 4 === 0 ? "inactive" : "active",
      lastLogin: i % 5 !== 0 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      cpf: `123.456.789-${i % 2 === 0 ? "00" : "11"}`,
      telefone: `1199999999${i}`,
      endereco: `Rua Teste, ${i} - ${i % 2 === 0 ? "Bairro A" : "Bairro B"}`,
      cidade: `Cidade ${i % 2 === 0 ? "A" : "B"}`,
      estado: `Estado ${i % 2 === 0 ? "SP" : "RJ"}`,
      cep: `00000-00${i % 2 === 0 ? "0" : "1"}`,
    }));
  };

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

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
      description: userToEdit ? "Usuário atualizado com sucesso." : "Usuário criado com sucesso.",
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
