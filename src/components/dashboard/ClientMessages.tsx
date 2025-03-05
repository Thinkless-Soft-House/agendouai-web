
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MessageSquare, CornerUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface ClientMessage {
  id: string;
  client: string;
  avatar?: string;
  message: string;
  time: string;
  date: string;
  read: boolean;
}

interface ClientMessagesProps {
  messages: ClientMessage[];
  className?: string;
}

export function ClientMessages({ messages, className }: ClientMessagesProps) {
  const { toast } = useToast();

  const handleReply = (id: string) => {
    toast({
      title: "Resposta iniciada",
      description: "Abrindo janela de resposta.",
    });
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <Card className={cn("dashboard-card overflow-hidden", className)}>
      <div className="dashboard-card-gradient" />
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Mensagens de Clientes</CardTitle>
        {unreadCount > 0 && (
          <div className="relative h-6 w-6">
            <MessageSquare className="h-6 w-6 text-primary" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
              {unreadCount}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {messages.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              Nenhuma mensagem recebida.
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={cn(
                "p-4 hover:bg-accent/50 transition-colors",
                !message.read && "bg-blue-50"
              )}>
                <div className="flex gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={message.avatar} alt={message.client} />
                    <AvatarFallback>{message.client.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-medium">{message.client}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">{message.time} - {message.date}</div>
                      </div>
                    </div>
                    <p className="text-sm mb-2">{message.message}</p>
                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-8 text-primary"
                        onClick={() => handleReply(message.id)}
                      >
                        <CornerUpRight className="mr-1 h-4 w-4" />
                        Responder
                      </Button>
                    </div>
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
