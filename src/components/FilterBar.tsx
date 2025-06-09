import React from 'react';
import { Search, Calendar, MapPin, User, Filter, BarChart3, ArrowDownUp, Columns, Grid, List, Store, X, Clock, Database, ChevronDown, Sparkles } from 'lucide-react';
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
import { cn } from '@/lib/utils';
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

  // Enhanced quick periods with better mapping
  const quickPeriods = [{
    label: 'All Time',
    value: 'all-time',
    icon: Clock
  }, {
    label: 'This Week',
    value: 'this-week',
    icon: Calendar
  }, {
    label: 'This Month',
    value: 'this-month',
    icon: Calendar
  }, {
    label: 'Last Month',
    value: 'last-month',
    icon: Calendar
  }, {
    label: 'Q2 2023',
    value: 'q2-2023',
    icon: BarChart3
  }];
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

    // Immediately apply the filter
    console.log(`Applying filter: ${key} = ${value}`);
    onFilterChange(newFilters);
  };
  const handleQuickPeriodClick = (period: {
    label: string;
    value: string;
  }) => {
    console.log(`Quick period clicked: ${period.label} (${period.value})`);
    handleFilterChange('period', period.value);
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
  return <Card className="bg-gradient-to-r from-white/80 via-white/70 to-blue-50/60 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-2xl mb-8 overflow-hidden transition-all duration-700 hover:shadow-3xl group">
      <CardContent className="p-8">
        <div className="flex flex-col space-y-8">
          {/* Enhanced Data View Toggle */}
          <div className="flex justify-between items-center border-b border-white/20 pb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-slate-100/80 to-blue-50/60 p-1.5 rounded-2xl flex items-center backdrop-blur-sm border border-white/30 shadow-lg">
                <Label htmlFor="data-view-toggle" className={`px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-500 flex items-center gap-2 ${activeDataMode === 'teacher' ? 'bg-white shadow-lg text-slate-800 scale-105' : 'text-slate-500 hover:text-slate-700'}`}>
                  <User className="h-4 w-4" />
                  Teacher View
                </Label>
                <Switch id="data-view-toggle" checked={activeDataMode === 'studio'} onCheckedChange={checked => onDataModeChange(checked ? 'studio' : 'teacher')} className="mx-2" />
                <Label htmlFor="data-view-toggle" className={`px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-500 flex items-center gap-2 ${activeDataMode === 'studio' ? 'bg-white shadow-lg text-slate-800 scale-105' : 'text-slate-500 hover:text-slate-700'}`}>
                  <Store className="h-4 w-4" />
                  Studio View
                </Label>
              </div>
              
              <Popover open={viewOptionsOpen} onOpenChange={setViewOptionsOpen}>
                <PopoverTrigger asChild>
                  
                </PopoverTrigger>
                <PopoverContent className="w-72 p-4 bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-semibold text-slate-700">Display Mode</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant={activeViewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => {
                      onViewModeChange('table');
                      setViewOptionsOpen(false);
                    }} className="h-12 flex-col gap-1 transition-all duration-300 rounded-xl">
                        <List className="h-4 w-4" />
                        <span className="text-xs">Table</span>
                      </Button>
                      <Button variant={activeViewMode === 'cards' ? 'default' : 'outline'} size="sm" onClick={() => {
                      onViewModeChange('cards');
                      setViewOptionsOpen(false);
                    }} className="h-12 flex-col gap-1 transition-all duration-300 rounded-xl">
                        <Grid className="h-4 w-4" />
                        <span className="text-xs">Cards</span>
                      </Button>
                      <Button variant={activeViewMode === 'detailed' ? 'default' : 'outline'} size="sm" onClick={() => {
                      onViewModeChange('detailed');
                      setViewOptionsOpen(false);
                    }} className="h-12 flex-col gap-1 transition-all duration-300 rounded-xl">
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-xs">Detail</span>
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="text-sm text-slate-600 font-medium bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
              {activeDataMode === 'teacher' ? 'Individual trainer performance' : 'Aggregated studio metrics'}
            </div>
          </div>
        
          {/* Enhanced Quick Filter Buttons */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Quick Time Filters</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {quickPeriods.map(period => {
              const IconComponent = period.icon;
              const isActive = filters.period === period.value;
              return <Button key={period.value} variant={isActive ? "default" : "outline"} size="sm" onClick={() => handleQuickPeriodClick(period)} className={cn("whitespace-nowrap transition-all duration-500 rounded-xl flex items-center gap-2 min-w-fit", "hover:scale-105 transform-gpu shadow-lg hover:shadow-xl backdrop-blur-sm", isActive ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl scale-105" : "bg-white/70 hover:bg-white/90 border-white/40")}>
                    <IconComponent className="h-4 w-4" />
                    {period.label}
                  </Button>;
            })}
            </div>
          </div>
          
          {/* Active filters display */}
          {activeFiltersCount > 0 && <div className="flex flex-wrap gap-3 p-4 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 backdrop-blur-sm rounded-2xl border border-white/30 animate-scale-in">
              <div className="text-sm text-slate-700 flex items-center mr-2 font-semibold">
                <Filter className="h-4 w-4 mr-2 text-blue-600" /> 
                Active filters:
              </div>
              {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            const iconMap = {
              location: MapPin,
              teacher: User,
              period: Calendar,
              search: Search
            };
            const IconComponent = iconMap[key as keyof typeof iconMap];
            return <Badge key={key} variant="secondary" className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-white/40 text-slate-700 hover:bg-white transition-all duration-300 rounded-xl px-3 py-1.5 shadow-sm">
                    <IconComponent className="h-3.5 w-3.5" />
                    {key === 'search' ? `"${value}"` : value}
                    <X className="h-3.5 w-3.5 ml-1 opacity-70 hover:opacity-100 cursor-pointer hover:scale-110 transition-all duration-200" onClick={e => {
                e.stopPropagation();
                handleFilterChange(key, '');
              }} />
                  </Badge>;
          })}
            </div>}

          {/* Enhanced Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <CommandSearchInput placeholder="Search teachers, locations..." value={filters.search} onChange={value => handleFilterChange('search', value)} className="flex-1 shadow-lg transition-all duration-500 focus-within:shadow-2xl bg-white/80 backdrop-blur-sm border-white/40 rounded-xl" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select value={filters.location} onValueChange={value => handleFilterChange('location', value)}>
                        <SelectTrigger className={cn("w-full transition-all duration-500 bg-white/80 backdrop-blur-sm border-white/40 rounded-xl shadow-lg hover:shadow-xl", filters.location ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50' : '')}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-600" />
                            <SelectValue placeholder="Location" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl rounded-xl">
                          <SelectItem value="all-locations" className="flex items-center rounded-lg">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5" />
                              All Locations
                            </div>
                          </SelectItem>
                          {locations.map(location => <SelectItem key={location} value={location} className="rounded-lg">
                              {location}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl">
                    <p className="text-xs">Filter by studio location</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select value={filters.teacher} onValueChange={value => handleFilterChange('teacher', value)}>
                        <SelectTrigger className={cn("w-full transition-all duration-500 bg-white/80 backdrop-blur-sm border-white/40 rounded-xl shadow-lg hover:shadow-xl", filters.teacher ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50' : '')}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-600" />
                            <SelectValue placeholder="Teacher" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl rounded-xl">
                          <SelectItem value="all-teachers" className="flex items-center rounded-lg">
                            <div className="flex items-center gap-2">
                              <User className="h-3.5 w-3.5" />
                              All Teachers
                            </div>
                          </SelectItem>
                          {teachers.map(teacher => <SelectItem key={teacher} value={teacher} className="rounded-lg">
                              {teacher}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl">
                    <p className="text-xs">Filter by teacher name</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select value={filters.period} onValueChange={value => handleFilterChange('period', value)}>
                        <SelectTrigger className={cn("w-full transition-all duration-500 bg-white/80 backdrop-blur-sm border-white/40 rounded-xl shadow-lg hover:shadow-xl", filters.period ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50' : '')}>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-600" />
                            <SelectValue placeholder="Period" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl rounded-xl">
                          <SelectItem value="all-periods" className="flex items-center rounded-lg">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5" />
                              All Periods
                            </div>
                          </SelectItem>
                          {periods.map(period => <SelectItem key={period} value={period} className="rounded-lg">
                              {period}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl">
                    <p className="text-xs">Filter by time period</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="flex gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="shrink-0 bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border-red-200 hover:border-red-300 text-red-600 transition-all duration-500 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105" onClick={handleReset}>
                      <X className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl">
                    <p className="text-xs">Clear all filters</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default FilterBar;