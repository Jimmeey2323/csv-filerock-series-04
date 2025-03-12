
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
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
import { 
  Info, TrendingUp, Users, DollarSign, BarChart2, PieChart, 
  Calendar, ArrowUp, ArrowDown, Percent, UserCheck, UserPlus, 
  Target, BarChart, Award, Eye, EyeOff, Clock, ClipboardList,
  CheckCircle, XCircle, ChevronDown, ChevronUp, Star, Share2,
  Layers, Gift, ShoppingBag, User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import FilterBar from './FilterBar';
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
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'detailed'>('table');
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherMetrics | null>(null);
  const [modalType, setModalType] = useState<'new' | 'retained' | 'converted'>('new');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{column: string, direction: 'asc' | 'desc'} | null>(null);
  const [filterConfig, setFilterConfig] = useState({
    location: '',
    teacher: '',
    period: '',
    search: '',
  });

  const openModal = (teacher: TeacherMetrics, type: 'new' | 'retained' | 'converted') => {
    setSelectedTeacher(teacher);
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleSort = (column: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    
    if (sortConfig && sortConfig.column === column && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    
    setSortConfig({ column, direction });
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

  // Apply filters
  let filteredData = [...data];
  
  if (filterConfig.location && filterConfig.location !== 'all-locations') {
    filteredData = filteredData.filter(item => item.location === filterConfig.location);
  } else if (activeTab !== 'all') {
    filteredData = filteredData.filter(item => item.location === activeTab);
  }
  
  if (filterConfig.teacher && filterConfig.teacher !== 'all-teachers') {
    filteredData = filteredData.filter(item => item.teacherName === filterConfig.teacher);
  }
  
  if (filterConfig.period && filterConfig.period !== 'all-periods') {
    filteredData = filteredData.filter(item => item.period === filterConfig.period);
  }
  
  if (filterConfig.search) {
    const searchLower = filterConfig.search.toLowerCase();
    filteredData = filteredData.filter(item => 
      item.teacherName.toLowerCase().includes(searchLower)
    );
  }

  // Apply sorting
  if (sortConfig) {
    filteredData.sort((a, b) => {
      // For numeric values
      if (typeof a[sortConfig.column as keyof TeacherMetrics] === 'number') {
        const aValue = a[sortConfig.column as keyof TeacherMetrics] as number;
        const bValue = b[sortConfig.column as keyof TeacherMetrics] as number;
        
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      
      // For string values
      const aValue = String(a[sortConfig.column as keyof TeacherMetrics]);
      const bValue = String(b[sortConfig.column as keyof TeacherMetrics]);
      
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    });
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  // Calculate totals for footer
  const calculateTotals = () => {
    if (filteredData.length === 0) return null;
    
    const totals = {
      newClients: filteredData.reduce((sum, item) => sum + item.newClients, 0),
      retainedClients: filteredData.reduce((sum, item) => sum + item.retainedClients, 0),
      convertedClients: filteredData.reduce((sum, item) => sum + item.convertedClients, 0),
      totalRevenue: filteredData.reduce((sum, item) => sum + item.totalRevenue, 0),
    };
    
    const averageRetentionRate = totals.newClients > 0 
      ? (totals.retainedClients / totals.newClients) * 100 
      : 0;
      
    const averageConversionRate = totals.newClients > 0 
      ? (totals.convertedClients / totals.newClients) * 100 
      : 0;
    
    return {
      ...totals,
      retentionRate: averageRetentionRate,
      conversionRate: averageConversionRate,
    };
  };
  
  const totals = calculateTotals();

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
          secondaryValue={`${totalRetained} clients`}
          icon={<UserCheck className="h-5 w-5" />}
          status={avgRetentionRate > 50 ? 'positive' : avgRetentionRate > 30 ? 'neutral' : 'negative'}
          tooltip="(Retained Clients / New Clients) × 100. Retained clients are those who returned after first visit."
        />
        
        <PerformanceMetricCard 
          title="Conversion Rate"
          value={formatPercentage(avgConversionRate)}
          secondaryValue={`${totalConverted} clients`}
          icon={<Target className="h-5 w-5" />}
          status={avgConversionRate > 30 ? 'positive' : avgConversionRate > 20 ? 'neutral' : 'negative'}
          tooltip="(Converted Clients / New Clients) × 100. Converted clients are those who purchased after first visit."
        />
        
        <PerformanceMetricCard 
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          secondaryValue={`Avg: ${formatCurrency(totalConverted > 0 ? totalRevenue / totalConverted : 0)}`}
          icon={<BarChart className="h-5 w-5 text-primary" />}
          tooltip="Sum of sales values from converted clients"
        />
      </div>
    );
  };

  // Additional metrics for detailed view
  const getAdditionalMetrics = (data: TeacherMetrics[]) => {
    if (data.length === 0) return null;
    
    // Calculate averages across all teachers
    const avgTrialConversion = data.reduce((sum, item) => sum + item.trialToMembershipConversion, 0) / data.length;
    const avgReferralConversion = data.reduce((sum, item) => sum + item.referralConversionRate, 0) / data.length;
    const avgInfluencerConversion = data.reduce((sum, item) => sum + item.influencerConversionRate, 0) / data.length;
    const avgNoShowRate = data.reduce((sum, item) => sum + item.noShowRate, 0) / data.length;
    const avgLateCancellationRate = data.reduce((sum, item) => sum + item.lateCancellationRate, 0) / data.length;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <PerformanceMetricCard 
          title="Trial Conversion"
          value={formatPercentage(avgTrialConversion)}
          icon={<ClipboardList className="h-5 w-5" />}
          status={avgTrialConversion > 40 ? 'positive' : avgTrialConversion > 25 ? 'neutral' : 'negative'}
          tooltip="(Trials Who Became Paying Customers / Total Trial Clients) × 100"
        />
        
        <PerformanceMetricCard 
          title="Referral Conversion"
          value={formatPercentage(avgReferralConversion)}
          icon={<Share2 className="h-5 w-5" />}
          status={avgReferralConversion > 40 ? 'positive' : avgReferralConversion > 25 ? 'neutral' : 'negative'}
          tooltip="(Referrals Who Became Paying Customers / Total Referrals) × 100"
        />
        
        <PerformanceMetricCard 
          title="Influencer Conversion"
          value={formatPercentage(avgInfluencerConversion)}
          icon={<Star className="h-5 w-5" />}
          status={avgInfluencerConversion > 30 ? 'positive' : avgInfluencerConversion > 15 ? 'neutral' : 'negative'}
          tooltip="(Influencer Sign-Ups Who Became Paying Customers / Total Influencer Sign-Ups) × 100"
        />
        
        <PerformanceMetricCard 
          title="No-Show Rate"
          value={formatPercentage(avgNoShowRate)}
          icon={<EyeOff className="h-5 w-5" />}
          status={avgNoShowRate < 10 ? 'positive' : avgNoShowRate < 20 ? 'neutral' : 'negative'}
          tooltip="(Count of No Show = 'Yes' / Total Bookings) × 100"
        />
        
        <PerformanceMetricCard 
          title="Late Cancellation"
          value={formatPercentage(avgLateCancellationRate)}
          icon={<Clock className="h-5 w-5" />}
          status={avgLateCancellationRate < 10 ? 'positive' : avgLateCancellationRate < 20 ? 'neutral' : 'negative'}
          tooltip="(Count of Late Cancelled = 'Yes' / Total Bookings) × 100"
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

  // Card view for teachers
  const renderTeacherCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {filteredData.map((teacher, index) => (
          <Card key={`${teacher.teacherName}-${teacher.period}-${index}`} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>{teacher.teacherName}</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-normal">
                  {teacher.period}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{teacher.location}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => openModal(teacher, 'new')}
                >
                  <div className="text-sm text-muted-foreground">New Clients</div>
                  <div className="text-xl font-semibold">{teacher.newClients}</div>
                </div>
                
                <div
                  className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => openModal(teacher, 'retained')}
                >
                  <div className="text-sm text-muted-foreground">Retained</div>
                  <div 
                    className={`text-xl font-semibold ${
                      teacher.retentionRate > 50 ? 'text-green-600' : teacher.retentionRate > 30 ? 'text-amber-600' : 'text-red-600'
                    }`}
                  >
                    {teacher.retainedClients} <span className="text-sm">({formatPercentage(teacher.retentionRate)})</span>
                  </div>
                </div>
                
                <div
                  className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => openModal(teacher, 'converted')}
                >
                  <div className="text-sm text-muted-foreground">Converted</div>
                  <div 
                    className={`text-xl font-semibold ${
                      teacher.conversionRate > 40 ? 'text-green-600' : teacher.conversionRate > 20 ? 'text-amber-600' : 'text-red-600'
                    }`}
                  >
                    {teacher.convertedClients} <span className="text-sm">({formatPercentage(teacher.conversionRate)})</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Revenue</div>
                  <div className="text-xl font-semibold">{formatCurrency(teacher.totalRevenue)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-muted-foreground">Trials: </span>
                  <span className="ml-1 font-medium">{teacher.trials}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-muted-foreground">Referrals: </span>
                  <span className="ml-1 font-medium">{teacher.referrals}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                  <span className="text-muted-foreground">Hosted: </span>
                  <span className="ml-1 font-medium">{teacher.hosted}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-muted-foreground">Influencer: </span>
                  <span className="ml-1 font-medium">{teacher.influencerSignups}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Detailed view for full metrics
  const renderDetailedView = () => {
    return (
      <div className="space-y-6">
        {filteredData.map((teacher, index) => (
          <Card key={`${teacher.teacherName}-${teacher.period}-${index}`} className="mb-6">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-lg flex justify-between items-center">
                <span className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" /> 
                  {teacher.teacherName}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-gray-50 border-gray-200 font-normal">
                    {teacher.location}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-normal">
                    {teacher.period}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Client Acquisition */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium flex items-center">
                    <UserPlus className="h-4 w-4 mr-2 text-primary" />
                    Client Acquisition
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                         onClick={() => openModal(teacher, 'new')}>
                      <div className="text-sm text-muted-foreground">New Clients</div>
                      <div className="text-xl font-semibold">{teacher.newClients}</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Trials</div>
                      <div className="text-xl font-semibold">{teacher.trials}</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Referrals</div>
                      <div className="text-xl font-semibold">{teacher.referrals}</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Hosted</div>
                      <div className="text-xl font-semibold">{teacher.hosted}</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Influencer</div>
                      <div className="text-xl font-semibold">{teacher.influencerSignups}</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Others</div>
                      <div className="text-xl font-semibold">{teacher.others}</div>
                    </div>
                  </div>
                </div>
                
                {/* Retention & Conversion */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium flex items-center">
                    <Target className="h-4 w-4 mr-2 text-primary" />
                    Retention & Conversion
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                         onClick={() => openModal(teacher, 'retained')}>
                      <div className="text-sm text-muted-foreground">Retained Clients</div>
                      <div className={`text-xl font-semibold ${
                        teacher.retentionRate > 50 ? 'text-green-600' : teacher.retentionRate > 30 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {teacher.retainedClients} <span className="text-sm">({formatPercentage(teacher.retentionRate)})</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100"
                         onClick={() => openModal(teacher, 'converted')}>
                      <div className="text-sm text-muted-foreground">Converted Clients</div>
                      <div className={`text-xl font-semibold ${
                        teacher.conversionRate > 40 ? 'text-green-600' : teacher.conversionRate > 20 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {teacher.convertedClients} <span className="text-sm">({formatPercentage(teacher.conversionRate)})</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Trial Conversion</div>
                      <div className={`text-xl font-semibold ${
                        teacher.trialToMembershipConversion > 40 ? 'text-green-600' : teacher.trialToMembershipConversion > 20 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(teacher.trialToMembershipConversion)}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Referral Conversion</div>
                      <div className={`text-xl font-semibold ${
                        teacher.referralConversionRate > 40 ? 'text-green-600' : teacher.referralConversionRate > 20 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(teacher.referralConversionRate)}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">No-Show Rate</div>
                      <div className={`text-xl font-semibold ${
                        teacher.noShowRate < 10 ? 'text-green-600' : teacher.noShowRate < 20 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(teacher.noShowRate)}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Late Cancel Rate</div>
                      <div className={`text-xl font-semibold ${
                        teacher.lateCancellationRate < 10 ? 'text-green-600' : teacher.lateCancellationRate < 20 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(teacher.lateCancellationRate)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Revenue & Performance */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-primary" />
                    Revenue & Performance
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                      <div className="text-xl font-semibold">{formatCurrency(teacher.totalRevenue)}</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Avg. Revenue/Client</div>
                      <div className="text-xl font-semibold">{formatCurrency(teacher.averageRevenuePerClient)}</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">First-Time Buyer Rate</div>
                      <div className="text-xl font-semibold">{formatPercentage(teacher.firstTimeBuyerRate)}</div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">Influencer Conversion</div>
                      <div className="text-xl font-semibold">{formatPercentage(teacher.influencerConversionRate)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render main table view
  const renderTableView = () => {
    return (
      <div className="rounded-lg border bg-white/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead 
                  className="font-medium w-1/6 cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleSort('teacherName')}
                >
                  <div className="flex items-center">
                    Teacher
                    {sortConfig?.column === 'teacherName' && (
                      sortConfig.direction === 'asc' 
                        ? <ChevronUp className="h-4 w-4 ml-1" /> 
                        : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </TableHead>
                
                <TableHead 
                  className="font-medium w-1/6 cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleSort('period')}
                >
                  <div className="flex items-center">
                    Period
                    {sortConfig?.column === 'period' && (
                      sortConfig.direction === 'asc' 
                        ? <ChevronUp className="h-4 w-4 ml-1" /> 
                        : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </TableHead>
                
                <TableHead 
                  className="font-medium text-center cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleSort('newClients')}
                >
                  <div className="flex items-center justify-center gap-1">
                    New Clients
                    {sortConfig?.column === 'newClients' && (
                      sortConfig.direction === 'asc' 
                        ? <ChevronUp className="h-4 w-4 ml-1" /> 
                        : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
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
                  onClick={() => handleSort('retentionRate')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Retention Rate
                    {sortConfig?.column === 'retentionRate' && (
                      sortConfig.direction === 'asc' 
                        ? <ChevronUp className="h-4 w-4 ml-1" /> 
                        : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
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
                  onClick={() => handleSort('conversionRate')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Conversion Rate
                    {sortConfig?.column === 'conversionRate' && (
                      sortConfig.direction === 'asc' 
                        ? <ChevronUp className="h-4 w-4 ml-1" /> 
                        : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
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
                
                <TableHead 
                  className="font-medium text-center cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => handleSort('totalRevenue')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Revenue
                    {sortConfig?.column === 'totalRevenue' && (
                      sortConfig.direction === 'asc' 
                        ? <ChevronUp className="h-4 w-4 ml-1" /> 
                        : <ChevronDown className="h-4 w-4 ml-1" />
                    )}
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
                          {row.retainedClients} ({formatPercentage(row.retentionRate)})
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
                          {row.convertedClients} ({formatPercentage(row.conversionRate)})
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
            {totals && (
              <TableFooter className="bg-gray-50">
                <TableRow className="border-t-2 border-gray-200">
                  <TableCell colSpan={2} className="font-bold">
                    TOTALS
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {totals.newClients}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {totals.retainedClients} ({formatPercentage(totals.retentionRate)})
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {totals.convertedClients} ({formatPercentage(totals.conversionRate)})
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {formatCurrency(totals.totalRevenue)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full animate-slide-up space-y-6">
      {getSummaryMetrics(filteredData)}
      
      {filteredData.length > 1 && getPerformanceTrends(filteredData)}
      
      {/* Advanced Metrics (showing in detailed view) */}
      {viewMode === 'detailed' && getAdditionalMetrics(filteredData)}
      
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
      
      {/* Filter bar */}
      <FilterBar
        teachers={data.map(item => item.teacherName).filter((v, i, a) => a.indexOf(v) === i)}
        locations={locations}
        periods={data.map(item => item.period).filter((v, i, a) => a.indexOf(v) === i)}
        activeViewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilterChange={setFilterConfig}
      />
      
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
          {/* View based on selected mode */}
          {viewMode === 'table' && renderTableView()}
          {viewMode === 'cards' && renderTeacherCards()}
          {viewMode === 'detailed' && renderDetailedView()}
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
