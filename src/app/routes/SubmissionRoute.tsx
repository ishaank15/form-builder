/**
 * SubmissionRoute — read-only render of a submitted form. PDF export lands in M8;
 * this M4 view just shows label + formatted value pairs in form order.
 *
 * Uses the plugin's `formatForDisplay` so each field type renders its own canonical
 * representation (currency suffix, option label, formatted date, etc.).
 */
import {
  useLoaderData,
  redirect,
  Link,
  type LoaderFunctionArgs,
} from 'react-router-dom';
import { submissionsService, templatesService } from '@/services';
import { getPlugin, isKnownKind } from '@/platform/field-registry';
import type { Submission } from '@/domain/submission/types';
import type { FormDefinition } from '@/domain/form/types';
import type { SubmissionId } from '@/domain/id';

interface LoaderData {
  submission: Submission;
  template: FormDefinition | null;
}

export const submissionLoader = ({ params }: LoaderFunctionArgs): LoaderData | Response => {
  const id = params.submissionId as SubmissionId | undefined;
  if (!id) return redirect('/');
  const submission = submissionsService.get(id);
  if (!submission) return redirect('/');
  return { submission, template: templatesService.get(submission.templateId) };
};

const SubmissionRoute = () => {
  const { submission, template } = useLoaderData() as LoaderData;
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <Link to="/" className="text-xs text-slate-500 hover:underline">
        ← All templates
      </Link>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {template?.name ?? 'Submission'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Submitted {new Date(submission.submittedAt).toLocaleString()}
        </p>
      </header>

      {template ? (
        <dl className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {template.fields.map((field) => {
            // The submission already excludes hidden fields and section headers.
            if (!Object.hasOwn(submission.values, field.id)) return null;
            if (!isKnownKind(field.kind)) return null;
            const plugin = getPlugin(field.kind);
            const display = plugin.formatForDisplay(
              submission.values[field.id] as never,
              field.config as never,
            );
            return (
              <div key={field.id} className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                <dt className="text-slate-500">{field.label}</dt>
                <dd className="col-span-2 text-slate-900">
                  {display === '' ? <span className="italic text-slate-400">empty</span> : display}
                </dd>
              </div>
            );
          })}
        </dl>
      ) : (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          The template for this submission has been deleted. The submission is still saved.
        </p>
      )}
    </main>
  );
};

export default SubmissionRoute;
