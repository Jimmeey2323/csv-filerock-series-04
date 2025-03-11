
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface PerformanceMetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  status?: 'positive' | 'neutral' | 'negative';
  tooltip?: string;
}

const PerformanceMetricCard: React.FC<PerformanceMetricCardProps> = ({
  title,
  value,
  icon,
  status,
  tooltip
}) => {
  const getStatusColor = () => {
    if (!status) return '';
    if (status === 'positive') return 'text-green-500';
    if (status === 'neutral') return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <Card className="card-hover bg-white/60 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
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
            <div className={`text-2xl font-bold mt-1 ${getStatusColor()}`}>
              {value}
            </div>
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
