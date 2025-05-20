
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
  Check
} from 'lucide-react';
import RevenueChart from '@/components/charts/RevenueChart';
import ConversionRatesChart from '@/components/charts/ConversionRatesChart';
import ClientSourceChart from '@/components/charts/ClientSourceChart';
import { safeToFixed, safeFormatCurrency } from '@/lib/utils';

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
  
  const renderClientTable = (clients: any[], title: string) => (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>
          {clients.length} {title.toLowerCase()} found
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>First Visit</TableHead>
                {(title.includes('Converted') || title.includes('New')) && <>
                  <TableHead>First Purchase Date</TableHead>
                  <TableHead>First Purchase Item</TableHead>
                  <TableHead>Purchase Value</TableHead>
                </>}
                {title.includes('Retained') && <>
                  <TableHead>Total Visits Post Trial</TableHead>
                  <TableHead>First Visit Post Trial</TableHead>
                  <TableHead>Membership Used</TableHead>
                </>}
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client, idx) => (
                <TableRow key={`${client.email}-${idx}`} className="animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                  <TableCell className="font-medium">{client.name || client.customerName || 'N/A'}</TableCell>
                  <TableCell>{client.email || 'N/A'}</TableCell>
                  <TableCell>{client.firstVisit || client.date || 'N/A'}</TableCell>
                  {(title.includes('Converted') || title.includes('New')) && <>
                    <TableCell className="font-medium text-emerald-600">
                      {client.firstPurchaseDate || client.purchaseDate || 'N/A'}
                    </TableCell>
                    <TableCell>{client.firstPurchaseItem || client.purchaseItem || client.membershipType || 'N/A'}</TableCell>
                    <TableCell>{client.purchaseValue || client.value ? safeFormatCurrency(client.purchaseValue || client.value) : 'N/A'}</TableCell>
                  </>}
                  {title.includes('Retained') && <>
                    <TableCell>{client.visitsPostTrial || client.visitCount || client.totalVisitsPostTrial || '0'}</TableCell>
                    <TableCell>{client.firstVisitPostTrial || 'N/A'}</TableCell>
                    <TableCell>{client.membershipUsed || client.membershipType || 'N/A'}</TableCell>
                  </>}
                  <TableCell>
                    <Badge 
                      variant={title.includes('Converted') ? 'success' : title.includes('Retained') ? 'outline' : 'default'}
                      className="animate-scale-in flex items-center gap-1"
                    >
                      {title.includes('Converted') ? <Check className="h-3 w-3" /> : null}
                      {title.includes('Converted') ? 'Converted' : title.includes('Retained') ? 'Retained' : 'New'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  // Create properly formatted data for ClientSourceChart
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

  // Convert revenue data format for RevenueChart
  const revenueChartData = data.revenueByWeek || [];

  // Create properly formatted ConversionRateData
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
      <DialogContent className="max-w-5xl h-[80vh] p-0 overflow-hidden animate-scale-in">
        <DialogHeader className="sticky top-0 z-10 bg-background pt-6 px-6 shadow-sm">
          <DialogTitle className="text-2xl">{getEntityLabel()} Analytics</DialogTitle>
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
              <TabsTrigger value="trends" className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '500ms' }}>
                <ArrowUpDown className="h-4 w-4" />
                <span>Trends</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow-sm border-muted/60 bg-gradient-to-br from-card to-background animate-fade-in">
                  <CardHeader>
                    <CardTitle>Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col p-4 bg-muted/20 rounded-lg border border-muted/40 animate-fade-in" style={{ animationDelay: '150ms' }}>
                        <span className="text-sm text-muted-foreground">New Clients</span>
                        <span className="text-2xl font-bold">{data.newClients}</span>
                      </div>
                      <div className="flex flex-col p-4 bg-muted/20 rounded-lg border border-muted/40 animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <span className="text-sm text-muted-foreground">Retained Clients</span>
                        <span className="text-2xl font-bold flex items-center">
                          {data.retainedClients} 
                          <Badge className="ml-2 flex items-center gap-1" variant={data.retentionRate > 50 ? "success" : "destructive"}>
                            {data.retentionRate > 50 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {safeToFixed(data.retentionRate, 1)}%
                          </Badge>
                        </span>
                      </div>
                      <div className="flex flex-col p-4 bg-muted/20 rounded-lg border border-muted/40 animate-fade-in" style={{ animationDelay: '250ms' }}>
                        <span className="text-sm text-muted-foreground">Converted Clients</span>
                        <span className="text-2xl font-bold flex items-center">
                          {data.convertedClients}
                          <Badge className="ml-2 flex items-center gap-1" variant={data.conversionRate > 10 ? "success" : "destructive"}>
                            {data.conversionRate > 10 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {safeToFixed(data.conversionRate, 1)}%
                          </Badge>
                        </span>
                      </div>
                      <div className="flex flex-col p-4 bg-muted/20 rounded-lg border border-muted/40 animate-fade-in" style={{ animationDelay: '300ms' }}>
                        <span className="text-sm text-muted-foreground">Total Revenue</span>
                        <span className="text-2xl font-bold">{safeFormatCurrency(data.totalRevenue)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm border-muted/60 animate-fade-in" style={{ animationDelay: '350ms' }}>
                  <CardHeader>
                    <CardTitle>Client Sources</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <ClientSourceChart data={clientSourceData} />
                  </CardContent>
                </Card>
              </div>
              
              <Card className="shadow-sm border-muted/60 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <CardHeader>
                  <CardTitle>Revenue by Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={revenueChartData} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="conversion" className="space-y-6">
              <Card className="shadow-sm border-muted/60 animate-fade-in">
                <CardHeader>
                  <CardTitle>Conversion Analysis</CardTitle>
                  <CardDescription>
                    Detailed breakdown of client conversion journey from trials to paid memberships
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex space-x-4">
                    <div className="flex-1 p-4 border border-muted/40 rounded-lg text-center bg-muted/10 animate-fade-in" style={{ animationDelay: '150ms' }}>
                      <h3 className="text-lg font-medium">Conversion Rate</h3>
                      <p className="text-3xl font-bold text-primary mt-2 flex items-center justify-center">
                        {data.conversionRate > 10 ? <TrendingUp className="h-5 w-5 mr-2 text-green-500" /> : <TrendingDown className="h-5 w-5 mr-2 text-red-500" />}
                        {safeToFixed(data.conversionRate, 1)}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {data.conversionRate > 10 ? 'Above average' : 'Below average'}
                      </p>
                    </div>
                    <div className="flex-1 p-4 border border-muted/40 rounded-lg text-center bg-muted/10 animate-fade-in" style={{ animationDelay: '200ms' }}>
                      <h3 className="text-lg font-medium">Converted Clients</h3>
                      <p className="text-3xl font-bold mt-2">{data.convertedClients}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        out of {data.newClients} new clients
                      </p>
                    </div>
                    <div className="flex-1 p-4 border border-muted/40 rounded-lg text-center bg-muted/10 animate-fade-in" style={{ animationDelay: '250ms' }}>
                      <h3 className="text-lg font-medium">Avg. Revenue</h3>
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
                  <CardTitle>Retention Analysis</CardTitle>
                  <CardDescription>
                    Detailed breakdown of client retention patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex space-x-4">
                    <div className="flex-1 p-4 border border-muted/40 rounded-lg text-center bg-muted/10 animate-fade-in" style={{ animationDelay: '150ms' }}>
                      <h3 className="text-lg font-medium">Retention Rate</h3>
                      <p className="text-3xl font-bold text-primary mt-2 flex items-center justify-center">
                        {data.retentionRate > 50 ? <TrendingUp className="h-5 w-5 mr-2 text-green-500" /> : <TrendingDown className="h-5 w-5 mr-2 text-red-500" />}
                        {safeToFixed(data.retentionRate, 1)}%
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {data.retentionRate > 50 ? 'Above average' : 'Below average'}
                      </p>
                    </div>
                    <div className="flex-1 p-4 border border-muted/40 rounded-lg text-center bg-muted/10 animate-fade-in" style={{ animationDelay: '200ms' }}>
                      <h3 className="text-lg font-medium">Retained Clients</h3>
                      <p className="text-3xl font-bold mt-2">{data.retainedClients}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        out of total clients
                      </p>
                    </div>
                    <div className="flex-1 p-4 border border-muted/40 rounded-lg text-center bg-muted/10 animate-fade-in" style={{ animationDelay: '250ms' }}>
                      <h3 className="text-lg font-medium">No Show Rate</h3>
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
                  <CardTitle>Revenue Analysis</CardTitle>
                  <CardDescription>
                    Detailed breakdown of revenue streams and financial performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border border-muted/40 rounded-lg text-center bg-muted/10 animate-fade-in" style={{ animationDelay: '150ms' }}>
                      <h3 className="text-lg font-medium">Total Revenue</h3>
                      <p className="text-3xl font-bold text-primary mt-2">{safeFormatCurrency(data.totalRevenue)}</p>
                    </div>
                    <div className="p-4 border border-muted/40 rounded-lg text-center bg-muted/10 animate-fade-in" style={{ animationDelay: '200ms' }}>
                      <h3 className="text-lg font-medium">Revenue per Client</h3>
                      <p className="text-3xl font-bold mt-2">{safeFormatCurrency(data.averageRevenuePerClient)}</p>
                    </div>
                    <div className="p-4 border border-muted/40 rounded-lg text-center bg-muted/10 animate-fade-in" style={{ animationDelay: '250ms' }}>
                      <h3 className="text-lg font-medium">Revenue Trend</h3>
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
                      <CardTitle className="text-lg">Revenue by Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RevenueChart data={revenueChartData} />
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-6">
              <Card className="shadow-sm border-muted/60 animate-fade-in">
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>
                    Historical performance and trend analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="shadow-sm border-muted/30 bg-card/60 animate-fade-in" style={{ animationDelay: '150ms' }}>
                      <CardHeader>
                        <CardTitle className="text-lg">Client Acquisition</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ConversionRatesChart data={[conversionRateData]} />
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-sm border-muted/30 bg-card/60 animate-fade-in" style={{ animationDelay: '200ms' }}>
                      <CardHeader>
                        <CardTitle className="text-lg">Attendance Patterns</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col p-4 border border-muted/40 rounded-lg bg-muted/10">
                            <span className="text-sm text-muted-foreground">No Show Rate</span>
                            <span className="text-xl font-bold flex items-center">
                              {safeToFixed(data.noShowRate, 1)}%
                              {data.noShowRate < 10 ? 
                                <TrendingDown className="h-4 w-4 ml-2 text-green-500" /> : 
                                <TrendingUp className="h-4 w-4 ml-2 text-red-500" />
                              }
                            </span>
                          </div>
                          <div className="flex flex-col p-4 border border-muted/40 rounded-lg bg-muted/10">
                            <span className="text-sm text-muted-foreground">Late Cancellation</span>
                            <span className="text-xl font-bold flex items-center">
                              {safeToFixed(data.lateCancellationRate, 1)}%
                              {data.lateCancellationRate < 5 ? 
                                <TrendingDown className="h-4 w-4 ml-2 text-green-500" /> : 
                                <TrendingUp className="h-4 w-4 ml-2 text-red-500" />
                              }
                            </span>
                          </div>
                          <div className="flex flex-col p-4 border border-muted/40 rounded-lg bg-muted/10">
                            <span className="text-sm text-muted-foreground">Retention Rate</span>
                            <span className="text-xl font-bold flex items-center">
                              {safeToFixed(data.retentionRate, 1)}%
                              {data.retentionRate > 50 ? 
                                <TrendingUp className="h-4 w-4 ml-2 text-green-500" /> : 
                                <TrendingDown className="h-4 w-4 ml-2 text-red-500" />
                              }
                            </span>
                          </div>
                          <div className="flex flex-col p-4 border border-muted/40 rounded-lg bg-muted/10">
                            <span className="text-sm text-muted-foreground">Conversion Rate</span>
                            <span className="text-xl font-bold flex items-center">
                              {safeToFixed(data.conversionRate, 1)}%
                              {data.conversionRate > 10 ? 
                                <TrendingUp className="h-4 w-4 ml-2 text-green-500" /> : 
                                <TrendingDown className="h-4 w-4 ml-2 text-red-500" />
                              }
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
              
              {/* New clients overview */}
              <Card className="shadow-sm border-muted/60 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <CardHeader>
                  <CardTitle>New Clients Overview</CardTitle>
                  <CardDescription>Details of new clients</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.newClientDetails && data.newClientDetails.length > 0 && 
                    renderClientTable(data.newClientDetails, "New Clients")}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="sticky bottom--96 bg-background p-6 border-t">
          <Button onClick={onClose} className="animate-scale-in">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DrillDownAnalytics;
