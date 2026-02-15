import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-white",
  {
    variants: {
      variant: {
        default: "bg-brand-500 text-white hover:bg-brand-600",
        outline:
          "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
        ghost: "text-slate-900 hover:bg-slate-100",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-base",
        lg: "h-10 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

export { Button, buttonVariants };
