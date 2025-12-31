import { useState, useEffect } from "react";

import type { Bill } from "../services/api";
import { api } from "../services/api";

export function useBills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBills = async () => {
    try {
      setLoading(true);
      setError(null);

      // This endpoint requires authentication
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      const data = await api.bills.getAll();
      setBills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bills");
      console.error("Error loading bills:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  return {
    bills,
    loading,
    error,
    refetch: loadBills,
  };
}
