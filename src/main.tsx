import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './styles/globals.css';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN as string,
  // Never send IP addresses or user PII — calls contain sensitive data
  sendDefaultPii: false,
  // Only run in production to avoid noise during development
  enabled: import.meta.env.PROD,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
