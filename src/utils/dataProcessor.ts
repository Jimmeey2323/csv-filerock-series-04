
import { toast } from 'sonner';
import { deduplicateClientsByEmail } from './deduplication';

export interface ProcessingProgress {
  progress: number;
  currentStep: string;
}

// Define types and interfaces to better organize the data
export interface ProcessedTeacherData {
  teacherName: string;
  location: string;
  period: string;
  newClients: number;
  convertedClients: number;
  retainedClients: number;
  conversionRate: number;
  retentionRate: number;
  totalRevenue: number;
  averageRevenuePerClient: number;
  noShowRate: number;
  lateCancellationRate: number;
  
  // Client source breakdown
  trials?: number;
  referrals?: number;
  hosted?: number;
  influencerSignups?: number;
  others?: number;
  
  // Revenue time series
  revenueByWeek?: { week: string, revenue: number }[];
  
  // Client details arrays
  newClientDetails?: any[];
  convertedClientDetails?: any[];
  retainedClientDetails?: any[];
  excludedClientDetails?: any[];
}

// Process the CSV data
export const processData = async (
  newClientData: any[],
  bookingsData: any[],
  paymentsData: any[],
  updateProgress: (progress: ProcessingProgress) => void
): Promise<{
  processedData: ProcessedTeacherData[];
  locations: string[];
  teachers: string[];
  periods: string[];
  includedRecords: any[];
  excludedRecords: any[];
  newClientRecords: any[];
  convertedClientRecords: any[];
  retainedClientRecords: any[];
}> => {
  
  // Update progress
  updateProgress({
    progress: 20,
    currentStep: 'Filtering and cleaning data...'
  });
  
  // Clean and standardize the data
  const cleanedNewClientData = cleanNewClientData(newClientData);
  const cleanedBookingsData = cleanBookingsData(bookingsData);
  const cleanedPaymentsData = paymentsData ? cleanPaymentsData(paymentsData) : [];
  
  updateProgress({
    progress: 30,
    currentStep: 'Identifying excluded records...'
  });
  
  // Filter out excluded data (staff, studio owners, influencers, etc.)
  const { includedRecords, excludedRecords } = filterExcludedData(cleanedNewClientData, cleanedBookingsData);
  
  updateProgress({
    progress: 40,
    currentStep: 'Deduplicating client records...'
  });
  
  // Deduplicate client data by email
  const uniqueClients = deduplicateClientsByEmail(includedRecords);
  
  updateProgress({
    progress: 50,
    currentStep: 'Identifying teacher performance metrics...'
  });
  
  // Get all teachers and locations
  const teachers = Array.from(
    new Set(uniqueClients.map(client => client.teacherName).filter(Boolean))
  ).sort();
  
  const locations = Array.from(
    new Set(uniqueClients.map(client => client.location).filter(Boolean))
  ).sort();
  
  // Determine time periods based on data
  const dates = uniqueClients
    .map(client => new Date(client.date))
    .filter(date => !isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
  
  const startDate = dates.length > 0 ? dates[0] : new Date();
  const endDate = dates.length > 0 ? dates[dates.length - 1] : new Date();
  
  const periods = [`${formatDate(startDate)} - ${formatDate(endDate)}`];
  
  updateProgress({
    progress: 60,
    currentStep: 'Identifying client journeys...'
  });
  
  // Identify different client types (new, retained, converted)
  const { newClientRecords, convertedClientRecords, retainedClientRecords } = 
    identifyClientJourneys(uniqueClients, cleanedBookingsData, cleanedPaymentsData);
  
  updateProgress({
    progress: 70,
    currentStep: 'Calculating teacher performance metrics...'
  });
  
  // Generate performance metrics for each teacher
  const processedData = generateTeacherMetrics(
    teachers,
    locations,
    periods,
    uniqueClients,
    newClientRecords,
    convertedClientRecords,
    retainedClientRecords,
    excludedRecords,
    cleanedPaymentsData
  );
  
  updateProgress({
    progress: 90,
    currentStep: 'Finalizing results...'
  });
  
  return {
    processedData,
    locations,
    teachers,
    periods,
    includedRecords,
    excludedRecords,
    newClientRecords,
    convertedClientRecords,
    retainedClientRecords
  };
};

// Helper function to format a date
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Clean and process new client data
const cleanNewClientData = (data: any[]): any[] => {
  return data
    .filter(item => item && item.name)
    .map(item => ({
      ...item,
      teacherName: item.teacherName || item.teacher || item.instructor || 'Unknown',
      location: item.location || item.studio || item.venue || 'Unknown',
      date: item.date || item.visitDate || item.dateOfVisit || new Date().toISOString().split('T')[0],
      email: (item.email || item.emailAddress || '').toLowerCase(),
      // Standardize class fields
      className: item.className || item.class || item.activityName || '',
      membershipType: item.membershipType || item.membership || item.packageName || ''
    }));
};

// Clean and process bookings data
const cleanBookingsData = (data: any[]): any[] => {
  return data
    .filter(item => item && item.customerName)
    .map(item => ({
      ...item,
      teacherName: item.teacherName || item.teacher || item.instructor || 'Unknown',
      location: item.location || item.studio || item.venue || 'Unknown',
      date: item.date || item.bookingDate || item.appointmentDate || new Date().toISOString().split('T')[0],
      email: (item.email || item.customerEmail || '').toLowerCase(),
      // Standardize class and status fields
      className: item.className || item.class || item.activityName || '',
      status: item.status || item.bookingStatus || '',
      membershipType: item.membershipType || item.membership || item.packageName || ''
    }));
};

// Clean and process payments data
const cleanPaymentsData = (data: any[]): any[] => {
  return data
    .filter(item => item && item.customerName)
    .map(item => ({
      ...item,
      teacherName: item.teacherName || item.teacher || item.instructor || 'Unknown',
      location: item.location || item.studio || item.venue || 'Unknown',
      date: item.date || item.paymentDate || item.purchaseDate || new Date().toISOString().split('T')[0],
      email: (item.email || item.customerEmail || '').toLowerCase(),
      // Standardize payment fields
      value: parseFloat(item.value || item.amount || item.price || 0),
      membershipType: item.membershipType || item.membership || item.packageName || item.product || '',
      purchaseItem: item.purchaseItem || item.product || item.itemName || ''
    }));
};

// Filter excluded data (staff, family, etc.)
const filterExcludedData = (newClientData: any[], bookingsData: any[]): { includedRecords: any[], excludedRecords: any[] } => {
  const excludedRecords: any[] = [];
  const includedRecords: any[] = [];
  
  // Regular expression to detect words/patterns that indicate a record should be excluded
  const excludePattern = /staff|employee|team|admin|owner|family|friend|influencer|comp|test|sample/i;
  
  // Process client data for exclusion
  newClientData.forEach(client => {
    // Check both membership and class name for exclusion keywords
    const shouldExclude = (
      (client.membershipType && excludePattern.test(client.membershipType)) ||
      (client.className && excludePattern.test(client.className))
    );
    
    if (shouldExclude) {
      const reason = client.membershipType && excludePattern.test(client.membershipType) 
        ? `Excluded membership: ${client.membershipType}` 
        : `Excluded class: ${client.className}`;
        
      excludedRecords.push({
        ...client,
        exclusionReason: reason
      });
    } else {
      includedRecords.push(client);
    }
  });
  
  return { includedRecords, excludedRecords };
};

// Identify different client journeys (new, retained, converted)
const identifyClientJourneys = (
  uniqueClients: any[],
  bookingsData: any[],
  paymentsData: any[]
): {
  newClientRecords: any[];
  convertedClientRecords: any[];
  retainedClientRecords: any[];
} => {
  const newClientRecords: any[] = [...uniqueClients];
  const convertedClientRecords: any[] = [];
  const retainedClientRecords: any[] = [];
  
  // For each client, check if they've been retained or converted
  uniqueClients.forEach(client => {
    const { email, date: firstVisit, teacherName } = client;
    
    // Find all subsequent bookings for this client
    const subsequentBookings = bookingsData.filter(booking => 
      booking.email?.toLowerCase() === email?.toLowerCase() && 
      new Date(booking.date) > new Date(firstVisit)
    );
    
    // Client is retained if they have subsequent bookings
    if (subsequentBookings.length > 0) {
      // Get first visit post trial
      const firstVisitPostTrial = subsequentBookings.length > 0 
        ? subsequentBookings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
        : null;
      
      retainedClientRecords.push({
        ...client,
        visitCount: subsequentBookings.length,
        firstVisitPostTrial: firstVisitPostTrial ? firstVisitPostTrial.date : null,
        membershipUsed: firstVisitPostTrial ? firstVisitPostTrial.membershipType : null
      });
    }
    
    // Find payments made by this client
    const payments = paymentsData.filter(payment => 
      payment.email?.toLowerCase() === email?.toLowerCase() && 
      new Date(payment.date) >= new Date(firstVisit)
    );
    
    // Client is converted if they've made payments
    if (payments.length > 0) {
      // Get first purchase
      const firstPurchase = payments.length > 0 
        ? payments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
        : null;
      
      convertedClientRecords.push({
        ...client,
        firstPurchaseDate: firstPurchase ? firstPurchase.date : null,
        firstPurchaseItem: firstPurchase ? firstPurchase.purchaseItem || firstPurchase.membershipType : null,
        purchaseValue: firstPurchase ? firstPurchase.value : 0
      });
    }
  });
  
  return { newClientRecords, convertedClientRecords, retainedClientRecords };
};

// Generate performance metrics for each teacher
const generateTeacherMetrics = (
  teachers: string[],
  locations: string[],
  periods: string[],
  uniqueClients: any[],
  newClientRecords: any[],
  convertedClientRecords: any[],
  retainedClientRecords: any[],
  excludedRecords: any[],
  paymentsData: any[]
): ProcessedTeacherData[] => {
  // Process each teacher
  const teacherMetrics: ProcessedTeacherData[] = [];
  
  teachers.forEach(teacher => {
    locations.forEach(location => {
      periods.forEach(period => {
        // Filter clients for this teacher, location, and period
        const teacherClients = uniqueClients.filter(client => 
          client.teacherName === teacher && 
          client.location === location
        );
        
        // Skip if no clients for this combination
        if (teacherClients.length === 0) return;
        
        // Get new, retained, and converted clients
        const newClients = newClientRecords.filter(client => 
          client.teacherName === teacher && 
          client.location === location
        );
        
        const retainedClients = retainedClientRecords.filter(client => 
          client.teacherName === teacher && 
          client.location === location
        );
        
        const convertedClients = convertedClientRecords.filter(client => 
          client.teacherName === teacher && 
          client.location === location
        );
        
        // Filter excluded clients for this teacher
        const excludedClients = excludedRecords.filter(client => 
          client.teacherName === teacher && 
          client.location === location
        );
        
        // Calculate metrics
        const newClientCount = newClients.length;
        const retainedClientCount = retainedClients.length;
        const convertedClientCount = convertedClients.length;
        
        // Calculate conversion and retention rates
        const conversionRate = newClientCount > 0 ? (convertedClientCount / newClientCount) * 100 : 0;
        const retentionRate = newClientCount > 0 ? (retainedClientCount / newClientCount) * 100 : 0;
        
        // Calculate revenue metrics
        const teacherPayments = paymentsData.filter(payment => 
          payment.teacherName === teacher && 
          payment.location === location
        );
        
        const totalRevenue = teacherPayments.reduce((sum, payment) => sum + (payment.value || 0), 0);
        const averageRevenuePerClient = convertedClientCount > 0 ? totalRevenue / convertedClientCount : 0;
        
        // Calculate attendance metrics (mocked for now)
        const noShowRate = Math.random() * 15; // Mock data between 0-15%
        const lateCancellationRate = Math.random() * 10; // Mock data between 0-10%
        
        // Calculate client source breakdown (mocked proportionally to client count)
        const trials = Math.floor(newClientCount * 0.6); // 60% are trials
        const referrals = Math.floor(newClientCount * 0.15); // 15% are referrals
        const hosted = Math.floor(newClientCount * 0.1); // 10% are hosted events
        const influencerSignups = Math.floor(newClientCount * 0.05); // 5% are from influencers
        const others = newClientCount - trials - referrals - hosted - influencerSignups; // Remainder
        
        // Generate weekly revenue data (mocked based on total revenue)
        const revenueByWeek = generateWeeklyRevenue(period, totalRevenue);
        
        // Add to teacher metrics
        teacherMetrics.push({
          teacherName: teacher,
          location,
          period,
          newClients: newClientCount,
          convertedClients: convertedClientCount,
          retainedClients: retainedClientCount,
          conversionRate,
          retentionRate,
          totalRevenue,
          averageRevenuePerClient,
          noShowRate,
          lateCancellationRate,
          
          // Add client source breakdown
          trials,
          referrals,
          hosted,
          influencerSignups,
          others,
          
          // Revenue time series
          revenueByWeek,
          
          // Client details
          newClientDetails: newClients,
          convertedClientDetails: convertedClients,
          retainedClientDetails: retainedClients,
          excludedClientDetails: excludedClients
        });
      });
    });
  });
  
  return teacherMetrics;
};

// Generate weekly revenue data
const generateWeeklyRevenue = (
  period: string, 
  totalRevenue: number
): { week: string, revenue: number }[] => {
  // Extract start and end dates from period string
  const [startDateStr, endDateStr] = period.split(' - ');
  
  // Parse dates
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  
  // If invalid dates, return empty array
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return [];
  }
  
  const weeks: { week: string, revenue: number }[] = [];
  let currentDate = new Date(startDate);
  
  // Create weekly data points
  while (currentDate <= endDate) {
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // Ensure week end date doesn't exceed period end date
    const actualEnd = weekEnd <= endDate ? weekEnd : endDate;
    
    // For simplicity, divide total revenue by number of weeks (with some randomness)
    const randomFactor = 0.5 + Math.random();
    const weekRevenue = Math.floor((totalRevenue / 4) * randomFactor);
    
    weeks.push({
      week: formatDate(currentDate),
      revenue: weekRevenue
    });
    
    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return weeks;
};
