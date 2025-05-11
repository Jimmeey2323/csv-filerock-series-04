
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
  Columns, 
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
    { id: 'table', label: 'Table', icon: Columns },
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
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={activeView} onValueChange={onViewChange}>
          <TabsList>
            {views.map(view => (
              <TabsTrigger key={view.id} value={view.id} className="flex items-center gap-2">
                <view.icon className="h-4 w-4" />
                <span>{view.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Settings className="h-4 w-4" />
                <span>Table Options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Table Configuration</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  <span>Group By</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={activeGroupBy} onValueChange={onGroupByChange}>
                      <DropdownMenuRadioItem value="teacher">
                        <User className="mr-2 h-4 w-4" />
                        Teacher
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="studio">
                        <Store className="mr-2 h-4 w-4" />
                        Studio
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="location">
                        <MapPin className="mr-2 h-4 w-4" />
                        Location
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="period">
                        <Calendar className="mr-2 h-4 w-4" />
                        Period
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Column Visibility</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="max-h-80 overflow-y-auto">
                    {availableColumns.map(column => (
                      <DropdownMenuCheckboxItem
                        key={column}
                        checked={visibleColumns.includes(column)}
                        onCheckedChange={(checked) => 
                          handleColumnVisibilityChange(column, checked as boolean)
                        }
                      >
                        {column}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <span>Sort By</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {availableColumns.map(column => (
                      <DropdownMenuSub key={column}>
                        <DropdownMenuSubTrigger>
                          {column}
                          {activeSort.column === column && (
                            <Badge variant="outline" className="ml-auto">
                              {activeSort.direction === 'asc' ? 'Asc' : 'Desc'}
                            </Badge>
                          )}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => onSortChange(column, 'asc')}>
                              Ascending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortChange(column, 'desc')}>
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
