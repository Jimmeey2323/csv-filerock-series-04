
import React from 'react';
import { Search, Calendar, MapPin, User, Filter, BarChart3, ArrowDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FilterBarProps {
  locations: string[];
  teachers: string[];
  periods: string[];
  onFilterChange: (filters: {
    location?: string;
    teacher?: string;
    period?: string;
    search?: string;
  }) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  locations,
  teachers,
  periods,
  onFilterChange,
}) => {
  const [filters, setFilters] = React.useState({
    location: '',
    teacher: '',
    period: '',
    search: '',
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      location: '',
      teacher: '',
      period: '',
      search: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border shadow-sm mb-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teacher..."
            className="pl-9"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Select
                    value={filters.location}
                    onValueChange={(value) => handleFilterChange('location', value)}
                  >
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Location" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-locations">All Locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Filter by studio location</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Select
                    value={filters.teacher}
                    onValueChange={(value) => handleFilterChange('teacher', value)}
                  >
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Teacher" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-teachers">All Teachers</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher} value={teacher}>
                          {teacher}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Filter by teacher name</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Select
                    value={filters.period}
                    onValueChange={(value) => handleFilterChange('period', value)}
                  >
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Period" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-periods">All Periods</SelectItem>
                      {periods.map((period) => (
                        <SelectItem key={period} value={period}>
                          {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Filter by time period</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="shrink-0 bg-white hover:bg-secondary/50"
                  onClick={handleReset}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Clear all filters</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
