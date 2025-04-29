import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { AgendamentoFormValues } from "./schema";
import { Empresa } from "@/pages/Empresas";
import { Particao } from "@/pages/Particoes";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/hooks/useUsers";
import { Loader2 } from "lucide-react";

interface InfoTabProps {
  form: UseFormReturn<AgendamentoFormValues>;
  isEditing: boolean;
  empresas: Empresa[];
  particoes: Particao[];
  horariosDisponiveis: string[];
  handleHorarioInicioChange: (value: string) => void;
  isAdmin?: boolean;
  users: User[];
  handleUserSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUserSelect: (userId: number) => void;
  searchTerm: string;
  loadingUsers?: boolean;
  selectedUser?: User | null;
}

export function InfoTab({
  form,
  isEditing,
  empresas,
  particoes,
  horariosDisponiveis,
  handleHorarioInicioChange,
  isAdmin = false,
  users,
  handleUserSearch,
  handleUserSelect,
  searchTerm,
  loadingUsers = false,
  selectedUser,
}: InfoTabProps) {
  // Add console logs to see what's coming in
  console.log('InfoTab - searchTerm:', searchTerm);
  console.log('InfoTab - users received:', users);
  console.log('InfoTab - selectedUser:', selectedUser);
  
  return (
    <div className="space-y-4">
      {/* Cliente (User) Search */}
      <div className="space-y-2">
        <FormLabel>Nome do Cliente</FormLabel>
        <div className="relative">
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => {
              console.log('Search input changed:', e.target.value);
              handleUserSearch(e);
            }}
          />
          {/* Only show dropdown if searching (not when user is selected) */}
          {searchTerm && !selectedUser && (
            <Card className="absolute z-10 w-full mt-1">
              <CardContent className="p-1">
                {loadingUsers ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Buscando clientes...</span>
                  </div>
                ) : users.length > 0 ? (
                  <ul className="max-h-60 overflow-auto">
                    {users.map((user) => {
                      console.log('Rendering user:', user);
                      return (
                        <li
                          key={user.id}
                          className="p-2 hover:bg-slate-100 cursor-pointer"
                          onClick={() => handleUserSelect(user.id)}
                        >
                          {user.name}
                          <div className="text-xs text-gray-500">
                            ID: {user.id} • Permissão: {user.permissionId}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="p-2 text-center text-muted-foreground">
                    Nenhum cliente encontrado
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Only show empresa field for admin users */}
      {isAdmin && (
        <FormField
          control={form.control}
          name="empresaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa</FormLabel>
              <Select
                disabled={isEditing}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id.toString()}>
                      {empresa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="particaoId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sala</FormLabel>
            <Select
              disabled={isEditing}
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma sala" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {particoes.map((particao) => (
                  <SelectItem key={particao.id} value={particao.id.toString()}>
                    {particao.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="observacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Observações adicionais sobre o agendamento"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
