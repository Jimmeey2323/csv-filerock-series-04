
import React from 'react';
import { Search, Calendar, MapPin, User, Filter, BarChart3, ArrowDownUp, Columns, Grid, List, Store, X, Clock, Database, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CommandSearchInput from '@/components/ui/command-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
  initialSearch?: string;
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
  initialSearch = ''
}) => {
  const [filters, setFilters] = React.useState({
    location: '',
    teacher: '',
    period: '',
    search: initialSearch || ''
  });

  const [viewOptionsOpen, setViewOptionsOpen] = React.useState(false);
  
  // Common periods for quick filters
  const quickPeriods = [
    { label: 'This Week', value: 'this-week' },
    { label: 'This Month', value: 'this-month' },
    { label: 'Last Month', value: 'last-month' },
    { label: 'Q2 2023', value: 'q2-2023' },
    { label: 'All Time', value: 'all-time' }
  ];

  React.useEffect(() => {
    if (initialSearch !== undefined && initialSearch !== filters.search) {
      setFilters(prev => ({
        ...prev,
        search: initialSearch
      }));
      if (initialSearch) {
        onFilterChange({
          ...filters,
          search: initialSearch
        });
      }
    }
  }, [initialSearch]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      location: '',
      teacher: '',
      period: '',
      search: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card className="bg-white/80 backdrop-blur-lg rounded-xl border shadow-md mb-6 animate-fade-in overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-col space-y-5">
          {/* Data View Toggle */}
          <div className="flex justify-between items-center border-b pb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-100 p-1 rounded-lg flex items-center">
                <Label 
                  htmlFor="data-view-toggle" 
                  className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-all ${activeDataMode === 'teacher' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                >
                  <User className="h-3.5 w-3.5 mr-2 inline-block" />
                  Teacher View
                </Label>
                <Switch 
                  id="data-view-toggle" 
                  checked={activeDataMode === 'studio'} 
                  onCheckedChange={checked => onDataModeChange(checked ? 'studio' : 'teacher')} 
                  className="mx-1"
                />
                <Label 
                  htmlFor="data-view-toggle" 
                  className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-all ${activeDataMode === 'studio' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                >
                  <Store className="h-3.5 w-3.5 mr-2 inline-block" />
                  Studio View
                </Label>
              </div>
              
              <Popover open={viewOptionsOpen} onOpenChange={setViewOptionsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5" />
                    View Options
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">Display Mode</p>
                    <div className="grid grid-cols-3 gap-1">
                      <Button 
                        variant={activeViewMode === 'table' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => onViewModeChange('table')}
                        className="w-full h-9"
                      >
                        <List className="h-3.5 w-3.5 mr-1.5" />
                        Table
                      </Button>
                      <Button 
                        variant={activeViewMode === 'cards' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => onViewModeChange('cards')}
                        className="w-full h-9"
                      >
                        <Grid className="h-3.5 w-3.5 mr-1.5" />
                        Cards
                      </Button>
                      <Button 
                        variant={activeViewMode === 'detailed' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => onViewModeChange('detailed')}
                        className="w-full h-9"
                      >
                        <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                        Detail
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {activeDataMode === 'teacher' ? 'View data by individual trainers' : 'View aggregated studio performance'}
            </div>
          </div>
        
          {/* Quick filter buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {quickPeriods.map(period => (
              <Button
                key={period.value}
                variant={filters.period === period.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('period', period.value)}
                className="whitespace-nowrap transition-all duration-300 bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
              >
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                {period.label}
              </Button>
            ))}
          </div>
          
          {/* Active filters display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 my-1 animate-scale-in">
              <div className="text-sm text-muted-foreground flex items-center mr-2">
                <Filter className="h-3.5 w-3.5 mr-1.5" /> 
                Active filters:
              </div>
              {filters.location && (
                <Badge variant="active" className="flex items-center gap-1.5 px-3 py-1.5 group">
                  <MapPin className="h-3.5 w-3.5" />
                  {filters.location === 'all-locations' ? 'All Locations' : filters.location}
                  <X 
                    className="h-3.5 w-3.5 ml-1 opacity-70 hover:opacity-100 cursor-pointer" 
                    onClick={() => handleFilterChange('location', '')}
                  />
                </Badge>
              )}
              {filters.teacher && (
                <Badge variant="active" className="flex items-center gap-1.5 px-3 py-1.5">
                  <User className="h-3.5 w-3.5" />
                  {filters.teacher === 'all-teachers' ? 'All Teachers' : filters.teacher}
                  <X 
                    className="h-3.5 w-3.5 ml-1 opacity-70 hover:opacity-100 cursor-pointer" 
                    onClick={() => handleFilterChange('teacher', '')}
                  />
                </Badge>
              )}
              {filters.period && (
                <Badge variant="active" className="flex items-center gap-1.5 px-3 py-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {filters.period === 'all-periods' ? 'All Periods' : filters.period}
                  <X 
                    className="h-3.5 w-3.5 ml-1 opacity-70 hover:opacity-100 cursor-pointer" 
                    onClick={() => handleFilterChange('period', '')}
                  />
                </Badge>
              )}
              {filters.search && (
                <Badge variant="active" className="flex items-center gap-1.5 px-3 py-1.5">
                  <Search className="h-3.5 w-3.5" />
                  "{filters.search}"
                  <X 
                    className="h-3.5 w-3.5 ml-1 opacity-70 hover:opacity-100 cursor-pointer" 
                    onClick={() => handleFilterChange('search', '')}
                  />
                </Badge>
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <CommandSearchInput 
                placeholder="Search teacher..." 
                value={filters.search} 
                onChange={value => handleFilterChange('search', value)} 
                className="flex-1 shadow-sm transition-all duration-300 focus-within:shadow-md"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select value={filters.location} onValueChange={value => handleFilterChange('location', value)}>
                        <SelectTrigger 
                          className={`w-full transition-all duration-300 ${filters.location ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50' : ''}`}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Location" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="all-locations" className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-2" />
                            All Locations
                          </SelectItem>
                          {locations.map(location => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Filter by studio location</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select value={filters.teacher} onValueChange={value => handleFilterChange('teacher', value)}>
                        <SelectTrigger 
                          className={`w-full transition-all duration-300 ${filters.teacher ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50' : ''}`}
                        >
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Teacher" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="all-teachers" className="flex items-center">
                            <User className="h-3.5 w-3.5 mr-2" />
                            All Teachers
                          </SelectItem>
                          {teachers.map(teacher => (
                            <SelectItem key={teacher} value={teacher}>
                              {teacher}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Filter by teacher name</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select value={filters.period} onValueChange={value => handleFilterChange('period', value)}>
                        <SelectTrigger 
                          className={`w-full transition-all duration-300 ${filters.period ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50' : ''}`}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Period" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          <SelectItem value="all-periods" className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-2" />
                            All Periods
                          </SelectItem>
                          {periods.map(period => (
                            <SelectItem key={period} value={period}>
                              {period}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
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
                      className="shrink-0 bg-white hover:bg-rose-50 border-rose-200 hover:border-rose-300 text-rose-500 transition-all duration-300" 
                      onClick={handleReset}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Clear all filters</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterBar;
