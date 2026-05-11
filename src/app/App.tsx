import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { router } from './router';

export const App = () => (
  <ErrorBoundary>
    <RouterProvider router={router} />
  </ErrorBoundary>
);
