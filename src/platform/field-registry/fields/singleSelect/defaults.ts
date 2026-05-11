import type { SingleSelectConfig } from './schema';

export const singleSelectDefaults: { readonly config: SingleSelectConfig } = {
  config: {
    options: [
      { id: 'opt_1', label: 'Option 1' },
      { id: 'opt_2', label: 'Option 2' },
    ],
    displayMode: 'dropdown',
  },
};
