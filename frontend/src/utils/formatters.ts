/**
 * Utility functions for formatting data
 */

/**
 * Format a date string to locale date string
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

/**
 * Format area with unit
 */
export function formatArea(area?: number): string {
  if (!area) return 'N/A';
  return `${area}m²`;
}

/**
 * Format phone number (basic)
 */
export function formatPhoneNumber(phone?: string): string {
  if (!phone) return 'N/A';
  return phone;
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
