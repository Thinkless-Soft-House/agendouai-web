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
import { Company } from "@/hooks/useEmpresas";
import { Espaco } from "@/pages/Particoes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { agendamentoSchema, AgendamentoFormValues } from "./dialog/schema";
import { InfoTab } from "./dialog/InfoTab";
import { SchedulingTab } from "./dialog/SchedulingTab";
import { PreviewTab } from "./dialog/PreviewTab";
import { useUsers, User, UserPermission } from "@/hooks/useUsers";
import { useEspacos } from "@/hooks/useEspacos";
import { useToast } from "@/hooks/use-toast";
import { createAgendamento, updateAgendamento } from "@/hooks/useAgendamento";
import { Loader2 } from "lucide-react";

interface AgendamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento: Agendamento | null;
  createData: { data: Date; horario: string } | null;
  companyId: string;
  spaceId: string;
  companies: Company[];
  spaces: Espaco[];
  onSave: () => void;
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
  companyId, 
  spaceId,
  companies, 
  spaces, 
  onSave,
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
  const { data: users = [], isLoading: loadingUsers } = useUsers();
  
  const form = useForm<Agendamento>({
    resolver: zodResolver(agendamentoSchema),
    defaultValues: {
      id: "",
      companyId: companyId || "",
      spaceId: spaceId || "",
      userId: currentUser?.id || 0,
      clientName: currentUser?.name || "",
      clientEmail: currentUser?.username || "",
      clientTelefone: currentUser?.telefone || "",
      data: new Date().toISOString(),
      startTime: "",
      endTime: "",
      status: "pendente",
      notes: "",
      spaceName: "",
      createdAt: undefined,
      updatedAt: undefined,
      requiresAction: undefined,
      actionType: undefined,
    },
  });

  // Use the custom hook to fetch espacos with availability data
  const selectedCompanyId = form.watch("companyId") || companyId;
  const { espacos: espacosDetalhados } = useEspacos(selectedCompanyId);
  console.log('Espaços carregados para a empresa selecionada:', espacosDetalhados);

  // Store current form values to prevent loss during resets
  const [storedFormValues, setStoredFormValues] = useState<{
    userId?: number;
    spaceId?: string;
  }>({
    userId: currentUser?.id || 0,
    spaceId: spaceId,
  });

  // Watch and store important form values to prevent loss during resets
  const formSpaceId = form.watch("spaceId");
  const formUserId = form.watch("userId");

  // Store the values whenever they change
  useEffect(() => {
    if (formSpaceId && formSpaceId !== storedFormValues.spaceId) {
      setStoredFormValues(prev => ({ ...prev, spaceId: formSpaceId }));
    }
  }, [formSpaceId]);
  useEffect(() => {
    if (formUserId && formUserId !== storedFormValues.userId) {
      setStoredFormValues(prev => ({ ...prev, userId: formUserId }));
    }
  }, [formUserId]);

  const selectedSpaceId = form.watch("spaceId");

  useEffect(() => {
    const handleEspacoChange = async () => {
      if (selectedSpaceId) {
        setStoredFormValues(prev => ({ ...prev, spaceId: selectedSpaceId }));
        const selectedEspaco = espacosDetalhados.find(
          p => p.id === parseInt(selectedSpaceId)
        );
        if (selectedEspaco && selectedEspaco.disponibilidades) {
          console.log('Disponibilidades encontradas para a sala selecionada:', 
            selectedEspaco.disponibilidades);
          
          // Convert the espaco disponibilidades to our internal DisponibilidadeDia format
          const disponibilidadesFormatadas = [0, 1, 2, 3, 4, 5, 6].map(diaSemana => {
            // Find availability for this day of week
            const disp = selectedEspaco.disponibilidades.find(
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
          const currentDayOfWeek = new Date(form.getValues().data).getDay();
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
              form.setValue("data", nextAvailableDate.toISOString());
            } else {
              setHorariosDisponiveisParaDia([]);
            }
          }
        } else {
          // Default availabilities for all days if no availability found
          console.log('Nenhuma disponibilidade encontrada para a sala selecionada:', selectedSpaceId);
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
        updateAvailableTimesForDate(new Date(form.getValues().data));
      }
    };
    handleEspacoChange();
  }, [selectedSpaceId, espacosDetalhados]);

  // Modified update function to preserve important form values
  const updateAvailableTimesForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    const dayAvailability = disponibilidade.find(d => d.diaSemana === dayOfWeek);
    if (dayAvailability && dayAvailability.disponivel) {
      setHorariosDisponiveisParaDia(dayAvailability.horariosDisponiveis);
      const currentTime = form.getValues().startTime;
      if (!dayAvailability.horariosDisponiveis.includes(currentTime) && dayAvailability.horariosDisponiveis.length > 0) {
        handleTimeSlotSelect(dayAvailability.horariosDisponiveis[0], calcularHorarioFim(dayAvailability.horariosDisponiveis[0]));
      }
    } else {
      setHorariosDisponiveisParaDia([]);
    }
  };

  // Handle form resets while preserving user and room selections
  useEffect(() => {
    // Clear previous selections when dialog opens
    if (open) {
      // Reset search and selection states for new agendamentos
      if (!isEditing && !createData) {
        setSearchTerm("");
        setSelectedUser(null);
        setStoredFormValues({
          userId: 0,
          spaceId: "",
        });
        form.reset({
          id: "",
          companyId: companyId || "",
          spaceId: "",
          userId: 0,
          clientName: "",
          clientEmail: "",
          clientTelefone: "",
          data: new Date().toISOString(),
          startTime: "",
          endTime: "",
          status: "pending",
          notes: "",
          spaceName: "",
          createdAt: undefined,
          updatedAt: undefined,
          requiresAction: undefined,
          actionType: undefined,
        });
      }
    }
    // Capture current important values before reset
    const currentUserId = form.getValues("userId") || storedFormValues.userId;
    const currentSpaceId = form.getValues("spaceId") || storedFormValues.spaceId;
    if (isEditing && agendamento) {
      form.reset({
        id: agendamento.id || "",
        companyId: agendamento.companyId ? String(agendamento.companyId) : "",
        spaceId: agendamento.spaceId ? String(agendamento.spaceId) : "",
        userId: agendamento.userId ?? currentUserId ?? currentUser?.id ?? 0,
        clientName: agendamento.clientName || "",
        clientEmail: agendamento.clientEmail || "",
        clientTelefone: agendamento.clientTelefone || "",
        data: agendamento.data || new Date().toISOString(),
        startTime: agendamento.startTime,
        endTime: agendamento.endTime,
        status: agendamento.status,
        notes: agendamento.notes || "",
        spaceName: agendamento.spaceName || "",
        createdAt: agendamento.createdAt,
        updatedAt: agendamento.updatedAt,
        requiresAction: agendamento.requiresAction,
        actionType: agendamento.actionType,
      });
      setStoredFormValues({
        userId: agendamento.userId ?? currentUserId ?? currentUser?.id ?? 0,
        spaceId: agendamento.spaceId ? String(agendamento.spaceId) : ""
      });
      setTimeout(() => {
        updateAvailableTimesForDate(new Date(agendamento.data));
      }, 100);
    } else {
      if (!isEditing && !createData) {
        setSearchTerm("");
        setSelectedUser(null);
        setStoredFormValues({
          userId: 0,
          spaceId: "",
        });
        form.reset({
          id: "",
          companyId: companyId || "",
          spaceId: "",
          userId: 0,
          clientName: "",
          clientEmail: "",
          clientTelefone: "",
          data: new Date().toISOString(),
          startTime: "",
          endTime: "",
          status: "pending",
          notes: "",
          spaceName: "",
          createdAt: undefined,
          updatedAt: undefined,
          requiresAction: undefined,
          actionType: undefined,
        });
      }
    }
    // Corrige chamada:
    updateAvailableTimesForDate(new Date(form.getValues().data));
  }, [agendamento, createData, companyId, spaceId, form, currentUser, disponibilidade, isEditing, open]);

  const calcularHorarioFim = (horarioInicio: string) => {
    const index = horariosDisponiveis.indexOf(horarioInicio);
    return index < horariosDisponiveis.length - 1 
      ? horariosDisponiveis[index + 1] 
      : horariosDisponiveis[index];
  };
  const handleHorarioInicioChange = (value: string) => {
    form.setValue("startTime", value);
    form.setValue("endTime", calcularHorarioFim(value));
  };
  const handleDateChange = (date: Date) => {
    form.setValue("data", date.toISOString());
    updateAvailableTimesForDate(date);
  };
  const handleTimeSlotSelect = (startTime: string, endTime: string) => {
    form.setValue("startTime", startTime);
    form.setValue("endTime", endTime);
  };
  const handleUserSelect = (userId: number) => {
    form.setValue("userId", userId);
    setStoredFormValues(prev => ({ ...prev, userId: userId }));
    const foundUser = users.find(u => u.id === userId);
    if (foundUser) {
      setSearchTerm(foundUser.name);
      setSelectedUser(foundUser);
    }
  };

  // Corrige a assinatura da função para receber o evento corretamente
  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (selectedUser && e.target.value !== selectedUser.name) {
      setSelectedUser(null);
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
  const onSubmit = async (values: Agendamento) => {
    console.log("onSubmit called with values:", values);
    try {
      const finalSpaceId = values.spaceId || storedFormValues.spaceId;
      const finalUserId = values.userId || storedFormValues.userId;
      if (!finalSpaceId || parseInt(finalSpaceId.toString()) <= 0) {
        toast({
          title: "Erro",
          description: "Selecione um espaço para o agendamento.",
          variant: "destructive",
        });
        return;
      }
      if (!finalUserId || finalUserId <= 0) {
        toast({
          title: "Erro",
          description: "Selecione um cliente para o agendamento.",
          variant: "destructive",
        });
        return;
      }
      setIsSubmitting(true);

      // Prepare the agendamento data in the format expected by the API
      const agendamentoData: Partial<Agendamento> = {
        companyId: values.companyId, // Keep as string since interface expects string
        spaceId: finalSpaceId.toString(), // Keep as string
        userId: finalUserId, // Keep as number
        clientName: selectedUser?.name || values.clientName || "",
        clientEmail: selectedUser?.username || values.clientEmail || "",
        clientTelefone: selectedUser?.telefone || values.clientTelefone || "",
        data: values.data, // Keep full ISO string for now
        startTime: values.startTime,
        endTime: values.endTime,
        status: isEditing ? (values.status || "pending") : "pending", // Always pending for new bookings
        notes: values.notes || "",
      };

      console.log("AgendamentoData:", agendamentoData);

      if (isEditing && agendamento) {
        // Update existing agendamento
        const response = await updateAgendamento(agendamento.id, agendamentoData);
        
        if (response.ok) {
          console.log("Agendamento atualizado:", response.data);
          toast({
            title: "Agendamento atualizado",
            description: "O agendamento foi atualizado com sucesso.",
          });
          onSave();
        } else {
          throw new Error(response.data?.message || "Erro ao atualizar agendamento");
        }
      } else {
        // Create new agendamento
        const response = await createAgendamento(agendamentoData);
        
        if (response.ok) {
          console.log("Agendamento criado:", response.data);
          toast({
            title: "Agendamento criado",
            description: "Seu agendamento foi criado com sucesso.",
          });
          onSave();
        } else {
          throw new Error(response.data?.message || "Erro ao criar agendamento");
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar agendamento:", error);
      
      const errorMessage = error.message || 
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
      console.log("Setting client name for editing:", agendamento.clientName);
      
      // Always set the search term to the client name from the agendamento
      setSearchTerm(agendamento.clientName || "");
      
      // Create a virtual user object if we don't have a real one
      if (!selectedUser && agendamento.userId) {
        const virtualUser: User = {
          id: agendamento.userId,
          name: agendamento.clientName || "",
          telefone: agendamento.clientTelefone || "",
          username: agendamento.clientEmail || "",
          password: "",
          permission: UserPermission.USER,
        };
        setSelectedUser(virtualUser);
      }
    }
  }, [isEditing, agendamento]);

  // Modify the existing user data loading effect
  useEffect(() => {
    // When editing an agendamento, load user data
    if (isEditing && agendamento && agendamento.userId) {
      console.log("Loading user data for editing:", agendamento);
      
      // Try to find the user in the existing users list first
      const existingUser = users.find(u => u.id === agendamento.userId);
      if (existingUser) {
        const user: User = {
          id: existingUser.id,
          name: agendamento.clientName || existingUser.name,
          telefone: agendamento.clientTelefone || existingUser.telefone,
          username: agendamento.clientEmail || existingUser.username,
          password: "",
          permission: existingUser.permission,
        };
        setSelectedUser(user);
        setSearchTerm(agendamento.clientName || user.name);
      } else {
        // Create a virtual user object if user not found in the list
        const virtualUser: User = {
          id: agendamento.userId,
          name: agendamento.clientName || "",
          telefone: agendamento.clientTelefone || "",
          username: agendamento.clientEmail || "",
          password: "",
          permission: UserPermission.USER,
        };
        setSelectedUser(virtualUser);
        setSearchTerm(agendamento.clientName || "");
      }
    }
  }, [isEditing, agendamento, users]);

  // Modify the function that runs when the dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    // If dialog is closing
    if (!open) {
      // Wait for dialog animation to finish before resetting state
      setTimeout(() => {
        setSearchTerm("");
        setSelectedUser(null);
        if (!isEditing && !createData) {
          form.reset({
            id: "",
            companyId: companyId || "",
            spaceId: "",
            userId: 0,
            clientName: "",
            clientEmail: "",
            clientTelefone: "",
            data: new Date().toISOString(),
            startTime: "",
            endTime: "",
            status: "pending",
            notes: "",
            spaceName: "",
            createdAt: undefined,
            updatedAt: undefined,
            requiresAction: undefined,
            actionType: undefined,
          });
        }
      }, 300);
    }
    
    // Call the provided onOpenChange function
    onOpenChange(open);
  };
  
  // Determina isAdmin de acordo com o usuario logado
  let isAdmin = false;
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw);
      isAdmin = user?.role === "admin";
    }
  } catch {
    isAdmin = false;
  }
  
  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Editar Agendamento - ${agendamento?.clientName || ""}` : "Novo Agendamento"}
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
              <p>espacoId: {form.watch("espacoId")} (stored: {storedFormValues.espacoId})</p>
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
                  empresas={companies} 
                  espacos={espacosDetalhados} 
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
                  espacos={espacosDetalhados} 
                  handleTimeSlotSelect={handleTimeSlotSelect}
                  handleDateChange={handleDateChange}
                  diasDisponiveis={diasDisponiveis}
                  horariosDisponiveis={horariosDisponiveisParaDia}
                />
              </TabsContent>
              
              <TabsContent value="preview" className="pt-4">
                <PreviewTab 
                  form={form} 
                  empresas={companies} 
                  espacos={espacosDetalhados}
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
