import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown, Search, Clock, User, QrCode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Particao } from "@/pages/Particoes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEmpresas } from "@/hooks/useEmpresas"; // Import the new hook
import { useResponsaveis } from "@/hooks/useResponsaveis"; // Import the new hook
import { useFuncionarios } from "@/hooks/useFuncionarios";

interface ParticaoTableProps {
  particoes: Particao[];
  isLoading: boolean;
  onEdit: (particao: Particao) => void;
  onDelete: (particao: Particao) => void;
  onGenerateQrCode: (particao: Particao, type: "empresa" | "particao") => void;
}

export function ParticaoTable({
  particoes,
  isLoading,
  onEdit,
  onDelete,
  onGenerateQrCode,
}: ParticaoTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Particao>("nome");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { empresas, isLoadingEmpresas } = useEmpresas();
  const { responsaveis, isLoadingResponsaveis } = useResponsaveis();
  const { funcionarios, isLoadingUsuarios } = useFuncionarios();

  const enrichedParticoes = particoes
    .map((particao) => {
      // Verifique se os dados necessários estão carregados
      if (isLoadingResponsaveis || isLoadingUsuarios) {
        return null;
      }

      const empresaCorrespondente = empresas.find(
        (empresa) => empresa.id === particao.empresaId
      );

      console.log("Processando partição:", particao.nome);
      
      // Verificar responsáveis na estrutura completa
      let responsaveisDaParticao = [];
        
      if (particao.responsavel && particao.responsavel.length > 0) {
        responsaveisDaParticao = particao.responsavel.map((resp) => {
          // Obter o ID do usuário
          const usuarioId = typeof resp.usuarioId === 'string' 
            ? resp.usuarioId 
            : String(resp.usuarioId);
            
          // Encontrar o usuário completo nos funcionários
          const usuario = funcionarios.find(f => String(f.id) === String(usuarioId));
          
          console.log(`Responsável ID ${usuarioId} → Usuário encontrado:`, usuario ? usuario.pessoa.nome : "Não encontrado");
          
          return {
            ...resp,
            usuario: usuario || {
              id: usuarioId,
              nome: "Usuário não encontrado", 
              email: "",
              role: "Desconhecido",
            }
          };
        });
      }
      
      console.log("Responsáveis processados:", responsaveisDaParticao.map(r => r.usuario?.pessoa.nome || "Não definido"));

      return {
        ...particao,
        empresaNome: empresaCorrespondente?.nome || "Empresa não encontrada",
        responsaveisDaParticao
      };
    })
    .filter((particao) => particao !== null);

  const filteredParticoes = enrichedParticoes.filter(
    (particao) =>
      particao.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      particao.empresaNome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      particao.descricao.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ordenar partições
  const sortedParticoes = [...filteredParticoes].sort((a, b) => {
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];

    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    if (valueA === undefined) return sortDirection === "asc" ? -1 : 1;
    if (valueB === undefined) return sortDirection === "asc" ? 1 : -1;

    // Para valores booleanos
    if (typeof valueA === "boolean" && typeof valueB === "boolean") {
      return sortDirection === "asc"
        ? (valueA ? 1 : 0) - (valueB ? 1 : 0)
        : (valueB ? 1 : 0) - (valueA ? 1 : 0);
    }

    // Se os tipos não forem compatíveis para comparação matemática, retorne 0
    if (
      typeof valueA === "object" ||
      typeof valueB === "object" ||
      Array.isArray(valueA) ||
      Array.isArray(valueB)
    ) {
      return 0;
    }

    return 0;
  });

  // Calcular páginas
  const totalPages = Math.ceil(sortedParticoes.length / itemsPerPage);
  const paginatedParticoes = sortedParticoes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Função para trocar a ordenação
  const toggleSort = (column: keyof Particao) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Formatar disponibilidade para exibição
  const formatDisponibilidade = (particao: Particao) => {
    console.log("Formatando disponibilidade para:", particao.nome);
    console.log("Dados de disponibilidade:", particao.disponibilidades);
    
    // Verifica se não há disponibilidades
    if (!particao.disponibilidades || particao.disponibilidades.length === 0) {
      return "Não configurada";
    }

    // Definição da ordem dos dias da semana (0=Domingo, 1=Segunda, etc.)
    const ordemDias = ["0", "1", "2", "3", "4", "5", "6"];
    
    // Mapeia os dias numéricos para nomes abreviados
    const mapeamentoDias: Record<string, string> = {
      "0": "Dom", // Domingo
      "1": "Seg", // Segunda
      "2": "Ter", // Terça
      "3": "Qua", // Quarta
      "4": "Qui", // Quinta
      "5": "Sex", // Sexta
      "6": "Sáb", // Sábado
    };

    // Criar um objeto de pesquisa rápida dos dias disponíveis
    const diasDisponiveis = particao.disponibilidades.reduce((acc, config) => {
      if (config.ativo) {
        acc[config.diaSemana] = true;
      }
      return acc;
    }, {} as Record<string, boolean>);

    // Mapeia os dias da semana ativos na ordem correta
    const diasAtivosOrdenados = ordemDias
      .filter(dia => diasDisponiveis[dia])
      .map(dia => mapeamentoDias[dia] || dia);

    // Se houver dias ativos, retorna a lista como string separada por vírgulas
    return diasAtivosOrdenados.length > 0 ? diasAtivosOrdenados.join(", ") : "Indisponível";
  };

  // Renderizar esqueletos de carregamento
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[250px]" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar partições..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("nome")}
              >
                <div className="flex items-center space-x-1">
                  <span>Nome</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("empresaNome")}
              >
                <div className="flex items-center space-x-1">
                  <span>Empresa</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Responsáveis</TableHead>
              <TableHead>
                <div className="flex items-center space-x-1">
                  <span>Disponibilidade</span>
                  <Clock className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("status")}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-center">QR Code</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedParticoes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhuma partição encontrada.
                </TableCell>
              </TableRow>
            ) : (
              paginatedParticoes.map((particao) => (
                <TableRow key={particao.id}>
                  <TableCell className="font-medium">{particao.nome}</TableCell>
                  <TableCell>{particao.empresaNome}</TableCell>
                  <TableCell>
                    <div className="flex -space-x-2 overflow-hidden">
                      {particao.responsaveisDaParticao &&
                      particao.responsaveisDaParticao.length > 0 ? (
                        <TooltipProvider>
                          {particao.responsaveisDaParticao
                            .slice(0, 3)
                            .map((responsavelComUsuario, index) => (
                              <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                  <Avatar className="h-8 w-8 border-2 border-background">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                      {responsavelComUsuario.usuario.pessoa.nome ? 
                                        responsavelComUsuario.usuario.pessoa.nome.charAt(0) : 
                                        <User className="h-4 w-4" />}
                                    </AvatarFallback>
                                  </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {responsavelComUsuario.usuario.pessoa.nome || "Nome não definido"}
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          {particao.responsaveisDaParticao.length > 3 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Avatar className="h-8 w-8 border-2 border-background">
                                  <AvatarFallback className="bg-muted text-muted-foreground">
                                    +
                                    {particao.responsaveisDaParticao.length -
                                      3}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent>
                                Mais{" "}
                                {particao.responsaveisDaParticao.length - 3}{" "}
                                responsáveis
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Não definidos
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      <span>{formatDisponibilidade(particao)}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        particao.status === 1 ? "default" : "outline"
                      }
                      className={
                        particao.status === 1
                          ? "bg-green-500"
                          : "text-red-500"
                      }
                    >
                      {particao.status === 1
                        ? "Disponível"
                        : "Indisponível"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => onGenerateQrCode(particao, "empresa")}
                              className="h-8 w-8"
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>QR Code da Empresa</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => onGenerateQrCode(particao, "particao")}
                              className="h-8 w-8"
                            >
                              <QrCode className="h-4 w-4 text-primary" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>QR Code da Partição</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          aria-label="Menu de ações"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(particao)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete(particao)}
                        >
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando{" "}
            <span className="font-medium">
              {Math.min(
                (currentPage - 1) * itemsPerPage + 1,
                filteredParticoes.length
              )}
            </span>{" "}
            a{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredParticoes.length)}
            </span>{" "}
            de <span className="font-medium">{filteredParticoes.length}</span>{" "}
            resultados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
