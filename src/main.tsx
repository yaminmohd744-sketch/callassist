import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/500.css';
import '@fontsource/figtree/600.css';
import '@fontsource/figtree/700.css';
import '@fontsource/figtree/900.css';
import '@fontsource/fragment-mono/400.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';
import './styles/globals.css';
import { App } from './App';
import { OverlayScreen } from './screens/OverlayScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './lib/toast';

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
      <ToastProvider>
        {isOverlay ? <OverlayScreen /> : <App />}
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
);
