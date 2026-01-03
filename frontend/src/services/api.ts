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
  numResident?: number;
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
  managerID?: number;
  address?: string;
  numApartment?: number;
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
  status: "Pending" | "Success" | "Failed" | "Expired";
  createdDate?: string;
  payDate?: string;
  gatewayTransCode?: string;
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

export interface Receipt {
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

// Notification Types
export interface Notification {
  notificationID: number;
  residentID: number;
  title: string;
  content: string;
  createdDate: string;
  isRead: boolean;
  electricity?: number | null;
  water?: number | null;
}

export interface BroadcastNotification {
  title: string;
  content: string;
}

// Accounting Types
export interface MeterReadingCreate {
  apartmentID: string;
  month: number;
  year: number;
  oldElectricity: number;
  newElectricity: number;
  oldWater: number;
  newWater: number;
}

export interface ServiceFeeCreate {
  buildingID: string;
  typeOfBill: string;
  feePerUnit?: number | null;
  flatFee?: number | null;
  effectiveDate: string;
}

export interface CalculateBillsRequest {
  month: number;
  year: number;
  deadline_day?: number;
  overwrite?: boolean;
}

export interface VerifyTransactionResponse {
  message: string;
  success: boolean;
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

    getByApartment: async (apartmentId: string): Promise<Resident[]> => {
      const allResidents = await fetchApi<Resident[]>(
        `/residents/get-residents-data?skip=0&limit=1000`,
        { method: "GET" }
      );
      // Filter by apartment ID on the client side
      return allResidents.filter(r => r.apartmentID === apartmentId);
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
    createQR: async (billIds: number[]): Promise<QRCodeResponse> => {
      return fetchApi<QRCodeResponse>("/offline-payments/create-qr", {
        method: "POST",
        body: JSON.stringify({ bill_ids: billIds }),
      });
    },

    verifyTransaction: async (content: string, amount: number): Promise<VerifyTransactionResponse> => {
      return fetchApi<VerifyTransactionResponse>("/offline-payments/verify-transaction", {
        method: "POST",
        body: JSON.stringify({ content, transferAmount: amount }),
      });
    }
  },

  // ==================== RECEIPTS ====================
  receipts: {
    get: async (transactionId: number): Promise<Receipt> => {
      return fetchApi<Receipt>(`/receipts/${transactionId}`, {
        method: "GET",
      });
    },
  },

  // ==================== NOTIFICATIONS ====================
  notifications: {
    // Get my notifications
    getMyNotifications: async (skip: number = 0, limit: number = 50): Promise<Notification[]> => {
      return fetchApi<Notification[]>(
        `/notification/my-notification?skip=${skip}&limit=${limit}`,
        {
          method: "GET",
        }
      );
    },

    // Mark notification as read
    markAsRead: async (id: number): Promise<{ message: string }> => {
      return fetchApi<{ message: string }>(`/notification/${id}/read`, {
        method: "PUT",
      });
    },

    // Get unread count
    getUnreadCount: async (): Promise<{ count: number }> => {
      return fetchApi<{ count: number }>("/notification/unread-count", {
        method: "GET",
      });
    },

    // Broadcast notification (Manager/Admin only)
    broadcast: async (notification: BroadcastNotification): Promise<{ message: string }> => {
      return fetchApi<{ message: string }>("/notification/broadcast", {
        method: "POST",
        body: JSON.stringify(notification),
      });
    },
  },

  // ==================== ACCOUNTING ====================
  accounting: {
    // Record meter readings
    recordMeterReading: async (data: MeterReadingCreate): Promise<{ message: string }> => {
      return fetchApi<{ message: string }>("/accounting/meter-readings", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    // Set service fees
    setServiceFee: async (data: ServiceFeeCreate): Promise<{ message: string }> => {
      return fetchApi<{ message: string }>("/accounting/service-fees", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    // Calculate monthly bills
    calculateBills: async (
      data: CalculateBillsRequest
    ): Promise<{ status: string; message: string; count: number }> => {
      return fetchApi<{ status: string; message: string; count: number }>(
        "/accounting/bills/calculate",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
    },

    // Get all bills with optional filters
    getAllBills: async (
      apartmentId?: string,
      status?: string
    ): Promise<Bill[]> => {
      const params = new URLSearchParams();
      if (apartmentId) params.append("apartment_id", apartmentId);
      if (status) params.append("status", status);

      const queryString = params.toString();
      const endpoint = queryString
        ? `/accounting/bills?${queryString}`
        : "/accounting/bills";

      return fetchApi<Bill[]>(endpoint, {
        method: "GET",
      });
    },
  },
};

// ==================== EXPORTS ====================
export default api;
