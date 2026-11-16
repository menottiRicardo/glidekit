import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toaster } from '@/components/ui/toast';
import { useState, type FormEvent } from 'react';
import { Demo, Section } from '../Section';

const frameworks = [
  { label: 'Next.js', value: 'next' },
  { label: 'Remix', value: 'remix' },
  { label: 'Vite', value: 'vite' },
  { label: 'Astro', value: 'astro' },
  { label: 'Gatsby (retired)', value: 'gatsby', disabled: true },
];

const countries = [
  'Argentina',
  'Australia',
  'Brazil',
  'Canada',
  'Chile',
  'Colombia',
  'France',
  'Germany',
  'India',
  'Italy',
  'Japan',
  'Mexico',
  'Netherlands',
  'Peru',
  'Portugal',
  'Spain',
  'Sweden',
  'United Kingdom',
  'United States',
  'Uruguay',
].map((name) => ({ label: name, value: name.toLowerCase().replace(/\s+/g, '-') }));

export function FormsSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [indeterminate, setIndeterminate] = useState<boolean | 'indeterminate'>('indeterminate');
  const invalid = submitted && !/^\S+@\S+\.\S+$/.test(email);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toaster.error({ title: 'Check the form', description: 'Enter a valid email address.' });
      return;
    }
    toaster.success({ title: 'Submitted', description: JSON.stringify(data) });
  }

  return (
    <Section
      id="forms"
      title="Forms"
      description="Every control works inside a real <form>, with validation."
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className="grid gap-5 rounded-xl border bg-card p-5 md:grid-cols-2"
      >
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? 'email-error' : undefined}
          />
          {invalid && (
            <p id="email-error" className="text-sm text-destructive">
              Enter a valid email address.
            </p>
          )}
        </div>
        <Select
          label="Framework"
          name="framework"
          items={frameworks}
          placeholder="Pick a framework"
        />
        <Combobox label="Country" name="country" items={countries} placeholder="Search countries" />
        <div className="grid gap-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" placeholder="It grows as you type…" />
        </div>
        <RadioGroup label="Plan" name="plan" defaultValue="pro" orientation="horizontal">
          <RadioGroupItem value="free">Free</RadioGroupItem>
          <RadioGroupItem value="pro">Pro</RadioGroupItem>
          <RadioGroupItem value="team">Team</RadioGroupItem>
        </RadioGroup>
        <div className="grid gap-3">
          <Checkbox name="terms" label="Accept terms" description="You can change this later." />
          <Switch name="newsletter" label="Send me product updates" defaultChecked />
        </div>
        <Slider label="Seats" name="seats" min={1} max={50} defaultValue={[5]} showValue />
        <Slider
          label="Price range"
          name="price"
          min={0}
          max={500}
          step={10}
          defaultValue={[100, 350]}
          minStepsBetweenThumbs={2}
          thumbLabels={['Minimum price', 'Maximum price']}
          showValue
        />
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit">Submit</Button>
          <Button type="reset" variant="outline" onClick={() => setSubmitted(false)}>
            Reset
          </Button>
        </div>
      </form>
      <Demo title="Edge cases">
        <Checkbox
          label="Select all"
          checked={indeterminate}
          onCheckedChange={({ checked }) => setIndeterminate(checked)}
        />
        <Checkbox label="Disabled" disabled defaultChecked />
        <Switch label="Disabled" disabled />
        <Checkbox label="Invalid" invalid />
        <div className="w-56">
          <Select label="Empty list" items={[]} placeholder="Nothing to pick" />
        </div>
        <div className="w-56">
          <Combobox label="No matches" items={frameworks} emptyText="Try another framework" />
        </div>
      </Demo>
    </Section>
  );
}
