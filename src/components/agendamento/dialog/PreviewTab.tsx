import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AgendamentoFormValues } from "./schema";
import { Empresa } from "@/pages/Empresas";
import { Particao } from "@/pages/Particoes";
import { User } from "@/hooks/useUsers";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  UserCircle,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
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
  selectedUser,
}: PreviewTabProps) {
  // Get current values directly from form
  const formValues = form.getValues();
  const empresaId = formValues.empresaId;
  const particaoId = formValues.particaoId;
  const usuarioId = formValues.usuarioId;

  console.log("PreviewTab - particaoId:", particaoId, "type:", typeof particaoId);
  console.log("PreviewTab - particoes:", particoes);

  // Find empresa and particao using the IDs - normalize both to strings for comparison
  const empresaSelecionada =
    empresas.find((e) => String(e.id) === String(empresaId)) ||
    // Fallback - try to find by numeric comparison
    empresas.find((e) => e.id === Number(empresaId));

  const particaoSelecionada =
    particoes.find((p) => String(p.id) === String(particaoId)) ||
    particoes.find((p) => p.id === Number(particaoId));

  // Use the selectedUser prop if available, otherwise find by ID
  const userDisplay =
    selectedUser ||
    (usuarioId ? users.find((user) => user.id === usuarioId) : undefined);

  // Prepare display values with fallbacks
  const empresaNomeDisplay =
    empresaSelecionada?.nome ||
    (typeof empresaId === "number" || typeof empresaId === "string" && empresaId !== ""
      ? `Empresa ID: ${empresaId}`
      : "Empresa não selecionada");

  // Always show "Sala não selecionada" instead of "Sala ID: " when particaoId is empty
  const particaoNomeDisplay = particaoSelecionada?.nome || 
    (particaoId && particaoId !== "" ? `Sala ID: ${particaoId}` : "Sala não selecionada");

  // For a better user experience, check if the sala selection is empty and show a message
  const isSalaSelected = particaoId && particaoId !== "";
  
  // Function to map status code to readable string
  const getStatusString = (status: string): string => {
    switch (status) {
      case "1": return "Aguardando";
      case "2": return "Confirmado";
      case "3": return "Cancelado";
      case "4": return "Finalizado";
      case "5": return "Reprovado";
      // Keep existing cases for backwards compatibility
      case "pendente": return "Pendente";
      case "confirmado": return "Confirmado";
      case "cancelado": return "Cancelado";
      case "finalizado": return "Finalizado";
      default: return status || "Desconhecido";
    }
  };

  const getStatusBadge = (status: string) => {
    // Get the status string for display
    const statusText = getStatusString(status);
    
    // Determine badge color based on status
    switch (status) {
      case "2":
      case "confirmado":
        return <Badge className="bg-green-500">{statusText}</Badge>;
      case "1":
      case "pendente":
        return <Badge className="bg-yellow-500">{statusText}</Badge>;
      case "3":
      case "cancelado":
        return <Badge className="bg-red-500">{statusText}</Badge>;
      case "4":
      case "finalizado":
        return <Badge className="bg-blue-500">{statusText}</Badge>;
      case "5":
        return <Badge className="bg-purple-500">{statusText}</Badge>;
      default:
        return <Badge>{statusText}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={empresaSelecionada?.imageUrl} />
                <AvatarFallback>
                  {empresaNomeDisplay.substring(0, 2) || "NA"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{empresaNomeDisplay}</h3>
                <p className="text-sm text-muted-foreground">
                  {isSalaSelected ? particaoNomeDisplay : (
                    <span className="text-orange-500">Selecione uma sala</span>
                  )}
                </p>
              </div>
            </div>
            {getStatusBadge(formValues.status)}
          </div>
          
          {/* Show warning if sala not selected */}
          {!isSalaSelected && (
            <div className="mt-2 p-2 bg-orange-50 text-orange-700 text-sm rounded-md">
              Você precisa selecionar uma sala na aba Informações antes de continuar.
            </div>
          )}

          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {formValues.data
                  ? format(formValues.data, "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })
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
            {userDisplay?.telefone &&
              userDisplay.telefone !== "Telefone não informado" && (
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
                <span>Status: {getStatusString(formValues.status)}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
