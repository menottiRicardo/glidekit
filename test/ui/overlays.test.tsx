import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
  shouldClose,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip } from '@/components/ui/tooltip';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { settle } from '../utils';

describe('Dialog', () => {
  function Example({ onOpenChange }: { onOpenChange?: () => void }) {
    return (
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
          <DialogClose>Cancel</DialogClose>
        </DialogContent>
      </Dialog>
    );
  }

  it('opens from an asChild trigger with title and description wired up', async () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Delete project' });
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('moves focus inside, closes with Escape and returns focus to the trigger', async () => {
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await settle();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onOpenChange).toHaveBeenLastCalledWith({ open: false });
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('closes from the close buttons', async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('can be controlled', async () => {
    const view = (open: boolean) => (
      <Dialog open={open}>
        <DialogContent>
          <DialogTitle>Controlled</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    const { rerender } = render(view(true));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    rerender(view(false));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('Drawer', () => {
  it('opens as a dialog', async () => {
    render(
      <Drawer>
        <DrawerTrigger>Filters</DrawerTrigger>
        <DrawerContent side="right">
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Filters' }));
    expect(await screen.findByRole('dialog', { name: 'Filters' })).toHaveAttribute(
      'data-side',
      'right',
    );
  });

  it('closes past the drag distance or speed toward its edge only', () => {
    const at = (x: number, y: number, vx = 0, vy = 0) => ({
      offset: { x, y },
      velocity: { x: vx, y: vy },
    });
    expect(shouldClose('bottom', at(0, 150))).toBe(true);
    expect(shouldClose('bottom', at(0, -150))).toBe(false);
    expect(shouldClose('bottom', at(0, 20, 0, 900))).toBe(true);
    expect(shouldClose('left', at(-120, 0))).toBe(true);
    expect(shouldClose('right', at(-120, 0))).toBe(false);
    expect(shouldClose('top', at(0, -40))).toBe(false);
  });
});

describe('Popover', () => {
  it('toggles and closes on outside click', async () => {
    render(
      <>
        <Popover>
          <PopoverTrigger>Details</PopoverTrigger>
          <PopoverContent>
            <PopoverTitle>Shipping</PopoverTitle>
          </PopoverContent>
        </Popover>
        <button>Outside</button>
      </>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Details' }));
    expect(await screen.findByRole('dialog', { name: 'Shipping' })).toBeInTheDocument();
    await settle();
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('Tooltip', () => {
  it('shows on focus and describes the trigger', async () => {
    render(
      <Tooltip content="Copy to clipboard" openDelay={0}>
        <button>Copy</button>
      </Tooltip>,
    );
    await userEvent.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Copy to clipboard');
    expect(screen.getByRole('button', { name: 'Copy' })).toHaveAccessibleDescription(
      'Copy to clipboard',
    );
    await settle();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });
});

describe('DropdownMenu', () => {
  it('runs item handlers from click and keyboard', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem value="edit" onSelect={onEdit}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem value="delete" onSelect={onDelete} variant="destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());

    trigger.focus();
    await userEvent.keyboard('{Enter}');
    await screen.findByRole('menu');
    await settle();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await waitFor(() => expect(onDelete).toHaveBeenCalledOnce());
  });
});
