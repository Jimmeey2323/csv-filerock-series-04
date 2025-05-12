
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, UserRound, Sparkles, ArrowDownUp, DollarSign, Percent } from 'lucide-react';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuickFilterButtonsProps {
  data: ProcessedTeacherData[];
  activeFilters: {[key: string]: boolean};
  onFilterClick: (filter: string) => void;
}

const QuickFilterButtons: React.FC<QuickFilterButtonsProps> = ({
  data,
  activeFilters,
  onFilterClick
}) => {
  // Identify top performers in different categories
  const getTopPerformers = () => {
    if (!data || data.length === 0) return {};
    
    // Filter out the "All Teachers" row if it exists
    const teacherData = data.filter(d => d.teacherName !== 'All Teachers');
    if (teacherData.length === 0) return {};
    
    // Sort by different metrics
    const topConversion = [...teacherData].sort((a, b) => b.conversionRate - a.conversionRate)[0];
    const topRetention = [...teacherData].sort((a, b) => b.retentionRate - a.retentionRate)[0];
    const topRevenue = [...teacherData].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
    const topNewClients = [...teacherData].sort((a, b) => b.newClients - a.newClients)[0];
    
    return {
      topConversion: topConversion.teacherName,
      topRetention: topRetention.teacherName,
      topRevenue: topRevenue.teacherName,
      topNewClients: topNewClients.teacherName
    };
  };
  
  const topPerformers = getTopPerformers();
  
  const filterButtons = [
    {
      label: "Top Conversion",
      value: topPerformers.topConversion,
      icon: <Percent className="h-4 w-4 mr-1" />,
      tooltip: `Highest conversion rate: ${topPerformers.topConversion}`
    },
    {
      label: "Top Retention",
      value: topPerformers.topRetention,
      icon: <ArrowDownUp className="h-4 w-4 mr-1" />,
      tooltip: `Highest retention rate: ${topPerformers.topRetention}`
    },
    {
      label: "Top Revenue",
      value: topPerformers.topRevenue,
      icon: <DollarSign className="h-4 w-4 mr-1" />,
      tooltip: `Highest revenue: ${topPerformers.topRevenue}`
    },
    {
      label: "Most New Clients",
      value: topPerformers.topNewClients,
      icon: <UserRound className="h-4 w-4 mr-1" />,
      tooltip: `Most new clients: ${topPerformers.topNewClients}`
    }
  ];
  
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Badge variant="outline" className="bg-secondary/20 text-secondary-foreground">
        <Filter className="h-3.5 w-3.5 mr-1" /> Quick Filters
      </Badge>
      
      {filterButtons.map((button) => (
        button.value ? (
          <Button
            key={button.label}
            variant={activeFilters[button.value] ? "secondary" : "outline"}
            size="sm"
            onClick={() => onFilterClick(button.value)}
            className={cn(
              "transition-all duration-300",
              activeFilters[button.value] 
                ? "bg-primary/90 text-primary-foreground" 
                : "hover:bg-muted/50"
            )}
            title={button.tooltip}
          >
            {button.icon}
            {button.label}
          </Button>
        ) : null
      ))}
    </div>
  );
};

export default QuickFilterButtons;
