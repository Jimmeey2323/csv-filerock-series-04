
import { formatDateString, getMonthYearFromDate, cleanFirstVisitValue, matchesPattern, isDateAfter, parseDate } from './csvParser';

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
  'Category'?: string;
}

interface SaleRecord {
  // Old fields (bookings structure)
  'Sale Date'?: string;
  'Class Name'?: string;
  'Class Date'?: string;
  'Location'?: string;
  'Teacher'?: string;
  'Customer Email'?: string;
  'Payment Method'?: string;
  'Membership used'?: string;
  'Sale Value'?: string | number;
  'Sales tax'?: string | number;
  'Cancelled'?: string;
  'Late Cancelled'?: string;
  'No Show'?: string;
  'Sold by'?: string;
  'Refunded'?: string;
  'Home location'?: string;
  
  // New fields (sales structure)
  'Category'?: string;
  'Item'?: string;
  'Date'?: string;
  'Tax'?: string | number;
  'Payment status'?: string;
  'Paying Customer Email'?: string;
  'Paying Customer name'?: string;
  'Customer name'?: string;
  'Note'?: string;
}

interface ClientDetail {
  email: string;
  name: string;
  date: string;
  value?: number;
  visitCount?: number;
  membershipType?: string;
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
      console.log("Original new data sample:", newData.slice(0, 2));
      console.log("Original bookings data sample:", bookingsData.slice(0, 2));
      console.log("Original sales data sample:", salesData ? salesData.slice(0, 2) : "No sales data");
      
      // Format dates consistently
      const cleanedNewData = newData.map(record => ({
        ...record,
        'First visit at': formatDateString(record['First visit at'] || ''),
        'First visit': cleanFirstVisitValue(record['First visit'] || ''),
      }));
      
      const cleanedBookingsData = bookingsData.map(record => ({
        ...record,
        'Class Date': formatDateString(record['Class Date'] || ''),
        'Sale Date': formatDateString(record['Sale Date'] || ''),
        'Sale Value': typeof record['Sale Value'] === 'string' 
          ? parseFloat(record['Sale Value'].replace(/[^0-9.-]+/g, '')) || 0 
          : record['Sale Value'] || 0,
        'Class Name': cleanFirstVisitValue(record['Class Name'] || ''),
      }));
      
      console.log("Processing sales data for conversions...");
      const cleanedSalesData = salesData ? salesData.map(record => {
        // Check which date field is available
        const dateField = record['Date'] ? 'Date' : 'Sale Date';
        const dateValue = formatDateString(record[dateField] || '');
        
        // Handle different sale value field structures
        let saleValue = 0;
        if (record['Sale Value'] !== undefined) {
          saleValue = typeof record['Sale Value'] === 'string' 
            ? parseFloat(record['Sale Value'].replace(/[^0-9.-]+/g, '')) || 0 
            : record['Sale Value'] || 0;
        } else if (record['Sale Value'] === undefined && record['Tax'] !== undefined) {
          // This is the new sales format
          saleValue = typeof record['Sale Value'] === 'string' 
            ? parseFloat(record['Sale Value'].replace(/[^0-9.-]+/g, '')) || 0 
            : (record['Sale Value'] as number) || 0;
        }
        
        // Get email address (try both Customer Email and Paying Customer Email)
        const customerEmail = record['Customer Email'] || record['Paying Customer Email'] || '';
        
        // Clean class name if present
        const className = record['Class Name'] || record['Item'] || '';
        const cleanedClassName = cleanFirstVisitValue(className);
        
        return {
          ...record,
          'Sale Date': dateValue,
          'Date': dateValue, // Ensure both fields have the value for consistency
          'Sale Value': saleValue,
          'Customer Email': customerEmail,
          'Class Name': cleanedClassName
        };
      }) : [];

      console.log("Cleaned new data sample:", cleanedNewData.slice(0, 2));
      console.log("Cleaned bookings data sample:", cleanedBookingsData.slice(0, 2));
      console.log("Cleaned sales data sample:", cleanedSalesData.slice(0, 2));
      
      updateProgress({ progress: 20, currentStep: "Matching records and extracting teacher data..." });
      
      // Step 2: Match New records with Bookings to get teacher names
      setTimeout(() => {
        const enrichedNewData = cleanedNewData.map(newRecord => {
          console.log(`Looking for booking match for: ${newRecord['Email']} - ${newRecord['First visit']} - ${newRecord['First visit at']} - ${newRecord['First visit location']}`);
          
          const matchingBooking = cleanedBookingsData.find(booking => {
            const emailMatch = booking['Customer Email'] === newRecord['Email'];
            const nameMatch = booking['Class Name'] === newRecord['First visit'];
            const dateMatch = booking['Class Date'] === newRecord['First visit at'];
            const locationMatch = booking['Location'] === newRecord['First visit location'];
            
            if (emailMatch && nameMatch && dateMatch && locationMatch) {
              console.log(`Found matching booking for ${newRecord['Email']}, teacher: ${booking['Teacher']}`);
              return true;
            }
            return false;
          });
          
          return {
            ...newRecord,
            'Teacher': matchingBooking ? matchingBooking['Teacher'] : 'Unknown'
          };
        });
        
        console.log("Enriched new data with teacher names:", enrichedNewData.slice(0, 2));
        
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
          
          console.log("Found locations:", locations);
          console.log("Found teachers:", teachers);
          console.log("Found periods:", periods);
          
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
                    !matchesPattern(record['Membership used'] || '', "friends|family|staff")
                  );
                  
                  if (teacherNewClients.length === 0) return; // Skip if no data
                  
                  console.log(`Processing ${teacher} at ${location} for period ${period}. Found ${teacherNewClients.length} new clients`);
                  
                  // Calculate client acquisition metrics
                  const newClientsCount = teacherNewClients.length;
                  
                  const trials = teacherNewClients.filter(record => 
                    matchesPattern(record['Membership used'] || '', "Studio Open Barre Class|Newcomers 2 For 1")
                  ).length;
                  
                  const referrals = teacherNewClients.filter(record => 
                    record['Membership used'] === 'Studio Complimentary Referral Class'
                  ).length;
                  
                  const hosted = teacherNewClients.filter(record => 
                    matchesPattern(record['First visit'] || '', "hosted|x|p57|physique|weword|rugby|outdoor|birthday|bridal|shower")
                  ).length;
                  
                  const influencerSignups = teacherNewClients.filter(record => 
                    matchesPattern(record['Membership used'] || '', "sign-up|link|influencer|twain|ooo|lrs|x|p57|physique|complimentary")
                  ).length;
                  
                  const others = newClientsCount - (trials + referrals + hosted + influencerSignups);
                  
                  updateProgress({ progress: 80, currentStep: "Calculating retention and revenue metrics..." });
                  
                  // Get email addresses of these new clients
                  const newClientEmails = teacherNewClients.map(record => record['Email']);
                  console.log(`New client emails for ${teacher}:`, newClientEmails);
                  
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
                    isDateAfter(booking['Class Date'], teacherNewClients[0]['First visit at'])
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
                  
                  console.log(`Retention: ${retainedClientsCount}/${newClientsCount} (${retentionRate.toFixed(1)}%)`);
                  
                  // Find converted clients (purchased after first visit)
                  if (cleanedSalesData.length === 0) {
                    console.error("No sales data available for calculating conversions");
                  } else {
                    console.log(`Processing ${cleanedSalesData.length} sales records for conversion metrics`);
                  }
                  
                  // Log a sample of sales data for debugging
                  if (cleanedSalesData.length > 0) {
                    console.log("Sample sales data for debugging:", cleanedSalesData.slice(0, 5));
                  }
                  
                  // Find converted clients (purchased after first visit) with improved logic
                  const convertedClients = cleanedSalesData.filter(sale => {
                    // Find matching new client record
                    const matchingClient = teacherNewClients.find(client => {
                      const emailMatch = client['Email'] === (sale['Customer Email'] || sale['Paying Customer Email']);
                      return emailMatch;
                    });
                    
                    if (!matchingClient) {
                      return false;
                    }
                    
                    // Debug matched client
                    console.log("Found potential conversion match:", {
                      clientEmail: matchingClient['Email'],
                      saleEmail: sale['Customer Email'] || sale['Paying Customer Email'],
                      firstVisit: matchingClient['First visit at'],
                      saleDate: sale['Date'] || sale['Sale Date'],
                      category: sale['Category'],
                      item: sale['Item'],
                      saleValue: sale['Sale Value']
                    });
                    
                    // Check conditions:
                    // 1. Sale date > First visit date
                    const saleDate = sale['Date'] || sale['Sale Date'] || '';
                    const firstVisitDate = matchingClient['First visit at'];
                    const saleDateAfterVisit = isDateAfter(saleDate, firstVisitDate);
                    
                    // 2. Category != 'product'
                    const notProductCategory = !sale['Category'] || sale['Category'].toLowerCase() !== 'product';
                    
                    // 3. Item doesn't contain '2 for 1'
                    const not2For1 = !sale['Item'] || !matchesPattern(sale['Item'] || '', "2 for 1");
                    
                    // 4. Sale Value > 0
                    const saleValue = typeof sale['Sale Value'] === 'number' ? 
                      sale['Sale Value'] : parseFloat(String(sale['Sale Value'] || '0').replace(/[^0-9.-]+/g, ''));
                    const hasSaleValue = saleValue > 0;
                    
                    // Log detailed diagnostics
                    console.log("Conversion conditions check:", {
                      saleDateAfterVisit,
                      notProductCategory,
                      not2For1,
                      hasSaleValue,
                      saleValue
                    });
                    
                    return saleDateAfterVisit && notProductCategory && not2For1 && hasSaleValue;
                  });
                  
                  console.log(`Found ${convertedClients.length} converted clients for ${teacher}`);
                  
                  // Count unique converted clients
                  const convertedClientEmails = [...new Set(convertedClients.map(sale => 
                    sale['Customer Email'] || sale['Paying Customer Email'] || ''))];
                  const convertedClientsCount = convertedClientEmails.length;
                  
                  // Create detailed converted client list
                  const convertedClientDetails = convertedClientEmails.map(email => {
                    const clientSales = convertedClients.filter(sale => 
                      (sale['Customer Email'] || sale['Paying Customer Email']) === email);
                    const totalValue = clientSales.reduce((sum, sale) => {
                      const saleValue = typeof sale['Sale Value'] === 'number' ? 
                        sale['Sale Value'] : parseFloat(String(sale['Sale Value'] || '0').replace(/[^0-9.-]+/g, ''));
                      return sum + saleValue;
                    }, 0);
                    
                    const clientInfo = teacherNewClients.find(client => client['Email'] === email);
                    return {
                      email,
                      name: clientInfo ? `${clientInfo['First name']} ${clientInfo['Last name']}` : 'Unknown',
                      date: clientSales[0]['Date'] || clientSales[0]['Sale Date'] || '',
                      value: totalValue,
                      membershipType: clientSales[0]['Membership used'] || clientSales[0]['Item'] || ''
                    };
                  });
                  
                  // Calculate conversion rate
                  const conversionRate = newClientsCount > 0 
                    ? (convertedClientsCount / newClientsCount) * 100 
                    : 0;
                  
                  console.log(`Conversion: ${convertedClientsCount}/${newClientsCount} (${conversionRate.toFixed(1)}%)`);
                  
                  // Calculate revenue metrics
                  const totalRevenue = convertedClients.reduce((sum, sale) => {
                    const saleValue = typeof sale['Sale Value'] === 'number' ? 
                      sale['Sale Value'] : parseFloat(String(sale['Sale Value'] || '0').replace(/[^0-9.-]+/g, ''));
                    return sum + saleValue;
                  }, 0);
                  
                  console.log(`Total revenue: ${totalRevenue}`);
                  
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
                  const influencerConvertedCount = convertedClients.filter(sale => {
                    const email = sale['Customer Email'] || sale['Paying Customer Email'] || '';
                    return teacherNewClients.some(client => 
                      client['Email'] === email && 
                      matchesPattern(client['Membership used'] || '', "sign-up|link|influencer|twain|ooo|lrs|x|p57|physique|complimentary")
                    );
                  }).length;
                  
                  const influencerConversionRate = influencerSignups > 0 
                    ? (influencerConvertedCount / influencerSignups) * 100 
                    : 0;
                  
                  // Referral conversion
                  const referralConvertedCount = convertedClients.filter(sale => {
                    const email = sale['Customer Email'] || sale['Paying Customer Email'] || '';
                    return teacherNewClients.some(client => 
                      client['Email'] === email && 
                      client['Membership used'] === 'Studio Complimentary Referral Class'
                    );
                  }).length;
                  
                  const referralConversionRate = referrals > 0 
                    ? (referralConvertedCount / referrals) * 100 
                    : 0;
                  
                  // Trial to membership conversion
                  const trialConvertedCount = convertedClients.filter(sale => {
                    const email = sale['Customer Email'] || sale['Paying Customer Email'] || '';
                    return teacherNewClients.some(client => 
                      client['Email'] === email && 
                      matchesPattern(client['Membership used'] || '', "Studio Open Barre Class|Newcomers 2 For 1")
                    );
                  }).length;
                  
                  const trialToMembershipConversion = trials > 0 
                    ? (trialConvertedCount / trials) * 100 
                    : 0;
                  
                  // Create weekly revenue data for charts
                  const revenueByWeek = convertedClients.reduce((acc, sale) => {
                    const dateStr = sale['Date'] || sale['Sale Date'] || '';
                    if (!dateStr) return acc;
                    
                    const date = parseDate(dateStr);
                    if (!date) return acc;
                    
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    const weekKey = weekStart.toISOString().split('T')[0];
                    
                    const existing = acc.find(item => item.week === weekKey);
                    const saleValue = typeof sale['Sale Value'] === 'number' ? 
                      sale['Sale Value'] : parseFloat(String(sale['Sale Value'] || '0').replace(/[^0-9.-]+/g, ''));
                      
                    if (existing) {
                      existing.revenue += saleValue;
                    } else {
                      acc.push({ week: weekKey, revenue: saleValue });
                    }
                    
                    return acc;
                  }, [] as { week: string; revenue: number }[]);
                  
                  console.log("Revenue by week data:", revenueByWeek);
                  
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
