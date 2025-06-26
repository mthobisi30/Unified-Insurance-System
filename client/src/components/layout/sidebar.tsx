import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, BarChart3, FileText, Calendar, Mail, CheckSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Team } from "@shared/schema";

export default function Sidebar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();

  const { data: teams } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    enabled: !!user,
  });

  const selectTeamMutation = useMutation({
    mutationFn: async (teamId: number) => {
      await apiRequest("POST", `/api/teams/${teamId}/select`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Team selected successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to select team",
        variant: "destructive",
      });
    },
  });

  const currentTeam = teams?.find(team => team.id === user?.currentTeamId);

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Email Archive", href: "/email-archive", icon: Mail },
  ];

  const handleTeamChange = (teamId: string) => {
    selectTeamMutation.mutate(parseInt(teamId));
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r border-neutral-300 flex flex-col">
      {/* Logo and Header */}
      <div className="p-6 border-b border-neutral-300">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">Insurance Ops</h1>
            <p className="text-sm text-neutral-700">Unified System</p>
          </div>
        </div>
      </div>

      {/* Team Selector */}
      <div className="p-4 border-b border-neutral-300">
        <label className="block text-sm font-medium text-neutral-700 mb-2">Current Team</label>
        <Select 
          value={currentTeam?.id?.toString() || ""} 
          onValueChange={handleTeamChange}
          disabled={selectTeamMutation.isPending}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select team" />
          </SelectTrigger>
          <SelectContent>
            {teams?.map((team) => (
              <SelectItem key={team.id} value={team.id.toString()}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "text-white bg-blue-600"
                    : "text-neutral-700 hover:bg-neutral-100"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-neutral-300">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage 
              src={user?.profileImageUrl || ""} 
              alt={`${user?.firstName} ${user?.lastName}`}
              className="object-cover"
            />
            <AvatarFallback>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-neutral-700">Team Member</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
