import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster, toaster } from '@/components/ui/toast';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Tabs', () => {
  function Example({ variant }: { variant?: 'pill' | 'underline' }) {
    return (
      <Tabs defaultValue="account" variant={variant}>
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="team" disabled>
            Team
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">Account settings</TabsContent>
        <TabsContent value="billing">Billing settings</TabsContent>
        <TabsContent value="team">Team settings</TabsContent>
      </Tabs>
    );
  }

  it('shows the selected panel and switches on click', async () => {
    render(<Example />);
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Account settings');
    await userEvent.click(screen.getByRole('tab', { name: 'Billing' }));
    expect(screen.getByRole('tab', { name: 'Billing' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Billing settings');
    expect(screen.queryByText('Account settings')).not.toBeInTheDocument();
  });

  it('moves with arrow keys and skips disabled tabs', async () => {
    render(<Example variant="underline" />);
    await userEvent.click(screen.getByRole('tab', { name: 'Account' }));
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Billing' })).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('tab', { name: 'Account' })).toHaveFocus());
  });
});

describe('Accordion', () => {
  function Example({ multiple }: { multiple?: boolean }) {
    return (
      <Accordion multiple={multiple}>
        <AccordionItem value="a">
          <AccordionTrigger>Shipping</AccordionTrigger>
          <AccordionContent>Ships in 2 days.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Returns</AccordionTrigger>
          <AccordionContent>30 day returns.</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  it('expands and collapses an item', async () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Shipping' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Ships in 2 days.')).not.toBeInTheDocument();
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(screen.getByText('Ships in 2 days.')).toBeVisible());
    await userEvent.click(trigger);
    await waitFor(() => expect(screen.queryByText('Ships in 2 days.')).not.toBeInTheDocument());
  });

  it('keeps one item open unless multiple is set', async () => {
    const { unmount } = render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Shipping' }));
    await userEvent.click(screen.getByRole('button', { name: 'Returns' }));
    await waitFor(() => expect(screen.queryByText('Ships in 2 days.')).not.toBeInTheDocument());
    unmount();

    render(<Example multiple />);
    await userEvent.click(screen.getByRole('button', { name: 'Shipping' }));
    await userEvent.click(screen.getByRole('button', { name: 'Returns' }));
    expect(screen.getByText('Ships in 2 days.')).toBeInTheDocument();
    expect(screen.getByText('30 day returns.')).toBeInTheDocument();
  });
});

describe('Toast', () => {
  afterEach(() => {
    act(() => toaster.remove());
  });

  it('shows toasts from the shared toaster and dismisses them', async () => {
    render(<Toaster />);
    act(() => {
      toaster.success({ title: 'Saved', description: 'Your changes are live.' });
    });
    expect(await screen.findByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Your changes are live.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    await waitFor(() => expect(screen.queryByText('Saved')).not.toBeInTheDocument(), {
      timeout: 3000,
    });
  });

  it('runs toast actions', async () => {
    const onUndo = vi.fn();
    render(<Toaster />);
    act(() => {
      toaster.create({
        title: 'Deleted',
        type: 'info',
        action: { label: 'Undo', onClick: onUndo },
      });
    });
    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalledOnce();
  });
});
