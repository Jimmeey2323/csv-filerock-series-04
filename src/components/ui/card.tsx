
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl border border-white/20 bg-gradient-to-br from-white/95 via-white/90 to-white/80 text-card-foreground shadow-2xl backdrop-blur-3xl",
      "before:absolute before:inset-0 before:rounded-3xl before:p-[1px]",
      "before:bg-gradient-to-br before:from-white/60 before:via-white/30 before:to-white/10",
      "before:mask-composite:subtract before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
      "after:absolute after:inset-0 after:rounded-3xl after:bg-gradient-to-br after:from-blue-500/3 after:via-transparent after:to-purple-500/3 after:pointer-events-none",
      "relative overflow-hidden transition-all duration-500 hover:shadow-3xl hover:-translate-y-1 hover:scale-[1.002]",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-2 p-8 relative",
      "after:absolute after:bottom-0 after:left-8 after:right-8 after:h-px",
      "after:bg-gradient-to-r after:from-transparent after:via-slate-200/60 after:to-transparent",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-none tracking-tight bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-600 font-medium", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-8 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-8 pt-0 relative",
      "before:absolute before:top-0 before:left-8 before:right-8 before:h-px",
      "before:bg-gradient-to-r before:from-transparent before:via-slate-200/60 before:to-transparent",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
