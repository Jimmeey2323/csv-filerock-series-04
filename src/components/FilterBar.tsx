import React from 'react';
import { Search, Calendar, MapPin, User, Filter, BarChart3, ArrowDownUp, Columns, Grid, List, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CommandSearchInput from '@/components/ui/command-input';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface FilterBarProps {
  locations: string[];
  teachers: string[];
  periods: string[];
  activeViewMode: 'table' | 'cards' | 'detailed';
  activeDataMode: 'teacher' | 'studio';
  onViewModeChange: (mode: 'table' | 'cards' | 'detailed') => void;
  onDataModeChange: (mode: 'teacher' | 'studio') => void;
  onFilterChange: (filters: {
    location?: string;
    teacher?: string;
    period?: string;
    search?: string;
  }) => void;
  initialSearch?: string; // Add initialSearch prop
}

const FilterBar: React.FC<FilterBarProps> = ({
  locations,
  teachers,
  periods,
  activeViewMode,
  activeDataMode,
  onViewModeChange,
  onDataModeChange,
  onFilterChange,
  initialSearch = '', // Add default value
}) => {
  const [filters, setFilters] = React.useState({
    location: '',
    teacher: '',
    period: '',
    search: initialSearch || '', // Use initialSearch if provided
  });

  React.useEffect(() => {
    // Update search filter when initialSearch changes
    if (initialSearch !== undefined && initialSearch !== filters.search) {
      setFilters(prev => ({ ...prev, search: initialSearch }));
      // Only trigger filter change if initialSearch is not empty
      if (initialSearch) {
        onFilterChange({ ...filters, search: initialSearch });
      }
    }
  }, [initialSearch]);

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

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card className="bg-white/70 backdrop-blur-sm rounded-lg border shadow-sm mb-4 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          {/* Data View Toggle */}
          <div className="flex justify-between items-center border-b pb-3">
            <div className="flex items-center space-x-2">
              <Label htmlFor="data-view-toggle" className="text-sm font-medium">
                {activeDataMode === 'teacher' ? 'Teacher View' : 'Studio View'}
              </Label>
              <Switch
                id="data-view-toggle"
                checked={activeDataMode === 'studio'}
                onCheckedChange={(checked) => onDataModeChange(checked ? 'studio' : 'teacher')}
              />
              <Label htmlFor="data-view-toggle" className="text-sm text-muted-foreground">
                {activeDataMode === 'teacher' ? <User className="h-4 w-4" /> : <Store className="h-4 w-4" />}
              </Label>
            </div>
            <div className="text-xs text-muted-foreground">
              {activeDataMode === 'teacher' 
                ? 'View data by individual trainers' 
                : 'View aggregated studio performance'}
            </div>
          </div>
        
          {/* Active filters display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              <div className="text-sm text-muted-foreground flex items-center mr-2">
                <Filter className="h-3.5 w-3.5 mr-1" /> Active filters:
              </div>
              {filters.location && (
                <Badge variant="active" className="flex items-center gap-1 px-3 py-1">
                  <MapPin className="h-3 w-3" />
                  {filters.location === 'all-locations' ? 'All Locations' : filters.location}
                </Badge>
              )}
              {filters.teacher && (
                <Badge variant="active" className="flex items-center gap-1 px-3 py-1">
                  <User className="h-3 w-3" />
                  {filters.teacher === 'all-teachers' ? 'All Teachers' : filters.teacher}
                </Badge>
              )}
              {filters.period && (
                <Badge variant="active" className="flex items-center gap-1 px-3 py-1">
                  <Calendar className="h-3 w-3" />
                  {filters.period === 'all-periods' ? 'All Periods' : filters.period}
                </Badge>
              )}
              {filters.search && (
                <Badge variant="active" className="flex items-center gap-1 px-3 py-1">
                  <Search className="h-3 w-3" />
                  "{filters.search}"
                </Badge>
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <CommandSearchInput
                placeholder="Search teacher..."
                value={filters.search}
                onChange={(value) => handleFilterChange('search', value)}
                className="flex-1"
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
                        <SelectTrigger className={`w-full ${filters.location ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
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
                        <SelectTrigger className={`w-full ${filters.teacher ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
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
                        <SelectTrigger className={`w-full ${filters.period ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
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

          {/* View switcher */}
          <div className="flex justify-between items-center pt-2">
            <div className="text-sm text-muted-foreground">
              Choose view:
            </div>
            <div className="flex gap-2">
              <Button 
                variant={activeViewMode === 'table' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => onViewModeChange('table')}
                className="flex items-center gap-1"
              >
                <Columns className="h-4 w-4 mr-1" />
                Table
              </Button>
              <Button 
                variant={activeViewMode === 'cards' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => onViewModeChange('cards')}
                className="flex items-center gap-1"
              >
                <Grid className="h-4 w-4 mr-1" />
                Cards
              </Button>
              <Button 
                variant={activeViewMode === 'detailed' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => onViewModeChange('detailed')}
                className="flex items-center gap-1"
              >
                <List className="h-4 w-4 mr-1" />
                Detailed
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterBar;
