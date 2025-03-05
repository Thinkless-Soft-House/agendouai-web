
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
  DropdownMenuGroup,
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
  TrendingUp,
  TrendingDown,
  Database,
  Tag,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Empresa } from "@/pages/Empresas";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Line, Area, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface EmpresaTableProps {
  empresas: Empresa[];
  isLoading: boolean;
  onEdit: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
}

type ColumnConfig = {
  key: keyof Empresa | "acoes";
  label: string;
  visible: boolean;
  sortable?: boolean;
  icon?: React.ReactNode;
};

// Helper para formatação de valores
const formatarReais = (valor: number) => {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export function EmpresaTable({ empresas, isLoading, onEdit, onDelete }: EmpresaTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<keyof Empresa>("nome");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedEmpresas, setSelectedEmpresas] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | null>(null);
  const [planoFilter, setPlanoFilter] = useState<"basic" | "professional" | "enterprise" | null>(null);
  const [assinaturaFilter, setAssinaturaFilter] = useState<"trial" | "active" | "expired" | "canceled" | null>(null);
  const [inadimplenciaFilter, setInadimplenciaFilter] = useState<boolean | null>(null);
  const [categoriaFilter, setCategoriaFilter] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<"todas" | "ativas" | "inadimplentes" | "trial">("todas");
  const [minClientes, setMinClientes] = useState<number | null>(null);
  const [maxClientes, setMaxClientes] = useState<number | null>(null);

  // Configuração de colunas
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>([
    { key: "nome", label: "Nome", visible: true, sortable: true, icon: <Building className="h-4 w-4" /> },
    { key: "cnpj", label: "CNPJ", visible: true, sortable: true },
    { key: "categoriaNome", label: "Categoria", visible: true, sortable: true, icon: <Tag className="h-4 w-4" /> },
    { key: "plano", label: "Plano", visible: true, sortable: true, icon: <CreditCard className="h-4 w-4" /> },
    { key: "assinaturaStatus", label: "Assinatura", visible: true, sortable: true },
    { key: "totalClientes", label: "Clientes", visible: true, sortable: true, icon: <Users className="h-4 w-4" /> },
    { key: "totalAgendamentos", label: "Agendamentos", visible: true, sortable: true, icon: <Calendar className="h-4 w-4" /> },
    { key: "totalReceitaMes", label: "Receita", visible: true, sortable: true },
    { key: "utilizacaoStorage", label: "Storage", visible: false, sortable: true, icon: <Database className="h-4 w-4" /> },
    { key: "ultimoAcesso", label: "Último Acesso", visible: false, sortable: true, icon: <Clock className="h-4 w-4" /> },
    { key: "status", label: "Status", visible: true, sortable: true },
    { key: "diasInadimplente", label: "Inadimplência", visible: false, sortable: true, icon: <AlertCircle className="h-4 w-4" /> },
    { key: "criadoEm", label: "Criado Em", visible: false, sortable: true },
    { key: "acoes", label: "Ações", visible: true }
  ]);

  // Pegue todas as categorias únicas
  const categorias = useMemo(() => {
    const categoriasSet = new Set<string>();
    empresas.forEach(empresa => {
      if (empresa.categoriaNome) {
        categoriasSet.add(empresa.categoriaNome);
      }
    });
    return Array.from(categoriasSet);
  }, [empresas]);

  const toggleColumnVisibility = (key: string) => {
    setColumnConfig(prev => 
      prev.map(col => 
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleSort = (column: keyof Empresa) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const applyTabFilter = (empresas: Empresa[]) => {
    switch (currentTab) {
      case "ativas":
        return empresas.filter(e => e.status === "active");
      case "inadimplentes":
        return empresas.filter(e => e.inadimplente);
      case "trial":
        return empresas.filter(e => e.assinaturaStatus === "trial");
      default:
        return empresas;
    }
  };

  const filteredAndSortedEmpresas = useMemo(() => {
    return applyTabFilter(empresas)
      .filter((empresa) => {
        // Filtro de busca
        const searchMatch =
          search === "" ||
          empresa.nome.toLowerCase().includes(search.toLowerCase()) ||
          empresa.email.toLowerCase().includes(search.toLowerCase()) ||
          empresa.cnpj.includes(search);

        // Filtros específicos
        const statusMatch = statusFilter === null || empresa.status === statusFilter;
        const planoMatch = planoFilter === null || empresa.plano === planoFilter;
        const assinaturaMatch = assinaturaFilter === null || empresa.assinaturaStatus === assinaturaFilter;
        const inadimplenciaMatch = inadimplenciaFilter === null || empresa.inadimplente === inadimplenciaFilter;
        const categoriaMatch = categoriaFilter === null || empresa.categoriaNome === categoriaFilter;
        
        // Filtros de intervalo
        const clientesMinMatch = minClientes === null || (empresa.totalClientes !== undefined && empresa.totalClientes >= minClientes);
        const clientesMaxMatch = maxClientes === null || (empresa.totalClientes !== undefined && empresa.totalClientes <= maxClientes);

        return searchMatch && statusMatch && planoMatch && assinaturaMatch && 
               inadimplenciaMatch && categoriaMatch && clientesMinMatch && clientesMaxMatch;
      })
      .sort((a, b) => {
        // Casos especiais para tipos específicos
        if (sortColumn === "criadoEm" || sortColumn === "ultimoAcesso" || sortColumn === "dataVencimento") {
          const dateA = a[sortColumn] ? new Date(a[sortColumn] as string).getTime() : 0;
          const dateB = b[sortColumn] ? new Date(b[sortColumn] as string).getTime() : 0;
          return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        }

        // Para números
        if (typeof a[sortColumn] === 'number' && typeof b[sortColumn] === 'number') {
          return sortDirection === "asc" 
            ? (a[sortColumn] as number) - (b[sortColumn] as number)
            : (b[sortColumn] as number) - (a[sortColumn] as number);
        }

        // Ordenação padrão para strings
        const valueA = String(a[sortColumn] || "").toLowerCase();
        const valueB = String(b[sortColumn] || "").toLowerCase();
        return sortDirection === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
  }, [empresas, search, sortColumn, sortDirection, statusFilter, planoFilter, 
      assinaturaFilter, inadimplenciaFilter, categoriaFilter, currentTab, 
      minClientes, maxClientes]);

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

  const clearAllFilters = () => {
    setStatusFilter(null);
    setPlanoFilter(null);
    setAssinaturaFilter(null);
    setInadimplenciaFilter(null);
    setCategoriaFilter(null);
    setMinClientes(null);
    setMaxClientes(null);
    setSearch("");
  };

  const allOnPageSelected = paginatedEmpresas.length > 0 && 
    paginatedEmpresas.every((empresa) => selectedEmpresas.includes(empresa.id));

  // Renderização de células específicas
  const renderCellContent = (empresa: Empresa, column: ColumnConfig) => {
    const key = column.key;

    switch (key) {
      case "nome":
        return (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            {empresa.nome}
          </div>
        );
      
      case "status":
        return (
          <Badge variant={empresa.status === "active" ? "success" : "destructive"}>
            {empresa.status === "active" ? "Ativa" : "Inativa"}
          </Badge>
        );
      
      case "assinaturaStatus":
        const assinaturaVariant = 
          empresa.assinaturaStatus === "active" ? "success" :
          empresa.assinaturaStatus === "trial" ? "outline" :
          empresa.assinaturaStatus === "expired" ? "destructive" : "secondary";
        
        const assinaturaLabel =
          empresa.assinaturaStatus === "active" ? "Ativa" :
          empresa.assinaturaStatus === "trial" ? "Trial" :
          empresa.assinaturaStatus === "expired" ? "Expirada" : "Cancelada";
        
        return (
          <Badge variant={assinaturaVariant}>
            {assinaturaLabel}
          </Badge>
        );
      
      case "plano":
        const planoLabel = 
          empresa.plano === "basic" ? "Básico" :
          empresa.plano === "professional" ? "Profissional" : "Enterprise";
        
        const planoVariant =
          empresa.plano === "basic" ? "outline" :
          empresa.plano === "professional" ? "default" : "success";
        
        return (
          <Badge variant={planoVariant}>
            {planoLabel}
          </Badge>
        );
      
      case "totalClientes":
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span>{empresa.totalClientes}</span>
            </div>
            <div className="w-full h-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ value: empresa.totalClientes || 0 }]}>
                  <Bar dataKey="value" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      
      case "totalAgendamentos":
        return (
          <div className="flex flex-col gap-1">
            <span>{empresa.totalAgendamentos}</span>
            <div className="w-full h-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={empresa.historicoFaturamento?.map(h => ({ mes: h.mes, valor: h.valor / 100 })) || []}
                >
                  <Area type="monotone" dataKey="valor" stroke="#8b5cf6" fill="#8b5cf680" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      
      case "totalReceitaMes":
        return (
          <div className="flex flex-col gap-1">
            <span>{formatarReais(empresa.totalReceitaMes || 0)}</span>
            <div className="flex items-center text-xs">
              {(empresa.historicoCrescimento?.[0]?.percentual || 0) > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">+{empresa.historicoCrescimento?.[0]?.percentual}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500">{empresa.historicoCrescimento?.[0]?.percentual}%</span>
                </>
              )}
            </div>
          </div>
        );
      
      case "utilizacaoStorage":
        return (
          <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between">
              <span className="text-xs">{empresa.utilizacaoStorage}%</span>
              <span className="text-xs text-muted-foreground">10GB</span>
            </div>
            <Progress 
              value={empresa.utilizacaoStorage} 
              className={cn(
                empresa.utilizacaoStorage && empresa.utilizacaoStorage > 90 ? "text-red-500" : 
                empresa.utilizacaoStorage && empresa.utilizacaoStorage > 75 ? "text-amber-500" : 
                "text-green-500"
              )}
            />
          </div>
        );
      
      case "ultimoAcesso":
        return empresa.ultimoAcesso ? (
          <span>{formatDistanceToNow(new Date(empresa.ultimoAcesso), { addSuffix: true, locale: ptBR })}</span>
        ) : "Nunca";
      
      case "diasInadimplente":
        if (!empresa.inadimplente) return <span className="text-green-500">Em dia</span>;
        
        return (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-500">{empresa.diasInadimplente} dias</span>
          </div>
        );
      
      case "criadoEm":
        return empresa.criadoEm ? format(new Date(empresa.criadoEm), "dd/MM/yyyy", { locale: ptBR }) : "";
      
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
                <DropdownMenuItem>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Ver assinatura
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  Ver usuários
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
        return String(empresa[key as keyof Empresa] || "");
    }
  };

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
      {/* Tabs para filtragem rápida */}
      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todas">Todas ({empresas.length})</TabsTrigger>
          <TabsTrigger value="ativas">Ativas ({empresas.filter(e => e.status === "active").length})</TabsTrigger>
          <TabsTrigger value="inadimplentes">Inadimplentes ({empresas.filter(e => e.inadimplente).length})</TabsTrigger>
          <TabsTrigger value="trial">Em Trial ({empresas.filter(e => e.assinaturaStatus === "trial").length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Barra de pesquisa e filtros */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
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
              {(statusFilter || planoFilter || assinaturaFilter || inadimplenciaFilter || categoriaFilter || 
                minClientes || maxClientes) && 
                <Badge variant="secondary" className="ml-2">Ativos</Badge>
              }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[280px]">
            <DropdownMenuLabel>Filtros</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
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
            
            <DropdownMenuSeparator />
            <div className="p-2">
              <p className="text-sm font-medium mb-2">Plano</p>
              <div className="space-y-2">
                <div 
                  className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                  onClick={() => setPlanoFilter(null)}
                >
                  <Checkbox
                    checked={planoFilter === null}
                    className="mr-2"
                  />
                  <span className="text-sm">Todos</span>
                </div>
                <div 
                  className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                  onClick={() => setPlanoFilter(planoFilter === "basic" ? null : "basic")}
                >
                  <Checkbox
                    checked={planoFilter === "basic"}
                    className="mr-2"
                  />
                  <span className="text-sm">Básico</span>
                </div>
                <div 
                  className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                  onClick={() => setPlanoFilter(planoFilter === "professional" ? null : "professional")}
                >
                  <Checkbox
                    checked={planoFilter === "professional"}
                    className="mr-2"
                  />
                  <span className="text-sm">Profissional</span>
                </div>
                <div 
                  className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                  onClick={() => setPlanoFilter(planoFilter === "enterprise" ? null : "enterprise")}
                >
                  <Checkbox
                    checked={planoFilter === "enterprise"}
                    className="mr-2"
                  />
                  <span className="text-sm">Enterprise</span>
                </div>
              </div>
            </div>
            
            <DropdownMenuSeparator />
            <div className="p-2">
              <p className="text-sm font-medium mb-2">Assinatura</p>
              <div className="space-y-2">
                <div 
                  className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                  onClick={() => setAssinaturaFilter(null)}
                >
                  <Checkbox
                    checked={assinaturaFilter === null}
                    className="mr-2"
                  />
                  <span className="text-sm">Todos</span>
                </div>
                <div 
                  className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                  onClick={() => setAssinaturaFilter(assinaturaFilter === "active" ? null : "active")}
                >
                  <Checkbox
                    checked={assinaturaFilter === "active"}
                    className="mr-2"
                  />
                  <span className="text-sm">Ativa</span>
                </div>
                <div 
                  className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                  onClick={() => setAssinaturaFilter(assinaturaFilter === "trial" ? null : "trial")}
                >
                  <Checkbox
                    checked={assinaturaFilter === "trial"}
                    className="mr-2"
                  />
                  <span className="text-sm">Trial</span>
                </div>
                <div 
                  className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                  onClick={() => setAssinaturaFilter(assinaturaFilter === "expired" ? null : "expired")}
                >
                  <Checkbox
                    checked={assinaturaFilter === "expired"}
                    className="mr-2"
                  />
                  <span className="text-sm">Expirada</span>
                </div>
                <div 
                  className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                  onClick={() => setAssinaturaFilter(assinaturaFilter === "canceled" ? null : "canceled")}
                >
                  <Checkbox
                    checked={assinaturaFilter === "canceled"}
                    className="mr-2"
                  />
                  <span className="text-sm">Cancelada</span>
                </div>
              </div>
            </div>
            
            <DropdownMenuSeparator />
            <div className="p-2">
              <p className="text-sm font-medium mb-2">Inadimplência</p>
              <div className="space-y-2">
                <div 
                  className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                  onClick={() => setInadimplenciaFilter(null)}
                >
                  <Checkbox
                    checked={inadimplenciaFilter === null}
                    className="mr-2"
                  />
                  <span className="text-sm">Todos</span>
                </div>
                <div 
                  className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                  onClick={() => setInadimplenciaFilter(inadimplenciaFilter === true ? null : true)}
                >
                  <Checkbox
                    checked={inadimplenciaFilter === true}
                    className="mr-2"
                  />
                  <span className="text-sm">Inadimplentes</span>
                </div>
                <div 
                  className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                  onClick={() => setInadimplenciaFilter(inadimplenciaFilter === false ? null : false)}
                >
                  <Checkbox
                    checked={inadimplenciaFilter === false}
                    className="mr-2"
                  />
                  <span className="text-sm">Em dia</span>
                </div>
              </div>
            </div>
            
            <DropdownMenuSeparator />
            <div className="p-2">
              <p className="text-sm font-medium mb-2">Categoria</p>
              <div className="space-y-2 max-h-[150px] overflow-auto">
                <div 
                  className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                  onClick={() => setCategoriaFilter(null)}
                >
                  <Checkbox
                    checked={categoriaFilter === null}
                    className="mr-2"
                  />
                  <span className="text-sm">Todas</span>
                </div>
                
                {categorias.map(categoria => (
                  <div 
                    key={categoria}
                    className="flex items-center cursor-pointer hover:bg-muted px-2 py-1 rounded-md"
                    onClick={() => setCategoriaFilter(categoriaFilter === categoria ? null : categoria)}
                  >
                    <Checkbox
                      checked={categoriaFilter === categoria}
                      className="mr-2"
                    />
                    <span className="text-sm">{categoria}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={clearAllFilters}
              className="cursor-pointer justify-center font-medium text-primary"
            >
              Limpar todos os filtros
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Colunas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Exibir colunas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {columnConfig.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={column.visible}
                onCheckedChange={() => toggleColumnVisibility(column.key)}
              >
                {column.icon && <span className="mr-2">{column.icon}</span>}
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Itens por página: {itemsPerPage}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Itens por página</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[5, 10, 20, 50, 100].map((value) => (
              <DropdownMenuItem 
                key={value} 
                onClick={() => setItemsPerPage(value)}
                className={itemsPerPage === value ? "bg-muted" : ""}
              >
                {value}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectedEmpresas.length > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-muted p-2">
          <span className="text-sm">{selectedEmpresas.length} empresa(s) selecionada(s)</span>
          <Button size="sm" variant="outline">
            Exportar Selecionadas
          </Button>
          <Button size="sm" variant="outline">
            Enviar Email
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
              
              {columnConfig
                .filter(column => column.visible)
                .map(column => (
                  <TableHead 
                    key={column.key}
                    className={cn(
                      column.sortable ? "cursor-pointer hover:bg-muted" : "",
                      column.key === "acoes" ? "w-[80px]" : ""
                    )}
                    onClick={() => column.sortable && column.key !== "acoes" && handleSort(column.key as keyof Empresa)}
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
                    selectedEmpresas.includes(empresa.id) ? "bg-muted/50" : "",
                    empresa.inadimplente ? "border-l-2 border-l-red-500" : ""
                  )}
                >
                  <TableCell>
                    <Checkbox 
                      checked={selectedEmpresas.includes(empresa.id)} 
                      onCheckedChange={(checked) => handleSelectEmpresa(!!checked, empresa.id)}
                      aria-label={`Selecionar ${empresa.nome}`}
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
