/**
 * PreviewRoute — renders the *unsaved* draft via the live FormRenderer so the builder
 * can test their form without committing. Reads the draft from the builderStore (the
 * single source of truth while the builder is open).
 *
 * If the user lands here directly (deep link, refresh) the draft is empty — we redirect
 * back to the builder route, which loads from persistence.
 */
import { useEffect } from 'react';
import {
  useNavigate,
  useParams,
  Link,
} from 'react-router-dom';
import { Button } from '@/shared/ui';
import { FormRenderer, useFillerStore } from '@/features/filler';
import { useBuilderStore } from '@/features/builder';

const PreviewRoute = () => {
  const navigate = useNavigate();
  const params = useParams<{ templateId: string }>();
  const draft = useBuilderStore((s) => s.draft);
  const reset = useFillerStore((s) => s.reset);

  // Fresh fill state when entering preview.
  useEffect(() => {
    reset();
  }, [reset]);

  // Direct entry / refresh: bounce to the builder route which loads from storage.
  if (!draft || draft.id !== params.templateId) {
    return (
      <main className="mx-auto max-w-lg p-8">
        <p className="text-sm text-slate-600">
          The preview needs a loaded draft. Open this template in the builder first.
        </p>
        <Link
          to={`/builder/${params.templateId}`}
          className="mt-3 inline-block text-sm font-medium text-slate-900 underline"
        >
          Go to builder
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Preview</p>
            <p className="text-sm font-medium text-slate-900">{draft.name}</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate(`/builder/${draft.id}`)}
          >
            Back to builder
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <FormRenderer form={draft} mode="preview" />
        <p className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">
          Preview mode — submissions are not saved. Conditions and calculations update in real time.
        </p>
      </div>
    </main>
  );
};

export default PreviewRoute;
