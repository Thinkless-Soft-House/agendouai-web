
import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AreaChart } from "@/components/dashboard/AreaChart";
import { TasksCard } from "@/components/dashboard/TasksCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import {
  Calendar,
  Users,
  Clock,
  Building,
  AlertCircle,
  CalendarCheck,
} from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AreaChart
            title="Agendamentos por Período"
            className="lg:col-span-2"
          />
          <TasksCard className="lg:col-span-1" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentActivity className="lg:col-span-2" />
          <div className="lg:col-span-1 space-y-6">
            <div className="dashboard-card overflow-hidden rounded-lg border bg-card shadow-sm">
              <div className="dashboard-card-gradient" />
              <div className="p-6">
                <h3 className="text-lg font-semibold">Próximos Agendamentos</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Corte de Cabelo</p>
                      <p className="text-sm text-muted-foreground">Maria Silva</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">13:00</p>
                      <p className="text-xs text-muted-foreground">Hoje</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Reunião Empresarial</p>
                      <p className="text-sm text-muted-foreground">João Costa</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">15:30</p>
                      <p className="text-xs text-muted-foreground">Hoje</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Consulta Odontológica</p>
                      <p className="text-sm text-muted-foreground">Pedro Souza</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">09:15</p>
                      <p className="text-xs text-muted-foreground">Amanhã</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
