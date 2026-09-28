import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-slate-200 bg-slate-900 text-white shadow-xs hover:bg-slate-800",
        secondary:
          "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200",
        destructive:
          "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
        outline:
          "border-slate-300 text-slate-700 bg-white hover:bg-slate-50",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
        warning:
          "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
        cyan:
          "border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100",
        violet:
          "border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
