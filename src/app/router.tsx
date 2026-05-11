/**
 * Router — React Router v6 data routes. Loaders fetch from services; pages read via
 * `useLoaderData`. Each route is lazy-loaded so the dashboard bundle doesn't ship the
 * builder, and vice versa.
 */
import { createBrowserRouter } from 'react-router-dom';
import { ErrorRoute } from './ErrorRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <ErrorRoute />,
    lazy: async () => {
      const m = await import('./routes/DashboardRoute');
      return { Component: m.default, loader: m.dashboardLoader };
    },
  },
  {
    path: '/builder/:templateId',
    errorElement: <ErrorRoute />,
    lazy: async () => {
      const m = await import('./routes/BuilderRoute');
      return { Component: m.default, loader: m.builderLoader };
    },
  },
  {
    path: '/builder/:templateId/preview',
    errorElement: <ErrorRoute />,
    lazy: async () => {
      const m = await import('./routes/PreviewRoute');
      return { Component: m.default };
    },
  },
  {
    path: '/fill/:templateId',
    errorElement: <ErrorRoute />,
    lazy: async () => {
      const m = await import('./routes/FillerRoute');
      return { Component: m.default, loader: m.fillerLoader };
    },
  },
  {
    path: '/submissions/:submissionId',
    errorElement: <ErrorRoute />,
    lazy: async () => {
      const m = await import('./routes/SubmissionRoute');
      return { Component: m.default, loader: m.submissionLoader };
    },
  },
]);
