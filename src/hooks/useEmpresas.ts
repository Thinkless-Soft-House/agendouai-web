import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Empresa } from "@/pages/Empresas";

export const useEmpresas = () => {
  const fetchEmpresas = async (): Promise<Empresa[]> => {
    try {

      const usuarioLogado = JSON.parse(
        localStorage.getItem("authToken") || "{}"
      );
      // console.log("Usuario Logado:", usuarioLogado);

      const usuarioRole = usuarioLogado?.permissao?.descricao || "";
      // console.log("Usuario Role:", usuarioRole);

      const usuarioEmpresaId = usuarioLogado?.empresaId || "";
      // console.log("Usuario Empresa ID:", usuarioEmpresaId);

      if (usuarioRole === "Administrador") {
        const response = await axios.get<{ data: any[] }>(
          "http://localhost:3000/empresa"
        );

        return response.data.data.map((empresa) => ({
          id: String(empresa.id),
          nome: empresa.nome || "Nome Não Informado",
          cnpj: empresa.cpfCnpj || "00.000.000/0000-00",
          categoriaId: empresa.categoria?.id ? String(empresa.categoria.id) : "", // Convertendo para string
          categoriaNome: empresa.categoria?.descricao || "Sem categoria",
          endereco: empresa.endereco || "Endereço não informado",
          telefone: empresa.telefone || "Telefone não informado",
          email: empresa.email || "Email não informado",
          status: empresa.status || "inactive",
          criadoEm: empresa.criadoEm || new Date().toISOString(),

          // Campos adicionais se existirem na API
          assinaturaStatus: empresa.assinaturaStatus || "trial",
          plano: empresa.plano || "basic",
          dataVencimento: empresa.dataVencimento || null,
          totalClientes: empresa.totalClientes || 0,
          totalAgendamentos: empresa.totalAgendamentos || 0,
          totalReceitaMes: empresa.totalReceitaMes || 0,
          utilizacaoStorage: empresa.utilizacaoStorage || 0,
          ultimoAcesso: empresa.ultimoAcesso || null,
          inadimplente: empresa.inadimplente || true,
          diasInadimplente: empresa.diasInadimplente || 0,
          disponibilidadePadrao: empresa.disponibilidadePadrao || null,
        }));
      } else if (usuarioRole === "Empresario") {
        const response = await axios.get<{ data: any }>(
          "http://localhost:3000/empresa/" + usuarioEmpresaId
        );
        // console.log("Response [EMPRESAS COMPANY]:", response.data);
        const empresa = response.data.data;

        return [{
          id: String(empresa.id),
          nome: empresa.nome || "Nome Não Informado",
          cnpj: empresa.cpfCnpj || "00.000.000/0000-00",
          categoriaId: empresa.categoria?.id ? String(empresa.categoria.id) : "", // Convertendo para string
          categoriaNome: empresa.categoria?.descricao || "Sem categoria",
          endereco: empresa.endereco || "Endereço não informado",
          telefone: empresa.telefone || "Telefone não informado",
          email: empresa.email || "Email não informado",
          status: empresa.status || "inactive",
          criadoEm: empresa.criadoEm || new Date().toISOString(),

          // Campos adicionais se existirem na API
          assinaturaStatus: empresa.assinaturaStatus || "trial",
          plano: empresa.plano || "basic",
          dataVencimento: empresa.dataVencimento || null,
          totalClientes: empresa.totalClientes || 0,
          totalAgendamentos: empresa.totalAgendamentos || 0,
          totalReceitaMes: empresa.totalReceitaMes || 0,
          utilizacaoStorage: empresa.utilizacaoStorage || 0,
          ultimoAcesso: empresa.ultimoAcesso || null,
          inadimplente: empresa.inadimplente || true,
          diasInadimplente: empresa.diasInadimplente || 0,
          disponibilidadePadrao: empresa.disponibilidadePadrao || null,
        }];
      } else {
        return [];
      }

    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      throw new Error(
        "Falha ao carregar empresas. Tente novamente mais tarde."
      );
    }
  };

  const { data: empresas = [], isLoading: isLoadingEmpresas } = useQuery({
    queryKey: ["empresas-agendamento"],
    queryFn: fetchEmpresas,
  });

  return {
    empresas,
    isLoadingEmpresas,
  };
};