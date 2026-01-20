import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  FileText, 
  Calendar, 
  Mail, 
  Users, 
  BarChart3, 
  ArrowRight,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  TrendingUp
} from "lucide-react";

export default function HomeDashboard() {
  // Fetch dashboard metrics to show on the landing page
  const { data: metrics, isLoading: loadingMetrics } = useQuery<{
    activeTasks: number;
    documentsToday: number;
    meetingsToday: number;
    pendingReviews: number;
  }>({
    queryKey: ["/api/dashboard/metrics"],
  });

  return (
    <div className="min-h-screen bg-neutral-50 overflow-x-hidden">
      {/* Navigation Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900 tracking-tight">Unified Insurance</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/documents" className="text-sm font-medium text-neutral-600 hover:text-blue-600 transition-colors">Documents</Link>
            <Link href="/tasks" className="text-sm font-medium text-neutral-600 hover:text-blue-600 transition-colors">Tasks</Link>
            <Link href="/calendar" className="text-sm font-medium text-neutral-600 hover:text-blue-600 transition-colors">Calendar</Link>
            <Link href="/email-archive" className="text-sm font-medium text-neutral-600 hover:text-blue-600 transition-colors">Email Archive</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">Admin Panel</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-white pt-16 pb-24 border-b border-neutral-100">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 text-blue-600 font-semibold mb-4">
                <TrendingUp className="w-4 h-4" />
                <span className="uppercase tracking-wider text-xs">Operations Dashboard</span>
              </div>
              <h1 className="text-5xl font-extrabold text-neutral-900 mb-6 leading-tight">
                Unified Insurance <br />
                <span className="text-blue-600">Operations Control Center</span>
              </h1>
              <p className="text-xl text-neutral-600 mb-10 max-w-2xl leading-relaxed">
                Seamlessly manage documents, track team tasks, and organize meetings across all insurance departments in one centralized platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/tasks">
                  <Button size="lg" className="px-8 bg-blue-600 hover:bg-blue-700">
                    Get Started <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/documents">
                  <Button size="lg" variant="outline" className="px-8">
                    View Archive
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats Section */}
        <div className="container mx-auto px-6 -mt-12 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-none shadow-xl shadow-blue-900/5 bg-white overflow-hidden group hover:-translate-y-1 transition-transform">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
                </div>
                <div className="text-2xl font-bold text-neutral-900">{loadingMetrics ? "..." : metrics?.documentsToday}</div>
                <div className="text-sm text-neutral-500 font-medium lowercase">Documents Today</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl shadow-blue-900/5 bg-white overflow-hidden group hover:-translate-y-1 transition-transform">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-neutral-900">{loadingMetrics ? "..." : metrics?.activeTasks}</div>
                <div className="text-sm text-neutral-500 font-medium lowercase">Active Tasks</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl shadow-blue-900/5 bg-white overflow-hidden group hover:-translate-y-1 transition-transform">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-neutral-900">{loadingMetrics ? "..." : metrics?.meetingsToday}</div>
                <div className="text-sm text-neutral-500 font-medium lowercase">Meetings Scheduled</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-xl shadow-blue-900/5 bg-white overflow-hidden group hover:-translate-y-1 transition-transform">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-neutral-900">{loadingMetrics ? "..." : metrics?.pendingReviews}</div>
                <div className="text-sm text-neutral-500 font-medium lowercase">Pending Reviews</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Blocks */}
        <section className="container mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Link href="/documents">
              <Card className="cursor-pointer group hover:border-blue-300 transition-all border-neutral-200">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">Document Management</CardTitle>
                    <CardDescription>Archive and search insurance policies and claims</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-neutral-500 text-sm">
                    <span>Recent additions: Policy-X920.pdf, Claim-001.pdf</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/tasks">
              <Card className="cursor-pointer group hover:border-green-300 transition-all border-neutral-200">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold group-hover:text-green-600 transition-colors">Team Workflow</CardTitle>
                    <CardDescription>Assign and track operational tasks across teams</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-neutral-500 text-sm">
                    <span>High priority: Claim review, Policy renewal</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/calendar">
              <Card className="cursor-pointer group hover:border-orange-300 transition-all border-neutral-200">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 bg-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold group-hover:text-orange-600 transition-colors">Meeting Hub</CardTitle>
                    <CardDescription>Schedule and sync team strategy meetings</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-neutral-500 text-sm">
                    <span>Next meeting: Today at 2:00 PM (Claims Review)</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/email-archive">
              <Card className="cursor-pointer group hover:border-red-300 transition-all border-neutral-200">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold group-hover:text-red-600 transition-colors">Communication Archive</CardTitle>
                    <CardDescription>Searchable database of client and provider emails</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-neutral-500 text-sm">
                    <span>Syncing with Microsoft Outlook 365</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Departments Section */}
        <section className="bg-neutral-900 py-24 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/10 skew-x-12 transform origin-top"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-xl">
                <h2 className="text-4xl font-bold mb-6">Service Departments</h2>
                <p className="text-neutral-400 text-lg">
                  Specialized workspaces for every team in your organization, from Personal Lines to Claims management.
                </p>
              </div>
              <Button variant="outline" className="text-white border-neutral-700 hover:bg-neutral-800">
                Manage Teams
              </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {["Personal Lines", "Commercial", "Corporate", "Claims"].map((dept) => (
                <div key={dept} className="p-8 bg-neutral-800 rounded-3xl border border-neutral-700 hover:bg-neutral-700/50 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 bg-neutral-700 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                    <Shield className="w-5 h-5 text-neutral-400 group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{dept}</h3>
                  <div className="flex items-center text-xs text-neutral-500 font-bold tracking-widest uppercase">
                    <span>Active Team</span>
                    <CheckCircle2 className="ml-2 w-3 h-3 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-neutral-900 tracking-tight">Unified Insurance Ops</span>
          </div>
          <p className="text-sm text-neutral-400">
            © 2026 Unified Insurance Operations System. Internal Use Only.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs font-bold text-green-600 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></div>
              SYSTEM ONLINE
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
