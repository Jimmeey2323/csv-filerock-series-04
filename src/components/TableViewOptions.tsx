
import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutTable,
  LayoutGrid, 
  LayoutList, 
  BarChart, 
  PieChart,
  Calendar,
  SlidersHorizontal,
  User,
  Store,
  MapPin,
  Eye,
  ArrowUpDown,
  Settings
} from 'lucide-react';

interface TableViewOptionsProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onGroupByChange: (field: string) => void;
  onVisibilityChange: (columns: string[]) => void;
  onSortChange: (column: string, direction: 'asc' | 'desc') => void;
  availableColumns: string[];
  visibleColumns: string[];
  activeGroupBy: string;
  activeSort: { column: string; direction: 'asc' | 'desc' };
}

const TableViewOptions: React.FC<TableViewOptionsProps> = ({
  activeView,
  onViewChange,
  onGroupByChange,
  onVisibilityChange,
  onSortChange,
  availableColumns,
  visibleColumns,
  activeGroupBy,
  activeSort
}) => {
  const views = [
    { id: 'table', label: 'Table', icon: LayoutTable },
    { id: 'cards', label: 'Cards', icon: LayoutGrid },
    { id: 'detailed', label: 'Detailed', icon: LayoutList },
    { id: 'analytics', label: 'Analytics', icon: BarChart },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'trends', label: 'Trends', icon: PieChart },
  ];

  const handleColumnVisibilityChange = (column: string, isChecked: boolean) => {
    if (isChecked) {
      onVisibilityChange([...visibleColumns, column]);
    } else {
      onVisibilityChange(visibleColumns.filter(col => col !== column));
    }
  };

  return (
    <div className="flex flex-col space-y-4 animate-fade-in">
      <div className="flex justify-between items-center bg-white/30 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-slate-100">
        <Tabs value={activeView} onValueChange={onViewChange} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
            {views.map(view => (
              <TabsTrigger key={view.id} value={view.id} className="flex items-center gap-2 data-[state=active]:bg-white/80">
                <view.icon className="h-4 w-4" />
                <span className="font-medium">{view.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2 ml-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 bg-white/80 hover:bg-white shadow-sm border-slate-200 hover:border-slate-300 button-hover">
                <Settings className="h-4 w-4 text-slate-600" />
                <span className="text-slate-700">Table Options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white/95 backdrop-blur-xl border-slate-200 shadow-lg animate-fade-in">
              <DropdownMenuLabel className="text-slate-700 font-medium">Table Configuration</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200" />
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="hover:bg-slate-100">
                  <SlidersHorizontal className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Group By</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-white/95 backdrop-blur-xl border-slate-200 shadow-lg animate-fade-in">
                    <DropdownMenuRadioGroup value={activeGroupBy} onValueChange={onGroupByChange}>
                      <DropdownMenuRadioItem value="teacher" className="hover:bg-slate-100">
                        <User className="mr-2 h-4 w-4 text-indigo-500" />
                        Teacher
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="studio" className="hover:bg-slate-100">
                        <Store className="mr-2 h-4 w-4 text-blue-500" />
                        Studio
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="location" className="hover:bg-slate-100">
                        <MapPin className="mr-2 h-4 w-4 text-green-500" />
                        Location
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="period" className="hover:bg-slate-100">
                        <Calendar className="mr-2 h-4 w-4 text-amber-500" />
                        Period
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="hover:bg-slate-100">
                  <Eye className="mr-2 h-4 w-4 text-violet-500" />
                  <span>Column Visibility</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="max-h-80 overflow-y-auto bg-white/95 backdrop-blur-xl border-slate-200 shadow-lg animate-fade-in">
                    {availableColumns.map(column => (
                      <DropdownMenuCheckboxItem
                        key={column}
                        checked={visibleColumns.includes(column)}
                        onCheckedChange={(checked) => 
                          handleColumnVisibilityChange(column, checked as boolean)
                        }
                        className="hover:bg-slate-100"
                      >
                        {column}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="hover:bg-slate-100">
                  <ArrowUpDown className="mr-2 h-4 w-4 text-cyan-500" />
                  <span>Sort By</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-white/95 backdrop-blur-xl border-slate-200 shadow-lg animate-fade-in">
                    {availableColumns.map(column => (
                      <DropdownMenuSub key={column}>
                        <DropdownMenuSubTrigger className="hover:bg-slate-100 justify-between">
                          <span>{column}</span>
                          {activeSort.column === column && (
                            <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 border-blue-200">
                              {activeSort.direction === 'asc' ? 'Asc' : 'Desc'}
                            </Badge>
                          )}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="bg-white/95 backdrop-blur-xl border-slate-200 shadow-lg animate-fade-in">
                            <DropdownMenuItem 
                              onClick={() => onSortChange(column, 'asc')}
                              className="hover:bg-slate-100"
                            >
                              <ArrowUpDown className="mr-2 h-4 w-4 rotate-180 text-slate-600" />
                              Ascending
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onSortChange(column, 'desc')}
                              className="hover:bg-slate-100"
                            >
                              <ArrowUpDown className="mr-2 h-4 w-4 text-slate-600" />
                              Descending
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default TableViewOptions;
