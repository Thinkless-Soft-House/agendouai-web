
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
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  className?: string;
}

export function UpcomingAppointments({ appointments, className }: UpcomingAppointmentsProps) {
  const { toast } = useToast();

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

  return (
    <Card className={cn("dashboard-card overflow-hidden", className)}>
      <div className="dashboard-card-gradient" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Próximos Agendamentos</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            Ver todos
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {appointments.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              Nenhum agendamento próximo.
            </div>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <h3 className="font-medium">{appointment.title}</h3>
                      <Badge variant="outline" className={cn("text-xs inline-flex h-5 px-2", getStatusColor(appointment.status))}>
                        {getStatusText(appointment.status)}
                      </Badge>
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
