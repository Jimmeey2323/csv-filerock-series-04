import React, { useState, useMemo, useCallback } from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { safeToFixed, safeFormatCurrency } from '@/lib/utils';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import TableViewOptions from '@/components/TableViewOptions';
import DataCardsView from '@/components/DataCardsView';
import DetailedDataView from '@/components/DetailedDataView';

interface ResultsTableProps {
  data: ProcessedTeacherData[];
  locations: string[];
  isLoading: boolean;
  viewMode: 'table' | 'cards' | 'detailed';
  dataMode: 'teacher' | 'studio';
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
  const [activeSort, setActiveSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: '',
    direction: 'asc'
  });
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'teacherName',
    'location',
    'period',
    'newClients',
    'convertedClients',
    'retainedClients',
    'totalRevenue'
  ]);
  const [activeGroupBy, setActiveGroupBy] = useState('');
  const [currentView, setCurrentView] = useState<'table' | 'cards' | 'detailed'>(viewMode);

  const availableColumns = useMemo(() => {
    if (dataMode === 'teacher') {
      return [
        'teacherName',
        'location',
        'period',
        'newClients',
        'convertedClients',
        'retainedClients',
        'totalRevenue',
        'conversionRate',
        'retentionRate',
        'averageRevenuePerClient',
        'trials',
        'referrals',
        'hosted',
        'influencerSignups',
        'others'
      ];
    } else {
      return [
        'location',
        'period',
        'newClients',
        'convertedClients',
        'retainedClients',
        'totalRevenue',
        'conversionRate',
        'retentionRate',
        'averageRevenuePerClient',
        'trials',
        'referrals',
        'hosted',
        'influencerSignups',
        'others'
      ];
    }
  }, [dataMode]);

  const sortedData = useMemo(() => {
    if (!activeSort.column) return data;

    const sorted = [...data].sort((a: any, b: any) => {
      const aValue = a[activeSort.column];
      const bValue = b[activeSort.column];

      if (aValue === bValue) return 0;

      if (activeSort.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [data, activeSort]);

  const groupedData = useMemo(() => {
    if (!activeGroupBy) return sortedData;

    const grouped: { [key: string]: ProcessedTeacherData[] } = {};
    sortedData.forEach(item => {
      const key = item[activeGroupBy as keyof ProcessedTeacherData] as string;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return grouped;
  }, [sortedData, activeGroupBy]);

  const handleSortChange = (column: string, direction: 'asc' | 'desc') => {
    setActiveSort({ column, direction });
  };

  const handleVisibilityChange = (columns: string[]) => {
    setVisibleColumns(columns);
  };

  const handleGroupByChange = (field: string) => {
    setActiveGroupBy(field);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view as 'table' | 'cards' | 'detailed');
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading data...</div>;
  }

  if (currentView === 'cards') {
    return <DataCardsView data={data} />;
  }

  if (currentView === 'detailed') {
    return <DetailedDataView data={data} />;
  }

  return (
    <div className="space-y-4">
      <TableViewOptions
        activeView={currentView}
        onViewChange={handleViewChange}
        onGroupByChange={handleGroupByChange}
        onVisibilityChange={handleVisibilityChange}
        onSortChange={handleSortChange}
        availableColumns={availableColumns}
        visibleColumns={visibleColumns}
        activeGroupBy={activeGroupBy}
        activeSort={activeSort}
        data={data}
      />

      {currentView === 'table' && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {activeGroupBy && (
                  <TableHead>
                    {activeGroupBy.charAt(0).toUpperCase() + activeGroupBy.slice(1)}
                  </TableHead>
                )}
                {visibleColumns.map(column => (
                  <TableHead
                    key={column}
                    sortable
                    sortDirection={activeSort.column === column ? activeSort.direction : undefined}
                    onSort={() =>
                      handleSortChange(
                        column,
                        activeSort.column === column ? (activeSort.direction === 'asc' ? 'desc' : 'asc') : 'asc'
                      )
                    }
                  >
                    {column.charAt(0).toUpperCase() + column.slice(1)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeGroupBy ? (
                Object.entries(groupedData).map(([group, items]) => (
                  <React.Fragment key={group}>
                    <TableRow isGroupHeader>
                      <TableCell colSpan={visibleColumns.length + 1}>
                        {group} <Badge variant="secondary">{items.length} items</Badge>
                      </TableCell>
                    </TableRow>
                    {items.map((item, itemIndex) => (
                      <TableRow key={`${group}-${itemIndex}`}>
                        <TableCell>{item.teacherName}</TableCell>
                        {visibleColumns.map(column => (
                          <TableCell key={`${group}-${itemIndex}-${column}`}>
                            {column === 'totalRevenue' ? safeFormatCurrency(item[column as keyof ProcessedTeacherData] as number) : 
                              (column === 'conversionRate' || column === 'retentionRate') ? safeToFixed(item[column as keyof ProcessedTeacherData] as number, 1) + '%' :
                              item[column as keyof ProcessedTeacherData]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                sortedData.map((item, index) => (
                  <TableRow key={index}>
                    {visibleColumns.map(column => (
                      <TableCell key={`${index}-${column}`}>
                        {column === 'totalRevenue' ? safeFormatCurrency(item[column as keyof ProcessedTeacherData] as number) : 
                          (column === 'conversionRate' || column === 'retentionRate') ? safeToFixed(item[column as keyof ProcessedTeacherData] as number, 1) + '%' :
                          item[column as keyof ProcessedTeacherData]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ResultsTable;
