
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
  return `${currency}${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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
 * Returns a cursor class based on whether an element has click handler
 */
export function getCursorClass(hasClickHandler: boolean | undefined): string {
  return hasClickHandler ? 'cursor-pointer' : '';
}
