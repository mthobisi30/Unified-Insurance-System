import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MetricsCards from "@/components/dashboard/metrics-cards";
import RecentTasks from "@/components/dashboard/recent-tasks";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentActivity from "@/components/dashboard/recent-activity";
import DocumentTable from "@/components/dashboard/document-table";
import FileUploadModal from "@/components/modals/file-upload-modal";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Setup user teams on first visit
  useEffect(() => {
    if (isAuthenticated) {
      const setupUser = async () => {
        try {
          await apiRequest("POST", "/api/setup");
        } catch (error) {
          if (isUnauthorizedError(error as Error)) {
            toast({
              title: "Unauthorized",
              description: "You are logged out. Logging in again...",
              variant: "destructive",
            });
            setTimeout(() => {
              window.location.href = "/api/login";
            }, 500);
            return;
          }
          // Ignore setup errors as user might already be set up
        }
      };
      setupUser();
    }
  }, [isAuthenticated, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <MetricsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <RecentTasks />
            </div>
            <div className="space-y-6">
              <QuickActions />
              <RecentActivity />
            </div>
          </div>

          <div className="mt-8">
            <DocumentTable />
          </div>
        </main>
      </div>
      <FileUploadModal />
    </div>
  );
}
