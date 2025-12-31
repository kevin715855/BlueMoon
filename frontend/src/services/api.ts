// API Configuration - Update this to point to your Python backend
const API_BASE_URL = "http://localhost:8000/api";

// Types based on Python backend schemas
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  username: string;
  role: string;
}

export interface MeResponse {
  username: string;
  role: string;
}

export interface Apartment {
  apartmentID: string;
  area?: number;
  status?: string;
  buildingID?: string;
}

export interface Resident {
  residentID: number;
  apartmentID?: string;
  fullName: string;
  age?: number;
  date?: string;
  phoneNumber?: string;
  isOwner: boolean;
  username?: string;
}

export interface PaymentTransaction {
  transID: number;
  residentID: number;
  amount: number;
  paymentContent?: string;
  paymentMethod?: string;
  status: "Pending" | "Success" | "Failed";
  createdDate?: string;
  payDate?: string;
  gatewayTransCode?: string;
}

// API Error Class
export class ApiError extends Error {
  public status: number;

  constructor(
    status: number,
    message: string,
  ) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("access_token");
};

// Generic fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      detail: "An error occurred",
    }));
    throw new ApiError(
      response.status,
      errorData.detail || "Request failed",
    );
  }

  return response.json();
}

// API Service
export const api = {
  // Authentication
  auth: {
    login: async (
      username: string,
      password: string,
    ): Promise<LoginResponse> => {
      const response = await fetchApi<LoginResponse>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ username, password }),
        },
      );

      // Store token in localStorage
      if (response.access_token) {
        localStorage.setItem(
          "access_token",
          response.access_token,
        );
        localStorage.setItem("username", response.username);
        localStorage.setItem("role", response.role);
      }

      return response;
    },

    me: async (): Promise<MeResponse> => {
      return fetchApi<MeResponse>("/auth/me", {
        method: "GET",
      });
    },

    logout: () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
    },
  },

  // Apartments
  apartments: {
    getAll: async (
      skip: number = 0,
      limit: number = 100,
    ): Promise<Apartment[]> => {
      return fetchApi<Apartment[]>(
        `/apartments/get-apartments-data?skip=${skip}&limit=${limit}`,
        { method: "GET" },
      );
    },

    create: async (
      apartment: Partial<Apartment>,
    ): Promise<Apartment> => {
      return fetchApi<Apartment>(
        "/apartments/add-new-apartment",
        {
          method: "POST",
          body: JSON.stringify(apartment),
        },
      );
    },
  },

  // Residents
  residents: {
    getAll: async (
      skip: number = 0,
      limit: number = 100,
    ): Promise<Resident[]> => {
      return fetchApi<Resident[]>(
        `/residents/get-residents-data?skip=${skip}&limit=${limit}`,
        { method: "GET" },
      );
    },

    create: async (
      resident: Partial<Resident>,
    ): Promise<Resident> => {
      return fetchApi<Resident>("/residents/add-new-resident", {
        method: "POST",
        body: JSON.stringify(resident),
      });
    },
  },

  // Payments (Online Payments via QR)
  payments: {
    createQR: async (billIds: number[]): Promise<any> => {
      return fetchApi<any>("/payments/create-qr", {
        method: "POST",
        body: JSON.stringify({ bill_ids: billIds }),
      });
    },

    checkExpiry: async (): Promise<any> => {
      return fetchApi<any>("/payments/check-expiry", {
        method: "POST",
      });
    },
  },
};
