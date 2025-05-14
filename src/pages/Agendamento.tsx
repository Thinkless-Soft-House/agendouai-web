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

  // Add this line to define actionsNeeded as any
  const actionsNeeded: any = undefined;

  // Resetar sala ao trocar de empresa
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
            actionsNeeded={actionsNeeded}
            handleEditAgendamento={handleEditAgendamento}
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
