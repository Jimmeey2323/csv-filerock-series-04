
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface StudioMetricCardProps {
  title: string;
  value: string | number;
  location: string;
  metrics?: {
    label: string;
    value: string | number;
    status?: 'positive' | 'neutral' | 'negative';
  }[];
  icon: React.ReactNode;
  tooltip?: string;
}

const StudioMetricCard: React.FC<StudioMetricCardProps> = ({
  title,
  value,
  location,
  metrics = [], // Provide default empty array
  icon,
  tooltip,
}) => {
  // Safely display the value by ensuring it's a string
  const displayValue = value !== undefined && value !== null 
    ? String(value)
    : 'N/A';

  return (
    <Card className="card-hover bg-white/60 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              {title}
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="max-w-xs text-xs">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="text-2xl font-bold mt-1">
              {displayValue}
            </div>
            <div className="text-xs font-medium text-muted-foreground mt-1">
              {location}
            </div>
          </div>
          <div className="text-primary">
            {icon}
          </div>
        </div>
        
        {metrics && metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {metrics.map((metric, index) => {
              // Safely convert metric value to string
              const metricDisplayValue = metric.value !== undefined && metric.value !== null 
                ? String(metric.value)
                : 'N/A';
                
              return (
                <div key={index} className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    {metric.label}
                  </span>
                  <span className={`text-sm font-medium ${
                    metric.status === 'positive' ? 'text-green-600' : 
                    metric.status === 'negative' ? 'text-red-600' : 
                    'text-amber-600'
                  }`}>
                    {metricDisplayValue}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudioMetricCard;
