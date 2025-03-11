
import React from 'react';
import { Search, Calendar, MapPin, User, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border mb-6 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
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
              <SelectItem value="">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
              <SelectItem value="">All Teachers</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher} value={teacher}>
                  {teacher}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
              <SelectItem value="">All Periods</SelectItem>
              {periods.map((period) => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="outline"
          className="shrink-0"
          onClick={handleReset}
        >
          <Filter className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;
