import { useEffect } from 'react';
import { useLoaderData, redirect, type LoaderFunctionArgs } from 'react-router-dom';
import { templatesService } from '@/services';
import {
  BuilderToolbar,
  FieldPalette,
  BuilderCanvas,
  FieldConfigPanel,
  useBuilderStore,
  useUndoRedo,
} from '@/features/builder';
import type { FormDefinition } from '@/domain/form/types';
import type { TemplateId } from '@/domain/id';

interface LoaderData {
  template: FormDefinition;
}

export const builderLoader = ({ params }: LoaderFunctionArgs): LoaderData | Response => {
  const id = params.templateId as TemplateId | undefined;
  if (!id) return redirect('/');
  const template = templatesService.get(id);
  if (!template) return redirect('/');
  return { template };
};

const BuilderRoute = () => {
  const { template } = useLoaderData() as LoaderData;
  const load = useBuilderStore((s) => s.load);
  const draft = useBuilderStore((s) => s.draft);
  useUndoRedo();

  // Load only when entering a different template — preserves draft & history when
  // bouncing between /builder/:id and /builder/:id/preview.
  useEffect(() => {
    if (!draft || draft.id !== template.id) load(template);
  }, [template, draft, load]);

  if (!draft) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <BuilderToolbar />
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-4 py-6">
        <div className="col-span-3">
          <FieldPalette />
        </div>
        <div className="col-span-6">
          <BuilderCanvas />
        </div>
        <div className="col-span-3">
          <FieldConfigPanel />
        </div>
      </div>
    </main>
  );
};

export default BuilderRoute;
