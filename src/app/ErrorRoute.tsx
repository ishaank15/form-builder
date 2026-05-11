import { useRouteError, Link } from 'react-router-dom';

export const ErrorRoute = () => {
  const error = useRouteError();
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'statusText' in error
        ? String((error as { statusText?: unknown }).statusText)
        : 'Unknown error';
  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="text-lg font-semibold">Page error</h1>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
      <Link to="/" className="mt-4 inline-block text-sm font-medium text-slate-900 underline">
        Back to dashboard
      </Link>
    </main>
  );
};
