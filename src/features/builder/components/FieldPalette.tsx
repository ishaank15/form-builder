/**
 * Field palette — the left sidebar of Builder Mode. Lists every plugin in the registry.
 * Adding a plugin grows the palette automatically; nothing here changes.
 */
import { allPlugins } from '@/platform/field-registry';
import { Button } from '@/shared/ui';
import { createField } from '@/domain/form/factories';
import { useBuilderStore } from '../store/builderStore';

export const FieldPalette = () => {
  const addField = useBuilderStore((s) => s.addField);
  const draft = useBuilderStore((s) => s.draft);

  if (!draft) return null;

  const handleAdd = (kind: string, label: string, defaults: { config: unknown }) => {
    const usedKeys = new Set(draft.fields.map((f) => f.key));
    let i = 1;
    let key = `${kind}_${i}`;
    while (usedKeys.has(key)) {
      i += 1;
      key = `${kind}_${i}`;
    }
    addField(
      createField({
        kind,
        key,
        label: `${label} ${i}`,
        config: defaults.config,
      }),
    );
  };

  return (
    <aside className="space-y-1">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Fields
      </h2>
      <div className="grid gap-1">
        {allPlugins().map((p) => (
          <Button
            key={p.kind}
            variant="secondary"
            onClick={() => handleAdd(p.kind, p.label, p.defaults)}
            className="justify-start"
          >
            <span
              className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-700"
              aria-hidden
            >
              {p.icon}
            </span>
            {p.label}
          </Button>
        ))}
      </div>
    </aside>
  );
};
