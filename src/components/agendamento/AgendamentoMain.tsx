import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CalendarRange, CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Agendamento } from "@/types/agendamento";
import { ViewSelector } from "@/components/agendamento/calendar";
import { CalendarViewHeader } from "@/components/agendamento/calendar";
import { DayView } from "@/components/agendamento/calendar/DayView";
import { WeekView } from "@/components/agendamento/calendar";
import { MonthView } from "@/components/agendamento/calendar";
import { AppointmentCard } from "@/components/agendamento/AppointmentCard";

interface AgendamentoMainProps {
  selectedEmpresaId: string;
  view: "day" | "week" | "month";
  setView: (view: "day" | "week" | "month") => void;
  date: Date;
  setDate: (date: Date) => void;
  monthView: Date;
  isMonthPickerOpen: boolean;
  setIsMonthPickerOpen: (open: boolean) => void;
  handlePreviousDay: () => void;
  handleNextDay: () => void;
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  handlePreviousMonth: () => void;
  handleNextMonth: () => void;
  handleMonthChange: (month: number) => void;
  handleYearChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  monthNames: string[];
  handleCreateAgendamento: (date: Date, horario: string) => void;
  handleEditAgendamento: (agendamento: Agendamento) => void;
  handleDeleteAgendamento: (agendamento: Agendamento) => void;
  agendamentos: Agendamento[];
  isLoading?: boolean;
}

export function AgendamentoMain({
  agendamentos,
  selectedEmpresaId,
  view,
  setView,
  date,
  setDate,
  monthView,
  isMonthPickerOpen,
  setIsMonthPickerOpen,
  handlePreviousDay,
  handleNextDay,
  handlePreviousWeek,
  handleNextWeek,
  handlePreviousMonth,
  handleNextMonth,
  handleMonthChange,
  handleYearChange,
  monthNames,
  handleCreateAgendamento,
  handleEditAgendamento,
  handleDeleteAgendamento,
  isLoading = false,
}: AgendamentoMainProps) {
  const renderAppointmentCard = (agendamento: Agendamento) => (
    <AppointmentCard 
      agendamento={agendamento} 
      onEdit={(ag) => {
        handleEditAgendamento(ag);
      }} 
      onDelete={(ag) => {
        handleDeleteAgendamento(ag);
      }}
    />
  );

  return (
    <Card className="h-full flex flex-col transition-all duration-300">
      <CardHeader className="pb-2 flex-none">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Agenda</CardTitle>
              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <ViewSelector view={view} setView={setView} />
              
              <CalendarViewHeader 
                view={view}
                date={date}
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
              />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto">
        {!selectedEmpresaId ? (
          <EmptyStateSelectEmpresa />
        ) : isLoading ? (
          <LoadingState />
        ) : agendamentos.length === 0 ? (
          <EmptyStateNoAgendamentos onCreateAgendamento={() => handleCreateAgendamento(date, "09:00")} />
        ) : (
          <div className="transition-all duration-300 animate-fade-in">
            {view === "day" && (
              <DayView 
                date={date}
                agendamentos={agendamentos}
                selectedEmpresaId={selectedEmpresaId}
                handleCreateAgendamento={handleCreateAgendamento}
                renderAppointmentCard={renderAppointmentCard}
                isLoading={isLoading}
              />
            )}
            {view === "week" && (
              <WeekView 
                date={date}
                setDate={setDate}
                agendamentos={agendamentos}
                handleCreateAgendamento={handleCreateAgendamento}
                handleEditAgendamento={handleEditAgendamento}
                isLoading={isLoading}
              />
            )}
            {view === "month" && (
              <MonthView 
                date={date}
                setDate={setDate}
                setView={setView}
                agendamentos={agendamentos}
                isLoading={isLoading}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const EmptyStateSelectEmpresa = () => (
  <div className="flex flex-col items-center justify-center h-full py-12 space-y-4 animate-fade-in">
    <CalendarRange className="h-16 w-16 text-muted-foreground" />
    <div className="max-w-md text-center space-y-2">
      <h3 className="text-xl font-semibold">Selecione uma empresa</h3>
      <p className="text-muted-foreground">
        Para visualizar os agendamentos, selecione uma empresa no painel lateral.
      </p>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="flex items-center justify-center h-full animate-pulse">
    <div className="flex flex-col items-center transition-all">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Carregando agendamentos...</p>
    </div>
  </div>
);

const EmptyStateNoAgendamentos = ({ onCreateAgendamento }: { onCreateAgendamento: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full py-12 space-y-4 animate-fade-in">
    <CalendarIcon className="h-16 w-16 text-muted-foreground" />
    <div className="max-w-md text-center space-y-2">
      <h3 className="text-xl font-semibold">Nenhum agendamento encontrado</h3>
      <p className="text-muted-foreground">
        Não há agendamentos para o período selecionado. Crie um novo agendamento clicando no botão abaixo.
      </p>
      <Button 
        onClick={onCreateAgendamento}
        className="mt-2"
      >
        <Plus className="mr-2 h-4 w-4" />
        Novo Agendamento
      </Button>
    </div>
  </div>
);