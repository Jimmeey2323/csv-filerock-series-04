
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  X, 
  Filter, 
  User, 
  Store, 
  List, 
  Grid, 
  BarChart3, 
  Database,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface FilterBarProps {
  locations: string[];
  teachers: string[];
  periods: string[];
  activeViewMode: 'table' | 'cards' | 'detailed' | 'pivot';
  activeDataMode: 'teacher' | 'studio';
  onViewModeChange: (mode: 'table' | 'cards' | 'detailed' | 'pivot') => void;
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
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [viewOptionsOpen, setViewOptionsOpen] = useState(false);

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const handleFilterChange = () => {
    onFilterChange({
      location: selectedLocation,
      teacher: selectedTeacher,
      period: selectedPeriod,
      search: searchTerm
    });
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleFilterChange();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedLocation, selectedTeacher, selectedPeriod]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setSelectedTeacher('');
    setSelectedPeriod('');
  };

  const hasActiveFilters = searchTerm || selectedLocation || selectedTeacher || selectedPeriod;

  return (
    <Card className="bg-gradient-to-r from-white/80 via-white/70 to-blue-50/60 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-2xl mb-8 overflow-hidden transition-all duration-700 hover:shadow-3xl group">
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
                <Switch 
                  id="data-view-toggle" 
                  checked={activeDataMode === 'studio'} 
                  onCheckedChange={checked => onDataModeChange(checked ? 'studio' : 'teacher')} 
                  className="mx-2" 
                />
                <Label htmlFor="data-view-toggle" className={`px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-500 flex items-center gap-2 ${activeDataMode === 'studio' ? 'bg-white shadow-lg text-slate-800 scale-105' : 'text-slate-500 hover:text-slate-700'}`}>
                  <Store className="h-4 w-4" />
                  Studio View
                </Label>
              </div>
              
              <Popover open={viewOptionsOpen} onOpenChange={setViewOptionsOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-white/70 hover:bg-white/90 backdrop-blur-sm border-white/40 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    View Options
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 bg-white/90 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-semibold text-slate-700">Display Mode</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={activeViewMode === 'table' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => {
                          onViewModeChange('table');
                          setViewOptionsOpen(false);
                        }} 
                        className="h-12 flex-col gap-1 transition-all duration-300 rounded-xl"
                      >
                        <List className="h-4 w-4" />
                        <span className="text-xs">Table</span>
                      </Button>
                      <Button 
                        variant={activeViewMode === 'cards' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => {
                          onViewModeChange('cards');
                          setViewOptionsOpen(false);
                        }} 
                        className="h-12 flex-col gap-1 transition-all duration-300 rounded-xl"
                      >
                        <Grid className="h-4 w-4" />
                        <span className="text-xs">Cards</span>
                      </Button>
                      <Button 
                        variant={activeViewMode === 'detailed' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => {
                          onViewModeChange('detailed');
                          setViewOptionsOpen(false);
                        }} 
                        className="h-12 flex-col gap-1 transition-all duration-300 rounded-xl"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-xs">Metrics</span>
                      </Button>
                      <Button 
                        variant={activeViewMode === 'pivot' ? 'default' : 'outline'} 
                        size="sm" 
                        onClick={() => {
                          onViewModeChange('pivot');
                          setViewOptionsOpen(false);
                        }} 
                        className="h-12 flex-col gap-1 transition-all duration-300 rounded-xl"
                      >
                        <Database className="h-4 w-4" />
                        <span className="text-xs">Pivot</span>
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

          {/* Search and Filter Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search teachers or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 border-white/40 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 focus:shadow-xl focus:bg-white/90"
              />
            </div>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="bg-white/80 border-white/40 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 focus:shadow-xl focus:bg-white/90">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="bg-white/80 border-white/40 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 focus:shadow-xl focus:bg-white/90">
                <SelectValue placeholder="All Teachers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Teachers</SelectItem>
                {teachers.map(teacher => (
                  <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="bg-white/80 border-white/40 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 focus:shadow-xl focus:bg-white/90">
                <SelectValue placeholder="All Periods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Periods</SelectItem>
                {periods.map(period => (
                  <SelectItem key={period} value={period}>{period}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-3 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Filter className="h-4 w-4" />
                Active filters:
              </div>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchTerm}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                  </Badge>
                )}
                {selectedLocation && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Location: {selectedLocation}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedLocation('')} />
                  </Badge>
                )}
                {selectedTeacher && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Teacher: {selectedTeacher}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedTeacher('')} />
                  </Badge>
                )}
                {selectedPeriod && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Period: {selectedPeriod}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedPeriod('')} />
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
                Clear All
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterBar;
