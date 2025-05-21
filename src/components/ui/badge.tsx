
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-sm",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sm",
        outline: "text-foreground shadow-sm",
        success: "border-transparent bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md",
        warning: "border-transparent bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md",
        active: "border-transparent bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-md",
        info: "border-transparent bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md",
        purple: "border-transparent bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-md",
        emerald: "border-transparent bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md",
        rose: "border-transparent bg-gradient-to-r from-rose-400 to-red-500 text-white shadow-md",
        premium: "border-transparent bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg backdrop-blur-sm",
        conversion: "border-transparent bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg px-3.5 py-1.5 rounded-md backdrop-blur-sm font-medium flex items-center gap-1.5 tracking-tight",
        retention: "border-transparent bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg px-3.5 py-1.5 rounded-md backdrop-blur-sm font-medium flex items-center gap-1.5 tracking-tight",
        excluded: "border-transparent bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg px-3.5 py-1.5 rounded-md backdrop-blur-sm font-medium flex items-center gap-1.5 tracking-tight",
        modern: "border-transparent px-3.5 py-1.5 rounded-md bg-gradient-to-br from-blue-700 to-indigo-800 text-white font-medium shadow-lg backdrop-blur-sm tracking-tight flex items-center gap-1.5",
        luxury: "border border-slate-200/30 px-3 py-1 rounded-lg bg-white/90 text-slate-800 font-medium shadow-lg backdrop-blur-sm tracking-tight flex items-center gap-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
