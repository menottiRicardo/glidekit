import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { Switch } from '@/components/ui/switch';
import { TextReveal } from '@/components/ui/text-reveal';
import { Toaster } from '@/components/ui/toast';
import { Tooltip } from '@/components/ui/tooltip';
import { MotionConfig } from 'motion/react';
import { useEffect } from 'react';
import { ButtonsSection } from './sections/Buttons';
import { DisplaySection } from './sections/Display';
import { FeedbackSection } from './sections/Feedback';
import { FormsSection } from './sections/Forms';
import { MotionSection } from './sections/Motion';
import { NavigationSection } from './sections/Navigation';
import { OverlaysSection } from './sections/Overlays';
import { useSetting } from './settings';

const NAV = [
  ['buttons', 'Buttons'],
  ['forms', 'Forms'],
  ['overlays', 'Overlays'],
  ['navigation', 'Navigation'],
  ['feedback', 'Feedback'],
  ['display', 'Display'],
  ['motion', 'Motion'],
] as const;

export function App() {
  const [theme, setTheme] = useSetting<'light' | 'dark'>('glidekit:theme', 'light');
  const [motion, setMotion] = useSetting<'user' | 'always'>('glidekit:motion', 'user');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <MotionConfig reducedMotion={motion}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <span className="font-semibold tracking-tight">glidekit</span>
          <nav aria-label="Sections" className="hidden gap-1 text-sm md:flex">
            {NAV.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-md px-2 py-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <Switch
              size="sm"
              label="Reduce motion"
              checked={motion === 'always'}
              onCheckedChange={({ checked }) => setMotion(checked ? 'always' : 'user')}
            />
            <Tooltip content={theme === 'dark' ? 'Light theme' : 'Dark theme'}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle dark theme"
                aria-pressed={theme === 'dark'}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </Button>
            </Tooltip>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4">
        <div className="grid gap-3 py-14">
          <TextReveal
            as="h1"
            text="Components that move with intent."
            className="text-4xl font-semibold tracking-tight sm:text-5xl"
          />
          <p className="max-w-2xl text-muted-foreground">
            Every glidekit component on one page. Toggle dark mode and reduced motion in the header,
            use the keyboard everywhere (<Kbd>Tab</Kbd>, <Kbd>Esc</Kbd>, arrows), and try to break
            things.
          </p>
        </div>
        <ButtonsSection />
        <FormsSection />
        <OverlaysSection />
        <NavigationSection />
        <FeedbackSection />
        <DisplaySection />
        <MotionSection />
      </main>
      <Toaster />
    </MotionConfig>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
