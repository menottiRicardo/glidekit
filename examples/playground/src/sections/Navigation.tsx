import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Demo, Section } from '../Section';

const faqs = [
  [
    'Can I change the animations?',
    'Yes. Every spring and preset lives in lib/motion.ts in your project.',
  ],
  ['Does it respect reduced motion?', 'Movement is removed and only opacity fades remain.'],
  ['Is it accessible?', 'Behavior comes from tested state machines with full keyboard support.'],
];

export function NavigationSection() {
  return (
    <Section
      id="navigation"
      title="Navigation"
      description="Tabs with a shared-layout indicator and an animated accordion."
    >
      <Demo title="Tabs">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="locked" disabled>
              Locked
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="text-sm">
            Overview content. Use the arrow keys to move between tabs.
          </TabsContent>
          <TabsContent value="analytics" className="text-sm">
            Analytics content <Badge variant="success">+12%</Badge>
          </TabsContent>
          <TabsContent value="reports" className="text-sm">
            Reports content.
          </TabsContent>
          <TabsContent value="locked">Hidden</TabsContent>
        </Tabs>
        <Tabs defaultValue="code" variant="underline" className="w-full">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="text-sm">
            Underline variant.
          </TabsContent>
          <TabsContent value="code" className="font-mono text-sm">
            {'<Tabs variant="underline" />'}
          </TabsContent>
        </Tabs>
      </Demo>
      <Demo title="Accordion">
        <Accordion defaultValue={['0']} className="max-w-xl">
          {faqs.map(([question, answer], index) => (
            <AccordionItem key={question} value={String(index)}>
              <AccordionTrigger>{question}</AccordionTrigger>
              <AccordionContent>{answer}</AccordionContent>
            </AccordionItem>
          ))}
          <AccordionItem value="disabled" disabled>
            <AccordionTrigger>Disabled item</AccordionTrigger>
            <AccordionContent>Never shown.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Demo>
    </Section>
  );
}
