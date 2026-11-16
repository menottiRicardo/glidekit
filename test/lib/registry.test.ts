// @vitest-environment node
import { devDependencies } from '../../package.json';
import { analyzeImports, buildItems } from '../../scripts/build-registry';

describe('registry build', () => {
  it('reads npm packages and registry items from imports', () => {
    const source = [
      "import { cn } from '@/lib/cn';",
      "import type { X } from '@zag-js/dialog';",
      "import * as menu from '@zag-js/menu/dist/x';",
      "import { motion } from 'motion/react';",
      "import { useId } from 'react';",
      "import { Slot } from '@/components/ui/slot';",
    ].join('\n');
    expect(analyzeImports(source)).toEqual({
      packages: ['@zag-js/dialog', '@zag-js/menu', 'motion'],
      items: ['cn', 'slot'],
    });
  });

  it('builds an item for every source file with resolvable dependencies', () => {
    const items = buildItems();
    const names = items.map((item) => item.name);
    expect(names).toEqual(
      expect.arrayContaining(['button', 'dialog', 'cn', 'use-preset', 'theme']),
    );
    const dialog = items.find((item) => item.name === 'dialog')!;
    expect(dialog.dependencies).toEqual(
      ['@zag-js/dialog', '@zag-js/react', 'motion'].map(
        (name) => `${name}@^${devDependencies[name as keyof typeof devDependencies]}`,
      ),
    );
    expect(dialog.registryDependencies).toEqual(['cn', 'motion', 'props', 'slot', 'use-preset']);
    for (const item of items) {
      for (const dep of item.registryDependencies ?? []) expect(names).toContain(dep);
    }
  });
});
