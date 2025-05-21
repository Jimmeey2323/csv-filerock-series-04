
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
        success: "border-transparent bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm",
        warning: "border-transparent bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-sm",
        active: "border-transparent bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-sm",
        info: "border-transparent bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-sm",
        purple: "border-transparent bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-sm",
        emerald: "border-transparent bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-sm",
        rose: "border-transparent bg-gradient-to-r from-rose-400 to-red-500 text-white shadow-sm",
        premium: "border-transparent bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md",
        conversion: "border-transparent bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md backdrop-blur-sm px-3 py-1 rounded-lg",
        retention: "border-transparent bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md backdrop-blur-sm px-3 py-1 rounded-lg",
        excluded: "border-transparent bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md backdrop-blur-sm px-3 py-1 rounded-lg",
        modern: "border-transparent px-3 py-1 rounded-lg bg-gradient-to-r from-blue-700 to-indigo-600 text-white text-xs shadow-lg backdrop-blur-sm",
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
