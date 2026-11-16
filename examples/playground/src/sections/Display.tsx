import { Avatar, AvatarGroup } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Kbd } from '@/components/ui/kbd';
import { Separator } from '@/components/ui/separator';
import { Demo, Section } from '../Section';

const team = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Katherine Johnson', 'Linus Torvalds'];

export function DisplaySection() {
  return (
    <Section id="display" title="Display" description="Cards, avatars, badges and small details.">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Starter', '$0', 'For side projects.'],
          ['Pro', '$19', 'For growing teams.'],
          ['Enterprise', 'Custom', 'For large organizations.'],
        ].map(([name, price, blurb]) => (
          <Card key={name} interactive>
            <CardHeader>
              <CardTitle>{name}</CardTitle>
              <CardDescription>{blurb}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{price}</p>
            </CardContent>
            <CardFooter>
              <Button variant={name === 'Pro' ? 'primary' : 'outline'} className="w-full">
                Choose {name}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Demo title="Avatars">
        <Avatar name="Ada Lovelace" src="https://i.pravatar.cc/96?img=47" size="lg" />
        <Avatar name="Broken Image" src="https://example.invalid/missing.png" size="lg" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Sm" size="sm" />
        <Separator orientation="vertical" className="h-8" />
        <AvatarGroup max={3}>
          {team.map((name) => (
            <Avatar key={name} name={name} />
          ))}
        </AvatarGroup>
      </Demo>
      <Demo title="Badges and keys">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="destructive">Error</Badge>
        <span className="text-sm text-muted-foreground">
          Search <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </Demo>
    </Section>
  );
}
