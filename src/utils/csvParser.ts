
import Papa from 'papaparse';

interface ParseOptions {
  header: boolean;
  skipEmptyLines: boolean;
  transformHeader?: (header: string) => string;
}

export const parseCSV = (
  file: File,
  options: ParseOptions = { header: true, skipEmptyLines: true }
): Promise<{data: any[]; meta: Papa.ParseMeta}> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      ...options,
      complete: (results) => {
        resolve({
          data: results.data,
          meta: results.meta,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const categorizeFiles = (files: File[]) => {
  const categorized = {
    new: undefined as File | undefined,
    bookings: undefined as File | undefined,
    payments: undefined as File | undefined,
    unknown: [] as File[],
  };

  const filePatterns = {
    new: 'new',
    bookings: 'bookings',
    payments: 'payments?',
  };

  files.forEach(file => {
    const fileName = file.name.toLowerCase();
    
    if (new RegExp(filePatterns.new, 'i').test(fileName)) {
      categorized.new = file;
    } else if (new RegExp(filePatterns.bookings, 'i').test(fileName)) {
      categorized.bookings = file;
    } else if (new RegExp(filePatterns.payments, 'i').test(fileName)) {
      categorized.payments = file;
    } else {
      categorized.unknown.push(file);
    }
  });

  return categorized;
};

export const formatDateString = (dateStr: string): string => {
  // Handle date formats like "2025-03-01, 10:15 AM"
  try {
    // Remove commas and any time component
    const cleanedDateStr = dateStr.split(',')[0].trim();
    
    // Parse the date
    const date = new Date(cleanedDateStr);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    
    // Return formatted date YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (e) {
    console.error("Error formatting date:", dateStr, e);
    return dateStr;
  }
};

export const cleanFirstVisitValue = (visitValue: string): string => {
  // Remove "Class - " prefix if present
  if (visitValue && typeof visitValue === 'string') {
    const cleanedValue = visitValue.replace(/^Class\s*-\s*/i, '').trim();
    console.log(`Cleaned first visit value from "${visitValue}" to "${cleanedValue}"`);
    return cleanedValue;
  }
  return visitValue || '';
};

export const getMonthYearFromDate = (dateStr: string): string => {
  try {
    const date = new Date(formatDateString(dateStr));
    if (isNaN(date.getTime())) return 'Unknown';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit'
    });
  } catch (e) {
    return 'Unknown';
  }
};

export const getFileTypes = () => {
  return {
    new: 'new',
    bookings: 'bookings',
    payments: 'payments?',
  };
};

// Helper function to check if a string matches any pattern in an array of patterns
export const matchesPattern = (value: string, patterns: string | string[]): boolean => {
  if (!value) return false;
  
  const patternsArray = typeof patterns === 'string' ? [patterns] : patterns;
  const regex = new RegExp(patternsArray.join('|'), 'i');
  
  return regex.test(value);
};

// Helper function to format numbers with commas for thousands
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

// Get search history from local storage
export const getSearchHistory = (): string[] => {
  try {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
  } catch (e) {
    console.error("Error retrieving search history:", e);
    return [];
  }
};

// Add search term to history
export const addToSearchHistory = (term: string): void => {
  if (!term.trim()) return;
  
  try {
    const history = getSearchHistory();
    // Add to beginning, remove duplicates
    const newHistory = [term, ...history.filter(item => item !== term)].slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  } catch (e) {
    console.error("Error saving search history:", e);
  }
};
