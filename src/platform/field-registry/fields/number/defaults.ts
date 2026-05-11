import type { NumberConfig } from './schema';

export const numberDefaults: { readonly config: NumberConfig } = {
  config: {
    decimals: 0,
    prefix: '',
    suffix: '',
  },
};
