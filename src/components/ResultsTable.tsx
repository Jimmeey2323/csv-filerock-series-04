import React, { useMemo, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Sparkles, 
  User2, 
  Users2, 
  DollarSign, 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  LayoutDashboard, 
  MoreHorizontal, 
  Calendar,
  BarChart,
  PieChart,
  ListFilter
} from 'lucide-react';
import PerformanceMetricCard from '@/components/cards/PerformanceMetricCard';
import RevenueChart from '@/components/charts/RevenueChart';
import ClientDetailsModal from '@/components/ClientDetailsModal';
import DrillDownAnalytics from '@/components/DrillDownAnalytics';
import AdvancedFilters from '@/components/AdvancedFilters';
import TableViewOptions from '@/components/TableViewOptions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProcessedTeacherData } from '@/utils/dataProcessor';

interface ResultsTableProps {
  data: ProcessedTeacherData[];
  locations: string[];
  isLoading: boolean;
  viewMode: 'table' | 'cards' | 'detailed';
  dataMode: 'teacher' | 'studio';
  onFilterChange: (filters: { location?: string; teacher?: string; period?: string; search?: string; }) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  locations,
  isLoading,
  viewMode: initialViewMode,
  dataMode,
  onFilterChange
}) => {
  // State for the views and drill-down functionality
  const [viewMode, setViewMode] = useState<string>(initialViewMode);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientType, setClientType] = useState<'new' | 'retained' | 'converted'>('new');
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
  const [drillDownData, setDrillDownData] = useState<ProcessedTeacherData | null>(null);
  const [drillDownType, setDrillDownType] = useState<'teacher' | 'studio' | 'location' | 'period'>('teacher');
  const [drillDownMetricType, setDrillDownMetricType] = useState<'conversion' | 'retention' | 'all'>('all');
  
  // State for advanced table options
  const [activeGroupBy, setActiveGroupBy] = useState<string>(dataMode === 'teacher' ? 'teacher' : 'studio');
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: 'totalRevenue',
    direction: 'desc'
  });
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, any>>({});
  
  // Available columns and visible columns
  const allAvailableColumns = [
    'teacherName', 'location', 'period', 'newClients', 'retainedClients', 
    'retentionRate', 'convertedClients', 'conversionRate', 'totalRevenue',
    'trials', 'referrals', 'hosted', 'influencerSignups', 'others',
    'averageRevenuePerClient', 'noShowRate', 'lateCancellationRate'
  ];
  
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'teacherName', 'location', 'period', 'newClients', 'retainedClients', 
    'retentionRate', 'convertedClients', 'conversionRate', 'totalRevenue'
  ]);

  // Handlers for modals and drill-down
  const handleOpenClientModal = (teacherName: string, type: 'new' | 'retained' | 'converted') => {
    setSelectedTeacher(teacherName);
    setClientType(type);
    setIsClientModalOpen(true);
  };

  const handleCloseClientModal = () => {
    setIsClientModalOpen(false);
    setSelectedTeacher(null);
  };
  
  const handleRowClick = (item: ProcessedTeacherData) => {
    setDrillDownData(item);
    setDrillDownType(dataMode === 'teacher' ? 'teacher' : 'studio');
    setDrillDownMetricType('all');
    setIsDrillDownOpen(true);
  };
  
  const handleMetricClick = (item: ProcessedTeacherData, metricType: 'conversion' | 'retention') => {
    // Prevent event bubbling
    event?.stopPropagation();
    setDrillDownData(item);
    setDrillDownType(dataMode === 'teacher' ? 'teacher' : 'studio');
    setDrillDownMetricType(metricType);
    setIsDrillDownOpen(true);
  };
  
  const handleCloseDrillDown = () => {
    setIsDrillDownOpen(false);
    setDrillDownData(null);
  };
  
  // Handler for advanced filters
  const handleApplyAdvancedFilters = (filters: any) => {
    setAdvancedFilters(filters);
    // Here you would apply the filters to the data
    // This is a simplified version - in a real app you'd filter the data
    // based on all the criteria in the filters object
    if (filters.basic) {
      onFilterChange({
        location: filters.basic.location,
        teacher: filters.basic.teacher,
        period: filters.basic.period,
        search: filters.basic.search,
      });
    }
  };
  
  // Update the displayData to handle studio view and sorting
  const displayData = useMemo(() => {
    let filteredData = dataMode === 'studio' 
      ? data.filter(item => item.teacherName === 'All Teachers')
      : data.filter(item => item.teacherName !== 'All Teachers');
    
    // Apply sorting
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.column as keyof ProcessedTeacherData];
      const bValue = b[sortConfig.column as keyof ProcessedTeacherData];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  }, [data, dataMode, sortConfig]);
  
  // Calculate totals for the footer
  const totals = useMemo(() => {
    return displayData.reduce((acc, item) => {
      return {
        newClients: acc.newClients + item.newClients,
        retainedClients: acc.retainedClients + item.retainedClients,
        convertedClients: acc.convertedClients + item.convertedClients,
        totalRevenue: acc.totalRevenue + item.totalRevenue,
        // Calculate averaged percentages correctly by summing the products
        retentionRateSum: acc.retentionRateSum + (item.retentionRate * item.retainedClients),
        conversionRateSum: acc.conversionRateSum + (item.conversionRate * item.convertedClients),
        noShowRateSum: acc.noShowRateSum + (item.noShowRate * item.newClients),
        lateCancellationRateSum: acc.lateCancellationRateSum + (item.lateCancellationRate * item.newClients),
      };
    }, {
      newClients: 0,
      retainedClients: 0,
      convertedClients: 0,
      totalRevenue: 0,
      retentionRateSum: 0,
      conversionRateSum: 0,
      noShowRateSum: 0,
      lateCancellationRateSum: 0,
    });
  }, [displayData]);
  
  // Calculate average rates
  const avgRetentionRate = totals.retainedClients > 0 
    ? totals.retentionRateSum / totals.retainedClients 
    : 0;
    
  const avgConversionRate = totals.convertedClients > 0 
    ? totals.conversionRateSum / totals.convertedClients 
    : 0;
    
  const avgNoShowRate = totals.newClients > 0 
    ? totals.noShowRateSum / totals.newClients 
    : 0;
    
  const avgLateCancellationRate = totals.newClients > 0 
    ? totals.lateCancellationRateSum / totals.newClients 
    : 0;

  // Helper for getting client details
  const getClientsForType = (type: 'new' | 'retained' | 'converted') => {
    if (!selectedTeacher) return [];
    
    const selectedData = data.find(item => 
      (item.teacherName === selectedTeacher || item.location === selectedTeacher) &&
      (dataMode === 'teacher' ? item.teacherName === selectedTeacher : item.location === selectedTeacher)
    );
    
    if (!selectedData) return [];

    switch (type) {
      case 'new': return selectedData.newClientDetails;
      case 'retained': return selectedData.retainedClientDetails;
      case 'converted': return selectedData.convertedClientDetails;
      default: return [];
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (data.length === 0) {
    return <p>No data available.</p>;
  }
  
  // Components for different views
  const renderTableView = () => (
    <Card className="bg-white shadow-sm rounded-lg overflow-hidden">
      <CardHeader className="bg-muted/20 pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Performance Data</span>
          <AdvancedFilters 
            locations={locations}
            teachers={displayData.map(item => item.teacherName)}
            periods={Array.from(new Set(displayData.map(item => item.period)))}
            onApplyFilters={handleApplyAdvancedFilters}
            activeFilters={advancedFilters}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.includes('teacherName') && (
                  <TableHead className="w-[200px]">
                    {dataMode === 'teacher' ? 'Teacher' : 'Studio'}
                  </TableHead>
                )}
                {visibleColumns.includes('location') && (
                  <TableHead>Location</TableHead>
                )}
                {visibleColumns.includes('period') && (
                  <TableHead>Period</TableHead>
                )}
                {visibleColumns.includes('newClients') && (
                  <TableHead className="text-center">New Clients</TableHead>
                )}
                {visibleColumns.includes('retainedClients') && (
                  <TableHead className="text-center">Retained Clients</TableHead>
                )}
                {visibleColumns.includes('retentionRate') && (
                  <TableHead className="text-center">Retention Rate</TableHead>
                )}
                {visibleColumns.includes('convertedClients') && (
                  <TableHead className="text-center">Converted Clients</TableHead>
                )}
                {visibleColumns.includes('conversionRate') && (
                  <TableHead className="text-center">Conversion Rate</TableHead>
                )}
                {visibleColumns.includes('totalRevenue') && (
                  <TableHead className="text-center">Total Revenue</TableHead>
                )}
                {visibleColumns.includes('trials') && (
                  <TableHead className="text-center">Trials</TableHead>
                )}
                {visibleColumns.includes('referrals') && (
                  <TableHead className="text-center">Referrals</TableHead>
                )}
                {visibleColumns.includes('hosted') && (
                  <TableHead className="text-center">Hosted Events</TableHead>
                )}
                {visibleColumns.includes('influencerSignups') && (
                  <TableHead className="text-center">Influencer Signups</TableHead>
                )}
                {visibleColumns.includes('others') && (
                  <TableHead className="text-center">Others</TableHead>
                )}
                {visibleColumns.includes('averageRevenuePerClient') && (
                  <TableHead className="text-center">Avg. Revenue/Client</TableHead>
                )}
                {visibleColumns.includes('noShowRate') && (
                  <TableHead className="text-center">No Show Rate</TableHead>
                )}
                {visibleColumns.includes('lateCancellationRate') && (
                  <TableHead className="text-center">Late Cancellation Rate</TableHead>
                )}
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((item) => (
                <TableRow 
                  key={`${item.teacherName}-${item.location}-${item.period}`}
                  isClickable={true}
                  onClick={() => handleRowClick(item)}
                >
                  {visibleColumns.includes('teacherName') && (
                    <TableCell className="font-medium">{dataMode === 'teacher' ? item.teacherName : item.location}</TableCell>
                  )}
                  {visibleColumns.includes('location') && (
                    <TableCell>{item.location}</TableCell>
                  )}
                  {visibleColumns.includes('period') && (
                    <TableCell>{item.period}</TableCell>
                  )}
                  {visibleColumns.includes('newClients') && (
                    <TableCell className="text-center">{item.newClients}</TableCell>
                  )}
                  {visibleColumns.includes('retainedClients') && (
                    <TableCell className="text-center">{item.retainedClients}</TableCell>
                  )}
                  {visibleColumns.includes('retentionRate') && (
                    <TableCell className="text-center">
                      <Badge 
                        variant={item.retentionRate > 50 ? "outline" : "destructive"} 
                        className="cursor-pointer hover:bg-muted"
                        onClick={(e) => handleMetricClick(item, 'retention')}
                      >
                        {item.retentionRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.includes('convertedClients') && (
                    <TableCell className="text-center">{item.convertedClients}</TableCell>
                  )}
                  {visibleColumns.includes('conversionRate') && (
                    <TableCell className="text-center">
                      <Badge 
                        variant={item.conversionRate > 10 ? "outline" : "destructive"} 
                        className="cursor-pointer hover:bg-muted"
                        onClick={(e) => handleMetricClick(item, 'conversion')}
                      >
                        {item.conversionRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.includes('totalRevenue') && (
                    <TableCell className="text-center">₹{item.totalRevenue.toLocaleString()}</TableCell>
                  )}
                  {visibleColumns.includes('trials') && (
                    <TableCell className="text-center">{item.trials}</TableCell>
                  )}
                  {visibleColumns.includes('referrals') && (
                    <TableCell className="text-center">{item.referrals}</TableCell>
                  )}
                  {visibleColumns.includes('hosted') && (
                    <TableCell className="text-center">{item.hosted}</TableCell>
                  )}
                  {visibleColumns.includes('influencerSignups') && (
                    <TableCell className="text-center">{item.influencerSignups}</TableCell>
                  )}
                  {visibleColumns.includes('others') && (
                    <TableCell className="text-center">{item.others}</TableCell>
                  )}
                  {visibleColumns.includes('averageRevenuePerClient') && (
                    <TableCell className="text-center">
                      ₹{item.averageRevenuePerClient.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </TableCell>
                  )}
                  {visibleColumns.includes('noShowRate') && (
                    <TableCell className="text-center">{item.noShowRate.toFixed(1)}%</TableCell>
                  )}
                  {visibleColumns.includes('lateCancellationRate') && (
                    <TableCell className="text-center">{item.lateCancellationRate.toFixed(1)}%</TableCell>
                  )}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleOpenClientModal(dataMode === 'teacher' ? item.teacherName : item.location, 'new');
                        }}>
                          <User2 className="mr-2 h-4 w-4" />
                          View New Clients
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleOpenClientModal(dataMode === 'teacher' ? item.teacherName : item.location, 'retained');
                        }}>
                          <Users2 className="mr-2 h-4 w-4" />
                          View Retained Clients
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleOpenClientModal(dataMode === 'teacher' ? item.teacherName : item.location, 'converted');
                        }}>
                          <FileText className="mr-2 h-4 w-4" />
                          View Converted Clients
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(item);
                        }}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          View Detailed Analytics
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-primary text-primary-foreground">
              <TableRow>
                {visibleColumns.includes('teacherName') && (
                  <TableCell className="font-bold">TOTALS</TableCell>
                )}
                {visibleColumns.includes('location') && (
                  <TableCell></TableCell>
                )}
                {visibleColumns.includes('period') && (
                  <TableCell></TableCell>
                )}
                {visibleColumns.includes('newClients') && (
                  <TableCell className="text-center font-bold">{totals.newClients}</TableCell>
                )}
                {visibleColumns.includes('retainedClients') && (
                  <TableCell className="text-center font-bold">{totals.retainedClients}</TableCell>
                )}
                {visibleColumns.includes('retentionRate') && (
                  <TableCell className="text-center font-bold">{avgRetentionRate.toFixed(1)}%</TableCell>
                )}
                {visibleColumns.includes('convertedClients') && (
                  <TableCell className="text-center font-bold">{totals.convertedClients}</TableCell>
                )}
                {visibleColumns.includes('conversionRate') && (
                  <TableCell className="text-center font-bold">{avgConversionRate.toFixed(1)}%</TableCell>
                )}
                {visibleColumns.includes('totalRevenue') && (
                  <TableCell className="text-center font-bold">₹{totals.totalRevenue.toLocaleString()}</TableCell>
                )}
                {visibleColumns.includes('trials') && (
                  <TableCell className="text-center font-bold">
                    {displayData.reduce((sum, item) => sum + item.trials, 0)}
                  </TableCell>
                )}
                {visibleColumns.includes('referrals') && (
                  <TableCell className="text-center font-bold">
                    {displayData.reduce((sum, item) => sum + item.referrals, 0)}
                  </TableCell>
                )}
                {visibleColumns.includes('hosted') && (
                  <TableCell className="text-center font-bold">
                    {displayData.reduce((sum, item) => sum + item.hosted, 0)}
                  </TableCell>
                )}
                {visibleColumns.includes('influencerSignups') && (
                  <TableCell className="text-center font-bold">
                    {displayData.reduce((sum, item) => sum + item.influencerSignups, 0)}
                  </TableCell>
                )}
                {visibleColumns.includes('others') && (
                  <TableCell className="text-center font-bold">
                    {displayData.reduce((sum, item) => sum + item.others, 0)}
                  </TableCell>
                )}
                {visibleColumns.includes('averageRevenuePerClient') && (
                  <TableCell className="text-center font-bold">
                    ₹{(totals.totalRevenue / totals.newClients).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                )}
                {visibleColumns.includes('noShowRate') && (
                  <TableCell className="text-center font-bold">
                    {avgNoShowRate.toFixed(1)}%
                  </TableCell>
                )}
                {visibleColumns.includes('lateCancellationRate') && (
                  <TableCell className="text-center font-bold">
                    {avgLateCancellationRate.toFixed(1)}%
                  </TableCell>
                )}
                <TableCell></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
  
  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayData.map((item) => (
        <Card 
          key={`${item.teacherName}-${item.location}-${item.period}`} 
          className="bg-white/70 backdrop-blur-sm hover:shadow-md cursor-pointer transition-all"
          onClick={() => handleRowClick(item)}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${item.teacherName}`} />
                  <AvatarFallback>{item.teacherName.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{dataMode === 'teacher' ? item.teacherName : item.location}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.location} - {item.period}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleOpenClientModal(dataMode === 'teacher' ? item.teacherName : item.location, 'new');
                  }}>
                    <User2 className="mr-2 h-4 w-4" />
                    View New Clients
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleOpenClientModal(dataMode === 'teacher' ? item.teacherName : item.location, 'retained');
                  }}>
                    <Users2 className="mr-2 h-4 w-4" />
                    View Retained Clients
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleOpenClientModal(dataMode === 'teacher' ? item.teacherName : item.location, 'converted');
                  }}>
                    <FileText className="mr-2 h-4 w-4" />
                    View Converted Clients
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(item);
                  }}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    View Detailed Analytics
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <PerformanceMetricCard
                title="New Clients"
                value={item.newClients.toString()}
                icon={<User2 className="h-4 w-4 text-blue-500" />}
                tooltip="Number of new clients acquired"
              />
              <PerformanceMetricCard
                title="Retained Clients"
                value={item.retainedClients.toString()}
                secondaryValue={`${item.retentionRate.toFixed(1)}%`}
                icon={<Users2 className="h-4 w-4 text-green-500" />}
                status={item.retentionRate > 50 ? 'positive' : item.retentionRate < 30 ? 'negative' : 'neutral'}
                tooltip="Number of clients retained"
                onCustomClick={(e) => {
                  e.stopPropagation();
                  handleMetricClick(item, 'retention');
                }}
              />
              <PerformanceMetricCard
                title="Converted Clients"
                value={item.convertedClients.toString()}
                secondaryValue={`${item.conversionRate.toFixed(1)}%`}
                icon={<Sparkles className="h-4 w-4 text-purple-500" />}
                status={item.conversionRate > 10 ? 'positive' : item.conversionRate < 5 ? 'negative' : 'neutral'}
                tooltip="Number of clients converted"
                onCustomClick={(e) => {
                  e.stopPropagation();
                  handleMetricClick(item, 'conversion');
                }}
              />
              <PerformanceMetricCard
                title="Total Revenue"
                value={`₹${item.totalRevenue.toLocaleString()}`}
                icon={<DollarSign className="h-4 w-4 text-amber-500" />}
                tooltip="Total revenue generated"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderDetailed = () => (
    <div className="grid grid-cols-1 gap-6">
      {displayData.map((item) => (
        <Card 
          key={`${item.teacherName}-${item.location}-${item.period}`} 
          className="bg-white/70 backdrop-blur-sm hover:shadow-md cursor-pointer transition-all"
          onClick={() => handleRowClick(item)}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{dataMode === 'teacher' ? item.teacherName : item.location}</p>
                <p className="text-sm text-muted-foreground">
                  {item.location} - {item.period}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleOpenClientModal(dataMode === 'teacher' ? item.teacherName : item.location, 'new');
                  }}>
                    <User2 className="mr-2 h-4 w-4" />
                    View New Clients
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleOpenClientModal(dataMode === 'teacher' ? item.teacherName : item.location, 'retained');
                  }}>
                    <Users2 className="mr-2 h-4 w-4" />
                    View Retained Clients
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleOpenClientModal(dataMode === 'teacher' ? item.teacherName : item.location, 'converted');
                  }}>
                    <FileText className="mr-2 h-4 w-4" />
                    View Converted Clients
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleRowClick(item);
                  }}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    View Detailed Analytics
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-semibold mb-2">Client Acquisition</h3>
              <div className="grid grid-cols-2 gap-4">
                <PerformanceMetricCard
                  title="New Clients"
                  value={item.newClients.toString()}
                  icon={<User2 className="h-4 w-4 text-blue-500" />}
                  tooltip="Number of new clients acquired"
                />
                <PerformanceMetricCard
                  title="Trials"
                  value={item.trials.toString()}
                  icon={<FileText className="h-4 w-4 text-gray-500" />}
                  tooltip="Number of trial clients"
                />
                <PerformanceMetricCard
                  title="Referrals"
                  value={item.referrals.toString()}
                  icon={<Users2 className="h-4 w-4 text-sky-500" />}
                  tooltip="Number of clients from referrals"
                />
                <PerformanceMetricCard
                  title="Hosted Events"
                  value={item.hosted.toString()}
                  icon={<LayoutDashboard className="h-4 w-4 text-orange-500" />}
                  tooltip="Number of clients from hosted events"
                />
                <PerformanceMetricCard
                  title="Influencer Signups"
                  value={item.influencerSignups.toString()}
                  icon={<TrendingUp className="h-4 w-4 text-pink-500" />}
                  tooltip="Number of clients from influencer signups"
                />
                <PerformanceMetricCard
                  title="Others"
                  value={item.others.toString()}
                  icon={<MoreHorizontal className="h-4 w-4 text-zinc-500" />}
                  tooltip="Number of clients from other sources"
                />
              </div>
            </div>
            <div>
              <h3 className="text-md font-semibold mb-2">Client Retention & Conversion</h3>
              <div className="grid grid-cols-2 gap-4">
                <PerformanceMetricCard
                  title="Retained Clients"
                  value={item.retainedClients.toString()}
                  secondaryValue={`${item.retentionRate.toFixed(1)}%`}
                  icon={<Users2 className="h-4 w-4 text-green-500" />}
                  status={item.retentionRate > 50 ? 'positive' : item.retentionRate < 30 ? 'negative' : 'neutral'}
                  tooltip="Number of clients retained"
                  onCustomClick={(e) => {
                    e.stopPropagation();
                    handleMetricClick(item, 'retention');
                  }}
                />
                <PerformanceMetricCard
                  title="Converted Clients"
                  value={item.convertedClients.toString()}
                  secondaryValue={`${item.conversionRate.toFixed(1)}%`}
                  icon={<Sparkles className="h-4 w-4 text-purple-500" />}
                  status={item.conversionRate > 10 ? 'positive' : item.conversionRate < 5 ? 'negative' : 'neutral'}
                  tooltip="Number of clients converted"
                  onCustomClick={(e) => {
                    e.stopPropagation();
                    handleMetricClick(item, 'conversion');
                  }}
                />
                <PerformanceMetricCard
                  title="Total Revenue"
                  value={`₹${item.totalRevenue.toLocaleString()}`}
                  icon={<DollarSign className="h-4 w-4 text-amber-500" />}
                  tooltip="Total revenue generated"
                />
                <PerformanceMetricCard
                  title="Avg. Revenue/Client"
                  value={`₹${item.averageRevenuePerClient.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  icon={<Percent className="h-4 w-4 text-teal-500" />}
                  tooltip="Average revenue per client"
                />
                <PerformanceMetricCard
                  title="No Show Rate"
                  value={`${item.noShowRate.toFixed(1)}%`}
                  icon={<TrendingDown className="h-4 w-4 text-red-500" />}
                  tooltip="No show rate"
                />
                <PerformanceMetricCard
                  title="Late Cancellation Rate"
                  value={`${item.lateCancellationRate.toFixed(1)}%`}
                  icon={<TrendingDown className="h-4 w-4 text-orange-500" />}
                  tooltip="Late cancellation rate"
                />
              </div>
            </div>
            <div className="col-span-full">
              <h3 className="text-md font-semibold mb-2">Revenue by Week</h3>
              <RevenueChart data={item.revenueByWeek || []} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  const renderAnalytics = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm font-medium">Total New Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totals.newClients}</div>
                <p className="text-xs text-muted-foreground">Across all teachers/studios</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm font-medium">Avg. Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgRetentionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Weighted average</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm font-medium">Avg. Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Weighted average</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totals.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across all data</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {/* Bar chart would go here - using placeholder */}
                <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
                  <BarChart className="h-16 w-16 text-muted-foreground" />
                  <p className="ml-2 text-muted-foreground">Performance Bar Chart</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {/* Here we would include a specialized chart, using placeholder for now */}
                <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
                  <PieChart className="h-16 w-16 text-muted-foreground" />
                  <p className="ml-2 text-muted-foreground">Revenue Distribution Chart</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const renderCalendarView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Calendar View</CardTitle>
      </CardHeader>
      <CardContent className="h-[600px]">
        <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
          <Calendar className="h-16 w-16 text-muted-foreground" />
          <p className="ml-2 text-muted-foreground">Calendar View (Coming Soon)</p>
        </div>
      </CardContent>
    </Card>
  );
  
  const renderTrendsView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
      </CardHeader>
      <CardContent className="h-[600px]">
        <div className="h-full flex items-center justify-center bg-muted/20 rounded-md">
          <BarChart className="h-16 w-16 text-muted-foreground" />
          <p className="ml-2 text-muted-foreground">Trends View (Coming Soon)</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Table options and view mode selector */}
      <TableViewOptions
        activeView={viewMode}
        onViewChange={setViewMode}
        onGroupByChange={setActiveGroupBy}
        onVisibilityChange={setVisibleColumns}
        onSortChange={(column, direction) => setSortConfig({ column, direction })}
        availableColumns={allAvailableColumns}
        visibleColumns={visibleColumns}
        activeGroupBy={activeGroupBy}
        activeSort={sortConfig}
      />
      
      {/* Render the appropriate view based on viewMode */}
      {viewMode === 'table' && renderTableView()}
      {viewMode === 'cards' && renderCards()}
      {viewMode === 'detailed' && renderDetailed()}
      {viewMode === 'analytics' && renderAnalytics()}
      {viewMode === 'calendar' && renderCalendarView()}
      {viewMode === 'trends' && renderTrendsView()}
      
      {/* Modals */}
      <ClientDetailsModal
        isOpen={isClientModalOpen}
        onClose={handleCloseClientModal}
        title={`${selectedTeacher ? selectedTeacher : 'Clients'} - ${clientType.charAt(0).toUpperCase() + clientType.slice(1)}`}
        description={`Details of ${clientType} clients for ${selectedTeacher}`}
        clients={getClientsForType(clientType)}
        type={clientType}
      />
      
      <DrillDownAnalytics
        isOpen={isDrillDownOpen}
        onClose={handleCloseDrillDown}
        data={drillDownData}
        type={drillDownType}
        metricType={drillDownMetricType}
      />
    </div>
  );
};

export default ResultsTable;
