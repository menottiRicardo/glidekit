import { AnimatedNumber } from '@/components/ui/animated-number';
import { Avatar, AvatarGroup, initials } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { splitText, TextReveal } from '@/components/ui/text-reveal';
import { Textarea } from '@/components/ui/textarea';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Button', () => {
  it('renders a typed button and handles clicks', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies variant classes and merges className', () => {
    render(
      <Button variant="destructive" size="sm" className="px-10">
        Delete
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-destructive');
    expect(button.className).toContain('px-10');
    expect(button.className).not.toContain('px-3');
  });

  it('is busy and disabled while loading', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Pay
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Pay' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('form primitives', () => {
  it('connects Label to Input and Textarea', async () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <Input id="email" aria-invalid />
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" />
      </>,
    );
    const input = screen.getByLabelText('Email');
    await userEvent.type(input, 'a@b.co');
    expect(input).toHaveValue('a@b.co');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Bio').tagName).toBe('TEXTAREA');
  });
});

describe('display components', () => {
  it('renders card parts, badge, kbd and separators', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="success">Active</Badge>
          <Kbd>⌘K</Kbd>
          <Separator decorative={false} orientation="vertical" />
        </CardContent>
      </Card>,
    );
    expect(screen.getByRole('heading', { name: 'Plan' })).toBeInTheDocument();
    expect(screen.getByText('Active').className).toContain('text-success');
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('hides skeletons from assistive technology', () => {
    const { container } = render(<Skeleton className="h-4" />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Avatar', () => {
  it('computes initials', () => {
    expect(initials('Ada Lovelace')).toBe('AL');
    expect(initials('  cher ')).toBe('C');
    expect(initials('Jean Paul Sartre')).toBe('JS');
    expect(initials()).toBe('');
  });

  it('shows the initials fallback with an accessible name', () => {
    render(<Avatar name="Ada Lovelace" />);
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveTextContent('AL');
  });

  it('collapses extra avatars into a count', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar name="A One" />
        <Avatar name="B Two" />
        <Avatar name="C Three" />
        <Avatar name="D Four" />
      </AvatarGroup>,
    );
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });
});

describe('Progress', () => {
  it('exposes value to assistive technology', () => {
    render(<Progress value={40} label="Upload" showValue />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('supports an indeterminate state', () => {
    render(<Progress value={null} label="Loading" />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });
});

describe('animated text and numbers', () => {
  it('announces the final formatted number', () => {
    render(
      <AnimatedNumber
        value={1234.5}
        format={{ style: 'currency', currency: 'USD' }}
        locale="en-US"
      />,
    );
    const [visible, spoken] = screen.getAllByText('$1,234.50');
    expect(visible).toHaveAttribute('aria-hidden', 'true');
    expect(spoken).toHaveClass('sr-only');
  });

  it('splits text by word (keeping spaces) or letter', () => {
    expect(splitText('Hello big world', 'word')).toEqual(['Hello', ' ', 'big', ' ', 'world']);
    expect(splitText('hey', 'letter')).toEqual(['h', 'e', 'y']);
  });

  it('keeps revealed text readable as one string', () => {
    render(<TextReveal as="h1" text="Ship faster" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ship faster');
    expect(screen.getByText('Ship faster')).toHaveClass('sr-only');
  });
});
