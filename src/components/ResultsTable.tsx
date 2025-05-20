
// This adds the necessary vertical scrolling and ensures the totals row is always visible
import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, BarChart2, TrendingUp, TrendingDown, AlertTriangle, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { safeToFixed, safeFormatCurrency } from '@/lib/utils';
import PerformanceMetricCard from './cards/PerformanceMetricCard';
import StudioMetricCard from './cards/StudioMetricCard';
import DrillDownAnalytics from './DrillDownAnalytics';
import { Input } from '@/components/ui/input';

// Define the properties required by the ResultsTable component
interface ResultsTableProps {
  data: ProcessedTeacherData[];
  locations: string[];
  isLoading: boolean;
  viewMode: 'table' | 'cards' | 'detailed';
  dataMode: 'teacher' | 'studio';
  onFilterChange: (filters: { location?: string; teacher?: string; period?: string; search?: string }) => void;
}

// Define the ResultsTable component
const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  locations,
  isLoading,
  viewMode,
  dataMode,
  onFilterChange
}) => {
  // Define state variables
  const [sortColumn, setSortColumn] = useState<string>('teacherName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedData, setSelectedData] = useState<ProcessedTeacherData | null>(null);
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
  const [drillDownType, setDrillDownType] = useState<'teacher' | 'studio' | 'location' | 'period' | 'totals'>('teacher');
  const [metricType, setMetricType] = useState<'conversion' | 'retention' | 'all'>('all');
  const [tableHeight, setTableHeight] = useState('650px');
  const [searchValue, setSearchValue] = useState('');

  // Create totals row data
  const totalsRow: ProcessedTeacherData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        teacherName: 'All Teachers',
        location: 'All Locations',
        newClients: 0,
        convertedClients: 0,
        retainedClients: 0,
        trials: 0,
        referrals: 0,
        hosted: 0,
        influencerSignups: 0,
        others: 0,
        trialToMembershipConversion: 0,
        referralConversionRate: 0,
        influencerConversionRate: 0,
        retentionRate: 0,
        conversionRate: 0,
        noShowRate: 0,
        lateCancellationRate: 0,
        totalRevenue: 0,
        averageRevenuePerClient: 0,
        period: 'All Periods',
        revenueByWeek: [],
        firstTimeBuyerRate: 0 // Adding the missing property
      };
    }

    // Calculate aggregates for the totals row
    const totals = data.reduce((acc, curr) => {
      acc.newClients += curr.newClients || 0;
      acc.convertedClients += curr.convertedClients || 0;
      acc.retainedClients += curr.retainedClients || 0;
      acc.trials += curr.trials || 0;
      acc.referrals += curr.referrals || 0;
      acc.hosted += curr.hosted || 0;
      acc.influencerSignups += curr.influencerSignups || 0;
      acc.others += curr.others || 0;
      acc.totalRevenue += curr.totalRevenue || 0;
      return acc;
    }, {
      teacherName: 'All Teachers',
      location: 'All Locations',
      newClients: 0,
      convertedClients: 0,
      retainedClients: 0,
      trials: 0,
      referrals: 0,
      hosted: 0,
      influencerSignups: 0,
      others: 0,
      trialToMembershipConversion: 0,
      referralConversionRate: 0,
      influencerConversionRate: 0,
      retentionRate: 0,
      conversionRate: 0,
      noShowRate: 0,
      lateCancellationRate: 0,
      totalRevenue: 0,
      averageRevenuePerClient: 0,
      period: 'All Periods',
      revenueByWeek: [],
      firstTimeBuyerRate: 0, // Adding the missing property
      newClientDetails: data.flatMap(item => item.newClientDetails || []),
      convertedClientDetails: data.flatMap(item => item.convertedClientDetails || []),
      retainedClientDetails: data.flatMap(item => item.retainedClientDetails || [])
    });

    // Calculate derived rates for the totals
    totals.conversionRate = totals.newClients > 0 ? (totals.convertedClients / totals.newClients) * 100 : 0;
    totals.retentionRate = totals.newClients > 0 ? (totals.retainedClients / totals.newClients) * 100 : 0;
    totals.averageRevenuePerClient = totals.convertedClients > 0 ? totals.totalRevenue / totals.convertedClients : 0;
    totals.trialToMembershipConversion = totals.trials > 0 ? (totals.convertedClients / totals.trials) * 100 : 0;
    
    // Compute average no-show and late cancellation rates
    const avgNoShowRate = data.reduce((sum, item) => sum + (item.noShowRate || 0), 0) / data.length;
    const avgLateCancellationRate = data.reduce((sum, item) => sum + (item.lateCancellationRate || 0), 0) / data.length;
    totals.noShowRate = avgNoShowRate;
    totals.lateCancellationRate = avgLateCancellationRate;
    totals.firstTimeBuyerRate = data.reduce((sum, item) => sum + (item.firstTimeBuyerRate || 0), 0) / data.length;

    // Combine and normalize weekly revenue data
    const allWeeks = new Set<string>();
    data.forEach(item => {
      if (item.revenueByWeek) {
        item.revenueByWeek.forEach(week => {
          allWeeks.add(week.week);
        });
      }
    });

    const weeklyRevenue = Array.from(allWeeks).map(week => {
      const total = data.reduce((sum, item) => {
        const weekData = item.revenueByWeek?.find(w => w.week === week);
        return sum + (weekData?.revenue || 0);
      }, 0);
      return { week, revenue: total };
    }).sort((a, b) => a.week.localeCompare(b.week));

    totals.revenueByWeek = weeklyRevenue;
    
    return totals;
  }, [data]);

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort the data based on the selected column and direction
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return [...data].sort((a, b) => {
      const aValue = a[sortColumn as keyof ProcessedTeacherData];
      const bValue = b[sortColumn as keyof ProcessedTeacherData];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  // Update the drilldown with the selected data
  const handleRowClick = (item: ProcessedTeacherData, type: 'teacher' | 'studio' | 'location' | 'period' | 'totals' = 'teacher') => {
    setSelectedData(item);
    setDrillDownType(type);
    setMetricType('all');
    setIsDrillDownOpen(true);
  };

  // Handle metric click to open drilldown with specific tab
  const handleMetricClick = (item: ProcessedTeacherData, metric: 'conversion' | 'retention') => {
    setSelectedData(item);
    setDrillDownType('teacher');
    setMetricType(metric);
    setIsDrillDownOpen(true);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onFilterChange({ search: e.target.value });
  };

  // Filter data based on search value
  const filterData = (searchTerm: string) => {
    if (!searchTerm) return sortedData;
    
    return sortedData.filter(item => 
      item.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Apply quick filter to data
  const applyQuickFilter = (location: string) => {
    onFilterChange({ location });
  };

  // Close the drilldown modal
  const closeDrillDown = () => {
    setIsDrillDownOpen(false);
  };

  // Calculate the filtered data
  const filteredData = useMemo(() => filterData(searchValue), [sortedData, searchValue]);

  // Adjust tableHeight based on the window size
  useEffect(() => {
    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const newHeight = Math.max(400, windowHeight - 400) + 'px';
      setTableHeight(newHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render table rows
  const renderRows = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="h-24 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading data...</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (filteredData.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="h-24 text-center">
            <div className="flex flex-col items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No data found</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return filteredData.map((item, index) => (
      <TableRow 
        key={`${item.teacherName}-${item.location}-${index}`} 
        className="animate-fade-in cursor-pointer hover:bg-muted/80 transition-colors"
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={() => handleRowClick(item, 'teacher')}
      >
        <TableCell className="font-medium">{item.teacherName}</TableCell>
        <TableCell>{item.location}</TableCell>
        <TableCell className="text-center">{item.newClients}</TableCell>
        <TableCell className="text-center">
          <div className="flex items-center justify-center gap-1">
            {item.convertedClients}
            <Badge 
              variant={item.conversionRate > 10 ? "success" : "destructive"} 
              className="ml-1 animate-scale-in flex items-center gap-1"
            >
              {item.conversionRate > 10 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {safeToFixed(item.conversionRate, 1)}%
            </Badge>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="flex items-center justify-center gap-1">
            {item.retainedClients}
            <Badge 
              variant={item.retentionRate > 50 ? "success" : "destructive"} 
              className="ml-1 animate-scale-in flex items-center gap-1"
            >
              {item.retentionRate > 50 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {safeToFixed(item.retentionRate, 1)}%
            </Badge>
          </div>
        </TableCell>
        <TableCell className="text-right">{safeFormatCurrency(item.totalRevenue)}</TableCell>
        <TableCell className="text-center">
          <Button variant="outline" size="sm" 
            className="flex items-center gap-1"
            onClick={(e) => { e.stopPropagation(); handleRowClick(item, 'teacher'); }}
          >
            <BarChart2 className="h-4 w-4" /> View
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  // Calculate studio metrics
  const studioMetrics = useMemo(() => {
    if (!data || data.length === 0) return [];

    const locationMap = new Map<string, ProcessedTeacherData>();

    data.forEach(item => {
      if (!locationMap.has(item.location)) {
        locationMap.set(item.location, {
          teacherName: 'All Teachers',
          location: item.location,
          newClients: 0,
          convertedClients: 0,
          retainedClients: 0,
          trials: 0,
          referrals: 0,
          hosted: 0,
          influencerSignups: 0,
          others: 0,
          trialToMembershipConversion: 0,
          referralConversionRate: 0,
          influencerConversionRate: 0,
          retentionRate: 0,
          conversionRate: 0,
          noShowRate: 0,
          lateCancellationRate: 0,
          totalRevenue: 0,
          averageRevenuePerClient: 0,
          period: 'All Periods',
          revenueByWeek: [],
          firstTimeBuyerRate: 0, // Adding the missing property
          newClientDetails: [],
          convertedClientDetails: [],
          retainedClientDetails: []
        });
      }

      const locationData = locationMap.get(item.location)!;
      locationData.newClients += item.newClients || 0;
      locationData.convertedClients += item.convertedClients || 0;
      locationData.retainedClients += item.retainedClients || 0;
      locationData.trials += item.trials || 0;
      locationData.referrals += item.referrals || 0;
      locationData.hosted += item.hosted || 0;
      locationData.influencerSignups += item.influencerSignups || 0;
      locationData.others += item.others || 0;
      locationData.totalRevenue += item.totalRevenue || 0;
      
      // Collect client details
      if (item.newClientDetails) {
        locationData.newClientDetails = [...(locationData.newClientDetails || []), ...(item.newClientDetails || [])];
      }
      if (item.convertedClientDetails) {
        locationData.convertedClientDetails = [...(locationData.convertedClientDetails || []), ...(item.convertedClientDetails || [])];
      }
      if (item.retainedClientDetails) {
        locationData.retainedClientDetails = [...(locationData.retainedClientDetails || []), ...(item.retainedClientDetails || [])];
      }
    });

    // Calculate derived metrics for each location
    for (const [_, locationData] of locationMap.entries()) {
      locationData.conversionRate = locationData.newClients > 0 ? (locationData.convertedClients / locationData.newClients) * 100 : 0;
      locationData.retentionRate = locationData.newClients > 0 ? (locationData.retainedClients / locationData.newClients) * 100 : 0;
      locationData.averageRevenuePerClient = locationData.convertedClients > 0 ? locationData.totalRevenue / locationData.convertedClients : 0;
    }

    return Array.from(locationMap.values());
  }, [data]);

  return (
    <div className="space-y-4 animate-fade-in">
      {viewMode === 'table' && (
        <Card>
          <CardHeader className="py-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Performance Analytics</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teachers or locations..."
                  className="pl-8"
                  value={searchValue}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex gap-1">
                {locations.slice(0, 3).map(loc => (
                  <Button 
                    key={loc} 
                    variant="outline" 
                    size="sm"
                    className="text-xs animate-scale-in px-2"
                    onClick={() => applyQuickFilter(loc)}
                  >
                    {loc}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className={`rounded-md overflow-auto`} style={{ height: tableHeight }}>
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/60 transition-colors w-[180px]"
                      onClick={() => handleSort('teacherName')}
                    >
                      <div className="flex items-center">
                        Teacher 
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/60 transition-colors w-[180px]"
                      onClick={() => handleSort('location')}
                    >
                      <div className="flex items-center">
                        Location
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/60 transition-colors text-center w-[120px]"
                      onClick={() => handleSort('newClients')}
                    >
                      <div className="flex items-center justify-center">
                        New Clients
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/60 transition-colors text-center w-[180px]"
                      onClick={() => handleSort('conversionRate')}
                    >
                      <div className="flex items-center justify-center">
                        Converted (Rate)
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/60 transition-colors text-center w-[180px]"
                      onClick={() => handleSort('retentionRate')}
                    >
                      <div className="flex items-center justify-center">
                        Retained (Rate)
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/60 transition-colors text-right w-[150px]"
                      onClick={() => handleSort('totalRevenue')}
                    >
                      <div className="flex items-center justify-end">
                        Revenue
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-[100px]">
                      Details
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderRows()}
                </TableBody>
                <TableFooter className="sticky bottom-0 z-10 bg-primary text-white font-medium hover:bg-primary-dark cursor-pointer transition-colors duration-300"
                             onClick={() => handleRowClick(totalsRow, 'totals')}>
                  <TableRow>
                    <TableCell className="text-white">Totals</TableCell>
                    <TableCell className="text-white">All Locations</TableCell>
                    <TableCell className="text-center text-white">{totalsRow.newClients}</TableCell>
                    <TableCell className="text-center text-white">
                      <div className="flex items-center justify-center gap-1">
                        {totalsRow.convertedClients}
                        <Badge 
                          variant={totalsRow.conversionRate > 10 ? "success" : "destructive"} 
                          className="ml-1 animate-scale-in flex items-center gap-1 bg-white/20 hover:bg-white/30"
                        >
                          {totalsRow.conversionRate > 10 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {safeToFixed(totalsRow.conversionRate, 1)}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-white">
                      <div className="flex items-center justify-center gap-1">
                        {totalsRow.retainedClients}
                        <Badge 
                          variant={totalsRow.retentionRate > 50 ? "success" : "destructive"} 
                          className="ml-1 animate-scale-in flex items-center gap-1 bg-white/20 hover:bg-white/30"
                        >
                          {totalsRow.retentionRate > 50 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {safeToFixed(totalsRow.retentionRate, 1)}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-white">{safeFormatCurrency(totalsRow.totalRevenue)}</TableCell>
                    <TableCell className="text-center text-white">
                      <Button variant="outline" size="sm" 
                        className="flex items-center gap-1 bg-white/20 hover:bg-white/30 border-white/30 text-white"
                        onClick={(e) => { e.stopPropagation(); handleRowClick(totalsRow, 'totals'); }}
                      >
                        <BarChart2 className="h-4 w-4" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {viewMode === 'cards' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/30 rounded-lg p-4 text-center animate-scale-in" style={{ animationDelay: '100ms' }}>
                      <div className="text-2xl font-bold">{totalsRow.newClients}</div>
                      <div className="text-sm text-muted-foreground">New Clients</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 text-center animate-scale-in" style={{ animationDelay: '200ms' }}>
                      <div className="text-2xl font-bold flex items-center justify-center">
                        {safeToFixed(totalsRow.conversionRate, 1)}%
                        {totalsRow.conversionRate > 10 ? 
                          <TrendingUp className="h-4 w-4 ml-2 text-green-500" /> : 
                          <TrendingDown className="h-4 w-4 ml-2 text-red-500" />
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">Conversion</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 text-center animate-scale-in" style={{ animationDelay: '300ms' }}>
                      <div className="text-2xl font-bold">{safeFormatCurrency(totalsRow.totalRevenue)}</div>
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {dataMode === 'teacher' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedData.map((item, index) => (
                  <PerformanceMetricCard 
                    key={`${item.teacherName}-${item.location}-${index}`}
                    title={item.teacherName}
                    value={safeFormatCurrency(item.totalRevenue)}
                    secondaryValue={`${safeToFixed(item.conversionRate, 1)}%`}
                    icon={<BarChart2 className="h-5 w-5" />}
                    status={item.conversionRate > 10 ? 'positive' : item.conversionRate > 5 ? 'neutral' : 'negative'}
                    tooltip={`Performance metrics for ${item.teacherName} at ${item.location}`}
                    trend={{
                      value: item.conversionRate - (totalsRow.conversionRate || 0),
                      label: 'vs avg'
                    }}
                    onCustomClick={() => handleRowClick(item, 'teacher')}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studioMetrics.map((item, index) => (
                  <StudioMetricCard 
                    key={`studio-${item.location}-${index}`}
                    title="Studio Performance"
                    value={safeFormatCurrency(item.totalRevenue)}
                    location={item.location}
                    metrics={[
                      {
                        label: 'Conversion',
                        value: `${safeToFixed(item.conversionRate, 1)}%`,
                        status: item.conversionRate > 10 ? 'positive' : 'negative'
                      },
                      {
                        label: 'Retention',
                        value: `${safeToFixed(item.retentionRate, 1)}%`,
                        status: item.retentionRate > 50 ? 'positive' : 'negative'
                      },
                      {
                        label: 'New Clients',
                        value: item.newClients
                      },
                      {
                        label: 'Revenue/Client',
                        value: safeFormatCurrency(item.averageRevenuePerClient)
                      }
                    ]}
                    icon={<BarChart2 className="h-5 w-5" />}
                    tooltip={`Performance metrics for ${item.location}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {viewMode === 'detailed' && (
        <div>
          <Tabs defaultValue="teachers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="teachers" className="flex items-center gap-2">
                Teacher Performance
              </TabsTrigger>
              <TabsTrigger value="studios" className="flex items-center gap-2">
                Studio Performance
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="teachers">
              <div className="grid grid-cols-1 gap-4">
                {sortedData.map((item, index) => (
                  <Card 
                    key={`${item.teacherName}-${item.location}-${index}`} 
                    className="shadow-sm hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleRowClick(item, 'teacher')}
                  >
                    <CardContent className="p-0">
                      <div className="grid grid-cols-3 gap-0">
                        <div className="p-4 border-r">
                          <h3 className="text-lg font-semibold">{item.teacherName}</h3>
                          <p className="text-sm text-muted-foreground">{item.location}</p>
                        </div>
                        <div className="p-4 border-r">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">New Clients</p>
                              <p className="text-xl font-semibold">{item.newClients}</p>
                            </div>
                            <div onClick={(e) => { e.stopPropagation(); handleMetricClick(item, 'conversion'); }}>
                              <p className="text-sm text-muted-foreground">Conversion</p>
                              <p className="text-xl font-semibold flex items-center">
                                {safeToFixed(item.conversionRate, 1)}%
                                {item.conversionRate > 10 ? 
                                  <TrendingUp className="h-4 w-4 ml-1 text-green-500" /> : 
                                  <TrendingDown className="h-4 w-4 ml-1 text-red-500" />
                                }
                              </p>
                            </div>
                            <div onClick={(e) => { e.stopPropagation(); handleMetricClick(item, 'retention'); }}>
                              <p className="text-sm text-muted-foreground">Retention</p>
                              <p className="text-xl font-semibold flex items-center">
                                {safeToFixed(item.retentionRate, 1)}%
                                {item.retentionRate > 50 ? 
                                  <TrendingUp className="h-4 w-4 ml-1 text-green-500" /> : 
                                  <TrendingDown className="h-4 w-4 ml-1 text-red-500" />
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">No-Shows</p>
                              <p className="text-xl font-semibold">{safeToFixed(item.noShowRate, 1)}%</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Revenue</p>
                              <p className="text-xl font-semibold">{safeFormatCurrency(item.totalRevenue)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Per Client</p>
                              <p className="text-xl font-semibold">{safeFormatCurrency(item.averageRevenuePerClient)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="studios">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studioMetrics.map((item, index) => (
                  <Card 
                    key={`studio-${item.location}-${index}`} 
                    className="shadow-sm hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => handleRowClick(item, 'location')}
                  >
                    <CardContent className="p-0">
                      <div className="p-4 border-b bg-muted/10">
                        <h3 className="text-lg font-semibold">{item.location}</h3>
                        <p className="text-sm text-muted-foreground">Studio Performance</p>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">New Clients</p>
                            <p className="text-xl font-semibold">{item.newClients}</p>
                          </div>
                          <div onClick={(e) => { e.stopPropagation(); handleMetricClick(item, 'conversion'); }}>
                            <p className="text-sm text-muted-foreground">Conversion</p>
                            <p className="text-xl font-semibold flex items-center">
                              {safeToFixed(item.conversionRate, 1)}%
                              {item.conversionRate > 10 ? 
                                <TrendingUp className="h-4 w-4 ml-1 text-green-500" /> : 
                                <TrendingDown className="h-4 w-4 ml-1 text-red-500" />
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Revenue</p>
                            <p className="text-xl font-semibold">{safeFormatCurrency(item.totalRevenue)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Drill Down Analytics Modal */}
      <DrillDownAnalytics 
        isOpen={isDrillDownOpen} 
        onClose={closeDrillDown} 
        data={selectedData} 
        type={drillDownType}
        metricType={metricType}
      />
    </div>
  );
};

export default ResultsTable;
