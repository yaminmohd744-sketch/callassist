import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './styles/globals.css';
import { App } from './App';
import { OverlayScreen } from './screens/OverlayScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.2,
  });
}

const isOverlay = window.location.hash === '#overlay';

if (isOverlay) {
  document.documentElement.style.background = 'transparent';
  document.body.style.background = 'transparent';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {isOverlay ? <OverlayScreen /> : <App />}
    </ErrorBoundary>
  </StrictMode>,
);
