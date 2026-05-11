import type { FileConfig } from './schema';
export const fileDefaults: { readonly config: FileConfig } = {
  config: { allowedTypes: '', maxFiles: 1 },
};
