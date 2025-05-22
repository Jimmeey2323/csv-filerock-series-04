
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
        success: "border-transparent bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 shadow-sm",
        warning: "border-transparent bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-1 shadow-sm",
        active: "border-transparent bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 shadow-sm",
        info: "border-transparent bg-gradient-to-r from-sky-400 to-blue-500 text-white px-3 py-1 shadow-sm",
        purple: "border-transparent bg-gradient-to-r from-purple-500 to-violet-500 text-white px-3 py-1 shadow-sm",
        emerald: "border-transparent bg-gradient-to-r from-emerald-400 to-green-500 text-white px-3 py-1 shadow-sm",
        rose: "border-transparent bg-gradient-to-r from-rose-400 to-red-500 text-white px-3 py-1 shadow-sm",
        premium: "border-transparent bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-sm backdrop-blur-sm",
        conversion: "border-transparent bg-blue-100 text-blue-700 px-2 py-1 shadow-sm rounded-md",
        retention: "border-transparent bg-green-100 text-green-700 px-2 py-1 shadow-sm rounded-md",
        excluded: "border-transparent bg-rose-100 text-rose-700 px-2 py-1 shadow-sm rounded-md",
        modern: "border-transparent px-2.5 py-1 rounded-md bg-white text-slate-700 font-medium shadow-sm border border-slate-200",
        luxury: "border border-slate-200 px-2.5 py-1 rounded-md bg-white/90 text-slate-800 font-medium shadow-sm backdrop-blur-sm",
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
