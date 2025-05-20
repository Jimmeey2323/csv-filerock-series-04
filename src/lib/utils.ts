
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely formats a number with the specified number of decimal places.
 * Returns a fallback value if the input is not a valid number.
 */
export function safeToFixed(value: any, decimals: number = 2, fallback: string = 'N/A'): string {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return fallback;
  }
  return Number(value).toFixed(decimals);
}

/**
 * Safely formats a number with locale string formatting.
 * Returns a fallback value if the input is not a valid number.
 */
export function safeToLocaleString(value: any, fallback: string = 'N/A'): string {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return fallback;
  }
  return Number(value).toLocaleString();
}

/**
 * Safely formats a number as currency without decimals
 * Returns a fallback value if the input is not a valid number.
 */
export function safeFormatCurrency(value: any, currency: string = '₹', fallback: string = 'N/A'): string {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return fallback;
  }
  
  // Format the number with comma separators but without decimals
  const formattedValue = Number(value).toLocaleString(undefined, { 
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  });
  
  return `${currency}${formattedValue}`;
}

/**
 * Converts a camelCase string to Title Case
 */
export function convertCamelToTitle(camelCase: string): string {
  if (!camelCase) return '';
  
  // Add space before uppercase letters and capitalize the first letter
  const withSpaces = camelCase.replace(/([A-Z])/g, ' $1');
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

/**
 * Format a date to a readable format
 */
export function formatDate(dateString: string, fallback: string = 'N/A'): string {
  if (!dateString) return fallback;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return fallback;
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return fallback;
  }
}

/**
 * Safely parses a client record to extract first visit date
 */
export function getFirstVisitDate(record: any, fallback: string = 'N/A'): string {
  if (!record) return fallback;
  
  const possibleKeys = [
    'First visit at', 'First visit date', 'First visit', 
    'firstVisit', 'date', 'Date', 'visitDate'
  ];
  
  for (const key of possibleKeys) {
    if (record[key]) return record[key];
  }
  
  return fallback;
}

/**
 * Safely parses a client record to extract first purchase date
 */
export function getFirstPurchaseDate(record: any, fallback: string = 'N/A'): string {
  if (!record) return fallback;
  
  const possibleKeys = [
    'First purchase date', 'Purchase date', 'firstPurchaseDate',
    'purchaseDate', 'saleDate', 'transaction_date', 'payment_date'
  ];
  
  for (const key of possibleKeys) {
    if (record[key]) return record[key];
  }
  
  return fallback;
}
