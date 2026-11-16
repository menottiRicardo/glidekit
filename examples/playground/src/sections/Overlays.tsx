import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { toaster } from '@/components/ui/toast';
import { Tooltip } from '@/components/ui/tooltip';
import type { Side } from '@/lib/motion';
import { useState } from 'react';
import { Demo, Section } from '../Section';

export function OverlaysSection() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setDeleting(false);
    setConfirmOpen(false);
    toaster.create({
      type: 'info',
      title: 'Project deleted',
      action: { label: 'Undo', onClick: () => toaster.success({ title: 'Restored' }) },
    });
  }

  return (
    <Section
      id="overlays"
      title="Overlays"
      description="Focus is trapped and restored; Escape and outside clicks close."
    >
      <Demo title="Dialog">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Edit profile</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>Changes are saved when you press Save.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="dialog-name">Name</Label>
              <Input id="dialog-name" defaultValue="Ada Lovelace" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={() => toaster.success({ title: 'Profile saved' })}>Save</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          role="alertdialog"
          open={confirmOpen}
          onOpenChange={({ open }) => !deleting && setConfirmOpen(open)}
        >
          <DialogTrigger asChild>
            <Button variant="destructive">Delete project</Button>
          </DialogTrigger>
          <DialogContent showClose={false}>
            <DialogHeader>
              <DialogTitle>Delete this project?</DialogTitle>
              <DialogDescription>
                All of its data will be removed. You can undo for a few seconds.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={deleting}>
                  Keep it
                </Button>
              </DialogClose>
              <Button variant="destructive" loading={deleting} onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost">Nested dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>First layer</DialogTitle>
            <DialogDescription>Escape closes only the top dialog.</DialogDescription>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open another</Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogTitle>Second layer</DialogTitle>
              </DialogContent>
            </Dialog>
          </DialogContent>
        </Dialog>
      </Demo>

      <Demo title="Drawer (drag toward the edge to close)">
        {(['bottom', 'right', 'left', 'top'] as Side[]).map((side) => (
          <Drawer key={side}>
            <DrawerTrigger asChild>
              <Button variant="outline">From {side}</Button>
            </DrawerTrigger>
            <DrawerContent side={side}>
              <DrawerHeader>
                <DrawerTitle>Filters</DrawerTitle>
                <DrawerDescription>Opened from the {side}.</DrawerDescription>
              </DrawerHeader>
              <div className="grid gap-3">
                <Switch label="In stock only" defaultChecked />
                <Switch label="Free shipping" />
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button>Apply</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ))}
      </Demo>

      <Demo title="Popover, menu and tooltip">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Dimensions</Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="grid gap-3">
              <PopoverTitle>Dimensions</PopoverTitle>
              <PopoverDescription>Set the layer size.</PopoverDescription>
              <div className="grid grid-cols-3 items-center gap-2">
                <Label htmlFor="width">Width</Label>
                <Input id="width" defaultValue="100%" className="col-span-2" size="sm" />
                <Label htmlFor="height">Height</Label>
                <Input id="height" defaultValue="25px" className="col-span-2" size="sm" />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Actions</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Project</DropdownMenuLabel>
            <DropdownMenuItem
              value="rename"
              shortcut="⌘R"
              onSelect={() => toaster.info({ title: 'Rename' })}
            >
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              value="duplicate"
              shortcut="⌘D"
              onSelect={() => toaster.info({ title: 'Duplicated' })}
            >
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem value="archive" disabled>
              Archive (disabled)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              value="delete"
              variant="destructive"
              onSelect={() => toaster.error({ title: 'Deleted' })}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
          <Tooltip key={side} content={`Tooltip on the ${side}`} side={side}>
            <Button variant="ghost">{side}</Button>
          </Tooltip>
        ))}
      </Demo>
    </Section>
  );
}
