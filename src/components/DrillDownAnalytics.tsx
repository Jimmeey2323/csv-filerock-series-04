import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart as BarChartIcon, 
  LineChart as LineChartIcon, 
  LayoutDashboard, 
  ListFilter, 
  Table as TableIcon, 
  PieChart as PieChartIcon, 
  UserRound, 
  DollarSign, 
  Percent, 
  Calendar, 
  ArrowUpDown, 
  Users,
  TrendingUp,
  TrendingDown,
  Check,
  Clock,
  Info,
  CalendarCheck,
  X,
  Award,
  FileText,
  Filter,
  TableProperties
} from 'lucide-react';
import RevenueChart from '@/components/charts/RevenueChart';
import ConversionRatesChart from '@/components/charts/ConversionRatesChart';
import ClientSourceChart from '@/components/charts/ClientSourceChart';
import PivotTableBuilder from '@/components/PivotTableBuilder';
import { safeToFixed, safeFormatCurrency, safeFormatDate, daysBetweenDates } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Extend the ProcessedTeacherData interface to include excludedClientDetails
declare module '@/utils/dataProcessor' {
  interface ProcessedTeacherData {
    excludedClientDetails?: any[];
  }
}

interface DrillDownAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProcessedTeacherData | null;
  type: 'teacher' | 'studio' | 'location' | 'period' | 'totals';
  metricType?: 'conversion' | 'retention' | 'all';
}

const DrillDownAnalytics: React.FC<DrillDownAnalyticsProps> = ({
  isOpen,
  onClose,
  data,
  type,
  metricType = 'all'
}) => {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // Use the useEffect hook to update the active tab based on metricType
  React.useEffect(() => {
    if (metricType === 'conversion') {
      setActiveTab('conversion');
    } else if (metricType === 'retention') {
      setActiveTab('retention');
    } else {
      setActiveTab('overview');
    }
  }, [metricType]);
  
  if (!data) return null;

  // Format label based on type
  const getEntityLabel = () => {
    switch (type) {
      case 'teacher':
        return `Teacher: ${data.teacherName}`;
      case 'studio':
        return `Studio: All Studios`;
      case 'location':
        return `Location: ${data.location}`;
      case 'period':
        return `Period: ${data.period}`;
      case 'totals':
        return `Aggregate Data: All Teachers & Studios`;
      default:
        return data.teacherName;
    }
  };
  
  // Handle sorting columns
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Sort data based on column and direction
  const sortData = (data: any[]) => {
    if (!sortColumn || !data || data.length === 0) return data;
    
    return [...data].sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];
      
      // Handle dates
      if (typeof valueA === 'string' && typeof valueB === 'string' && 
          (sortColumn.toLowerCase().includes('date') || valueA.includes('-') || valueB.includes('-'))) {
        const dateA = new Date(valueA);
        const dateB = new Date(valueB);
        
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return sortDirection === 'asc' ? 
            dateA.getTime() - dateB.getTime() : 
            dateB.getTime() - dateA.getTime();
        }
      }
      
      // Handle numbers
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      // Handle strings
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' ? 
          valueA.localeCompare(valueB) : 
          valueB.localeCompare(valueA);
      }
      
      return 0;
    });
  };
  
  // Calculate conversion span
  const getConversionSpan = (client: any) => {
    const firstVisit = client.firstVisit || client.date;
    const firstPurchase = client.firstPurchaseDate || client.purchaseDate;
    
    if (firstVisit && firstPurchase) {
      const days = daysBetweenDates(firstVisit, firstPurchase);
      return days;
    }
    return null;
  };
  
  const renderClientTable = (clients: any[], title: string) => {
    // Sort the data if a sort column is selected
    const sortedClients = sortData(clients);
    
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            {title.includes('Converted') ? <Award className="h-4 w-4 text-emerald-500" /> : 
             title.includes('Retained') ? <Check className="h-4 w-4 text-blue-500" /> :
             title.includes('Excluded') ? <X className="h-4 w-4 text-red-500" /> :
             <UserRound className="h-4 w-4 text-primary" />}
            {title}
          </CardTitle>
          <CardDescription>
            {sortedClients.length} {title.toLowerCase()} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead sortable sortDirection={sortColumn === 'name' ? sortDirection : undefined} onSort={() => handleSort('name')}>
                    Name
                  </TableHead>
                  <TableHead sortable sortDirection={sortColumn === 'email' ? sortDirection : undefined} onSort={() => handleSort('email')}>
                    Email
                  </TableHead>
                  <TableHead sortable sortDirection={sortColumn === 'firstVisit' ? sortDirection : undefined} onSort={() => handleSort('firstVisit')}>
                    First Visit
                  </TableHead>
                  {(title.includes('Converted') || title.includes('New')) && <>
                    <TableHead sortable sortDirection={sortColumn === 'firstPurchaseDate' ? sortDirection : undefined} onSort={() => handleSort('firstPurchaseDate')}>
                      First Purchase Date
                    </TableHead>
                    <TableHead sortable sortDirection={sortColumn === 'firstPurchaseItem' ? sortDirection : undefined} onSort={() => handleSort('firstPurchaseItem')}>
                      First Purchase Item
                    </TableHead>
                    <TableHead sortable sortDirection={sortColumn === 'purchaseValue' ? sortDirection : undefined} onSort={() => handleSort('purchaseValue')}>
                      Purchase Value
                    </TableHead>
                    <TableHead sortable sortDirection={sortColumn === 'conversionSpan' ? sortDirection : undefined} onSort={() => handleSort('conversionSpan')}>
                      Conversion Span (days)
                    </TableHead>
                  </>}
                  {title.includes('Retained') && <>
                    <TableHead sortable sortDirection={sortColumn === 'visitsPostTrial' ? sortDirection : undefined} onSort={() => handleSort('visitsPostTrial')}>
                      Total Visits Post Trial
                    </TableHead>
                    <TableHead sortable sortDirection={sortColumn === 'firstVisitPostTrial' ? sortDirection : undefined} onSort={() => handleSort('firstVisitPostTrial')}>
                      First Visit Post Trial
                    </TableHead>
                    <TableHead sortable sortDirection={sortColumn === 'membershipUsed' ? sortDirection : undefined} onSort={() => handleSort('membershipUsed')}>
                      Membership Used
                    </TableHead>
                  </>}
                  {title.includes('Excluded') && (
                    <TableHead sortable sortDirection={sortColumn === 'reason' ? sortDirection : undefined} onSort={() => handleSort('reason')}>
                      Exclusion Reason
                    </TableHead>
                  )}
                  {title.includes('New') && !title.includes('Converted') && (
                    <TableHead sortable sortDirection={sortColumn === 'reason' ? sortDirection : undefined} onSort={() => handleSort('reason')}>
                      Inclusion Reason
                    </TableHead>
                  )}
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedClients.map((client, idx) => {
                  const conversionSpan = getConversionSpan(client);
                  
                  return (
                    <TableRow key={`${client.email || idx}-${idx}`} className="animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                      <TableCell className="font-medium">{client.name || client.customerName || 'N/A'}</TableCell>
                      <TableCell>{client.email || 'N/A'}</TableCell>
                      <TableCell>{safeFormatDate(client.firstVisit || client.date)}</TableCell>
                      {(title.includes('Converted') || title.includes('New')) && <>
                        <TableCell className="font-medium text-emerald-600">
                          {safeFormatDate(client.firstPurchaseDate || client.purchaseDate || client.date)}
                        </TableCell>
                        <TableCell>{client.firstPurchaseItem || client.purchaseItem || client.membershipType || 'N/A'}</TableCell>
                        <TableCell>{client.purchaseValue || client.value ? safeFormatCurrency(client.purchaseValue || client.value) : 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            {conversionSpan !== null ? `${conversionSpan} days` : 'N/A'}
                          </div>
                        </TableCell>
                      </>}
                      {title.includes('Retained') && <>
                        <TableCell>{client.visitsPostTrial || client.visitCount || client.totalVisitsPostTrial || '0'}</TableCell>
                        <TableCell>{safeFormatDate(client.firstVisitPostTrial || 'N/A')}</TableCell>
                        <TableCell>{client.membershipUsed || client.membershipType || 'N/A'}</TableCell>
                      </>}
                      {title.includes('Excluded') && (
                        <TableCell className="text-red-600">{client.reason || 'No reason specified'}</TableCell>
                      )}
                      {title.includes('New') && !title.includes('Converted') && (
                        <TableCell className="text-blue-600">{client.reason || 'First time visitor'}</TableCell>
                      )}
                      <TableCell>
                        <Badge 
                          variant={title.includes('Converted') ? 'conversion' : 
                                 title.includes('Retained') ? 'retention' : 
                                 title.includes('Excluded') ? 'excluded' : 'modern'}
                          className="animate-scale-in flex items-center gap-1"
                        >
                          {title.includes('Converted') ? <Award className="h-3 w-3" /> : 
                           title.includes('Retained') ? <Check className="h-3 w-3" /> : 
                           title.includes('Excluded') ? <X className="h-3 w-3" /> :
                           <UserRound className="h-3 w-3" />}
                          {title.includes('Converted') ? 'Converted' : 
                           title.includes('Retained') ? 'Retained' : 
                           title.includes('Excluded') ? 'Excluded' : 'New'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  // Create properly formatted data for ClientSourceChart
  const clientSourceData = [
    { source: 'Trials', count: data.trials || 0, fill: '#3b82f6' },
    { source: 'Referrals', count: data.referrals || 0, fill: '#10b981' },
    { source: 'Hosted', count: data.hosted || 0, fill: '#f59e0b' },
    { source: 'Influencer', count: data.influencerSignups || 0, fill: '#8b5cf6' },
    { source: 'Others', count: data.others || 0, fill: '#6b7280' }
  ].filter(item => item.count > 0);

  // Convert revenue data format for RevenueChart - create sample data if not available
  const revenueChartData = data.revenueByWeek && data.revenueByWeek.length > 0 
    ? data.revenueByWeek 
    : [
        { week: 'Week 1', revenue: data.totalRevenue ? data.totalRevenue * 0.2 : 0 },
        { week: 'Week 2', revenue: data.totalRevenue ? data.totalRevenue * 0.3 : 0 },
        { week: 'Week 3', revenue: data.totalRevenue ? data.totalRevenue * 0.25 : 0 },
        { week: 'Week 4', revenue: data.totalRevenue ? data.totalRevenue * 0.25 : 0 }
      ];

  // Create properly formatted ConversionRateData
  const conversionRateData = [{
    name: data.teacherName || 'Current Period',
    conversion: data.conversionRate || 0,
    retention: data.retentionRate || 0,
    trial: data.trials || 0,
    referral: data.referrals || 0,
    influencer: data.influencerSignups || 0
  }];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] p-0 overflow-hidden animate-scale-in">
        <DialogHeader className="sticky top-0 z-10 bg-background pt-6 px-6 shadow-sm">
          <DialogTitle className="text-2xl flex items-center gap-2">
            {type === 'teacher' ? <UserRound className="h-5 w-5 text-primary" /> :
             type === 'location' ? <LayoutDashboard className="h-5 w-5 text-primary" /> :
             <BarChartIcon className="h-5 w-5 text-primary" />}
            {getEntityLabel()} Analytics
          </DialogTitle>
          <DialogDescription>
            Detailed performance metrics and client data analysis
          </DialogDescription>
          <Separator className="mt-4" />
        </DialogHeader>
        
        <div className="px-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-4">
            <TabsList className="grid grid-cols-5 gap-4 mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <LayoutDashboard className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="conversion" className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <Percent className="h-4 w-4" />
                <span>Conversion</span>
              </TabsTrigger>
              <TabsTrigger value="retention" className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <UserRound className="h-4 w-4" />
                <span>Retention</span>
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <DollarSign className="h-4 w-4" />
                <span>Revenue</span>
              </TabsTrigger>
              <TabsTrigger value="pivot" className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '500ms' }}>
                <TableProperties className="h-4 w-4" />
                <span>Pivot Builder</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border-muted/60 bg-gradient-to-br from-card to-background animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Performance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-muted/40 animate-fade-in" style={{ animationDelay: '150ms' }}>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <UserRound className="h-4 w-4" />
                          New Clients
                        </span>
                        <span className="text-2xl font-bold">{data.newClients || 0}</span>
                      </div>
                      <div className="flex flex-col p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-muted/40 animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          Retained Clients
                        </span>
                        <span className="text-2xl font-bold flex items-center">
                          {data.retainedClients || 0} 
                          <Badge className="ml-2 flex items-center gap-1" variant={(data.retentionRate || 0) > 50 ? "retention" : "excluded"}>
                            {(data.retentionRate || 0) > 50 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {safeToFixed(data.retentionRate || 0, 1)}%
                          </Badge>
                        </span>
                      </div>
                      <div className="flex flex-col p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-muted/40 animate-fade-in" style={{ animationDelay: '250ms' }}>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          Converted Clients
                        </span>
                        <span className="text-2xl font-bold flex items-center">
                          {data.convertedClients || 0}
                          <Badge className="ml-2 flex items-center gap-1" variant={(data.conversionRate || 0) > 10 ? "conversion" : "excluded"}>
                            {(data.conversionRate || 0) > 10 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {safeToFixed(data.conversionRate || 0, 1)}%
                          </Badge>
                        </span>
                      </div>
                      <div className="flex flex-col p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-muted/40 animate-fade-in" style={{ animationDelay: '300ms' }}>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Total Revenue
                        </span>
                        <span className="text-2xl font-bold">{safeFormatCurrency(data.totalRevenue || 0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border-muted/60 animate-fade-in" style={{ animationDelay: '350ms' }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5 text-primary" />
                      Client Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    {clientSourceData.length > 0 ? (
                      <ClientSourceChart data={clientSourceData} />
                    ) : (
                      <div className="text-muted-foreground text-sm">No client source data available</div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card className="shadow-sm border-muted/60 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5 text-primary" />
                    Revenue by Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={revenueChartData} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="conversion" className="space-y-6">
              <Card className="shadow-sm border-muted/60 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Conversion Analysis
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of client conversion journey from trials to paid memberships
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex space-x-4">
                    <div className="flex-1 p-4 border border-muted/40 rounded-lg text-center bg-gradient-to-br from-muted/20 to-muted/5 shadow-sm animate-fade-in" style={{ animationDelay: '150ms' }}>
                      <h3 className="text-lg font-medium flex items-center justify-center gap-1">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        Conversion Rate
                      </h3>
                      <p className="text-3xl font-bold text-primary mt-2 flex items-center justify-center">
                        {data.conversionRate > 10 ? <TrendingUp className="h-5 w-5 mr-2 text-green-500" /> : <TrendingDown className="h-5 w-5 mr-2 text-red-500" />}
                        {safeToFixed(data.conversionRate, 1)}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {data.conversionRate > 10 ? 'Above average' : 'Below average'}
                      </p>
                    </div>
                    <div className="flex-1 p-4 border border-muted/40 rounded-lg text-center bg-gradient-to-br from-muted/20 to-muted/5 shadow-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
                      <h3 className="text-lg font-medium flex items-center justify-center gap-1">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        Converted Clients
                      </h3>
                      <p className="text-3xl font-bold mt-2">{data.convertedClients}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        out of {data.newClients} new clients
                      </p>
                    </div>
                    <div className="flex-1 p-4 border border-muted/40 rounded-lg text-center bg-gradient-to-br from-muted/20 to-muted/5 shadow-sm animate-fade-in" style={{ animationDelay: '250ms' }}>
                      <h3 className="text-lg font-medium flex items-center justify-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        Avg. Revenue
                      </h3>
                      <p className="text-3xl font-bold mt-2">{safeFormatCurrency(data.averageRevenuePerClient)}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        per converted client
                      </p>
                    </div>
                  </div>
                  
                  {data.convertedClientDetails && data.convertedClientDetails.length > 0 && 
                    renderClientTable(data.convertedClientDetails, "Converted Clients")}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="retention" className="space-y-6">
              <Card className="shadow-sm border-muted/60 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    Retention Analysis
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of client retention patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex space-x-4">
                    <div className="flex-1 p-4 border border-muted/40 rounded-lg text-center bg-gradient-to-br from-muted/20 to-muted/5 shadow-sm animate-fade-in" style={{ animationDelay: '150ms' }}>
                      <h3 className="text-lg font-medium flex items-center justify-center gap-1">
                        <Check className="h-4 w-4 text-muted-foreground" />
                        Retention Rate
                      </h3>
                      <p className="text-3xl font-bold text-primary mt-2 flex items-center justify-center">
                        {data.retentionRate > 50 ? <TrendingUp className="h-5 w-5 mr-2 text-green-500" /> : <TrendingDown className="h-5 w-5 mr-2 text-red-500" />}
                        {safeToFixed(data.retentionRate, 1)}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {data.retentionRate > 50 ? 'Above average' : 'Below average'}
                      </p>
                    </div>
                    <div className="flex-1 p-4 border border-muted/40 rounded-lg text-center bg-gradient-to-br from-muted/20 to-muted/5 shadow-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
                      <h3 className="text-lg font-medium flex items-center justify-center gap-1">
                        <UserRound className="h-4 w-4 text-muted-foreground" />
                        Retained Clients
                      </h3>
                      <p className="text-3xl font-bold mt-2">{data.retainedClients}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        out of total clients
                      </p>
                    </div>
                    <div className="flex-1 p-4 border border-muted/40 rounded-lg text-center bg-gradient-to-br from-muted/20 to-muted/5 shadow-sm animate-fade-in" style={{ animationDelay: '250ms' }}>
                      <h3 className="text-lg font-medium flex items-center justify-center gap-1">
                        <X className="h-4 w-4 text-muted-foreground" />
                        No Show Rate
                      </h3>
                      <p className="text-3xl font-bold mt-2 flex items-center justify-center">
                        {data.noShowRate < 10 ? <TrendingDown className="h-5 w-5 mr-2 text-green-500" /> : <TrendingUp className="h-5 w-5 mr-2 text-red-500" />}
                        {safeToFixed(data.noShowRate, 1)}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {data.noShowRate < 10 ? 'Good' : 'Needs improvement'}
                      </p>
                    </div>
                  </div>
                  
                  {data.retainedClientDetails && data.retainedClientDetails.length > 0 && 
                    renderClientTable(data.retainedClientDetails, "Retained Clients")}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="revenue" className="space-y-6">
              <Card className="shadow-sm border-muted/60 animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Revenue Analysis
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of revenue streams and financial performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border border-muted/40 rounded-lg text-center bg-gradient-to-br from-muted/20 to-muted/5 shadow-sm animate-fade-in" style={{ animationDelay: '150ms' }}>
                      <h3 className="text-lg font-medium flex items-center justify-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        Total Revenue
                      </h3>
                      <p className="text-3xl font-bold text-primary mt-2">{safeFormatCurrency(data.totalRevenue)}</p>
                    </div>
                    <div className="p-4 border border-muted/40 rounded-lg text-center bg-gradient-to-br from-muted/20 to-muted/5 shadow-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
                      <h3 className="text-lg font-medium flex items-center justify-center gap-1">
                        <UserRound className="h-4 w-4 text-muted-foreground" />
                        Revenue per Client
                      </h3>
                      <p className="text-3xl font-bold mt-2">{safeFormatCurrency(data.averageRevenuePerClient)}</p>
                    </div>
                    <div className="p-4 border border-muted/40 rounded-lg text-center bg-gradient-to-br from-muted/20 to-muted/5 shadow-sm animate-fade-in" style={{ animationDelay: '250ms' }}>
                      <h3 className="text-lg font-medium flex items-center justify-center gap-1">
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                        Revenue Trend
                      </h3>
                      <p className="text-3xl font-bold flex items-center justify-center gap-2 mt-2">
                        {data.revenueByWeek && data.revenueByWeek.length > 1 ? 
                          data.revenueByWeek[data.revenueByWeek.length - 1].revenue > data.revenueByWeek[data.revenueByWeek.length - 2].revenue ? 
                            <><TrendingUp className="h-5 w-5 text-green-500" /> <span className="text-green-500">Increasing</span></> : 
                            <><TrendingDown className="h-5 w-5 text-red-500" /> <span className="text-red-500">Decreasing</span></> 
                          : <span>Not enough data</span>} 
                      </p>
                    </div>
                  </div>
                  
                  <Card className="shadow-sm border-muted/60 bg-card/60 animate-fade-in" style={{ animationDelay: '300ms' }}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <LineChartIcon className="h-4 w-4 text-primary" />
                        Revenue by Week
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RevenueChart data={revenueChartData} />
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pivot" className="space-y-6">
              <PivotTableBuilder data={[data]} />
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="sticky bottom-0 bg-background p-6 border-t">
          <Button onClick={onClose} className="animate-scale-in">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DrillDownAnalytics;
