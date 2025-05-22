
import * as React from "react"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { maxHeight?: string }
>(({ className, maxHeight, ...props }, ref) => (
  <div className={`relative w-full overflow-auto rounded-xl shadow-md ${maxHeight ? `max-h-[${maxHeight}]` : ""}`}>
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm bg-white/90 backdrop-blur-sm border border-slate-200", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-slate-50/90 sticky top-0 z-10 backdrop-blur-lg shadow-sm [&_tr]:border-b border-slate-200", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0 [&_tr:hover]:bg-slate-50/80 transition-colors duration-200", className)}
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
      "border-b border-slate-200 transition-all duration-300 h-10 whitespace-nowrap animate-fade-in",
      isClickable && "cursor-pointer hover:bg-slate-100 hover:-translate-y-[1px] hover:shadow-sm transition-all duration-200",
      isSubtotal && "bg-slate-100/70 font-medium",
      isGroupHeader && "bg-blue-50/50 font-semibold text-blue-800 border-l-2 border-l-blue-500 shadow-inner",
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
        "h-10 px-4 py-3 text-left align-middle font-medium text-slate-700 whitespace-nowrap [&:has([role=checkbox])]:pr-0 transition-all duration-300",
        sortable && "cursor-pointer hover:bg-slate-200/50 select-none hover:text-slate-900 transition-colors duration-200",
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
              <ChevronUp className="h-4 w-4 text-blue-600 animate-fade-in" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown className="h-4 w-4 text-blue-600 animate-fade-in" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-slate-400 opacity-60 transition-opacity duration-200 hover:opacity-100" />
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
    className={cn("px-4 py-3 align-middle whitespace-nowrap overflow-hidden text-ellipsis [&:has([role=checkbox])]:pr-0 transition-all duration-300", className)}
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
    className={cn("mt-4 text-sm text-slate-500 italic", className)}
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
