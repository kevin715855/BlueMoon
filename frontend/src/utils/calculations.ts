/**
 * Utility functions for calculations
 */

import type { Apartment, Resident } from '../services/api';

/**
 * Calculate occupancy statistics from apartments and residents
 */
export function calculateOccupancy(apartments: Apartment[], residents: Resident[]) {
  const totalApartments = apartments.length;
  const occupiedApartments = residents.filter(r => r.isOwner).length;
  const vacantApartments = totalApartments - occupiedApartments;
  const occupancyRate = totalApartments > 0 ? (occupiedApartments / totalApartments) * 100 : 0;

  return {
    totalApartments,
    occupiedApartments,
    vacantApartments,
    occupancyRate,
  };
}

/**
 * Check if an apartment is occupied by finding a matching resident
 */
export function isApartmentOccupied(apartmentID: string, residents: Resident[]): boolean {
  return residents.some(r => r.apartmentID === apartmentID);
}

/**
 * Find resident for a given apartment
 */
export function findResidentForApartment(apartmentID: string, residents: Resident[]): Resident | undefined {
  return residents.find(r => r.apartmentID === apartmentID);
}

/**
 * Get occupancy status label
 */
export function getOccupancyStatus(apartmentID: string, residents: Resident[]): 'occupied' | 'vacant' {
  return isApartmentOccupied(apartmentID, residents) ? 'occupied' : 'vacant';
}
