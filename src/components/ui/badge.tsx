import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-brand-50 text-brand-700 border-brand-200",
        secondary:
          "bg-black/5 text-[#05050a] border-black/10 hover:bg-black/10",
        destructive:
          "bg-red-50 text-red-700 border-red-200",
        danger:
          "bg-red-50 text-red-700 border-red-200",
        success:
          "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning:
          "bg-amber-50 text-amber-700 border-amber-200",
        info:
          "bg-sky-50 text-sky-700 border-sky-200",
        outline: "bg-transparent text-gray-600 border-gray-300",
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
