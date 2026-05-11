import { useState, useEffect } from 'react';
import {
  useLoaderData,
  redirect,
  Link,
  type LoaderFunctionArgs,
} from 'react-router-dom';
import { templatesService } from '@/services';
import { FormRenderer, SubmissionToolbar, useFillerStore } from '@/features/filler';
import type { FormDefinition } from '@/domain/form/types';
import type { TemplateId } from '@/domain/id';

interface LoaderData {
  template: FormDefinition;
}

export const fillerLoader = ({ params }: LoaderFunctionArgs): LoaderData | Response => {
  const id = params.templateId as TemplateId | undefined;
  if (!id) return redirect('/');
  const template = templatesService.get(id);
  if (!template) return redirect('/');
  return { template };
};

const FillerRoute = () => {
  const { template } = useLoaderData() as LoaderData;
  const reset = useFillerStore((s) => s.reset);
  const [showAllErrors, setShowAllErrors] = useState(false);

  // Reset filler state when arriving at the route — fresh fill each time.
  useEffect(() => {
    reset();
  }, [template.id, reset]);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <Link to="/" className="text-xs text-slate-500 hover:underline">
            ← All templates
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{template.name}</h1>
          {template.description && (
            <p className="mt-1 text-sm text-slate-600">{template.description}</p>
          )}
        </div>
      </header>

      <FormRenderer form={template} mode="fill" showAllErrors={showAllErrors} />

      <SubmissionToolbar form={template} onAttemptSubmit={() => setShowAllErrors(true)} />
    </main>
  );
};

export default FillerRoute;
