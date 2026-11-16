'use client';

import { cn } from '@/lib/cn';
import { forMotion } from '@/lib/props';
import { avatarVariants, type AvatarVariants } from '@/lib/recipes';
import * as avatar from '@zag-js/avatar';
import { normalizeProps, useMachine } from '@zag-js/react';
import { motion } from 'motion/react';
import { useId, type ComponentProps, type ReactNode } from 'react';

export interface AvatarProps extends Omit<ComponentProps<'span'>, 'children'>, AvatarVariants {
  src?: string;
  alt?: string;
  /** Used for the initials fallback and as the accessible name when alt is missing. */
  name?: string;
  /** Custom fallback content; defaults to initials from `name`. */
  fallback?: ReactNode;
}

export function initials(name = ''): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export function Avatar({ src, alt, name, fallback, size, className, ...props }: AvatarProps) {
  const service = useMachine(avatar.machine, { id: useId() });
  const api = avatar.connect(service, normalizeProps);
  const label = alt ?? name ?? '';

  return (
    <span
      data-slot="avatar"
      {...api.getRootProps()}
      className={cn(avatarVariants({ size }), className)}
      {...props}
    >
      <span
        {...api.getFallbackProps()}
        role={api.loaded ? undefined : 'img'}
        aria-label={api.loaded ? undefined : label || undefined}
        className="flex size-full items-center justify-center font-medium text-muted-foreground"
      >
        {fallback ?? initials(name)}
      </span>
      {src && (
        <motion.img
          {...forMotion(api.getImageProps())}
          src={src}
          alt={label}
          initial={false}
          animate={{ opacity: api.loaded ? 1 : 0, scale: api.loaded ? 1 : 1.08 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </span>
  );
}

export interface AvatarGroupProps extends ComponentProps<'div'> {
  /** Show at most this many avatars and a "+n" chip for the rest. */
  max?: number;
}

export function AvatarGroup({ className, max, children, ...props }: AvatarGroupProps) {
  const items = Array.isArray(children) ? children : [children];
  const shown = max ? items.slice(0, max) : items;
  const rest = items.length - shown.length;
  return (
    <div
      data-slot="avatar-group"
      className={cn('flex -space-x-2 *:ring-2 *:ring-background', className)}
      {...props}
    >
      {shown}
      {rest > 0 && (
        <span className="relative inline-flex size-9 items-center justify-center rounded-full bg-muted text-xs font-medium">
          +{rest}
        </span>
      )}
    </div>
  );
}
