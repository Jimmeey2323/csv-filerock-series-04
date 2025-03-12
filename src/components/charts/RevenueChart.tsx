
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: { week: string; revenue: number }[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="w-full h-[350px] animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Revenue by Week</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground">No revenue data available</p>
        </CardContent>
      </Card>
    );
  }

  // Format dates to be more readable
  const formattedData = data.map(item => ({
    ...item,
    weekLabel: new Date(item.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // Sort data by date
  const sortedData = [...formattedData].sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());

  console.log("Revenue chart data:", sortedData);

  return (
    <Card className="w-full h-[350px] animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Revenue by Week</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="weekLabel"
              angle={-45} 
              textAnchor="end" 
              height={70} 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => `₹${value.toLocaleString()}`}
              width={80}
            />
            <Tooltip 
              formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
              labelFormatter={(label) => `Week of ${label}`}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
            />
            <Bar 
              dataKey="revenue" 
              fill="hsla(var(--primary))" 
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
