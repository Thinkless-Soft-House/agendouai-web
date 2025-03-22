import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../App";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Check,
  User,
  UserPlus,
} from "lucide-react";
import "../styles/singup.css";
import { log } from "console";
import { set } from "date-fns";

// Esquema de validação para dados básicos
const basicSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z
    .string()
    .min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  accountType: z.enum(["cliente", "empresa"], {
    required_error: "Selecione o tipo de conta",
  }),
});

// Esquema de validação para dados da empresa
const companySchema = z.object({
  companyName: z.string().min(2, { message: "Nome da empresa é obrigatório" }),
  cnpj: z.string().min(14, { message: "CNPJ inválido" }),
  telefone: z.string().min(10, { message: "Telefone inválido" }),
  permissaoId: z.number().min(1, { message: "Permissão inválida" }),
});

// Esquema para plano da empresa
const planSchema = z.object({
  plan: z.enum(["free", "basic", "pro", "custom"], {
    required_error: "Selecione um plano",
  }),
  billingCycle: z.enum(["monthly", "annual"], {
    required_error: "Selecione o ciclo de cobrança",
  }),
});

type BasicFormValues = z.infer<typeof basicSchema>;
type CompanyFormValues = z.infer<typeof companySchema>;
type PlanFormValues = z.infer<typeof planSchema>;

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<"cliente" | "empresa">(
    "cliente"
  );
  const [basicData, setBasicData] = useState<BasicFormValues | null>(null);
  const [companyData, setCompanyData] = useState<CompanyFormValues | null>(
    null
  );
  const [planData, setPlanData] = useState<PlanFormValues | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  const token = localStorage.getItem("authToken");

  // Formulário para dados básicos
  const basicForm = useForm<BasicFormValues>({
    resolver: zodResolver(basicSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      accountType: "cliente",
    },
  });

  // Formulário para dados da empresa
  const companyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "",
      cnpj: "",
      telefone: "",
      permissaoId: 3,
    },
  });

  // Formulário para plano
  const planForm = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      plan: "free",
      billingCycle: "monthly",
    },
  });

  const onBasicSubmit = (data: BasicFormValues) => {
    setBasicData(data);
    setAccountType(data.accountType);

    if (data.accountType === "cliente") {
      // Para clientes, concluir o cadastro diretamente
      handleFinalSubmit();
    } else {
      // Para empresas, ir para a próxima etapa
      // console.log('BasicSubmit', data);
      setStep(2);
    }
  };

  const onCompanySubmit = (data: CompanyFormValues) => {
    setCompanyData(data);
    // console.log('CompanySubmit', data);
    setStep(3);
  };

  const onPlanSubmit = (data: PlanFormValues) => {
    // Aqui teríamos a lógica de finalização de cadastro
    setPlanData(data);
    handleFinalSubmit();
  };

  const createUser = async (basicValues: BasicFormValues) => {
    const userData = {
      login: basicValues.email,
      senha: basicValues.password,
      status: 1,
      permissaoId: 1,
      pessoa: {
        nome: basicValues.name,
        cpfCnpj: 15510521643,
        municipio: 'Santa Luzia',
        estado: 'Minas Gerais',
        pais: 'Brasil',
        endereco:'Rua Dona Sebastiana Mattos, Idulipê',
        numero: 27,
        cep: 33025140,
        telefone: 31993691241,
        dataNascimento: '20//04/2004',
      },
    };
  
    // console.log("Enviando usuário para API:", userData);
  
    const response = await fetch("http://localhost:3000/signUp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao criar usuário");
    }
  
    return await response.json();
  };
  
  const createCompany = async (companyValues: CompanyFormValues) => {
    const companyData = {
      logo: 'asdasdsads',
      categoriaId: 1,
      userCreated: 1,
  
      nome: companyValues.companyName,
      telefone: companyValues.telefone,
      cpfCnpj: Number(companyValues.cnpj.replace(/\D/g, "")), 
  
      municipio: 'Santa Luzia',
      estado: 'Minas Gerais',
      pais: 'Brasil',
      endereco:'Rua Dona Sebastiana Mattos, Idulipê',
      numeroEndereco: '27',
      cep: 33025140,
    };
  
    // console.log("Enviando empresa para API:", companyData);
  
    const response = await fetch("http://localhost:3000/empresa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(companyData),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao criar empresa");
    }
  
    return await response.json();
  };
  
  const createPlan = async (planValues: PlanFormValues) => {
    const planData = {
      plan: planValues.plan,
      billingCycle: planValues.billingCycle,
    };
  
    // console.log("Enviando plano para API:", planData);
  
    const response = await fetch("http://localhost:3000/signUp/plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planData),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao selecionar plano");
    }
  
    return await response.json();
  };
  
  // Função principal que chama todas as outras
  const handleFinalSubmit = async () => {
    try {
      setIsLoading(true);
  
      const basicValues = basicForm.getValues();
      const companyValues = companyForm.getValues();
      const planValues = planForm.getValues();
  
      // Criar usuário e obter token
      const userResponse = await createUser(basicValues);
      // console.log("Usuário criado:", userResponse);
  
      // Criar empresa se for uma conta de empresa
      if (basicValues.accountType === "empresa") {
        const companyResponse = await createCompany(companyValues);
        // console.log("Empresa criada:", companyResponse);
      }
  
      // Selecionar plano
      const planResponse = await createPlan(planValues);
      // console.log("Plano escolhido:", planResponse);
  
      toast({
        title: "Conta criada com sucesso!",
        description:
          basicValues.accountType === "cliente"
            ? "Seu cadastro de cliente foi realizado."
            : "Seu cadastro de empresa foi concluído. Bem-vindo ao Agendou Aí!",
      });
  
      // Simular login com o token recebido da API
      setTimeout(() => {
        login(userResponse.token);
        navigate("/app/dashboard");
      }, 1500);
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
  
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Não foi possível concluir o cadastro.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStepIndicator = () => {
    if (accountType !== "empresa" || step === 1) return null;
  
    return (
      <div className="flex items-center justify-center mb-6 space-x-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <div className={`h-2 w-2 rounded-full transition-colors ${step >= i ? "bg-primary" : "bg-muted"}`} />
            {i < 3 && (
              <div className={`h-0.5 w-16 transition-colors ${step > i ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Criar sua conta
            </CardTitle>
            <CardDescription>
              {step === 1 && "Preencha seus dados para começar"}
              {step === 2 && "Informações da sua empresa"}
              {step === 3 && "Escolha seu plano"}
            </CardDescription>
            {renderStepIndicator()}
          </CardHeader>

          <CardContent>
            {step === 1 && (
              <Form {...basicForm}>
                <form
                  onSubmit={basicForm.handleSubmit(onBasicSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <FormField
                      control={basicForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input placeholder="João Silva" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={basicForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="exemplo@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={basicForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="******"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={basicForm.control}
                      name="accountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de conta</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col md:flex-row gap-4"
                            >
                              {/* Opção Cliente */}
                              <label htmlFor="cliente" className="w-full">
                                <div
                                  className={`flex items-center space-x-2 rounded-md border p-4 cursor-pointer transition-colors 
        ${
          field.value === "cliente"
            ? "border-primary bg-primary/5"
            : "hover:bg-muted/50"
        }`}
                                >
                                  <RadioGroupItem
                                    value="cliente"
                                    id="cliente"
                                    className="sr-only"
                                  />
                                  <User className="h-5 w-5 text-muted-foreground" />
                                  <div className="space-y-0.5">
                                    <span className="text-sm font-medium leading-none">
                                      Cliente
                                    </span>
                                    <p className="text-xs text-muted-foreground">
                                      Quero agendar serviços
                                    </p>
                                  </div>
                                </div>
                              </label>

                              {/* Opção Empresa */}
                              <label htmlFor="empresa" className="w-full">
                                <div
                                  className={`flex items-center space-x-2 rounded-md border p-4 cursor-pointer transition-colors 
        ${
          field.value === "empresa"
            ? "border-primary bg-primary/5"
            : "hover:bg-muted/50"
        }`}
                                >
                                  <RadioGroupItem
                                    value="empresa"
                                    id="empresa"
                                    className="sr-only"
                                  />
                                  <Building className="h-5 w-5 text-muted-foreground" />
                                  <div className="space-y-0.5">
                                    <span className="text-sm font-medium leading-none">
                                      Empresa
                                    </span>
                                    <p className="text-xs text-muted-foreground">
                                      Quero oferecer serviços
                                    </p>
                                  </div>
                                </div>
                              </label>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    {basicForm.watch("accountType") === "cliente"
                      ? "Criar Conta"
                      : "Próximo"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>
            )}

            {step === 2 && (
              <Form {...companyForm}>
                <form
                  onSubmit={companyForm.handleSubmit(onCompanySubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={companyForm.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Empresa Ltda." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={companyForm.control}
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
                    control={companyForm.control}
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

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={goBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar
                    </Button>
                    <Button type="submit">
                      Próximo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {step === 3 && (
              <Form {...planForm}>
                <form
                  onSubmit={planForm.handleSubmit(onPlanSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={planForm.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Escolha seu plano</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            <div
                              className={`flex items-center justify-between rounded-md border p-4 cursor-pointer transition-colors ${
                                field.value === "free"
                                  ? "border-primary bg-primary/5"
                                  : "hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="free" id="free" />
                                <div>
                                  <label
                                    htmlFor="free"
                                    className="text-sm font-medium leading-none cursor-pointer"
                                  >
                                    Primeiros Passos
                                  </label>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    1 usuário, 1 partição, 15 agendamentos/mês
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline">Grátis</Badge>
                            </div>

                            <div
                              className={`flex items-center justify-between rounded-md border p-4 cursor-pointer transition-colors ${
                                field.value === "basic"
                                  ? "border-primary bg-primary/5"
                                  : "hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="basic" id="basic" />
                                <div>
                                  <label
                                    htmlFor="basic"
                                    className="text-sm font-medium leading-none cursor-pointer"
                                  >
                                    Agenda Eficiente
                                  </label>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    2 usuários, 2 partições, 50 agendamentos/mês
                                  </p>
                                </div>
                              </div>
                              <Badge>Popular</Badge>
                            </div>

                            <div
                              className={`flex items-center justify-between rounded-md border p-4 cursor-pointer transition-colors ${
                                field.value === "pro"
                                  ? "border-primary bg-primary/5"
                                  : "hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="pro" id="pro" />
                                <div>
                                  <label
                                    htmlFor="pro"
                                    className="text-sm font-medium leading-none cursor-pointer"
                                  >
                                    Agenda Pro
                                  </label>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    5 usuários, 5 partições, 100
                                    agendamentos/mês
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div
                              className={`flex items-center justify-between rounded-md border p-4 cursor-pointer transition-colors ${
                                field.value === "custom"
                                  ? "border-primary bg-primary/5"
                                  : "hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value="custom" id="custom" />
                                <div>
                                  <label
                                    htmlFor="custom"
                                    className="text-sm font-medium leading-none cursor-pointer"
                                  >
                                    Agenda Personalizada
                                  </label>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Solução totalmente customizada
                                  </p>
                                </div>
                              </div>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={planForm.control}
                    name="billingCycle"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Ciclo de cobrança</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o ciclo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">Mensal</SelectItem>
                            <SelectItem value="annual">
                              Anual (2 meses grátis)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={goBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar
                    </Button>
                    <Button type="submit">
                      Concluir Cadastro
                      <Check className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Separator />
            <div className="text-center text-sm text-muted-foreground">
              Já possui uma conta?{" "}
              <Link to="/app/login" className="text-primary hover:underline">
                Entrar
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
