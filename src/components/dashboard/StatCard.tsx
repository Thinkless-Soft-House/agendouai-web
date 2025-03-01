
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string | number;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, change, className }: StatCardProps) {
  return (
    <Card className={cn("dashboard-card overflow-hidden", className)}>
      <div className="dashboard-card-gradient" />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="stat-label">{title}</p>
            <p className="stat-value">{value}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
            <Icon className="h-5 w-5 text-accent-foreground" />
          </div>
        </div>
        
        {change && (
          <div className="mt-4 flex items-center text-sm">
            <span className={cn(
              "font-medium",
              change.positive ? "text-green-500" : "text-red-500"
            )}>
              {change.positive ? "+" : ""}{change.value}
            </span>
            <span className="ml-1 text-muted-foreground">vs. last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
