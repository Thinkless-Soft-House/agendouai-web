import { useEffect, useState } from "react";

interface UsuarioLogado {
  id: number;
  login: string;
  senha: string;
  status: number;
  resetPasswordCode: string | null;
  dateCreated: string;
  dateUpdated: string;
  empresa: {
    id: number;
    logo: string | null;
    nome: string;
    telefone: string;
    cpfCnpj: string;
  };
  empresaId: number;
  permissao: {
    id: number;
    descricao: string;
  };
  permissaoId: number;
  pessoa: {
    id: number;
    nome: string;
    cpfCnpj: string;
    funcao: string | null;
    municipio: string;
    telefone: string;
  };
  pessoaId: number;
  pushToken: string | null;
  userCreated: string | null;
  userUpdated: string | null;
}

export const useUsuarioLogado = () => {
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Busca os dados do usuário no localStorage
      const usuarioLogado = JSON.parse(
        localStorage.getItem("authToken") || "{}"
      ) as UsuarioLogado;

      // Verifica se os dados são válidos
      if (usuarioLogado && usuarioLogado.id) {
        setUsuario(usuarioLogado);
        // console.log("Usuário Logado:", usuarioLogado);
      } else {
        console.warn("Nenhum usuário logado encontrado no localStorage.");
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    usuario,
    isLoading,
  };
};