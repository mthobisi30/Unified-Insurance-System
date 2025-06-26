import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckSquare, Calendar, AlertTriangle, TrendingUp } from "lucide-react";

interface DashboardMetrics {
  activeTasks: number;
  documentsToday: number;
  meetingsToday: number;
  pendingReviews: number;
}

export default function MetricsCards() {
  const { isAuthenticated } = useAuth();

  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Active Tasks",
      value: metrics?.activeTasks || 0,
      icon: CheckSquare,
      color: "bg-blue-600",
      bgColor: "bg-blue-100",
      change: "+12%",
      changeText: "from last week",
    },
    {
      title: "Documents Filed",
      value: metrics?.documentsToday || 0,
      icon: FileText,
      color: "bg-green-600",
      bgColor: "bg-green-100",
      change: "+8%",
      changeText: "from yesterday",
    },
    {
      title: "Meetings Today",
      value: metrics?.meetingsToday || 0,
      icon: Calendar,
      color: "bg-orange-600",
      bgColor: "bg-orange-100",
      change: "Next: 2:30 PM",
      changeText: "",
    },
    {
      title: "Pending Reviews",
      value: metrics?.pendingReviews || 0,
      icon: AlertTriangle,
      color: "bg-red-600",
      bgColor: "bg-red-100",
      change: "3 overdue",
      changeText: "",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-700">{card.title}</p>
                <p className="text-3xl font-semibold text-neutral-900">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                {card.change}
              </span>
              {card.changeText && (
                <span className="text-sm text-neutral-500 ml-2">{card.changeText}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
