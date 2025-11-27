import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-emerald-500 text-slate-950',
        secondary: 'border-slate-700 bg-slate-800 text-slate-300',
        outline: 'border-emerald-500/50 text-emerald-400',
        success: 'border-transparent bg-green-500/20 text-green-400',
        warning: 'border-transparent bg-yellow-500/20 text-yellow-400',
      },
    },
    defaultVariants: {
      variant: 'default',
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

