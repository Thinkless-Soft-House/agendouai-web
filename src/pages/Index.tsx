
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AreaChart } from "@/components/dashboard/AreaChart";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { PendingApprovals } from "@/components/dashboard/PendingApprovals";
import { ClientMessages } from "@/components/dashboard/ClientMessages";
import {
  Calendar,
  Users,
  Clock,
  Building,
  AlertCircle,
  CalendarCheck,
} from "lucide-react";

// Dados de exemplo
const upcomingAppointments = [
  {
    id: "1",
    title: "Corte de Cabelo",
    client: "Maria Silva",
    time: "13:00",
    date: "Hoje",
    status: "confirmed" as const,
    empresa: "Barbearia Vintage",
    particao: "Cadeira 1"
  },
  {
    id: "2",
    title: "Reunião Empresarial",
    client: "João Costa",
    time: "15:30",
    date: "Hoje",
    status: "pending" as const,
    empresa: "Coworking Centro",
    particao: "Sala 3"
  },
  {
    id: "3",
    title: "Consulta Odontológica",
    client: "Pedro Souza",
    time: "09:15",
    date: "Amanhã",
    status: "confirmed" as const,
    empresa: "Dental Care",
    particao: "Consultório 2"
  }
];

const pendingApprovals = [
  {
    id: "4",
    title: "Tratamento Facial",
    client: "Ana Oliveira",
    time: "14:00",
    date: "Amanhã",
    empresa: "Estética Beleza",
    particao: "Sala 1"
  },
  {
    id: "5",
    title: "Massagem Relaxante",
    client: "Carlos Santos",
    time: "16:30",
    date: "23/06/2023",
    empresa: "Spa Relax",
    particao: "Sala 2"
  }
];

const clientMessages = [
  {
    id: "1",
    client: "Ana Maria",
    message: "Olá, gostaria de confirmar se ainda há vagas para amanhã às 15h?",
    time: "10:23",
    date: "Hoje",
    read: false
  },
  {
    id: "2",
    client: "Paulo Rodrigues",
    message: "Preciso remarcar meu horário da próxima semana, é possível?",
    time: "09:45",
    date: "Ontem",
    read: true
  }
];

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        {/* Primeira fileira: 2 estatísticas + pendentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Agendamentos Hoje"
            value="24"
            icon={Calendar}
            change={{ value: "15%", positive: true }}
          />
          <StatCard
            title="Taxa de Ocupação"
            value="87%"
            icon={Clock}
            change={{ value: "5%", positive: true }}
          />
          <PendingApprovals approvals={pendingApprovals} />
        </div>

        {/* Segunda fileira: Gráfico */}
        <div className="grid grid-cols-1 gap-6">
          <AreaChart
            title="Agendamentos por Período"
          />
        </div>

        {/* Terceira fileira: 2 estatísticas + mensagens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Clientes Ativos"
            value="182"
            icon={Users}
            change={{ value: "12%", positive: true }}
          />
          <StatCard
            title="Empresas"
            value="8"
            icon={Building}
            change={{ value: "2", positive: true }}
          />
          <ClientMessages messages={clientMessages} />
        </div>

        {/* Quarta fileira: 2 estatísticas + próximos agendamentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Agendamentos Pendentes"
            value="18"
            icon={AlertCircle}
            change={{ value: "4", positive: false }}
          />
          <StatCard
            title="Agendamentos Concluídos"
            value="156"
            icon={CalendarCheck}
            change={{ value: "23%", positive: true }}
          />
          <UpcomingAppointments appointments={upcomingAppointments} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
