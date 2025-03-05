
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Empresa } from "@/pages/Empresas";

export const useEmpresas = () => {
  const fetchEmpresas = async (): Promise<Empresa[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return Array.from({ length: 10 }, (_, i) => ({
      id: `empresa-${i + 1}`,
      nome: `Empresa ${i + 1}`,
      cnpj: `${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
      endereco: `Rua ${i + 1}, ${Math.floor(Math.random() * 1000)}, Cidade ${i % 5}`,
      telefone: `(${10 + i % 90}) ${9}${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      email: `contato@empresa${i + 1}.com.br`,
      status: i % 4 === 0 ? "inactive" : "active",
      criadoEm: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  };

  const { data: empresas = [], isLoading: isLoadingEmpresas } = useQuery({
    queryKey: ["empresas-agendamento"],
    queryFn: fetchEmpresas,
  });

  return {
    empresas,
    isLoadingEmpresas
  };
};
