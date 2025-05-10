
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/calendar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Filter, Calendar, DollarSign, Percent, User2, MapPin, X, Save, Check } from 'lucide-react';

interface AdvancedFiltersProps {
  locations: string[];
  teachers: string[];
  periods: string[];
  onApplyFilters: (filters: any) => void;
  activeFilters: Record<string, any>;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  locations,
  teachers,
  periods,
  onApplyFilters,
  activeFilters,
}) => {
  const [filters, setFilters] = useState(activeFilters);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleFilterChange = (category: string, key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [key]: value,
      }
    }));
  };
  
  const handleReset = () => {
    setFilters({});
  };
  
  const handleApply = () => {
    onApplyFilters(filters);
    setIsOpen(false);
  };
  
  const getActiveFiltersCount = () => {
    let count = 0;
    Object.values(filters).forEach((category: any) => {
      count += Object.values(category).filter(Boolean).length;
    });
    return count;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <Filter className="h-4 w-4" />
          <span>Advanced Filters</span>
          {getActiveFiltersCount() > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[500px] sm:w-[540px] overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Configure detailed filters to analyze your data
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <Accordion type="multiple" defaultValue={["basic", "performance", "clients", "revenue"]}>
            <AccordionItem value="basic">
              <AccordionTrigger className="text-base font-medium">
                Basic Filters
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location-filter">Location</Label>
                    <Select 
                      value={filters.basic?.location || ''} 
                      onValueChange={(value) => handleFilterChange('basic', 'location', value)}
                    >
                      <SelectTrigger id="location-filter" className="w-full">
                        <SelectValue placeholder="All Locations" />
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
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="teacher-filter">Teacher</Label>
                    <Select 
                      value={filters.basic?.teacher || ''} 
                      onValueChange={(value) => handleFilterChange('basic', 'teacher', value)}
                    >
                      <SelectTrigger id="teacher-filter" className="w-full">
                        <SelectValue placeholder="All Teachers" />
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
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="period-filter">Time Period</Label>
                  <Select 
                    value={filters.basic?.period || ''} 
                    onValueChange={(value) => handleFilterChange('basic', 'period', value)}
                  >
                    <SelectTrigger id="period-filter" className="w-full">
                      <SelectValue placeholder="All Periods" />
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
                
                <div className="space-y-2">
                  <Label htmlFor="search-filter">Search</Label>
                  <Input 
                    id="search-filter"
                    placeholder="Search by name, email, etc." 
                    value={filters.basic?.search || ''} 
                    onChange={(e) => handleFilterChange('basic', 'search', e.target.value)} 
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="performance">
              <AccordionTrigger className="text-base font-medium">
                Performance Metrics
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="space-y-4">
                  <Label className="flex items-center justify-between">
                    <span>Retention Rate Range</span>
                    <span className="text-sm font-normal">
                      {filters.performance?.minRetention || 0}% - {filters.performance?.maxRetention || 100}%
                    </span>
                  </Label>
                  <div className="px-2">
                    <Slider
                      defaultValue={[
                        filters.performance?.minRetention || 0, 
                        filters.performance?.maxRetention || 100
                      ]}
                      max={100}
                      step={1}
                      onValueChange={(values) => {
                        handleFilterChange('performance', 'minRetention', values[0]);
                        handleFilterChange('performance', 'maxRetention', values[1]);
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label className="flex items-center justify-between">
                    <span>Conversion Rate Range</span>
                    <span className="text-sm font-normal">
                      {filters.performance?.minConversion || 0}% - {filters.performance?.maxConversion || 100}%
                    </span>
                  </Label>
                  <div className="px-2">
                    <Slider
                      defaultValue={[
                        filters.performance?.minConversion || 0, 
                        filters.performance?.maxConversion || 100
                      ]}
                      max={100}
                      step={1}
                      onValueChange={(values) => {
                        handleFilterChange('performance', 'minConversion', values[0]);
                        handleFilterChange('performance', 'maxConversion', values[1]);
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Show Only</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="high-performers" 
                        checked={filters.performance?.highPerformers || false}
                        onCheckedChange={(value) => 
                          handleFilterChange('performance', 'highPerformers', Boolean(value))
                        }
                      />
                      <label
                        htmlFor="high-performers"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        High Performers (Top 25%)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="low-performers" 
                        checked={filters.performance?.lowPerformers || false}
                        onCheckedChange={(value) => 
                          handleFilterChange('performance', 'lowPerformers', Boolean(value))
                        }
                      />
                      <label
                        htmlFor="low-performers"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Low Performers (Bottom 25%)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="improving" 
                        checked={filters.performance?.improving || false}
                        onCheckedChange={(value) => 
                          handleFilterChange('performance', 'improving', Boolean(value))
                        }
                      />
                      <label
                        htmlFor="improving"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Improving Trend
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="declining" 
                        checked={filters.performance?.declining || false}
                        onCheckedChange={(value) => 
                          handleFilterChange('performance', 'declining', Boolean(value))
                        }
                      />
                      <label
                        htmlFor="declining"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Declining Trend
                      </label>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="clients">
              <AccordionTrigger className="text-base font-medium">
                Client Filters
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="space-y-4">
                  <Label>Client Acquisition</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-clients" className="text-sm">Min New Clients</Label>
                      <Input 
                        id="min-clients"
                        type="number" 
                        placeholder="Min" 
                        value={filters.clients?.minNewClients || ''} 
                        onChange={(e) => handleFilterChange('clients', 'minNewClients', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-clients" className="text-sm">Max New Clients</Label>
                      <Input 
                        id="max-clients"
                        type="number" 
                        placeholder="Max" 
                        value={filters.clients?.maxNewClients || ''} 
                        onChange={(e) => handleFilterChange('clients', 'maxNewClients', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Client Sources</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="trials" 
                        checked={filters.clients?.trials || false}
                        onCheckedChange={(value) => 
                          handleFilterChange('clients', 'trials', Boolean(value))
                        }
                      />
                      <label
                        htmlFor="trials"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Trials
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="referrals" 
                        checked={filters.clients?.referrals || false}
                        onCheckedChange={(value) => 
                          handleFilterChange('clients', 'referrals', Boolean(value))
                        }
                      />
                      <label
                        htmlFor="referrals"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Referrals
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="hosted" 
                        checked={filters.clients?.hosted || false}
                        onCheckedChange={(value) => 
                          handleFilterChange('clients', 'hosted', Boolean(value))
                        }
                      />
                      <label
                        htmlFor="hosted"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Hosted Events
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="influencers" 
                        checked={filters.clients?.influencers || false}
                        onCheckedChange={(value) => 
                          handleFilterChange('clients', 'influencers', Boolean(value))
                        }
                      />
                      <label
                        htmlFor="influencers"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Influencer Signups
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="no-show-rate"
                      checked={filters.clients?.showNoShowRate || false}
                      onCheckedChange={(value) => 
                        handleFilterChange('clients', 'showNoShowRate', value)
                      }
                    />
                    <Label htmlFor="no-show-rate">Filter by No-Show Rate</Label>
                  </div>
                  {filters.clients?.showNoShowRate && (
                    <div className="pt-2">
                      <Label className="flex items-center justify-between">
                        <span className="text-sm">Max No-Show Rate</span>
                        <span className="text-sm font-normal">
                          {filters.clients?.maxNoShowRate || 30}%
                        </span>
                      </Label>
                      <Slider
                        defaultValue={[filters.clients?.maxNoShowRate || 30]}
                        max={100}
                        step={1}
                        onValueChange={(values) => {
                          handleFilterChange('clients', 'maxNoShowRate', values[0]);
                        }}
                        className="pt-2"
                      />
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="revenue">
              <AccordionTrigger className="text-base font-medium">
                Revenue Filters
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="space-y-4">
                  <Label>Revenue Range (₹)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-revenue" className="text-sm">Minimum Revenue</Label>
                      <Input 
                        id="min-revenue"
                        type="number" 
                        placeholder="Min ₹" 
                        value={filters.revenue?.minRevenue || ''} 
                        onChange={(e) => handleFilterChange('revenue', 'minRevenue', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-revenue" className="text-sm">Maximum Revenue</Label>
                      <Input 
                        id="max-revenue"
                        type="number" 
                        placeholder="Max ₹" 
                        value={filters.revenue?.maxRevenue || ''} 
                        onChange={(e) => handleFilterChange('revenue', 'maxRevenue', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Revenue Per Client Range (₹)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min-revenue-per-client" className="text-sm">Minimum</Label>
                      <Input 
                        id="min-revenue-per-client"
                        type="number" 
                        placeholder="Min ₹" 
                        value={filters.revenue?.minRevenuePerClient || ''} 
                        onChange={(e) => handleFilterChange('revenue', 'minRevenuePerClient', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-revenue-per-client" className="text-sm">Maximum</Label>
                      <Input 
                        id="max-revenue-per-client"
                        type="number" 
                        placeholder="Max ₹" 
                        value={filters.revenue?.maxRevenuePerClient || ''} 
                        onChange={(e) => handleFilterChange('revenue', 'maxRevenuePerClient', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Revenue Trend</Label>
                  <div className="pt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="increasing-revenue" 
                        checked={filters.revenue?.increasingTrend || false}
                        onCheckedChange={(value) => 
                          handleFilterChange('revenue', 'increasingTrend', Boolean(value))
                        }
                      />
                      <label
                        htmlFor="increasing-revenue"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Increasing Revenue Trend
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="decreasing-revenue" 
                        checked={filters.revenue?.decreasingTrend || false}
                        onCheckedChange={(value) => 
                          handleFilterChange('revenue', 'decreasingTrend', Boolean(value))
                        }
                      />
                      <label
                        htmlFor="decreasing-revenue"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Decreasing Revenue Trend
                      </label>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        <SheetFooter className="pt-4 border-t flex flex-row justify-between space-x-4">
          <Button variant="ghost" onClick={handleReset} className="gap-2">
            <X className="h-4 w-4" />
            Reset Filters
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} className="gap-2">
              <Check className="h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AdvancedFilters;
