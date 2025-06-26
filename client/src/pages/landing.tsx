import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, Calendar, Mail, Users, BarChart3 } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Unified Insurance Operations System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your insurance operations with our comprehensive platform for document management, 
            task tracking, and team collaboration.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Document Management</CardTitle>
              <CardDescription>
                Centralized document filing system with team-based organization and advanced search capabilities.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Assign tasks with deadlines, track progress, and ensure nothing falls through the cracks.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>Meeting Scheduling</CardTitle>
              <CardDescription>
                Schedule meetings with automatic syncing to Outlook and Microsoft Teams integration.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>Email Archiving</CardTitle>
              <CardDescription>
                Archive important emails directly from Outlook with folder organization and follow-up reminders.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>
                Track team performance and operations with comprehensive reporting and analytics.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>Multi-Team Support</CardTitle>
              <CardDescription>
                Separate workspaces for Personal Lines, Commercial, Corporate, and Claims teams.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Ready to Get Started?</CardTitle>
              <CardDescription>
                Join your insurance operations team and start streamlining workflows today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleLogin} className="w-full" size="lg">
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
