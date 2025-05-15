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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { CompanyStatus, PaymentStatus, useEmpresas } from "@/hooks/useEmpresas";
import { useCategorias } from "@/hooks/useCategorias";
import { Company, createEmpresa, updateEmpresa } from "@/hooks/useEmpresas";

interface EmpresaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: Company | null;
  onSave: () => void;
}

// Esquema de validação atualizado para todos os campos do payload
const empresaSchema = z.object({
  nome: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  cnpj: z.string().min(14, { message: "CNPJ inválido" }),
  cep: z.string().min(8, { message: "CEP inválido" }),
  logoUrl: z.string().url({ message: "URL do logo inválida" }),
  provider: z.coerce.number().min(1, { message: "Provider obrigatório" }),
  endereco: z.string().min(5, { message: "Endereço muito curto" }),
  numeroEndereco: z.string().min(1, { message: "Número obrigatório" }),
  cidade: z.string().min(2, { message: "Cidade obrigatória" }),
  estado: z.string().min(2, { message: "Estado obrigatório" }),
  pais: z.string().min(2, { message: "País obrigatório" }),
  telefone: z.string().min(10, { message: "Telefone inválido" }),
  status: z.enum(["active", "inactive"], {
    errorMap: () => ({ message: "Selecione um status" }),
  }),
  categoriaId: z.coerce.number().min(1, { message: "Selecione uma categoria" }),
  plano: z.coerce.number().min(1, { message: "Selecione um plano" }),
  assinaturaStatus: z.enum(["trial", "active", "expired", "canceled"], {
    errorMap: () => ({ message: "Selecione um status de assinatura" }),
  }),
  stripeCustomerId: z.string().optional(),
  disponibilidadePadrao: z
    .object({
      segunda: z.object({
        inicio: z.string().default("08:00"),
        fim: z.string().default("18:00"),
        ativo: z.boolean().default(true),
      }),
      terca: z.object({
        inicio: z.string().default("08:00"),
        fim: z.string().default("18:00"),
        ativo: z.boolean().default(true),
      }),
      quarta: z.object({
        inicio: z.string().default("08:00"),
        fim: z.string().default("18:00"),
        ativo: z.boolean().default(true),
      }),
      quinta: z.object({
        inicio: z.string().default("08:00"),
        fim: z.string().default("18:00"),
        ativo: z.boolean().default(true),
      }),
      sexta: z.object({
        inicio: z.string().default("08:00"),
        fim: z.string().default("18:00"),
        ativo: z.boolean().default(true),
      }),
      sabado: z.object({
        inicio: z.string().default("08:00"),
        fim: z.string().default("12:00"),
        ativo: z.boolean().default(false),
      }),
      domingo: z.object({
        inicio: z.string().default("08:00"),
        fim: z.string().default("12:00"),
        ativo: z.boolean().default(false),
      }),
    })
    .optional(),
});

type EmpresaFormValues = z.infer<typeof empresaSchema>;

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

// Função utilitária para mapear status do backend para o frontend
function mapCompanyStatusToForm(status: string | undefined): "active" | "inactive" {
  if (!status) return "active";
  if (status === "ativo" || status === CompanyStatus.ATIVO) return "active";
  if (status === "inativo" || status === CompanyStatus.INATIVO) return "inactive";
  return "active";
}

function mapPaymentStatusToForm(status: string | undefined): "active" | "trial" | "expired" | "canceled" {
  if (!status) return "active";
  if (status === "ativo" || status === PaymentStatus.ATIVO) return "active";
  if (status === "trial" || status === PaymentStatus.TRIAL) return "trial";
  if (status === "expirado" || status === PaymentStatus.EXPIRADO) return "expired";
  if (status === "cancelado" || status === PaymentStatus.CANCELADO) return "canceled";
  return "active";
}

// Função para mapear status do formulário para o enum do backend
function mapFormStatusToBackend(status: "active" | "inactive"): string {
  if (status === "active") return "ativo";
  if (status === "inactive") return "inativo";
  return "ativo";
}

function mapFormPaymentStatusToBackend(
  status: "active" | "trial" | "expired" | "canceled"
): string {
  if (status === "active") return "ativo";
  if (status === "trial") return "trial";
  if (status === "expired") return "expirado";
  if (status === "canceled") return "cancelado";
  return "ativo";
}

// Função para converter "HH:mm" para minutos
function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + (m || 0);
}

// Função para converter disponibilidade do formulário para o formato do backend
function mapDisponibilidadeParaBackend(disponibilidade: any) {
  const diasMap: Record<string, string> = {
    segunda: "monday",
    terca: "tuesday",
    quarta: "wednesday",
    quinta: "thursday",
    sexta: "friday",
    sabado: "saturday",
    domingo: "sunday",
  };
  const result: Record<string, { start: number; end: number }> = {};
  Object.entries(disponibilidade || {}).forEach(([dia, val]: any) => {
    if (val && val.ativo) {
      result[diasMap[dia]] = {
        start: horaParaMinutos(val.inicio),
        end: horaParaMinutos(val.fim),
      };
    }
  });
  return result;
}

// Função para obter o usuário logado (id)
function getUserId(): number | null {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw);
      return user?.id || null;
    }
  } catch {
    return null;
  }
  return null;
}

export function EmpresaDialog({
  open,
  onOpenChange,
  empresa,
  onSave,
}: EmpresaDialogProps) {
  const isEditing = !!empresa;
  const [activeTab, setActiveTab] = useState<string>("geral");
  const { categorias, isLoadingCategorias } = useCategorias();

  const form = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nome: "",
      cnpj: "",
      cep: "",
      logoUrl: "",
      provider: 1,
      endereco: "",
      numeroEndereco: "",
      cidade: "",
      estado: "",
      pais: "",
      telefone: "",
      status: "active",
      categoriaId: 1,
      plano: 1,
      assinaturaStatus: "active",
      stripeCustomerId: "",
      disponibilidadePadrao: {
        segunda: { inicio: "08:00", fim: "18:00", ativo: true },
        terca: { inicio: "08:00", fim: "18:00", ativo: true },
        quarta: { inicio: "08:00", fim: "18:00", ativo: true },
        quinta: { inicio: "08:00", fim: "18:00", ativo: true },
        sexta: { inicio: "08:00", fim: "18:00", ativo: true },
        sabado: { inicio: "08:00", fim: "12:00", ativo: false },
        domingo: { inicio: "08:00", fim: "12:00", ativo: false },
      },
    },
    mode: "onChange", // Garante que o formState.isValid seja atualizado corretamente
  });

  // Atualiza o formulário quando a empresa muda
  useEffect(() => {
    if (empresa) {
      form.reset({
        nome: empresa.name || "",
        cnpj: empresa.cpfCnpj || "",
        cep: empresa.cep || "",
        logoUrl: empresa.logoUrl || "",
        provider: empresa.provider || 1,
        endereco: empresa.address || "",
        numeroEndereco: empresa.addressNumber || "",
        cidade: empresa.city || "",
        estado: empresa.state || "",
        pais: empresa.country || "",
        telefone: empresa.phone || "",
        status: mapCompanyStatusToForm(empresa.status),
        categoriaId: empresa.categoryId || 1,
        plano: empresa.currentPlanId || 1,
        assinaturaStatus: mapPaymentStatusToForm(empresa.currentPaymentStatus),
        stripeCustomerId: empresa.stripeCustomerId || "",
        disponibilidadePadrao: empresa.defaultAvailability || {
          segunda: { inicio: "08:00", fim: "18:00", ativo: true },
          terca: { inicio: "08:00", fim: "18:00", ativo: true },
          quarta: { inicio: "08:00", fim: "18:00", ativo: true },
          quinta: { inicio: "08:00", fim: "18:00", ativo: true },
          sexta: { inicio: "08:00", fim: "18:00", ativo: true },
          sabado: { inicio: "08:00", fim: "12:00", ativo: false },
          domingo: { inicio: "08:00", fim: "12:00", ativo: false },
        },
      });
    } else {
      form.reset({
        nome: "",
        cnpj: "",
        cep: "",
        logoUrl: "",
        provider: 1,
        endereco: "",
        numeroEndereco: "",
        cidade: "",
        estado: "",
        pais: "",
        telefone: "",
        status: "active",
        categoriaId: 1,
        plano: 1,
        assinaturaStatus: "active",
        stripeCustomerId: "",
        disponibilidadePadrao: {
          segunda: { inicio: "08:00", fim: "18:00", ativo: true },
          terca: { inicio: "08:00", fim: "18:00", ativo: true },
          quarta: { inicio: "08:00", fim: "18:00", ativo: true },
          quinta: { inicio: "08:00", fim: "18:00", ativo: true },
          sexta: { inicio: "08:00", fim: "18:00", ativo: true },
          sabado: { inicio: "08:00", fim: "12:00", ativo: false },
          domingo: { inicio: "08:00", fim: "12:00", ativo: false },
        },
      });
    }
  }, [empresa, form]);

  const onSubmit = async (values: EmpresaFormValues) => {
    try {
      const userId = getUserId();

      // Monta o payload completo conforme o backend espera
      const payload: any = {
        cpfCnpj: values.cnpj,
        createdBy: userId,
        updatedBy: userId,
        status: mapFormStatusToBackend(values.status),
        cep: values.cep,
        logoUrl: values.logoUrl,
        provider: values.provider,
        name: values.nome,
        phone: values.telefone,
        city: values.cidade,
        state: values.estado,
        country: values.pais,
        address: values.endereco,
        addressNumber: values.numeroEndereco,
        defaultAvailability: mapDisponibilidadeParaBackend(values.disponibilidadePadrao),
        categoryId: values.categoriaId,
        currentPlanId: values.plano,
        currentPaymentStatus: mapFormPaymentStatusToBackend(values.assinaturaStatus),
        stripeCustomerId: values.stripeCustomerId,
      };

      let result;
      if (isEditing && empresa) {
        result = await updateEmpresa(empresa.id, payload);
      } else {
        result = await createEmpresa(payload);
      }

      // Checa se a requisição foi bem sucedida
      if (result && result.ok) {
        if (onSave) onSave();
      } else {
        // Exibe erro se a API retornar erro
        alert(result?.data?.message || "Erro ao salvar empresa.");
      }
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);
      alert("Erro ao salvar empresa.");
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
            // Garante que o submit padrão do form não seja bloqueado
            noValidate
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
                            field.onChange(value);
                          }}
                          value={String(field.value)}
                          disabled={isLoadingCategorias}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue>
                                {categorias.find(
                                  (c) => String(c.id) === String(field.value)
                                )?.description || "Selecione uma categoria"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categorias.map((categoria) => (
                              <SelectItem
                                key={categoria.id}
                                value={String(categoria.id)}
                              >
                                {categoria.description}
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

                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="CEP da empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo (URL)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="ID do provider" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numeroEndereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="Número do endereço" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cidade"
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
                  name="estado"
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
                  name="pais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <FormControl>
                        <Input placeholder="País" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stripeCustomerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stripe Customer ID</FormLabel>
                      <FormControl>
                        <Input placeholder="cus_ABC123XYZ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          defaultValue={String(field.value)}
                          value={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um plano" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Básico</SelectItem>
                            <SelectItem value="2">
                              Profissional
                            </SelectItem>
                            <SelectItem value="3">
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
              <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
                {isEditing ? "Salvar Alterações" : "Criar Empresa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
