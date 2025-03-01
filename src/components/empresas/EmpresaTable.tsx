
import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Filter,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Trash,
  Building,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Empresa } from "@/pages/Empresas";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EmpresaTableProps {
  empresas: Empresa[];
  isLoading: boolean;
  onEdit: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
}

export function EmpresaTable({ empresas, isLoading, onEdit, onDelete }: EmpresaTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<keyof Empresa>("nome");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedEmpresas, setSelectedEmpresas] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | null>(null);

  const handleSort = (column: keyof Empresa) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedEmpresas = useMemo(() => {
    return empresas
      .filter((empresa) => {
        // Filtro de busca
        const searchMatch =
          search === "" ||
          empresa.nome.toLowerCase().includes(search.toLowerCase()) ||
          empresa.email.toLowerCase().includes(search.toLowerCase()) ||
          empresa.cnpj.includes(search);

        // Filtro de status
        const statusMatch = statusFilter === null || empresa.status === statusFilter;

        return searchMatch && statusMatch;
      })
      .sort((a, b) => {
        if (sortColumn === "criadoEm") {
          // Tratamento especial para datas
          const dateA = a.criadoEm ? new Date(a.criadoEm).getTime() : 0;
          const dateB = b.criadoEm ? new Date(b.criadoEm).getTime() : 0;
          return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        }

        // Ordenação padrão para strings
        const valueA = String(a[sortColumn]).toLowerCase();
        const valueB = String(b[sortColumn]).toLowerCase();
        return sortDirection === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
  }, [empresas, search, sortColumn, sortDirection, statusFilter]);

  // Paginação
  const pageCount = Math.ceil(filteredAndSortedEmpresas.length / itemsPerPage);
  const paginatedEmpresas = filteredAndSortedEmpresas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset current page when filters change
  React.useEffect(() => {
    if (currentPage > pageCount && pageCount > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, pageCount]);

  // Seleção em massa
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmpresas(paginatedEmpresas.map((empresa) => empresa.id));
    } else {
      setSelectedEmpresas([]);
    }
  };

  const handleSelectEmpresa = (checked: boolean, empresaId: string) => {
    if (checked) {
      setSelectedEmpresas([...selectedEmpresas, empresaId]);
    } else {
      setSelectedEmpresas(selectedEmpresas.filter((id) => id !== empresaId));
    }
  };

  const allOnPageSelected = paginatedEmpresas.length > 0 && 
    paginatedEmpresas.every((empresa) => selectedEmpresas.includes(empresa.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse flex flex-col space-y-4 w-full">
          <div className="h-10 bg-gray-200 rounded-md w-full"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-md w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar empresas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2">
              <p className="text-sm font-medium mb-2">Status</p>
              <div className="space-y-2">
                <div 
                  className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                  onClick={() => setStatusFilter(null)}
                >
                  <Checkbox
                    checked={statusFilter === null}
                    className="mr-2"
                  />
                  <span className="text-sm">Todos</span>
                </div>
                <div 
                  className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                  onClick={() => setStatusFilter(statusFilter === "active" ? null : "active")}
                >
                  <Checkbox
                    checked={statusFilter === "active"}
                    className="mr-2"
                  />
                  <span className="text-sm">Ativo</span>
                </div>
                <div 
                  className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                  onClick={() => setStatusFilter(statusFilter === "inactive" ? null : "inactive")}
                >
                  <Checkbox
                    checked={statusFilter === "inactive"}
                    className="mr-2"
                  />
                  <span className="text-sm">Inativo</span>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectedEmpresas.length > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-muted p-2">
          <span className="text-sm">{selectedEmpresas.length} empresa(s) selecionada(s)</span>
          <Button size="sm" variant="outline">
            Exportar Selecionadas
          </Button>
          <Button size="sm" variant="destructive">
            <Trash className="h-4 w-4 mr-1" />
            Excluir Selecionadas
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={allOnPageSelected} 
                  onCheckedChange={handleSelectAll}
                  aria-label="Selecionar todas as empresas"
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort("nome")}
              >
                <div className="flex items-center">
                  Nome
                  {sortColumn === "nome" && (
                    sortDirection === "asc" ? 
                    <ChevronUp className="ml-1 h-4 w-4" /> : 
                    <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort("cnpj")}
              >
                <div className="flex items-center">
                  CNPJ
                  {sortColumn === "cnpj" && (
                    sortDirection === "asc" ? 
                    <ChevronUp className="ml-1 h-4 w-4" /> : 
                    <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort("telefone")}
              >
                <div className="flex items-center">
                  Telefone
                  {sortColumn === "telefone" && (
                    sortDirection === "asc" ? 
                    <ChevronUp className="ml-1 h-4 w-4" /> : 
                    <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center">
                  Email
                  {sortColumn === "email" && (
                    sortDirection === "asc" ? 
                    <ChevronUp className="ml-1 h-4 w-4" /> : 
                    <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  Status
                  {sortColumn === "status" && (
                    sortDirection === "asc" ? 
                    <ChevronUp className="ml-1 h-4 w-4" /> : 
                    <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort("criadoEm")}
              >
                <div className="flex items-center">
                  Criado Em
                  {sortColumn === "criadoEm" && (
                    sortDirection === "asc" ? 
                    <ChevronUp className="ml-1 h-4 w-4" /> : 
                    <ChevronDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEmpresas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Nenhuma empresa encontrada.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmpresas.map((empresa) => (
                <TableRow 
                  key={empresa.id}
                  className={selectedEmpresas.includes(empresa.id) ? "bg-muted/50" : ""}
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedEmpresas.includes(empresa.id)} 
                      onCheckedChange={(checked) => handleSelectEmpresa(!!checked, empresa.id)}
                      aria-label={`Selecionar ${empresa.nome}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {empresa.nome}
                    </div>
                  </TableCell>
                  <TableCell>{empresa.cnpj}</TableCell>
                  <TableCell>{empresa.telefone}</TableCell>
                  <TableCell>{empresa.email}</TableCell>
                  <TableCell>
                    <Badge variant={empresa.status === "active" ? "success" : "destructive"}>
                      {empresa.status === "active" ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(empresa.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => onEdit(empresa)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(empresa)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(empresa)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {paginatedEmpresas.length} de {filteredAndSortedEmpresas.length} empresas
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
              let pageNumber;
              
              if (pageCount <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= pageCount - 2) {
                pageNumber = pageCount - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <PaginationItem key={i}>
                  <PaginationLink 
                    isActive={currentPage === pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))}
                className={currentPage === pageCount ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
