/**
 * Plugin conformance test harness.
 *
 * Every plugin in the registry is run through this set of tests automatically by
 * `all-plugins.test.ts`. Adding a plugin extends the test matrix without touching
 * this file — that's the demonstration of the open-registry pattern.
 */
import { describe, it, expect } from 'vitest';
import type { FieldPlugin } from '@/platform/field-registry';
import { allOperators } from '@/platform/engines/conditions';

export const buildPluginContract = (plugin: FieldPlugin<string, unknown, unknown>) => {
  describe(`plugin contract: ${plugin.kind}`, () => {
    it('has a non-empty kind, label, and category', () => {
      expect(plugin.kind.length).toBeGreaterThan(0);
      expect(plugin.label.length).toBeGreaterThan(0);
      expect(['input', 'choice', 'layout', 'computed']).toContain(plugin.category);
    });

    it('defaults.config parses against configSchema', () => {
      const r = plugin.configSchema.safeParse(plugin.defaults.config);
      expect(r.success, r.success ? '' : JSON.stringify(r.error.issues)).toBe(true);
    });

    it('valueSchema(defaults.config) accepts undefined', () => {
      const schema = plugin.valueSchema(plugin.defaults.config as never);
      expect(schema.safeParse(undefined).success).toBe(true);
    });

    it('every advertised operator exists in the operator registry', () => {
      const known = new Set(allOperators().map((o) => o.id));
      for (const opId of plugin.operators) {
        expect(
          known.has(opId),
          `plugin ${plugin.kind} advertises unknown operator: ${opId}`,
        ).toBe(true);
      }
    });

    it('Renderer and ConfigPanel are component-shaped', () => {
      expect(typeof plugin.Renderer).toBe('function');
      expect(typeof plugin.ConfigPanel).toBe('function');
    });

    it('formatForDisplay returns "" for undefined', () => {
      expect(plugin.formatForDisplay(undefined, plugin.defaults.config as never)).toBe('');
    });

    it('pluginVersion is a positive integer', () => {
      expect(Number.isInteger(plugin.pluginVersion)).toBe(true);
      expect(plugin.pluginVersion).toBeGreaterThan(0);
    });

    it('aggregable plugins must capture values', () => {
      if (plugin.isAggregable) expect(plugin.capturesValue).toBe(true);
    });
  });
};
