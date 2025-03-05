
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PendingApproval {
  id: string;
  title: string;
  client: string;
  time: string;
  date: string;
  empresa: string;
  particao: string;
}

interface PendingApprovalsProps {
  approvals: PendingApproval[];
  className?: string;
}

export function PendingApprovals({ approvals, className }: PendingApprovalsProps) {
  const { toast } = useToast();

  const handleApprove = (id: string) => {
    toast({
      title: "Agendamento aprovado",
      description: "O cliente será notificado da aprovação.",
    });
  };

  const handleReject = (id: string) => {
    toast({
      title: "Agendamento rejeitado",
      description: "O cliente será notificado da rejeição.",
    });
  };

  return (
    <Card className={cn("dashboard-card overflow-hidden", className)}>
      <div className="dashboard-card-gradient" />
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Aprovações Pendentes</CardTitle>
        {approvals.length > 0 && (
          <div className="relative h-6 w-6">
            <Bell className="h-6 w-6 text-primary" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
              {approvals.length}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {approvals.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              Nenhuma aprovação pendente.
            </div>
          ) : (
            approvals.map((approval) => (
              <div key={approval.id} className="p-4 hover:bg-accent/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{approval.title}</h3>
                    <p className="text-sm text-muted-foreground">{approval.client}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{approval.time}</div>
                    <div className="text-xs text-muted-foreground">{approval.date}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">{approval.empresa} - {approval.particao}</div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                      onClick={() => handleApprove(approval.id)}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Aprovar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleReject(approval.id)}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Rejeitar
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
