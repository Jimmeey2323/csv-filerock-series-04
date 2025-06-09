
import * as React from "react"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { maxHeight?: string }
>(({ className, maxHeight = "600px", ...props }, ref) => (
  <div className={cn(
    "relative w-full overflow-hidden rounded-2xl shadow-luxury border border-white/20",
    "bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-blur-xl"
  )}>
    <div className={cn(
      "relative overflow-auto rounded-2xl bg-white/20 backdrop-blur-sm border border-white/10",
      `max-h-[${maxHeight}]`
    )}>
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm table-fixed", className)}
        {...props}
      />
    </div>
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn(
      "sticky top-0 z-30",
      "bg-gradient-to-r from-slate-900/98 via-slate-800/98 to-slate-900/98",
      "backdrop-blur-xl border-b border-white/30",
      "shadow-lg",
      "[&_tr]:border-b-0",
      className
    )} 
    {...props} 
  />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr:last-child]:border-0",
      "[&_tr]:transition-all [&_tr]:duration-300 [&_tr]:ease-out",
      "[&_tr:hover]:bg-gradient-to-r [&_tr:hover]:from-blue-50/60 [&_tr:hover]:to-blue-100/40",
      "[&_tr:hover]:backdrop-blur-sm [&_tr:hover]:shadow-md [&_tr:hover]:border-blue-200/50",
      "[&_tr:hover]:scale-[1.002]",
      className
    )}
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
      "sticky bottom-0 z-30",
      "bg-gradient-to-r from-slate-900/98 via-slate-800/98 to-slate-900/98",
      "backdrop-blur-xl text-white font-bold shadow-lg border-t border-white/30",
      "[&>tr]:last:border-b-0",
      isClickable && "cursor-pointer hover:from-slate-800/98 hover:to-slate-700/98 transition-all duration-300",
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
      "border-b border-slate-200/20 transition-all duration-300 h-14 relative group",
      "hover:border-slate-300/40",
      isClickable && cn(
        "cursor-pointer",
        "hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-blue-100/30",
        "hover:backdrop-blur-sm hover:shadow-md hover:border-blue-200/50",
        "active:scale-[0.998]"
      ),
      isSubtotal && cn(
        "bg-gradient-to-r from-slate-100/80 via-slate-50/80 to-slate-100/80",
        "backdrop-blur-md font-bold border-slate-300/60 shadow-md",
        "text-slate-800"
      ),
      isGroupHeader && cn(
        "bg-gradient-to-r from-blue-100/90 via-blue-50/80 to-blue-100/90",
        "backdrop-blur-md font-bold text-blue-900 border-l-4 border-l-blue-600/80",
        "shadow-lg border-b-2 border-b-blue-200/60"
      ),
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
        "h-16 px-6 py-4 text-left align-middle font-bold text-white/98 tracking-wide",
        "whitespace-nowrap [&:has([role=checkbox])]:pr-0 text-sm uppercase",
        "transition-all duration-300 relative group border-r border-white/10 last:border-r-0",
        sortable && cn(
          "cursor-pointer select-none",
          "hover:bg-white/10 hover:text-white hover:shadow-lg",
          "active:scale-[0.98]"
        ),
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-2 relative z-10">
        {children}
        {sortable && (
          <div className="flex items-center transition-all duration-300">
            {sortDirection === 'asc' ? (
              <ChevronUp className="h-4 w-4 text-blue-300" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown className="h-4 w-4 text-blue-300" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-white/50 group-hover:text-white/80" />
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
    className={cn(
      "px-6 py-4 align-middle overflow-hidden text-ellipsis",
      "[&:has([role=checkbox])]:pr-0 font-medium text-slate-800",
      "transition-all duration-300 group-hover:text-slate-900",
      "border-r border-slate-200/10 last:border-r-0",
      className
    )}
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
    className={cn(
      "mt-6 text-sm text-slate-600 italic font-medium",
      "bg-white/60 backdrop-blur-md rounded-xl px-6 py-4 border border-white/40 shadow-lg",
      className
    )}
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
