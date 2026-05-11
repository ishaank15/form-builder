/**
 * FieldConfigPanel — right-hand inspector. Renders:
 *   1. Field-level controls (label, key, default required/visibility)
 *   2. The plugin's ConfigPanel (per-kind options)
 *   3. The ConditionsEditor (visibility/required rules)
 */
import { Input, Label } from '@/shared/ui';
import { getPlugin, isKnownKind } from '@/platform/field-registry';
import { useBuilderStore } from '../store/builderStore';
import { ConditionsEditor } from './ConditionsEditor';

export const FieldConfigPanel = () => {
  const draft = useBuilderStore((s) => s.draft);
  const selectedFieldId = useBuilderStore((s) => s.selectedFieldId);
  const updateField = useBuilderStore((s) => s.updateField);

  if (!draft) return null;
  const field = draft.fields.find((f) => f.id === selectedFieldId);
  if (!field) {
    return (
      <aside className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-xs text-slate-500">Select a field to edit its settings.</p>
      </aside>
    );
  }

  if (!isKnownKind(field.kind)) return null;
  const plugin = getPlugin(field.kind);
  const ConfigPanel = plugin.ConfigPanel;

  return (
    <aside className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Field settings
      </h3>

      <div>
        <Label htmlFor="cfg-label">Label</Label>
        <Input
          id="cfg-label"
          value={field.label}
          onChange={(e) => updateField(field.id, { label: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="cfg-key">Key</Label>
        <Input
          id="cfg-key"
          value={field.key}
          onChange={(e) =>
            updateField(field.id, {
              key: e.target.value.replace(/[^a-z0-9_]/gi, '_').toLowerCase(),
            })
          }
        />
        <p className="mt-1 text-xs text-slate-500">Stable identifier; lowercase + underscores.</p>
      </div>

      {plugin.capturesValue && (
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={field.defaultRequired}
              onChange={(e) => updateField(field.id, { defaultRequired: e.target.checked })}
              className="h-4 w-4 accent-slate-900"
            />
            Required
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={field.defaultVisibility === 'hidden'}
              onChange={(e) =>
                updateField(field.id, {
                  defaultVisibility: e.target.checked ? 'hidden' : 'visible',
                })
              }
              className="h-4 w-4 accent-slate-900"
            />
            Hidden by default
          </label>
        </div>
      )}

      <div className="border-t border-slate-200 pt-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {plugin.label} options
        </h3>
        <ConfigPanel
          config={field.config as never}
          onChange={(next) => updateField(field.id, { config: next })}
          form={{ fields: draft.fields, selfId: field.id }}
        />
      </div>

      {plugin.category !== 'computed' && plugin.category !== 'layout' && (
        <div className="border-t border-slate-200 pt-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Conditions
          </h3>
          <ConditionsEditor field={field} />
        </div>
      )}
    </aside>
  );
};
