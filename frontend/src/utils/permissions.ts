/**
 * Role-based permission utilities based on API_DOCUMENTATION.md
 */

export type UserRole = "Resident" | "Accountant" | "Manager" | "Admin";

export const Permissions = {
  // Account Management - Only Manager and Admin
  canManageAccounts: (role: UserRole): boolean => {
    return role === "Manager" || role === "Admin";
  },

  // Building Managers - Only Manager and Admin
  canManageBuildingManagers: (role: UserRole): boolean => {
    return role === "Manager" || role === "Admin";
  },

  // Buildings - Only Manager and Admin
  canManageBuildings: (role: UserRole): boolean => {
    return role === "Manager" || role === "Admin";
  },

  // Accountants - Only Manager and Admin
  canManageAccountants: (role: UserRole): boolean => {
    return role === "Manager" || role === "Admin";
  },

  // Residents - Only Manager and Admin
  canManageResidents: (role: UserRole): boolean => {
    return role === "Manager" || role === "Admin";
  },

  // Apartments - Accountant, Manager, and Admin
  canViewApartments: (role: UserRole): boolean => {
    return role === "Accountant" || role === "Manager" || role === "Admin";
  },

  // Bills - Only Resident and Admin
  canViewMyBills: (role: UserRole): boolean => {
    // return role === "Resident" || role === "Admin";
    return role == "Resident";
  },

  // Payments - Only Resident and Admin
  canViewMyPayments: (role: UserRole): boolean => {
    // return role === "Resident" || role === "Admin";
    return role == "Resident";
  },

  canCreateQRPayment: (role: UserRole): boolean => {
    return role === "Resident" || role === "Admin";
  },

  // Offline Payments - Only Accountant and Admin
  canManageOfflinePayments: (role: UserRole): boolean => {
    return role === "Accountant" || role === "Admin";
  },

  // Receipts - Only Accountant and Admin
  canViewReceipts: (role: UserRole): boolean => {
    return role === "Accountant" || role === "Admin";
  },

  canManageAccounting: (role: UserRole): boolean => {
    return role === "Accountant" || role === "Admin";
  },

  canViewNotifications: (role: UserRole): boolean => {
    return role === "Resident" || role === "Admin";
  },
};
