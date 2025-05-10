
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { BarChart, LineChart, AreaChart, PieChart } from 'recharts';
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
  Calendar
} from 'lucide-react';
import RevenueChart from '@/components/charts/RevenueChart';
import ConversionRatesChart from '@/components/charts/ConversionRatesChart';
import ClientSourceChart from '@/components/charts/ClientSourceChart';
import { Badge } from '@/components/ui/badge';

interface DrillDownAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProcessedTeacherData | null;
  type: 'teacher' | 'studio' | 'location' | 'period';
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

  // IMPORTANT: Move the conditional to inside the effect
  // This ensures the number of hooks stays consistent
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
      case 'teacher': return `Teacher: ${data.teacherName}`;
      case 'studio': return `Studio: All Studios`;
      case 'location': return `Location: ${data.location}`;
      case 'period': return `Period: ${data.period}`;
      default: return data.teacherName;
    }
  };

  const renderClientTable = (clients: any[], title: string) => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>
          {clients.length} {title.toLowerCase()} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>First Visit</TableHead>
                <TableHead>Visit Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client, idx) => (
                <TableRow key={`${client.email}-${idx}`}>
                  <TableCell className="font-medium">{client.name || 'N/A'}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.firstVisit || 'N/A'}</TableCell>
                  <TableCell>{client.visitType || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        title.includes('Converted') ? 'success' : 
                        title.includes('Retained') ? 'outline' : 'default'
                      }
                    >
                      {title.includes('Converted') ? 'Converted' : 
                       title.includes('Retained') ? 'Retained' : 'New'}
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] p-0">
        <DialogHeader className="sticky top-0 z-10 bg-background pt-6 px-6">
          <DialogTitle className="text-2xl">{getEntityLabel()} Analytics</DialogTitle>
          <DialogDescription>
            Detailed performance metrics and client data analysis
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6 overflow-auto">
          <TabsList className="mb-4 grid grid-cols-5 gap-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="conversion" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              <span>Conversion</span>
            </TabsTrigger>
            <TabsTrigger value="retention" className="flex items-center gap-2">
              <UserRound className="h-4 w-4" />
              <span>Retention</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>Revenue</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Trends</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">New Clients</span>
                      <span className="text-2xl font-bold">{data.newClients}</span>
                    </div>
                    <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Retained Clients</span>
                      <span className="text-2xl font-bold">
                        {data.retainedClients} ({data.retentionRate.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Converted Clients</span>
                      <span className="text-2xl font-bold">
                        {data.convertedClients} ({data.conversionRate.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
                      <span className="text-sm text-muted-foreground">Total Revenue</span>
                      <span className="text-2xl font-bold">₹{data.totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Client Sources</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  {/* Fix type issue by passing the actual client source data */}
                  <ClientSourceChart data={{
                    trials: data.trials,
                    referrals: data.referrals,
                    hosted: data.hosted,
                    influencerSignups: data.influencerSignups,
                    others: data.others
                  }} />
                </CardContent>
              </Card>
            </div>
            
            <div className="w-full">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Week</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Ensure revenueByWeek matches the expected format */}
                  <RevenueChart data={data.revenueByWeek ? data.revenueByWeek.map(item => ({
                    name: item.week,
                    value: item.revenue
                  })) : []} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="conversion">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Analysis</CardTitle>
                  <CardDescription>
                    Detailed breakdown of client conversion journey from trials to paid memberships
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-4 mb-4">
                    <div className="flex-1 p-4 border rounded-lg text-center">
                      <h3 className="text-lg font-medium">Conversion Rate</h3>
                      <p className="text-3xl font-bold text-primary">{data.conversionRate.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">
                        {data.conversionRate > 10 ? 'Above average' : 'Below average'}
                      </p>
                    </div>
                    <div className="flex-1 p-4 border rounded-lg text-center">
                      <h3 className="text-lg font-medium">Converted Clients</h3>
                      <p className="text-3xl font-bold">{data.convertedClients}</p>
                      <p className="text-sm text-muted-foreground">
                        out of {data.newClients} new clients
                      </p>
                    </div>
                    <div className="flex-1 p-4 border rounded-lg text-center">
                      <h3 className="text-lg font-medium">Avg. Revenue</h3>
                      <p className="text-3xl font-bold">₹{data.averageRevenuePerClient.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      <p className="text-sm text-muted-foreground">
                        per converted client
                      </p>
                    </div>
                  </div>
                  
                  {data.convertedClientDetails.length > 0 && (
                    renderClientTable(data.convertedClientDetails, "Converted Clients")
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="retention">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Retention Analysis</CardTitle>
                  <CardDescription>
                    Detailed breakdown of client retention patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-4 mb-4">
                    <div className="flex-1 p-4 border rounded-lg text-center">
                      <h3 className="text-lg font-medium">Retention Rate</h3>
                      <p className="text-3xl font-bold text-primary">{data.retentionRate.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">
                        {data.retentionRate > 50 ? 'Above average' : 'Below average'}
                      </p>
                    </div>
                    <div className="flex-1 p-4 border rounded-lg text-center">
                      <h3 className="text-lg font-medium">Retained Clients</h3>
                      <p className="text-3xl font-bold">{data.retainedClients}</p>
                      <p className="text-sm text-muted-foreground">
                        out of total clients
                      </p>
                    </div>
                    <div className="flex-1 p-4 border rounded-lg text-center">
                      <h3 className="text-lg font-medium">No Show Rate</h3>
                      <p className="text-3xl font-bold">{data.noShowRate.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">
                        {data.noShowRate < 10 ? 'Good' : 'Needs improvement'}
                      </p>
                    </div>
                  </div>
                  
                  {data.retainedClientDetails.length > 0 && (
                    renderClientTable(data.retainedClientDetails, "Retained Clients")
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="revenue">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analysis</CardTitle>
                  <CardDescription>
                    Detailed breakdown of revenue streams and financial performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-4 border rounded-lg text-center">
                      <h3 className="text-lg font-medium">Total Revenue</h3>
                      <p className="text-3xl font-bold text-primary">₹{data.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <h3 className="text-lg font-medium">Revenue per Client</h3>
                      <p className="text-3xl font-bold">₹{data.averageRevenuePerClient.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <h3 className="text-lg font-medium">Revenue Trend</h3>
                      <p className="text-3xl font-bold flex items-center justify-center gap-2">
                        {data.revenueByWeek && data.revenueByWeek.length > 1 ? 
                         (data.revenueByWeek[data.revenueByWeek.length - 1].revenue > 
                         data.revenueByWeek[data.revenueByWeek.length - 2].revenue ? (
                          <span className="text-green-500">Increasing</span>
                         ) : (
                          <span className="text-red-500">Decreasing</span>
                         )) : (
                           <span>Not enough data</span>
                         )} 
                      </p>
                    </div>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Revenue by Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Ensure revenueByWeek matches the expected format */}
                      <RevenueChart data={data.revenueByWeek ? data.revenueByWeek.map(item => ({
                        name: item.week,
                        value: item.revenue
                      })) : []} />
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="trends">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>
                    Historical performance and trend analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Client Acquisition</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* Fix type issue by creating the expected data format */}
                        <ConversionRatesChart data={[{
                          name: 'Current Period',
                          conversion: data.conversionRate,
                          retention: data.retentionRate
                        }]} />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Attendance Patterns</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col p-4 border rounded-lg">
                            <span className="text-sm text-muted-foreground">No Show Rate</span>
                            <span className="text-xl font-bold">{data.noShowRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex flex-col p-4 border rounded-lg">
                            <span className="text-sm text-muted-foreground">Late Cancellation</span>
                            <span className="text-xl font-bold">{data.lateCancellationRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex flex-col p-4 border rounded-lg">
                            <span className="text-sm text-muted-foreground">Retention Rate</span>
                            <span className="text-xl font-bold">{data.retentionRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex flex-col p-4 border rounded-lg">
                            <span className="text-sm text-muted-foreground">Conversion Rate</span>
                            <span className="text-xl font-bold">{data.conversionRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sticky bottom-0 bg-background p-6 border-t">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DrillDownAnalytics;
