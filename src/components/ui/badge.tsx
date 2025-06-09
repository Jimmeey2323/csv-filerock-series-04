
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-xl border font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-sm px-3 py-1.5 text-xs",
        secondary: "border-transparent bg-secondary text-secondary-foreground shadow-sm px-3 py-1.5 text-xs",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow-sm px-3 py-1.5 text-xs",
        outline: "text-foreground shadow-sm px-3 py-1.5 text-xs",
        success: "border-transparent bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm",
        warning: "border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm",
        active: "border-transparent bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm",
        info: "border-transparent bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm",
        purple: "border-transparent bg-gradient-to-r from-purple-500 to-violet-600 text-white px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm",
        emerald: "border-transparent bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm",
        rose: "border-transparent bg-gradient-to-r from-rose-500 to-red-600 text-white px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm",
        premium: "border-transparent bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg backdrop-blur-sm px-4 py-2 text-xs font-bold",
        conversion: "border border-blue-200/50 bg-gradient-to-r from-blue-50/90 to-blue-100/90 text-blue-800 px-4 py-2 text-xs font-bold shadow-md backdrop-blur-sm",
        retention: "border border-green-200/50 bg-gradient-to-r from-green-50/90 to-emerald-100/90 text-green-800 px-4 py-2 text-xs font-bold shadow-md backdrop-blur-sm",
        excluded: "border border-rose-200/50 bg-gradient-to-r from-rose-50/90 to-red-100/90 text-rose-800 px-4 py-2 text-xs font-bold shadow-md backdrop-blur-sm",
        modern: "border border-slate-200/50 px-4 py-2 text-xs rounded-xl bg-white/90 text-slate-800 font-bold shadow-md backdrop-blur-sm",
        luxury: "border border-slate-200/30 px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-white/95 to-slate-50/95 text-slate-800 font-bold shadow-lg backdrop-blur-xl",
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
