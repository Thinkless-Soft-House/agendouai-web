import { useEffect, useState } from "react";

export interface AuthResponseData {
  accessToken: string | null;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    companyId: number | null;
    person: {
      id: number;
      name: string;
      phoneNumber: string;
      cpf: string;
      birthDate: string;
      cep: string;
      address: string;
      addressNumber: string;
      city: string;
      state: string;
      country: string;
      photoUrl: string;
      companyId: number | null;
      createdAt: string;
      updatedAt: string;
      createdBy: string | null;
      updatedBy: string | null;
    };
  };
}

export const useUsuarioLogado = () => {
  const [usuario, setUsuario] = useState<AuthResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const accessToken = localStorage.getItem("authToken");
      const raw = localStorage.getItem("user");
      let usuarioLogado: AuthResponseData | null = null;

      if (accessToken && raw) {
        const user = JSON.parse(raw);
        usuarioLogado = {
          accessToken,
          user,
        };
      }

      if (usuarioLogado && usuarioLogado.user && usuarioLogado.user.id) {
        setUsuario(usuarioLogado);
      } else {
        setUsuario(null);
      }
    } catch (error) {
      setUsuario(null);
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