
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
  Filter
} from 'lucide-react';
import RevenueChart from '@/components/charts/RevenueChart';
import ConversionRatesChart from '@/components/charts/ConversionRatesChart';
import ClientSourceChart from '@/components/charts/ClientSourceChart';
import { safeToFixed, safeFormatCurrency, safeFormatDate, daysBetweenDates } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const sortData = (data: any[]) => {
    if (!sortColumn || !data || data.length === 0) return data;
    
    return [...data].sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];
      
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
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' ? 
          valueA.localeCompare(valueB) : 
          valueB.localeCompare(valueA);
      }
      
      return 0;
    });
  };
  
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
    const sortedClients = sortData(clients);
    
    return (
      <Card className="w-full shadow-xl border-0 bg-gradient-to-br from-white via-white to-slate-50/30 backdrop-blur-xl overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-slate-900/95 to-slate-800/95 text-white border-b-0">
          <CardTitle className="text-lg flex items-center gap-3">
            {title.includes('Converted') ? <Award className="h-5 w-5 text-emerald-400" /> : 
             title.includes('Retained') ? <Check className="h-5 w-5 text-blue-400" /> :
             title.includes('Excluded') ? <X className="h-5 w-5 text-red-400" /> :
             <UserRound className="h-5 w-5 text-primary" />}
            <span className="font-bold">{title}</span>
            <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-white/30">
              {sortedClients.length} {title.toLowerCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200/50 bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead sortable sortDirection={sortColumn === 'name' ? sortDirection : undefined} onSort={() => handleSort('name')} className="text-slate-700 font-semibold">
                    Name
                  </TableHead>
                  <TableHead sortable sortDirection={sortColumn === 'email' ? sortDirection : undefined} onSort={() => handleSort('email')} className="text-slate-700 font-semibold">
                    Email
                  </TableHead>
                  <TableHead sortable sortDirection={sortColumn === 'firstVisit' ? sortDirection : undefined} onSort={() => handleSort('firstVisit')} className="text-slate-700 font-semibold">
                    First Visit
                  </TableHead>
                  {(title.includes('Converted') || title.includes('New')) && <>
                    <TableHead sortable sortDirection={sortColumn === 'firstPurchaseDate' ? sortDirection : undefined} onSort={() => handleSort('firstPurchaseDate')} className="text-slate-700 font-semibold">
                      First Purchase Date
                    </TableHead>
                    <TableHead sortable sortDirection={sortColumn === 'firstPurchaseItem' ? sortDirection : undefined} onSort={() => handleSort('firstPurchaseItem')} className="text-slate-700 font-semibold">
                      First Purchase Item
                    </TableHead>
                    <TableHead sortable sortDirection={sortColumn === 'purchaseValue' ? sortDirection : undefined} onSort={() => handleSort('purchaseValue')} className="text-slate-700 font-semibold">
                      Purchase Value
                    </TableHead>
                    <TableHead sortable sortDirection={sortColumn === 'conversionSpan' ? sortDirection : undefined} onSort={() => handleSort('conversionSpan')} className="text-slate-700 font-semibold">
                      Conversion Span (days)
                    </TableHead>
                  </>}
                  {title.includes('Retained') && <>
                    <TableHead sortable sortDirection={sortColumn === 'visitsPostTrial' ? sortDirection : undefined} onSort={() => handleSort('visitsPostTrial')} className="text-slate-700 font-semibold">
                      Total Visits Post Trial
                    </TableHead>
                    <TableHead sortable sortDirection={sortColumn === 'firstVisitPostTrial' ? sortDirection : undefined} onSort={() => handleSort('firstVisitPostTrial')} className="text-slate-700 font-semibold">
                      First Visit Post Trial
                    </TableHead>
                    <TableHead sortable sortDirection={sortColumn === 'membershipUsed' ? sortDirection : undefined} onSort={() => handleSort('membershipUsed')} className="text-slate-700 font-semibold">
                      Membership Used
                    </TableHead>
                  </>}
                  {title.includes('Excluded') && (
                    <TableHead sortable sortDirection={sortColumn === 'reason' ? sortDirection : undefined} onSort={() => handleSort('reason')} className="text-slate-700 font-semibold">
                      Exclusion Reason
                    </TableHead>
                  )}
                  {title.includes('New') && !title.includes('Converted') && (
                    <TableHead sortable sortDirection={sortColumn === 'reason' ? sortDirection : undefined} onSort={() => handleSort('reason')} className="text-slate-700 font-semibold">
                      Inclusion Reason
                    </TableHead>
                  )}
                  <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedClients.map((client, idx) => {
                  const conversionSpan = getConversionSpan(client);
                  
                  return (
                    <TableRow key={`${client.email}-${idx}`} className="animate-fade-in border-b border-slate-100/50 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/20 transition-all duration-300" style={{ animationDelay: `${idx * 30}ms` }}>
                      <TableCell className="font-medium text-slate-800">{client.name || client.customerName || 'N/A'}</TableCell>
                      <TableCell className="text-slate-600">{client.email || 'N/A'}</TableCell>
                      <TableCell className="text-slate-600">{safeFormatDate(client.firstVisit || client.date)}</TableCell>
                      {(title.includes('Converted') || title.includes('New')) && <>
                        <TableCell className="font-medium text-emerald-700">
                          {safeFormatDate(client.firstPurchaseDate || client.purchaseDate || client.date)}
                        </TableCell>
                        <TableCell className="text-slate-600">{client.firstPurchaseItem || client.purchaseItem || client.membershipType || 'N/A'}</TableCell>
                        <TableCell className="font-semibold text-green-700">{client.purchaseValue || client.value ? safeFormatCurrency(client.purchaseValue || client.value) : 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex items-center text-slate-600">
                            <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                            {conversionSpan !== null ? `${conversionSpan} days` : 'N/A'}
                          </div>
                        </TableCell>
                      </>}
                      {title.includes('Retained') && <>
                        <TableCell className="text-slate-600">{client.visitsPostTrial || client.visitCount || client.totalVisitsPostTrial || '0'}</TableCell>
                        <TableCell className="text-slate-600">{safeFormatDate(client.firstVisitPostTrial || 'N/A')}</TableCell>
                        <TableCell className="text-slate-600">{client.membershipUsed || client.membershipType || 'N/A'}</TableCell>
                      </>}
                      {title.includes('Excluded') && (
                        <TableCell className="text-red-600 font-medium">{client.reason || 'No reason specified'}</TableCell>
                      )}
                      {title.includes('New') && !title.includes('Converted') && (
                        <TableCell className="text-blue-600 font-medium">{client.reason || 'First time visitor'}</TableCell>
                      )}
                      <TableCell>
                        <Badge 
                          variant={title.includes('Converted') ? 'conversion' : 
                                 title.includes('Retained') ? 'retention' : 
                                 title.includes('Excluded') ? 'excluded' : 'modern'}
                          className="animate-scale-in flex items-center gap-1 shadow-sm"
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
              <TableFooter>
                <TableRow className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 text-white border-t-2 border-white/20">
                  <TableCell colSpan={100} className="text-center font-bold py-3">
                    Total Records: {sortedClients.length}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  const clientSourceData = [{
    source: 'Trials',
    count: data.trials || 0
  }, {
    source: 'Referrals',
    count: data.referrals || 0
  }, {
    source: 'Hosted',
    count: data.hosted || 0
  }, {
    source: 'Influencer',
    count: data.influencerSignups || 0
  }, {
    source: 'Others',
    count: data.others || 0
  }];

  const revenueChartData = data.revenueByWeek || [];

  const conversionRateData = {
    name: 'Current Period',
    conversion: data.conversionRate,
    retention: data.retentionRate,
    trial: data.trials || 0,
    referral: data.referrals || 0,
    influencer: data.influencerSignups || 0
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[85vh] p-0 overflow-hidden animate-scale-in bg-gradient-to-br from-white via-slate-50/90 to-blue-50/80 backdrop-blur-xl border-0 shadow-2xl">
        <DialogHeader className="sticky top-0 z-10 bg-gradient-to-r from-slate-900/95 to-slate-800/95 text-white pt-6 px-6 shadow-xl border-b-0">
          <DialogTitle className="text-2xl flex items-center gap-3 font-bold">
            {type === 'teacher' ? <UserRound className="h-6 w-6 text-blue-400" /> :
             type === 'location' ? <LayoutDashboard className="h-6 w-6 text-green-400" /> :
             <BarChartIcon className="h-6 w-6 text-purple-400" />}
            {getEntityLabel()} Analytics
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-base">
            Comprehensive performance metrics and detailed client journey analysis
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 overflow-auto flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="pt-6">
            <TabsList className="grid grid-cols-5 gap-2 mb-8 bg-white/70 backdrop-blur-sm border border-white/30 shadow-lg rounded-xl p-1">
              <TabsTrigger value="overview" className="flex items-center gap-2 animate-fade-in data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300" style={{ animationDelay: '100ms' }}>
                <LayoutDashboard className="h-4 w-4" />
                <span className="font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="conversion" className="flex items-center gap-2 animate-fade-in data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300" style={{ animationDelay: '200ms' }}>
                <Percent className="h-4 w-4" />
                <span className="font-medium">Conversion</span>
              </TabsTrigger>
              <TabsTrigger value="retention" className="flex items-center gap-2 animate-fade-in data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300" style={{ animationDelay: '300ms' }}>
                <UserRound className="h-4 w-4" />
                <span className="font-medium">Retention</span>
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center gap-2 animate-fade-in data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300" style={{ animationDelay: '400ms' }}>
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">Revenue</span>
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2 animate-fade-in data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-300" style={{ animationDelay: '500ms' }}>
                <ArrowUpDown className="h-4 w-4" />
                <span className="font-medium">Data Details</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="shadow-xl border-0 bg-gradient-to-br from-white/90 to-slate-50/60 backdrop-blur-xl animate-fade-in">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Award className="h-6 w-6 text-primary" />
                      Performance Dashboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex flex-col p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 rounded-xl border border-blue-200/40 shadow-lg animate-fade-in" style={{ animationDelay: '150ms' }}>
                        <span className="text-sm text-blue-700 flex items-center gap-2 font-semibold mb-2">
                          <UserRound className="h-4 w-4" />
                          New Clients
                        </span>
                        <span className="text-3xl font-bold text-blue-800">{data.newClients}</span>
                      </div>
                      <div className="flex flex-col p-6 bg-gradient-to-br from-emerald-50/80 to-green-50/60 rounded-xl border border-green-200/40 shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <span className="text-sm text-green-700 flex items-center gap-2 font-semibold mb-2">
                          <Check className="h-4 w-4" />
                          Retained Clients
                        </span>
                        <span className="text-3xl font-bold text-green-800 flex items-center gap-2">
                          {data.retainedClients} 
                          <Badge className="text-xs" variant={data.retentionRate > 50 ? "retention" : "excluded"}>
                            {data.retentionRate > 50 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {safeToFixed(data.retentionRate, 1)}%
                          </Badge>
                        </span>
                      </div>
                      <div className="flex flex-col p-6 bg-gradient-to-br from-amber-50/80 to-yellow-50/60 rounded-xl border border-amber-200/40 shadow-lg animate-fade-in" style={{ animationDelay: '250ms' }}>
                        <span className="text-sm text-amber-700 flex items-center gap-2 font-semibold mb-2">
                          <Award className="h-4 w-4" />
                          Converted Clients
                        </span>
                        <span className="text-3xl font-bold text-amber-800 flex items-center gap-2">
                          {data.convertedClients}
                          <Badge className="text-xs" variant={data.conversionRate > 10 ? "conversion" : "excluded"}>
                            {data.conversionRate > 10 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {safeToFixed(data.conversionRate, 1)}%
                          </Badge>
                        </span>
                      </div>
                      <div className="flex flex-col p-6 bg-gradient-to-br from-purple-50/80 to-violet-50/60 rounded-xl border border-purple-200/40 shadow-lg animate-fade-in" style={{ animationDelay: '300ms' }}>
                        <span className="text-sm text-purple-700 flex items-center gap-2 font-semibold mb-2">
                          <DollarSign className="h-4 w-4" />
                          Total Revenue
                        </span>
                        <span className="text-3xl font-bold text-purple-800">{safeFormatCurrency(data.totalRevenue)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-xl border-0 bg-gradient-to-br from-white/90 to-slate-50/60 backdrop-blur-xl animate-fade-in" style={{ animationDelay: '350ms' }}>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <PieChartIcon className="h-6 w-6 text-primary" />
                      Client Acquisition Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <ClientSourceChart data={clientSourceData} />
                  </CardContent>
                </Card>
              </div>
              
              <Card className="shadow-xl border-0 bg-gradient-to-br from-white/90 to-slate-50/60 backdrop-blur-xl animate-fade-in" style={{ animationDelay: '400ms' }}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <LineChartIcon className="h-6 w-6 text-primary" />
                    Revenue Performance Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={revenueChartData} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="conversion" className="space-y-8">
              <Card className="shadow-xl border-0 bg-gradient-to-br from-white/90 to-emerald-50/40 backdrop-blur-xl animate-fade-in">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Award className="h-6 w-6 text-emerald-600" />
                    Conversion Analytics Deep Dive
                  </CardTitle>
                  <CardDescription className="text-base">
                    Comprehensive analysis of client conversion journey from initial contact to paid membership
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="p-6 border-2 border-emerald-200/60 rounded-xl text-center bg-gradient-to-br from-emerald-50/80 to-green-50/60 shadow-lg animate-fade-in" style={{ animationDelay: '150ms' }}>
                      <h3 className="text-lg font-bold flex items-center justify-center gap-2 text-emerald-800">
                        <Percent className="h-5 w-5" />
                        Conversion Rate
                      </h3>
                      <p className="text-4xl font-bold text-emerald-700 mt-3 flex items-center justify-center gap-2">
                        {data.conversionRate > 10 ? <TrendingUp className="h-6 w-6 text-emerald-600" /> : <TrendingDown className="h-6 w-6 text-red-500" />}
                        {safeToFixed(data.conversionRate, 1)}%
                      </p>
                      <p className="text-emerald-600 mt-2 font-medium">
                        {data.conversionRate > 10 ? 'Exceeds industry standard' : 'Below average performance'}
                      </p>
                    </div>
                    <div className="p-6 border-2 border-blue-200/60 rounded-xl text-center bg-gradient-to-br from-blue-50/80 to-indigo-50/60 shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
                      <h3 className="text-lg font-bold flex items-center justify-center gap-2 text-blue-800">
                        <Award className="h-5 w-5" />
                        Converted Clients
                      </h3>
                      <p className="text-4xl font-bold text-blue-700 mt-3">{data.convertedClients}</p>
                      <p className="text-blue-600 mt-2 font-medium">
                        out of {data.newClients} new prospects
                      </p>
                    </div>
                    <div className="p-6 border-2 border-purple-200/60 rounded-xl text-center bg-gradient-to-br from-purple-50/80 to-violet-50/60 shadow-lg animate-fade-in" style={{ animationDelay: '250ms' }}>
                      <h3 className="text-lg font-bold flex items-center justify-center gap-2 text-purple-800">
                        <DollarSign className="h-5 w-5" />
                        Avg. Revenue per Convert
                      </h3>
                      <p className="text-4xl font-bold text-purple-700 mt-3">{safeFormatCurrency(data.averageRevenuePerClient)}</p>
                      <p className="text-purple-600 mt-2 font-medium">
                        per successful conversion
                      </p>
                    </div>
                  </div>
                  
                  {data.convertedClientDetails && data.convertedClientDetails.length > 0 && 
                    <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                      {renderClientTable(data.convertedClientDetails, "Converted Clients")}
                    </div>
                  }
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="retention" className="space-y-8">
              <Card className="shadow-xl border-0 bg-gradient-to-br from-white/90 to-blue-50/40 backdrop-blur-xl animate-fade-in">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Check className="h-6 w-6 text-blue-600" />
                    Client Retention Analysis
                  </CardTitle>
                  <CardDescription className="text-base">
                    In-depth breakdown of client retention patterns and engagement metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="p-6 border-2 border-blue-200/60 rounded-xl text-center bg-gradient-to-br from-blue-50/80 to-indigo-50/60 shadow-lg animate-fade-in" style={{ animationDelay: '150ms' }}>
                      <h3 className="text-lg font-bold flex items-center justify-center gap-2 text-blue-800">
                        <Check className="h-5 w-5" />
                        Retention Rate
                      </h3>
                      <p className="text-4xl font-bold text-blue-700 mt-3 flex items-center justify-center gap-2">
                        {data.retentionRate > 50 ? <TrendingUp className="h-6 w-6 text-blue-600" /> : <TrendingDown className="h-6 w-6 text-red-500" />}
                        {safeToFixed(data.retentionRate, 1)}%
                      </p>
                      <p className="text-blue-600 mt-2 font-medium">
                        {data.retentionRate > 50 ? 'Strong retention performance' : 'Needs improvement'}
                      </p>
                    </div>
                    <div className="p-6 border-2 border-green-200/60 rounded-xl text-center bg-gradient-to-br from-green-50/80 to-emerald-50/60 shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
                      <h3 className="text-lg font-bold flex items-center justify-center gap-2 text-green-800">
                        <UserRound className="h-5 w-5" />
                        Retained Clients
                      </h3>
                      <p className="text-4xl font-bold text-green-700 mt-3">{data.retainedClients}</p>
                      <p className="text-green-600 mt-2 font-medium">
                        continuing their journey
                      </p>
                    </div>
                    <div className="p-6 border-2 border-red-200/60 rounded-xl text-center bg-gradient-to-br from-red-50/80 to-rose-50/60 shadow-lg animate-fade-in" style={{ animationDelay: '250ms' }}>
                      <h3 className="text-lg font-bold flex items-center justify-center gap-2 text-red-800">
                        <X className="h-5 w-5" />
                        No Show Rate
                      </h3>
                      <p className="text-4xl font-bold text-red-700 mt-3 flex items-center justify-center gap-2">
                        {data.noShowRate < 10 ? <TrendingDown className="h-6 w-6 text-green-500" /> : <TrendingUp className="h-6 w-6 text-red-500" />}
                        {safeToFixed(data.noShowRate, 1)}%
                      </p>
                      <p className="text-red-600 mt-2 font-medium">
                        {data.noShowRate < 10 ? 'Excellent attendance' : 'High absenteeism'}
                      </p>
                    </div>
                  </div>
                  
                  {data.retainedClientDetails && data.retainedClientDetails.length > 0 && 
                    <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                      {renderClientTable(data.retainedClientDetails, "Retained Clients")}
                    </div>
                  }
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="revenue" className="space-y-8">
              <Card className="shadow-xl border-0 bg-gradient-to-br from-white/90 to-green-50/40 backdrop-blur-xl animate-fade-in">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <DollarSign className="h-6 w-6 text-green-600" />
                    Revenue Performance Analysis
                  </CardTitle>
                  <CardDescription className="text-base">
                    Comprehensive breakdown of revenue streams and financial performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="p-6 border-2 border-green-200/60 rounded-xl text-center bg-gradient-to-br from-green-50/80 to-emerald-50/60 shadow-lg animate-fade-in" style={{ animationDelay: '150ms' }}>
                      <h3 className="text-lg font-bold flex items-center justify-center gap-2 text-green-800">
                        <DollarSign className="h-5 w-5" />
                        Total Revenue
                      </h3>
                      <p className="text-4xl font-bold text-green-700 mt-3">{safeFormatCurrency(data.totalRevenue)}</p>
                    </div>
                    <div className="p-6 border-2 border-blue-200/60 rounded-xl text-center bg-gradient-to-br from-blue-50/80 to-indigo-50/60 shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
                      <h3 className="text-lg font-bold flex items-center justify-center gap-2 text-blue-800">
                        <UserRound className="h-5 w-5" />
                        Revenue per Client
                      </h3>
                      <p className="text-4xl font-bold text-blue-700 mt-3">{safeFormatCurrency(data.averageRevenuePerClient)}</p>
                    </div>
                    <div className="p-6 border-2 border-purple-200/60 rounded-xl text-center bg-gradient-to-br from-purple-50/80 to-violet-50/60 shadow-lg animate-fade-in" style={{ animationDelay: '250ms' }}>
                      <h3 className="text-lg font-bold flex items-center justify-center gap-2 text-purple-800">
                        <ArrowUpDown className="h-5 w-5" />
                        Revenue Trend
                      </h3>
                      <p className="text-4xl font-bold text-purple-700 mt-3 flex items-center justify-center gap-2">
                        {data.revenueByWeek && data.revenueByWeek.length > 1 ? 
                          data.revenueByWeek[data.revenueByWeek.length - 1].revenue > data.revenueByWeek[data.revenueByWeek.length - 2].revenue ? 
                            <><TrendingUp className="h-6 w-6 text-green-500" /> <span className="text-green-600">Growing</span></> : 
                            <><TrendingDown className="h-6 w-6 text-red-500" /> <span className="text-red-600">Declining</span></> 
                          : <span className="text-slate-500">N/A</span>} 
                      </p>
                    </div>
                  </div>
                  
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '300ms' }}>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <LineChartIcon className="h-5 w-5 text-primary" />
                        Weekly Revenue Progression
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RevenueChart data={revenueChartData} />
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-8">
              <Card className="shadow-xl border-0 bg-gradient-to-br from-white/90 to-slate-50/60 backdrop-blur-xl animate-fade-in">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <UserRound className="h-6 w-6 text-primary" />
                    Detailed Client Data Overview
                  </CardTitle>
                  <CardDescription className="text-base">
                    Complete client records with detailed analytics and processing information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-8">
                    {data.newClientDetails && data.newClientDetails.length > 0 && (
                      <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                        {renderClientTable(data.newClientDetails, "New Clients")}
                      </div>
                    )}
                      
                    {data.excludedClientDetails && data.excludedClientDetails.length > 0 && (
                      <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                        {renderClientTable(data.excludedClientDetails, "Excluded Clients")}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="sticky bottom-0 bg-gradient-to-r from-slate-900/95 to-slate-800/95 text-white p-6 border-t-0 shadow-2xl">
          <Button onClick={onClose} className="animate-scale-in bg-white text-slate-800 hover:bg-slate-100 font-semibold px-8 shadow-lg">
            Close Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DrillDownAnalytics;
