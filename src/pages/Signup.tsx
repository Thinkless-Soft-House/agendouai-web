
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/App";
import { Steps, Step } from "@/components/ui/steps";

// Ícone personalizado do Google
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 48 48"
    {...props}
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

// Esquema de validação para cliente
const clienteSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  senha: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  confirmarSenha: z.string()
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

// Esquema de validação para empresa - passo 1 (dados do usuário)
const empresaPasso1Schema = z.object({
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  senha: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  confirmarSenha: z.string()
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

// Esquema de validação para empresa - passo 2 (dados da empresa)
const empresaPasso2Schema = z.object({
  nomeEmpresa: z.string().min(2, { message: "Nome da empresa deve ter pelo menos 2 caracteres" }),
  cnpj: z.string().min(14, { message: "CNPJ inválido" }).max(18),
  telefone: z.string().min(10, { message: "Telefone inválido" }),
  endereco: z.string().min(5, { message: "Endereço muito curto" }),
});

// Esquema de validação para empresa - passo 3 (plano)
const empresaPasso3Schema = z.object({
  plano: z.enum(["free", "basico", "avancado", "personalizado"], {
    required_error: "Selecione um plano",
  }),
  periodicidade: z.enum(["mensal", "anual"], {
    required_error: "Selecione uma periodicidade",
  }),
});

const Signup = () => {
  const [accountType, setAccountType] = useState<"cliente" | "empresa">("cliente");
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Formulário para cliente
  const clienteForm = useForm<z.infer<typeof clienteSchema>>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
    },
  });

  // Formulários para empresa (múltiplos passos)
  const empresaPasso1Form = useForm<z.infer<typeof empresaPasso1Schema>>({
    resolver: zodResolver(empresaPasso1Schema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
    },
  });

  const empresaPasso2Form = useForm<z.infer<typeof empresaPasso2Schema>>({
    resolver: zodResolver(empresaPasso2Schema),
    defaultValues: {
      nomeEmpresa: "",
      cnpj: "",
      telefone: "",
      endereco: "",
    },
  });

  const empresaPasso3Form = useForm<z.infer<typeof empresaPasso3Schema>>({
    resolver: zodResolver(empresaPasso3Schema),
    defaultValues: {
      plano: "free",
      periodicidade: "mensal",
    },
  });

  const handleClienteSubmit = (data: z.infer<typeof clienteSchema>) => {
    console.log("Dados do cliente:", data);
    
    // Simulando chamada de API para criação de conta
    setTimeout(() => {
      login();
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao Agendou Aí?",
      });
      navigate("/app/dashboard");
    }, 1000);
  };

  const handleEmpresaPasso1Submit = (data: z.infer<typeof empresaPasso1Schema>) => {
    console.log("Dados do usuário da empresa:", data);
    setCurrentStep(1);
  };

  const handleEmpresaPasso2Submit = (data: z.infer<typeof empresaPasso2Schema>) => {
    console.log("Dados da empresa:", data);
    setCurrentStep(2);
  };

  const handleEmpresaPasso3Submit = (data: z.infer<typeof empresaPasso3Schema>) => {
    console.log("Dados do plano:", data);
    
    // Combinando dados de todos os passos
    const dadosCompletos = {
      usuario: empresaPasso1Form.getValues(),
      empresa: empresaPasso2Form.getValues(),
      plano: data,
    };
    
    console.log("Dados completos da empresa:", dadosCompletos);
    
    // Simulando chamada de API para criação de conta
    setTimeout(() => {
      login();
      toast({
        title: "Conta empresarial criada com sucesso!",
        description: "Bem-vindo ao Agendou Aí?",
      });
      navigate("/app/dashboard");
    }, 1000);
  };

  const handleGoogleSignup = () => {
    // Simulando registro com Google
    setTimeout(() => {
      login();
      toast({
        title: "Conta criada com Google",
        description: "Bem-vindo ao Agendou Aí?",
      });
      navigate("/app/dashboard");
    }, 1000);
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 py-8">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Agendou Aí?</h1>
          <p className="mt-2 text-gray-600">
            Crie sua conta e comece a gerenciar seus agendamentos
          </p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Criar uma conta</CardTitle>
            <CardDescription>
              Escolha o tipo de conta que deseja criar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="cliente"
              value={accountType}
              onValueChange={(value) => setAccountType(value as "cliente" | "empresa")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="cliente">Cliente</TabsTrigger>
                <TabsTrigger value="empresa">Empresa</TabsTrigger>
              </TabsList>

              <TabsContent value="cliente">
                <Form {...clienteForm}>
                  <form onSubmit={clienteForm.handleSubmit(handleClienteSubmit)} className="space-y-4">
                    <FormField
                      control={clienteForm.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={clienteForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={clienteForm.control}
                      name="senha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={clienteForm.control}
                      name="confirmarSenha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar senha</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full">
                      Criar conta
                    </Button>
                  </form>
                </Form>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">
                      Ou continue com
                    </span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignup}
                >
                  <GoogleIcon className="mr-2 h-5 w-5" />
                  Google
                </Button>
              </TabsContent>

              <TabsContent value="empresa">
                <Steps currentStep={currentStep}>
                  <Step title="Dados pessoais">
                    <Form {...empresaPasso1Form}>
                      <form onSubmit={empresaPasso1Form.handleSubmit(handleEmpresaPasso1Submit)} className="space-y-4">
                        <FormField
                          control={empresaPasso1Form.control}
                          name="nome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do administrador</FormLabel>
                              <FormControl>
                                <Input placeholder="Seu nome" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={empresaPasso1Form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="seu@email.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={empresaPasso1Form.control}
                          name="senha"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={empresaPasso1Form.control}
                          name="confirmarSenha"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar senha</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full">
                          Próximo
                        </Button>
                      </form>
                    </Form>
                  </Step>
                  
                  <Step title="Dados da empresa">
                    <Form {...empresaPasso2Form}>
                      <form onSubmit={empresaPasso2Form.handleSubmit(handleEmpresaPasso2Submit)} className="space-y-4">
                        <FormField
                          control={empresaPasso2Form.control}
                          name="nomeEmpresa"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da empresa</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome da sua empresa" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={empresaPasso2Form.control}
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
                          control={empresaPasso2Form.control}
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
                        
                        <FormField
                          control={empresaPasso2Form.control}
                          name="endereco"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Endereço</FormLabel>
                              <FormControl>
                                <Input placeholder="Rua, número, bairro, cidade" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-between pt-2">
                          <Button type="button" variant="outline" onClick={() => setCurrentStep(0)}>
                            Voltar
                          </Button>
                          <Button type="submit">
                            Próximo
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </Step>
                  
                  <Step title="Escolha do plano">
                    <Form {...empresaPasso3Form}>
                      <form onSubmit={empresaPasso3Form.handleSubmit(handleEmpresaPasso3Submit)} className="space-y-4">
                        <FormField
                          control={empresaPasso3Form.control}
                          name="plano"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Plano</FormLabel>
                              <div className="grid grid-cols-2 gap-4">
                                <div 
                                  className={`border rounded-lg p-4 cursor-pointer transition-all ${field.value === 'free' ? 'border-primary bg-primary/10' : ''}`}
                                  onClick={() => empresaPasso3Form.setValue("plano", "free")}
                                >
                                  <h3 className="font-medium">Agendou Solzinho</h3>
                                  <p className="text-sm text-gray-500">Grátis</p>
                                </div>
                                <div 
                                  className={`border rounded-lg p-4 cursor-pointer transition-all ${field.value === 'basico' ? 'border-primary bg-primary/10' : ''}`}
                                  onClick={() => empresaPasso3Form.setValue("plano", "basico")}
                                >
                                  <h3 className="font-medium">Agendou Legal</h3>
                                  <p className="text-sm text-gray-500">R$49,90/mês</p>
                                </div>
                                <div 
                                  className={`border rounded-lg p-4 cursor-pointer transition-all ${field.value === 'avancado' ? 'border-primary bg-primary/10' : ''}`}
                                  onClick={() => empresaPasso3Form.setValue("plano", "avancado")}
                                >
                                  <h3 className="font-medium">Agendou Tudo</h3>
                                  <p className="text-sm text-gray-500">R$99,90/mês</p>
                                </div>
                                <div 
                                  className={`border rounded-lg p-4 cursor-pointer transition-all ${field.value === 'personalizado' ? 'border-primary bg-primary/10' : ''}`}
                                  onClick={() => empresaPasso3Form.setValue("plano", "personalizado")}
                                >
                                  <h3 className="font-medium">Agendou Pro</h3>
                                  <p className="text-sm text-gray-500">Personalizado</p>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={empresaPasso3Form.control}
                          name="periodicidade"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Periodicidade</FormLabel>
                              <div className="flex space-x-4">
                                <div
                                  className={`flex-1 border rounded-lg p-3 cursor-pointer text-center transition-all ${field.value === 'mensal' ? 'border-primary bg-primary/10' : ''}`}
                                  onClick={() => empresaPasso3Form.setValue("periodicidade", "mensal")}
                                >
                                  Mensal
                                </div>
                                <div
                                  className={`flex-1 border rounded-lg p-3 cursor-pointer text-center transition-all ${field.value === 'anual' ? 'border-primary bg-primary/10' : ''}`}
                                  onClick={() => empresaPasso3Form.setValue("periodicidade", "anual")}
                                >
                                  Anual (1 mês grátis)
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-between pt-2">
                          <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                            Voltar
                          </Button>
                          <Button type="submit">
                            Concluir cadastro
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </Step>
                </Steps>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link to="/app/login" className="text-blue-600 hover:underline">
                Faça login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
