import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Agendamento } from "@/types/agendamento";
import { Espaco } from "@/pages/Particoes";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface SchedulingTabProps {
  form: UseFormReturn<Agendamento>;
  espacos: Espaco[];
  handleTimeSlotSelect: (startTime: string, endTime: string) => void;
  handleDateChange: (date: Date) => void;
  diasDisponiveis: number[];
  horariosDisponiveis: string[];
}

export function SchedulingTab({
  form,
  espacos,
  handleTimeSlotSelect,
  handleDateChange,
  diasDisponiveis,
  horariosDisponiveis,
}: SchedulingTabProps) {
  const [activeTab, setActiveTab] = useState("date");
  // data é string ISO no form, converter para Date para o calendário
  const selectedDateISO = form.watch("data");
  const selectedDate = selectedDateISO ? new Date(selectedDateISO) : undefined;
  const selectedStartTime = form.watch("startTime");
  const selectedSpaceId = parseInt(form.watch("spaceId"));
  const selectedEspaco = espacos.find(p => p.id === selectedSpaceId);

  // Format the list of available days of the week for display
  const formatDaysOfWeek = (days: number[]) => {
    const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    return days.map(day => dayNames[day]).join(", ");
  };

  // Função para calcular horário fim baseado no início
  const calcularHorarioFim = (startTime: string) => {
    const [hora, minuto] = startTime.split(":").map(Number);
    const horaFim = hora + 1;
    return `${horaFim.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`;
  };
  
  // Move para a aba de horário após selecionar a data
  const handleDateSelection = (date: Date | undefined) => {
    if (date) {
      // Salva como string ISO no form
      form.setValue("data", date.toISOString());
      handleDateChange(date);
      setActiveTab("time");
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Selecione a Data e Horário</h3>
      
      {/* Display selected espaco info */}
      {selectedEspaco && (
        <Card className="bg-slate-50">
          <CardContent className="p-2">
            <h4 className="font-medium">{selectedEspaco.nome}</h4>
            <p className="text-sm text-muted-foreground">{selectedEspaco.descricao}</p>
            
            {diasDisponiveis.length > 0 && (
              <div className="mt-1">
                <Badge variant="outline" className="bg-white text-xs">
                  Disponível: {formatDaysOfWeek(diasDisponiveis)}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="date" className="text-sm">Data</TabsTrigger>
          <TabsTrigger value="time" disabled={!selectedDate} className="text-sm">Horário</TabsTrigger>
        </TabsList>
        
        <TabsContent value="date" className="pt-2 w-full">
          {/* Date selection */}
          <div className="w-full">
            <div className="w-full flex justify-center">
              <div className="w-full max-h-50 overflow-hidden">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelection}
                  disabled={(date) => {
                    // Disable dates in the past
                    const isInPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                    
                    // Disable days not in the available days list
                    const dayOfWeek = date.getDay();
                    const isDayAvailable = diasDisponiveis.includes(dayOfWeek);
                    
                    return isInPast || !isDayAvailable;
                  }}
                  className="border rounded-md"
                />
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="time" className="space-y-2 pt-2">
          {/* Time slots selection */}
          <div className="space-y-2">
            <FormLabel>Horário</FormLabel>
            {horariosDisponiveis.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
                {horariosDisponiveis.map((horario) => {
                  const endTime = calcularHorarioFim(horario);
                  const isSelected = selectedStartTime === horario;
                  
                  return (
                    <Button
                      key={horario}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handleTimeSlotSelect(horario, endTime)}
                      className={cn(
                        "h-auto py-2",
                        isSelected ? "bg-primary text-primary-foreground" : ""
                      )}
                    >
                      {horario}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground border rounded-md">
                Nenhum horário disponível para a data selecionada
              </div>
            )}
          </div>
          
          {/* Selected time range display */}
          {selectedStartTime && (
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                    <div>
                      <p className="text-sm font-medium">Horário selecionado</p>
                      <p className="text-lg font-bold">
                        {selectedStartTime} - {field.value}
                      </p>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
