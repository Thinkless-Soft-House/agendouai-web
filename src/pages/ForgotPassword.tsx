
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
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulando uma chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Aqui seria a chamada real para a API de recuperação de senha
      setIsSuccess(true);
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha",
      });
    } catch (error) {
      console.error("Erro ao enviar email de recuperação:", error);
      toast({
        title: "Erro ao enviar email",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Agendou Aí?</h1>
          <p className="mt-2 text-gray-600">
            Sistema profissional de agendamentos e gerenciamento
          </p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Esqueceu sua senha?</CardTitle>
            <CardDescription>
              {isSuccess
                ? "Enviamos instruções para redefinir sua senha. Verifique seu email."
                : "Enviaremos um link para redefinir sua senha."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSuccess ? (
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar link de recuperação"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="mb-4 text-sm text-gray-600">
                  Se não encontrar o email em sua caixa de entrada, verifique a pasta de spam.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsSuccess(false)}
                >
                  Tentar novamente
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link 
              to="/app/login" 
              className="text-sm text-blue-600 hover:underline"
            >
              Voltar para o login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
