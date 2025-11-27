import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20',
        secondary: 'border border-slate-700 bg-slate-900/60 text-slate-50 hover:border-emerald-400 hover:bg-slate-800/80 active:scale-[0.98]',
        outline: 'border-2 border-emerald-500/50 bg-transparent text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400',
        ghost: 'hover:bg-slate-800/80 text-slate-300 hover:text-slate-50',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

