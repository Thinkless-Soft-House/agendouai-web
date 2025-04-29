import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Agendamento } from "@/types/agendamento";
import { Empresa } from "@/pages/Empresas";
import { Particao } from "@/pages/Particoes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { agendamentoSchema, AgendamentoFormValues } from "./dialog/schema";
import { InfoTab } from "./dialog/InfoTab";
import { SchedulingTab } from "./dialog/SchedulingTab";
import { PreviewTab } from "./dialog/PreviewTab";
import { useUsers, User } from "@/hooks/useUsers";
import { useParticoes } from "@/hooks/useParticoes";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Loader2 } from "lucide-react";

interface AgendamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento: Agendamento | null;
  createData: { data: Date; horario: string } | null;
  empresaId: string;
  particaoId: string;
  empresas: Empresa[];
  particoes: Particao[];
  onSave: () => void;
  isAdmin?: boolean;
  currentUser?: User;
}

const horariosDisponiveis = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

// Interface for availability data
interface DisponibilidadeDia {
  diaSemana: number; // 0 = Sunday, 1 = Monday, etc.
  disponivel: boolean;
  horariosDisponiveis: string[];
}

export function AgendamentoDialog({ 
  open, 
  onOpenChange, 
  agendamento, 
  createData,
  empresaId, 
  particaoId,
  empresas, 
  particoes, 
  onSave,
  isAdmin = false,
  currentUser,
}: AgendamentoDialogProps) {
  const isEditing = !!agendamento;
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [disponibilidade, setDisponibilidade] = useState<DisponibilidadeDia[]>([]);
  const [diasDisponiveis, setDiasDisponiveis] = useState<number[]>([]);
  const [horariosDisponiveisParaDia, setHorariosDisponiveisParaDia] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Use the custom hook to fetch users
  const { users, isLoading: loadingUsers, searchUsers } = useUsers();
  
  // Use the custom hook to fetch particoes with availability data
  const { particoes: particoesDetalhadas } = useParticoes(empresaId);
  
  const form = useForm<AgendamentoFormValues>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: {
      empresaId: empresaId,
      particaoId: particaoId,
      usuarioId: currentUser?.id || 0,
      data: new Date(),
      horarioInicio: "09:00",
      horarioFim: "10:00",
      diaSemanaIndex: new Date().getDay(),
      status: "pendente",
      observacoes: "",
    },
  });

  // Store current form values to prevent loss during resets
  const [storedFormValues, setStoredFormValues] = useState<{
    usuarioId?: number;
    particaoId?: string;
  }>({
    usuarioId: currentUser?.id || 0,
    particaoId: particaoId,
  });
  
  // Handle search for users with debounce
  useEffect(() => {
    if (!searchTerm) {
      return;
    }
    
    // Reset selected state when searching
    if (selectedUser && searchTerm !== selectedUser.name) {
      setSelectedUser(null);
    }
    
    const debounceTimeout = setTimeout(() => {
      searchUsers(searchTerm);
    }, 300);
    
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, selectedUser]);
  
  // Watch and store important form values to prevent them from being lost
  const formParticaoId = form.watch("particaoId");
  const formUsuarioId = form.watch("usuarioId");
  
  // Store the values whenever they change
  useEffect(() => {
    if (formParticaoId && formParticaoId !== storedFormValues.particaoId) {
      console.log("Storing particaoId:", formParticaoId);
      setStoredFormValues(prev => ({ ...prev, particaoId: formParticaoId }));
    }
  }, [formParticaoId]);
  
  useEffect(() => {
    if (formUsuarioId && formUsuarioId !== storedFormValues.usuarioId) {
      console.log("Storing usuarioId:", formUsuarioId);
      setStoredFormValues(prev => ({ ...prev, usuarioId: formUsuarioId }));
    }
  }, [formUsuarioId]);
  
  // Track changes to particaoId from the form
  const selectedParticaoId = form.watch("particaoId");
  
  // Listen for changes to the particao selection
  useEffect(() => {
    const handleParticaoChange = async () => {
      // If a particao is selected in the form
      if (selectedParticaoId) {
        console.log('Particao selecionada:', selectedParticaoId);
        
        // Make sure to save the selected particaoId
        setStoredFormValues(prev => ({ ...prev, particaoId: selectedParticaoId }));
        
        // Find the selected particao in the detailed data
        const selectedParticao = particoesDetalhadas.find(
          p => p.id === parseInt(selectedParticaoId)
        );
        
        if (selectedParticao && selectedParticao.disponibilidades) {
          console.log('Disponibilidades encontradas para a sala selecionada:', 
            selectedParticao.disponibilidades);
          
          // Convert the particao disponibilidades to our internal DisponibilidadeDia format
          const disponibilidadesFormatadas = [0, 1, 2, 3, 4, 5, 6].map(diaSemana => {
            // Find availability for this day of week
            const disp = selectedParticao.disponibilidades.find(
              d => {
                // Try to match by diaSemana (string) or diaSemanaIndex (number)
                return d.diaSemanaIndex === diaSemana || 
                      parseInt(d.diaSemana) === diaSemana || 
                      d.diaSemana === diaSemana.toString();
              }
            );
            
            if (disp && disp.ativo) {
              // Extract available hour slot
              const horarios: string[] = [];
              
              // Add hour slots based on hrAbertura
              if (disp.hrAbertura) {
                horarios.push(disp.hrAbertura);
                
                // If we have both opening and closing times, we can generate hourly slots
                if (disp.hrFim) {
                  const startTime = disp.hrAbertura.split(':').map(Number);
                  const endTime = disp.hrFim.split(':').map(Number);
                  
                  const startHour = startTime[0];
                  let endHour = endTime[0];
                  
                  // Adjust end hour if it wraps around to the next day
                  if (endHour < startHour) {
                    endHour += 24;
                  }
                  
                  // Generate hourly slots between opening and closing times
                  for (let hour = startHour + 1; hour < endHour; hour++) {
                    const formattedHour = (hour % 24).toString().padStart(2, '0');
                    horarios.push(`${formattedHour}:00`);
                  }
                }
              } else if (disp.inicio) {
                // Use the alias fields if main fields are not available
                horarios.push(disp.inicio);
                
                if (disp.fim) {
                  const startTime = disp.inicio.split(':').map(Number);
                  const endTime = disp.fim.split(':').map(Number);
                  
                  const startHour = startTime[0];
                  let endHour = endTime[0];
                  
                  if (endHour < startHour) {
                    endHour += 24;
                  }
                  
                  for (let hour = startHour + 1; hour < endHour; hour++) {
                    const formattedHour = (hour % 24).toString().padStart(2, '0');
                    horarios.push(`${formattedHour}:00`);
                  }
                }
              }
              
              return {
                diaSemana,
                disponivel: true,
                horariosDisponiveis: horarios.length > 0 ? 
                  horarios : 
                  // Fallback to default hours if no specific times defined
                  ["09:00", "10:00", "11:00", "14:00", "15:00"]
              };
            } else {
              // No availability configured for this day or not active
              return {
                diaSemana,
                disponivel: false,
                horariosDisponiveis: []
              };
            }
          });
          
          setDisponibilidade(disponibilidadesFormatadas);
          
          // Set which days are available
          const availableDays = disponibilidadesFormatadas
            .filter(day => day.disponivel)
            .map(day => day.diaSemana);
          
          console.log('Dias disponíveis para a sala selecionada:', availableDays);
          setDiasDisponiveis(availableDays);
          
          // Set initial available times based on current day
          const currentDayOfWeek = form.getValues().data.getDay();
          const currentDayAvailability = disponibilidadesFormatadas.find(
            d => d.diaSemana === currentDayOfWeek
          );
          
          if (currentDayAvailability && currentDayAvailability.disponivel) {
            setHorariosDisponiveisParaDia(currentDayAvailability.horariosDisponiveis);
          } else {
            // If current day is not available, find the first available day
            const firstAvailableDay = disponibilidadesFormatadas.find(d => d.disponivel);
            if (firstAvailableDay) {
              setHorariosDisponiveisParaDia(firstAvailableDay.horariosDisponiveis);
              
              // Find the next date that matches this day of the week
              const today = new Date();
              const daysUntilNextAvailable = (7 + firstAvailableDay.diaSemana - today.getDay()) % 7;
              const nextAvailableDate = new Date(today);
              nextAvailableDate.setDate(today.getDate() + (daysUntilNextAvailable || 7));
              
              form.setValue("data", nextAvailableDate);
              form.setValue("diaSemanaIndex", nextAvailableDate.getDay());
            } else {
              setHorariosDisponiveisParaDia([]);
            }
          }
        } else {
          // Default availabilities for all days if no availability found
          console.log('Nenhuma disponibilidade encontrada para a sala selecionada:', selectedParticaoId);
          const defaultDisponibilidades = [0, 1, 2, 3, 4, 5, 6].map(diaSemana => ({
            diaSemana,
            disponivel: diaSemana > 0 && diaSemana < 6, // Mon-Fri available by default
            horariosDisponiveis: diaSemana > 0 && diaSemana < 6 ? 
              ["09:00", "10:00", "11:00", "14:00", "15:00"] : []
          }));
          
          setDisponibilidade(defaultDisponibilidades);
          setDiasDisponiveis([1, 2, 3, 4, 5]); // Mon-Fri
          setHorariosDisponiveisParaDia(["09:00", "10:00", "11:00", "14:00", "15:00"]);
        }
        
        // Update available times based on the newly set date
        updateAvailableTimesForDate(form.getValues().data);
      }
    };
    
    handleParticaoChange();
  }, [selectedParticaoId, particoesDetalhadas]);

  // Modified update function to preserve important form values
  const updateAvailableTimesForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dayAvailability = disponibilidade.find(d => d.diaSemana === dayOfWeek);
    
    if (dayAvailability && dayAvailability.disponivel) {
      setHorariosDisponiveisParaDia(dayAvailability.horariosDisponiveis);
      
      // If current selected time is not available on this day, reset it
      const currentTime = form.getValues().horarioInicio;
      if (!dayAvailability.horariosDisponiveis.includes(currentTime) && dayAvailability.horariosDisponiveis.length > 0) {
        handleHorarioInicioChange(dayAvailability.horariosDisponiveis[0]);
      }
    } else {
      setHorariosDisponiveisParaDia([]);
    }
  };

  // Handle form resets while preserving user and room selections
  useEffect(() => {
    // Capture current important values before reset
    const currentUserId = form.getValues("usuarioId") || storedFormValues.usuarioId;
    const currentParticaoId = form.getValues("particaoId") || storedFormValues.particaoId;
    
    if (isEditing && agendamento) {
      console.log("Loading agendamento for editing:", agendamento);
      
      // Reset form with agendamento data
      form.reset({
        empresaId: agendamento.empresaId,
        particaoId: agendamento.particaoId,
        usuarioId: agendamento.usuarioId ?? currentUserId ?? currentUser?.id ?? 0,
        data: new Date(agendamento.data),
        horarioInicio: agendamento.horarioInicio,
        horarioFim: agendamento.horarioFim,
        diaSemanaIndex: new Date(agendamento.data).getDay(),
        status: agendamento.status,
        observacoes: agendamento.observacoes || "",
      });
      
      // Store the values to prevent them from being lost
      setStoredFormValues({
        usuarioId: agendamento.usuarioId ?? currentUserId ?? currentUser?.id ?? 0,
        particaoId: agendamento.particaoId || currentParticaoId
      });
      
      // Force update available times for the selected date
      setTimeout(() => {
        updateAvailableTimesForDate(new Date(agendamento.data));
      }, 100);
    } else if (createData) {
      form.reset({
        empresaId: empresaId,
        particaoId: currentParticaoId || particaoId,
        usuarioId: currentUserId || currentUser?.id || 0,
        data: createData.data,
        horarioInicio: createData.horario,
        horarioFim: calcularHorarioFim(createData.horario),
        diaSemanaIndex: createData.data.getDay(),
        status: "pendente",
        observacoes: "",
      });
    } else {
      form.reset({
        empresaId: empresaId,
        particaoId: currentParticaoId || particaoId,
        usuarioId: currentUserId || currentUser?.id || 0,
        data: new Date(),
        horarioInicio: "09:00",
        horarioFim: "10:00",
        diaSemanaIndex: new Date().getDay(),
        status: "pendente",
        observacoes: "",
      }, {
        // Only keep dirty status for certain fields
        keepDirty: true,
        keepValues: true,
      });
    }
    
    // Update available times for the selected date
    updateAvailableTimesForDate(form.getValues().data);
  }, [agendamento, createData, empresaId, particaoId, form, currentUser, disponibilidade, isEditing]);

  const calcularHorarioFim = (horarioInicio: string) => {
    const index = horariosDisponiveis.indexOf(horarioInicio);
    return index < horariosDisponiveis.length - 1 
      ? horariosDisponiveis[index + 1] 
      : horariosDisponiveis[index];
  };

  const handleHorarioInicioChange = (value: string) => {
    form.setValue("horarioInicio", value);
    form.setValue("horarioFim", calcularHorarioFim(value));
  };

  const handleDateChange = (date: Date) => {
    form.setValue("data", date);
    form.setValue("diaSemanaIndex", date.getDay());
    updateAvailableTimesForDate(date);
  };

  const handleTimeSlotSelect = (horarioInicio: string, horarioFim: string) => {
    form.setValue("horarioInicio", horarioInicio);
    form.setValue("horarioFim", horarioFim);
  };

  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('AgendamentoDialog - handleUserSearch:', e.target.value);
    setSearchTerm(e.target.value);
    // Clear selected user if search term changes
    if (selectedUser && e.target.value !== selectedUser.name) {
      setSelectedUser(null);
    }
  };

  // Update the handleUserSelect function to better handle selection
  const handleUserSelect = (userId: number) => {
    console.log('AgendamentoDialog - User selected with ID:', userId);
    
    // Make sure the ID is actually set in the form
    form.setValue("usuarioId", userId);
    setStoredFormValues(prev => ({ ...prev, usuarioId: userId }));
    
    const foundUser = users.find(u => u.id === userId);
    console.log('AgendamentoDialog - Selected user object:', foundUser);
    if (foundUser) {
      setSearchTerm(foundUser.name);
      setSelectedUser(foundUser);
    }
  };

  // Update filtered users when the user search results change
  useEffect(() => {
    if (!selectedUser) {
      console.log('AgendamentoDialog - Users hook returned:', users);
      setFilteredUsers(users || []);
      console.log('AgendamentoDialog - FilteredUsers set to:', users);
    }
  }, [users, selectedUser]);

  // Modified submit function that ensures correct IDs
  const onSubmit = async (values: AgendamentoFormValues) => {
    try {
      // Use stored values as fallback if the form values are missing
      const finalParticaoId = values.particaoId || storedFormValues.particaoId;
      const finalUsuarioId = values.usuarioId || storedFormValues.usuarioId;
      
      // Check if required fields are properly set
      if (!finalParticaoId || parseInt(finalParticaoId.toString()) <= 0) {
        toast({
          title: "Erro",
          description: "Selecione uma sala para o agendamento.",
          variant: "destructive",
        });
        return;
      }
      
      if (!finalUsuarioId || finalUsuarioId <= 0) {
        toast({
          title: "Erro",
          description: "Selecione um cliente para o agendamento.",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);
      console.log("Form values:", values);
      console.log("Stored values:", storedFormValues);
      
      // Convert to format matching the backend DTO
      const reservaDTO = {
        date: values.data.toISOString().split('T')[0],
        horaInicio: values.horarioInicio,
        horaFim: values.horarioFim,
        observacao: values.observacoes || "",  // Ensure empty string if null
        diaSemanaIndex: values.diaSemanaIndex,
        salaId: parseInt(finalParticaoId.toString()),
        usuarioId: finalUsuarioId,
      };
      
      console.log("ReservaCreateDTO:", reservaDTO);

      if (isEditing && agendamento) {
        // Update existing agendamento
        const response = await axios.put(
          `http://localhost:3000/reserva/${agendamento.id}`, 
          reservaDTO
        );
        
        console.log("Agendamento atualizado:", response.data);
        toast({
          title: "Agendamento atualizado",
          description: "O agendamento foi atualizado com sucesso.",
        });
      } else {
        // Create new agendamento
        const response = await axios.post(
          "http://localhost:3000/reserva", 
          reservaDTO
        );
        
        console.log("Agendamento criado:", response.data);
        toast({
          title: "Agendamento criado",
          description: "Seu agendamento foi criado com sucesso.",
        });
      }
      
      // Call onSave callback to refresh data and close dialog
      onSave();
    } catch (error: any) {
      console.error("Erro ao salvar agendamento:", error);
      
      const errorMessage = error.response?.data?.message || 
                          "Ocorreu um erro ao processar seu agendamento. Tente novamente.";
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this new effect specifically for setting client name when editing
  useEffect(() => {
    if (isEditing && agendamento) {
      console.log("Setting client name for editing:", agendamento.clienteNome);
      
      // Always set the search term to the client name from the agendamento
      setSearchTerm(agendamento.clienteNome || "");
      
      // Create a virtual user object if we don't have a real one
      if (!selectedUser && agendamento.usuarioId) {
        const virtualUser: User = {
          id: agendamento.usuarioId,
          name: agendamento.clienteNome || "",
          email: agendamento.clienteEmail || "",
          telefone: agendamento.clienteTelefone || "",
          permissionId: 0, // Default permission
        };
        
        setSelectedUser(virtualUser);
      }
    }
  }, [isEditing, agendamento]);

  // Modify the existing user data loading effect
  useEffect(() => {
    // When editing an agendamento, load user data
    if (isEditing && agendamento && agendamento.usuarioId) {
      // Find the user by ID when editing
      const fetchUserForEditing = async () => {
        try {
          // Option 1: Check if user exists in users array
          const existingUser = users.find(u => u.id === agendamento.usuarioId);
          
          if (existingUser) {
            setSelectedUser(existingUser);
            // Use clienteNome from agendamento instead of user.name
            setSearchTerm(agendamento.clienteNome || existingUser.name || "");
          } else {
            // Option 2: Fetch the user directly if not in users array
            try {
              const response = await axios.get(`http://localhost:3000/users/${agendamento.usuarioId}`);
              if (response.data) {
                const userData = response.data;
                const user: User = {
                  id: userData.id,
                  name: agendamento.clienteNome || userData.name,  // Prioritize clienteNome
                  email: agendamento.clienteEmail || userData.email,
                  telefone: agendamento.clienteTelefone || userData.telefone,
                  permissionId: userData.permissionId || 0
                };
                setSelectedUser(user);
                setSearchTerm(agendamento.clienteNome || user.name);
              } else {
                // If no user data returned, create a virtual user from agendamento
                const virtualUser: User = {
                  id: agendamento.usuarioId,
                  name: agendamento.clienteNome || "",
                  email: agendamento.clienteEmail || "",
                  telefone: agendamento.clienteTelefone || "",
                  permissionId: 0
                };
                setSelectedUser(virtualUser);
                setSearchTerm(agendamento.clienteNome || "");
              }
            } catch (error) {
              console.error("Error fetching user details:", error);
              // Fallback to using agendamento client data
              setSearchTerm(agendamento.clienteNome || "Cliente");
              
              // Create a virtual user from agendamento data
              const virtualUser: User = {
                id: agendamento.usuarioId,
                name: agendamento.clienteNome || "",
                email: agendamento.clienteEmail || "",
                telefone: agendamento.clienteTelefone || "",
                permissionId: 0
              };
              setSelectedUser(virtualUser);
            }
          }
        } catch (error) {
          console.error("Error setting up user data for editing:", error);
        }
      };
      
      fetchUserForEditing();
    }
  }, [isEditing, agendamento, users]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Editar Agendamento - ${agendamento?.clienteNome || ""}` : "Novo Agendamento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite os detalhes do agendamento abaixo."
              : "Preencha os campos abaixo para criar um novo agendamento."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            {/* Debug section to show current form values */}
            {/* <div className="text-xs text-gray-500 py-1 px-2 bg-gray-50 rounded-md">
              <p>Debug - Form Values:</p>
              <p>usuarioId: {form.watch("usuarioId")} (stored: {storedFormValues.usuarioId})</p>
              <p>particaoId: {form.watch("particaoId")} (stored: {storedFormValues.particaoId})</p>
              {selectedUser && (
                <p>Selected User: {selectedUser.name} (ID: {selectedUser.id})</p>
              )}
            </div> */}
            
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="scheduling">Agendamento</TabsTrigger>
                <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-6 pt-4">
                <InfoTab 
                  form={form} 
                  isEditing={isEditing} 
                  empresas={empresas} 
                  particoes={particoes} 
                  horariosDisponiveis={horariosDisponiveisParaDia}
                  handleHorarioInicioChange={handleHorarioInicioChange}
                  isAdmin={isAdmin}
                  users={filteredUsers}
                  handleUserSearch={handleUserSearch}
                  handleUserSelect={handleUserSelect}
                  searchTerm={searchTerm}
                  loadingUsers={loadingUsers}
                  selectedUser={selectedUser}
                />
              </TabsContent>
              
              <TabsContent value="scheduling" className="pt-4">
                <SchedulingTab 
                  form={form} 
                  particoes={particoes} 
                  handleTimeSlotSelect={handleTimeSlotSelect}
                  handleDateChange={handleDateChange}
                  diasDisponiveis={diasDisponiveis}
                  horariosDisponiveis={horariosDisponiveisParaDia}
                />
              </TabsContent>
              
              <TabsContent value="preview" className="pt-4">
                <PreviewTab 
                  form={form} 
                  empresas={empresas} 
                  particoes={particoes}
                  isAdmin={isAdmin}
                  users={users}
                  selectedUser={selectedUser}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Salvando..." : "Criando..."}
                  </>
                ) : (
                  isEditing ? "Salvar Alterações" : "Criar Agendamento"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
