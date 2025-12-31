import { useState, useEffect } from "react";

import type { Resident } from "../services/api";
import { api, ApiError } from "../services/api";

export function useResidents() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.residents.getAll();
      setResidents(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load residents");
      }
      setResidents([]);
    } finally {
      setLoading(false);
    }
  };

  const createResident = async (
    residentData: Partial<Resident>,
  ): Promise<boolean> => {
    try {
      setError(null);
      const newResident =
        await api.residents.create(residentData);
      setResidents([...residents, newResident]);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create resident");
      }
      return false;
    }
  };

  return {
    residents,
    loading,
    error,
    loadResidents,
    createResident,
  };
}
