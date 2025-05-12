
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: { week: string; revenue: number }[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  useEffect(() => {
    // Debug log the chart data
    console.log("Revenue chart received data:", data);
  }, [data]);

  if (!data || data.length === 0) {
    console.log("No revenue data available for the chart");
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

  // Format dates to be more readable and sort them
  const formattedData = data.map(item => {
    console.log(`Formatting date: ${item.week} with revenue: ${item.revenue}`);
    
    // Ensure revenue is a valid number
    const safeRevenue = typeof item.revenue === 'number' && !isNaN(item.revenue) 
      ? item.revenue 
      : 0;
      
    return {
      ...item,
      revenue: safeRevenue,
      weekLabel: item.week ? new Date(item.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown'
    };
  });

  // Sort data by date
  const sortedData = [...formattedData].sort((a, b) => {
    if (!a.week) return -1;
    if (!b.week) return 1;
    return new Date(a.week).getTime() - new Date(b.week).getTime();
  });

  // Calculate total revenue safely
  const totalRevenue = sortedData.reduce((sum, item) => {
    return sum + (typeof item.revenue === 'number' ? item.revenue : 0);
  }, 0);
  
  console.log("Revenue chart processed data:", sortedData);
  console.log("Total revenue for chart:", totalRevenue);

  return (
    <Card className="w-full h-[350px] animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          Revenue by Week (₹{totalRevenue.toLocaleString()})
        </CardTitle>
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
