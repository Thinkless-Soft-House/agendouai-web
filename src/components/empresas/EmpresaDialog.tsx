import React, { useEffect } from "react";
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
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Empresa } from "@/pages/Empresas";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import axios from "axios";
import { log } from "console";

interface EmpresaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: Empresa | null;
  onSave: () => void;
}

// Esquema de validação
const empresaSchema = z.object({
  nome: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  cnpj: z.string().min(14, { message: "CNPJ inválido" }),
  endereco: z.string().min(5, { message: "Endereço muito curto" }),
  telefone: z.string().min(10, { message: "Telefone inválido" }),
  status: z.enum(["active", "inactive"], {
    errorMap: () => ({ message: "Selecione um status" }),
  }),
  categoriaId: z.string().optional(),
  plano: z
    .enum(["basic", "professional", "enterprise"], {
      errorMap: () => ({ message: "Selecione um plano" }),
    })
    .optional(),
  assinaturaStatus: z
    .enum(["trial", "active", "expired", "canceled"], {
      errorMap: () => ({ message: "Selecione um status de assinatura" }),
    })
    .optional(),
  disponibilidadePadrao: z
    .object({
      segunda: z.object({
        ativo: z.boolean().default(true),
        inicio: z.string().default("08:00"),
        fim: z.string().default("18:00"),
      }),
      terca: z.object({
        ativo: z.boolean().default(true),
        inicio: z.string().default("08:00"),
        fim: z.string().default("18:00"),
      }),
      quarta: z.object({
        ativo: z.boolean().default(true),
        inicio: z.string().default("08:00"),
        fim: z.string().default("18:00"),
      }),
      quinta: z.object({
        ativo: z.boolean().default(true),
        inicio: z.string().default("08:00"),
        fim: z.string().default("18:00"),
      }),
      sexta: z.object({
        ativo: z.boolean().default(true),
        inicio: z.string().default("08:00"),
        fim: z.string().default("18:00"),
      }),
      sabado: z.object({
        ativo: z.boolean().default(false),
        inicio: z.string().default("08:00"),
        fim: z.string().default("12:00"),
      }),
      domingo: z.object({
        ativo: z.boolean().default(false),
        inicio: z.string().default("08:00"),
        fim: z.string().default("12:00"),
      }),
    })
    .optional(),
});

type EmpresaFormValues = z.infer<typeof empresaSchema>;

// Tipo para representar uma categoria
type Categoria = {
  id: string;
  descricao: string;
};

// Horários disponíveis para seleção
const horariosDisponiveis = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

// Dias da semana formatados
const diasDaSemana = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo",
};

export function EmpresaDialog({
  open,
  onOpenChange,
  empresa,
  onSave,
}: EmpresaDialogProps) {
  const isEditing = !!empresa;
  const [activeTab, setActiveTab] = useState<string>("geral");

  const fetchCategorias = async (): Promise<Categoria[]> => {
    try {
      const response = await axios.get<{ data: Categoria[] }>(
        "http://localhost:3000/categoriaEmpresa"
      );
      console.log("Categoria da empresa", response.data.data);
      return response.data.data; // Acessando `data`
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      return [];
    }
  };

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: fetchCategorias,
  });

  const form = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nome: "",
      cnpj: "",
      endereco: "",
      telefone: "",
      status: "active",
      categoriaId: "",
      plano: "basic",
      assinaturaStatus: "active",
      disponibilidadePadrao: {
        segunda: { ativo: true, inicio: "08:00", fim: "18:00" },
        terca: { ativo: true, inicio: "08:00", fim: "18:00" },
        quarta: { ativo: true, inicio: "08:00", fim: "18:00" },
        quinta: { ativo: true, inicio: "08:00", fim: "18:00" },
        sexta: { ativo: true, inicio: "08:00", fim: "18:00" },
        sabado: { ativo: false, inicio: "08:00", fim: "12:00" },
        domingo: { ativo: false, inicio: "08:00", fim: "12:00" },
      },
    },
  });

  // Atualiza o formulário quando a empresa muda
  useEffect(() => {
    if (empresa) {
      console.log("Empresa selecionada para edição:", empresa); // Verifique os dados no console
      form.reset({
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        endereco: empresa.endereco,
        telefone: empresa.telefone,
        status: empresa.status,
        categoriaId: empresa.categoriaId ? String(empresa.categoriaId) : "",
        plano: empresa.plano || "basic",
        assinaturaStatus: empresa.assinaturaStatus || "active",
        disponibilidadePadrao: empresa.disponibilidadePadrao || {
          segunda: { ativo: true, inicio: "08:00", fim: "18:00" },
          terca: { ativo: true, inicio: "08:00", fim: "18:00" },
          quarta: { ativo: true, inicio: "08:00", fim: "18:00" },
          quinta: { ativo: true, inicio: "08:00", fim: "18:00" },
          sexta: { ativo: true, inicio: "08:00", fim: "18:00" },
          sabado: { ativo: false, inicio: "08:00", fim: "12:00" },
          domingo: { ativo: false, inicio: "08:00", fim: "12:00" },
        },
      });
    } else {
      form.reset({
        nome: "",
        cnpj: "",
        endereco: "",
        telefone: "",
        status: "active",
        categoriaId: "",
        plano: "basic",
        assinaturaStatus: "active",
        disponibilidadePadrao: {
          segunda: { ativo: true, inicio: "08:00", fim: "18:00" },
          terca: { ativo: true, inicio: "08:00", fim: "18:00" },
          quarta: { ativo: true, inicio: "08:00", fim: "18:00" },
          quinta: { ativo: true, inicio: "08:00", fim: "18:00" },
          sexta: { ativo: true, inicio: "08:00", fim: "18:00" },
          sabado: { ativo: false, inicio: "08:00", fim: "12:00" },
          domingo: { ativo: false, inicio: "08:00", fim: "12:00" },
        },
      });
    }
  }, [empresa, form]);

  const onSubmit = async (values: EmpresaFormValues) => {
    // Aqui faríamos a chamada para a API
    console.log("Form values:", values);

    if (isEditing && empresa) {
      console.log("Form values:", values);
      const cpfCnpj = values.cnpj.replace(/\D/g, "");
  
      const payload = {
        nome: values.nome,
        cpfCnpj: +cpfCnpj,
        endereco: values.endereco,
        telefone: values.telefone,
        categoriaId: +values.categoriaId,
      };

      const response = await fetch(
        `http://localhost:3000/empresa/${empresa.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
      }
    } else {
      console.log("Form values:", values);
      const cpfCnpj = values.cnpj.replace(/\D/g, "");
  
      const payload = {
        nome: values.nome,
        cpfCnpj: +cpfCnpj,
        userCreated: 1,
        endereco: values.endereco,
        telefone: values.telefone,
        status: values.status,
        categoriaId: +values.categoriaId,
        plano: values.plano,
        assinaturaStatus: values.assinaturaStatus,
        disponibilidadePadrao: values.disponibilidadePadrao,
      };

      const response = await fetch(
        `http://localhost:3000/empresa/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
      }
    }

    if (onSave) {
      onSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Empresa" : "Nova Empresa"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite os detalhes da empresa abaixo."
              : "Preencha os campos abaixo para criar uma nova empresa."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
                <TabsTrigger value="disponibilidade">
                  Disponibilidade Padrão
                </TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="space-y-6 py-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input placeholder="00.000.000/0000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefone"
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
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Rua, número, bairro, cidade - UF"
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
                    name="categoriaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value); // Atualiza o estado corretamente
                          }}
                          value={field.value} // Garante que o Select sempre mostre o valor atualizado
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue>
                                {categorias.find(
                                  (c) => String(c.id) === String(field.value)
                                )?.descricao || "Selecione uma categoria"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categorias.map((categoria) => (
                              <SelectItem
                                key={categoria.id}
                                value={String(categoria.id)}
                              >
                                {categoria.descricao}
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
                    name="status"
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
                            <SelectItem value="active">Ativa</SelectItem>
                            <SelectItem value="inactive">Inativa</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="assinatura" className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="plano"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plano</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um plano" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="basic">Básico</SelectItem>
                            <SelectItem value="professional">
                              Profissional
                            </SelectItem>
                            <SelectItem value="enterprise">
                              Enterprise
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          O plano determina os recursos disponíveis para a
                          empresa
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assinaturaStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status da Assinatura</FormLabel>
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
                            <SelectItem value="trial">Trial</SelectItem>
                            <SelectItem value="active">Ativa</SelectItem>
                            <SelectItem value="expired">Expirada</SelectItem>
                            <SelectItem value="canceled">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Define o status atual da assinatura da empresa
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isEditing && (
                  <div className="rounded-md border p-4 space-y-4">
                    <h3 className="font-medium">Informações de Faturamento</h3>
                    <p className="text-sm text-muted-foreground">
                      Estas informações são para referência apenas e não podem
                      ser editadas diretamente.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Data de Vencimento</p>
                        <p>
                          {empresa?.dataVencimento
                            ? new Date(
                                empresa.dataVencimento
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Status de Pagamento</p>
                        <p
                          className={
                            empresa?.inadimplente
                              ? "text-red-500"
                              : "text-green-500"
                          }
                        >
                          {empresa?.inadimplente
                            ? `Inadimplente (${empresa.diasInadimplente} dias)`
                            : "Regular"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="disponibilidade" className="space-y-4 mt-4">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Configure os horários de disponibilidade padrão da empresa.
                    Estes horários serão aplicados a novas partições por padrão.
                  </p>
                </div>

                <div className="space-y-4">
                  {Object.entries(diasDaSemana).map(([dia, diaNome]) => (
                    <div key={dia} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <FormField
                          control={form.control}
                          name={`disponibilidadePadrao.${dia}.ativo` as any}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="font-medium">
                                {diaNome}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>

                      {form.watch(
                        `disponibilidadePadrao.${dia}.ativo` as any
                      ) && (
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <FormField
                            control={form.control}
                            name={`disponibilidadePadrao.${dia}.inicio` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Horário de Início</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {horariosDisponiveis.map((horario) => (
                                      <SelectItem key={horario} value={horario}>
                                        {horario}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`disponibilidadePadrao.${dia}.fim` as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Horário de Fim</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {horariosDisponiveis.map((horario) => (
                                      <SelectItem key={horario} value={horario}>
                                        {horario}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? "Salvar Alterações" : "Criar Empresa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
