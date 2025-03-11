
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
import { Info, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total New Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{totalNewClients}</div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Retention Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{formatPercentage(avgRetentionRate)}</div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{formatPercentage(avgConversionRate)}</div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="w-full animate-slide-up">
      {getSummaryMetrics(filteredData)}
      
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
                    
                    <TableHead className="font-medium text-center">
                      <div className="flex items-center justify-center gap-1">
                        New Clients
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-xs">Count of unique emails where Membership used does not contain "friends|family|staff".</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    
                    <TableHead className="font-medium text-center">
                      <div className="flex items-center justify-center gap-1">
                        Retention Rate
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-xs">(Retained Clients / New Clients) × 100</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableHead>
                    
                    <TableHead className="font-medium text-center">
                      <div className="flex items-center justify-center gap-1">
                        Conversion Rate
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-xs">(Converted Clients / New Clients) × 100</p>
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
                        <TableCell className="text-center">{row.newClients}</TableCell>
                        <TableCell className="text-center">{formatPercentage(row.retentionRate)}</TableCell>
                        <TableCell className="text-center">{formatPercentage(row.conversionRate)}</TableCell>
                        <TableCell className="text-center">{formatCurrency(row.totalRevenue)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResultsTable;
