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
import { useAvailabilities } from "@/hooks/useAvailabilities";

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
        is24Hours: z.boolean().default(false),
        diasMinimosCancelamento: z.coerce.number().min(1).max(7).default(1),
        intervaloMinutos: z.coerce.number().default(30),
      }),
      terca: z.object({
        inicio: z.string().default("08:00"),
        fim: z.string().default("18:00"),
        ativo: z.boolean().default(true),
        is24Hours: z.boolean().default(false),
        diasMinimosCancelamento: z.coerce.number().min(1).max(7).default(1),
        intervaloMinutos: z.coerce.number().default(30),
      }),
      quarta: z.object({
        inicio: z.string().default("08:00"),
        fim: z.string().default("18:00"),
        ativo: z.boolean().default(true),
        is24Hours: z.boolean().default(false),
        diasMinimosCancelamento: z.coerce.number().min(1).max(7).default(1),
        intervaloMinutos: z.coerce.number().default(30),
      }),
      quinta: z.object({
        inicio: z.string().default("08:00"),
        fim: z.string().default("18:00"),
        ativo: z.boolean().default(true),
        is24Hours: z.boolean().default(false),
        diasMinimosCancelamento: z.coerce.number().min(1).max(7).default(1),
        intervaloMinutos: z.coerce.number().default(30),
      }),
      sexta: z.object({
        inicio: z.string().default("08:00"),
        fim: z.string().default("18:00"),
        ativo: z.boolean().default(true),
        is24Hours: z.boolean().default(false),
        diasMinimosCancelamento: z.coerce.number().min(1).max(7).default(1),
        intervaloMinutos: z.coerce.number().default(30),
      }),
      sabado: z.object({
        inicio: z.string().default("08:00"),
        fim: z.string().default("12:00"),
        ativo: z.boolean().default(false),
        is24Hours: z.boolean().default(false),
        diasMinimosCancelamento: z.coerce.number().min(1).max(7).default(1),
        intervaloMinutos: z.coerce.number().default(30),
      }),
      domingo: z.object({
        inicio: z.string().default("08:00"),
        fim: z.string().default("12:00"),
        ativo: z.boolean().default(false),
        is24Hours: z.boolean().default(false),
        diasMinimosCancelamento: z.coerce.number().min(1).max(7).default(1),
        intervaloMinutos: z.coerce.number().default(30),
      }),
    })
    .optional(),
});

type EmpresaFormValues = z.infer<typeof empresaSchema>;

// Horários disponíveis para seleção (intervalos de 30 minutos)
const horariosDisponiveis = [
  "00:00", "00:30",
  "01:00", "01:30",
  "02:00", "02:30",
  "03:00", "03:30",
  "04:00", "04:30",
  "05:00", "05:30",
  "06:00", "06:30",
  "07:00", "07:30",
  "08:00", "08:30",
  "09:00", "09:30",
  "10:00", "10:30",
  "11:00", "11:30",
  "12:00", "12:30",
  "13:00", "13:30",
  "14:00", "14:30",
  "15:00", "15:30",
  "16:00", "16:30",
  "17:00", "17:30",
  "18:00", "18:30",
  "19:00", "19:30",
  "20:00", "20:30",
  "21:00", "21:30",
  "22:00", "22:30",
  "23:00", "23:30",
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

// Opções para dias mínimos de cancelamento
const diasMinimosCancelamentoOpcoes = [
  { value: 1, label: "1 dia" },
  { value: 2, label: "2 dias" },
  { value: 3, label: "3 dias" },
  { value: 4, label: "4 dias" },
  { value: 5, label: "5 dias" },
  { value: 6, label: "6 dias" },
  { value: 7, label: "7 dias" },
];

// Opções para intervalos de tempo
const intervalosTempoOpcoes = [
  { value: 15, label: "15 minutos" },
  { value: 30, label: "30 minutos" },
  { value: 60, label: "1 hora" },
];

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
  const { mapDisponibilidadeParaBackend, mapDisponibilidadeParaEmpresa, createMultipleAvailabilities, isCreating } = useAvailabilities();

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
        segunda: { inicio: "08:00", fim: "18:00", ativo: true, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
        terca: { inicio: "08:00", fim: "18:00", ativo: true, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
        quarta: { inicio: "08:00", fim: "18:00", ativo: true, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
        quinta: { inicio: "08:00", fim: "18:00", ativo: true, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
        sexta: { inicio: "08:00", fim: "18:00", ativo: true, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
        sabado: { inicio: "08:00", fim: "12:00", ativo: false, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
        domingo: { inicio: "08:00", fim: "12:00", ativo: false, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
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
          segunda: { inicio: "08:00", fim: "18:00", ativo: true, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
          terca: { inicio: "08:00", fim: "18:00", ativo: true, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
          quarta: { inicio: "08:00", fim: "18:00", ativo: true, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
          quinta: { inicio: "08:00", fim: "18:00", ativo: true, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
          sexta: { inicio: "08:00", fim: "18:00", ativo: true, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
          sabado: { inicio: "08:00", fim: "12:00", ativo: false, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
          domingo: { inicio: "08:00", fim: "12:00", ativo: false, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
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
          segunda: { inicio: "08:00", fim: "18:00", ativo: true, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
          terca: { inicio: "08:00", fim: "18:00", ativo: true, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
          quarta: { inicio: "08:00", fim: "18:00", ativo: true, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
          quinta: { inicio: "08:00", fim: "18:00", ativo: true, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
          sexta: { inicio: "08:00", fim: "18:00", ativo: true, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
          sabado: { inicio: "08:00", fim: "12:00", ativo: false, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
          domingo: { inicio: "08:00", fim: "12:00", ativo: false, is24Hours: false, diasMinimosCancelamento: 1, intervaloMinutos: 30 },
        },
      });
    }
  }, [empresa, form]);

  // Busca a descrição da categoria pelo id
  function getCategoriaDescricao(id: number | undefined) {
    if (!id) return "-";
    const categoria = categorias.find((cat) => cat.id === id);
    return categoria ? categoria.description : id;
  }

  const onSubmit = async (values: EmpresaFormValues) => {
    try {
      console.log("🚀 [EmpresaDialog] Iniciando processo de criação/edição da empresa");
      console.log("📋 [EmpresaDialog] Valores do formulário:", values);
      
      const userId = getUserId();
      console.log("👤 [EmpresaDialog] ID do usuário logado:", userId);

      // Monta o payload conforme o backend espera
      const payload: any = {
        name: values.nome,
        cpfCnpj: values.cnpj,
        categoryId: values.categoriaId,
        createdBy: userId, // obrigatório
        updatedBy: userId, // obrigatório
        cep: values.cep,
        logoUrl: values.logoUrl,
        provider: values.provider,
        status: mapFormStatusToBackend(values.status),
        currentPlanId: values.plano,
        currentPaymentStatus: mapFormPaymentStatusToBackend(values.assinaturaStatus),
        stripeCustomerId: values.stripeCustomerId,
        phone: values.telefone,
        city: values.cidade,
        state: values.estado,
        country: values.pais,
        address: values.endereco,
        addressNumber: values.numeroEndereco,
      };

      // Se não estiver editando, incluir as disponibilidades no payload da empresa
      if (!isEditing && values.disponibilidadePadrao) {
        console.log("📅 [EmpresaDialog] Preparando disponibilidades para envio junto com a empresa");
        console.log("📅 [EmpresaDialog] Dados de disponibilidade do formulário:", values.disponibilidadePadrao);
        
        // Usar a função específica para mapear disponibilidades sem companyId
        const companyAvailabilities = mapDisponibilidadeParaEmpresa(values.disponibilidadePadrao);
        
        payload.companyAvailabilities = companyAvailabilities;
        
        console.log("�️ [EmpresaDialog] Disponibilidades incluídas no payload da empresa:");
        companyAvailabilities.forEach((availability, index) => {
          console.log(`   ${index + 1}. ${availability.weekday}:`, {
            openingTime: availability.openingTime,
            closingTime: availability.closingTime,
            isOpen: availability.isOpen,
            is24Hours: availability.is24Hours,
            minDaysCancel: availability.minDaysCancel,
            intervalMinutes: availability.intervalMinutes
          });
        });
      }

      console.log("�📦 [EmpresaDialog] Payload final da empresa:", payload);

      let result;
      if (isEditing && empresa) {
        console.log("✏️ [EmpresaDialog] Modo edição - atualizando empresa ID:", empresa.id);
        result = await updateEmpresa(empresa.id, payload);
        console.log("📝 [EmpresaDialog] Resultado da atualização:", result);
      } else {
        console.log("➕ [EmpresaDialog] Modo criação - criando nova empresa COM disponibilidades incluídas");
        result = await createEmpresa(payload);
        console.log("🏢 [EmpresaDialog] Resultado da criação da empresa:", result);
        
        // Verificar se a criação foi bem-sucedida
        if (result && result.ok) {
          console.log("� [EmpresaDialog] Empresa e disponibilidades criadas com sucesso em uma única operação!");
        } else {
          console.error("❌ [EmpresaDialog] Erro na criação da empresa:", result);
        }
      }

      // Checa se a requisição foi bem sucedida
      if (result && result.ok) {
        console.log("🎉 [EmpresaDialog] Processo concluído com sucesso!");
        if (onSave) onSave();
      } else {
        console.error("❌ [EmpresaDialog] Erro no resultado da operação:", result);
        // Exibe erro se a API retornar erro
        alert(result?.data?.message || "Erro ao salvar empresa.");
      }
    } catch (error) {
      console.error("💥 [EmpresaDialog] Erro geral no processo:", error);
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
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`disponibilidadePadrao.${dia}.is24Hours` as any}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel>Funciona 24 horas</FormLabel>
                              </FormItem>
                            )}
                          />

                          {!form.watch(
                            `disponibilidadePadrao.${dia}.is24Hours` as any
                          ) && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
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

                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`disponibilidadePadrao.${dia}.diasMinimosCancelamento` as any}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Dias Mínimos para Cancelamento</FormLabel>
                                      <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={String(field.value)}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {diasMinimosCancelamentoOpcoes.map((opcao) => (
                                            <SelectItem key={opcao.value} value={String(opcao.value)}>
                                              {opcao.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormDescription>
                                        Quantos dias antes o cliente deve cancelar
                                      </FormDescription>
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`disponibilidadePadrao.${dia}.intervaloMinutos` as any}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Intervalo de Tempo</FormLabel>
                                      <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={String(field.value)}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {intervalosTempoOpcoes.map((opcao) => (
                                            <SelectItem key={opcao.value} value={String(opcao.value)}>
                                              {opcao.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormDescription>
                                        Duração de cada slot de agendamento
                                      </FormDescription>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          )}
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
              <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting || isCreating}>
                {isEditing ? "Salvar Alterações" : "Criar Empresa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
