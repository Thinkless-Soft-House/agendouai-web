import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import UserTable from "@/components/users/UserTable";
import { UserDialog } from "@/components/users/UserDialog";
import { Button } from "@/components/ui/button";
import { UserDeleteDialog } from "@/components/users/UserDeleteDialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchUsers, User } from "@/hooks/useUsers";

const Users = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();

  // Carrega os usuários usando o hook fetchUsers do useUsers.ts
  const {
    data: users = [],
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers(),
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

        {/* Passa os usuários carregados para a tabela */}
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
