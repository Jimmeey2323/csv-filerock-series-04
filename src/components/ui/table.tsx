
import * as React from "react"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { maxHeight?: string }
>(({ className, maxHeight, ...props }, ref) => (
  <div className={`relative w-full overflow-auto rounded-xl shadow-premium ${maxHeight ? `max-h-[${maxHeight}]` : ""}`}>
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm bg-white/50 backdrop-blur-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-muted/30 sticky top-0 z-10 backdrop-blur-lg shadow-subtle [&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0 [&_tr:hover]:bg-muted/20 transition-colors duration-200", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & { isClickable?: boolean }
>(({ className, isClickable = false, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "sticky bottom-0 z-10 bg-primary/90 backdrop-blur-lg text-primary-foreground font-medium [&>tr]:last:border-b-0 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]",
      isClickable && "cursor-pointer hover:bg-primary/95 transition-colors",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { 
    isClickable?: boolean; 
    isSubtotal?: boolean;
    isGroupHeader?: boolean;
  }
>(({ className, isClickable = false, isSubtotal = false, isGroupHeader = false, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-border/30 transition-all duration-300 h-[25px] whitespace-nowrap animate-fade-in",
      isClickable && "cursor-pointer hover:bg-muted/40 hover:-translate-y-[1px] hover:shadow-subtle transition-all duration-200",
      isSubtotal && "bg-muted/50 font-medium backdrop-blur-sm",
      isGroupHeader && "bg-primary/5 font-semibold text-primary border-l-2 border-l-primary/50 shadow-inner-top",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | undefined;
  onSort?: () => void;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, sortable = false, sortDirection, onSort, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-10 px-3 text-left align-middle font-medium text-muted-foreground whitespace-nowrap [&:has([role=checkbox])]:pr-0 transition-all duration-300",
        sortable && "cursor-pointer hover:bg-muted/50 select-none hover:text-foreground transition-colors duration-200",
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortable && (
          <div className="flex items-center">
            {sortDirection === 'asc' ? (
              <ChevronUp className="h-4 w-4 text-primary animate-fade-in" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown className="h-4 w-4 text-primary animate-fade-in" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground/40 transition-opacity duration-200 hover:opacity-100" />
            )}
          </div>
        )}
      </div>
    </th>
  )
);
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-3 py-2.5 align-middle whitespace-nowrap overflow-hidden text-ellipsis [&:has([role=checkbox])]:pr-0 transition-all duration-300", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground italic", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
