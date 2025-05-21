
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, Filter, AlertTriangle, Calendar, CalendarCheck, Clock, Users, UserCheck, UserPlus, UserX } from 'lucide-react';
import { safeFormatCurrency, safeFormatDate, daysBetweenDates, sortDataByColumn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterField, setFilterField] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [currentTab, setCurrentTab] = useState('processing');
  
  // Summary counts
  const newClientCount = processingResults.newClients?.length || 0;
  const excludedCount = processingResults.excluded?.length || 0;
  const totalClientsCount = (processingResults.included?.length || 0) + excludedCount;
  
  // Handle search input event
  useEffect(() => {
    const searchInput = document.getElementById('search-data-input');
    if (searchInput) {
      // Force focus to search input to fix keyboard input issues
      searchInput.addEventListener('click', () => {
        setTimeout(() => {
          const input = document.getElementById('search-data-input') as HTMLInputElement;
          if (input) {
            input.focus();
            input.select();
          }
        }, 0);
      });
    }
  }, [currentTab]);
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const filterData = (data: any[]) => {
    if (!data || !Array.isArray(data)) return [];
    
    // Apply search term filtering
    let filtered = data;
    if (searchTerm) {
      filtered = filtered.filter(item => 
        Object.values(item).some(val => 
          val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply specific field filtering
    if (filterField && filterValue) {
      filtered = filtered.filter(item => {
        const itemValue = item[filterField];
        return itemValue && itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
      });
    }
    
    // Apply sorting
    if (sortColumn) {
      filtered = sortDataByColumn(filtered, sortColumn, sortDirection);
    }
    
    return filtered;
  };

  // Helper function to deduplicate records by email
  const deduplicateByEmail = (records: any[]) => {
    if (!records || !Array.isArray(records)) return [];
    const seen = new Set();
    return records.filter(item => {
      const email = item['Email'] || item.email || '';
      if (email && !seen.has(email)) {
        seen.add(email);
        return true;
      }
      return false;
    });
  };

  const renderDataTable = (data: any[], type: string) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-xl font-medium mb-2">No {type} Data Available</p>
          <p className="text-muted-foreground max-w-md">
            No {type.toLowerCase()} data was found. Please ensure you've uploaded the correct CSV files.
          </p>
        </div>
      );
    }
    
    const filteredData = filterData(data);
    const columns = Object.keys(filteredData[0] || {});
    
    // Get available filter fields
    const filterFields = columns.filter(col => 
      !['id', 'uuid'].includes(col.toLowerCase())
    );
    
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                {type} Data
                <Badge variant="outline" className="ml-2 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {filteredData.length} rows
                </Badge>
              </CardTitle>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-data-input"
                  placeholder="Search data..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Field filter */}
              <div className="flex items-center gap-2">
                <Select value={filterField} onValueChange={setFilterField}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select field</SelectItem>
                    {filterFields.map(field => (
                      <SelectItem key={field} value={field}>{field}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {filterField && (
                  <Input
                    placeholder="Filter value..."
                    className="w-[180px]"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  />
                )}
                
                {(filterField || searchTerm) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setFilterField('');
                      setFilterValue('');
                      setSearchTerm('');
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[450px] rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead 
                      key={column}
                      sortable
                      sortDirection={sortColumn === column ? sortDirection : undefined}
                      onSort={() => handleSort(column)}
                    >
                      {column}
                    </TableHead>
                  ))}
                  {type === 'Processing Results' && <TableHead>Status/Reason</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="animate-fade-in" style={{ animationDelay: `${rowIndex * 30}ms` }}>
                    {columns.map((column) => (
                      <TableCell key={`${rowIndex}-${column}`}>
                        {column.toLowerCase().includes('date') && row[column] ? 
                          safeFormatDate(row[column], 'medium') : 
                        column.toLowerCase().includes('value') || column.toLowerCase().includes('revenue') || column.toLowerCase().includes('price') ?
                          safeFormatCurrency(row[column]) :
                          row[column] !== undefined ? row[column].toString() : ''}
                      </TableCell>
                    ))}
                    
                    {type === 'Processing Results' && (
                      <TableCell>
                        {processingResults.excluded.some(item => item.id === row.id || item.email === row.email) ? (
                          <Badge variant="excluded">Excluded</Badge>
                        ) : processingResults.newClients.some(item => item.id === row.id || item.email === row.email) ? (
                          <Badge variant="default">New Client</Badge>
                        ) : processingResults.convertedClients.some(item => item.id === row.id || item.email === row.email) ? (
                          <Badge variant="conversion">Converted</Badge>
                        ) : processingResults.retainedClients.some(item => item.id === row.id || item.email === row.email) ? (
                          <Badge variant="retention">Retained</Badge>
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
    if (!client) return 'Unknown';
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
    if (!client) return '';
    return client['Email'] || client.email || '';
  };

  // Helper to get dates
  const getFirstVisitDate = (client: any) => {
    if (!client) return '';
    return client['First visit at'] || client.firstVisit || client.date || '';
  };

  // Helper to get first purchase date
  const getFirstPurchaseDate = (client: any) => {
    if (!client) return '';
    return client['First purchase date'] || client.purchaseDate || client.date || client.firstPurchaseDate || '';
  };

  // Helper to calculate conversion span
  const getConversionSpan = (client: any) => {
    const firstVisit = getFirstVisitDate(client);
    const firstPurchase = getFirstPurchaseDate(client);
    
    if (firstVisit && firstPurchase) {
      const days = daysBetweenDates(firstVisit, firstPurchase);
      return `${days} days`;
    }
    return 'N/A';
  };

  // Helper to get first visit post trial
  const getFirstVisitPostTrial = (client: any) => {
    if (!client) return 'N/A';
    return client.firstVisitPostTrial || 
           client.postTrialVisitDate || 
           (client.visitsPostTrial && client.visitsPostTrial.length > 0 ? client.visitsPostTrial[0].date : 'N/A');
  };

  // Deduplicate exclusion records by email
  const uniqueExcludedRecords = deduplicateByEmail(processingResults.excluded || []);
  const hasProcessingData = processingResults && 
    ((processingResults.included && processingResults.included.length > 0) || 
     (processingResults.excluded && processingResults.excluded.length > 0) ||
     (processingResults.newClients && processingResults.newClients.length > 0) ||
     (processingResults.convertedClients && processingResults.convertedClients.length > 0) ||
     (processingResults.retainedClients && processingResults.retainedClients.length > 0));

  const renderProcessingTab = () => {
    if (!hasProcessingData) {
      return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-xl font-medium mb-2">No Processing Data Available</p>
          <p className="text-muted-foreground max-w-md">
            No processed data was found. Please ensure you've processed your CSV files correctly.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 gap-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Processing Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-muted/40 to-muted/10 rounded-lg p-4 animate-scale-in shadow-sm" style={{ animationDelay: '100ms' }}>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Total Records
                  </div>
                  <div className="text-2xl font-semibold">
                    {(processingResults.included?.length || 0) + (uniqueExcludedRecords?.length || 0)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-muted/40 to-muted/10 rounded-lg p-4 animate-scale-in shadow-sm" style={{ animationDelay: '200ms' }}>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Included
                  </div>
                  <div className="text-2xl font-semibold">{processingResults.included?.length || 0}</div>
                </div>
                <div className="bg-gradient-to-br from-muted/40 to-muted/10 rounded-lg p-4 animate-scale-in shadow-sm" style={{ animationDelay: '300ms' }}>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <UserX className="h-4 w-4 mr-2" />
                    Excluded
                  </div>
                  <div className="text-2xl font-semibold">{uniqueExcludedRecords?.length || 0}</div>
                </div>
                <div className="bg-gradient-to-br from-muted/40 to-muted/10 rounded-lg p-4 animate-scale-in shadow-sm" style={{ animationDelay: '400ms' }}>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Conversion Rate
                  </div>
                  <div className="text-2xl font-semibold">
                    {processingResults.newClients && processingResults.newClients.length > 0 && processingResults.convertedClients
                      ? `${(((processingResults.convertedClients.length || 0) / (processingResults.newClients.length || 1)) * 100).toFixed(1)}%`
                      : '0%'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <UserX className="h-5 w-5 mr-2" />
                Exclusion Reasons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[180px]">
                {uniqueExcludedRecords.length > 0 ? (
                  <div className="space-y-2">
                    {uniqueExcludedRecords.map((item, index) => (
                      <div key={index} className="flex items-start border-b py-2 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <Badge variant="excluded" className="mr-2 mt-0.5">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{formatClientName(item)}</p>
                          <p className="text-sm text-muted-foreground">{item.reason || 'No reason specified'}</p>
                          <p className="text-xs text-muted-foreground">{getClientEmail(item)}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            First visit: {safeFormatDate(getFirstVisitDate(item), 'medium')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No exclusions found</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                New Client Reasons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[240px]">
                {processingResults.newClients && processingResults.newClients.length > 0 ? (
                  <div className="space-y-2">
                    {processingResults.newClients.map((item, index) => (
                      <div key={index} className="flex items-start border-b py-2 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <Badge variant="default" className="mr-2 mt-0.5">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{formatClientName(item)}</p>
                          <p className="text-sm text-muted-foreground">{item.reason || 'First time visitor'}</p>
                          <p className="text-xs text-muted-foreground">{getClientEmail(item)}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            First visit: {safeFormatDate(getFirstVisitDate(item), 'medium')}
                          </p>
                          <p className="text-xs text-muted-foreground">{item['Membership used'] || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">No new clients found</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <UserCheck className="h-5 w-5 mr-2" />
                Conversion/Retention Reasons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[240px]">
                <Tabs defaultValue="converted">
                  <TabsList className="w-full">
                    <TabsTrigger value="converted" className="flex-1 flex items-center justify-center">
                      <Badge variant="conversion" className="mr-2">+</Badge> Converted
                    </TabsTrigger>
                    <TabsTrigger value="retained" className="flex-1 flex items-center justify-center">
                      <Badge variant="retention" className="mr-2">+</Badge> Retained
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="converted">
                    {processingResults.convertedClients && processingResults.convertedClients.length > 0 ? (
                      <div className="space-y-2 pt-2">
                        {processingResults.convertedClients.map((item, index) => (
                          <div key={index} className="flex items-start border-b py-2 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                            <Badge variant="conversion" className="mr-2 mt-0.5">#{index + 1}</Badge>
                            <div>
                              <p className="font-medium">{formatClientName(item)}</p>
                              <p className="text-sm text-muted-foreground">{item.reason || 'Purchased membership'}</p>
                              <p className="text-xs text-muted-foreground">{getClientEmail(item)}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                First visit: {safeFormatDate(getFirstVisitDate(item), 'medium')}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <CalendarCheck className="h-3 w-3" />
                                First purchase: {safeFormatDate(getFirstPurchaseDate(item), 'medium')}
                              </p>
                              <p className="text-xs text-muted-foreground">Purchase item: {item.item || item.purchaseItem || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">Value: {item.saleValue ? safeFormatCurrency(item.saleValue) : 'N/A'}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Conversion span: {getConversionSpan(item)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">No converted clients found</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="retained">
                    {processingResults.retainedClients && processingResults.retainedClients.length > 0 ? (
                      <div className="space-y-2 pt-2">
                        {processingResults.retainedClients.map((item, index) => (
                          <div key={index} className="flex items-start border-b py-2 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                            <Badge variant="retention" className="mr-2 mt-0.5">#{index + 1}</Badge>
                            <div>
                              <p className="font-medium">{formatClientName(item)}</p>
                              <p className="text-sm text-muted-foreground">{item.reason || 'Multiple visits'}</p>
                              <p className="text-xs text-muted-foreground">{getClientEmail(item)}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                First visit: {safeFormatDate(getFirstVisitDate(item), 'medium')}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <CalendarCheck className="h-3 w-3" />
                                First visit post trial: {safeFormatDate(getFirstVisitPostTrial(item), 'medium')}
                              </p>
                              <p className="text-xs text-muted-foreground">Visits: {item.visitsCount || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground">Membership: {item['Membership used'] || 'N/A'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-4 text-muted-foreground">No retained clients found</p>
                    )}
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
    <div className="space-y-4">
      <Card className="shadow-sm mb-4">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg shadow-sm flex flex-col items-center animate-scale-in">
              <div className="bg-blue-500/10 p-2 rounded-full mb-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-sm text-muted-foreground mb-1">New Clients</div>
              <div className="text-xl font-bold">{newClientCount}</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg shadow-sm flex flex-col items-center animate-scale-in" style={{ animationDelay: '100ms' }}>
              <div className="bg-red-500/10 p-2 rounded-full mb-2">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-sm text-muted-foreground mb-1">Excluded Clients</div>
              <div className="text-xl font-bold">{excludedCount}</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg shadow-sm flex flex-col items-center animate-scale-in" style={{ animationDelay: '200ms' }}>
              <div className="bg-purple-500/10 p-2 rounded-full mb-2">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-sm text-muted-foreground mb-1">Total Clients</div>
              <div className="text-xl font-bold">{totalClientsCount}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
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
          {renderDataTable(newClientData || [], 'New Client')}
        </TabsContent>
        
        <TabsContent value="bookings">
          {renderDataTable(bookingsData || [], 'Bookings')}
        </TabsContent>
        
        <TabsContent value="payments">
          {renderDataTable(paymentsData || [], 'Payments')}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RawDataView;
