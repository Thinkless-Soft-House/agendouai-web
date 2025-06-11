import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AgendamentoFormValues } from "./schema";
import { Company } from "@/hooks/useEmpresas";
import { Espaco } from "@/pages/Particoes";
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
  empresas: Company[];
  espacos: Espaco[];
  isAdmin?: boolean;
  users?: User[];
  selectedUser?: User | null;
}

export function PreviewTab({
  form,
  empresas,
  espacos,
  isAdmin = false,
  users = [],
  selectedUser,
}: PreviewTabProps) {
  // Get current values directly from form
  const formValues = form.getValues();
  const empresaId = formValues.empresaId;
  const espacoId = formValues.espacoId;
  const usuarioId = formValues.usuarioId;

  console.log("PreviewTab - espacoId:", espacoId, "type:", typeof espacoId);
  console.log("PreviewTab - espacos:", espacos);

  // Find empresa and espaco using the IDs - normalize both to strings for comparison
  const empresaSelecionada =
    empresas.find((e) => String(e.id) === String(empresaId)) ||
    // Fallback - try to find by numeric comparison
    empresas.find((e) => e.id === Number(empresaId));

  const espacoSelecionado =
    espacos.find((p) => String(p.id) === String(espacoId)) ||
    espacos.find((p) => p.id === Number(espacoId));

  // Use the selectedUser prop if available, otherwise find by ID
  const userDisplay =
    selectedUser ||
    (usuarioId ? users.find((user) => user.id === usuarioId) : undefined);

  // Prepare display values with fallbacks
  const empresaNomeDisplay =
    empresaSelecionada?.name ||
    (typeof empresaId === "number" || typeof empresaId === "string" && empresaId !== ""
      ? `Empresa ID: ${empresaId}`
      : "Empresa não selecionada");

  // Always show "Sala não selecionada" instead of "Sala ID: " when espacoId is empty
  const espacoNomeDisplay = espacoSelecionado?.nome || 
    (espacoId && espacoId !== "" ? `Sala ID: ${espacoId}` : "Sala não selecionada");

  // For a better user experience, check if the sala selection is empty and show a message
  const isSalaSelected = espacoId && espacoId !== "";
  

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

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={empresaSelecionada?.logoUrl} />
                <AvatarFallback>
                  {empresaNomeDisplay.substring(0, 2) || "NA"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{empresaNomeDisplay}</h3>
                <p className="text-sm text-muted-foreground">
                  {isSalaSelected ? espacoNomeDisplay : (
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
                <span>Status: {formValues.status}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
