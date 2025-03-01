
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
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { User } from "@/pages/Users";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserTable({ users, isLoading, onEdit, onDelete }: UserTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<keyof User>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | null>(null);

  const handleSort = (column: keyof User) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedUsers = useMemo(() => {
    return users
      .filter((user) => {
        // Filtro de busca
        const searchMatch =
          search === "" ||
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase());

        // Filtro de cargo
        const roleMatch = roleFilter === null || user.role === roleFilter;

        // Filtro de status
        const statusMatch = statusFilter === null || user.status === statusFilter;

        return searchMatch && roleMatch && statusMatch;
      })
      .sort((a, b) => {
        if (sortColumn === "lastLogin") {
          // Tratamento especial para datas
          const dateA = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
          const dateB = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
          return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        }

        // Ordenação padrão para strings
        const valueA = String(a[sortColumn]).toLowerCase();
        const valueB = String(b[sortColumn]).toLowerCase();
        return sortDirection === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
  }, [users, search, sortColumn, sortDirection, roleFilter, statusFilter]);

  // Paginação
  const pageCount = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const paginatedUsers = filteredAndSortedUsers.slice(
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
      setSelectedUsers(paginatedUsers.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (checked: boolean, userId: string) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const allOnPageSelected = paginatedUsers.length > 0 && 
    paginatedUsers.every((user) => selectedUsers.includes(user.id));

  // Roles únicas para filtro
  const uniqueRoles = useMemo(() => {
    return Array.from(new Set(users.map((user) => user.role)));
  }, [users]);

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
            placeholder="Buscar usuários..."
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
              <p className="text-sm font-medium mb-2">Cargo</p>
              <div className="space-y-2">
                <div 
                  className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                  onClick={() => setRoleFilter(null)}
                >
                  <Checkbox
                    checked={roleFilter === null}
                    className="mr-2"
                  />
                  <span className="text-sm">Todos</span>
                </div>
                {uniqueRoles.map((role) => (
                  <div 
                    key={role} 
                    className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                    onClick={() => setRoleFilter(role === roleFilter ? null : role)}
                  >
                    <Checkbox
                      checked={roleFilter === role}
                      className="mr-2"
                    />
                    <span className="text-sm">{role}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-2" />
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

      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-muted p-2">
          <span className="text-sm">{selectedUsers.length} usuário(s) selecionado(s)</span>
          <Button size="sm" variant="outline">
            Exportar Selecionados
          </Button>
          <Button size="sm" variant="destructive">
            <Trash className="h-4 w-4 mr-1" />
            Excluir Selecionados
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
                  aria-label="Selecionar todos os usuários"
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Nome
                  {sortColumn === "name" && (
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
                onClick={() => handleSort("role")}
              >
                <div className="flex items-center">
                  Cargo
                  {sortColumn === "role" && (
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
                onClick={() => handleSort("lastLogin")}
              >
                <div className="flex items-center">
                  Último Login
                  {sortColumn === "lastLogin" && (
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
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow 
                  key={user.id}
                  className={selectedUsers.includes(user.id) ? "bg-muted/50" : ""}
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedUsers.includes(user.id)} 
                      onCheckedChange={(checked) => handleSelectUser(!!checked, user.id)}
                      aria-label={`Selecionar ${user.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "Admin" ? "default" : user.role === "Editor" ? "secondary" : "outline"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "active" ? "success" : "destructive"}>
                      {user.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin 
                      ? format(new Date(user.lastLogin), "dd/MM/yyyy HH:mm", { locale: ptBR })
                      : "Nunca"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => onEdit(user)}
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
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(user)}
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
          Mostrando {paginatedUsers.length} de {filteredAndSortedUsers.length} usuários
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
