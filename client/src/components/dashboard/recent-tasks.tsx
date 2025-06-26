import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import type { Task } from "@shared/schema";

export default function RecentTasks() {
  const { isAuthenticated } = useAuth();

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks", { limit: 5 }],
    queryFn: async () => {
      const response = await fetch("/api/tasks?limit=5", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-3 h-3 text-green-600" />;
      case 'in_progress': return <Clock className="w-3 h-3 text-blue-600" />;
      case 'pending': return <AlertCircle className="w-3 h-3 text-orange-600" />;
      default: return <Clock className="w-3 h-3 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-neutral-900">Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-neutral-100 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-300 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-neutral-300">
        <CardTitle className="text-lg font-semibold text-neutral-900">Recent Tasks</CardTitle>
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="text-ms-blue hover:text-ms-blue-dark font-medium">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-6">
        {tasks && tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(task.status || 'pending')}
                  <div>
                    <p className="font-medium text-neutral-900">{task.title}</p>
                    <p className="text-sm text-neutral-700">
                      {task.assignedTo ? `Assigned to ${task.assignedTo}` : 'Unassigned'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-900">
                    {task.dueDate ? `Due ${format(new Date(task.dueDate), "MMM d")}` : 'No due date'}
                  </p>
                  <Badge className={getPriorityColor(task.priority || 'medium')}>
                    {task.priority || 'medium'} priority
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600">No recent tasks found.</p>
            <Link href="/tasks">
              <Button className="mt-4 bg-ms-blue hover:bg-ms-blue-dark">
                Create Your First Task
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
