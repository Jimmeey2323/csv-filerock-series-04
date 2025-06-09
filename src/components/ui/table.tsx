
import * as React from "react"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { maxHeight?: string }
>(({ className, maxHeight = "600px", ...props }, ref) => (
  <div className={cn(
    "relative w-full overflow-hidden rounded-3xl shadow-2xl border border-white/10",
    "bg-gradient-to-br from-white/95 via-white/90 to-white/80 backdrop-blur-3xl",
    "before:absolute before:inset-0 before:rounded-3xl before:p-[1px]",
    "before:bg-gradient-to-br before:from-white/60 before:via-white/30 before:to-white/10",
    "before:mask-composite:subtract before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
    "after:absolute after:inset-0 after:rounded-3xl after:bg-gradient-to-br after:from-blue-500/5 after:via-transparent after:to-purple-500/5 after:pointer-events-none",
    `max-h-[${maxHeight}]`
  )}>
    <div className="relative overflow-auto rounded-3xl bg-white/30 backdrop-blur-3xl border border-white/20">
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
      "sticky top-0 z-30",
      "bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95",
      "backdrop-blur-3xl border-b border-white/10",
      "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
      "[&_tr]:border-b-0",
      "after:absolute after:inset-x-0 after:bottom-0 after:h-px",
      "after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent",
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
      "[&_tr:hover]:bg-gradient-to-r [&_tr:hover]:from-blue-50/60 [&_tr:hover]:via-white/80 [&_tr:hover]:to-indigo-50/60",
      "[&_tr:hover]:backdrop-blur-xl [&_tr:hover]:shadow-lg [&_tr:hover]:shadow-blue-500/10",
      "[&_tr:hover]:border-blue-200/30 [&_tr:hover]:scale-[1.001] [&_tr:hover]:-translate-y-px",
      "[&_tr:hover]:before:absolute [&_tr:hover]:before:inset-0 [&_tr:hover]:before:bg-gradient-to-r [&_tr:hover]:before:from-blue-500/5 [&_tr:hover]:before:to-purple-500/5 [&_tr:hover]:before:pointer-events-none",
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
      "bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95",
      "backdrop-blur-3xl text-white font-semibold",
      "shadow-[0_-8px_32px_rgba(0,0,0,0.12)]",
      "border-t border-white/10",
      "[&>tr]:last:border-b-0",
      isClickable && "cursor-pointer hover:from-slate-800/95 hover:to-slate-700/95 transition-all duration-500",
      "before:absolute before:inset-x-0 before:top-0 before:h-px",
      "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
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
      "border-b border-slate-200/20 transition-all duration-500 h-16 relative group",
      "hover:border-slate-300/30",
      isClickable && cn(
        "cursor-pointer",
        "hover:bg-gradient-to-r hover:from-blue-50/40 hover:via-white/70 hover:to-indigo-50/40",
        "hover:shadow-[0_8px_32px_rgba(59,130,246,0.08)]",
        "hover:border-blue-200/40",
        "hover:-translate-y-0.5 hover:scale-[1.002]",
        "active:scale-[0.998] active:translate-y-0",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500/3 before:to-purple-500/3 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100"
      ),
      isSubtotal && cn(
        "bg-gradient-to-r from-slate-50/90 via-white/95 to-slate-50/90",
        "font-semibold backdrop-blur-xl border-slate-300/30 shadow-md shadow-slate-500/5",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-slate-500/5 before:to-transparent"
      ),
      isGroupHeader && cn(
        "bg-gradient-to-r from-indigo-50/80 via-blue-25/60 to-indigo-50/80",
        "font-bold text-indigo-900 backdrop-blur-xl border-l-4 border-l-indigo-500/80 shadow-inner",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-indigo-500/8 before:to-transparent"
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
        "h-16 px-8 py-6 text-left align-middle font-bold text-white/95 tracking-wide",
        "whitespace-nowrap [&:has([role=checkbox])]:pr-0 text-sm uppercase letter-spacing-wider",
        "transition-all duration-500 relative group",
        "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent",
        "before:opacity-0 before:transition-opacity before:duration-500",
        sortable && cn(
          "cursor-pointer select-none",
          "hover:bg-gradient-to-b hover:from-white/20 hover:to-white/5",
          "hover:text-white hover:before:opacity-100",
          "active:scale-[0.98] active:bg-white/10"
        ),
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-3 relative z-10">
        {children}
        {sortable && (
          <div className="flex items-center transition-all duration-500">
            {sortDirection === 'asc' ? (
              <ChevronUp className="h-4 w-4 text-blue-400 animate-fade-in drop-shadow-lg" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown className="h-4 w-4 text-blue-400 animate-fade-in drop-shadow-lg" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-white/50 opacity-60 transition-all duration-500 group-hover:opacity-100 group-hover:text-white/80" />
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
      "px-8 py-6 align-middle whitespace-nowrap overflow-hidden text-ellipsis",
      "[&:has([role=checkbox])]:pr-0 font-medium text-slate-700",
      "transition-all duration-500 group-hover:text-slate-900",
      "relative after:absolute after:inset-0 after:bg-gradient-to-r",
      "after:from-transparent after:via-white/20 after:to-transparent",
      "after:opacity-0 after:transition-opacity after:duration-500",
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
      "mt-8 text-sm text-slate-500/80 italic font-medium",
      "bg-gradient-to-r from-slate-50/60 to-white/80 backdrop-blur-xl",
      "rounded-2xl px-6 py-4 border border-white/30 shadow-lg",
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
