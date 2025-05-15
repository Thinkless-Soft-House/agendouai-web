import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { log } from "console";
import { createUser, updateUser, User, UserPermission } from "@/hooks/useUsers";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onSave: () => void;
}

// Esquema de validação para dados do usuário
const userDataSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  role: z.enum(["Administrador", "Empresa", "Funcionário", "Cliente"], {
    errorMap: () => ({ message: "Selecione um tipo de usuário" }),
  }),
  status: z.enum(["active", "inactive"], {
    errorMap: () => ({ message: "Selecione um status" }),
  }),
  empresaId: z.coerce.number().optional(),
});

// Esquema de validação para dados pessoais
const personalDataSchema = z.object({
  name: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  cpf: z.string().min(11, { message: "CPF inválido" }).max(14),
  telefone: z.string().min(10, { message: "Telefone inválido" }),
  endereco: z.string().min(5, { message: "Endereço inválido" }),
  cidade: z.string().min(2, { message: "Cidade inválida" }),
  estado: z.string().min(2, { message: "Estado inválido" }),
  cep: z.string().min(8, { message: "CEP inválido" }),
});

// Combinando os esquemas
const userSchema = z.object({
  userData: userDataSchema,
  personalData: personalDataSchema,
});

type UserFormValues = z.infer<typeof userSchema>;

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSave,
}: UserDialogProps) {
  const isEditing = !!user;
  const [activeTab, setActiveTab] = useState<string>("userData");

  const [empresas, setEmpresas] = useState<{ id: string; nome: string }[]>([]);
  const [showEmpresaSelect, setShowEmpresaSelect] = useState(false);

  // Recuperando informações do usuário logado
  const usuarioLogado = JSON.parse(localStorage.getItem("authToken") || "{}");
  const usuarioRole = usuarioLogado?.permissao?.descricao || "";
  const usuarioEmpresaId = String(usuarioLogado?.empresaId) || "";

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      userData: {
        email: "",
        role: "Cliente",
        status: "active",
        empresaId: null,
      },
      personalData: {
        name: "",
        cpf: "",
        telefone: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
      },
    },
  });

  useEffect(() => {
    if (user) {
      console.log("User for editing:", user);
      // Ensure the role matches one of the expected enum valuesalues without type mismatch
      const normalizedRole =
        user.role === "Empresa"
          ? "Empresa"
          : user.role === "Administrador"
          ? "Administrador"
          : user.role === "Funcionário"
          ? "Funcionário"
          : "Cliente";

      form.reset({
        userData: {
          email: user.email,
          role: normalizedRole,
          status: user.status,
          empresaId: user.empresaId ? +user.empresaId.id : undefined,
        },
        personalData: {
          name: user.nome,
          cpf: user.cpf || "",
          telefone: user.telefone || "",
          endereco: user.endereco || "",
          cidade: user.cidade || "",
          estado: user.estado || "",
          cep: user.cep || "",
        },
      });
    } else {
      form.reset({
        userData: {
          email: "",
          role: "Cliente",
          status: "active",
        },
        personalData: {
          name: "",
          cpf: "",
          telefone: "",
          endereco: "",
          cidade: "",
          estado: "",
          cep: "",
        },
      });
    }
  }, [user, form]);

  // Lógica para exibir o select de empresa
  useEffect(() => {
    const roleSelecionado = form.watch("userData.role");

    if (usuarioRole === "Administrador") {
      setShowEmpresaSelect(
        roleSelecionado === "Empresa" || roleSelecionado === "Funcionário"
      );
    } else if (usuarioRole === "Empresa") {
      setShowEmpresaSelect(false); // Empresário não escolhe a empresa, ela é fixada
      if (usuarioEmpresaId && roleSelecionado !== "Cliente") {
        form.setValue("userData.empresaId", +usuarioEmpresaId); // Define automaticamente a empresa
      } else {
        form.setValue("userData.empresaId", null);
      }
    } else {
      setShowEmpresaSelect(false);
    }
  }, [form.watch("userData.role")]);

  // Buscar empresas da API caso necessário
  useEffect(() => {
    if (showEmpresaSelect) {
      // console.log("Buscando empresas");
      fetch("http://localhost:3000/empresa")
        .then((res) => res.json())
        .then((data) => setEmpresas(data.data || []))
        .catch((err) => console.error("Erro ao buscar empresas:", err));
    }
  }, [showEmpresaSelect]);

  const onSubmit = async (values: UserFormValues) => {
    try {
      // Use o enum UserPermission para mapear o valor do select para o backend
      const permissoesMap: Record<string, UserPermission> = {
        Administrador: UserPermission.ADMIN,
        Cliente: UserPermission.USER,
        Funcionário: UserPermission.EMPLOYEE,
        Empresa: UserPermission.MANAGER, // Ajuste se necessário
      };

      const statusMap = {
        active: "ativo",
        inactive: "inativo",
      };

      const permission =
        permissoesMap[values.userData.role] || UserPermission.USER;
      const status = statusMap[values.userData.status] || "ativo";
      const empresaId = values.userData.empresaId
        ? Number(values.userData.empresaId)
        : undefined;

      const payload: any = {
        username: values.userData.email,
        permission,
        status,
        companyId: empresaId,
        person: {
          name: values.personalData.name,
          cpf: values.personalData.cpf,
          phoneNumber: values.personalData.telefone,
          address: values.personalData.endereco,
          city: values.personalData.cidade,
          state: values.personalData.estado,
          cep: values.personalData.cep,
        },
      };

      let response;
      if (isEditing && user) {
        response = await updateUser(user.id, payload);
      } else {
        response = await createUser(payload);
      }

      if (!response.ok) {
        throw new Error(
          `Erro na requisição: ${response.status} - ${
            response.data?.message || ""
          }`
        );
      }

      if (onSave) onSave();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite os detalhes do usuário abaixo."
              : "Preencha os campos abaixo para criar um novo usuário."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              // console.log("Form submitted:", values);
              onSubmit(values);
            })}
            className="space-y-6 py-4"
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="userData">Dados do Sistema</TabsTrigger>
                <TabsTrigger value="personalData">Dados Pessoais</TabsTrigger>
              </TabsList>

              <TabsContent value="userData" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="userData.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@exemplo.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="userData.role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Usuário</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* Renderiza as opções com base no tipo de usuário logado */}
                            {usuarioRole !== "Empresa" && (
                              <SelectItem value="Administrador">
                                Administrador
                              </SelectItem>
                            )}
                            <SelectItem value="Empresa">Empresa</SelectItem>
                            <SelectItem value="Funcionário">
                              Funcionário
                            </SelectItem>
                            <SelectItem value="Cliente">Cliente</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="userData.status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="inactive">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Campo de Empresa (Renderizado Condicionalmente) */}
                {showEmpresaSelect && (
                  <FormField
                    control={form.control}
                    name="userData.empresaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={String(field.value)} // Converte para string
                          value={String(field.value)} // Converte para string
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma empresa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {empresas.map((empresa) => (
                              <SelectItem
                                key={empresa.id}
                                value={empresa.id.toString()}
                              >
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
              </TabsContent>

              <TabsContent value="personalData" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="personalData.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="personalData.cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="personalData.telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="personalData.endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Rua, número, complemento"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="personalData.cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="personalData.estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="Estado" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="personalData.cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input placeholder="00000-000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? "Salvar Alterações" : "Criar Usuário"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
