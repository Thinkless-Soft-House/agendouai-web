
import React from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { AreaChart } from '@/components/dashboard/AreaChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { TasksCard } from '@/components/dashboard/TasksCard';
import { Users, BarChart3, CreditCard, Activity } from 'lucide-react';

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back to your dashboard.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Users" 
            value="1,652" 
            icon={Users} 
            change={{ value: "12%", positive: true }}
            className="animate-slide-in [animation-delay:0ms]"
          />
          <StatCard 
            title="Weekly Revenue" 
            value="$12,426" 
            icon={CreditCard} 
            change={{ value: "8.2%", positive: true }}
            className="animate-slide-in [animation-delay:75ms]"
          />
          <StatCard 
            title="Active Sessions" 
            value="342" 
            icon={Activity} 
            change={{ value: "5%", positive: false }}
            className="animate-slide-in [animation-delay:150ms]"
          />
          <StatCard 
            title="Conversion Rate" 
            value="3.6%" 
            icon={BarChart3} 
            change={{ value: "0.8%", positive: true }}
            className="animate-slide-in [animation-delay:225ms]"
          />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-8">
          <AreaChart className="lg:col-span-5" />
          <TasksCard className="lg:col-span-3" />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-1">
          <RecentActivity />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
