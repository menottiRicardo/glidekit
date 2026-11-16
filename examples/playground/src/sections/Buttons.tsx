import { Button } from '@/components/ui/button';
import { toaster } from '@/components/ui/toast';
import { useState } from 'react';
import { Demo, Section } from '../Section';

export function ButtonsSection() {
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSaving(false);
    toaster.success({ title: 'Saved', description: 'Your changes are live.' });
  }

  return (
    <Section
      id="buttons"
      title="Buttons"
      description="Press feedback, variants, sizes and a loading state."
    >
      <Demo title="Variants">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Delete</Button>
        <Button variant="link">Link</Button>
      </Demo>
      <Demo title="Sizes and states">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
        <Button disabled>Disabled</Button>
        <Button loading={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save (async)'}
        </Button>
      </Demo>
    </Section>
  );
}
