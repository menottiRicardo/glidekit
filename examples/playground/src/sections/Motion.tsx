import { AnimatedNumber } from '@/components/ui/animated-number';
import { Button } from '@/components/ui/button';
import { TextReveal } from '@/components/ui/text-reveal';
import { useState } from 'react';
import { Demo, Section } from '../Section';

const currency = { style: 'currency', currency: 'USD' } as const;
const percent = { style: 'percent', maximumFractionDigits: 1 } as const;

export function MotionSection() {
  const [revenue, setRevenue] = useState(12840);
  const [key, setKey] = useState(0);

  return (
    <Section id="motion" title="Motion" description="Animated extras built on the same presets.">
      <Demo title="Animated number">
        <div className="grid gap-1">
          <span className="text-sm text-muted-foreground">Revenue</span>
          <AnimatedNumber value={revenue} format={currency} className="text-3xl font-semibold" />
        </div>
        <div className="grid gap-1">
          <span className="text-sm text-muted-foreground">Growth</span>
          <AnimatedNumber
            value={revenue / 100000}
            format={percent}
            className="text-3xl font-semibold"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setRevenue(Math.round(Math.random() * 90000) + 1000)}
        >
          Randomize
        </Button>
        <Button variant="ghost" onClick={() => setRevenue((value) => -value)}>
          Flip sign
        </Button>
      </Demo>
      <Demo title="Text reveal">
        <div className="grid gap-3">
          <TextReveal
            key={`w${key}`}
            text="Word by word, softly into focus."
            className="text-2xl font-medium"
          />
          <TextReveal
            key={`l${key}`}
            by="letter"
            text="Letter by letter."
            className="text-xl text-muted-foreground"
          />
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => setKey((value) => value + 1)}
          >
            Replay
          </Button>
        </div>
      </Demo>
    </Section>
  );
}
