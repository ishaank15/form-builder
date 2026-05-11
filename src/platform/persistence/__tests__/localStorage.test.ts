import { describe, it, expect, beforeEach } from 'vitest';
import { createLocalStoragePersistenceAdapter } from '@/platform/persistence';

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length(): number {
    return this.map.size;
  }
  clear(): void {
    this.map.clear();
  }
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  key(i: number): string | null {
    return [...this.map.keys()][i] ?? null;
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

describe('LocalStoragePersistenceAdapter', () => {
  let storage: MemoryStorage;
  let adapter: ReturnType<typeof createLocalStoragePersistenceAdapter>;

  beforeEach(() => {
    storage = new MemoryStorage();
    adapter = createLocalStoragePersistenceAdapter({ storage });
  });

  it('writes and reads back JSON-shaped data through the envelope', () => {
    adapter.write('templates', { hello: 'world' });
    const got = adapter.read('templates');
    expect(got).toEqual({ hello: 'world' });
  });

  it('returns null for missing keys', () => {
    expect(adapter.read('templates')).toBeNull();
  });

  it('returns null and logs on corrupted JSON', () => {
    storage.setItem('fb:v1:templates', 'not json {');
    expect(adapter.read('templates')).toBeNull();
  });

  it('returns null on a non-envelope-shaped value', () => {
    storage.setItem('fb:v1:templates', JSON.stringify({ wrong: 'shape' }));
    expect(adapter.read('templates')).toBeNull();
  });

  it('clears only the namespaced keys', () => {
    storage.setItem('other:thing', 'untouched');
    adapter.write('templates', { x: 1 });
    adapter.write('submissions', { y: 2 });
    adapter.clearNamespace();
    expect(storage.getItem('other:thing')).toBe('untouched');
    expect(adapter.read('templates')).toBeNull();
    expect(adapter.read('submissions')).toBeNull();
  });

  it('round-trips the same data structure across many operations', () => {
    const data = { a: 1, list: [1, 2, 3], nested: { ok: true } };
    adapter.write('templates', data);
    adapter.write('templates', { ...data, a: 2 });
    expect(adapter.read('templates')).toEqual({ ...data, a: 2 });
    adapter.remove('templates');
    expect(adapter.read('templates')).toBeNull();
  });
});
