import type { ReactNode } from 'react';

export interface SectionProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function Section({ id, title, description, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="grid min-w-0 gap-5 border-b py-12 last:border-0"
    >
      <header className="grid gap-1">
        <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>
      {children}
    </section>
  );
}

export function Demo({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid min-w-0 gap-3 rounded-xl border bg-card p-5">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</h3>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}
