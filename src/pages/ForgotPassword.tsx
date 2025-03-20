
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import "../styles/forgotPassword.css";

const formSchema = z.object({
  email: z.string().email({
    message: "Por favor, insira um email válido.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
  
      console.log("Enviando para API:", values); // Log para verificar o payload
  
      const response = await fetch("http://localhost:3000/forgotPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login: values.email }), // Enviando apenas o email no formato correto
      });
  
      console.log("Resposta da API:", response); // Log da resposta para debug
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao enviar link de redefinição");
      }
  
      toast({
        title: "Link enviado",
        description: "Verifique seu email para redefinir sua senha.",
      });
  
      setSubmitted(true);
    } catch (error: any) {
      console.error("Erro:", error); // Log do erro
  
      toast({
        title: "Erro ao enviar link",
        description: error.message || "Não foi possível enviar o link de redefinição de senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-wrapper">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Esqueceu sua senha?</CardTitle>
            <CardDescription>
              {!submitted 
                ? "Enviaremos um link para você redefinir sua senha"
                : "Link de redefinição enviado para seu email"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="seuemail@exemplo.com"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Enviando..."
                    ) : (
                      <>
                        Enviar link de redefinição
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 p-2">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div>
                  <p>Um email foi enviado para redefinir sua senha.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Se não encontrar o email na caixa de entrada, verifique a pasta de spam.
                  </p>
                </div>
                <Button className="mt-4" asChild>
                  <Link to="/app/login">
                    Voltar para o login
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Separator />
            <div className="flex justify-center">
              <Button variant="ghost" className="gap-2" asChild>
                <Link to="/app/login">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para o login
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
