
import * as React from "react"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { maxHeight?: string; showTotals?: boolean }
>(({ className, maxHeight = "70vh", showTotals = true, ...props }, ref) => (
  <div className={cn(
    "relative w-full overflow-hidden rounded-3xl shadow-2xl border border-white/20",
    "bg-gradient-to-br from-white/80 via-white/70 to-blue-50/40 backdrop-blur-xl",
    "before:absolute before:inset-0 before:rounded-3xl before:p-[1px]",
    "before:bg-gradient-to-br before:from-blue-200/40 before:via-white/30 before:to-indigo-200/40",
    "before:mask-composite:subtract before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
    "transition-all duration-500 hover:shadow-3xl group"
  )}>
    <ScrollArea className={cn("relative rounded-3xl bg-white/20 backdrop-blur-sm border border-white/10", `max-h-[${maxHeight}]`)}>
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </ScrollArea>
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
      "sticky top-0 z-40",
      "bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95",
      "backdrop-blur-xl border-b border-white/30",
      "shadow-xl",
      "[&_tr]:border-b-0",
      "after:absolute after:inset-0 after:bg-gradient-to-r after:from-blue-600/5 after:to-indigo-600/5",
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
      "[&_tr]:transition-all [&_tr]:duration-500 [&_tr]:ease-out",
      "[&_tr:hover]:bg-gradient-to-r [&_tr:hover]:from-blue-50/60 [&_tr:hover]:to-indigo-50/40",
      "[&_tr:hover]:backdrop-blur-sm [&_tr:hover]:shadow-lg [&_tr:hover]:border-blue-200/40",
      "[&_tr:hover]:scale-[1.001] [&_tr:hover]:z-10",
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
      "sticky bottom-0 z-40",
      "bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95",
      "backdrop-blur-xl text-white font-bold shadow-2xl border-t border-white/30",
      "[&>tr]:last:border-b-0",
      "after:absolute after:inset-0 after:bg-gradient-to-r after:from-blue-600/10 after:to-indigo-600/10",
      isClickable && "cursor-pointer hover:from-slate-800/95 hover:to-slate-700/95 transition-all duration-500",
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
    isTotalsRow?: boolean;
  }
>(({ className, isClickable = false, isSubtotal = false, isGroupHeader = false, isTotalsRow = false, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-slate-200/40 transition-all duration-500 h-16 relative group",
      "hover:border-slate-300/50",
      isClickable && cn(
        "cursor-pointer",
        "hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-indigo-50/30",
        "hover:backdrop-blur-sm hover:shadow-md hover:border-blue-200/50",
        "active:scale-[0.999] transform-gpu"
      ),
      isSubtotal && cn(
        "bg-gradient-to-r from-slate-50/70 to-blue-50/50 backdrop-blur-sm",
        "font-bold border-slate-300/50 shadow-md"
      ),
      isGroupHeader && cn(
        "bg-gradient-to-r from-blue-50/60 to-indigo-50/40 backdrop-blur-sm",
        "font-bold text-blue-900 border-l-4 border-l-blue-500/70 shadow-sm"
      ),
      isTotalsRow && cn(
        "bg-gradient-to-r from-slate-800/95 to-slate-900/95 text-white font-bold",
        "border-t-2 border-white/20 shadow-xl backdrop-blur-xl",
        "sticky bottom-0 z-30"
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
        "h-16 px-6 py-4 text-left align-middle font-bold text-white/95 tracking-wide",
        "whitespace-nowrap [&:has([role=checkbox])]:pr-0 text-sm uppercase",
        "transition-all duration-500 relative group backdrop-blur-sm",
        sortable && cn(
          "cursor-pointer select-none",
          "hover:bg-white/15 hover:text-white hover:shadow-lg",
          "active:scale-[0.98] transform-gpu"
        ),
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-3 relative z-10">
        {children}
        {sortable && (
          <div className="flex items-center transition-all duration-500 transform group-hover:scale-110">
            {sortDirection === 'asc' ? (
              <ChevronUp className="h-4 w-4 text-blue-300 drop-shadow-sm" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown className="h-4 w-4 text-blue-300 drop-shadow-sm" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-white/50 group-hover:text-white/80 transition-colors duration-300" />
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
  React.TdHTMLAttributes<HTMLTableCellElement> & { isTotalsCell?: boolean }
>(({ className, isTotalsCell = false, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-6 py-4 align-middle whitespace-nowrap overflow-hidden text-ellipsis",
      "[&:has([role=checkbox])]:pr-0 font-medium text-slate-800",
      "transition-all duration-500 group-hover:text-slate-900",
      "group-hover:transform group-hover:translate-y-[-1px]",
      isTotalsCell && "text-white font-bold text-base",
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
      "mt-8 text-sm text-slate-600 italic font-medium",
      "bg-gradient-to-r from-white/70 to-blue-50/50 backdrop-blur-xl rounded-2xl",
      "px-8 py-6 border border-white/30 shadow-xl",
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
