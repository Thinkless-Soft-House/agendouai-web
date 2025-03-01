
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
import { MoreHorizontal, ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Particao } from "@/pages/Particoes";

interface ParticaoTableProps {
  particoes: Particao[];
  isLoading: boolean;
  onEdit: (particao: Particao) => void;
  onDelete: (particao: Particao) => void;
}

export function ParticaoTable({
  particoes,
  isLoading,
  onEdit,
  onDelete,
}: ParticaoTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof Particao>("nome");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar partições pelo termo de busca
  const filteredParticoes = particoes.filter(
    (particao) =>
      particao.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      particao.empresaNome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      particao.tipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

    return sortDirection === "asc"
      ? (valueA as number) - (valueB as number)
      : (valueB as number) - (valueA as number);
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

  // Renderizar badge para o tipo de partição
  const renderTipoBadge = (tipo: string) => {
    switch (tipo) {
      case "sala":
        return <Badge className="bg-blue-500">Sala</Badge>;
      case "funcionario":
        return <Badge className="bg-green-500">Funcionário</Badge>;
      case "equipamento":
        return <Badge className="bg-amber-500">Equipamento</Badge>;
      default:
        return <Badge>{tipo}</Badge>;
    }
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
                onClick={() => toggleSort("tipo")}
              >
                <div className="flex items-center space-x-1">
                  <span>Tipo</span>
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
              <TableHead>Descrição</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => toggleSort("disponivel")}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedParticoes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhuma partição encontrada.
                </TableCell>
              </TableRow>
            ) : (
              paginatedParticoes.map((particao) => (
                <TableRow key={particao.id}>
                  <TableCell className="font-medium">{particao.nome}</TableCell>
                  <TableCell>{renderTipoBadge(particao.tipo)}</TableCell>
                  <TableCell>{particao.empresaNome}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {particao.descricao}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={particao.disponivel ? "default" : "outline"}
                      className={
                        particao.disponivel ? "bg-green-500" : "text-red-500"
                      }
                    >
                      {particao.disponivel ? "Disponível" : "Indisponível"}
                    </Badge>
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
