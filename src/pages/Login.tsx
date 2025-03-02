
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { CalendarRange, Mail, Lock, ArrowRight, LucideGoogle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login
    toast({
      title: "Login realizado com sucesso",
      description: "Redirecionando para o dashboard...",
    });
    
    // Simulando redirecionamento após login
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const handleGoogleLogin = () => {
    toast({
      title: "Login com Google",
      description: "Recurso em implementação...",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="absolute top-4 left-4">
        <Link to="/" className="flex items-center space-x-2 text-gray-700 hover:text-primary">
          <ArrowRight className="h-5 w-5 rotate-180" />
          <span>Voltar para o site</span>
        </Link>
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CalendarRange className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">AgendaFácil</h1>
          </div>
          <p className="text-gray-600">Acesse sua conta e gerencie seus agendamentos</p>
        </div>
        
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-center">
              Entre com sua conta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={handleGoogleLogin}
              >
                <LucideGoogle className="h-5 w-5" />
                Continuar com Google
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input className="pl-10" type="email" placeholder="Email" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input className="pl-10" type="password" placeholder="Senha" required />
                  </div>
                  <div className="text-right text-sm">
                    <a href="#" className="text-primary hover:underline">
                      Esqueceu sua senha?
                    </a>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </form>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm mt-2">
              Não tem uma conta?{" "}
              <a href="#" className="text-primary hover:underline">
                Criar conta
              </a>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2023 AgendaFácil. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
