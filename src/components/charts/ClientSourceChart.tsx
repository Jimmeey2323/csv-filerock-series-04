
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface ClientSourceData {
  source: string;
  count: number;
}

interface ClientSourceChartProps {
  data: ClientSourceData[];
}

const ClientSourceChart: React.FC<ClientSourceChartProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [animatedData, setAnimatedData] = useState<ClientSourceData[]>([]);

  useEffect(() => {
    // Set initial zero count for animation
    const initialData = data.map(item => ({ ...item, count: 0 }));
    setAnimatedData(initialData);
    
    // Animate to actual values after a short delay
    const timer = setTimeout(() => {
      setAnimatedData(data);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [data]);

  // Color scheme
  const COLORS = [
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#10B981', // Green
    '#EC4899', // Pink
    '#3B82F6'  // Blue
  ];

  // Sort data by count for better visual representation
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  // Calculate total
  const total = sortedData.reduce((sum, item) => sum + item.count, 0);

  const handlePieClick = (data: any, index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{item.source}</p>
          <p className="text-primary">{item.count} clients ({((item.count / total) * 100).toFixed(1)}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      className="w-full h-[300px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={animatedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="count"
            nameKey="source"
            onClick={handlePieClick}
            animationBegin={0}
            animationDuration={1000}
            isAnimationActive={true}
          >
            {animatedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="#fff"
                strokeWidth={2}
                style={{
                  filter: activeIndex === index ? 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.3))' : 'none',
                  transform: activeIndex === index ? 'scale(1.1)' : 'scale(1)',
                  transformOrigin: '50% 50%',
                  transition: 'transform 0.3s, filter 0.3s'
                }}
              />
            ))}
          </Pie>
          <Tooltip content={customTooltip} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            formatter={(value, entry, index) => (
              <span className="text-sm">
                {value} ({((animatedData[index]?.count || 0) / total * 100).toFixed(1)}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {total > 0 && (
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <div className="text-3xl font-bold text-primary">{total}</div>
          <div className="text-xs text-muted-foreground">Total Clients</div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ClientSourceChart;
