
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Info, ArrowUpCircle, ArrowDownCircle, User, Wallet, Repeat } from 'lucide-react';

interface StudioMetricCardProps {
  title: string;
  value: string;
  location?: string;
  metrics?: {
    label: string;
    value: string | number;
    status?: 'positive' | 'neutral' | 'negative';
  }[];
  icon?: React.ReactNode | string;
  tooltip?: string;
  prevValue?: string;
  changeType?: 'positive' | 'neutral' | 'negative';
}

const StudioMetricCard: React.FC<StudioMetricCardProps> = ({
  title,
  value,
  location = '',
  metrics = [],
  icon,
  tooltip,
  prevValue,
  changeType,
}) => {
  // Render icon based on string name or React node
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    
    switch (icon as string) {
      case 'user':
        return <User className="h-5 w-5" />;
      case 'arrowUpCircle':
        return <ArrowUpCircle className="h-5 w-5" />;
      case 'repeat':
        return <Repeat className="h-5 w-5" />;
      case 'wallet':
        return <Wallet className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

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
              {value}
            </div>
            {prevValue && (
              <div className={`text-xs font-medium mt-0.5 ${
                changeType === 'positive' ? 'text-green-600' : 
                changeType === 'negative' ? 'text-red-600' : 
                'text-muted-foreground'
              }`}>
                vs {prevValue}
              </div>
            )}
            {location && (
              <div className="text-xs font-medium text-muted-foreground mt-1">
                {location}
              </div>
            )}
          </div>
          <div className="text-primary">
            {renderIcon()}
          </div>
        </div>
        
        {metrics && metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            {metrics.map((metric, index) => (
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
