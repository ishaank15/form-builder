/**
 * FieldRenderer — renders a single field by dispatching to the plugin's Renderer.
 *
 * No switch on `kind`. The plugin owns its rendering. This is the keystone of the
 * extensibility story: adding the 11th field type doesn't touch this file.
 *
 * `capturesValue: false` plugins (calc, section) skip the FieldShell wrapper and render
 * their content bare — calc fields aren't input controls, sections aren't fields.
 */
import { getPlugin, isKnownKind } from '@/platform/field-registry';
import type { AnyFieldDefinition } from '@/domain/form/types';
import type { FieldId } from '@/domain/id';
import { useFillerStore } from '../store/fillerStore';
import { FieldShell } from './FieldShell';

interface Props {
  readonly field: AnyFieldDefinition;
  readonly value: unknown;
  readonly required: boolean;
  readonly error: string | undefined;
}

export const FieldRenderer = ({ field, value, required, error }: Props) => {
  // Hooks first, before any conditional return — rules-of-hooks.
  const setValue = useFillerStore((s) => s.setValue);
  const setTouched = useFillerStore((s) => s.setTouched);

  if (!isKnownKind(field.kind)) {
    return (
      <div
        className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800"
        role="alert"
      >
        Unknown field type: <code>{field.kind}</code>
      </div>
    );
  }

  const plugin = getPlugin(field.kind);
  const Renderer = plugin.Renderer;
  const onChange = (next: unknown) => setValue(field.id as FieldId, next);
  const onBlur = () => setTouched(field.id as FieldId);

  // Layout plugins (section) render bare — no input shell. Computed plugins (calculation)
  // render bare too but with a label, since the user expects to see what's being computed.
  if (!plugin.capturesValue) {
    if (plugin.category === 'layout') {
      return (
        <Renderer
          fieldId={field.id}
          fieldLabel={field.label}
          fieldHelpText={field.helpText}
          config={field.config as never}
          value={value as never}
          onChange={onChange}
          onBlur={onBlur}
          readOnly
        />
      );
    }
    // Computed: still uses FieldShell so the user sees a label for the result.
    return (
      <FieldShell label={field.label} helpText={field.helpText}>
        <Renderer
          fieldId={field.id}
          fieldLabel={field.label}
          fieldHelpText={field.helpText}
          config={field.config as never}
          value={value as never}
          onChange={onChange}
          onBlur={onBlur}
          readOnly
        />
      </FieldShell>
    );
  }

  return (
    <FieldShell
      label={field.label}
      helpText={field.helpText}
      required={required}
      error={error}
    >
      <Renderer
        fieldId={field.id}
        fieldLabel={field.label}
        fieldHelpText={field.helpText}
        config={field.config as never}
        value={value as never}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
      />
    </FieldShell>
  );
};
