
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StudioMetricCard from './cards/StudioMetricCard';
import PerformanceMetricCard from './cards/PerformanceMetricCard';
import DrillDownAnalytics from './DrillDownAnalytics';
import ClientDetailsModal from './ClientDetailsModal';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { convertCamelToTitle } from '@/lib/utils';
import { ChevronDown, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import QuickFilterButtons from './QuickFilterButtons';

interface ResultsTableProps {
  data: ProcessedTeacherData[];
  locations: string[];
  isLoading: boolean;
  viewMode: 'table' | 'cards' | 'detailed';
  dataMode: 'teacher' | 'studio';
  onFilterChange: (filters: any) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ 
  data, 
  locations, 
  isLoading, 
  viewMode = 'table', 
  dataMode = 'teacher',
  onFilterChange
}) => {
  const [sortField, setSortField] = useState<string>('teacherName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeFilters, setActiveFilters] = useState<{[key: string]: boolean}>({});
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ProcessedTeacherData | null>(null);
  const [drillDownMetricType, setDrillDownMetricType] = useState<'conversion' | 'retention' | 'all'>('all');
  
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [clientDetailsType, setClientDetailsType] = useState<'new' | 'retained' | 'converted'>('new');
  const [clientDetailsTitle, setClientDetailsTitle] = useState('');
  const [clientDetailsDescription, setClientDetailsDescription] = useState('');
  const [selectedClientDetails, setSelectedClientDetails] = useState<any[]>([]);
  
  const hasData = data && data.length > 0;

  // Sort function
  const sortData = (data: ProcessedTeacherData[]) => {
    return [...data].sort((a, b) => {
      const fieldA = a[sortField as keyof ProcessedTeacherData];
      const fieldB = b[sortField as keyof ProcessedTeacherData];
      
      // Handle numeric sorting
      if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
      }
      
      // Handle string sorting
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB) 
          : fieldB.localeCompare(fieldA);
      }
      
      return 0;
    });
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = sortData(data);
  
  // Handle row click to show drill down
  const handleRowClick = (row: ProcessedTeacherData, metricType: 'conversion' | 'retention' | 'all' = 'all') => {
    setSelectedRow(row);
    setDrillDownMetricType(metricType);
    setShowDrillDown(true);
  };
  
  // Handle cell click for client details
  const handleClientDetailsClick = (
    row: ProcessedTeacherData, 
    type: 'new' | 'retained' | 'converted'
  ) => {
    setClientDetailsType(type);
    setSelectedRow(row);
    
    let clients: any[] = [];
    let title = "";
    let description = "";
    
    if (type === 'new') {
      clients = row.newClientDetails || [];
      title = `New Clients for ${row.teacherName}`;
      description = `${clients.length} new clients who took their first class with ${row.teacherName}${row.location ? ` at ${row.location}` : ''}`;
    } else if (type === 'retained') {
      clients = row.retainedClientDetails || [];
      title = `Retained Clients for ${row.teacherName}`;
      description = `${clients.length} clients who returned after their first visit with ${row.teacherName}${row.location ? ` at ${row.location}` : ''}`;
    } else if (type === 'converted') {
      clients = row.convertedClientDetails || [];
      title = `Converted Clients for ${row.teacherName}`;
      description = `${clients.length} clients who purchased a package after their first visit with ${row.teacherName}${row.location ? ` at ${row.location}` : ''}`;
    }
    
    setClientDetailsTitle(title);
    setClientDetailsDescription(description);
    setSelectedClientDetails(clients);
    setShowClientDetails(true);
  };
  
  const handleFilterClick = (filter: string) => {
    const newFilters = { ...activeFilters, [filter]: !activeFilters[filter] };
    setActiveFilters(newFilters);
    
    const activeFilterValues = Object.entries(newFilters)
      .filter(([_, isActive]) => isActive)
      .map(([key]) => key);
      
    // Apply filter
    if (activeFilterValues.length > 0) {
      onFilterChange({
        teacher: activeFilterValues.join(',')
      });
    } else {
      onFilterChange({ teacher: '' });
    }
  };

  // Table headers with proper labels and totals row
  const tableHeaders = [
    { key: 'teacherName', label: 'Teacher' },
    { key: 'location', label: 'Location' },
    { key: 'newClients', label: 'New Clients' },
    { key: 'retainedClients', label: 'Retained' },
    { key: 'convertedClients', label: 'Converted' },
    { key: 'conversionRate', label: 'Conv. Rate', format: (value: number) => `${value.toFixed(1)}%` },
    { key: 'retentionRate', label: 'Ret. Rate', format: (value: number) => `${value.toFixed(1)}%` },
    { key: 'totalRevenue', label: 'Revenue', format: (value: number) => `₹${value.toLocaleString()}` },
  ];

  // Calculate totals for each numeric column
  const calculateTotals = () => {
    if (!hasData) return {};
    
    const totals: {[key: string]: number} = {};
    const numericColumns = ['newClients', 'retainedClients', 'convertedClients', 'totalRevenue'];
    
    numericColumns.forEach(column => {
      totals[column] = data.reduce((sum, row) => {
        const value = row[column as keyof ProcessedTeacherData];
        return sum + (typeof value === 'number' ? value : 0);
      }, 0);
    });
    
    // Calculate weighted average for rates
    if (totals.newClients > 0) {
      totals.conversionRate = (totals.convertedClients / totals.newClients) * 100;
      totals.retentionRate = (totals.retainedClients / totals.newClients) * 100;
    } else {
      totals.conversionRate = 0;
      totals.retentionRate = 0;
    }
    
    return totals;
  };
  
  const totals = calculateTotals();
  
  // Generate a studio-wide data row for the totals
  const generateTotalsRow = (): ProcessedTeacherData => {
    const totalRow: any = {
      teacherName: 'All Teachers',
      location: 'All Locations',
      period: data[0]?.period || '',
      newClients: totals.newClients || 0,
      retainedClients: totals.retainedClients || 0,
      convertedClients: totals.convertedClients || 0,
      conversionRate: totals.conversionRate || 0,
      retentionRate: totals.retentionRate || 0,
      totalRevenue: totals.totalRevenue || 0,
      
      // Aggregate all client details from individual teachers
      newClientDetails: data.flatMap(d => d.newClientDetails || []),
      retainedClientDetails: data.flatMap(d => d.retainedClientDetails || []),
      convertedClientDetails: data.flatMap(d => d.convertedClientDetails || []),
      
      // Other required fields with sensible defaults
      noShowRate: 0,
      lateCancellationRate: 0,
      averageRevenuePerClient: totals.totalRevenue / (totals.convertedClients || 1),
    };
    
    return totalRow as ProcessedTeacherData;
  };
  
  const totalsRow = generateTotalsRow();

  // Render table
  if (viewMode === 'table') {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-wrap gap-3 mb-4">
          <QuickFilterButtons 
            data={data} 
            activeFilters={activeFilters}
            onFilterClick={handleFilterClick}
          />
        </div>
        
        <Card className="overflow-hidden border border-muted/40">
          <ScrollArea className="h-[calc(100vh-330px)]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/30">
                  {tableHeaders.map((header) => (
                    <TableHead 
                      key={header.key}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleSort(header.key)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{header.label}</span>
                        {sortField === header.key && (
                          sortDirection === 'asc' 
                            ? <ArrowUp className="h-3 w-3" /> 
                            : <ArrowDown className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Totals Row */}
                <TableRow 
                  className="bg-muted/20 font-medium hover:bg-muted/40 cursor-pointer transition-all"
                  onClick={() => handleRowClick(totalsRow)}
                >
                  <TableCell className="font-semibold">All Teachers</TableCell>
                  <TableCell>All Locations</TableCell>
                  <TableCell 
                    className="cursor-pointer hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClientDetailsClick(totalsRow, 'new');
                    }}
                  >
                    {totals.newClients}
                  </TableCell>
                  <TableCell 
                    className="cursor-pointer hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClientDetailsClick(totalsRow, 'retained');
                    }}
                  >
                    {totals.retainedClients}
                  </TableCell>
                  <TableCell 
                    className="cursor-pointer hover:text-primary transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClientDetailsClick(totalsRow, 'converted');
                    }}
                  >
                    {totals.convertedClients}
                  </TableCell>
                  <TableCell 
                    className={cn(
                      "font-medium",
                      totals.conversionRate > 10 ? "text-green-600" : "text-red-500"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(totalsRow, 'conversion');
                    }}
                  >
                    {totals.conversionRate.toFixed(1)}%
                  </TableCell>
                  <TableCell 
                    className={cn(
                      "font-medium",
                      totals.retentionRate > 50 ? "text-green-600" : "text-red-500"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(totalsRow, 'retention');
                    }}
                  >
                    {totals.retentionRate.toFixed(1)}%
                  </TableCell>
                  <TableCell className="font-medium">
                    ₹{totals.totalRevenue.toLocaleString()}
                  </TableCell>
                </TableRow>
                
                {/* Data Rows */}
                {sortedData.map((row, index) => (
                  <TableRow 
                    key={index}
                    className="hover:bg-muted/20 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(row)}
                  >
                    <TableCell className="font-medium">{row.teacherName}</TableCell>
                    <TableCell>{row.location}</TableCell>
                    <TableCell 
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClientDetailsClick(row, 'new');
                      }}
                    >
                      {row.newClients}
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClientDetailsClick(row, 'retained');
                      }}
                    >
                      {row.retainedClients}
                    </TableCell>
                    <TableCell 
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClientDetailsClick(row, 'converted');
                      }}
                    >
                      {row.convertedClients}
                    </TableCell>
                    <TableCell 
                      className={cn(
                        row.conversionRate > 10 ? "text-green-600" : "text-red-500"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(row, 'conversion');
                      }}
                    >
                      {row.conversionRate.toFixed(1)}%
                    </TableCell>
                    <TableCell 
                      className={cn(
                        row.retentionRate > 50 ? "text-green-600" : "text-red-500"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(row, 'retention');
                      }}
                    >
                      {row.retentionRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{row.totalRevenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>

        {/* Drill Down Analytics Modal */}
        {showDrillDown && selectedRow && (
          <DrillDownAnalytics
            isOpen={showDrillDown}
            onClose={() => setShowDrillDown(false)}
            data={selectedRow}
            type={selectedRow.teacherName === 'All Teachers' ? 'studio' : 'teacher'}
            metricType={drillDownMetricType}
          />
        )}
        
        {/* Client Details Modal */}
        {showClientDetails && selectedRow && (
          <ClientDetailsModal
            isOpen={showClientDetails}
            onClose={() => setShowClientDetails(false)}
            title={clientDetailsTitle}
            description={clientDetailsDescription}
            clients={selectedClientDetails}
            type={clientDetailsType}
          />
        )}
      </div>
    );
  }

  if (viewMode === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
        {sortedData.map((row, index) => (
          <PerformanceMetricCard
            key={index}
            title={row.teacherName}
            value={`₹${row.totalRevenue.toLocaleString()}`}
            teacherName={row.teacherName}
            location={row.location}
            newClients={row.newClients}
            retainedClients={row.retainedClients}
            convertedClients={row.convertedClients}
            conversionRate={row.conversionRate}
            retentionRate={row.retentionRate}
            totalRevenue={row.totalRevenue}
            onClick={() => handleRowClick(row)}
          />
        ))}
      </div>
    );
  }

  if (viewMode === 'detailed') {
    return (
      <div className="space-y-6 animate-fade-in">
        {locations.map((location) => (
          <div key={location} className="space-y-4">
            <h3 className="text-xl font-semibold">{location}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedData
                .filter((row) => row.location === location)
                .map((row, index) => (
                  <StudioMetricCard
                    key={index}
                    title={row.teacherName}
                    value={`₹${row.totalRevenue.toLocaleString()}`}
                    teacherName={row.teacherName}
                    location={row.location}
                    newClients={row.newClients}
                    retainedClients={row.retainedClients}
                    convertedClients={row.convertedClients}
                    conversionRate={row.conversionRate}
                    retentionRate={row.retentionRate}
                    totalRevenue={row.totalRevenue}
                    onClick={() => handleRowClick(row)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-48 text-muted-foreground">
      <p>Select a view mode to display data.</p>
    </div>
  );
};

export default ResultsTable;
