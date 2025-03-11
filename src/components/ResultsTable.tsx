
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, TrendingUp, Users, DollarSign, BarChart2, PieChart, Calendar, ArrowUp, ArrowDown, Percent, UserCheck, UserPlus, Target, BarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ClientDetailsModal from './ClientDetailsModal';
import RevenueChart from './charts/RevenueChart';
import ClientSourceChart from './charts/ClientSourceChart';
import PerformanceMetricCard from './cards/PerformanceMetricCard';
import ConversionRatesChart from './charts/ConversionRatesChart';

interface TeacherMetrics {
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
  newClientDetails: any[];
  retainedClientDetails: any[];
  convertedClientDetails: any[];
  revenueByWeek?: { week: string; revenue: number }[];
  clientsBySource?: { source: string; count: number }[];
}

interface ResultsTableProps {
  data: TeacherMetrics[];
  locations: string[];
  isLoading: boolean;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  locations,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState(locations[0] || 'all');
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherMetrics | null>(null);
  const [modalType, setModalType] = useState<'new' | 'retained' | 'converted'>('new');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (teacher: TeacherMetrics, type: 'new' | 'retained' | 'converted') => {
    setSelectedTeacher(teacher);
    setModalType(type);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-soft">Loading results...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  const filteredData = activeTab === 'all' 
    ? data 
    : data.filter(item => item.location === activeTab);

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  // Get the most recent/active teacher for charts
  const activeTeacher = filteredData.length > 0 ? filteredData[0] : null;

  const getSummaryMetrics = (data: TeacherMetrics[]) => {
    if (data.length === 0) return null;
    
    const totalNewClients = data.reduce((sum, item) => sum + item.newClients, 0);
    const totalRetained = data.reduce((sum, item) => sum + item.retainedClients, 0);
    const totalConverted = data.reduce((sum, item) => sum + item.convertedClients, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
    
    const avgRetentionRate = totalNewClients > 0 ? (totalRetained / totalNewClients) * 100 : 0;
    const avgConversionRate = totalNewClients > 0 ? (totalConverted / totalNewClients) * 100 : 0;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fade-in">
        <PerformanceMetricCard 
          title="Total New Clients"
          value={totalNewClients.toString()}
          icon={<UserPlus className="h-5 w-5 text-primary" />}
          tooltip="Count of unique emails where Membership used does not contain friends|family|staff"
        />
        
        <PerformanceMetricCard 
          title="Retention Rate"
          value={formatPercentage(avgRetentionRate)}
          icon={<UserCheck className="h-5 w-5" />}
          status={avgRetentionRate > 50 ? 'positive' : avgRetentionRate > 30 ? 'neutral' : 'negative'}
          tooltip="(Retained Clients / New Clients) × 100. Retained clients are those who returned after first visit."
        />
        
        <PerformanceMetricCard 
          title="Conversion Rate"
          value={formatPercentage(avgConversionRate)}
          icon={<Target className="h-5 w-5" />}
          status={avgConversionRate > 30 ? 'positive' : avgConversionRate > 20 ? 'neutral' : 'negative'}
          tooltip="(Converted Clients / New Clients) × 100. Converted clients are those who purchased after first visit."
        />
        
        <PerformanceMetricCard 
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<BarChart className="h-5 w-5 text-primary" />}
          tooltip="Sum of sales values from converted clients"
        />
      </div>
    );
  };

  // Calculate performance trends
  const getPerformanceTrends = (teacherData: TeacherMetrics[]) => {
    if (teacherData.length < 2) return null;
    
    // Sort by period (assuming periods are in format 'MMM YY')
    const sortedData = [...teacherData].sort((a, b) => {
      const dateA = new Date(a.period.split(' ')[0] + ' 20' + a.period.split(' ')[1]);
      const dateB = new Date(b.period.split(' ')[0] + ' 20' + b.period.split(' ')[1]);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Get most recent and previous period
    const current = sortedData[sortedData.length - 1];
    const previous = sortedData[sortedData.length - 2];
    
    // Calculate changes
    const clientChange = current.newClients - previous.newClients;
    const clientPercentChange = previous.newClients > 0 
      ? (clientChange / previous.newClients) * 100 
      : 0;
    
    const retentionChange = current.retentionRate - previous.retentionRate;
    const conversionChange = current.conversionRate - previous.conversionRate;
    const revenueChange = current.totalRevenue - previous.totalRevenue;
    const revenuePercentChange = previous.totalRevenue > 0 
      ? (revenueChange / previous.totalRevenue) * 100 
      : 0;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Performance Trends (vs Previous Period)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">New Clients</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <p className="text-2xl font-bold">{clientChange > 0 ? '+' : ''}{clientChange}</p>
                    <p className={`text-sm ${clientChange >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                      {clientChange >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                      {Math.abs(clientPercentChange).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Badge variant={clientChange >= 0 ? "success" : "destructive"} className="mt-1">
                  {clientChange >= 0 ? 'Increase' : 'Decrease'}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Retention Rate</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <p className="text-2xl font-bold">{retentionChange > 0 ? '+' : ''}{retentionChange.toFixed(1)}%</p>
                    <p className={`text-sm ${retentionChange >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                      {retentionChange >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                      pts
                    </p>
                  </div>
                </div>
                <Badge variant={retentionChange >= 0 ? "success" : "destructive"} className="mt-1">
                  {retentionChange >= 0 ? 'Improved' : 'Declined'}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <p className="text-2xl font-bold">{conversionChange > 0 ? '+' : ''}{conversionChange.toFixed(1)}%</p>
                    <p className={`text-sm ${conversionChange >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                      {conversionChange >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                      pts
                    </p>
                  </div>
                </div>
                <Badge variant={conversionChange >= 0 ? "success" : "destructive"} className="mt-1">
                  {conversionChange >= 0 ? 'Improved' : 'Declined'}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <p className="text-2xl font-bold">{revenueChange > 0 ? '+' : ''}{formatCurrency(revenueChange)}</p>
                    <p className={`text-sm ${revenueChange >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                      {revenueChange >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                      {Math.abs(revenuePercentChange).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Badge variant={revenueChange >= 0 ? "success" : "destructive"} className="mt-1">
                  {revenueChange >= 0 ? 'Increase' : 'Decrease'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const getTeacherConversionRates = (teacherData: TeacherMetrics[]) => {
    if (teacherData.length === 0) return null;

    const conversionRatesData = teacherData.map(teacher => ({
      name: teacher.teacherName,
      retention: teacher.retentionRate,
      conversion: teacher.conversionRate,
      trial: teacher.trialToMembershipConversion,
      referral: teacher.referralConversionRate,
      influencer: teacher.influencerConversionRate
    }));

    // Sort by conversion rate (highest first)
    conversionRatesData.sort((a, b) => b.conversion - a.conversion);

    return <ConversionRatesChart data={conversionRatesData.slice(0, 5)} />;
  };

  return (
    <div className="w-full animate-slide-up space-y-6">
      {getSummaryMetrics(filteredData)}
      
      {filteredData.length > 1 && getPerformanceTrends(filteredData)}
      
      {/* Analytics Charts */}
      {activeTeacher && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <RevenueChart 
              data={activeTeacher.revenueByWeek || []} 
            />
          </div>
          <div>
            <ClientSourceChart 
              data={activeTeacher.clientsBySource || []} 
            />
          </div>
        </div>
      )}

      {/* Conversion Rates Comparison */}
      {filteredData.length > 1 && (
        <div className="mb-6">
          {getTeacherConversionRates(filteredData)}
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full bg-white/60 backdrop-blur-sm border">
          <TabsTrigger value="all" className="flex-1">All Locations</TabsTrigger>
          {locations.map(location => (
            <TabsTrigger key={location} value={location} className="flex-1">
              {location.split(',')[0]}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <div className="rounded-lg border bg-white/60 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow>
                    <TableHead className="font-medium w-1/6">Teacher</TableHead>
                    <TableHead className="font-medium w-1/6">Period</TableHead>
                    
                    <TableHead 
                      className="font-medium text-center cursor-pointer hover:bg-secondary/80 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1">
                        New Clients
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-xs">Count of unique emails where Membership used does not contain "friends|family|staff". Click to view client details.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    
                    <TableHead 
                      className="font-medium text-center cursor-pointer hover:bg-secondary/80 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1">
                        Retention Rate
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-xs">(Retained Clients / New Clients) × 100. Click to view retained client details.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    
                    <TableHead 
                      className="font-medium text-center cursor-pointer hover:bg-secondary/80 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-1">
                        Conversion Rate
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-xs">(Converted Clients / New Clients) × 100. Click to view converted client details.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    
                    <TableHead className="font-medium text-center">
                      <div className="flex items-center justify-center gap-1">
                        Revenue
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-xs">Total revenue attributed to this teacher</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        No data available for this location
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((row, index) => (
                      <TableRow key={`${row.teacherName}-${row.period}-${index}`} className="group hover:bg-accent/50">
                        <TableCell className="font-medium">
                          {row.teacherName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-normal">
                            {row.period}
                          </Badge>
                        </TableCell>
                        <TableCell 
                          className="text-center cursor-pointer hover:text-primary hover:underline transition-colors"
                          onClick={() => openModal(row, 'new')}
                        >
                          <div className="flex justify-center items-center">
                            <span className="hover:bg-blue-50 px-2 py-1 rounded">{row.newClients}</span>
                          </div>
                        </TableCell>
                        <TableCell 
                          className="text-center cursor-pointer hover:text-primary hover:underline transition-colors"
                          onClick={() => openModal(row, 'retained')}
                        >
                          <div className="flex justify-center items-center">
                            <span className={`hover:bg-blue-50 px-2 py-1 rounded ${
                              row.retentionRate > 50 ? 'text-green-600' : row.retentionRate > 30 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {formatPercentage(row.retentionRate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell 
                          className="text-center cursor-pointer hover:text-primary hover:underline transition-colors"
                          onClick={() => openModal(row, 'converted')}
                        >
                          <div className="flex justify-center items-center">
                            <span className={`hover:bg-blue-50 px-2 py-1 rounded ${
                              row.conversionRate > 40 ? 'text-green-600' : row.conversionRate > 20 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {formatPercentage(row.conversionRate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{formatCurrency(row.totalRevenue)}</span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Client Details Modal */}
      {selectedTeacher && (
        <ClientDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            modalType === 'new' 
              ? `New Clients - ${selectedTeacher.teacherName}` 
              : modalType === 'retained'
              ? `Retained Clients - ${selectedTeacher.teacherName}`
              : `Converted Clients - ${selectedTeacher.teacherName}`
          }
          description={
            modalType === 'new' 
              ? `Showing ${selectedTeacher.newClients} new clients for ${selectedTeacher.period}` 
              : modalType === 'retained'
              ? `Showing ${selectedTeacher.retainedClients} retained clients (${formatPercentage(selectedTeacher.retentionRate)} retention rate)`
              : `Showing ${selectedTeacher.convertedClients} converted clients (${formatPercentage(selectedTeacher.conversionRate)} conversion rate)`
          }
          clients={
            modalType === 'new' 
              ? selectedTeacher.newClientDetails 
              : modalType === 'retained'
              ? selectedTeacher.retainedClientDetails
              : selectedTeacher.convertedClientDetails
          }
          type={modalType}
        />
      )}
    </div>
  );
};

export default ResultsTable;
