
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { safeToFixed, safeFormatCurrency } from '@/lib/utils';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  ChevronDown,
  ChevronRight,
  Eye,
  MapPin,
  User,
  BarChart3,
  Table as TableIcon
} from 'lucide-react';
import DrillDownAnalytics from '@/components/DrillDownAnalytics';

interface ResultsTableProps {
  data: ProcessedTeacherData[];
  locations: string[];
  isLoading: boolean;
  viewMode: 'table' | 'cards' | 'detailed' | 'pivot';
  dataMode: 'teacher' | 'studio';
  onFilterChange: (filters: any) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  locations,
  isLoading,
  viewMode,
  dataMode,
  onFilterChange
}) => {
  const [drillDownData, setDrillDownData] = useState<ProcessedTeacherData | null>(null);
  const [drillDownType, setDrillDownType] = useState<'teacher' | 'studio' | 'location' | 'period' | 'totals'>('teacher');
  const [drillDownMetricType, setDrillDownMetricType] = useState<'conversion' | 'retention' | 'all'>('all');
  const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = useState<string>('teacherName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Group data by location and sort by teacher names
  const groupedData = useMemo(() => {
    if (!data || data.length === 0) return {};
    
    const grouped = data.reduce((acc, item) => {
      const location = item.location || 'Unknown Location';
      if (!acc[location]) {
        acc[location] = [];
      }
      acc[location].push(item);
      return acc;
    }, {} as Record<string, ProcessedTeacherData[]>);

    // Sort each group by teacher name
    Object.keys(grouped).forEach(location => {
      grouped[location].sort((a, b) => {
        const nameA = a.teacherName || '';
        const nameB = b.teacherName || '';
        return sortDirection === 'asc' 
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
    });

    return grouped;
  }, [data, sortDirection]);

  // Calculate totals for each group and overall
  const calculateTotals = (items: ProcessedTeacherData[]) => {
    return items.reduce((acc, item) => ({
      newClients: acc.newClients + (item.newClients || 0),
      convertedClients: acc.convertedClients + (item.convertedClients || 0),
      retainedClients: acc.retainedClients + (item.retainedClients || 0),
      totalRevenue: acc.totalRevenue + (item.totalRevenue || 0),
      conversionRate: 0, // Will calculate after
      retentionRate: 0, // Will calculate after
    }), {
      newClients: 0,
      convertedClients: 0,
      retainedClients: 0,
      totalRevenue: 0,
      conversionRate: 0,
      retentionRate: 0,
    });
  };

  const overallTotals = useMemo(() => {
    const totals = calculateTotals(data);
    totals.conversionRate = totals.newClients > 0 ? (totals.convertedClients / totals.newClients) * 100 : 0;
    totals.retentionRate = totals.newClients > 0 ? (totals.retainedClients / totals.newClients) * 100 : 0;
    return totals;
  }, [data]);

  const toggleGroupCollapse = (location: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(location)) {
      newCollapsed.delete(location);
    } else {
      newCollapsed.add(location);
    }
    setCollapsedGroups(newCollapsed);
  };

  const handleDrillDown = (item: ProcessedTeacherData, type: 'teacher' | 'studio' | 'location', metricType: 'conversion' | 'retention' | 'all' = 'all') => {
    setDrillDownData(item);
    setDrillDownType(type);
    setDrillDownMetricType(metricType);
    setIsDrillDownOpen(true);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gradient-to-r from-slate-200 to-slate-100 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Simple fallback for pivot and detailed views to avoid component dependency issues
  if (viewMode === 'pivot' || viewMode === 'detailed') {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>
            {viewMode === 'pivot' ? 'Pivot Table View' : 'Detailed Metrics View'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {viewMode === 'pivot' ? 'Pivot table functionality coming soon...' : 'Detailed metrics view coming soon...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(groupedData).map(([location, items]) => (
          <div key={location} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{location}</h3>
              <Badge variant="outline">{items.length} teachers</Badge>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => handleDrillDown(item, 'teacher')}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {item.teacherName}
                    </span>
                    <Eye className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{item.newClients}</div>
                      <div className="text-sm text-blue-700">New Clients</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{safeToFixed(item.conversionRate, 1)}%</div>
                      <div className="text-sm text-green-700">Conversion</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{safeFormatCurrency(item.totalRevenue)}</div>
                      <div className="text-sm text-purple-700">Revenue</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{safeToFixed(item.retentionRate, 1)}%</div>
                      <div className="text-sm text-orange-700">Retention</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            Performance Analytics - Grouped by Location
          </span>
          <Badge variant="outline" className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            {data.length} teachers across {Object.keys(groupedData).length} locations
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>New Clients</TableHead>
                <TableHead>Converted</TableHead>
                <TableHead>Conversion %</TableHead>
                <TableHead>Retained</TableHead>
                <TableHead>Retention %</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedData).map(([location, items]) => {
                const isCollapsed = collapsedGroups.has(location);
                const groupTotals = calculateTotals(items);
                groupTotals.conversionRate = groupTotals.newClients > 0 ? (groupTotals.convertedClients / groupTotals.newClients) * 100 : 0;
                groupTotals.retentionRate = groupTotals.newClients > 0 ? (groupTotals.retainedClients / groupTotals.newClients) * 100 : 0;

                return (
                  <React.Fragment key={location}>
                    {/* Location Group Header */}
                    <TableRow className="bg-slate-50 hover:bg-slate-100 cursor-pointer" onClick={() => toggleGroupCollapse(location)}>
                      <TableCell>
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </TableCell>
                      <TableCell className="font-bold flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {location} ({items.length} teachers)
                      </TableCell>
                      <TableCell className="font-bold">{groupTotals.newClients}</TableCell>
                      <TableCell className="font-bold">{groupTotals.convertedClients}</TableCell>
                      <TableCell className="font-bold">{safeToFixed(groupTotals.conversionRate, 1)}%</TableCell>
                      <TableCell className="font-bold">{groupTotals.retainedClients}</TableCell>
                      <TableCell className="font-bold">{safeToFixed(groupTotals.retentionRate, 1)}%</TableCell>
                      <TableCell className="font-bold">{safeFormatCurrency(groupTotals.totalRevenue)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handleDrillDown(items[0], 'location');
                        }}>
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Teacher Rows */}
                    {!isCollapsed && items.map((item, index) => (
                      <TableRow key={index} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleDrillDown(item, 'teacher')}>
                        <TableCell></TableCell>
                        <TableCell className="font-medium pl-8">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {item.teacherName}
                          </div>
                        </TableCell>
                        <TableCell>{item.newClients}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.convertedClients}
                            <Badge variant={item.conversionRate > 10 ? "default" : "secondary"} className="text-xs">
                              {item.conversionRate > 10 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.conversionRate > 10 ? "default" : "secondary"}>
                            {safeToFixed(item.conversionRate, 1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>{item.retainedClients}</TableCell>
                        <TableCell>
                          <Badge variant={item.retentionRate > 50 ? "default" : "secondary"}>
                            {safeToFixed(item.retentionRate, 1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{safeFormatCurrency(item.totalRevenue)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            handleDrillDown(item, 'teacher');
                          }}>
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-slate-100">
                <TableCell></TableCell>
                <TableCell className="font-bold">GRAND TOTAL</TableCell>
                <TableCell className="font-bold">{overallTotals.newClients}</TableCell>
                <TableCell className="font-bold">{overallTotals.convertedClients}</TableCell>
                <TableCell className="font-bold">{safeToFixed(overallTotals.conversionRate, 1)}%</TableCell>
                <TableCell className="font-bold">{overallTotals.retainedClients}</TableCell>
                <TableCell className="font-bold">{safeToFixed(overallTotals.retentionRate, 1)}%</TableCell>
                <TableCell className="font-bold">{safeFormatCurrency(overallTotals.totalRevenue)}</TableCell>
                <TableCell>
                  <Button variant="secondary" size="sm" onClick={() => handleDrillDown(data[0], 'totals')}>
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Analytics
                  </Button>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>

      <DrillDownAnalytics
        isOpen={isDrillDownOpen}
        onClose={() => setIsDrillDownOpen(false)}
        data={drillDownData}
        type={drillDownType}
        metricType={drillDownMetricType}
      />
    </Card>
  );
};

export default ResultsTable;
