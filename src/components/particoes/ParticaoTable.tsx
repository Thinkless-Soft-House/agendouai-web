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
import { Espaco } from "@/pages/Particoes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEmpresas } from "@/hooks/useEmpresas";

interface EspacoTableProps {
  espacos: Espaco[];
  isLoading: boolean;
  onEdit: (espaco: Espaco) => void;
  onDelete: (espaco: Espaco) => void;
  onGenerateQrCode: (espaco: Espaco, type: "empresa" | "espaco") => void;
  funcionarios: any[];
  isLoadingFuncionarios: boolean;
}

export function EspacoTable({
  espacos,
  isLoading,
  onEdit,
  onDelete,
  onGenerateQrCode,
  funcionarios,
  isLoadingFuncionarios,
}: EspacoTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Espaco>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { empresas, isLoadingEmpresas } = useEmpresas();

  const enrichedEspacos = espacos
    .map((espaco) => {
      if (isLoadingFuncionarios) {
        return null;
      }
      const empresaCorrespondente = empresas.find(
        (empresa) => empresa.id === espaco.companyId
      );
      // Responsáveis: spaceManagers (backend) ou compatibilidade
      let responsaveisDoEspaco = [];
      if (espaco.spaceManagers && espaco.spaceManagers.length > 0) {
        responsaveisDoEspaco = espaco.spaceManagers.map((manager) => {
          const usuarioId = String(manager.usuarioId || manager.userId || manager.id);
          const usuario = funcionarios.find(f => String(f.id) === usuarioId);
          return {
            ...manager,
            usuario: usuario || {
              id: usuarioId,
              nome: "Usuário não encontrado",
              email: "",
              role: "Desconhecido",
            }
          };
        });
      }
      return {
        ...espaco,
        companyName: empresaCorrespondente?.name || "Empresa não encontrada",
        responsaveisDoEspaco
      };
    })
    .filter((espaco) => espaco !== null);

  const filteredEspacos = enrichedEspacos.filter(
    (espaco) =>
      (espaco.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (espaco.companyName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (espaco.descricao || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedEspacos = [...filteredEspacos].sort((a, b) => {
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];
    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    if (valueA === undefined) return sortDirection === "asc" ? -1 : 1;
    if (valueB === undefined) return sortDirection === "asc" ? 1 : -1;
    if (typeof valueA === "boolean" && typeof valueB === "boolean") {
      return sortDirection === "asc"
        ? (valueA ? 1 : 0) - (valueB ? 1 : 0)
        : (valueB ? 1 : 0) - (valueA ? 1 : 0);
    }
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

  const totalPages = Math.ceil(sortedEspacos.length / itemsPerPage);
  const paginatedEspacos = sortedEspacos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (column: keyof Espaco) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Formatar disponibilidade para exibição
  const formatDisponibilidade = (espaco: Espaco) => {
    if (!espaco.availabilities || espaco.availabilities.length === 0) {
      return "Não configurada";
    }
    // Exemplo: mostrar dias ativos
    const ordemDias = ["0", "1", "2", "3", "4", "5", "6"];
    const mapeamentoDias: Record<string, string> = {
      "0": "Dom",
      "1": "Seg",
      "2": "Ter",
      "3": "Qua",
      "4": "Qui",
      "5": "Sex",
      "6": "Sáb",
    };
    const diasDisponiveis = espaco.availabilities.reduce((acc, config) => {
      if (config.ativo) {
        acc[config.diaSemana] = true;
      }
      return acc;
    }, {} as Record<string, boolean>);
    const diasAtivosOrdenados = ordemDias
      .filter(dia => diasDisponiveis[dia])
      .map(dia => mapeamentoDias[dia] || dia);
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
            placeholder="Buscar espaços..."
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
                onClick={() => toggleSort("name")}
              >
                <div className="flex items-center space-x-1">
                  <span>Nome</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("companyName")}
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
            {paginatedEspacos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum espaço encontrado.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEspacos.map((espaco) => (
                <TableRow key={espaco.id}>
                  <TableCell className="font-medium">{espaco.name}</TableCell>
                  <TableCell>{espaco.companyName}</TableCell>
                  <TableCell>
                    <div className="flex -space-x-2 overflow-hidden">
                      {espaco.responsaveisDoEspaco &&
                      espaco.responsaveisDoEspaco.length > 0 ? (
                        <TooltipProvider>
                          {espaco.responsaveisDoEspaco
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
                          {espaco.responsaveisDoEspaco.length > 3 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Avatar className="h-8 w-8 border-2 border-background">
                                  <AvatarFallback className="bg-muted text-muted-foreground">
                                    +
                                    {espaco.responsaveisDoEspaco.length -
                                      3}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent>
                                Mais{" "}
                                {espaco.responsaveisDoEspaco.length - 3}{" "}
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
                      <span>{formatDisponibilidade(espaco)}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        espaco.status === "active" ? "default" : "outline"
                      }
                      className={
                        espaco.status === "active"
                          ? "bg-green-500"
                          : "text-red-500"
                      }
                    >
                      {espaco.status === 'active'
                        ? 'Disponível'
                        : 'Indisponível'}
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
                              onClick={() => onGenerateQrCode(espaco, "empresa")}
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
                              onClick={() => onGenerateQrCode(espaco, "espaco")}
                              className="h-8 w-8"
                            >
                              <QrCode className="h-4 w-4 text-primary" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>QR Code do Espaço</TooltipContent>
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
                        <DropdownMenuItem onClick={() => onEdit(espaco)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete(espaco)}
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
                filteredEspacos.length
              )}
            </span>{" "}
            a{" "}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredEspacos.length)}
            </span>{" "}
            de <span className="font-medium">{filteredEspacos.length}</span>{" "}
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
