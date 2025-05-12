
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface StudioMetricCardProps {
  title?: string;
  value?: string;
  location?: string;
  metrics?: {
    label: string;
    value: string | number;
    status?: 'positive' | 'neutral' | 'negative';
  }[];
  icon?: React.ReactNode;
  tooltip?: string;
  // Add missing properties from ResultsTable
  teacherName?: string;
  newClients?: number;
  retainedClients?: number;
  convertedClients?: number;
  conversionRate?: number;
  retentionRate?: number;
  totalRevenue?: number;
  onClick?: () => void;
}

const StudioMetricCard: React.FC<StudioMetricCardProps> = ({
  title,
  value,
  location,
  metrics = [], // Provide default empty array
  icon,
  tooltip,
  onClick,
  teacherName,
  newClients,
  retainedClients,
  conversionRate,
  retentionRate,
  totalRevenue,
}) => {
  // Use provided value or generate a display value from teacherName if available
  const displayTitle = title || (teacherName ? `Teacher: ${teacherName}` : undefined);
  const displayValue = value || (totalRevenue ? `₹${totalRevenue.toLocaleString()}` : undefined);

  // Generate metrics from props if not provided
  const displayMetrics = metrics.length > 0 ? metrics : [
    newClients !== undefined ? {
      label: 'New Clients',
      value: newClients,
      status: 'neutral'
    } : undefined,
    conversionRate !== undefined ? {
      label: 'Conversion',
      value: `${conversionRate.toFixed(1)}%`,
      status: conversionRate > 10 ? 'positive' : 'negative'
    } : undefined,
    retentionRate !== undefined ? {
      label: 'Retention',
      value: `${retentionRate.toFixed(1)}%`,
      status: retentionRate > 50 ? 'positive' : 'negative'
    } : undefined,
    retainedClients !== undefined ? {
      label: 'Retained',
      value: retainedClients,
      status: 'neutral'
    } : undefined,
  ].filter(Boolean) as {
    label: string;
    value: string | number;
    status?: 'positive' | 'neutral' | 'negative';
  }[];

  return (
    <Card 
      className="card-hover bg-white/60 backdrop-blur-sm cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              {displayTitle}
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
        
        {displayMetrics.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {displayMetrics.map((metric, index) => (
              <div key={index} className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                  {metric.label}
                </span>
                <span className={`text-sm font-medium ${
                  metric.status === 'positive' ? 'text-green-600' : 
                  metric.status === 'negative' ? 'text-red-600' : 
                  'text-amber-600'
                }`}>
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudioMetricCard;
