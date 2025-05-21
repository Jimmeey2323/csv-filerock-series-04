
import * as React from "react"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { maxHeight?: string }
>(({ className, maxHeight, ...props }, ref) => (
  <div className={`relative w-full overflow-auto ${maxHeight ? `max-h-[${maxHeight}]` : ""}`}>
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-muted/50 sticky top-0 z-10 [&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
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
      "sticky bottom-0 z-10 bg-primary text-primary-foreground font-medium [&>tr]:last:border-b-0",
      isClickable && "cursor-pointer hover:bg-primary-dark transition-colors",
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
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted h-[25px] whitespace-nowrap",
      isClickable && "cursor-pointer hover:bg-muted/80",
      isSubtotal && "bg-muted/70 font-medium",
      isGroupHeader && "bg-primary/10 font-semibold text-primary",
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
        "h-10 px-2 text-left align-middle font-medium text-muted-foreground whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        sortable && "cursor-pointer hover:bg-muted/70 select-none",
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
              <ChevronUp className="h-4 w-4 text-primary" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown className="h-4 w-4 text-primary" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
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
    className={cn("px-2 align-middle whitespace-nowrap overflow-hidden text-ellipsis [&:has([role=checkbox])]:pr-0", className)}
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
    className={cn("mt-4 text-sm text-muted-foreground", className)}
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
