
import React, { useState, useMemo, useCallback } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Calendar, SlidersHorizontal, User, Store, MapPin, Eye, ArrowUpDown, Settings, Sparkles, Table as TableIcon, LayoutGrid, List, BarChart, PieChart, Users, UserPlus, Target, Shield, TrendingUp, Award, DollarSign, Calculator } from 'lucide-react';
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
    'newClients',
    'convertedClients',
    'retainedClients',
    'conversionRate',
    'retentionRate',
    'totalRevenue',
    'averageRevenue'
  ]);
  const [activeSort, setActiveSort] = useState({
    column: 'teacherName',
    direction: 'asc' as 'asc' | 'desc'
  });

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
      newClients: 0,
      convertedClients: 0,
      retainedClients: 0,
      totalRevenue: 0,
      avgConversionRate: 0,
      avgRetentionRate: 0,
      avgRevenue: 0
    };
    if (!filteredData || filteredData.length === 0) {
      return initialTotals;
    }
    const calculatedTotals = filteredData.reduce((acc, item) => {
      acc.newClients += item.newClients || 0;
      acc.convertedClients += item.convertedClients || 0;
      acc.retainedClients += item.retainedClients || 0;
      acc.totalRevenue += item.totalRevenue || 0;
      return acc;
    }, {
      ...initialTotals
    });
    const numberOfTeachers = filteredData.length;
    calculatedTotals.avgConversionRate = numberOfTeachers > 0 ? filteredData.reduce((sum, item) => sum + (item.conversionRate || 0), 0) / numberOfTeachers : 0;
    calculatedTotals.avgRetentionRate = numberOfTeachers > 0 ? filteredData.reduce((sum, item) => sum + (item.retentionRate || 0), 0) / numberOfTeachers : 0;
    calculatedTotals.avgRevenue = numberOfTeachers > 0 ? calculatedTotals.totalRevenue / numberOfTeachers : 0;
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced animated header */}
      <div className="relative overflow-hidden rounded-2xl shadow-luxury border border-white/20" style={{ maxHeight: '30px' }}>
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 animate-pulse-soft" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 animate-pulse" />
        
        {/* Animated bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 via-red-500 via-orange-500 via-yellow-500 via-green-500 via-teal-500 to-blue-500 animate-moving-rainbow" />
        
        {/* Content */}
        <div className="relative p-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="h-6 w-6 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse-soft">
                  <BarChart className="h-3 w-3 text-white animate-bounce" />
                </div>
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-400 rounded-full animate-ping" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent animate-fade-in">
                  Performance Analytics
                </h2>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-2 py-1">
                <TrendingUp className="h-3 w-3 text-green-400 animate-pulse" />
                <span className="text-xs font-medium text-white">Live Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Options in Filter Section */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {filteredData.length} records • Updated {new Date().toLocaleTimeString()}
        </div>
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

      {/* Table with improved height management */}
      <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <Table maxHeight="calc(100vh - 300px)">
          <TableHeader>
            <TableRow>
              {visibleColumns.includes('teacherName') && (
                <TableHead 
                  sortable 
                  sortDirection={activeSort.column === 'teacherName' ? activeSort.direction : undefined} 
                  onSort={() => handleSort('teacherName')} 
                  className="group text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <User className="h-4 w-4 text-blue-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
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
                    <MapPin className="h-4 w-4 text-green-400 transition-transform duration-300 group-hover:scale-110 group-hover:bounce" />
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
                    <Calendar className="h-4 w-4 text-purple-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                    Period
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
                    <UserPlus className="h-4 w-4 text-emerald-400 transition-transform duration-300 group-hover:scale-110 group-hover:bounce" />
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
                    <Target className="h-4 w-4 text-orange-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-45" />
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
                    <Shield className="h-4 w-4 text-indigo-400 transition-transform duration-300 group-hover:scale-110 group-hover:pulse" />
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
                    <TrendingUp className="h-4 w-4 text-amber-400 transition-transform duration-300 group-hover:scale-110 group-hover:bounce" />
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
                    <Award className="h-4 w-4 text-pink-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                    Retention %
                  </div>
                </TableHead>
              )}
              {visibleColumns.includes('totalRevenue') && (
                <TableHead 
                  sortable 
                  sortDirection={activeSort.column === 'totalRevenue' ? activeSort.direction : undefined} 
                  onSort={() => handleSort('totalRevenue')} 
                  className="group text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-400 transition-transform duration-300 group-hover:scale-110 group-hover:bounce" />
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
                    <Calculator className="h-4 w-4 text-teal-400 transition-transform duration-300 group-hover:scale-110 group-hover:pulse" />
                    Avg Revenue
                  </div>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {filteredData.map(item => (
              <TableRow key={`${item.teacherName}-${item.location}-${item.period}`}>
                {visibleColumns.includes('teacherName') && <TableCell className="text-center">{item.teacherName}</TableCell>}
                {visibleColumns.includes('location') && <TableCell className="text-center">{item.location}</TableCell>}
                {visibleColumns.includes('period') && <TableCell className="text-center">{item.period}</TableCell>}
                {visibleColumns.includes('newClients') && <TableCell className="text-center">{item.newClients}</TableCell>}
                {visibleColumns.includes('convertedClients') && <TableCell className="text-center">{item.convertedClients}</TableCell>}
                {visibleColumns.includes('retainedClients') && <TableCell className="text-center">{item.retainedClients}</TableCell>}
                {visibleColumns.includes('conversionRate') && (
                  <TableCell className="text-center">
                    {item.conversionRate ? `${item.conversionRate.toFixed(1)}%` : '0.0%'}
                  </TableCell>
                )}
                {visibleColumns.includes('retentionRate') && (
                  <TableCell className="text-center">
                    {item.retentionRate ? `${item.retentionRate.toFixed(1)}%` : '0.0%'}
                  </TableCell>
                )}
                {visibleColumns.includes('totalRevenue') && (
                  <TableCell className="text-center">
                    ${item.totalRevenue ? item.totalRevenue.toLocaleString() : '0'}
                  </TableCell>
                )}
                {visibleColumns.includes('averageRevenue') && (
                  <TableCell className="text-center">
                    ${item.averageRevenue ? item.averageRevenue.toLocaleString() : '0'}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
          
          {/* Enhanced totals footer */}
          <TableFooter>
            <TableRow className="hover:bg-transparent">
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
              {visibleColumns.includes('totalRevenue') && (
                <TableCell className="font-bold text-white text-center">
                  <div className="flex items-center justify-center gap-1">
                    <DollarSign className="h-3 w-3 text-green-400" />
                    ${totals.totalRevenue.toLocaleString()}
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
