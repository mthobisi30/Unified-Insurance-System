import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Upload } from "lucide-react";
import FileUploadModal from "@/components/modals/file-upload-modal";

export default function Header() {
  const { user } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-neutral-300 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">Dashboard</h2>
            <p className="text-sm text-neutral-700">
              Welcome back, <span className="font-medium">{user?.firstName}</span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            <Button
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
            
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  3
                </Badge>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <FileUploadModal open={showUploadModal} onOpenChange={setShowUploadModal} />
    </>
  );
}
