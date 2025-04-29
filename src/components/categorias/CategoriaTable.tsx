import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Categoria } from "@/pages/Categorias";

interface CategoriaTableProps {
  categorias: Categoria[];
  isLoading: boolean;
  onEdit: (categoria: Categoria) => void;
  onDelete: (categoria: Categoria) => void;
}

export function CategoriaTable({
  categorias,
  isLoading,
  onEdit,
  onDelete,
}: CategoriaTableProps) {
  if (isLoading) {
    return <CategoriaTableSkeleton />;
  }

  const formatarData = (data: string | Date | undefined | null) => {
    if (!data) return "N/A";

    let dataConvertida =
      typeof data === "string" ? parseISO(data) : new Date(data);

    return isValid(dataConvertida)
      ? format(dataConvertida, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
      : "N/A";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Nome da Partição</TableHead>
            <TableHead>Empresas Vinculadas</TableHead>
            {/* <TableHead>Data de Criação</TableHead> */}
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categorias.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">
                Nenhuma categoria encontrada.
              </TableCell>
            </TableRow>
          ) : (
            categorias.map((categoria) => (
              <TableRow key={categoria.id}>
                <TableCell className="font-medium">{categoria.descricao}</TableCell>
                <TableCell>{categoria.prefixParticao}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {categoria.totalEmpresas}
                  </Badge>
                </TableCell>
                {/* <TableCell>
                  {formatarData(categoria.criadoEm)}
                  </TableCell> */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(categoria)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(categoria)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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
  );
}

function CategoriaTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Nome da Partição</TableHead>
            <TableHead>Empresas Vinculadas</TableHead>
            {/* <TableHead>Data de Criação</TableHead> */}
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-[120px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[40px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[140px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8 rounded-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
