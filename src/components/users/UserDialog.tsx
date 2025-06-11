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
import { createPerson } from "../../hooks/usePeople";
import { useEmpresas } from "@/hooks/useEmpresas";
import { permission } from "process";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onSave: () => void;
}

// Esquema de validação para dados do usuário
const userDataSchema = z.object({
  username: z.string().email({ message: "Email inválido" }),
  role: z.enum(["admin", "manager", "employee", "user"], {
    errorMap: () => ({ message: "Selecione um tipo de usuário" }),
  }),
  status: z.enum(["active", "inactive"], {
    errorMap: () => ({ message: "Selecione um status" }),
  }),
  companyId: z.coerce.number().optional(),
});

// Esquema de validação para dados pessoais
const personalDataSchema = z.object({
  name: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  cpf: z.string().min(11, { message: "CPF inválido" }).max(14),
  phoneNumber: z.string().min(10, { message: "Telefone inválido" }),
  address: z.string().min(5, { message: "Endereço inválido" }),
  city: z.string().min(2, { message: "Cidade inválida" }),
  state: z.string().min(2, { message: "Estado inválido" }),
  cep: z.string().min(8, { message: "CEP inválido" }),
  addressNumber: z.string().min(1, { message: "Número é obrigatório" }),
  birthDate: z.string().min(10, { message: "Data de Nascimento inválida" }),
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

  const [empresas, setEmpresas] = useState<{ id: number; nome: string }[]>([]);
  const [showEmpresaSelect, setShowEmpresaSelect] = useState(false);

  // Recuperando informações do usuário logado
  const usuarioLogado = JSON.parse(localStorage.getItem("user") || "{}");
  const usuarioRole = usuarioLogado?.role || "";
  const usuarioEmpresaId = String(usuarioLogado?.empresaId) || "";

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      userData: {
        username: "",
        role: "user",
        status: "active",
        companyId: null,
      },
      personalData: {
        name: "",
        cpf: "",
        phoneNumber: "",
        address: "",
        city: "",
        state: "",
        cep: "",
        addressNumber: "",
        birthDate: "",
      },
    },
  });

  useEffect(() => {
    if (user) {
      console.log("User for editing:", user);
      console.log("User role:", user.permission);
      // Ensure the role matches one of the expected enum valuesalues without type mismatch
      const normalizedRole =
        user.permission === "manager"
          ? "manager"
          : user.permission === "admin"
          ? "admin"
          : user.permission === "employee"
          ? "employee"
          : "user";

      form.reset({
        userData: {
          username: user.username,
          role: normalizedRole,
          status: user.status,
          companyId: user.companyId ? +user.companyId.id : undefined,
        },
        personalData: {
          name: user.name,
          cpf: user.person.cpf || "",
          phoneNumber: user.person.phoneNumber || "",
          address: user.person.address || "",
          city: user.person.city || "",
          state: user.person.state || "",
          cep: user.person.cep || "",
          addressNumber: user.person.addressNumber || "",
          birthDate: user.person.birthDate || "",
        },
      });
    } else {
      form.reset({
        userData: {
          username: "",
          role: "user",
          status: "active",
        },
        personalData: {
          name: "",
          cpf: "",
          phoneNumber: "",
          address: "",
          city: "",
          state: "",
          cep: "",
          addressNumber: "",
          birthDate: "",
        },
      });
    }
  }, [user, form]);

  const roleSelecionado = form.watch("userData.role");

  // Lógica para exibir o select de empresa
  useEffect(() => {
    console.log("Role selecionado:", roleSelecionado);
    if (usuarioRole === "admin") {
      setShowEmpresaSelect(
        roleSelecionado === "manager" || roleSelecionado === "employee"
      );
    } else if (usuarioRole === "manager") {
      setShowEmpresaSelect(false); // Empresário não escolhe a empresa, ela é fixada
      if (usuarioEmpresaId && roleSelecionado !== "user") {
        form.setValue("userData.companyId", +usuarioEmpresaId); // Define automaticamente a empresa
      } else {
        form.setValue("userData.companyId", null);
      }
    } else {
      setShowEmpresaSelect(false);
    }
  }, [roleSelecionado]);

  const { empresas: empresasData, isLoadingEmpresas } = useEmpresas();

  // Buscar empresas da API caso necessário
  useEffect(() => {
    if (showEmpresaSelect) {
      setEmpresas((empresasData || []).map(e => ({ id: e.id, nome: e.name || "" })));
    }
  }, [showEmpresaSelect, empresasData]);

  const onSubmit = async (values: UserFormValues) => {
    try {

      console.log("Valores do formulário:", values);

      const statusMap = {
        active: "active",
        inactive: "inactive",
      };

      const status = statusMap[values.userData.status] || "active";
      const empresaId = values.userData.companyId
        ? Number(values.userData.companyId)
        : undefined;

      const payload: any = {
        username: values.userData.username,
        password: "Senha@123", // senha padrão
        permission: values.userData.role as UserPermission,
        status,
        companyId: empresaId,
        person: {
          name: values.personalData.name,
          cpf: values.personalData.cpf,
          phoneNumber: values.personalData.phoneNumber,
          address: values.personalData.address,
          city: values.personalData.city,
          state: values.personalData.state,
          cep: values.personalData.cep,
          addressNumber: values.personalData.addressNumber,
          birthDate: values.personalData.birthDate,
        },
      };

      let response;
      let createdUserId;
      if (isEditing && user) {
        response = await updateUser(user.id, payload);
        createdUserId = user.id;
      } else {
        response = await createUser(payload);
        if (!response.ok)
          throw new Error(
            `Erro na requisição: ${response.status} - ${response.data?.message || ""}`
          );
          console.log("Usuário criado com sucesso:", response);
        createdUserId = response.data?.data?.id
        console.log("Usuário criado com ID:", createdUserId);
        // Cria a pessoa após criar o usuário
        if (createdUserId) {
          const personPayload = {
            ...values.personalData,
            userId: createdUserId,
          };
          const personResp = await createPerson(personPayload);
          if (!personResp.ok) {
            throw new Error(
              `Erro ao criar pessoa: ${personResp.status} - ${personResp.data?.message || ""}`
            );
          }
        }
      }

      if (onSave) onSave();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
    }
  };

  // Log para depuração do select de empresa
  console.log({ usuarioRole, roleSelecionado, showEmpresaSelect, empresas });

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
                  name="userData.username"
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
                            {usuarioRole !== "manager" && (
                              <SelectItem value="admin">
                                Administrador
                              </SelectItem>
                            )}
                            <SelectItem value="manager">Empresa</SelectItem>
                            <SelectItem value="employee">
                              Funcionário
                            </SelectItem>
                            <SelectItem value="user">Cliente</SelectItem>
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
                    name="userData.companyId"
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

                {/* Linha com Data de Nascimento, CPF e Telefone */}
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="personalData.birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    name="personalData.phoneNumber"
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

                {/* Linha com Endereço e Número */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="personalData.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, complemento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personalData.addressNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="Número" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="personalData.city"
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
                    name="personalData.state"
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
