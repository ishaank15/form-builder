import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  readonly children: ReactNode;
  readonly fallback?: (err: Error) => ReactNode;
}

interface State {
  readonly error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, info);
    }
  }

  override render(): ReactNode {
    if (this.state.error) {
      const { fallback } = this.props;
      if (fallback) return fallback(this.state.error);
      return (
        <div className="mx-auto max-w-lg p-8 text-sm">
          <h1 className="text-lg font-semibold">Something went wrong.</h1>
          <pre className="mt-3 overflow-auto rounded bg-slate-100 p-3 text-xs">
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
