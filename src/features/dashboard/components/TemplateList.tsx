import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui';
import { templatesService, submissionsService } from '@/services';
import { createFormDefinition } from '@/domain/form/factories';
import type { FormDefinition } from '@/domain/form/types';

interface Props {
  readonly templates: ReadonlyArray<FormDefinition>;
}

export const TemplateList = ({ templates }: Props) => {
  const navigate = useNavigate();

  const handleNew = () => {
    const t = createFormDefinition({ name: 'Untitled form' });
    templatesService.save(t);
    navigate(`/builder/${t.id}`);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Templates</h2>
        <Button onClick={handleNew}>+ New template</Button>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">No templates yet. Create one to get started.</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {templates.map((t) => {
            const submissionCount = submissionsService.byTemplate(t.id).length;
            return (
              <li key={t.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-900">{t.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {t.fields.length} field{t.fields.length === 1 ? '' : 's'} ·{' '}
                      {submissionCount} response{submissionCount === 1 ? '' : 's'}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Updated {new Date(t.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    to={`/builder/${t.id}`}
                    className="text-xs font-medium text-slate-700 hover:underline"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/fill/${t.id}`}
                    className="ml-auto inline-flex rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    New response
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
