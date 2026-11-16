'use client';

import { motion, type Variants } from 'motion/react';
import type { ElementType } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export interface TextRevealProps {
  text: string;
  /** Reveal word by word or letter by letter. */
  by?: 'word' | 'letter';
  /** Element to render, e.g. "h1". */
  as?: ElementType;
  /** Seconds between pieces. */
  stagger?: number;
  delay?: number;
  /** Replay whenever it re-enters the viewport. */
  repeat?: boolean;
  className?: string;
}

export function splitText(text: string, by: 'word' | 'letter'): string[] {
  return by === 'word' ? text.split(/(\s+)/).filter(Boolean) : Array.from(text);
}

const piece: Variants = {
  hidden: { opacity: 0, y: '0.4em', filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

/** Text that blurs and rises into place one word or letter at a time. */
export function TextReveal({
  text,
  by = 'word',
  as: Tag = 'p',
  stagger = by === 'word' ? 0.06 : 0.02,
  delay = 0,
  repeat = false,
  className,
}: TextRevealProps) {
  const reduced = useReducedMotion();
  if (reduced) return <Tag className={className}>{text}</Tag>;

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        className="inline"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: !repeat, amount: 0.6 }}
        transition={{ staggerChildren: stagger, delayChildren: delay }}
      >
        {splitText(text, by).map((part, index) =>
          /^\s+$/.test(part) ? (
            <span key={index}>{part}</span>
          ) : (
            <motion.span
              key={index}
              variants={piece}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className="inline-block whitespace-pre"
            >
              {part}
            </motion.span>
          ),
        )}
      </motion.span>
    </Tag>
  );
}
