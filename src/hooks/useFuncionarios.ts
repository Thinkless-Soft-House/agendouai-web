import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Empresa {
    id: number;
    nome: string;
}

export type Usuario = {
    id: number;
    login: string;
    role: "Administrador" | "Empresa" | "Funcionario" | "Cliente";
    status: "active" | "inactive";
    empresaId: Empresa;
    lastLogin?: string;
    // Campos adicionais para a entidade Pessoa
    pessoa: {
        nome: string;
        cpf: string;
        telefone?: string;
        endereco?: string;
        cidade?: string;
        estado?: string;
        cep?: string;
    }
};

export const useFuncionarios = () => {
    const fetchFuncionarios = async (): Promise<Usuario[]> => { // Altere para Promise<Usuario[]>
        try {
            const response = await axios.get<{ data: any }>(
                `http://localhost:3000/usuario/permissao/3`
            );
            
            const res = response.data.data.data;

            return res.map((usuario: any) => ({
                id: usuario.id,
                login: usuario.login,           
                status: usuario.status,
                role: usuario.permissao.descricao,
                empresaId: usuario.empresa,
                pessoa: {
                    nome: usuario.pessoa.nome,
                    cpf: usuario.pessoa.cpfCnpj,
                    telefone: usuario.pessoa.telefone,
                    endereco: usuario.pessoa.endereco,
                    cidade: usuario.pessoa.municipio,
                    estado: usuario.pessoa.estado,
                    cep: usuario.pessoa.cep,
                }
            }));
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            throw new Error(
                "Falha ao carregar usuários. Tente novamente mais tarde."
            );
        }
    };

    const { data: funcionarios = [], isLoading: isLoadingUsuarios } = useQuery({
        queryKey: ["usuarios"],
        queryFn: fetchFuncionarios,
    });

    return {
        funcionarios,
        isLoadingUsuarios
    };
};
