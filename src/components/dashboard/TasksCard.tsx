
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

// Example data structure for tasks
const tasks = [
  {
    id: 1,
    title: 'Review product requirements',
    completed: true,
  },
  {
    id: 2,
    title: 'Design system updates',
    completed: false,
  },
  {
    id: 3,
    title: 'Team meeting at 3 PM',
    completed: false,
  },
  {
    id: 4,
    title: 'Update project documentation',
    completed: false,
  },
  {
    id: 5,
    title: 'Client presentation for new features',
    completed: false,
  },
];

interface TasksCardProps {
  className?: string;
}

export function TasksCard({ className }: TasksCardProps) {
  const [checkedTasks, setCheckedTasks] = React.useState<Record<number, boolean>>(
    tasks.reduce((acc, task) => ({ ...acc, [task.id]: task.completed }), {})
  );

  const handleTaskChange = (taskId: number, checked: boolean) => {
    setCheckedTasks((prev) => ({ ...prev, [taskId]: checked }));
  };

  return (
    <Card className={cn("dashboard-card", className)}>
      <div className="dashboard-card-gradient" />
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start space-x-3">
              <Checkbox
                id={`task-${task.id}`}
                checked={checkedTasks[task.id]}
                onCheckedChange={(checked) => handleTaskChange(task.id, checked as boolean)}
              />
              <label
                htmlFor={`task-${task.id}`}
                className={cn(
                  "text-sm cursor-pointer flex-1 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                  checkedTasks[task.id] && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
