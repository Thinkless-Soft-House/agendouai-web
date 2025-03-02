
import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState("general");
  
  // Estado para as configurações
  const [settings, setSettings] = useState({
    systemName: "Agendou Aí",
    notificationsEmail: true,
    notificationsSMS: false,
    notificationsWhatsapp: true,
    autoConfirmBookings: false,
    bookingTimeSlotDuration: 60, // minutos
    maxAdvanceBookingDays: 30,
    logoUrl: "",
    primaryColor: "#0ea5e9",
    allowGuestBookings: true,
  });

  const handleSaveGeneral = () => {
    // Aqui iria a lógica para salvar configurações gerais
    toast({
      title: "Configurações gerais salvas",
      description: "As novas configurações foram aplicadas com sucesso.",
    });
  };

  const handleSaveNotifications = () => {
    // Aqui iria a lógica para salvar configurações de notificações
    toast({
      title: "Configurações de notificações salvas",
      description: "As preferências de notificação foram atualizadas.",
    });
  };

  const handleSaveAppearance = () => {
    // Aqui iria a lógica para salvar configurações de aparência
    toast({
      title: "Configurações de aparência salvas",
      description: "As alterações visuais foram aplicadas com sucesso.",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie todas as configurações do sistema.
          </p>
        </div>
        
        <Tabs 
          defaultValue="general" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-8">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configure as informações básicas do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="systemName">Nome do Sistema</Label>
                  <Input 
                    id="systemName" 
                    value={settings.systemName}
                    onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bookingTimeSlot">Duração dos Intervalos de Agendamento (minutos)</Label>
                    <Input 
                      id="bookingTimeSlot" 
                      type="number" 
                      value={settings.bookingTimeSlotDuration}
                      onChange={(e) => setSettings({...settings, bookingTimeSlotDuration: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxAdvanceBooking">Máximo de Dias para Agendamento Antecipado</Label>
                    <Input 
                      id="maxAdvanceBooking" 
                      type="number" 
                      value={settings.maxAdvanceBookingDays}
                      onChange={(e) => setSettings({...settings, maxAdvanceBookingDays: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="autoConfirmBookings" 
                    checked={settings.autoConfirmBookings}
                    onCheckedChange={(checked) => setSettings({...settings, autoConfirmBookings: checked})}
                  />
                  <Label htmlFor="autoConfirmBookings">Confirmar agendamentos automaticamente</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="allowGuestBookings" 
                    checked={settings.allowGuestBookings}
                    onCheckedChange={(checked) => setSettings({...settings, allowGuestBookings: checked})}
                  />
                  <Label htmlFor="allowGuestBookings">Permitir agendamentos sem cadastro</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveGeneral}>Salvar Alterações</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>
                  Configure como as notificações serão enviadas para você e seus clientes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="notificationsEmail" 
                      checked={settings.notificationsEmail}
                      onCheckedChange={(checked) => setSettings({...settings, notificationsEmail: checked})}
                    />
                    <Label htmlFor="notificationsEmail">Enviar notificações por email</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="notificationsSMS" 
                      checked={settings.notificationsSMS}
                      onCheckedChange={(checked) => setSettings({...settings, notificationsSMS: checked})}
                    />
                    <Label htmlFor="notificationsSMS">Enviar notificações por SMS</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="notificationsWhatsapp" 
                      checked={settings.notificationsWhatsapp}
                      onCheckedChange={(checked) => setSettings({...settings, notificationsWhatsapp: checked})}
                    />
                    <Label htmlFor="notificationsWhatsapp">Enviar notificações por WhatsApp</Label>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Eventos para Notificação</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="notifyNewBooking" defaultChecked />
                      <Label htmlFor="notifyNewBooking">Novo agendamento</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="notifyBookingConfirmation" defaultChecked />
                      <Label htmlFor="notifyBookingConfirmation">Confirmação de agendamento</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="notifyBookingCancellation" defaultChecked />
                      <Label htmlFor="notifyBookingCancellation">Cancelamento de agendamento</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch id="notifyReminder" defaultChecked />
                      <Label htmlFor="notifyReminder">Lembrete (24h antes)</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveNotifications}>Salvar Alterações</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>
                  Personalize a aparência do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">URL do Logo</Label>
                  <Input 
                    id="logoUrl" 
                    placeholder="https://exemplo.com/logo.png"
                    value={settings.logoUrl}
                    onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Cor Primária</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="primaryColor" 
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                    />
                    <div 
                      className="w-10 h-10 rounded-md border" 
                      style={{backgroundColor: settings.primaryColor}}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <div className="flex space-x-4">
                    <Button variant="outline" className="flex-1">Claro</Button>
                    <Button variant="outline" className="flex-1">Escuro</Button>
                    <Button variant="default" className="flex-1">Automático</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveAppearance}>Salvar Alterações</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Avançadas</CardTitle>
                <CardDescription>
                  Configurações avançadas do sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Chave de API</Label>
                  <div className="flex space-x-2">
                    <Input id="apiKey" type="password" value="••••••••••••••••••••••" readOnly />
                    <Button variant="outline">Revelar</Button>
                    <Button variant="outline">Gerar Nova</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Backup do Sistema</Label>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">Exportar Dados</Button>
                    <Button variant="outline" className="flex-1">Importar Backup</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Zona de Perigo</h3>
                  <p className="text-sm text-muted-foreground">
                    Estas ações são irreversíveis. Por favor, tenha certeza antes de prosseguir.
                  </p>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button variant="destructive">Limpar Todos os Dados</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Salvar Alterações</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
