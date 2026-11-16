import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Avatar, AvatarGroup } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextReveal } from '@/components/ui/text-reveal';
import { Textarea } from '@/components/ui/textarea';
import { Toaster, toaster } from '@/components/ui/toast';
import { Tooltip } from '@/components/ui/tooltip';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';

async function audit(container: Element = document.body) {
  const results = await axe.run(container, {
    // jsdom has no layout or computed colors.
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`);
}

const fruits = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
];

describe('accessibility audit', () => {
  it('static and form components have no violations', async () => {
    render(
      <main>
        <Button>Save</Button>
        <Button loading>Paying</Button>
        <Label htmlFor="name">Name</Label>
        <Input id="name" />
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" />
        <Card>
          <CardHeader>
            <CardTitle>Plan</CardTitle>
            <CardDescription>Monthly</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge>New</Badge> <Kbd>⌘K</Kbd>
          </CardContent>
        </Card>
        <Separator />
        <Skeleton className="h-4" />
        <AvatarGroup max={2}>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Alan Turing" />
          <Avatar name="Grace Hopper" />
        </AvatarGroup>
        <Progress value={30} label="Upload" />
        <AnimatedNumber value={42} />
        <TextReveal text="Hello there" />
        <Checkbox label="Accept" />
        <Switch label="Notifications" />
        <RadioGroup label="Plan" defaultValue="a">
          <RadioGroupItem value="a">A</RadioGroupItem>
          <RadioGroupItem value="b">B</RadioGroupItem>
        </RadioGroup>
        <Slider label="Volume" defaultValue={[30]} />
        <Select label="Fruit" items={fruits} />
        <Combobox label="Search fruit" items={fruits} />
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">A</TabsTrigger>
            <TabsTrigger value="b">B</TabsTrigger>
          </TabsList>
          <TabsContent value="a">Panel A</TabsContent>
          <TabsContent value="b">Panel B</TabsContent>
        </Tabs>
        <Accordion defaultValue={['x']}>
          <AccordionItem value="x">
            <AccordionTrigger>Question</AccordionTrigger>
            <AccordionContent>Answer</AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>,
    );
    expect(await audit()).toEqual([]);
  });

  it('open overlays have no violations', async () => {
    render(
      <main>
        <Dialog defaultOpen>
          <DialogTrigger>Open dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogContent>
        </Dialog>
      </main>,
    );
    await screen.findByRole('dialog');
    expect(await audit()).toEqual([]);
  });

  it('popover, menu, tooltip and toasts have no violations', async () => {
    render(
      <main>
        <Popover defaultOpen>
          <PopoverTrigger>Info</PopoverTrigger>
          <PopoverContent>
            <PopoverTitle>Details</PopoverTitle>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem value="a">Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip content="Tip" openDelay={0}>
          <button>Hover me</button>
        </Tooltip>
        <Toaster />
      </main>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
    await screen.findByRole('menu');
    act(() => {
      toaster.info({ title: 'Heads up' });
    });
    await screen.findByText('Heads up');
    expect(await audit()).toEqual([]);
    act(() => toaster.remove());
  });
});
