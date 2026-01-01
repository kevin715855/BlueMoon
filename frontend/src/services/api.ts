// API Configuration - Update this to point to your Python backend
const API_BASE_URL = "http://localhost:8000/api";

// ==================== TYPE DEFINITIONS ====================

// Auth Types
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

// Account Types
export interface AccountCreate {
  username: string;
  password: string;
  role: "Resident" | "Accountant" | "Manager" | "Admin";
}

export interface AccountResponse {
  username: string;
  role: string;
  isActive: boolean;
}

export interface AccountRoleUpdate {
  role: "Resident" | "Accountant" | "Manager" | "Admin";
}

export interface AccountPasswordUpdate {
  newPassword: string;
}

// Apartment Types
export interface Apartment {
  apartmentID: string;
  status?: string;
  buildingID?: string;
  numResident?: number;
}

export interface ApartmentCreate {
  apartmentID: string;
  numResident?: number;
  status?: string;
  buildingID?: string;
}

// Resident Types
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

export interface ResidentCreate {
  apartmentID?: string;
  fullName: string;
  age?: number;
  date?: string;
  phoneNumber?: string;
  isOwner: boolean;
  username?: string;
}

export interface ResidentUpdate {
  apartmentID?: string;
  fullName?: string;
  age?: number;
  date?: string;
  phoneNumber?: string;
  isOwner?: boolean;
  username?: string;
}

// Bill Types
export interface Bill {
  billID: number;
  apartmentID?: string;
  accountantID?: number;
  createDate?: string;
  deadline?: string;
  typeOfBill?: string;
  amount?: number;
  total?: number;
  status: "Unpaid" | "Paid" | "Overdue";
  paymentMethod?: string;
}

export interface BillCreate {
  apartmentID: string;
  accountantID: number;
  deadline: string;
  typeOfBill: string;
  amount: number;
  total: number;
}

// Building Manager Types
export interface BuildingManager {
  managerID: number;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  username?: string;
}

export interface BuildingManagerCreate {
  fullName: string;
  phoneNumber?: string;
  email?: string;
  username?: string;
}

export interface BuildingManagerUpdate {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  username?: string;
}

// Building Types
export interface Building {
  buildingID: string;
  buildingName?: string;
  address?: string;
  numFloors?: number;
  managerID?: number;
}

export interface BuildingUpdateManager {
  managerID: number;
}

// Accountant Types
export interface Accountant {
  accountantID: number;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  username?: string;
}

export interface AccountantCreate {
  fullName: string;
  phoneNumber?: string;
  email?: string;
  username?: string;
}

export interface AccountantUpdate {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  username?: string;
}

// Payment Types
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

export interface PaymentCreateRequest {
  bill_ids: number[];
}

export interface OfflinePaymentRequest {
  residentID: number;
  paymentContent: string;
  paymentMethod?: string;
  bill_ids: number[];
}

export interface PaymentResponse {
  transID: number;
  status: string;
  totalAmount: number;
  billsPaid: number;
}

export interface QRCodeResponse {
  transaction_id: number;
  trans_code: string;
  total_amount: number;
  qr_url: string;
}

// Receipt Types
export interface ReceiptBillDetail {
  billID: number;
  billName: string;
  amount: number;
  dueDate: string;
}

export interface ReceiptResponse {
  transID: number;
  residentID: number;
  residentName: string;
  apartmentID: string;
  phoneNumber?: string;
  totalAmount: number;
  paymentMethod: string;
  paymentContent?: string;
  status: string;
  payDate: string;
  bills: ReceiptBillDetail[];
}

// ==================== API ERROR CLASS ====================

export class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// ==================== HELPER FUNCTIONS ====================

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("access_token");
};

// Generic fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
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
      errorData.detail || "Request failed"
    );
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// ==================== API SERVICE ====================

export const api = {
  // ==================== AUTHENTICATION ====================
  auth: {
    login: async (
      username: string,
      password: string
    ): Promise<LoginResponse> => {
      const response = await fetchApi<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      // Store token in localStorage
      if (response.access_token) {
        localStorage.setItem("access_token", response.access_token);
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

  // ==================== ACCOUNT MANAGEMENT ====================
  accounts: {
    create: async (account: AccountCreate): Promise<AccountResponse> => {
      return fetchApi<AccountResponse>("/accounts/account", {
        method: "POST",
        body: JSON.stringify(account),
      });
    },

    get: async (username: string): Promise<AccountResponse> => {
      return fetchApi<AccountResponse>(`/accounts/managers/${username}`, {
        method: "GET",
      });
    },

    delete: async (username: string): Promise<void> => {
      return fetchApi<void>(`/accounts/${username}`, {
        method: "DELETE",
      });
    },

    updateRole: async (
      username: string,
      roleData: AccountRoleUpdate
    ): Promise<AccountResponse> => {
      return fetchApi<AccountResponse>(
        `/accounts/managers/${username}/role`,
        {
          method: "PATCH",
          body: JSON.stringify(roleData),
        }
      );
    },

    updatePassword: async (
      username: string,
      passwordData: AccountPasswordUpdate
    ): Promise<AccountResponse> => {
      return fetchApi<AccountResponse>(
        `/accounts/managers/${username}/password`,
        {
          method: "PATCH",
          body: JSON.stringify(passwordData),
        }
      );
    },
  },

  // ==================== APARTMENTS ====================
  apartments: {
    getAll: async (
      skip: number = 0,
      limit: number = 100
    ): Promise<Apartment[]> => {
      return fetchApi<Apartment[]>(
        `/apartments/get-apartments-data?skip=${skip}&limit=${limit}`,
        { method: "GET" }
      );
    },

    create: async (apartment: ApartmentCreate): Promise<Apartment> => {
      return fetchApi<Apartment>("/apartments/add-new-apartment", {
        method: "POST",
        body: JSON.stringify(apartment),
      });
    },

    update: async (
      id: string,
      apartment: Partial<Apartment>
    ): Promise<Apartment> => {
      return fetchApi<Apartment>(`/apartments/${id}`, {
        method: "PUT",
        body: JSON.stringify(apartment),
      });
    },

    delete: async (id: string): Promise<void> => {
      return fetchApi<void>(`/apartments/${id}`, {
        method: "DELETE",
      });
    },
  },

  // ==================== RESIDENTS ====================
  residents: {
    getAll: async (
      skip: number = 0,
      limit: number = 100
    ): Promise<Resident[]> => {
      return fetchApi<Resident[]>(
        `/residents/get-residents-data?skip=${skip}&limit=${limit}`,
        { method: "GET" }
      );
    },

    getDetail: async (
      fullname: string,
      apartmentId: string
    ): Promise<Resident> => {
      return fetchApi<Resident>(
        `/residents/resident_detail?fullname=${encodeURIComponent(
          fullname
        )}&apartment_id=${encodeURIComponent(apartmentId)}`,
        { method: "GET" }
      );
    },

    create: async (resident: ResidentCreate): Promise<Resident> => {
      return fetchApi<Resident>("/residents/add-new-resident", {
        method: "POST",
        body: JSON.stringify(resident),
      });
    },

    update: async (
      id: number,
      resident: ResidentUpdate
    ): Promise<Resident> => {
      return fetchApi<Resident>(`/residents/${id}`, {
        method: "PUT",
        body: JSON.stringify(resident),
      });
    },

    delete: async (id: number): Promise<void> => {
      return fetchApi<void>(`/residents/${id}`, {
        method: "DELETE",
      });
    },
  },

  // ==================== BILLS ====================
  bills: {
    getMyBills: async (): Promise<Bill[]> => {
      return fetchApi<Bill[]>("/bills/my-bills", {
        method: "GET",
      });
    },

    create: async (bill: BillCreate): Promise<Bill> => {
      return fetchApi<Bill>("/bills/", {
        method: "POST",
        body: JSON.stringify(bill),
      });
    },
  },

  // ==================== BUILDING MANAGERS ====================
  buildingManagers: {
    getAll: async (): Promise<BuildingManager[]> => {
      return fetchApi<BuildingManager[]>("/building-managers/", {
        method: "GET",
      });
    },

    get: async (id: number): Promise<BuildingManager> => {
      return fetchApi<BuildingManager>(`/building-managers/${id}`, {
        method: "GET",
      });
    },

    create: async (
      manager: BuildingManagerCreate
    ): Promise<BuildingManager> => {
      return fetchApi<BuildingManager>("/building-managers/", {
        method: "POST",
        body: JSON.stringify(manager),
      });
    },

    update: async (
      id: number,
      manager: BuildingManagerUpdate
    ): Promise<BuildingManager> => {
      return fetchApi<BuildingManager>(`/building-managers/${id}`, {
        method: "PATCH",
        body: JSON.stringify(manager),
      });
    },

    delete: async (id: number): Promise<void> => {
      return fetchApi<void>(`/building-managers/${id}`, {
        method: "DELETE",
      });
    },
  },

  // ==================== BUILDINGS ====================
  buildings: {
    getByManager: async (managerId: number): Promise<Building[]> => {
      return fetchApi<Building[]>(`/buildings/manager/${managerId}`, {
        method: "GET",
      });
    },

    updateManager: async (
      buildingId: string,
      data: BuildingUpdateManager
    ): Promise<Building> => {
      return fetchApi<Building>(`/buildings/${buildingId}/manager`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  },

  // ==================== ACCOUNTANTS ====================
  accountants: {
    getAll: async (): Promise<Accountant[]> => {
      return fetchApi<Accountant[]>("/accountants/", {
        method: "GET",
      });
    },

    get: async (id: number): Promise<Accountant> => {
      return fetchApi<Accountant>(`/accountants/${id}`, {
        method: "GET",
      });
    },

    create: async (accountant: AccountantCreate): Promise<Accountant> => {
      return fetchApi<Accountant>("/accountants/", {
        method: "POST",
        body: JSON.stringify(accountant),
      });
    },

    update: async (
      id: number,
      accountant: AccountantUpdate
    ): Promise<Accountant> => {
      return fetchApi<Accountant>(`/accountants/${id}`, {
        method: "PATCH",
        body: JSON.stringify(accountant),
      });
    },

    delete: async (id: number): Promise<void> => {
      return fetchApi<void>(`/accountants/${id}`, {
        method: "DELETE",
      });
    },
  },

  // ==================== ONLINE PAYMENTS ====================
  payments: {
    createQR: async (billIds: number[]): Promise<QRCodeResponse> => {
      return fetchApi<QRCodeResponse>("/online-payments/create-qr", {
        method: "POST",
        body: JSON.stringify({ bill_ids: billIds }),
      });
    },

    checkExpiry: async (): Promise<any> => {
      return fetchApi<any>("/online-payments/check-expiry", {
        method: "POST",
      });
    },

    // Get payment history for current user
    getMyHistory: async (): Promise<PaymentTransaction[]> => {
      return fetchApi<PaymentTransaction[]>("/payments/my-history", {
        method: "GET",
      });
    },
  },

  // ==================== OFFLINE PAYMENTS ====================
  offlinePayments: {
    create: async (
      payment: OfflinePaymentRequest
    ): Promise<PaymentResponse> => {
      return fetchApi<PaymentResponse>("/offline-payments/offline_payment", {
        method: "POST",
        body: JSON.stringify(payment),
      });
    },
  },

  // ==================== RECEIPTS ====================
  receipts: {
    get: async (transactionId: number): Promise<ReceiptResponse> => {
      return fetchApi<ReceiptResponse>(`/receipts/${transactionId}`, {
        method: "GET",
      });
    },
  },
};

// ==================== EXPORTS ====================
export default api;
