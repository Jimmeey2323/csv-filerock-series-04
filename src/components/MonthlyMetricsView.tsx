
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { TrendingUp, TrendingDown, Users, Calendar, Target, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { safeToFixed, safeFormatCurrency } from '@/lib/utils';

interface MonthlyMetricsViewProps {
  data: ProcessedTeacherData[];
}

const MonthlyMetricsView: React.FC<MonthlyMetricsViewProps> = ({ data }) => {
  // Group data by teacher and calculate metrics
  const teacherMetrics = React.useMemo(() => {
    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.teacherName]) {
        acc[item.teacherName] = [];
      }
      acc[item.teacherName].push(item);
      return acc;
    }, {} as Record<string, ProcessedTeacherData[]>);

    return Object.entries(groupedData).map(([teacherName, teacherData]) => {
      const totalVisits = teacherData.reduce((sum, item) => sum + (item.totalVisits || 0), 0);
      const totalCancellations = teacherData.reduce((sum, item) => sum + (item.cancellations || 0), 0);
      const totalLateCancellations = teacherData.reduce((sum, item) => sum + (item.lateCancellations || 0), 0);
      const totalNoShows = teacherData.reduce((sum, item) => sum + (item.noShows || 0), 0);
      const totalNewMembers = teacherData.reduce((sum, item) => sum + (item.newClients || 0), 0);
      const totalRetained = teacherData.reduce((sum, item) => sum + (item.retainedClients || 0), 0);
      const totalConverted = teacherData.reduce((sum, item) => sum + (item.convertedClients || 0), 0);
      const totalClasses = teacherData.reduce((sum, item) => sum + (item.totalClasses || 0), 0);
      const totalUniqueMembers = teacherData.reduce((sum, item) => sum + (item.uniqueClients || 0), 0);
      const totalRevenue = teacherData.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);

      const cancellationRate = totalVisits > 0 ? (totalCancellations / totalVisits) * 100 : 0;
      const classAverageAttendance = totalClasses > 0 ? totalVisits / totalClasses : 0;
      const conversionRate = totalNewMembers > 0 ? (totalConverted / totalNewMembers) * 100 : 0;
      const retentionRate = totalNewMembers > 0 ? (totalRetained / totalNewMembers) * 100 : 0;

      return {
        teacherName,
        visits: totalVisits,
        cancellations: totalCancellations,
        lateCancellations: totalLateCancellations,
        noShows: totalNoShows,
        cancellationRate: safeToFixed(cancellationRate, 1),
        newMembers: totalNewMembers,
        retained: totalRetained,
        converted: totalConverted,
        classes: totalClasses,
        uniqueMembers: totalUniqueMembers,
        classAverageAttendance: safeToFixed(classAverageAttendance, 1),
        conversionRate: safeToFixed(conversionRate, 1),
        retentionRate: safeToFixed(retentionRate, 1),
        totalRevenue: totalRevenue
      };
    });
  }, [data]);

  // Chart configuration
  const chartConfig = {
    visits: { label: 'Visits', color: 'hsl(var(--chart-1))' },
    cancellations: { label: 'Cancellations', color: 'hsl(var(--chart-2))' },
    newMembers: { label: 'New Members', color: 'hsl(var(--chart-3))' },
    converted: { label: 'Converted', color: 'hsl(var(--chart-4))' },
    retained: { label: 'Retained', color: 'hsl(var(--chart-5))' },
  };

  // Calculate summary statistics
  const totalMetrics = React.useMemo(() => {
    return teacherMetrics.reduce((acc, teacher) => ({
      totalVisits: acc.totalVisits + teacher.visits,
      totalNewMembers: acc.totalNewMembers + teacher.newMembers,
      totalConverted: acc.totalConverted + teacher.converted,
      totalRetained: acc.totalRetained + teacher.retained,
      totalRevenue: acc.totalRevenue + teacher.totalRevenue,
      totalClasses: acc.totalClasses + teacher.classes,
    }), {
      totalVisits: 0,
      totalNewMembers: 0,
      totalConverted: 0,
      totalRetained: 0,
      totalRevenue: 0,
      totalClasses: 0,
    });
  }, [teacherMetrics]);

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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Visits & Cancellations by Teacher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teacherMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="teacherName" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="visits" fill="var(--color-visits)" name="Visits" />
                  <Bar dataKey="cancellations" fill="var(--color-cancellations)" name="Cancellations" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '500ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Member Acquisition & Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teacherMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="teacherName" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="newMembers" fill="var(--color-newMembers)" name="New Members" />
                  <Bar dataKey="converted" fill="var(--color-converted)" name="Converted" />
                  <Bar dataKey="retained" fill="var(--color-retained)" name="Retained" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Rate Trends */}
      <Card className="animate-fade-in" style={{ animationDelay: '600ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Conversion & Retention Rates by Teacher
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={teacherMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="teacherName" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value, name) => [`${value}%`, name]}
                  />} 
                />
                <Line 
                  type="monotone" 
                  dataKey="conversionRate" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
                  name="Conversion Rate"
                />
                <Line 
                  type="monotone" 
                  dataKey="retentionRate" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
                  name="Retention Rate"
                />
                <Line 
                  type="monotone" 
                  dataKey="cancellationRate" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 4 }}
                  name="Cancellation Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Detailed Metrics Table */}
      <Card className="animate-fade-in" style={{ animationDelay: '700ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Detailed Monthly Metrics by Teacher
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-muted">
                  <th className="text-left p-2 font-medium">Teacher</th>
                  <th className="text-right p-2 font-medium">Visits</th>
                  <th className="text-right p-2 font-medium">Cancellations</th>
                  <th className="text-right p-2 font-medium">Late Cancel</th>
                  <th className="text-right p-2 font-medium">No Shows</th>
                  <th className="text-right p-2 font-medium">Cancel Rate</th>
                  <th className="text-right p-2 font-medium">New Members</th>
                  <th className="text-right p-2 font-medium">Converted</th>
                  <th className="text-right p-2 font-medium">Retained</th>
                  <th className="text-right p-2 font-medium">Classes</th>
                  <th className="text-right p-2 font-medium">Avg Attendance</th>
                  <th className="text-right p-2 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {teacherMetrics.map((teacher, index) => (
                  <tr key={teacher.teacherName} className="border-b border-muted/50 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${800 + index * 50}ms` }}>
                    <td className="p-2 font-medium">{teacher.teacherName}</td>
                    <td className="text-right p-2">{teacher.visits.toLocaleString()}</td>
                    <td className="text-right p-2">{teacher.cancellations.toLocaleString()}</td>
                    <td className="text-right p-2">{teacher.lateCancellations.toLocaleString()}</td>
                    <td className="text-right p-2">{teacher.noShows.toLocaleString()}</td>
                    <td className="text-right p-2">
                      <Badge variant={parseFloat(teacher.cancellationRate) > 10 ? "destructive" : "secondary"}>
                        {teacher.cancellationRate}%
                      </Badge>
                    </td>
                    <td className="text-right p-2">{teacher.newMembers.toLocaleString()}</td>
                    <td className="text-right p-2">{teacher.converted.toLocaleString()}</td>
                    <td className="text-right p-2">{teacher.retained.toLocaleString()}</td>
                    <td className="text-right p-2">{teacher.classes.toLocaleString()}</td>
                    <td className="text-right p-2">{teacher.classAverageAttendance}</td>
                    <td className="text-right p-2 font-medium">{safeFormatCurrency(teacher.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyMetricsView;
