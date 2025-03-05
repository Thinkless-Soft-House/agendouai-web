
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ArrowRight,
  MoreHorizontal,
  Building,
  MapPin,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  title: string;
  client: string;
  time: string;
  date: string;
  status: "confirmed" | "pending" | "cancelled";
  empresa: string;
  particao: string;
  requiresAction?: boolean;
  actionType?: "approval" | "response" | "update" | "review";
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  className?: string;
  showRequiringActionOnly?: boolean;
}

export function UpcomingAppointments({ 
  appointments, 
  className,
  showRequiringActionOnly = false 
}: UpcomingAppointmentsProps) {
  const { toast } = useToast();
  
  const filteredAppointments = showRequiringActionOnly 
    ? appointments.filter(app => app.requiresAction) 
    : appointments;

  const handleConfirm = (id: string) => {
    toast({
      title: "Agendamento confirmado",
      description: "O cliente será notificado automaticamente.",
    });
  };

  const handleCancel = (id: string) => {
    toast({
      title: "Agendamento cancelado",
      description: "O cliente será notificado automaticamente.",
    });
  };

  const handleMessage = (id: string) => {
    toast({
      title: "Enviar mensagem",
      description: "Abrindo chat com o cliente.",
    });
  };

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getStatusText = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return "Confirmado";
      case "pending":
        return "Pendente";
      case "cancelled":
        return "Cancelado";
      default:
        return "Desconhecido";
    }
  };

  const getActionBadge = (actionType?: Appointment["actionType"]) => {
    if (!actionType) return null;
    
    switch (actionType) {
      case "approval":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            Aprovação Pendente
          </Badge>
        );
      case "response":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
            Resposta Pendente
          </Badge>
        );
      case "update":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
            Atualização Necessária
          </Badge>
        );
      case "review":
        return (
          <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-500/20">
            Revisão Pendente
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn("dashboard-card overflow-hidden", className)}>
      <div className="dashboard-card-gradient" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {showRequiringActionOnly ? "Ações Necessárias" : "Próximos Agendamentos"}
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            Ver todos
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {filteredAppointments.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              {showRequiringActionOnly 
                ? "Nenhuma ação pendente." 
                : "Nenhum agendamento próximo."}
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className={cn(
                  "p-4 hover:bg-accent/50 transition-colors",
                  appointment.requiresAction && "border-l-4 border-amber-400"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <h3 className="font-medium">
                        {appointment.requiresAction && (
                          <AlertCircle className="inline h-4 w-4 text-amber-500 mr-1" />
                        )}
                        {appointment.title}
                      </h3>
                      <Badge variant="outline" className={cn("text-xs inline-flex h-5 px-2", getStatusColor(appointment.status))}>
                        {getStatusText(appointment.status)}
                      </Badge>
                      {appointment.requiresAction && getActionBadge(appointment.actionType)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Cliente: {appointment.client}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {appointment.date}
                    </div>
                    <div className="flex items-center justify-end text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {appointment.time}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-1 text-xs mt-2">
                  <div className="flex items-center text-muted-foreground">
                    <Building className="h-3 w-3 mr-1" />
                    {appointment.empresa}
                  </div>
                  <span className="text-muted-foreground mx-1">•</span>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    {appointment.particao}
                  </div>
                </div>
                
                <div className="flex items-center justify-end mt-2 gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7" 
                        onClick={() => handleConfirm(appointment.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Confirmar</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7" 
                        onClick={() => handleCancel(appointment.id)}
                      >
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Cancelar</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7" 
                        onClick={() => handleMessage(appointment.id)}
                      >
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Mensagem</TooltipContent>
                  </Tooltip>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast({ description: "Visualizando detalhes" })}>
                        Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast({ description: "Reagendando" })}>
                        Reagendar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast({ description: "Copiando link" })}>
                        Copiar link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
