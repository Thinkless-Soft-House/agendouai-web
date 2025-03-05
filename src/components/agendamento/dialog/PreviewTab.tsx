
import React from "react";
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
import { UseFormReturn } from "react-hook-form";
import { Empresa } from "@/pages/Empresas";
import { Particao } from "@/pages/Particoes";
import { z } from "zod";
import { agendamentoSchema } from "./schema";

type AgendamentoFormValues = z.infer<typeof agendamentoSchema>;

interface PreviewTabProps {
  form: UseFormReturn<AgendamentoFormValues>;
  empresas: Empresa[];
  particoes: Particao[];
}

export function PreviewTab({
  form,
  empresas,
  particoes,
}: PreviewTabProps) {
  const empresaSelecionada = empresas.find(e => e.id === form.getValues().empresaId);
  const particaoSelecionada = particoes.find(p => p.id === form.getValues().particaoId);

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
          {getStatusBadge(form.getValues().status)}
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {form.getValues().data
                ? format(form.getValues().data, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                : "Data não selecionada"}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {`${form.getValues().horarioInicio} - ${form.getValues().horarioFim}`}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <UserCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {form.getValues().clienteNome || "Cliente não informado"}
            </span>
          </div>
          
          {form.getValues().clienteTelefone && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{form.getValues().clienteTelefone}</span>
            </div>
          )}
        </div>
        
        {form.getValues().observacoes && (
          <>
            <Separator className="my-4" />
            <div className="text-sm">
              <h4 className="font-medium mb-1">Observações:</h4>
              <p className="text-muted-foreground">
                {form.getValues().observacoes}
              </p>
            </div>
          </>
        )}
        
        <Separator className="my-4" />
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {form.getValues().status === "pendente" ? (
              <div className="flex items-center text-yellow-500">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Aguardando confirmação</span>
              </div>
            ) : form.getValues().status === "confirmado" ? (
              <div className="flex items-center text-green-500">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Confirmado</span>
              </div>
            ) : (
              <span>Status: {form.getValues().status}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
