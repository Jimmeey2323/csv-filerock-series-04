import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { TrendingUp, Users, Calendar, Target, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { safeToFixed, safeFormatCurrency } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MonthlyMetricsViewProps {
  data: ProcessedTeacherData[];
}

const MonthlyMetricsView: React.FC<MonthlyMetricsViewProps> = ({ data }) => {
  // Group data by teacher and month with proper null checks
  const monthlyData = React.useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return {};
    }

    const grouped = data.reduce((acc, item) => {
      if (!item || !item.teacherName) {
        return acc;
      }

      const month = item.period || 'Unknown';
      const teacher = item.teacherName;
      
      if (!acc[teacher]) {
        acc[teacher] = {};
      }
      if (!acc[teacher][month]) {
        acc[teacher][month] = {
          visits: 0,
          cancellations: 0,
          lateCancellations: 0,
          noShows: 0,
          newMembers: 0,
          retained: 0,
          converted: 0,
          classes: 0,
          uniqueMembers: 0,
          revenue: 0
        };
      }
      
      acc[teacher][month].visits += item.totalVisits || 0;
      acc[teacher][month].cancellations += item.cancellations || 0;
      acc[teacher][month].lateCancellations += item.lateCancellations || 0;
      acc[teacher][month].noShows += item.noShows || 0;
      acc[teacher][month].newMembers += item.newClients || 0;
      acc[teacher][month].retained += item.retainedClients || 0;
      acc[teacher][month].converted += item.convertedClients || 0;
      acc[teacher][month].classes += item.totalClasses || 0;
      acc[teacher][month].uniqueMembers += item.uniqueClients || 0;
      acc[teacher][month].revenue += item.totalRevenue || 0;
      
      return acc;
    }, {} as Record<string, Record<string, any>>);

    return grouped;
  }, [data]);

  // Get all unique months sorted with null checks
  const allMonths = React.useMemo(() => {
    const months = new Set<string>();
    if (monthlyData && typeof monthlyData === 'object') {
      Object.values(monthlyData).forEach(teacherData => {
        if (teacherData && typeof teacherData === 'object') {
          Object.keys(teacherData).forEach(month => {
            if (month) months.add(month);
          });
        }
      });
    }
    return Array.from(months).sort();
  }, [monthlyData]);

  // Get all teachers with null checks
  const teachers = React.useMemo(() => {
    if (!monthlyData || typeof monthlyData !== 'object') {
      return [];
    }
    return Object.keys(monthlyData).filter(teacher => teacher && teacher.trim() !== '');
  }, [monthlyData]);

  // Calculate totals for each month and metric
  const calculateTotals = (metric: string) => {
    if (!allMonths || !teachers || !monthlyData) {
      return [];
    }

    return allMonths.map(month => {
      const total = teachers.reduce((sum, teacher) => {
        const teacherData = monthlyData[teacher];
        const monthData = teacherData && teacherData[month];
        return sum + (monthData && monthData[metric] ? monthData[metric] : 0);
      }, 0);
      return { month, total };
    });
  };

  // Render table for specific metric
  const renderMetricTable = (metric: string, label: string, formatter?: (value: number) => string) => {
    const totals = calculateTotals(metric);
    const totalSum = totals.reduce((sum, t) => sum + (t?.total || 0), 0);

    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {label} by Teacher & Month
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-20 bg-gradient-to-r from-slate-800/95 via-slate-700/95 to-slate-800/95 backdrop-blur-sm border-r border-white/20 min-w-[140px] text-white font-bold">
                    Teacher
                  </TableHead>
                  {allMonths.map(month => (
                    <TableHead 
                      key={month} 
                      className="text-center min-w-[100px] whitespace-nowrap text-white font-bold px-3"
                    >
                      {month}
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-bold min-w-[100px] bg-slate-600/20 text-white border-l border-white/30">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher, index) => {
                  const teacherTotal = allMonths.reduce((sum, month) => {
                    const teacherData = monthlyData[teacher];
                    const monthData = teacherData && teacherData[month];
                    return sum + (monthData && monthData[metric] ? monthData[metric] : 0);
                  }, 0);
                  
                  return (
                    <TableRow 
                      key={teacher} 
                      className="animate-fade-in border-b border-slate-200/30 hover:bg-blue-50/30"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-medium sticky left-0 z-10 bg-white/95 backdrop-blur-sm border-r border-slate-200/30 min-w-[140px] text-slate-800">
                        {teacher}
                      </TableCell>
                      {allMonths.map(month => {
                        const teacherData = monthlyData[teacher];
                        const monthData = teacherData && teacherData[month];
                        const value = monthData && monthData[metric] ? monthData[metric] : 0;
                        return (
                          <TableCell 
                            key={month} 
                            className="text-center min-w-[100px] font-medium text-slate-800 px-3"
                          >
                            {formatter ? formatter(value) : value.toLocaleString()}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-bold min-w-[100px] bg-slate-50/50 border-l border-slate-200/50 text-slate-800">
                        {formatter ? formatter(teacherTotal) : teacherTotal.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow className="border-t-2 border-slate-300/50 bg-gradient-to-r from-slate-800/95 via-slate-700/95 to-slate-800/95">
                  <TableCell className="font-bold sticky left-0 z-20 bg-gradient-to-r from-slate-800/95 via-slate-700/95 to-slate-800/95 border-r border-white/20 min-w-[140px] text-white">
                    Total
                  </TableCell>
                  {totals.map(({ month, total }) => (
                    <TableCell 
                      key={month} 
                      className="text-center font-bold text-white min-w-[100px] px-3"
                    >
                      {formatter ? formatter(total) : total.toLocaleString()}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold text-white min-w-[100px] bg-slate-600/20 border-l border-white/30">
                    {formatter ? formatter(totalSum) : totalSum.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Calculate summary statistics with null checks
  const totalMetrics = React.useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return {
        totalVisits: 0,
        totalNewMembers: 0,
        totalConverted: 0,
        totalRetained: 0,
        totalRevenue: 0,
        totalClasses: 0,
      };
    }

    return data.reduce((acc, item) => {
      if (!item) return acc;
      
      acc.totalVisits += item.totalVisits || 0;
      acc.totalNewMembers += item.newClients || 0;
      acc.totalConverted += item.convertedClients || 0;
      acc.totalRetained += item.retainedClients || 0;
      acc.totalRevenue += item.totalRevenue || 0;
      acc.totalClasses += item.totalClasses || 0;
      return acc;
    }, {
      totalVisits: 0,
      totalNewMembers: 0,
      totalConverted: 0,
      totalRetained: 0,
      totalRevenue: 0,
      totalClasses: 0,
    });
  }, [data]);

  // Early return if no data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="animate-fade-in">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No data available for monthly metrics view.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Total Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.totalVisits.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all trainers</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              New Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.totalNewMembers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">New acquisitions</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-500" />
              Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.totalConverted.toLocaleString()}</div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                {totalMetrics.totalNewMembers > 0 ? safeToFixed((totalMetrics.totalConverted / totalMetrics.totalNewMembers) * 100, 1) : 0}%
              </Badge>
              <span className="text-xs text-muted-foreground">conversion rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeFormatCurrency(totalMetrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Generated revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Month-on-Month Metrics Tabs */}
      <Tabs defaultValue="visits" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="visits">Visits</TabsTrigger>
          <TabsTrigger value="cancellations">Cancellations</TabsTrigger>
          <TabsTrigger value="lateCancellations">Late Cancel</TabsTrigger>
          <TabsTrigger value="noShows">No Shows</TabsTrigger>
          <TabsTrigger value="newMembers">New Members</TabsTrigger>
          <TabsTrigger value="retained">Retained</TabsTrigger>
          <TabsTrigger value="converted">Converted</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="uniqueMembers">Unique Members</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="visits">
          {renderMetricTable('visits', 'Visits')}
        </TabsContent>

        <TabsContent value="cancellations">
          {renderMetricTable('cancellations', 'Cancellations')}
        </TabsContent>

        <TabsContent value="lateCancellations">
          {renderMetricTable('lateCancellations', 'Late Cancellations')}
        </TabsContent>

        <TabsContent value="noShows">
          {renderMetricTable('noShows', 'No Shows')}
        </TabsContent>

        <TabsContent value="newMembers">
          {renderMetricTable('newMembers', 'New Members')}
        </TabsContent>

        <TabsContent value="retained">
          {renderMetricTable('retained', 'Retained Members')}
        </TabsContent>

        <TabsContent value="converted">
          {renderMetricTable('converted', 'Converted Members')}
        </TabsContent>

        <TabsContent value="classes">
          {renderMetricTable('classes', 'Classes')}
        </TabsContent>

        <TabsContent value="uniqueMembers">
          {renderMetricTable('uniqueMembers', 'Unique Members')}
        </TabsContent>

        <TabsContent value="revenue">
          {renderMetricTable('revenue', 'Revenue', safeFormatCurrency)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonthlyMetricsView;
