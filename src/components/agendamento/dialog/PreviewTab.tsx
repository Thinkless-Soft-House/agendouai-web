import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AgendamentoFormValues } from "./schema";
import { Empresa } from "@/pages/Empresas";
import { Particao } from "@/pages/Particoes";
import { User } from "@/hooks/useUsers";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { 
  CalendarIcon, 
  UserCircle, 
  MapPin, 
  Clock, 
  CheckCircle,
  AlertCircle 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface PreviewTabProps {
  form: UseFormReturn<AgendamentoFormValues>;
  empresas: Empresa[];
  particoes: Particao[];
  isAdmin?: boolean;
  users?: User[];
  selectedUser?: User | null;
}

export function PreviewTab({ 
  form, 
  empresas, 
  particoes, 
  isAdmin = false, 
  users = [],
  selectedUser
}: PreviewTabProps) {
  // Get current values directly from form
  const formValues = form.getValues();
  const empresaId = formValues.empresaId;
  const particaoId = formValues.particaoId;
  const usuarioId = formValues.usuarioId;
  
  // Find empresa and particao using the IDs
  const empresaSelecionada = empresas.find(e => e.id.toString() === empresaId);
  const particaoSelecionada = particoes.find(p => p.id.toString() === particaoId);

  // Use the selectedUser prop if available, otherwise find by ID
  const userDisplay = selectedUser || (usuarioId ? users.find(user => user.id === usuarioId) : undefined);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado":
        return <Badge className="bg-green-500">Confirmado</Badge>;
      case "pendente":
        return <Badge className="bg-yellow-500">Pendente</Badge>;
      case "cancelado":
        return <Badge className="bg-red-500">Cancelado</Badge>;
      case "finalizado":
        return <Badge className="bg-blue-500">Finalizado</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  // For debugging
  console.log("PreviewTab - formValues:", formValues);
  console.log("PreviewTab - empresaSelecionada:", empresaSelecionada);
  console.log("PreviewTab - particaoSelecionada:", particaoSelecionada);
  console.log("PreviewTab - userDisplay:", userDisplay);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={empresaSelecionada?.imageUrl} />
                <AvatarFallback>
                  {empresaSelecionada?.nome?.substring(0, 2) || "NA"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">
                  {empresaSelecionada?.nome || "Empresa não selecionada"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {particaoSelecionada?.nome || "Partição não selecionada"}
                </p>
              </div>
            </div>
            {getStatusBadge(formValues.status)}
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {formValues.data
                  ? format(formValues.data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : "Data não selecionada"}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {`${formValues.horarioInicio} - ${formValues.horarioFim}`}
              </span>
            </div>
            
            {/* Show selected user information */}
            <div className="flex items-center space-x-2">
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {userDisplay?.name || "Cliente não selecionado"}
              </span>
            </div>
            
            {/* Show user's phone number if available */}
            {userDisplay?.telefone && userDisplay.telefone !== "Telefone não informado" && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{userDisplay.telefone}</span>
              </div>
            )}
          </div>
          
          {formValues.observacoes && (
            <>
              <Separator className="my-4" />
              <div className="text-sm">
                <h4 className="font-medium mb-1">Observações:</h4>
                <p className="text-muted-foreground">
                  {formValues.observacoes}
                </p>
              </div>
            </>
          )}
          
          <Separator className="my-4" />
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {formValues.status === "pendente" ? (
                <div className="flex items-center text-yellow-500">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>Aguardando confirmação</span>
                </div>
              ) : formValues.status === "confirmado" ? (
                <div className="flex items-center text-green-500">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Confirmado</span>
                </div>
              ) : (
                <span>Status: {formValues.status}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
