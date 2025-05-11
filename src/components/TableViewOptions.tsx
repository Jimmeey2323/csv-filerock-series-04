
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
  Filter,
  User,
  Store,
  MapPin,
  Eye,
  ArrowUp,
  ArrowDown,
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

  // Format column names for display
  const formatColumnName = (column: string) => {
    return column
      .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={activeView} onValueChange={onViewChange} className="w-auto">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground overflow-x-auto">
            {views.map(view => (
              <TabsTrigger 
                key={view.id} 
                value={view.id} 
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <view.icon className="h-4 w-4 mr-2" />
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
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Table Configuration</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Group By</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={activeGroupBy} onValueChange={onGroupByChange}>
                      <DropdownMenuRadioItem value="teacher" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Teacher
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="studio" className="cursor-pointer">
                        <Store className="mr-2 h-4 w-4" />
                        Studio
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="location" className="cursor-pointer">
                        <MapPin className="mr-2 h-4 w-4" />
                        Location
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="period" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        Period
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
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
                        className="cursor-pointer"
                      >
                        {formatColumnName(column)}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  {activeSort.direction === 'asc' ? (
                    <ArrowUp className="mr-2 h-4 w-4" />
                  ) : (
                    <ArrowDown className="mr-2 h-4 w-4" />
                  )}
                  <span>Sort By</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {availableColumns.map(column => (
                      <DropdownMenuItem 
                        key={column}
                        className="cursor-pointer flex items-center justify-between"
                        onClick={() => onSortChange(
                          column, 
                          activeSort.column === column && activeSort.direction === 'desc' ? 'asc' : 'desc'
                        )}
                      >
                        {formatColumnName(column)}
                        {activeSort.column === column && (
                          <Badge variant="outline" className="ml-auto">
                            {activeSort.direction === 'asc' ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )}
                          </Badge>
                        )}
                      </DropdownMenuItem>
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
