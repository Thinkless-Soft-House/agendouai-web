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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
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
  CreditCard,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  Database,
  Tag,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Company } from "@/hooks/useEmpresas";

// Defina o tipo ColumnConfig corretamente
type ColumnConfig = {
  key: keyof Company | "acoes";
  label: string;
  visible: boolean;
  sortable?: boolean;
  icon?: React.ReactNode;
};

interface EmpresaTableProps {
  empresas: Company[];
  isLoadingEmpresas: boolean;
  onEdit: (empresa: Company) => void;
  onDelete: (empresa: Company) => void;
}

export function EmpresaTable({
  empresas,
  isLoadingEmpresas,
  onEdit,
  onDelete,
}: EmpresaTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<keyof Company>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedEmpresas, setSelectedEmpresas] = useState<string[]>([]);

  // Colunas ajustadas para os campos reais
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>([
    { key: "name", label: "Nome", visible: true, sortable: true, icon: <Building className="h-4 w-4" /> },
    { key: "cpfCnpj", label: "CNPJ", visible: true, sortable: true },
    { key: "categoryId", label: "Categoria", visible: true, sortable: true, icon: <Tag className="h-4 w-4" /> },
    { key: "status", label: "Status", visible: true, sortable: true },
    { key: "city", label: "Cidade", visible: true, sortable: true },
    { key: "state", label: "UF", visible: true, sortable: true },
    { key: "phone", label: "Telefone", visible: true, sortable: true },
    { key: "acoes", label: "Ações", visible: true }
  ]);

  // Filtro e ordenação
  const filteredAndSortedEmpresas = useMemo(() => {
    return empresas
      .filter((empresa) => {
        const searchMatch =
          search === "" ||
          (empresa.name && empresa.name.toLowerCase().includes(search.toLowerCase())) ||
          (empresa.cpfCnpj && empresa.cpfCnpj.includes(search));
        return searchMatch;
      })
      .sort((a, b) => {
        const valueA = String(a[sortColumn] || "").toLowerCase();
        const valueB = String(b[sortColumn] || "").toLowerCase();
        return sortDirection === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
  }, [empresas, search, sortColumn, sortDirection]);

  // Paginação
  const pageCount = Math.ceil(filteredAndSortedEmpresas.length / itemsPerPage);
  const paginatedEmpresas = filteredAndSortedEmpresas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Seleção em massa
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmpresas(paginatedEmpresas.map((empresa) => String(empresa.id)));
    } else {
      setSelectedEmpresas([]);
    }
  };

  const handleSelectEmpresa = (checked: boolean, empresaId: string) => {
    if (checked) {
      setSelectedEmpresas([...selectedEmpresas, String(empresaId)]);
    } else {
      setSelectedEmpresas(selectedEmpresas.filter((id) => id !== String(empresaId)));
    }
  };

  const allOnPageSelected = paginatedEmpresas.length > 0 && 
    paginatedEmpresas.every((empresa) => selectedEmpresas.includes(String(empresa.id)));

  // Renderização de células específicas
  const renderCellContent = (empresa: Company, column: ColumnConfig) => {
    const key = column.key;

    switch (key) {
      case "name":
        return (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            {empresa.name}
          </div>
        );
      case "cpfCnpj":
        return empresa.cpfCnpj;
      case "categoryId":
        return empresa.category?.description || empresa.categoryId || "-";
      case "status":
        return (
          <Badge variant={empresa.status === "ativo" ? "success" : "destructive"}>
            {empresa.status === "ativo" ? "Ativa" : "Inativa"}
          </Badge>
        );
      case "city":
        return empresa.city || "-";
      case "state":
        return empresa.state || "-";
      case "phone":
        return empresa.phone || "-";
      case "acoes":
        return (
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
                <DropdownMenuSeparator />
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
        );
      default:
        return String(empresa[key as keyof Company] || "");
    }
  };

  if (isLoadingEmpresas) {
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
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar empresas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

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
              {columnConfig
                .filter(column => column.visible)
                .map(column => (
                  <TableHead 
                    key={column.key}
                    className={cn(
                      column.sortable ? "cursor-pointer hover:bg-muted" : "",
                      column.key === "acoes" ? "w-[80px]" : ""
                    )}
                    onClick={() => column.sortable && column.key !== "acoes" && setSortColumn(column.key as keyof Company)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.sortable && column.key === sortColumn && (
                        sortDirection === "asc" ? 
                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                ))
              }
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEmpresas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnConfig.filter(c => c.visible).length + 1} className="h-24 text-center">
                  Nenhuma empresa encontrada.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmpresas.map((empresa) => (
                <TableRow 
                  key={empresa.id}
                  className={cn(
                    selectedEmpresas.includes(String(empresa.id)) ? "bg-muted/50" : ""
                  )}
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedEmpresas.includes(String(empresa.id))} 
                      onCheckedChange={(checked) => handleSelectEmpresa(!!checked, String(empresa.id))}
                      aria-label={`Selecionar ${empresa.name}`}
                    />
                  </TableCell>
                  {columnConfig
                    .filter(column => column.visible)
                    .map(column => (
                      <TableCell key={`${empresa.id}-${column.key}`}>
                        {renderCellContent(empresa, column)}
                      </TableCell>
                    ))
                  }
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
