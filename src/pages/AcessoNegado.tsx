import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const AcessoNegado = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
      <p className="text-muted-foreground mb-6">
        Você não tem permissão para acessar esta página.
      </p>
      <Button onClick={() => navigate("/app/dashboard")}>
        Voltar para o Dashboard
      </Button>
    </div>
  );
};