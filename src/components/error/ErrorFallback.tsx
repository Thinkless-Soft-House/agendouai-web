
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  console.error("Aplicação encontrou um erro:", error);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Algo deu errado</h2>
      <p className="text-gray-600 mb-4">
        Desculpe, ocorreu um erro inesperado.
      </p>
      <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4 max-w-lg overflow-auto text-left">
        <p className="text-sm font-mono text-red-700">{error.message}</p>
      </div>
      <Button onClick={resetErrorBoundary}>Tentar novamente</Button>
    </div>
  );
};
