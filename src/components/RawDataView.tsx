
import React, { useState } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileText, Users, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface RawDataViewProps {
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

const RawDataView: React.FC<RawDataViewProps> = ({
  newClientData,
  bookingsData,
  paymentsData,
  processingResults
}) => {
  const [searchText, setSearchText] = useState('');
  
  // Function to filter data based on search text
  const filterData = (data: any[]) => {
    if (!searchText.trim()) return data;
    const searchLower = searchText.toLowerCase();
    
    return data.filter(item => {
      // Check if any value in the item contains the search text
      return Object.values(item).some(
        value => value && typeof value === 'string' && value.toLowerCase().includes(searchLower)
      );
    });
  };
  
  // Function to get unique records from excluded/included reasons
  // This solves the duplicate records issue
  const getUniqueRecords = (records: any[]) => {
    const uniqueMap = new Map();
    
    records.forEach(record => {
      const key = record.email || record.name || JSON.stringify(record);
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, record);
      }
    });
    
    return Array.from(uniqueMap.values());
  };
  
  // Properly format the client info
  const formatClientInfo = (client: any) => {
    const name = client.name || client.studentName || client['Student Name'] || client['Client Name'] || 'N/A';
    const email = client.email || client['Email Id'] || client['Email'] || 'N/A';
    const date = client.date || client['Registration Date'] || client['Date'] || 'N/A';
    
    return `${name} (${email}) - ${date}`;
  };

  // Display exclusion reasons with data
  const renderExclusionReasons = () => {
    const uniqueExcluded = getUniqueRecords(processingResults.excluded);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Exclusion Reasons ({uniqueExcluded.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {uniqueExcluded.map((record, index) => (
                <div key={index} className="border rounded-lg p-3 bg-muted/20">
                  <div className="font-medium">#{index + 1}</div>
                  <div className="text-sm">{formatClientInfo(record)}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Reason: {record.exclusionReason || 'Not specified'}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  // Display new client info
  const renderNewClientReasons = () => {
    const uniqueNewClients = getUniqueRecords(processingResults.newClients);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            New Client Details ({uniqueNewClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {uniqueNewClients.map((record, index) => (
                <div key={index} className="border rounded-lg p-3 bg-muted/20">
                  <div className="font-medium">#{index + 1}</div>
                  <div className="text-sm">{formatClientInfo(record)}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    First visit: {record.firstVisitDate || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Source: {record.source || record.acquisitionSource || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  // Display retention info
  const renderRetentionReasons = () => {
    const uniqueRetained = getUniqueRecords(processingResults.retainedClients);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-green-500" />
            Retained Client Details ({uniqueRetained.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {uniqueRetained.map((record, index) => (
                <div key={index} className="border rounded-lg p-3 bg-muted/20">
                  <div className="font-medium">#{index + 1}</div>
                  <div className="text-sm">{formatClientInfo(record)}</div>
                  <div className="mt-1 text-sm">
                    Had return visits after initial trial
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Visits: {record.visitCount || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    First visit post trial: {record.firstVisitPostTrial || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Membership: {record.membershipType || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  // Display conversion info
  const renderConversionReasons = () => {
    const uniqueConverted = getUniqueRecords(processingResults.convertedClients);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-500" />
            Converted Client Details ({uniqueConverted.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {uniqueConverted.map((record, index) => (
                <div key={index} className="border rounded-lg p-3 bg-muted/20">
                  <div className="font-medium">#{index + 1}</div>
                  <div className="text-sm">{formatClientInfo(record)}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    First purchase: {record.firstPurchaseDate || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Purchase value: {record.purchaseValue ? `₹${record.purchaseValue}` : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    First purchase item: {record.firstPurchaseItem || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">Raw Data & Processing</h2>
        <Input
          placeholder="Search data..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-64"
        />
      </div>
      
      <Tabs defaultValue="newClients">
        <TabsList className="mb-4">
          <TabsTrigger value="newClients" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>New Client Data</span>
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Bookings Data</span>
          </TabsTrigger>
          {paymentsData.length > 0 && (
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Payments Data</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="processing" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Processing Analysis</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="newClients">
          <Card>
            <CardHeader>
              <CardTitle>New Client Data ({newClientData.length} records)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {newClientData.length > 0 && Object.keys(newClientData[0]).map((key) => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterData(newClientData).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Object.entries(row).map(([key, value], cellIndex) => (
                          <TableCell key={`${rowIndex}-${cellIndex}`}>
                            {value !== null && value !== undefined ? value.toString() : 'N/A'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Bookings Data ({bookingsData.length} records)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {bookingsData.length > 0 && Object.keys(bookingsData[0]).map((key) => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterData(bookingsData).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Object.entries(row).map(([key, value], cellIndex) => (
                          <TableCell key={`${rowIndex}-${cellIndex}`}>
                            {value !== null && value !== undefined ? value.toString() : 'N/A'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {paymentsData.length > 0 && (
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payments Data ({paymentsData.length} records)</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {paymentsData.length > 0 && Object.keys(paymentsData[0]).map((key) => (
                          <TableHead key={key}>{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterData(paymentsData).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {Object.entries(row).map(([key, value], cellIndex) => (
                            <TableCell key={`${rowIndex}-${cellIndex}`}>
                              {value !== null && value !== undefined ? value.toString() : 'N/A'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        <TabsContent value="processing">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderExclusionReasons()}
            {renderNewClientReasons()}
            {renderRetentionReasons()}
            {renderConversionReasons()}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RawDataView;
