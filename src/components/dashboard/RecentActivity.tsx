
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Example data structure for recent activities
const activities = [
  {
    id: 1,
    user: {
      name: 'Rebecca Smith',
      avatar: '/placeholder.svg',
      initials: 'RS',
    },
    action: 'commented on',
    target: 'Project Update',
    time: '10 minutes ago',
  },
  {
    id: 2,
    user: {
      name: 'John Carter',
      avatar: '/placeholder.svg',
      initials: 'JC',
    },
    action: 'completed',
    target: 'Design Review',
    time: '2 hours ago',
  },
  {
    id: 3,
    user: {
      name: 'Emma Wilson',
      avatar: '/placeholder.svg',
      initials: 'EW',
    },
    action: 'created',
    target: 'New Task',
    time: '5 hours ago',
  },
  {
    id: 4,
    user: {
      name: 'Michael Brown',
      avatar: '/placeholder.svg',
      initials: 'MB',
    },
    action: 'updated',
    target: 'Project Timeline',
    time: '1 day ago',
  },
  {
    id: 5,
    user: {
      name: 'Sophia Lee',
      avatar: '/placeholder.svg',
      initials: 'SL',
    },
    action: 'shared',
    target: 'Analytics Report',
    time: '2 days ago',
  },
];

interface RecentActivityProps {
  className?: string;
}

export function RecentActivity({ className }: RecentActivityProps) {
  return (
    <Card className={cn("dashboard-card", className)}>
      <div className="dashboard-card-gradient" />
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <Avatar className="h-9 w-9 mr-3">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback>{activity.user.initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user.name}</span>{' '}
                  <span className="text-muted-foreground">{activity.action}</span>{' '}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
