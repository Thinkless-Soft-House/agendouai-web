
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, Clock } from "lucide-react";
import { Particao } from "@/pages/Particoes";

interface TimeSlotSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
  selectedParticaoId: string;
  particoes: Particao[];
  selectedHorarioInicio: string;
  selectedHorarioFim: string;
  onTimeSlotSelect: (horarioInicio: string, horarioFim: string) => void;
  isLoading?: boolean;
}

const horariosDisponiveis = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

// Mock used slots - in a real app this would come from an API
const mockUsedSlots = [
  { data: new Date(2023, 2, 15), horarios: ["09:00", "14:00"] },
  { data: new Date(2023, 2, 16), horarios: ["10:00", "15:00", "16:00"] },
  { data: new Date(2023, 2, 17), horarios: ["08:00", "17:00"] },
];

export function TimeSlotSelector({
  date,
  onDateChange,
  selectedParticaoId,
  particoes,
  selectedHorarioInicio,
  selectedHorarioFim,
  onTimeSlotSelect,
  isLoading = false
}: TimeSlotSelectorProps) {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(horariosDisponiveis);
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(selectedHorarioInicio);
  const [duration, setDuration] = useState<number>(1); // duration in hours

  // Get the selected partição
  const selectedParticao = particoes.find(p => p.id === selectedParticaoId);

  // In a real app, this would fetch available slots from an API
  useEffect(() => {
    if (isLoading) return;

    // Simulate fetching available time slots
    const fetchAvailableSlots = () => {
      // Find if there are any used slots for the selected date
      const usedSlotsForDate = mockUsedSlots.find(slot => 
        slot.data.getDate() === date.getDate() && 
        slot.data.getMonth() === date.getMonth() && 
        slot.data.getFullYear() === date.getFullYear()
      );

      // If there are used slots, filter them out
      if (usedSlotsForDate) {
        const available = horariosDisponiveis.filter(
          horario => !usedSlotsForDate.horarios.includes(horario)
        );
        setAvailableTimeSlots(available);
      } else {
        setAvailableTimeSlots(horariosDisponiveis);
      }
    };

    fetchAvailableSlots();
  }, [date, selectedParticaoId, isLoading]);

  // When a start time is selected, calculate the end time based on duration
  useEffect(() => {
    if (selectedStartTime) {
      const startIndex = horariosDisponiveis.indexOf(selectedStartTime);
      if (startIndex !== -1 && startIndex + duration < horariosDisponiveis.length) {
        const endTime = horariosDisponiveis[startIndex + duration];
        onTimeSlotSelect(selectedStartTime, endTime);
      }
    }
  }, [selectedStartTime, duration, onTimeSlotSelect]);

  const handleTimeSlotSelect = (horario: string) => {
    setSelectedStartTime(horario);
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    if (selectedStartTime) {
      const startIndex = horariosDisponiveis.indexOf(selectedStartTime);
      if (startIndex !== -1 && startIndex + newDuration < horariosDisponiveis.length) {
        const endTime = horariosDisponiveis[startIndex + newDuration];
        onTimeSlotSelect(selectedStartTime, endTime);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="date" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="date">Data</TabsTrigger>
          <TabsTrigger value="time">Horários</TabsTrigger>
        </TabsList>

        <TabsContent value="date" className="space-y-4 pt-4">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && onDateChange(newDate)}
              locale={ptBR}
              className="rounded-md border"
              disabled={(currentDate) => 
                currentDate < new Date(new Date().setHours(0, 0, 0, 0))
              }
            />
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center space-x-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Data selecionada: {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="time" className="space-y-4 pt-4">
          <div className="text-center mb-4">
            <h3 className="text-sm font-medium">Escolha a duração:</h3>
            <div className="flex justify-center space-x-2 mt-2">
              {[1, 2, 3].map(hrs => (
                <Button 
                  key={hrs}
                  size="sm"
                  variant={duration === hrs ? "default" : "outline"}
                  onClick={() => handleDurationChange(hrs)}
                >
                  {hrs} {hrs === 1 ? "hora" : "horas"}
                </Button>
              ))}
            </div>
          </div>

          {selectedParticao && (
            <div className="bg-muted/50 p-3 rounded-md text-sm mb-4">
              <h3 className="font-medium mb-1">Partição selecionada:</h3>
              <p>{selectedParticao.nome}</p>
              {selectedParticao.descricao && (
                <p className="text-muted-foreground mt-1">{selectedParticao.descricao}</p>
              )}
            </div>
          )}

          <div className="border rounded-md">
            <h3 className="px-4 py-2 border-b font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>Horários disponíveis em {format(date, "dd/MM/yyyy", { locale: ptBR })}</span>
            </h3>
            
            {isLoading ? (
              <div className="grid grid-cols-3 gap-2 p-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-[200px] px-4 py-2">
                <div className="grid grid-cols-3 gap-2">
                  {availableTimeSlots.map(horario => {
                    const isAvailable = availableTimeSlots.indexOf(horario) + duration <= availableTimeSlots.length;
                    const isSelected = selectedStartTime === horario;
                    
                    return (
                      <Button
                        key={horario}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "h-10",
                          !isAvailable && "opacity-50 cursor-not-allowed",
                          isSelected && "bg-primary"
                        )}
                        onClick={() => isAvailable && handleTimeSlotSelect(horario)}
                        disabled={!isAvailable}
                      >
                        {horario}
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          {selectedStartTime && (
            <div className="bg-primary/10 p-3 rounded-md">
              <p className="text-sm text-center">
                <span className="font-medium">Horário selecionado:</span> {selectedStartTime} - {selectedHorarioFim} ({duration} {duration === 1 ? "hora" : "horas"})
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
