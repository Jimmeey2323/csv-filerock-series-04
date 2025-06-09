
import * as React from "react"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { maxHeight?: string }
>(({ className, maxHeight = "600px", ...props }, ref) => (
  <div className={cn(
    "relative w-full overflow-hidden rounded-2xl shadow-luxury border border-white/20",
    "bg-white/70 backdrop-blur-xl",
    "before:absolute before:inset-0 before:rounded-2xl before:p-[1px]",
    "before:bg-gradient-to-br before:from-white/40 before:via-white/20 before:to-transparent",
    "before:mask-composite:subtract before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
    `max-h-[${maxHeight}]`
  )}>
    <div className="relative overflow-auto rounded-2xl bg-white/80 backdrop-blur-xl border border-white/30">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
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
      "sticky top-0 z-20",
      "bg-gradient-to-r from-slate-50/95 via-white/90 to-slate-50/95",
      "backdrop-blur-xl border-b border-white/30",
      "shadow-[0_1px_3px_rgba(0,0,0,0.05)]",
      "[&_tr]:border-b-0",
      "after:absolute after:inset-x-0 after:bottom-0 after:h-px",
      "after:bg-gradient-to-r after:from-transparent after:via-slate-200/60 after:to-transparent",
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
      "[&_tr]:transition-all [&_tr]:duration-300",
      "[&_tr:hover]:bg-gradient-to-r [&_tr:hover]:from-blue-50/30 [&_tr:hover]:via-white/50 [&_tr:hover]:to-blue-50/30",
      "[&_tr:hover]:backdrop-blur-sm [&_tr:hover]:shadow-sm",
      "[&_tr:hover]:border-blue-200/40",
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
      "sticky bottom-0 z-20",
      "bg-gradient-to-r from-primary/90 via-primary/95 to-primary/90",
      "backdrop-blur-xl text-primary-foreground font-medium",
      "shadow-[0_-2px_10px_rgba(0,0,0,0.08)]",
      "border-t border-white/20",
      "[&>tr]:last:border-b-0",
      isClickable && "cursor-pointer hover:from-primary/95 hover:to-primary/95 transition-all duration-300",
      "before:absolute before:inset-x-0 before:top-0 before:h-px",
      "before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent",
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
      "border-b border-slate-200/40 transition-all duration-300 h-12",
      "hover:border-slate-300/60",
      isClickable && cn(
        "cursor-pointer group",
        "hover:bg-gradient-to-r hover:from-blue-50/40 hover:via-white/60 hover:to-blue-50/40",
        "hover:shadow-[0_2px_8px_rgba(59,130,246,0.08)]",
        "hover:border-blue-200/50",
        "hover:-translate-y-[1px] hover:scale-[1.001]",
        "active:scale-[0.999] active:translate-y-0"
      ),
      isSubtotal && cn(
        "bg-gradient-to-r from-slate-100/70 via-white/80 to-slate-100/70",
        "font-medium backdrop-blur-sm",
        "border-slate-300/50 shadow-sm"
      ),
      isGroupHeader && cn(
        "bg-gradient-to-r from-blue-50/60 via-blue-25/40 to-blue-50/60",
        "font-semibold text-blue-900 backdrop-blur-sm",
        "border-l-4 border-l-blue-500/70 shadow-inner",
        "before:absolute before:inset-0 before:bg-gradient-to-r",
        "before:from-blue-500/5 before:to-transparent before:pointer-events-none"
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
        "h-12 px-6 py-4 text-left align-middle font-semibold text-slate-700",
        "whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        "transition-all duration-300 relative group",
        "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:to-transparent",
        "before:opacity-0 before:transition-opacity before:duration-300",
        sortable && cn(
          "cursor-pointer select-none",
          "hover:bg-gradient-to-b hover:from-slate-100/50 hover:to-white/30",
          "hover:text-slate-900 hover:before:opacity-100",
          "active:scale-[0.98] active:bg-slate-200/30"
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
              <ChevronUp className="h-4 w-4 text-blue-600 animate-fade-in drop-shadow-sm" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown className="h-4 w-4 text-blue-600 animate-fade-in drop-shadow-sm" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-slate-400/70 opacity-60 transition-all duration-300 group-hover:opacity-100 group-hover:text-slate-500" />
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
      "px-6 py-4 align-middle whitespace-nowrap overflow-hidden text-ellipsis",
      "[&:has([role=checkbox])]:pr-0",
      "transition-all duration-300 group-hover:text-slate-800",
      "relative after:absolute after:inset-0 after:bg-gradient-to-r",
      "after:from-transparent after:via-white/10 after:to-transparent",
      "after:opacity-0 after:transition-opacity after:duration-300",
      "group-hover:after:opacity-100",
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
      "mt-6 text-sm text-slate-500/80 italic",
      "bg-gradient-to-r from-slate-100/40 to-white/60",
      "backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30",
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
