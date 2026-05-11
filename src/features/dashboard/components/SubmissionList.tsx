import { Link } from 'react-router-dom';
import type { Submission } from '@/domain/submission/types';
import type { FormDefinition } from '@/domain/form/types';

interface Props {
  readonly submissions: ReadonlyArray<Submission>;
  readonly templatesById: ReadonlyMap<string, FormDefinition>;
}

export const SubmissionList = ({ submissions, templatesById }: Props) => {
  if (submissions.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">Recent responses</h2>
      <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {submissions.map((s) => {
          const tpl = templatesById.get(s.templateId);
          return (
            <li key={s.id} className="flex items-center justify-between gap-2 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-900">
                  {tpl?.name ?? <span className="italic text-slate-400">Deleted template</span>}
                </p>
                <p className="text-xs text-slate-500">
                  Submitted {new Date(s.submittedAt).toLocaleString()}
                </p>
              </div>
              <Link
                to={`/submissions/${s.id}`}
                className="text-xs font-medium text-slate-700 hover:underline"
              >
                View
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
