import { useState, useEffect } from "react";

import type { Apartment } from "../services/api";
import { api, ApiError } from "../services/api";

export function useApartments() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApartments();
  }, []);

  const loadApartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.apartments.getAll();
      setApartments(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load apartments");
      }
      setApartments([]);
    } finally {
      setLoading(false);
    }
  };

  const createApartment = async (
    apartmentData: Partial<Apartment>,
  ): Promise<boolean> => {
    try {
      setError(null);
      const newApartment =
        await api.apartments.create(apartmentData);
      setApartments([...apartments, newApartment]);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create apartment");
      }
      return false;
    }
  };

  return {
    apartments,
    loading,
    error,
    loadApartments,
    createApartment,
  };
}
