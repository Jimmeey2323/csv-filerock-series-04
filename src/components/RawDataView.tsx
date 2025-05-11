
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, Filter } from 'lucide-react';

interface RawDataProps {
  newClientData: any[];
  bookingsData: any[];
  paymentsData: any[];
  processingResults: {
    included: any[];
    excluded: any[];
    newClients: any[];
    convertedClients: any[];
    retainedClients: any[];
  };
}

const RawDataView: React.FC<RawDataProps> = ({
  newClientData,
  bookingsData,
  paymentsData,
  processingResults
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filterData = (data: any[]) => {
    if (!searchTerm) return data;
    return data.filter(item => 
      Object.values(item).some(val => 
        val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const renderDataTable = (data: any[], type: string) => {
    if (!data || data.length === 0) return <p className="text-center py-8">No data available</p>;
    
    const filteredData = filterData(data);
    const columns = Object.keys(filteredData[0] || {});
    
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              {type} Data
              <Badge variant="outline" className="ml-2">{filteredData.length} rows</Badge>
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search data..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[450px] rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                  {type === 'Processing Results' && <TableHead>Status/Reason</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column) => (
                      <TableCell key={`${rowIndex}-${column}`}>
                        {row[column] !== undefined ? row[column].toString() : ''}
                      </TableCell>
                    ))}
                    
                    {type === 'Processing Results' && (
                      <TableCell>
                        {processingResults.excluded.some(item => item.id === row.id || item.email === row.email) ? (
                          <Badge variant="destructive">Excluded</Badge>
                        ) : processingResults.newClients.some(item => item.id === row.id || item.email === row.email) ? (
                          <Badge variant="default">New Client</Badge>
                        ) : processingResults.convertedClients.some(item => item.id === row.id || item.email === row.email) ? (
                          <Badge variant="success">Converted</Badge>
                        ) : processingResults.retainedClients.some(item => item.id === row.id || item.email === row.email) ? (
                          <Badge variant="outline">Retained</Badge>
                        ) : (
                          <Badge variant="secondary">Processed</Badge>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  // Helper function to format client name
  const formatClientName = (client: any) => {
    if (client['First name'] && client['Last name']) {
      return `${client['First name']} ${client['Last name']}`;
    } else if (client.name) {
      return client.name;
    } else if (client.customerName) {
      return client.customerName;
    } else if (client['Email'] || client.email) {
      return client['Email'] || client.email;
    }
    return 'Unknown';
  };

  // Helper to get email
  const getClientEmail = (client: any) => {
    return client['Email'] || client.email || '';
  };

  // Helper to get dates
  const getFirstVisitDate = (client: any) => {
    return client['First visit at'] || client.firstVisit || client.date || '';
  };

  // Remove duplicate exclusion records by email
  const getUniqueExcluded = () => {
    const seen = new Set();
    return processingResults.excluded.filter(item => {
      const email = getClientEmail(item);
      if (email && !seen.has(email)) {
        seen.add(email);
        return true;
      }
      return false;
    });
  };

  // Get unique excluded records
  const uniqueExcludedRecords = getUniqueExcluded();

  const renderProcessingTab = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Processing Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Total Records</div>
                  <div className="text-2xl font-semibold">{processingResults.included.length + uniqueExcludedRecords.length}</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Included</div>
                  <div className="text-2xl font-semibold">{processingResults.included.length}</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Excluded</div>
                  <div className="text-2xl font-semibold">{uniqueExcludedRecords.length}</div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Conversion Rate</div>
                  <div className="text-2xl font-semibold">
                    {processingResults.newClients.length > 0 
                      ? `${((processingResults.convertedClients.length / processingResults.newClients.length) * 100).toFixed(1)}%`
                      : '0%'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exclusion Reasons</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[180px]">
                <div className="space-y-2">
                  {uniqueExcludedRecords.map((item, index) => (
                    <div key={index} className="flex items-start border-b py-2">
                      <Badge variant="outline" className="mr-2 mt-0.5">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{formatClientName(item)}</p>
                        <p className="text-sm text-muted-foreground">{item.reason || 'No reason specified'}</p>
                        <p className="text-xs text-muted-foreground">{getClientEmail(item)}</p>
                        <p className="text-xs text-muted-foreground">{getFirstVisitDate(item)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">New Client Reasons</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[240px]">
                <div className="space-y-2">
                  {processingResults.newClients.map((item, index) => (
                    <div key={index} className="flex items-start border-b py-2">
                      <Badge variant="default" className="mr-2 mt-0.5">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{formatClientName(item)}</p>
                        <p className="text-sm text-muted-foreground">{item.reason || 'First time visitor'}</p>
                        <p className="text-xs text-muted-foreground">{getClientEmail(item)}</p>
                        <p className="text-xs text-muted-foreground">{getFirstVisitDate(item)}</p>
                        <p className="text-xs text-muted-foreground">Membership: {item['Membership used'] || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversion/Retention Reasons</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[240px]">
                <Tabs defaultValue="converted">
                  <TabsList className="w-full">
                    <TabsTrigger value="converted" className="flex-1">Converted</TabsTrigger>
                    <TabsTrigger value="retained" className="flex-1">Retained</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="converted">
                    <div className="space-y-2 pt-2">
                      {processingResults.convertedClients.map((item, index) => (
                        <div key={index} className="flex items-start border-b py-2">
                          <Badge variant="success" className="mr-2 mt-0.5">#{index + 1}</Badge>
                          <div>
                            <p className="font-medium">{formatClientName(item)}</p>
                            <p className="text-sm text-muted-foreground">{item.reason || 'Purchased membership'}</p>
                            <p className="text-xs text-muted-foreground">Email: {getClientEmail(item)}</p>
                            <p className="text-xs text-muted-foreground">First visit: {item['First visit at'] || item.firstVisit || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">First purchase: {item.saleDate || item.purchaseDate || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">Purchase item: {item.item || item.purchaseItem || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">Value: {item.saleValue ? `₹${item.saleValue}` : 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="retained">
                    <div className="space-y-2 pt-2">
                      {processingResults.retainedClients.map((item, index) => (
                        <div key={index} className="flex items-start border-b py-2">
                          <Badge variant="outline" className="mr-2 mt-0.5">#{index + 1}</Badge>
                          <div>
                            <p className="font-medium">{formatClientName(item)}</p>
                            <p className="text-sm text-muted-foreground">{item.reason || 'Multiple visits'}</p>
                            <p className="text-xs text-muted-foreground">Email: {getClientEmail(item)}</p>
                            <p className="text-xs text-muted-foreground">First visit: {item['First visit at'] || item.firstVisit || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">Visits: {item.visitsCount || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">Membership: {item['Membership used'] || 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <Tabs defaultValue="processing" className="w-full">
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="processing" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Processing Analysis</span>
        </TabsTrigger>
        <TabsTrigger value="new" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>New Clients</span>
        </TabsTrigger>
        <TabsTrigger value="bookings" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Bookings</span>
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Payments</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="processing">
        {renderProcessingTab()}
      </TabsContent>
      
      <TabsContent value="new">
        {renderDataTable(newClientData, 'New Client')}
      </TabsContent>
      
      <TabsContent value="bookings">
        {renderDataTable(bookingsData, 'Bookings')}
      </TabsContent>
      
      <TabsContent value="payments">
        {renderDataTable(paymentsData || [], 'Payments')}
      </TabsContent>
    </Tabs>
  );
};

export default RawDataView;
