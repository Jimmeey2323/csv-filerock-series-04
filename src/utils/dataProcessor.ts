
import { formatDateString, getMonthYearFromDate, cleanFirstVisitValue } from './csvParser';

// Define types for our data structures
interface NewRecord {
  'First name': string;
  'Last name': string;
  'Email': string;
  'Phone number': string;
  'Payment method': string;
  'Membership used': string;
  'First visit at': string;
  'First visit': string;
  'First visit location': string;
  'Visit type': string;
  'Home location': string;
  'Teacher'?: string; // This will be added during processing
}

interface BookingRecord {
  'Sale Date': string;
  'Class Name': string;
  'Class Date': string;
  'Location': string;
  'Teacher': string;
  'Customer Email': string;
  'Payment Method': string;
  'Membership used': string;
  'Sale Value': string | number;
  'Sales tax': string | number;
  'Cancelled': string;
  'Late Cancelled': string;
  'No Show': string;
  'Sold by': string;
  'Refunded': string;
  'Home location': string;
}

interface SaleRecord {
  'Sale Date': string;
  'Class Name': string;
  'Class Date': string;
  'Location': string;
  'Teacher': string;
  'Customer Email': string;
  'Payment Method': string;
  'Membership used': string;
  'Sale Value': string | number;
  'Sales tax': string | number;
  'Cancelled': string;
  'Late Cancelled': string;
  'No Show': string;
  'Sold by': string;
  'Refunded': string;
  'Home location': string;
}

interface ClientDetail {
  email: string;
  name: string;
  date: string;
  value?: number;
}

export interface ProcessedTeacherData {
  teacherName: string;
  location: string;
  period: string;
  newClients: number;
  trials: number;
  referrals: number;
  hosted: number;
  influencerSignups: number;
  others: number;
  retainedClients: number;
  retentionRate: number;
  convertedClients: number;
  conversionRate: number;
  totalRevenue: number;
  averageRevenuePerClient: number;
  noShowRate: number;
  lateCancellationRate: number;
  firstTimeBuyerRate: number;
  influencerConversionRate: number;
  referralConversionRate: number;
  trialToMembershipConversion: number;
  // Added for detailed analysis
  newClientDetails: ClientDetail[];
  retainedClientDetails: ClientDetail[];
  convertedClientDetails: ClientDetail[];
  revenueByWeek?: { week: string; revenue: number }[];
  clientsBySource?: { source: string; count: number }[];
}

// For progress tracking
export interface ProcessingProgress {
  progress: number;
  currentStep: string;
}

// Process all the data
export const processData = (
  newData: NewRecord[],
  bookingsData: BookingRecord[],
  salesData: SaleRecord[],
  updateProgress: (progress: ProcessingProgress) => void
): Promise<{
  processedData: ProcessedTeacherData[];
  locations: string[];
  teachers: string[];
  periods: string[];
}> => {
  return new Promise((resolve) => {
    updateProgress({ progress: 5, currentStep: "Cleaning and validating data..." });
    
    // Step 1: Clean and normalize data
    setTimeout(() => {
      // Format dates consistently
      const cleanedNewData = newData.map(record => ({
        ...record,
        'First visit at': formatDateString(record['First visit at'] || ''),
        'First visit': cleanFirstVisitValue(record['First visit'] || ''),
      }));
      
      const cleanedBookingsData = bookingsData.map(record => ({
        ...record,
        'Class Date': formatDateString(record['Class Date'] || ''),
        'Sale Value': typeof record['Sale Value'] === 'string' 
          ? parseFloat(record['Sale Value']) || 0 
          : record['Sale Value'] || 0,
        'Class Name': cleanFirstVisitValue(record['Class Name'] || ''),
      }));
      
      const cleanedSalesData = salesData ? salesData.map(record => ({
        ...record,
        'Sale Date': formatDateString(record['Sale Date'] || ''),
        'Sale Value': typeof record['Sale Value'] === 'string' 
          ? parseFloat(record['Sale Value']) || 0 
          : record['Sale Value'] || 0,
        'Class Name': cleanFirstVisitValue(record['Class Name'] || ''),
      })) : [];
      
      updateProgress({ progress: 20, currentStep: "Matching records and extracting teacher data..." });
      
      // Step 2: Match New records with Bookings to get teacher names
      setTimeout(() => {
        const enrichedNewData = cleanedNewData.map(newRecord => {
          const matchingBooking = cleanedBookingsData.find(booking => 
            booking['Class Date'] === newRecord['First visit at'] &&
            booking['Class Name'] === newRecord['First visit'] &&
            booking['Location'] === newRecord['First visit location'] &&
            booking['Customer Email'] === newRecord['Email']
          );
          
          return {
            ...newRecord,
            'Teacher': matchingBooking ? matchingBooking['Teacher'] : 'Unknown'
          };
        });
        
        updateProgress({ progress: 40, currentStep: "Calculating metrics by location, teacher, and period..." });
        
        // Step 3: Process data by location, teacher, and period
        setTimeout(() => {
          // Get unique locations, teachers, and periods (months)
          const locations = [...new Set(enrichedNewData.map(record => record['First visit location']))];
          
          // Extract all teacher names from bookings
          const teachers = [...new Set(cleanedBookingsData
            .map(record => record['Teacher'])
            .filter(teacher => teacher && teacher !== 'Unknown'))];
          
          // Get all unique periods (month-year)
          const allPeriods = enrichedNewData.map(record => 
            getMonthYearFromDate(record['First visit at'])
          );
          const periods = [...new Set(allPeriods)];
          
          updateProgress({ progress: 60, currentStep: "Calculating client acquisition metrics..." });
          
          // Step 4: Calculate metrics for each teacher, location, and period
          setTimeout(() => {
            const processedData: ProcessedTeacherData[] = [];
            
            // Group data by teacher, location, and period
            teachers.forEach(teacher => {
              locations.forEach(location => {
                periods.forEach(period => {
                  // Get new clients for this teacher, location, and period
                  const teacherNewClients = enrichedNewData.filter(record => 
                    record['Teacher'] === teacher &&
                    record['First visit location'] === location &&
                    getMonthYearFromDate(record['First visit at']) === period &&
                    !/(friends|family|staff)/i.test(record['Membership used'] || '')
                  );
                  
                  if (teacherNewClients.length === 0) return; // Skip if no data
                  
                  // Calculate client acquisition metrics
                  const newClientsCount = teacherNewClients.length;
                  
                  const trials = teacherNewClients.filter(record => 
                    /(Studio Open Barre Class|Newcomers 2 For 1)/i.test(record['Membership used'] || '')
                  ).length;
                  
                  const referrals = teacherNewClients.filter(record => 
                    record['Membership used'] === 'Studio Complimentary Referral Class'
                  ).length;
                  
                  const hosted = teacherNewClients.filter(record => 
                    /(hosted|x|p57|physique|weword|rugby|outdoor|birthday|bridal|shower)/i.test(record['First visit'] || '')
                  ).length;
                  
                  const influencerSignups = teacherNewClients.filter(record => 
                    /(sign-up|link|influencer|twain|ooo|lrs|x|p57|physique|complimentary)/i.test(record['Membership used'] || '')
                  ).length;
                  
                  const others = newClientsCount - (trials + referrals + hosted + influencerSignups);
                  
                  updateProgress({ progress: 80, currentStep: "Calculating retention and revenue metrics..." });
                  
                  // Get email addresses of these new clients
                  const newClientEmails = teacherNewClients.map(record => record['Email']);
                  
                  // Create detailed client lists for deeper analysis
                  const newClientDetails = teacherNewClients.map(client => ({
                    email: client['Email'],
                    name: `${client['First name']} ${client['Last name']}`,
                    date: client['First visit at'],
                    membershipType: client['Membership used']
                  }));
                  
                  // Find return visits in bookings data
                  const returnVisits = cleanedBookingsData.filter(booking => 
                    newClientEmails.includes(booking['Customer Email']) &&
                    booking['Teacher'] === teacher &&
                    booking['Cancelled'] === 'NO' &&
                    booking['Late Cancelled'] === 'NO' &&
                    booking['No Show'] === 'NO' &&
                    booking['Class Date'] > teacherNewClients[0]['First visit at']
                  );
                  
                  // Count unique emails with return visits
                  const returnClientEmails = [...new Set(returnVisits.map(visit => visit['Customer Email']))];
                  const retainedClientsCount = returnClientEmails.length;
                  
                  // Create detailed retained client list
                  const retainedClientDetails = returnClientEmails.map(email => {
                    const clientVisits = returnVisits.filter(visit => visit['Customer Email'] === email);
                    const clientInfo = teacherNewClients.find(client => client['Email'] === email);
                    return {
                      email,
                      name: clientInfo ? `${clientInfo['First name']} ${clientInfo['Last name']}` : 'Unknown',
                      date: clientVisits[0]['Class Date'],
                      visitCount: clientVisits.length
                    };
                  });
                  
                  // Calculate retention rate
                  const retentionRate = newClientsCount > 0 
                    ? (retainedClientsCount / newClientsCount) * 100 
                    : 0;
                  
                  // Find converted clients (purchased after first visit)
                  const convertedClients = cleanedSalesData.filter(sale => 
                    newClientEmails.includes(sale['Customer Email']) &&
                    sale['Teacher'] === teacher &&
                    sale['Sale Date'] > teacherNewClients[0]['First visit at'] &&
                    !/product/i.test(sale['Class Name'] || '') &&
                    !/2 for 1/i.test(sale['Membership used'] || '') &&
                    (typeof sale['Sale Value'] === 'number' ? sale['Sale Value'] : parseFloat(sale['Sale Value'] || '0')) > 0
                  );
                  
                  // Count unique converted clients
                  const convertedClientEmails = [...new Set(convertedClients.map(sale => sale['Customer Email']))];
                  const convertedClientsCount = convertedClientEmails.length;
                  
                  // Create detailed converted client list
                  const convertedClientDetails = convertedClientEmails.map(email => {
                    const clientSales = convertedClients.filter(sale => sale['Customer Email'] === email);
                    const totalValue = clientSales.reduce((sum, sale) => 
                      sum + (typeof sale['Sale Value'] === 'number' ? sale['Sale Value'] : parseFloat(sale['Sale Value'] || '0')), 0
                    );
                    const clientInfo = teacherNewClients.find(client => client['Email'] === email);
                    return {
                      email,
                      name: clientInfo ? `${clientInfo['First name']} ${clientInfo['Last name']}` : 'Unknown',
                      date: clientSales[0]['Sale Date'],
                      value: totalValue,
                      membershipType: clientSales[0]['Membership used']
                    };
                  });
                  
                  // Calculate conversion rate
                  const conversionRate = newClientsCount > 0 
                    ? (convertedClientsCount / newClientsCount) * 100 
                    : 0;
                  
                  // Calculate revenue metrics
                  const totalRevenue = convertedClients.reduce((sum, sale) => 
                    sum + (typeof sale['Sale Value'] === 'number' ? sale['Sale Value'] : parseFloat(sale['Sale Value'] || '0')), 0
                  );
                  
                  const averageRevenuePerClient = convertedClientsCount > 0 
                    ? totalRevenue / convertedClientsCount 
                    : 0;
                  
                  // Calculate booking metrics
                  const teacherBookings = cleanedBookingsData.filter(booking => 
                    booking['Teacher'] === teacher &&
                    booking['Location'] === location &&
                    getMonthYearFromDate(booking['Class Date']) === period
                  );
                  
                  const noShows = teacherBookings.filter(booking => booking['No Show'] === 'YES').length;
                  const noShowRate = teacherBookings.length > 0 
                    ? (noShows / teacherBookings.length) * 100 
                    : 0;
                  
                  const lateCancellations = teacherBookings.filter(booking => booking['Late Cancelled'] === 'YES').length;
                  const lateCancellationRate = teacherBookings.length > 0 
                    ? (lateCancellations / teacherBookings.length) * 100 
                    : 0;
                  
                  // Calculate advanced sales insights
                  const firstTimeBuyers = convertedClientsCount;
                  const firstTimeBuyerRate = newClientsCount > 0 
                    ? (firstTimeBuyers / newClientsCount) * 100 
                    : 0;
                  
                  // Influencer conversion
                  const influencerConvertedCount = convertedClients.filter(sale => 
                    teacherNewClients.some(client => 
                      client['Email'] === sale['Customer Email'] && 
                      /(sign-up|link|influencer|twain|ooo|lrs|x|p57|physique|complimentary)/i.test(client['Membership used'] || '')
                    )
                  ).length;
                  
                  const influencerConversionRate = influencerSignups > 0 
                    ? (influencerConvertedCount / influencerSignups) * 100 
                    : 0;
                  
                  // Referral conversion
                  const referralConvertedCount = convertedClients.filter(sale => 
                    teacherNewClients.some(client => 
                      client['Email'] === sale['Customer Email'] && 
                      client['Membership used'] === 'Studio Complimentary Referral Class'
                    )
                  ).length;
                  
                  const referralConversionRate = referrals > 0 
                    ? (referralConvertedCount / referrals) * 100 
                    : 0;
                  
                  // Trial to membership conversion
                  const trialConvertedCount = convertedClients.filter(sale => 
                    teacherNewClients.some(client => 
                      client['Email'] === sale['Customer Email'] && 
                      /(Studio Open Barre Class|Newcomers 2 For 1)/i.test(client['Membership used'] || '')
                    )
                  ).length;
                  
                  const trialToMembershipConversion = trials > 0 
                    ? (trialConvertedCount / trials) * 100 
                    : 0;
                  
                  // Create weekly revenue data for charts
                  const revenueByWeek = convertedClients.reduce((acc, sale) => {
                    const date = new Date(sale['Sale Date']);
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    const weekKey = weekStart.toISOString().split('T')[0];
                    
                    const existing = acc.find(item => item.week === weekKey);
                    const saleValue = typeof sale['Sale Value'] === 'number' 
                      ? sale['Sale Value'] 
                      : parseFloat(sale['Sale Value'] || '0');
                      
                    if (existing) {
                      existing.revenue += saleValue;
                    } else {
                      acc.push({ week: weekKey, revenue: saleValue });
                    }
                    
                    return acc;
                  }, [] as { week: string; revenue: number }[]);
                  
                  // Create client source data for charts
                  const clientsBySource = [
                    { source: 'Trials', count: trials },
                    { source: 'Referrals', count: referrals },
                    { source: 'Hosted', count: hosted },
                    { source: 'Influencer', count: influencerSignups },
                    { source: 'Others', count: others }
                  ];
                  
                  // Add to processed data
                  processedData.push({
                    teacherName: teacher,
                    location,
                    period,
                    newClients: newClientsCount,
                    trials,
                    referrals,
                    hosted,
                    influencerSignups,
                    others,
                    retainedClients: retainedClientsCount,
                    retentionRate,
                    convertedClients: convertedClientsCount,
                    conversionRate,
                    totalRevenue,
                    averageRevenuePerClient,
                    noShowRate,
                    lateCancellationRate,
                    firstTimeBuyerRate,
                    influencerConversionRate,
                    referralConversionRate,
                    trialToMembershipConversion,
                    newClientDetails,
                    retainedClientDetails,
                    convertedClientDetails,
                    revenueByWeek,
                    clientsBySource
                  });
                });
              });
            });
            
            updateProgress({ progress: 100, currentStep: "Processing complete!" });
            
            // Sort periods chronologically (descending)
            const sortedPeriods = [...periods].sort((a, b) => {
              const dateA = new Date(a);
              const dateB = new Date(b);
              return dateB.getTime() - dateA.getTime();
            });
            
            // Sort teachers alphabetically
            const sortedTeachers = [...teachers].sort();
            
            // Return processed data
            resolve({
              processedData,
              locations,
              teachers: sortedTeachers,
              periods: sortedPeriods
            });
          }, 500);
        }, 500);
      }, 500);
    }, 500);
  });
};
