// TypeScript declarations for Electron's <webview> intrinsic element.
// Only rendered inside the Electron shell (guarded by isElectron check in components).
// https://www.electronjs.org/docs/latest/api/webview-tag

import type * as React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      webview: {
        src?: string;
        partition?: string;
        useragent?: string;
        allowpopups?: string;
        nodeintegration?: string;
        webpreferences?: string;
        className?: string;
        style?: React.CSSProperties;
        ref?: React.Ref<HTMLElement>;
      };
    }
  }
}
