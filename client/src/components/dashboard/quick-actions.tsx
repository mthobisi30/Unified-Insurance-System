import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Plus, Calendar, Mail } from "lucide-react";
import { Link } from "wouter";
import FileUploadModal from "@/components/modals/file-upload-modal";

export default function QuickActions() {
  const [showUploadModal, setShowUploadModal] = useState(false);

  const actions = [
    {
      title: "Upload Document",
      icon: FileUp,
      color: "text-ms-blue",
      bgColor: "bg-blue-100",
      onClick: () => setShowUploadModal(true),
    },
    {
      title: "Create Task",
      icon: Plus,
      color: "text-ms-green",
      bgColor: "bg-green-100",
      href: "/tasks",
    },
    {
      title: "Schedule Meeting",
      icon: Calendar,
      color: "text-ms-orange",
      bgColor: "bg-orange-100",
      href: "/calendar",
    },
    {
      title: "Archive Email",
      icon: Mail,
      color: "text-ms-red",
      bgColor: "bg-red-100",
      href: "/email-archive",
    },
  ];

  return (
    <>
      <Card>
        <CardHeader className="pb-4 border-b border-neutral-300">
          <CardTitle className="text-lg font-semibold text-neutral-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {actions.map((action, index) => {
            const ActionButton = (
              <Button
                key={index}
                variant="ghost"
                className="w-full flex items-center justify-start space-x-3 p-3 h-auto bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                onClick={action.onClick}
              >
                <div className={`w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center`}>
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <span className="font-medium text-neutral-900">{action.title}</span>
              </Button>
            );

            if (action.href) {
              return (
                <Link key={index} href={action.href}>
                  {ActionButton}
                </Link>
              );
            }

            return ActionButton;
          })}
        </CardContent>
      </Card>
      <FileUploadModal open={showUploadModal} onOpenChange={setShowUploadModal} />
    </>
  );
}
