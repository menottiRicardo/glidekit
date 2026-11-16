import { Checkbox } from '@/components/ui/checkbox';
import { Combobox, defaultFilter } from '@/components/ui/combobox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const fruits = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', disabled: true },
];

describe('Checkbox', () => {
  it('toggles with click and space and reports changes', async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Accept terms" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(box).not.toBeChecked();
    await userEvent.click(screen.getByText('Accept terms'));
    expect(box).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(expect.objectContaining({ checked: true }));
    box.focus();
    await userEvent.keyboard(' ');
    expect(box).not.toBeChecked();
  });

  it('supports the indeterminate state', () => {
    render(<Checkbox label="All" checked="indeterminate" />);
    expect(screen.getByRole('checkbox')).toBePartiallyChecked();
  });
});

describe('Switch', () => {
  it('toggles and exposes the switch role', async () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="Wi-Fi" onCheckedChange={onCheckedChange} />);
    const input = screen.getByRole('switch', { name: 'Wi-Fi' });
    await userEvent.click(screen.getByText('Wi-Fi'));
    expect(input).toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledWith(expect.objectContaining({ checked: true }));
  });

  it('respects disabled', async () => {
    render(<Switch label="Locked" disabled />);
    await userEvent.click(screen.getByText('Locked'));
    expect(screen.getByRole('switch')).not.toBeChecked();
  });
});

describe('RadioGroup', () => {
  it('selects with click', async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup label="Plan" defaultValue="free" onValueChange={onValueChange}>
        <RadioGroupItem value="free">Free</RadioGroupItem>
        <RadioGroupItem value="pro">Pro</RadioGroupItem>
        <RadioGroupItem value="team">Team</RadioGroupItem>
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Free' })).toBeChecked();
    await userEvent.click(screen.getByText('Team'));
    expect(screen.getByRole('radio', { name: 'Team' })).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: 'team' }));
  });
});

describe('Slider', () => {
  it('moves with the keyboard and stays within bounds', async () => {
    const onValueChange = vi.fn();
    render(<Slider label="Volume" defaultValue={[50]} step={10} onValueChange={onValueChange} />);
    const thumb = screen.getByRole('slider', { name: 'Volume' });
    expect(thumb).toHaveAttribute('aria-valuenow', '50');
    act(() => thumb.focus());
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(thumb).toHaveAttribute('aria-valuenow', '60'));
    await userEvent.keyboard('{End}');
    await waitFor(() => expect(thumb).toHaveAttribute('aria-valuenow', '100'));
    await userEvent.keyboard('{ArrowRight}');
    expect(thumb).toHaveAttribute('aria-valuenow', '100');
    expect(onValueChange).toHaveBeenCalled();
  });

  it('renders one labelled thumb per value for ranges', () => {
    render(<Slider defaultValue={[20, 80]} thumbLabels={['Min price', 'Max price']} />);
    expect(screen.getByRole('slider', { name: 'Min price' })).toHaveAttribute(
      'aria-valuenow',
      '20',
    );
    expect(screen.getByRole('slider', { name: 'Max price' })).toHaveAttribute(
      'aria-valuenow',
      '80',
    );
  });
});

describe('Select', () => {
  it('opens, selects an option and closes', async () => {
    const onValueChange = vi.fn();
    render(<Select label="Fruit" items={fruits} onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    expect(trigger).toHaveTextContent('Select…');
    await userEvent.click(trigger);
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onValueChange).toHaveBeenCalledWith('banana');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('Banana');
  });

  it('marks disabled options', async () => {
    render(<Select label="Fruit" items={fruits} />);
    await userEvent.click(screen.getByRole('combobox', { name: 'Fruit' }));
    expect(await screen.findByRole('option', { name: 'Cherry' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });
});

describe('Combobox', () => {
  it('filters as you type and selects a match', async () => {
    const onValueChange = vi.fn();
    render(<Combobox label="Fruit" items={fruits} onValueChange={onValueChange} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    await userEvent.type(input, 'ban');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    await userEvent.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onValueChange).toHaveBeenCalledWith('banana');
    expect(input).toHaveValue('Banana');
  });

  it('shows the empty text when nothing matches', async () => {
    render(<Combobox label="Fruit" items={fruits} emptyText="Nothing here" />);
    await userEvent.type(screen.getByRole('combobox', { name: 'Fruit' }), 'zzz');
    expect(await screen.findByText('Nothing here')).toBeInTheDocument();
  });

  it('matches case-insensitively by default', () => {
    expect(defaultFilter({ label: 'Banana', value: 'b' }, ' BAN ')).toBe(true);
    expect(defaultFilter({ label: 'Banana', value: 'b' }, 'x')).toBe(false);
  });
});
