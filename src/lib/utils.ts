
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
    if (record[key] && record[key] !== 'undefined' && record[key] !== 'null') {
      return formatDate(record[key], fallback);
    }
  }
  
  return fallback;
}

/**
 * Safely parses a client record to extract first purchase date
 * Filters out product categories and '2 For 1' items
 * Ensures purchase date is after first visit date
 */
export function getFirstPurchaseDate(record: any, fallback: string = 'N/A'): string {
  if (!record) return fallback;
  
  // If we have a direct value in the record
  const possibleDirectKeys = [
    'First purchase date', 'Purchase date', 'firstPurchaseDate',
    'purchaseDate', 'saleDate', 'transaction_date', 'payment_date'
  ];
  
  for (const key of possibleDirectKeys) {
    if (record[key] && record[key] !== 'undefined' && record[key] !== 'null') {
      return formatDate(record[key], fallback);
    }
  }
  
  // If we have salesData array, find earliest valid purchase
  if (record.salesData && Array.isArray(record.salesData) && record.salesData.length > 0) {
    // Get first visit date for comparison
    const firstVisitDate = new Date(getFirstVisitRawDate(record));
    if (isNaN(firstVisitDate.getTime())) return fallback;
    
    // Filter and sort sales entries to find earliest valid purchase
    const validSales = record.salesData
      .filter(sale => {
        // Skip entries with invalid dates
        if (!sale.date) return false;
        
        const saleDate = new Date(sale.date);
        if (isNaN(saleDate.getTime())) return false;
        
        // Ensure sale date is after first visit
        if (saleDate < firstVisitDate) return false;
        
        // Skip products category
        if (sale.category && sale.category.toLowerCase() === 'product') return false;
        
        // Skip items containing "2 For 1"
        if (sale.item && sale.item.includes('2 For 1')) return false;
        
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (validSales.length > 0) {
      return formatDate(validSales[0].date, fallback);
    }
  }
  
  return fallback;
}

/**
 * Get raw first visit date without formatting (for comparison)
 */
export function getFirstVisitRawDate(record: any): string | null {
  if (!record) return null;
  
  const possibleKeys = [
    'First visit at', 'First visit date', 'First visit', 
    'firstVisit', 'date', 'Date', 'visitDate'
  ];
  
  for (const key of possibleKeys) {
    if (record[key] && record[key] !== 'undefined' && record[key] !== 'null') {
      return record[key];
    }
  }
  
  return null;
}

/**
 * Get the first purchase item
 */
export function getFirstPurchaseItem(record: any, fallback: string = 'N/A'): string {
  if (!record) return fallback;
  
  // Direct keys
  const possibleKeys = [
    'firstPurchaseItem', 'purchaseItem', 'item', 'membership', 
    'membershipType', 'package', 'plan'
  ];
  
  for (const key of possibleKeys) {
    if (record[key] && record[key] !== 'undefined' && record[key] !== 'null') {
      return record[key];
    }
  }
  
  // If we have salesData array
  if (record.salesData && Array.isArray(record.salesData) && record.salesData.length > 0) {
    // Get first visit date for comparison
    const firstVisitDate = new Date(getFirstVisitRawDate(record));
    if (isNaN(firstVisitDate.getTime())) return fallback;
    
    // Filter and sort sales entries to find earliest valid purchase
    const validSales = record.salesData
      .filter(sale => {
        // Skip entries with invalid dates
        if (!sale.date) return false;
        
        const saleDate = new Date(sale.date);
        if (isNaN(saleDate.getTime())) return false;
        
        // Ensure sale date is after first visit
        if (saleDate < firstVisitDate) return false;
        
        // Skip products category
        if (sale.category && sale.category.toLowerCase() === 'product') return false;
        
        // Skip items containing "2 For 1"
        if (sale.item && sale.item.includes('2 For 1')) return false;
        
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (validSales.length > 0 && validSales[0].item) {
      return validSales[0].item;
    }
  }
  
  return fallback;
}

/**
 * Get purchase value
 */
export function getPurchaseValue(record: any, fallback: string = 'N/A'): string {
  if (!record) return fallback;
  
  // Direct keys
  const possibleKeys = [
    'purchaseValue', 'value', 'amount', 'price', 
    'revenue', 'saleAmount', 'transactionAmount'
  ];
  
  for (const key of possibleKeys) {
    if (record[key] && record[key] !== 'undefined' && record[key] !== 'null') {
      return safeFormatCurrency(record[key]);
    }
  }
  
  // If we have salesData array
  if (record.salesData && Array.isArray(record.salesData) && record.salesData.length > 0) {
    // Get first visit date for comparison
    const firstVisitDate = new Date(getFirstVisitRawDate(record));
    if (isNaN(firstVisitDate.getTime())) return fallback;
    
    // Filter and sort sales entries to find earliest valid purchase
    const validSales = record.salesData
      .filter(sale => {
        // Skip entries with invalid dates
        if (!sale.date) return false;
        
        const saleDate = new Date(sale.date);
        if (isNaN(saleDate.getTime())) return false;
        
        // Ensure sale date is after first visit
        if (saleDate < firstVisitDate) return false;
        
        // Skip products category
        if (sale.category && sale.category.toLowerCase() === 'product') return false;
        
        // Skip items containing "2 For 1"
        if (sale.item && sale.item.includes('2 For 1')) return false;
        
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (validSales.length > 0 && validSales[0].value) {
      return safeFormatCurrency(validSales[0].value);
    }
  }
  
  return fallback;
}

/**
 * Get first visit post trial date
 */
export function getFirstVisitPostTrial(record: any, fallback: string = 'N/A'): string {
  if (!record) return fallback;
  
  // Direct keys for first visit post trial
  const possibleKeys = [
    'firstVisitPostTrial', 'visitPostTrial', 'postTrialVisit',
    'followUpVisit', 'secondVisit'
  ];
  
  for (const key of possibleKeys) {
    if (record[key] && record[key] !== 'undefined' && record[key] !== 'null') {
      return formatDate(record[key], fallback);
    }
  }
  
  // If we have visitsData array
  if (record.visitsData && Array.isArray(record.visitsData) && record.visitsData.length > 1) {
    // Sort visits by date
    const sortedVisits = [...record.visitsData]
      .filter(visit => visit.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // If there are at least 2 visits, return the second one
    if (sortedVisits.length > 1) {
      return formatDate(sortedVisits[1].date, fallback);
    }
  }
  
  return fallback;
}

/**
 * Get membership used
 */
export function getMembershipUsed(record: any, fallback: string = 'N/A'): string {
  if (!record) return fallback;
  
  const possibleKeys = [
    'membershipUsed', 'membership', 'membershipType', 
    'plan', 'package', 'activePackage'
  ];
  
  for (const key of possibleKeys) {
    if (record[key] && record[key] !== 'undefined' && record[key] !== 'null') {
      return record[key];
    }
  }
  
  return fallback;
}

/**
 * Get total visits post trial
 */
export function getTotalVisitsPostTrial(record: any, fallback: string = 'N/A'): string {
  if (!record) return fallback;
  
  const possibleKeys = [
    'visitsPostTrial', 'totalVisitsPostTrial', 'visitCount',
    'totalVisits', 'visits'
  ];
  
  for (const key of possibleKeys) {
    if (record[key] && record[key] !== 'undefined' && record[key] !== 'null') {
      return String(record[key]);
    }
  }
  
  // If we have visitsData array, count visits after first one
  if (record.visitsData && Array.isArray(record.visitsData)) {
    // We subtract 1 because we don't count the trial visit
    return String(Math.max(0, record.visitsData.length - 1));
  }
  
  return fallback;
}
