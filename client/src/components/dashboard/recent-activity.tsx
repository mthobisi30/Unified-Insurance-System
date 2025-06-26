import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, Calendar, Mail, Upload } from "lucide-react";
import { format } from "date-fns";
import type { ActivityLog } from "@shared/schema";

export default function RecentActivity() {
  const { isAuthenticated } = useAuth();

  const { data: activities, isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/dashboard/recent-activity"],
    enabled: isAuthenticated,
  });

  const getActivityIcon = (action: string, entityType: string) => {
    if (action === 'upload' || entityType === 'document') {
      return <FileText className="w-4 h-4 text-ms-blue" />;
    }
    if (action === 'create' && entityType === 'task') {
      return <CheckCircle2 className="w-4 h-4 text-ms-green" />;
    }
    if (action === 'create' && entityType === 'meeting') {
      return <Calendar className="w-4 h-4 text-ms-orange" />;
    }
    if (action === 'archive' && entityType === 'email') {
      return <Mail className="w-4 h-4 text-ms-red" />;
    }
    return <Upload className="w-4 h-4 text-gray-500" />;
  };

  const getActivityBgColor = (action: string, entityType: string) => {
    if (action === 'upload' || entityType === 'document') {
      return 'bg-blue-100';
    }
    if (action === 'create' && entityType === 'task') {
      return 'bg-green-100';
    }
    if (action === 'create' && entityType === 'meeting') {
      return 'bg-orange-100';
    }
    if (action === 'archive' && entityType === 'email') {
      return 'bg-red-100';
    }
    return 'bg-gray-100';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-4 border-b border-neutral-300">
          <CardTitle className="text-lg font-semibold text-neutral-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
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
      <CardHeader className="pb-4 border-b border-neutral-300">
        <CardTitle className="text-lg font-semibold text-neutral-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 ${getActivityBgColor(activity.action, activity.entityType)} rounded-full flex items-center justify-center flex-shrink-0`}>
                  {getActivityIcon(activity.action, activity.entityType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900">
                    {activity.description}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {format(new Date(activity.createdAt!), "h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <FileText className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-neutral-600">No recent activity.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
