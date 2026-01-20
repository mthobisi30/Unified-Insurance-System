import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string | null;
  currentTeamId?: number | null;
}

interface AuthResponse {
  user: User | null;
}

export function useAuth() {
  const user: User = {
    id: "default-user",
    email: "user@example.com",
    firstName: "Guest",
    lastName: "User",
  };

  return {
    user,
    isLoading: false,
    isAuthenticated: true,
    login: () => {},
    loginAsync: async () => {},
    logout: () => {},
    isLoggingIn: false,
    isLoggingOut: false,
  };
}
