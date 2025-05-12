
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface PerformanceMetricCardProps {
  title?: string;
  value: string;
  secondaryValue?: string;
  icon?: React.ReactNode;
  status?: 'positive' | 'neutral' | 'negative';
  tooltip?: string;
  trend?: {
    value: number;
    label?: string;
  };
  onCustomClick?: (e: React.MouseEvent) => void;
  // Add missing properties from ResultsTable
  teacherName?: string;
  location?: string;
  newClients?: number;
  retainedClients?: number;
  convertedClients?: number;
  conversionRate?: number;
  retentionRate?: number;
  totalRevenue?: number;
  onClick?: () => void;
}

const PerformanceMetricCard: React.FC<PerformanceMetricCardProps> = ({
  title,
  value,
  secondaryValue,
  icon,
  status,
  tooltip,
  trend,
  onCustomClick,
  onClick,
  teacherName,
  totalRevenue,
}) => {
  // Generate a default value from teacherName and totalRevenue if not provided directly
  const displayValue = value || (totalRevenue ? `₹${totalRevenue.toLocaleString()}` : '0');
  const displayTitle = title || (teacherName ? `${teacherName}` : 'Performance');

  const getStatusColor = () => {
    if (!status) return '';
    if (status === 'positive') return 'text-green-500';
    if (status === 'neutral') return 'text-amber-500';
    return 'text-red-500';
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onCustomClick) {
      onCustomClick(e);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Card 
      className="card-hover bg-white/60 backdrop-blur-sm cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
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
            <div className={`text-2xl font-bold mt-1 ${getStatusColor()}`}>
              {displayValue}
              {secondaryValue && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({secondaryValue})
                </span>
              )}
            </div>
            {trend && (
              <div className={`text-xs mt-1 ${trend.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
                {trend.label && <span className="ml-1 text-muted-foreground">{trend.label}</span>}
              </div>
            )}
          </div>
          <div className={`${status ? getStatusColor() : ''}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetricCard;
