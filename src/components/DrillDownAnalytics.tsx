
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { X, BarChart, PieChart, Table, Users } from 'lucide-react';
import ClientSourceChart from './charts/ClientSourceChart';
import ConversionRatesChart from './charts/ConversionRatesChart';
import RevenueChart from './charts/RevenueChart';
import PerformanceMetricCard from './cards/PerformanceMetricCard';
import StudioMetricCard from './cards/StudioMetricCard';

interface DrillDownAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProcessedTeacherData | null;
  type: 'teacher' | 'studio' | 'location' | 'period';
  metricType: 'conversion' | 'retention' | 'all';
}

const DrillDownAnalytics: React.FC<DrillDownAnalyticsProps> = ({
  isOpen,
  onClose,
  data,
  type,
  metricType
}) => {
  if (!data) return null;
  
  const displayName = type === 'teacher' ? data.teacherName : data.location;
  const initialTab = metricType === 'conversion' ? 'conversion' : 
                     metricType === 'retention' ? 'retention' : 'overview';

  // Format client details
  const formatClientValue = (value: any) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'number') {
      // If it looks like currency
      if (value > 100) return `₹${value.toLocaleString()}`;
      return value.toString();
    }
    return value;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-full flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {type === 'teacher' ? 'Teacher Performance' : 'Studio Performance'}: {displayName}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Period: {data.period} | Location: {data.location}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={initialTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="conversion" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span>Conversion Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="retention" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Retention Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="clientData" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              <span>Client Data</span>
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1">
            <div className="px-1">
              <TabsContent value="overview" className="m-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <StudioMetricCard 
                    title="New Clients" 
                    value={data.newClients.toString()} 
                    location={data.location}
                    icon="user"
                    tooltip="Number of new clients acquired"
                    metrics={[
                      { label: "Trial Sessions", value: data.trials || 0, status: "neutral" },
                      { label: "Referrals", value: data.referrals || 0, status: "positive" }
                    ]}
                  />
                  <StudioMetricCard 
                    title="Conversion Rate" 
                    value={`${data.conversionRate.toFixed(1)}%`} 
                    location={data.location}
                    prevValue="8.5%"
                    changeType={data.conversionRate > 10 ? "positive" : "negative"}
                    icon="arrowUpCircle"
                    tooltip="Percentage of clients who converted from trial to paid"
                    metrics={[
                      { label: "Converted", value: data.convertedClients || 0, status: "positive" },
                      { label: "Trials", value: data.trials || 0, status: "neutral" }
                    ]}
                  />
                  <StudioMetricCard 
                    title="Retention Rate" 
                    value={`${data.retentionRate.toFixed(1)}%`}
                    location={data.location} 
                    prevValue="45.0%"
                    changeType={data.retentionRate > 50 ? "positive" : "negative"}
                    icon="repeat"
                    tooltip="Percentage of clients who returned after initial visit"
                    metrics={[
                      { label: "Retained", value: data.retainedClients || 0, status: "positive" },
                      { label: "Churn", value: data.newClients - data.retainedClients, status: "negative" }
                    ]}
                  />
                  <StudioMetricCard 
                    title="Total Revenue" 
                    value={`₹${data.totalRevenue.toLocaleString()}`}
                    location={data.location}
                    prevValue={`₹${(data.totalRevenue * 0.8).toLocaleString()}`}
                    changeType="positive"
                    icon="wallet"
                    tooltip="Total revenue generated"
                    metrics={[
                      { label: "Avg. Ticket", value: `₹${(data.totalRevenue / data.convertedClients || 0).toFixed(0)}`, status: "neutral" },
                      { label: "Memberships", value: data.memberships || 0, status: "positive" }
                    ]}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Client Acquisition Sources</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                      <ClientSourceChart 
                        data={[
                          { name: 'Trials', value: data.trials || 0 },
                          { name: 'Referrals', value: data.referrals || 0 },
                          { name: 'Hosted', value: data.hosted || 0 },
                          { name: 'Influencer', value: data.influencerSignups || 0 },
                          { name: 'Others', value: data.others || 0 }
                        ]}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Conversion Rates</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                      <ConversionRatesChart 
                        data={[
                          { name: 'Conversion Rate', value: data.conversionRate || 0 },
                          { name: 'Retention Rate', value: data.retentionRate || 0 }
                        ]}
                      />
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Week</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[200px]">
                    <RevenueChart data={data.revenueByWeek || []} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="conversion" className="m-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-4">
                        <PerformanceMetricCard
                          title="New Clients"
                          value={data.newClients.toString()}
                          icon={<Users className="h-4 w-4 text-blue-500" />}
                          tooltip="Total number of new clients"
                        />
                        <PerformanceMetricCard
                          title="Converted Clients"
                          value={data.convertedClients.toString()}
                          icon={<Users className="h-4 w-4 text-green-500" />}
                          tooltip="Clients who purchased after trial"
                        />
                        <PerformanceMetricCard
                          title="Conversion Rate"
                          value={`${data.conversionRate.toFixed(1)}%`}
                          icon={<BarChart className="h-4 w-4 text-amber-500" />}
                          status={data.conversionRate > 10 ? "positive" : "negative"}
                          tooltip="Percentage of clients who converted from trial to paid"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Conversion Rate Comparison</CardTitle>
                          </CardHeader>
                          <CardContent className="h-[200px]">
                            <ConversionRatesChart 
                              data={[
                                { name: 'Conversion Rate', value: data.conversionRate || 0 }
                              ]}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="retention" className="m-0 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Retention Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-4">
                        <PerformanceMetricCard
                          title="New Clients"
                          value={data.newClients.toString()}
                          icon={<Users className="h-4 w-4 text-blue-500" />}
                          tooltip="Total number of new clients"
                        />
                        <PerformanceMetricCard
                          title="Retained Clients"
                          value={data.retainedClients.toString()}
                          icon={<Users className="h-4 w-4 text-green-500" />}
                          tooltip="Clients who returned after initial visit"
                        />
                        <PerformanceMetricCard
                          title="Retention Rate"
                          value={`${data.retentionRate.toFixed(1)}%`}
                          icon={<BarChart className="h-4 w-4 text-amber-500" />}
                          status={data.retentionRate > 50 ? "positive" : "negative"}
                          tooltip="Percentage of clients who returned after initial visit"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Retention Rate Comparison</CardTitle>
                          </CardHeader>
                          <CardContent className="h-[200px]">
                            <ConversionRatesChart 
                              data={[
                                { name: 'Retention Rate', value: data.retentionRate || 0 }
                              ]}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="clientData" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm flex items-center">
                            <Badge className="mr-2 bg-blue-500">New</Badge>
                            New Clients ({data.newClientDetails.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <ScrollArea className="h-[300px]">
                            <div className="p-4 space-y-3">
                              {data.newClientDetails.map((client, index) => (
                                <div key={index} className="border rounded-md p-3 bg-muted/20">
                                  <div className="font-medium">{client.name || 'N/A'}</div>
                                  <div className="text-xs text-muted-foreground">{client.email || 'N/A'}</div>
                                  
                                  <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                                    <div>First Visit:</div>
                                    <div className="font-medium">{formatClientValue(client.visitDate)}</div>
                                    
                                    <div>Source:</div>
                                    <div className="font-medium">{formatClientValue(client.sourceType)}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm flex items-center">
                            <Badge className="mr-2 bg-green-500">Retained</Badge>
                            Retained Clients ({data.retainedClientDetails.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <ScrollArea className="h-[300px]">
                            <div className="p-4 space-y-3">
                              {data.retainedClientDetails.map((client, index) => (
                                <div key={index} className="border rounded-md p-3 bg-muted/20">
                                  <div className="font-medium">{client.name || 'N/A'}</div>
                                  <div className="text-xs text-muted-foreground">{client.email || 'N/A'}</div>
                                  
                                  <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                                    <div>First Visit:</div>
                                    <div className="font-medium">{formatClientValue(client.visitDate)}</div>
                                    
                                    <div>Return Visits:</div>
                                    <div className="font-medium">{formatClientValue(client.visitCount)}</div>
                                    
                                    <div>Last Visit:</div>
                                    <div className="font-medium">{formatClientValue(client.lastVisit)}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm flex items-center">
                            <Badge className="mr-2 bg-purple-500">Converted</Badge>
                            Converted Clients ({data.convertedClientDetails.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <ScrollArea className="h-[300px]">
                            <div className="p-4 space-y-3">
                              {data.convertedClientDetails.map((client, index) => (
                                <div key={index} className="border rounded-md p-3 bg-muted/20">
                                  <div className="font-medium">{client.name || 'N/A'}</div>
                                  <div className="text-xs text-muted-foreground">{client.email || 'N/A'}</div>
                                  
                                  <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                                    <div>First Visit:</div>
                                    <div className="font-medium">{formatClientValue(client.visitDate)}</div>
                                    
                                    <div>First Purchase:</div>
                                    <div className="font-medium">{formatClientValue(client.purchaseDate)}</div>
                                    
                                    <div>Purchase Value:</div>
                                    <div className="font-medium">{formatClientValue(client.amount)}</div>
                                    
                                    <div>First Purchase Item:</div>
                                    <div className="font-medium">{formatClientValue(client.itemName)}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DrillDownAnalytics;
