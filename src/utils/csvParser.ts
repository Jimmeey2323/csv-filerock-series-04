
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
