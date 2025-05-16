import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AgendamentoDialog } from "@/components/agendamento/AgendamentoDialog";
import { AgendamentoDeleteDialog } from "@/components/agendamento/AgendamentoDeleteDialog";
import { AgendamentoSidebar } from "@/components/agendamento/AgendamentoSidebar";
import { AgendamentoHeader } from "@/components/agendamento/AgendamentoHeader";
import { AgendamentoMain } from "@/components/agendamento/AgendamentoMain";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useParticoes } from "@/hooks/useParticoes";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { useCalendarNavigation } from "@/hooks/useCalendarNavigation";
import { Agendamento } from "@/types/agendamento";
import axios from "axios";

const AgendamentoPage = () => {
  // State for filters and UI
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>("");
  const [selectedSalaId, setSelectedSalaId] = useState<string>("");
  const [filterText, setFilterText] = useState<string>("");
  const [view, setView] = useState<"day" | "week" | "month">("day");

  // State for dialogs
  const [agendamentoToCreate, setAgendamentoToCreate] = useState<{
    data: Date;
    horario: string;
  } | null>(null);
  const [agendamentoToEdit, setAgendamentoToEdit] =
    useState<Agendamento | null>(null);
  const [agendamentoToDelete, setAgendamentoToDelete] =
    useState<Agendamento | null>(null);

  // Loading states for approve/reject operations
  const [isApproving, setIsApproving] = useState<number | null>(null);
  const [isRejecting, setIsRejecting] = useState<number | null>(null);

  const { toast } = useToast();

  // Custom hooks for data fetching
  const { empresas, isLoadingEmpresas } = useEmpresas();

  const {
    particoes,
    isLoadingParticoes,
    isFilterLoading: isParticoesFilterLoading,
  } = useParticoes(selectedEmpresaId);

  const {
    date,
    setDate,
    monthView,
    isMonthPickerOpen,
    setIsMonthPickerOpen,
    handleMonthChange,
    handleYearChange,
    handlePreviousDay,
    handleNextDay,
    handlePreviousWeek,
    handleNextWeek,
    handlePreviousMonth,
    handleNextMonth,
    monthNames,
  } = useCalendarNavigation();

  const {
    agendamentos,
    isLoadingAgendamentos,
    isFilterLoading: isAgendamentosFilterLoading,
    refetch,
  } = useAgendamentos({
    empresaId: selectedEmpresaId,
    salaId: selectedSalaId,
    date,
  });

  // Resetar sala ao trocar de empresae agendamentos
  React.useEffect(() => {
    setSelectedSalaId("");
  }, [selectedEmpresaId]);

  // Computed values
  const isLoading =
    isLoadingEmpresas ||
    isLoadingParticoes ||
    isLoadingAgendamentos ||
    isParticoesFilterLoading ||
    isAgendamentosFilterLoading;

  // Event handlers
  const handleCreateAgendamento = (data: Date, horario: string) => {
    setAgendamentoToCreate({ data, horario });
  };

  const handleCreateNewAgendamento = () => {
    handleCreateAgendamento(new Date(), "09:00");
  };

  const handleEditAgendamento = (agendamento: Agendamento) => {
    setAgendamentoToEdit(agendamento);
  };

  const handleDeleteAgendamento = (agendamento: Agendamento) => {
    setAgendamentoToDelete(agendamento);
  };

  const handleAgendamentoSaved = () => {
    refetch();
    toast({
      title: "Sucesso",
      description: agendamentoToEdit
        ? "Agendamento atualizado com sucesso."
        : "Agendamento criado com sucesso.",
    });
    setAgendamentoToEdit(null);
    setAgendamentoToCreate(null);
  };

  const handleAgendamentoDeleted = () => {
    refetch();
    toast({
      title: "Sucesso",
      description: "Agendamento excluído com sucesso.",
      variant: "destructive",
    });
    setAgendamentoToDelete(null);
  };

  // Update these handlers to create proper statusReserva records
  const handleConfirmAgendamento = async (agendamento: Agendamento) => {
    try {
      const agendamentoId = Number(agendamento.id);
      setIsApproving(agendamentoId);
      
      // Create a new statusReserva with statusId 2 (Confirmed)
      await axios.post('http://localhost:3000/statusReserva', {
        reservaId: agendamentoId,
        statusId: 2 // StatusEnum.Confirmado
      });
      
      toast({
        title: "Agendamento aprovado",
        description: `Agendamento de ${agendamento.pessoa?.nome || agendamento.clienteNome} foi aprovado com sucesso.`,
        variant: "default",
      });
      
      // Refresh data
      await refetch();
    } catch (error) {
      console.error("Erro ao aprovar agendamento:", error);
      toast({
        title: "Erro ao aprovar",
        description: "Não foi possível aprovar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(null);
    }
  };

  const handleCancelAgendamento = async (agendamento: Agendamento) => {
    try {
      const agendamentoId = Number(agendamento.id);
      setIsRejecting(agendamentoId);
      
      // Create a new statusReserva with statusId 5 (Rejected)
      await axios.post('http://localhost:3000/statusReserva', {
        reservaId: agendamentoId,
        statusId: 5 // StatusEnum.Reprovado
      });
      
      toast({
        title: "Agendamento rejeitado",
        description: `Agendamento de ${agendamento.pessoa?.nome || agendamento.clienteNome} foi rejeitado.`,
        variant: "destructive",
      });
      
      // Refresh data
      await refetch();
    } catch (error) {
      console.error("Erro ao rejeitar agendamento:", error);
      toast({
        title: "Erro ao rejeitar",
        description: "Não foi possível rejeitar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AgendamentoHeader
          onNewAgendamento={handleCreateNewAgendamento}
          selectedEmpresaId={selectedEmpresaId}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <AgendamentoSidebar
            selectedEmpresaId={selectedEmpresaId}
            setSelectedEmpresaId={setSelectedEmpresaId}
            selectedSalaId={selectedSalaId}
            setSelectedSalaId={setSelectedSalaId}
            filterText={filterText}
            setFilterText={setFilterText}
            empresas={empresas}
            particoes={particoes}
            isFilterLoading={
              isParticoesFilterLoading || isAgendamentosFilterLoading
            }
            isLoadingEmpresas={isLoadingEmpresas}
            isLoadingParticoes={isLoadingParticoes}
            agendamentos={agendamentos}
            handleEditAgendamento={handleEditAgendamento}
            onConfirmAgendamento={handleConfirmAgendamento}
            onCancelAgendamento={handleCancelAgendamento}
            isApproving={isApproving}
            isRejecting={isRejecting}
          />

          <div className="lg:col-span-9">
            <AgendamentoMain
              selectedEmpresaId={selectedEmpresaId}
              view={view}
              setView={setView}
              date={date}
              setDate={setDate}
              monthView={monthView}
              isMonthPickerOpen={isMonthPickerOpen}
              setIsMonthPickerOpen={setIsMonthPickerOpen}
              handlePreviousDay={handlePreviousDay}
              handleNextDay={handleNextDay}
              handlePreviousWeek={handlePreviousWeek}
              handleNextWeek={handleNextWeek}
              handlePreviousMonth={handlePreviousMonth}
              handleNextMonth={handleNextMonth}
              handleMonthChange={handleMonthChange}
              handleYearChange={handleYearChange}
              monthNames={monthNames}
              handleCreateAgendamento={handleCreateAgendamento}
              handleEditAgendamento={handleEditAgendamento}
              handleDeleteAgendamento={handleDeleteAgendamento}
              agendamentos={agendamentos}
              isLoading={isLoading} // Passe o estado de carregamento
            />
          </div>
        </div>

        <AgendamentoDialog
          open={agendamentoToCreate !== null || agendamentoToEdit !== null}
          onOpenChange={(open) => {
            if (!open) {
              setAgendamentoToEdit(null);
              setAgendamentoToCreate(null);
            }
          }}
          agendamento={agendamentoToEdit}
          createData={agendamentoToCreate}
          empresaId={selectedEmpresaId}
          particaoId={selectedSalaId}
          empresas={empresas}
          particoes={particoes}
          onSave={handleAgendamentoSaved}
        />

        <AgendamentoDeleteDialog
          open={agendamentoToDelete !== null}
          onOpenChange={(open) => {
            if (!open) setAgendamentoToDelete(null);
          }}
          agendamento={agendamentoToDelete}
          onDelete={handleAgendamentoDeleted}
        />
      </div>
    </DashboardLayout>
  );
};

export default AgendamentoPage;