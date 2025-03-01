
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart as Chart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4000 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5000 },
  { name: 'Jul', value: 7000 },
  { name: 'Aug', value: 8000 },
  { name: 'Sep', value: 7000 },
  { name: 'Oct', value: 9000 },
  { name: 'Nov', value: 8000 },
  { name: 'Dec', value: 10000 },
];

interface AreaChartProps {
  title?: string;
  className?: string;
}

export function AreaChart({ title = "Activity Overview", className }: AreaChartProps) {
  return (
    <Card className={cn("dashboard-card", className)}>
      <div className="dashboard-card-gradient" />
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] w-full px-6 pb-6">
          <ResponsiveContainer width="100%" height="100%">
            <Chart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorValue)"
                strokeWidth={2}
              />
            </Chart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
