# Navigation

## Tabs

```tsx
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="billing">Billing</TabsTrigger>
  </TabsList>
  <TabsContent value="account">…</TabsContent>
  <TabsContent value="billing">…</TabsContent>
</Tabs>
```

The active indicator slides between tabs with a shared-layout animation. `variant`: `pill`
(default) or `underline`. Arrow keys move between tabs; disabled tabs are skipped. Panels mount
when selected. Long tab lists scroll horizontally on small screens.

## Accordion

```tsx
<Accordion defaultValue={['shipping']}>
  <AccordionItem value="shipping">
    <AccordionTrigger>Shipping</AccordionTrigger>
    <AccordionContent>Ships in 2 days.</AccordionContent>
  </AccordionItem>
</Accordion>
```

Content expands with a height animation. One item open at a time unless `multiple`; items can
always be collapsed (`collapsible`, default on).
