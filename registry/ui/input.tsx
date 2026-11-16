import { cn } from '@/lib/cn';
import { inputVariants, type InputVariants } from '@/lib/recipes';
import type { ComponentProps } from 'react';

export interface InputProps extends Omit<ComponentProps<'input'>, 'size'>, InputVariants {}

export function Input({ className, size, type = 'text', ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        inputVariants({ size }),
        'file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className,
      )}
      {...props}
    />
  );
}
