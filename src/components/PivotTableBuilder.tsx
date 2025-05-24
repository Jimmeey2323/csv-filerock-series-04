
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { safeToFixed, safeFormatCurrency } from '@/lib/utils';
import { 
  Plus, 
  X, 
  Settings, 
  Save, 
  Download, 
  BarChart3,
  Filter,
  Calculator,
  Eye,
  EyeOff
} from 'lucide-react';

interface PivotConfig {
  rows: string[];
  columns: string[];
  values: string[];
  aggregator: 'sum' | 'avg' | 'count' | 'min' | 'max';
  filters: { field: string; operator: string; value: string }[];
  showTotals: boolean;
  formatting: 'currency' | 'percentage' | 'number';
}

interface PivotTableBuilderProps {
  data: ProcessedTeacherData[];
}

const PivotTableBuilder: React.FC<PivotTableBuilderProps> = ({ data }) => {
  const [config, setConfig] = useState<PivotConfig>({
    rows: ['teacherName'],
    columns: [],
    values: ['totalRevenue'],
    aggregator: 'sum',
    filters: [],
    showTotals: true,
    formatting: 'currency'
  });

  const [savedConfigs, setSavedConfigs] = useState<{ name: string; config: PivotConfig }[]>([]);
  const [configName, setConfigName] = useState('');

  // Available fields from the data
  const availableFields = [
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

  // Apply filters to data
  const filteredData = useMemo(() => {
    return data.filter(row => {
      return config.filters.every(filter => {
        const fieldValue = row[filter.field as keyof ProcessedTeacherData];
        const filterValue = filter.value;
        
        switch (filter.operator) {
          case 'equals':
            return String(fieldValue) === filterValue;
          case 'contains':
            return String(fieldValue).toLowerCase().includes(filterValue.toLowerCase());
          case 'greater':
            return Number(fieldValue) > Number(filterValue);
          case 'less':
            return Number(fieldValue) < Number(filterValue);
          default:
            return true;
        }
      });
    });
  }, [data, config.filters]);

  // Generate pivot table data
  const pivotData = useMemo(() => {
    if (!filteredData.length) return { rows: [], columns: [], totals: {} };

    const grouped: { [key: string]: any[] } = {};
    const columnSet = new Set<string>();

    // Group data by row fields
    filteredData.forEach(row => {
      const rowKey = config.rows.map(field => row[field as keyof ProcessedTeacherData] || 'N/A').join(' | ');
      const colKey = config.columns.map(field => row[field as keyof ProcessedTeacherData] || 'N/A').join(' | ') || 'Total';
      
      if (!grouped[rowKey]) grouped[rowKey] = [];
      grouped[rowKey].push({ ...row, _colKey: colKey });
      columnSet.add(colKey);
    });

    const columns = Array.from(columnSet).sort();
    const rows = Object.keys(grouped).map(rowKey => {
      const rowData: { [key: string]: any } = { _key: rowKey };
      
      columns.forEach(colKey => {
        const cellData = grouped[rowKey].filter(item => item._colKey === colKey);
        
        if (cellData.length > 0) {
          config.values.forEach(valueField => {
            const values = cellData.map(item => Number(item[valueField as keyof ProcessedTeacherData]) || 0);
            
            let aggregatedValue = 0;
            switch (config.aggregator) {
              case 'sum':
                aggregatedValue = values.reduce((sum, val) => sum + val, 0);
                break;
              case 'avg':
                aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
                break;
              case 'count':
                aggregatedValue = values.length;
                break;
              case 'min':
                aggregatedValue = Math.min(...values);
                break;
              case 'max':
                aggregatedValue = Math.max(...values);
                break;
            }
            
            rowData[`${colKey}_${valueField}`] = aggregatedValue;
          });
        }
      });
      
      return rowData;
    });

    // Calculate totals
    const totals: { [key: string]: number } = {};
    if (config.showTotals) {
      columns.forEach(colKey => {
        config.values.forEach(valueField => {
          const key = `${colKey}_${valueField}`;
          totals[key] = rows.reduce((sum, row) => sum + (row[key] || 0), 0);
        });
      });
    }

    return { rows, columns, totals };
  }, [filteredData, config]);

  const formatValue = (value: number) => {
    switch (config.formatting) {
      case 'currency':
        return safeFormatCurrency(value);
      case 'percentage':
        return `${safeToFixed(value, 1)}%`;
      default:
        return safeToFixed(value, 0);
    }
  };

  const addFilter = () => {
    setConfig(prev => ({
      ...prev,
      filters: [...prev.filters, { field: availableFields[0], operator: 'equals', value: '' }]
    }));
  };

  const removeFilter = (index: number) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index)
    }));
  };

  const saveConfig = () => {
    if (configName.trim()) {
      setSavedConfigs(prev => [...prev, { name: configName, config }]);
      setConfigName('');
    }
  };

  const loadConfig = (savedConfig: PivotConfig) => {
    setConfig(savedConfig);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pivot Table Builder
          </CardTitle>
          <CardDescription>
            Create custom pivot tables with advanced filtering and aggregation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Row Fields</Label>
              <Select value={config.rows[0]} onValueChange={(value) => setConfig(prev => ({ ...prev, rows: [value] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map(field => (
                    <SelectItem key={field} value={field}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Column Fields</Label>
              <Select value={config.columns[0] || ''} onValueChange={(value) => setConfig(prev => ({ ...prev, columns: value ? [value] : [] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {availableFields.map(field => (
                    <SelectItem key={field} value={field}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Value Fields</Label>
              <Select value={config.values[0]} onValueChange={(value) => setConfig(prev => ({ ...prev, values: [value] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.filter(field => ['newClients', 'convertedClients', 'retainedClients', 'totalRevenue', 'conversionRate', 'retentionRate', 'averageRevenuePerClient', 'trials', 'referrals', 'hosted', 'influencerSignups', 'others'].includes(field)).map(field => (
                    <SelectItem key={field} value={field}>{field}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Aggregator</Label>
              <Select value={config.aggregator} onValueChange={(value: any) => setConfig(prev => ({ ...prev, aggregator: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sum">Sum</SelectItem>
                  <SelectItem value="avg">Average</SelectItem>
                  <SelectItem value="count">Count</SelectItem>
                  <SelectItem value="min">Minimum</SelectItem>
                  <SelectItem value="max">Maximum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Label>
              <Button onClick={addFilter} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Filter
              </Button>
            </div>
            
            {config.filters.map((filter, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                <Select value={filter.field} onValueChange={(value) => {
                  const newFilters = [...config.filters];
                  newFilters[index].field = value;
                  setConfig(prev => ({ ...prev, filters: newFilters }));
                }}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFields.map(field => (
                      <SelectItem key={field} value={field}>{field}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filter.operator} onValueChange={(value) => {
                  const newFilters = [...config.filters];
                  newFilters[index].operator = value;
                  setConfig(prev => ({ ...prev, filters: newFilters }));
                }}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="greater">Greater</SelectItem>
                    <SelectItem value="less">Less</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={filter.value}
                  onChange={(e) => {
                    const newFilters = [...config.filters];
                    newFilters[index].value = e.target.value;
                    setConfig(prev => ({ ...prev, filters: newFilters }));
                  }}
                  placeholder="Filter value"
                  className="flex-1"
                />

                <Button onClick={() => removeFilter(index)} size="sm" variant="ghost">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Options */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Show Totals</Label>
              <Button
                onClick={() => setConfig(prev => ({ ...prev, showTotals: !prev.showTotals }))}
                size="sm"
                variant={config.showTotals ? "default" : "outline"}
              >
                {config.showTotals ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Label>Format</Label>
              <Select value={config.formatting} onValueChange={(value: any) => setConfig(prev => ({ ...prev, formatting: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Save/Load Configuration */}
          <div className="flex items-center gap-2">
            <Input
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="Configuration name"
              className="flex-1"
            />
            <Button onClick={saveConfig} disabled={!configName.trim()}>
              <Save className="h-4 w-4 mr-1" />
              Save Config
            </Button>
          </div>

          {savedConfigs.length > 0 && (
            <div className="space-y-2">
              <Label>Saved Configurations</Label>
              <div className="flex flex-wrap gap-2">
                {savedConfigs.map((saved, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => loadConfig(saved.config)}
                  >
                    {saved.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pivot Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Pivot Table Results
            </span>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{config.rows.join(' + ')}</TableHead>
                  {pivotData.columns.map(col => (
                    <TableHead key={col} className="text-center">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pivotData.rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row._key}</TableCell>
                    {pivotData.columns.map(col => (
                      <TableCell key={col} className="text-center">
                        {config.values.map(valueField => {
                          const value = row[`${col}_${valueField}`];
                          return value !== undefined ? formatValue(value) : '-';
                        })}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
              {config.showTotals && (
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-bold">Total</TableCell>
                    {pivotData.columns.map(col => (
                      <TableCell key={col} className="text-center font-bold">
                        {config.values.map(valueField => {
                          const value = pivotData.totals[`${col}_${valueField}`];
                          return value !== undefined ? formatValue(value) : '-';
                        })}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PivotTableBuilder;
