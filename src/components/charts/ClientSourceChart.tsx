
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ClientSourceChartProps {
  data: { source: string; count: number }[];
}

const COLORS = ['#4f46e5', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

const ClientSourceChart: React.FC<ClientSourceChartProps> = ({ data }) => {
  if (!data || data.length === 0 || data.every(item => item.count === 0)) {
    return (
      <Card className="w-full h-[350px] animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Client Sources</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-muted-foreground">No client source data available</p>
        </CardContent>
      </Card>
    );
  }

  // Filter out zero values
  const filteredData = data.filter(item => item.count > 0);

  return (
    <Card className="w-full h-[350px] animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Client Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => [`${value} clients`, props.payload.source]}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ClientSourceChart;
