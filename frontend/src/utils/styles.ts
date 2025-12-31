/**
 * Utility functions for styling and CSS classes
 */

/**
 * Get badge color classes based on status
 */
export function getStatusBadgeClass(status: 'occupied' | 'vacant'): string {
  return status === 'occupied'
    ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 text-gray-800';
}

/**
 * Get badge color for owner/resident type
 */
export function getResidentTypeBadgeClass(isOwner: boolean): string {
  return isOwner
    ? 'bg-green-100 text-green-800'
    : 'bg-blue-100 text-blue-800';
}

/**
 * Get resident type label
 */
export function getResidentTypeLabel(isOwner: boolean): string {
  return isOwner ? 'Owner' : 'Resident';
}

/**
 * Combine class names
 */
export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
