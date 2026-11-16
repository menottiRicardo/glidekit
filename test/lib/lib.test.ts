import { cn } from '@/lib/cn';
import { collapse, fade, popIn, reduce, scaleIn, slideFrom, stagger } from '@/lib/motion';
import { forMotion } from '@/lib/props';
import { badgeVariants, buttonVariants, inputVariants } from '@/lib/recipes';

describe('cn', () => {
  it('joins conditionally and lets later utilities win', () => {
    const hidden = false;
    expect(cn('px-2 py-1', hidden && 'hidden', 'px-4')).toBe('py-1 px-4');
    expect(cn('text-sm', { 'font-bold': true, italic: false })).toBe('text-sm font-bold');
  });
});

describe('motion presets', () => {
  it('slides panels from the requested edge', () => {
    expect(slideFrom('bottom').initial).toEqual({ y: '100%' });
    expect(slideFrom('top').initial).toEqual({ y: '-100%' });
    expect(slideFrom('left').initial).toEqual({ x: '-100%' });
    expect(slideFrom('right').animate).toEqual({ x: 0 });
  });

  it('reduces presets to opacity only', () => {
    for (const preset of [fade, scaleIn, popIn, slideFrom('right'), collapse]) {
      const reduced = reduce(preset);
      for (const target of [reduced.initial, reduced.animate, reduced.exit]) {
        expect(Object.keys(target).every((key) => key === 'opacity')).toBe(true);
      }
    }
    expect(reduce(scaleIn).animate).toEqual({ opacity: 1 });
    expect(reduce(slideFrom('left')).animate).toEqual({});
  });

  it('computes stagger delays', () => {
    expect(stagger(0)).toBe(0);
    expect(stagger(4, 0.05, 0.1)).toBeCloseTo(0.3);
  });
});

describe('forMotion', () => {
  it('drops handlers that clash with motion and keeps the rest', () => {
    const onClick = () => {};
    const result = forMotion({ id: 'x', onClick, onDragStart: () => {}, onAnimationEnd: () => {} });
    expect(result).toEqual({ id: 'x', onClick });
  });
});

describe('recipes', () => {
  it('builds variant classes with defaults', () => {
    expect(buttonVariants()).toContain('bg-primary');
    expect(buttonVariants({ variant: 'outline', size: 'icon' })).toContain('size-9');
    expect(badgeVariants({ variant: 'destructive' })).toContain('text-destructive');
    expect(inputVariants({ size: 'lg' })).toContain('h-10');
  });
});
