import { useState, useEffect } from "react";

import { api, ApiError } from "../services/api";

export interface User {
  username: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.auth.me();
      setUser({
        username: response.username,
        role: response.role,
      });
      setError(null);
    } catch (err) {
      console.error("Failed to load user:", err);
      setError("Failed to load user data");
      api.auth.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      let hashedPassword = password;

      const response = await api.auth.login(username, hashedPassword);
      setUser({
        username: response.username,
        role: response.role,
      });
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
