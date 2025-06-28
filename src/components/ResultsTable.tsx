
import React, { useState, useMemo, useCallback } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Store, MapPin, Eye, ArrowUpDown, Settings, Sparkles, Table as TableIcon, LayoutGrid, List, BarChart, PieChart, Users, UserPlus, Target, Shield, TrendingUp, Award, DollarSign, Calculator, ChevronRight } from 'lucide-react';
import TableViewOptions from './TableViewOptions';

interface ResultsTableProps {
  data: ProcessedTeacherData[];
  locations: string[];
  isLoading: boolean;
  viewMode: string;
  dataMode: string;
  onFilterChange: (filters: {
    location?: string;
    teacher?: string;
    period?: string;
    search?: string;
  }) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  data,
  locations,
  isLoading,
  viewMode,
  dataMode,
  onFilterChange
}) => {
  const [activeGroupBy, setActiveGroupBy] = useState('none');
  const [visibleColumns, setVisibleColumns] = useState([
    'teacherName',
    'location',
    'period',
    'clients',
    'newClients',
    'convertedClients',
    'retainedClients',
    'conversionRate',
    'retentionRate',
    'revenue',
    'averageRevenue'
  ]);
  const [activeSort, setActiveSort] = useState({
    column: 'teacherName',
    direction: 'asc' as 'asc' | 'desc'
  });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (activeGroupBy !== 'none') {
      result = result.sort((a, b) => {
        if (a[activeGroupBy as keyof ProcessedTeacherData] < b[activeGroupBy as keyof ProcessedTeacherData]) {
          return -1;
        }
        if (a[activeGroupBy as keyof ProcessedTeacherData] > b[activeGroupBy as keyof ProcessedTeacherData]) {
          return 1;
        }
        return 0;
      });
    }
    if (activeSort.column) {
      result = [...result].sort((a, b) => {
        const aValue = a[activeSort.column as keyof ProcessedTeacherData];
        const bValue = b[activeSort.column as keyof ProcessedTeacherData];
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return activeSort.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return activeSort.direction === 'asc' ? aValue - bValue : bValue - aValue;
        } else {
          return 0;
        }
      });
    }
    return result;
  }, [data, activeGroupBy, activeSort]);

  const totals = useMemo(() => {
    const initialTotals = {
      clients: 0,
      newClients: 0,
      convertedClients: 0,
      retainedClients: 0,
      revenue: 0,
      avgConversionRate: 0,
      avgRetentionRate: 0,
      avgRevenue: 0
    };
    if (!filteredData || filteredData.length === 0) {
      return initialTotals;
    }
    const calculatedTotals = filteredData.reduce((acc, item) => {
      acc.clients += item.clients || 0;
      acc.newClients += item.newClients || 0;
      acc.convertedClients += item.convertedClients || 0;
      acc.retainedClients += item.retainedClients || 0;
      acc.revenue += item.revenue || 0;
      return acc;
    }, {
      ...initialTotals
    });
    const numberOfTeachers = filteredData.length;
    calculatedTotals.avgConversionRate = numberOfTeachers > 0 ? filteredData.reduce((sum, item) => sum + (item.conversionRate || 0), 0) / numberOfTeachers : 0;
    calculatedTotals.avgRetentionRate = numberOfTeachers > 0 ? filteredData.reduce((sum, item) => sum + (item.retentionRate || 0), 0) / numberOfTeachers : 0;
    calculatedTotals.avgRevenue = numberOfTeachers > 0 ? calculatedTotals.revenue / numberOfTeachers : 0;
    return calculatedTotals;
  }, [filteredData]);

  const availableColumns = useMemo(() => {
    if (data.length === 0) {
      return [];
    }
    const firstItem = data[0];
    return Object.keys(firstItem);
  }, [data]);

  const onViewChange = (view: string) => {
    console.log('ResultsTable: View changed to:', view);
  };

  const onGroupByChange = (field: string) => {
    console.log('ResultsTable: Group by changed to:', field);
    setActiveGroupBy(field);
  };

  const onVisibilityChange = (columns: string[]) => {
    console.log('ResultsTable: Visibility changed to:', columns);
    setVisibleColumns(columns);
  };

  const onSortChange = (column: string, direction: 'asc' | 'desc') => {
    console.log('ResultsTable: Sort changed to:', column, direction);
    setActiveSort({
      column,
      direction
    });
  };

  const handleSort = (column: string) => {
    if (activeSort.column === column) {
      setActiveSort({
        ...activeSort,
        direction: activeSort.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setActiveSort({
        column,
        direction: 'asc'
      });
    }
  };

  const toggleRowExpansion = (rowKey: string) => {
    setExpandedRow(expandedRow === rowKey ? null : rowKey);
  };

  const getPerformanceBadge = (rate: number, type: 'conversion' | 'retention') => {
    const thresholds = type === 'conversion' ? [30, 60] : [70, 85];
    const colors = rate >= thresholds[1] ? 'success' : rate >= thresholds[0] ? 'warning' : 'destructive';
    const icon = type === 'conversion' ? Target : Shield;
    const IconComponent = icon;
    
    return (
      <Badge variant={colors} className="flex items-center gap-1 px-2 py-1 text-xs font-medium">
        <IconComponent className="h-3 w-3" />
        {rate.toFixed(1)}%
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Animated header with moving border */}
      <div className="relative overflow-hidden rounded-lg shadow-lg border border-white/20" style={{ maxHeight: '30px' }}>
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        
        {/* Animated bottom border */}
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-[slide-border_3s_ease-in-out_infinite]" />
        
        {/* Content */}
        <div className="relative px-6 py-2 flex justify-between items-center h-full">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BarChart className="h-3 w-3 text-white" />
            </div>
            <h2 className="text-sm font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Performance Analytics • {filteredData.length} records
            </h2>
          </div>
        </div>
      </div>

      {/* Table Options in Filter Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-white/30 p-4">
        <TableViewOptions 
          activeView={viewMode} 
          onViewChange={onViewChange} 
          onGroupByChange={onGroupByChange} 
          onVisibilityChange={onVisibilityChange} 
          onSortChange={onSortChange} 
          availableColumns={availableColumns} 
          visibleColumns={visibleColumns} 
          activeGroupBy={activeGroupBy} 
          activeSort={activeSort} 
        />
      </div>

      {/* Table with full height and all columns visible */}
      <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <Table maxHeight="calc(100vh - 250px)">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              {visibleColumns.includes('teacherName') && (
                <TableHead 
                  sortable 
                  sortDirection={activeSort.column === 'teacherName' ? activeSort.direction : undefined} 
                  onSort={() => handleSort('teacherName')} 
                  className="group text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <User className="h-4 w-4 text-blue-400 transition-transform duration-300 group-hover:scale-110" />
                    Teacher
                  </div>
                </TableHead>
              )}
              {visibleColumns.includes('location') && (
                <TableHead 
                  sortable 
                  sortDirection={activeSort.column === 'location' ? activeSort.direction : undefined} 
                  onSort={() => handleSort('location')} 
                  className="group text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4 text-green-400 transition-transform duration-300 group-hover:scale-110" />
                    Location
                  </div>
                </TableHead>
              )}
              {visibleColumns.includes('period') && (
                <TableHead 
                  sortable 
                  sortDirection={activeSort.column === 'period' ? activeSort.direction : undefined} 
                  onSort={() => handleSort('period')} 
                  className="group text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-400 transition-transform duration-300 group-hover:scale-110" />
                    Period
                  </div>
                </TableHead>
              )}
              {visibleColumns.includes('clients') && (
                <TableHead 
                  sortable 
                  sortDirection={activeSort.column === 'clients' ? activeSort.direction : undefined} 
                  onSort={() => handleSort('clients')} 
                  className="group text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-4 w-4 text-cyan-400 transition-transform duration-300 group-hover:scale-110" />
                    Total Clients
                  </div>
                </TableHead>
              )}
              {visibleColumns.includes('newClients') && (
                <TableHead 
                  sortable 
                  sortDirection={activeSort.column === 'newClients' ? activeSort.direction : undefined} 
                  onSort={() => handleSort('newClients')} 
                  className="group text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <UserPlus className="h-4 w-4 text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
                    New Clients
                  </div>
                </TableHead>
              )}
              {visibleColumns.includes('convertedClients') && (
                <TableHead 
                  sortable 
                  sortDirection={activeSort.column === 'convertedClients' ? activeSort.direction : undefined} 
                  onSort={() => handleSort('convertedClients')} 
                  className="group text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Target className="h-4 w-4 text-orange-400 transition-transform duration-300 group-hover:scale-110" />
                    Converted
                  </div>
                </TableHead>
              )}
              {visibleColumns.includes('retainedClients') && (
                <TableHead 
                  sortable 
                  sortDirection={activeSort.column === 'retainedClients' ? activeSort.direction : undefined} 
                  onSort={() => handleSort('retainedClients')} 
                  className="group text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="h-4 w-4 text-indigo-400 transition-transform duration-300 group-hover:scale-110" />
                    Retained
                  </div>
                </TableHead>
              )}
              {visibleColumns.includes('conversionRate') && (
                <TableHead 
                  sortable 
                  sortDirection={activeSort.column === 'conversionRate' ? activeSort.direction : undefined} 
                  onSort={() => handleSort('conversionRate')} 
                  className="group text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="h-4 w-4 text-amber-400 transition-transform duration-300 group-hover:scale-110" />
                    Conversion %
                  </div>
                </TableHead>
              )}
              {visibleColumns.includes('retentionRate') && (
                <TableHead 
                  sortable 
                  sortDirection={activeSort.column === 'retentionRate' ? activeSort.direction : undefined} 
                  onSort={() => handleSort('retentionRate')} 
                  className="group text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Award className="h-4 w-4 text-pink-400 transition-transform duration-300 group-hover:scale-110" />
                    Retention %
                  </div>
                </TableHead>
              )}
              {visibleColumns.includes('revenue') && (
                <TableHead 
                  sortable 
                  sortDirection={activeSort.column === 'revenue' ? activeSort.direction : undefined} 
                  onSort={() => handleSort('revenue')} 
                  className="group text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-400 transition-transform duration-300 group-hover:scale-110" />
                    Revenue
                  </div>
                </TableHead>
              )}
              {visibleColumns.includes('averageRevenue') && (
                <TableHead 
                  sortable 
                  sortDirection={activeSort.column === 'averageRevenue' ? activeSort.direction : undefined} 
                  onSort={() => handleSort('averageRevenue')} 
                  className="group text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Calculator className="h-4 w-4 text-teal-400 transition-transform duration-300 group-hover:scale-110" />
                    Avg Revenue
                  </div>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {filteredData.map(item => {
              const rowKey = `${item.teacherName}-${item.location}-${item.period}`;
              const isExpanded = expandedRow === rowKey;
              
              return (
                <React.Fragment key={rowKey}>
                  <TableRow className="cursor-pointer" onClick={() => toggleRowExpansion(rowKey)}>
                    <TableCell className="text-center">
                      <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </TableCell>
                    {visibleColumns.includes('teacherName') && <TableCell className="text-center whitespace-nowrap">{item.teacherName}</TableCell>}
                    {visibleColumns.includes('location') && <TableCell className="text-center whitespace-nowrap">{item.location}</TableCell>}
                    {visibleColumns.includes('period') && <TableCell className="text-center whitespace-nowrap">{item.period}</TableCell>}
                    {visibleColumns.includes('clients') && <TableCell className="text-center whitespace-nowrap">{item.clients || 0}</TableCell>}
                    {visibleColumns.includes('newClients') && <TableCell className="text-center whitespace-nowrap">{item.newClients || 0}</TableCell>}
                    {visibleColumns.includes('convertedClients') && <TableCell className="text-center whitespace-nowrap">{item.convertedClients || 0}</TableCell>}
                    {visibleColumns.includes('retainedClients') && <TableCell className="text-center whitespace-nowrap">{item.retainedClients || 0}</TableCell>}
                    {visibleColumns.includes('conversionRate') && (
                      <TableCell className="text-center whitespace-nowrap">
                        {getPerformanceBadge(item.conversionRate || 0, 'conversion')}
                      </TableCell>
                    )}
                    {visibleColumns.includes('retentionRate') && (
                      <TableCell className="text-center whitespace-nowrap">
                        {getPerformanceBadge(item.retentionRate || 0, 'retention')}
                      </TableCell>
                    )}
                    {visibleColumns.includes('revenue') && <TableCell className="text-center whitespace-nowrap">${(item.revenue || 0).toLocaleString()}</TableCell>}
                    {visibleColumns.includes('averageRevenue') && <TableCell className="text-center whitespace-nowrap">${(item.averageRevenue || 0).toLocaleString()}</TableCell>}
                  </TableRow>
                  
                  {/* Drill-down analytics row */}
                  {isExpanded && (
                    <TableRow className="bg-slate-50">
                      <TableCell colSpan={visibleColumns.length + 1} className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white rounded-lg p-4 shadow-sm border">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">Performance</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {((item.conversionRate || 0) + (item.retentionRate || 0) / 2).toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">Overall Score</div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 shadow-sm border">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium">Revenue/Client</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                              ${item.clients ? ((item.revenue || 0) / item.clients).toFixed(0) : '0'}
                            </div>
                            <div className="text-xs text-gray-500">Average Value</div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 shadow-sm border">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="h-4 w-4 text-purple-500" />
                              <span className="text-sm font-medium">Client Growth</span>
                            </div>
                            <div className="text-2xl font-bold text-purple-600">
                              +{item.newClients || 0}
                            </div>
                            <div className="text-xs text-gray-500">New This Period</div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 shadow-sm border">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-4 w-4 text-orange-500" />
                              <span className="text-sm font-medium">Success Rate</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-600">
                              {item.convertedClients && item.newClients ? 
                                ((item.convertedClients / item.newClients) * 100).toFixed(1) : '0'}%
                            </div>
                            <div className="text-xs text-gray-500">New to Converted</div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
          
          {/* Enhanced totals footer */}
          <TableFooter>
            <TableRow className="hover:bg-transparent">
              <TableCell></TableCell>
              {visibleColumns.includes('teacherName') && (
                <TableCell className="font-bold text-white text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-2 w-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
                    TOTALS
                  </div>
                </TableCell>
              )}
              {visibleColumns.includes('location') && <TableCell className="text-white/80 text-center">—</TableCell>}
              {visibleColumns.includes('period') && <TableCell className="text-white/80 text-center">—</TableCell>}
              {visibleColumns.includes('clients') && (
                <TableCell className="font-bold text-white text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-3 w-3 text-cyan-400" />
                    {totals.clients.toLocaleString()}
                  </div>
                </TableCell>
              )}
              {visibleColumns.includes('newClients') && (
                <TableCell className="font-bold text-white text-center">
                  <div className="flex items-center justify-center gap-1">
                    <UserPlus className="h-3 w-3 text-emerald-400" />
                    {totals.newClients.toLocaleString()}
                  </div>
                </TableCell>
              )}
              {visibleColumns.includes('convertedClients') && (
                <TableCell className="font-bold text-white text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Target className="h-3 w-3 text-orange-400" />
                    {totals.convertedClients.toLocaleString()}
                  </div>
                </TableCell>
              )}
              {visibleColumns.includes('retainedClients') && (
                <TableCell className="font-bold text-white text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3 text-indigo-400" />
                    {totals.retainedClients.toLocaleString()}
                  </div>
                </TableCell>
              )}
              {visibleColumns.includes('conversionRate') && (
                <TableCell className="font-bold text-white text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-3 w-3 text-amber-400" />
                    {totals.avgConversionRate.toFixed(1)}%
                  </div>
                </TableCell>
              )}
              {visibleColumns.includes('retentionRate') && (
                <TableCell className="font-bold text-white text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Award className="h-3 w-3 text-pink-400" />
                    {totals.avgRetentionRate.toFixed(1)}%
                  </div>
                </TableCell>
              )}
              {visibleColumns.includes('revenue') && (
                <TableCell className="font-bold text-white text-center">
                  <div className="flex items-center justify-center gap-1">
                    <DollarSign className="h-3 w-3 text-green-400" />
                    ${totals.revenue.toLocaleString()}
                  </div>
                </TableCell>
              )}
              {visibleColumns.includes('averageRevenue') && (
                <TableCell className="font-bold text-white text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Calculator className="h-3 w-3 text-teal-400" />
                    ${totals.avgRevenue.toLocaleString()}
                  </div>
                </TableCell>
              )}
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};

export default ResultsTable;
