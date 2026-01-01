import { useState, useEffect, useCallback } from "react";
import { api, type LoginResponse, type MeResponse } from "../services/api";

interface AuthUser {
  username: string;
  role: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData: MeResponse = await api.auth.me();
        setUser({
          username: userData.username,
          role: userData.role,
        });
      } catch (err) {
        // Token invalid or expired
        api.auth.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response: LoginResponse = await api.auth.login(username, password);
      setUser({
        username: response.username,
        role: response.role,
      });
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    api.auth.logout();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
  };
}
