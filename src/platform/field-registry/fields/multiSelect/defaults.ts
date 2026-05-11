import type { MultiSelectConfig } from './schema';
export const multiSelectDefaults: { readonly config: MultiSelectConfig } = {
  config: {
    options: [
      { id: 'opt_1', label: 'Option 1' },
      { id: 'opt_2', label: 'Option 2' },
    ],
  },
};
