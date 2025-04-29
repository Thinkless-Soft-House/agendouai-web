
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, ArrowRight, Lock } from "lucide-react";
import "../styles/login.css";


const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, insira um email válido.",
  }),
  password: z.string().min(4, {
    message: "A senha deve ter pelo menos 6 caracteres.",
  }),
  rememberMe: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const { setError } = form; 

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true); 

      const payload = {
        login: values.email,
        senha: values.password,
      };

      console.log("Payload", payload);

      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      // console.log('Response', response);
  
      const data = await response.json();
      // console.log('Data', data.data) 
  
      if (!response.ok) {
        setError("email", { message: "Email ou senha inválidos." });
        setError("password", { message: "Verifique suas credenciais e tente novamente." });
        throw new Error("Credenciais inválidas.");
      }
  
      login(data.data);
  
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
  
      navigate("/app/dashboard");
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Ocorreu um erro.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="login-container">
        <div className="login-wrapper">
          <Card className="login-card">
            <CardHeader className="login-header">
              <CardTitle className="login-title">Entrar no Agendou Aí</CardTitle>
              <CardDescription className="login-description">Faça login para acessar sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="login-form">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="login-field">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="seuemail@exemplo.com" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="login-field">
                        <div className="login-field-label">
                          <FormLabel>Senha</FormLabel>
                          <Link to="/app/forgot-password" className="login-footer-link">
                            Esqueceu sua senha?
                          </Link>
                        </div>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="login-checkbox">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                        </FormControl>
                        <FormLabel className="font-normal text-sm cursor-pointer">Lembrar de mim</FormLabel>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="login-button" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="login-footer">
              <Separator />
              <div className="login-footer-text">
                Não tem uma conta?{" "}
                <Link to="/app/signup" className="login-footer-link">
                  Crie sua conta gratuitamente
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
              {/* <Button variant="outline" className="login-button" asChild>
                <Link to="/app/signup">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar nova conta
                </Link>
              </Button> */}
            </CardFooter>
          </Card>
        </div>
      </div>
  );
};

export default Login;
