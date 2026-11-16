import { cn } from '@/lib/cn';
import { fieldBase } from '@/lib/recipes';
import type { ComponentProps } from 'react';

export interface TextareaProps extends ComponentProps<'textarea'> {
  /** Grow with the content instead of scrolling (uses CSS field-sizing). */
  autoGrow?: boolean;
}

export function Textarea({ className, autoGrow = true, rows = 3, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      rows={rows}
      className={cn(
        fieldBase,
        'min-h-16 py-2',
        autoGrow && 'max-h-80 [field-sizing:content]',
        className,
      )}
      {...props}
    />
  );
}
