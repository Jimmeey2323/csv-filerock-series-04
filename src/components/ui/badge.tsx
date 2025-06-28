
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-xl border font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-sm px-3 py-1.5 text-xs min-w-[80px] h-7",
        secondary: "border-transparent bg-secondary text-secondary-foreground shadow-sm px-3 py-1.5 text-xs min-w-[80px] h-7",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow-sm px-3 py-1.5 text-xs min-w-[80px] h-7",
        outline: "text-foreground shadow-sm px-3 py-1.5 text-xs min-w-[80px] h-7",
        success: "border-transparent bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm min-w-[100px] h-8",
        warning: "border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm min-w-[100px] h-8",
        active: "border-transparent bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm min-w-[100px] h-8",
        info: "border-transparent bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm min-w-[100px] h-8",
        purple: "border-transparent bg-gradient-to-r from-purple-500 to-violet-600 text-white px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm min-w-[100px] h-8",
        emerald: "border-transparent bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm min-w-[100px] h-8",
        rose: "border-transparent bg-gradient-to-r from-rose-500 to-red-600 text-white px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm min-w-[100px] h-8",
        premium: "border-transparent bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg backdrop-blur-sm px-4 py-2 text-xs font-bold min-w-[100px] h-8",
        conversion: "border-transparent bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700 text-white px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm min-w-[100px] h-8 flex items-center gap-1.5",
        retention: "border-transparent bg-gradient-to-r from-emerald-500 via-green-600 to-teal-700 text-white px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm min-w-[100px] h-8 flex items-center gap-1.5",
        excluded: "border-transparent bg-gradient-to-r from-rose-500 via-red-600 to-red-700 text-white px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm min-w-[100px] h-8 flex items-center gap-1.5",
        modern: "border border-slate-200/50 px-4 py-2 text-xs rounded-xl bg-white/90 text-slate-800 font-bold shadow-md backdrop-blur-sm min-w-[100px] h-8",
        luxury: "border border-slate-200/30 px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-white/95 to-slate-50/95 text-slate-800 font-bold shadow-lg backdrop-blur-xl min-w-[100px] h-8",
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
