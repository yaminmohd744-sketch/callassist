import { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { hasError: true, message };
  }

  override componentDidCatch(error: unknown, info: { componentStack: string }) {
    console.error('[CallAssist] Uncaught error:', error, info.componentStack);
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  override render() {
    if (this.state.hasError) {
      const btnBase: React.CSSProperties = {
        padding: '0.5rem 1.5rem',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.9rem',
      };
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: '1rem',
          fontFamily: 'sans-serif',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <h2 style={{ margin: 0 }}>Something went wrong</h2>
          <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>
            {this.state.message || 'An unexpected error occurred.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => { window.location.hash = ''; window.location.reload(); }}
              style={{ ...btnBase, background: '#222', color: '#fff' }}
            >
              Go to dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{ ...btnBase, background: '#4f46e5', color: '#fff' }}
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
