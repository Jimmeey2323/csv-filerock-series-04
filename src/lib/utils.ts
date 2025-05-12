
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a camelCase string to Title Case with spaces
 */
export function convertCamelToTitle(camelCaseString: string): string {
  // Add space before uppercase letters and capitalize the first letter
  const withSpaces = camelCaseString.replace(/([A-Z])/g, ' $1');
  // Capitalize first letter and trim any extra spaces
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).trim();
}
