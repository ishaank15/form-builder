import { useLoaderData } from 'react-router-dom';
import { templatesService, submissionsService } from '@/services';
import { TemplateList, SubmissionList } from '@/features/dashboard';
import type { FormDefinition } from '@/domain/form/types';
import type { Submission } from '@/domain/submission/types';

interface LoaderData {
  templates: ReadonlyArray<FormDefinition>;
  submissions: ReadonlyArray<Submission>;
}

export const dashboardLoader = (): LoaderData => ({
  templates: templatesService.list(),
  submissions: submissionsService.list().slice(0, 10),
});

const DashboardRoute = () => {
  const { templates, submissions } = useLoaderData() as LoaderData;
  const templatesById = new Map(templates.map((t) => [t.id as string, t]));

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Form Builder</h1>
        <p className="mt-1 text-sm text-slate-600">
          Build form templates, fill them in, export as PDF.
        </p>
      </header>
      <TemplateList templates={templates} />
      <SubmissionList submissions={submissions} templatesById={templatesById} />
    </main>
  );
};

export default DashboardRoute;
