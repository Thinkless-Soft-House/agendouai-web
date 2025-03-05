
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Check, X, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  title: string;
  client: string;
  time: string;
  date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
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
      description: "O cliente será notificado da confirmação.",
    });
  };

  const handleCancel = (id: string) => {
    toast({
      title: "Agendamento cancelado",
      description: "O cliente será notificado do cancelamento.",
    });
  };

  const handleView = (id: string) => {
    toast({
      title: "Visualizando detalhes",
      description: "Redirecionando para os detalhes do agendamento.",
    });
  };

  const getStatusBadge = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pendente</Badge>;
      case "confirmed":
        return <Badge className="bg-green-500">Confirmado</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="text-red-500 border-red-500">Cancelado</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Concluído</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <Card className={cn("dashboard-card overflow-hidden", className)}>
      <div className="dashboard-card-gradient" />
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Próximos Agendamentos</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {appointments.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              Nenhum agendamento próximo encontrado.
            </div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="p-4 hover:bg-accent/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{appointment.title}</h3>
                    <p className="text-sm text-muted-foreground">{appointment.client}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{appointment.time}</div>
                    <div className="text-xs text-muted-foreground">{appointment.date}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{appointment.empresa} - {appointment.particao}</span>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <div className="flex items-center gap-1">
                    {appointment.status === "pending" && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-100"
                          onClick={() => handleConfirm(appointment.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-100"
                          onClick={() => handleCancel(appointment.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => handleView(appointment.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
