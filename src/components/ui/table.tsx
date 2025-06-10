
import * as React from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement> & {
  maxHeight?: string;
}>(({
  className,
  maxHeight = "600px",
  ...props
}, ref) => (
  <div className={cn(
    "relative w-full overflow-hidden rounded-2xl shadow-xl border border-white/10",
    "bg-white/70 backdrop-blur-md",
    "before:absolute before:inset-0 before:rounded-2xl before:p-[1px]",
    "before:bg-gradient-to-br before:from-slate-200/30 before:via-white/20 before:to-slate-200/30",
    "before:mask-composite:subtract before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]"
  )} style={{ maxHeight }}>
    <div className="relative flex flex-col h-full">
      <div className="flex-1 overflow-auto rounded-t-2xl bg-white/30 backdrop-blur-sm border border-white/10">
        <table ref={ref} className={cn("w-full caption-bottom text-sm min-w-max", className)} {...props} />
      </div>
    </div>
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({
  className,
  ...props
}, ref) => (
  <thead ref={ref} className={cn(
    "sticky top-0 z-30",
    "bg-gradient-to-r from-slate-800/95 via-slate-700/95 to-slate-800/95",
    "backdrop-blur-sm border-b border-white/20",
    "shadow-sm",
    "[&_tr]:border-b-0",
    className
  )} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({
  className,
  ...props
}, ref) => (
  <tbody ref={ref} className={cn(
    "[&_tr:last-child]:border-0",
    "[&_tr]:transition-all [&_tr]:duration-300 [&_tr]:ease-out",
    "[&_tr:hover]:bg-blue-50/40 [&_tr:hover]:backdrop-blur-sm",
    "[&_tr:hover]:shadow-sm [&_tr:hover]:border-blue-200/30",
    className
  )} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement> & {
  isClickable?: boolean;
}>(({
  className,
  isClickable = false,
  ...props
}, ref) => (
  <tfoot ref={ref} className={cn(
    "sticky bottom-0 z-30",
    "bg-gradient-to-r from-slate-800/95 via-slate-700/95 to-slate-800/95",
    "backdrop-blur-sm text-white font-semibold",
    "shadow-sm border-t border-white/20",
    "[&>tr]:last:border-b-0",
    isClickable && "cursor-pointer hover:from-slate-700/95 hover:to-slate-600/95 transition-all duration-300",
    className
  )} {...props} />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement> & {
  isClickable?: boolean;
  isSubtotal?: boolean;
  isGroupHeader?: boolean;
}>(({
  className,
  isClickable = false,
  isSubtotal = false,
  isGroupHeader = false,
  ...props
}, ref) => (
  <tr ref={ref} className={cn(
    "border-b border-slate-200/30 transition-all duration-300 h-14 relative group",
    "hover:border-slate-300/40",
    isClickable && cn(
      "cursor-pointer",
      "hover:bg-blue-50/30 hover:backdrop-blur-sm",
      "hover:shadow-sm hover:border-blue-200/40",
      "active:scale-[0.999]"
    ),
    isSubtotal && cn(
      "bg-slate-50/50 backdrop-blur-sm",
      "font-semibold border-slate-300/40 shadow-sm"
    ),
    isGroupHeader && cn(
      "bg-blue-50/40 backdrop-blur-sm",
      "font-bold text-blue-900 border-l-4 border-l-blue-500/60"
    ),
    className
  )} {...props} />
));
TableRow.displayName = "TableRow";

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | undefined;
  onSort?: () => void;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(({
  className,
  children,
  sortable = false,
  sortDirection,
  onSort,
  ...props
}, ref) => (
  <th ref={ref} className={cn(
    "h-14 px-6 py-4 text-left align-middle font-bold text-white/95 tracking-wide",
    "whitespace-nowrap [&:has([role=checkbox])]:pr-0 text-sm uppercase",
    "transition-all duration-300 relative group",
    sortable && cn(
      "cursor-pointer select-none",
      "hover:bg-white/10 hover:text-white",
      "active:scale-[0.98]"
    ),
    className
  )} onClick={sortable ? onSort : undefined} {...props}>
    <div className="flex items-center justify-between">
      {children}
      {sortable && (
        <div className="flex items-center transition-all duration-300">
          {sortDirection === 'asc' ? (
            <ChevronUp className="h-4 w-4 text-blue-300" />
          ) : sortDirection === 'desc' ? (
            <ChevronDown className="h-4 w-4 text-blue-300" />
          ) : (
            <ChevronsUpDown className="h-4 w-4 text-white/40 group-hover:text-white/70" />
          )}
        </div>
      )}
    </div>
  </th>
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({
  className,
  ...props
}, ref) => (
  <td ref={ref} className={cn(
    "px-6 py-4 align-middle whitespace-nowrap overflow-hidden text-ellipsis",
    "[&:has([role=checkbox])]:pr-0 font-medium text-slate-800",
    "transition-all duration-300 group-hover:text-slate-900",
    className
  )} {...props} />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(({
  className,
  ...props
}, ref) => (
  <caption ref={ref} className={cn(
    "mt-6 text-sm text-slate-600 italic font-medium",
    "bg-white/50 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/30 shadow-sm",
    className
  )} {...props} />
));
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
