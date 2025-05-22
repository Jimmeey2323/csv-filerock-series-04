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
  'Customer Email': string; // Corrected to match header
  'Payment Method': string; // Corrected to match header
  'Membership used': string;
  'Sale Value': string | number; // Corrected to match header
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
  // Sales structure fields with correct column names
  'Category': string;
  'Item': string;
  'Date': string;
  'Sale value': string | number;
  'Tax': string | number;
  'Refunded': string;
  'Payment method': string;
  'Payment status': string;
  'Sold by': string;
  'Paying Customer email': string;
  'Paying Customer name': string;
  'Customer email': string;
  'Customer name': string;
  'Location': string;
  'Note': string;
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
  includedRecords: any[];
  excludedRecords: any[];
  newClientRecords: any[];
  convertedClientRecords: any[];
  retainedClientRecords: any[];
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
        // Use the correct field names as per the headers
        const dateValue = formatDateString(record['Date'] || '');
        
        // Handle sale value with the correct field name
        const saleValue = typeof record['Sale value'] === 'string' 
          ? parseFloat(record['Sale value'].replace(/[^0-9.-]+/g, '')) || 0 
          : (record['Sale value'] as number) || 0;
        
        return {
          ...record,
          'Date': dateValue,
          'Sale value': saleValue,
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
            const emailMatch = booking['Customer Email'] === newRecord['Email']; // Corrected field name
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
            
            // Also process by studio
            const studioData: { [key: string]: ProcessedTeacherData } = {};
            
            // Arrays to hold records for our new properties
            const includedRecords: any[] = [];
            const excludedRecords: any[] = [];
            const newClientRecords: any[] = [];
            const convertedClientRecords: any[] = [];
            const retainedClientRecords: any[] = [];
            
            // Group data by teacher, location, and period
            teachers.forEach(teacher => {
              locations.forEach(location => {
                periods.forEach(period => {
                  // First, identify excluded records based on membership type or first visit class name
                  enrichedNewData.forEach(record => {
                    const membershipPattern = matchesPattern(record['Membership used'] || '', "friends|family|staff");
                    const firstVisitPattern = matchesPattern(record['First visit'] || '', "friends|family|staff");
                    
                    if (membershipPattern || firstVisitPattern) {
                      excludedRecords.push({
                        ...record,
                        reason: membershipPattern 
                          ? "Friends, family, or staff membership" 
                          : "Friends, family, or staff class type"
                      });
                    }
                  });
                  
                  // Get new clients for this teacher, location, and period - now with improved exclusion logic
                  const teacherNewClients = enrichedNewData.filter(record => 
                    record['Teacher'] === teacher &&
                    record['First visit location'] === location &&
                    getMonthYearFromDate(record['First visit at']) === period &&
                    !matchesPattern(record['Membership used'] || '', "friends|family|staff") &&
                    !matchesPattern(record['First visit'] || '', "friends|family|staff")
                  );
                  
                  if (teacherNewClients.length === 0) return; // Skip if no data
                  
                  console.log(`Processing ${teacher} at ${location} for period ${period}. Found ${teacherNewClients.length} new clients`);
                  
                  // Add records to our tracking arrays
                  teacherNewClients.forEach(client => {
                    includedRecords.push({
                      ...client,
                      reason: "Matched teacher, location, and period criteria"
                    });
                    newClientRecords.push({
                      ...client,
                      reason: "First time visitor"
                    });
                  });
                  
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
                  
                  // FIXED: Find return visits in bookings data - only count visits AFTER first visit 
                  // and where all 3 cancellation fields are "NO"
                  const returnVisits = cleanedBookingsData.filter(booking => {
                    // Get matching client record
                    const matchingClient = teacherNewClients.find(client => 
                      client['Email'] === booking['Customer Email'] // Corrected field name
                    );
                    
                    if (!matchingClient) return false;
                    
                    // Ensure this isn't the first visit (date must be strictly after first visit)
                    const isAfterFirstVisit = isDateAfter(booking['Class Date'], matchingClient['First visit at']);
                    
                    // Check all cancellation fields are "NO"
                    const notCancelled = booking['Cancelled'] === 'NO';
                    const notLateCancelled = booking['Late Cancelled'] === 'NO';
                    const notNoShow = booking['No Show'] === 'NO'; 
                    
                    // Log for debugging
                    if (booking['Customer Email'] === matchingClient['Email']) {
                      console.log(`Return visit check for ${booking['Customer Email']}:`, {
                        isAfterFirstVisit,
                        notCancelled,
                        notLateCancelled,
                        notNoShow,
                        firstVisit: matchingClient['First visit at'],
                        bookingDate: booking['Class Date']
                      });
                    }
                    
                    return isAfterFirstVisit && notCancelled && notLateCancelled && notNoShow;
                  });
                  
                  console.log(`Found ${returnVisits.length} return visits for all clients of ${teacher}`);
                  
                  // Count unique emails with return visits
                  const returnClientEmails = [...new Set(returnVisits.map(visit => visit['Customer Email']))]; // Corrected field name
                  const retainedClientsCount = returnClientEmails.length;
                  
                  console.log(`Found ${retainedClientsCount} unique retained clients for ${teacher}`);
                  
                  // Create detailed retained client list and add to retainedClientRecords array
                  const retainedClientDetails = returnClientEmails.map(email => {
                    const clientVisits = returnVisits.filter(visit => visit['Customer Email'] === email); // Corrected field name
                    const clientInfo = teacherNewClients.find(client => client['Email'] === email);
                    
                    // Add this client to retained records with full client information
                    if (clientInfo) {
                      const retainedClient = {
                        ...clientInfo,
                        visitsCount: clientVisits.length,
                        reason: "Had return visits after initial trial",
                        firstVisitPostTrial: clientVisits[0]['Class Date'] || 'N/A'
                      };
                      retainedClientRecords.push(retainedClient);
                      
                      return {
                        email,
                        name: `${clientInfo['First name']} ${clientInfo['Last name']}`,
                        date: clientVisits[0]['Class Date'],
                        visitCount: clientVisits.length,
                        membershipType: clientInfo['Membership used']
                      };
                    }
                    
                    return {
                      email,
                      name: 'Unknown',
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
                    // Find matching new client record - use correct field names from sales sheet
                    const matchingClient = teacherNewClients.find(client => {
                      const emailMatch = (
                        client['Email'] === sale['Customer email'] || 
                        client['Email'] === sale['Paying Customer email']
                      );
                      
                      return emailMatch;
                    });
                    
                    if (!matchingClient) {
                      return false;
                    }
                    
                    // Debug matched client
                    console.log("Found potential conversion match:", {
                      clientEmail: matchingClient['Email'],
                      saleEmail: sale['Customer email'] || sale['Paying Customer email'],
                      firstVisit: matchingClient['First visit at'],
                      saleDate: sale['Date'],
                      category: sale['Category'],
                      item: sale['Item'],
                      saleValue: sale['Sale value']
                    });
                    
                    // Check conditions:
                    // 1. Sale date > First visit date
                    const saleDate = sale['Date'] || '';
                    const firstVisitDate = matchingClient['First visit at'];
                    const saleDateAfterVisit = isDateAfter(saleDate, firstVisitDate);
                    
                    // 2. Category doesn't contain 'product' or 'money-credit'
                    const category = (sale['Category'] || '').toLowerCase();
                    const notProductOrMoneyCredit = !matchesPattern(category, "product|money-credit");
                    
                    // 3. Item doesn't contain '2 for 1'
                    const not2For1 = !sale['Item'] || !matchesPattern(sale['Item'] || '', "2 for 1");
                    
                    // 4. Sale value > 0
                    const saleValue = typeof sale['Sale value'] === 'number' ? 
                      sale['Sale value'] : parseFloat(String(sale['Sale value'] || '0').replace(/[^0-9.-]+/g, ''));
                    const hasSaleValue = saleValue > 0;
                    
                    // 5. Not refunded
                    const notRefunded = sale['Refunded'] !== 'YES';
                    
                    // Log detailed diagnostics
                    console.log("Conversion conditions check:", {
                      saleDateAfterVisit,
                      notProductOrMoneyCredit,
                      not2For1,
                      hasSaleValue,
                      notRefunded,
                      saleValue,
                      category,
                      refunded: sale['Refunded']
                    });
                    
                    const isConverted = saleDateAfterVisit && notProductOrMoneyCredit && not2For1 && hasSaleValue && notRefunded;
                    
                    // Add to converted records if it matches all criteria - with full client information
                    if (isConverted && matchingClient) {
                      const convertedClient = {
                        ...matchingClient,
                        purchaseDate: sale['Date'],
                        saleValue: saleValue,
                        purchaseItem: sale['Item'],
                        firstPurchaseDate: sale['Date'], // Add this explicitly for clarity
                        reason: "Made purchase after initial visit"
                      };
                      convertedClientRecords.push(convertedClient);
                    }
                    
                    return isConverted;
                  });
                  
                  console.log(`Found ${convertedClients.length} converted clients for ${teacher}`);
                  
                  // Count unique converted clients
                  const convertedClientEmails = [...new Set(convertedClients.map(sale => 
                    sale['Customer email'] || sale['Paying Customer email'] || ''))];
                  const convertedClientsCount = convertedClientEmails.length;
                  
                  // Create detailed converted client list with proper purchase date extraction
                  const convertedClientDetails = convertedClientEmails.map(email => {
                    const clientSales = convertedClients
                      .filter(sale => (sale['Customer email'] || sale['Paying Customer email']) === email)
                      // Sort by date to find the earliest purchase date after first visit
                      .sort((a, b) => {
                        const dateA = new Date(a['Date'] || '');
                        const dateB = new Date(b['Date'] || '');
                        return dateA.getTime() - dateB.getTime(); // Ascending sort
                      });
                    
                    const totalValue = clientSales.reduce((sum, sale) => {
                      const saleValue = typeof sale['Sale value'] === 'number' ? 
                        sale['Sale value'] : parseFloat(String(sale['Sale value'] || '0').replace(/[^0-9.-]+/g, ''));
                      return sum + saleValue;
                    }, 0);
                    
                    // Get the client's information including first visit date
                    const clientInfo = teacherNewClients.find(client => client['Email'] === email);
                    
                    // The first purchase date is the date of the earliest sale after first visit
                    const firstPurchaseDate = clientSales.length > 0 ? clientSales[0]['Date'] : '';
                    
                    return {
                      email,
                      name: clientInfo ? `${clientInfo['First name']} ${clientInfo['Last name']}` : 'Unknown',
                      date: firstPurchaseDate, // This will be the purchase date (earliest sale after first visit)
                      value: totalValue,
                      firstVisit: clientInfo ? clientInfo['First visit at'] : '',
                      firstPurchaseDate, // <-- ADD THIS LINE
                      membershipType: clientSales[0]['Item'] || ''
                    };
                  });

                  // Calculate conversion rate
                  const conversionRate = newClientsCount > 0 
                    ? (convertedClientsCount / newClientsCount) * 100 
                    : 0;
                  
                  console.log(`Conversion: ${convertedClientsCount}/${newClientsCount} (${conversionRate.toFixed(1)}%)`);
                  
                  // Calculate revenue metrics
                  const totalRevenue = convertedClients.reduce((sum, sale) => {
                    const saleValue = typeof sale['Sale value'] === 'number' ? 
                      sale['Sale value'] : parseFloat(String(sale['Sale value'] || '0').replace(/[^0-9.-]+/g, ''));
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
                    const email = sale['Customer email'] || sale['Paying Customer email'] || '';
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
                    const email = sale['Customer email'] || sale['Paying Customer email'] || '';
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
                    const email = sale['Customer email'] || sale['Paying Customer email'] || '';
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
                    const dateStr = sale['Date'] || '';
                    if (!dateStr) return acc;
                    
                    const date = parseDate(dateStr);
                    if (!date) return acc;
                    
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    const weekKey = weekStart.toISOString().split('T')[0];
                    
                    const existing = acc.find(item => item.week === weekKey);
                    const saleValue = typeof sale['Sale value'] === 'number' ? 
                      sale['Sale value'] : parseFloat(String(sale['Sale value'] || '0').replace(/[^0-9.-]+/g, ''));
                      
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
                  
                  // Combine data for studio view
                  if (!studioData[location]) {
                    studioData[location] = {
                      teacherName: 'All Teachers',
                      location,
                      period,
                      newClients: 0,
                      trials: 0,
                      referrals: 0,
                      hosted: 0,
                      influencerSignups: 0,
                      others: 0,
                      retainedClients: 0,
                      retentionRate: 0,
                      convertedClients: 0,
                      conversionRate: 0,
                      totalRevenue: 0,
                      averageRevenuePerClient: 0,
                      noShowRate: 0,
                      lateCancellationRate: 0,
                      firstTimeBuyerRate: 0,
                      influencerConversionRate: 0,
                      referralConversionRate: 0,
                      trialToMembershipConversion: 0,
                      newClientDetails: [],
                      retainedClientDetails: [],
                      convertedClientDetails: [],
                      revenueByWeek: [],
                      clientsBySource: []
                    };
                  }
                  
                  // Add this teacher's data to the studio total
                  const studio = studioData[location];
                  studio.newClients += newClientsCount;
                  studio.trials += trials;
                  studio.referrals += referrals;
                  studio.hosted += hosted;
                  studio.influencerSignups += influencerSignups;
                  studio.others += others;
                  studio.retainedClients += retainedClientsCount;
                  studio.convertedClients += convertedClientsCount;
                  studio.totalRevenue += totalRevenue;
                  
                  // Combine client details
                  studio.newClientDetails = [...studio.newClientDetails, ...newClientDetails];
                  studio.retainedClientDetails = [...studio.retainedClientDetails, ...retainedClientDetails];
                  studio.convertedClientDetails = [...studio.convertedClientDetails, ...convertedClientDetails];
                  
                  // Combine revenue by week data
                  revenueByWeek.forEach(weekData => {
                    const existingWeek = studio.revenueByWeek.find(w => w.week === weekData.week);
                    if (existingWeek) {
                      existingWeek.revenue += weekData.revenue;
                    } else {
                      studio.revenueByWeek.push({ ...weekData });
                    }
                  });
                  
                  // Update studio client source data
                  if (!studio.clientsBySource.length) {
                    studio.clientsBySource = [...clientsBySource];
                  } else {
                    studio.clientsBySource.forEach((source, index) => {
                      source.count += clientsBySource[index].count;
                    });
                  }
                });
              });
            });
            
            // Calculate rates for studios
            Object.values(studioData).forEach(studio => {
              // Calculate retention rate
              studio.retentionRate = studio.newClients > 0 
                ? (studio.retainedClients / studio.newClients) * 100 
                : 0;
              
              // Calculate conversion rate
              studio.conversionRate = studio.newClients > 0 
                ? (studio.convertedClients / studio.newClients) * 100 
                : 0;
              
              // Calculate average revenue per client
              studio.averageRevenuePerClient = studio.convertedClients > 0 
                ? studio.totalRevenue / studio.convertedClients 
                : 0;
              
              // Add studio data to processedData
              processedData.push(studio);
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
            
            // Return processed data along with the records we need
            resolve({
              processedData,
              locations,
              teachers: sortedTeachers,
              periods: sortedPeriods,
              includedRecords,
              excludedRecords,
              newClientRecords,
              convertedClientRecords,
              retainedClientRecords
            });
          }, 500);
        }, 500);
      }, 500);
    }, 500);
  });
};
