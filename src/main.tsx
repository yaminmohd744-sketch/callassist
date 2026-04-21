import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import { App } from './App';
import { OverlayScreen } from './screens/OverlayScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

const isOverlay = window.location.hash === '#overlay';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {isOverlay ? <OverlayScreen /> : <App />}
    </ErrorBoundary>
  </StrictMode>,
);
