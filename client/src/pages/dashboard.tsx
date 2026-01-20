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

  // Setup user teams on first visit
  useEffect(() => {
    const setupUser = async () => {
      try {
        await apiRequest("POST", "/api/setup");
      } catch (error) {
        // Ignore setup errors as environment might already be initialized
      }
    };
    setupUser();
  }, []);

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
