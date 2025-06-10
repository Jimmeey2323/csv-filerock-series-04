
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
  // Group data by teacher and month
  const monthlyData = React.useMemo(() => {
    const grouped = data.reduce((acc, item) => {
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

  // Get all unique months sorted
  const allMonths = React.useMemo(() => {
    const months = new Set<string>();
    Object.values(monthlyData).forEach(teacherData => {
      Object.keys(teacherData).forEach(month => months.add(month));
    });
    return Array.from(months).sort();
  }, [monthlyData]);

  // Get all teachers
  const teachers = Object.keys(monthlyData);

  // Calculate totals for each month and metric
  const calculateTotals = (metric: string) => {
    return allMonths.map(month => {
      const total = teachers.reduce((sum, teacher) => {
        return sum + (monthlyData[teacher][month]?.[metric] || 0);
      }, 0);
      return { month, total };
    });
  };

  // Render table for specific metric
  const renderMetricTable = (metric: string, label: string, formatter?: (value: number) => string) => {
    const totals = calculateTotals(metric);
    const totalSum = totals.reduce((sum, t) => sum + t.total, 0);

    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {label} by Teacher & Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table maxHeight="500px">
            <TableHeader>
              <TableRow>
                <TableHead sortable>Teacher</TableHead>
                {allMonths.map(month => (
                  <TableHead key={month} className="text-center">{month}</TableHead>
                ))}
                <TableHead className="text-center font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <ScrollArea className="h-[400px]">
              <TableBody>
                {teachers.map((teacher, index) => {
                  const teacherTotal = allMonths.reduce((sum, month) => {
                    return sum + (monthlyData[teacher][month]?.[metric] || 0);
                  }, 0);
                  
                  return (
                    <TableRow key={teacher} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                      <TableCell className="font-medium">{teacher}</TableCell>
                      {allMonths.map(month => {
                        const value = monthlyData[teacher][month]?.[metric] || 0;
                        return (
                          <TableCell key={month} className="text-center">
                            {formatter ? formatter(value) : value.toLocaleString()}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-bold">
                        {formatter ? formatter(teacherTotal) : teacherTotal.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </ScrollArea>
            <TableFooter>
              <TableRow>
                <TableCell className="font-bold text-white">Total</TableCell>
                {totals.map(({ month, total }) => (
                  <TableCell key={month} className="text-center font-bold text-white">
                    {formatter ? formatter(total) : total.toLocaleString()}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-white">
                  {formatter ? formatter(totalSum) : totalSum.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    );
  };

  // Calculate summary statistics
  const totalMetrics = React.useMemo(() => {
    return teachers.reduce((acc, teacher) => {
      Object.values(monthlyData[teacher]).forEach(monthData => {
        acc.totalVisits += monthData.visits || 0;
        acc.totalNewMembers += monthData.newMembers || 0;
        acc.totalConverted += monthData.converted || 0;
        acc.totalRetained += monthData.retained || 0;
        acc.totalRevenue += monthData.revenue || 0;
        acc.totalClasses += monthData.classes || 0;
      });
      return acc;
    }, {
      totalVisits: 0,
      totalNewMembers: 0,
      totalConverted: 0,
      totalRetained: 0,
      totalRevenue: 0,
      totalClasses: 0,
    });
  }, [teachers, monthlyData]);

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
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
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
