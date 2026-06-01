const { app, BrowserWindow, ipcMain, screen, shell } = require('electron');
const path = require('path');

// Enable Chromium's speech recognition service inside Electron.
// Without these flags webkitSpeechRecognition fires a 'network' error
// because the renderer can't reach Google's speech endpoint.
app.commandLine.appendSwitch('enable-features', 'WebSpeechAPI,AudioServiceOutOfProcess');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const isDev = !!process.defaultApp || process.env.NODE_ENV !== 'production';
const BASE_URL = isDev
  ? 'http://localhost:5173'
  : `file://${path.join(__dirname, '../dist/index.html')}`;

// Register custom URL protocol. On Windows in dev mode the electron binary
// needs the app directory passed explicitly so the registry entry is correct.
if (process.platform === 'win32') {
  app.setAsDefaultProtocolClient('pitchr', process.execPath, [path.resolve(__dirname, '..')]);
} else {
  app.setAsDefaultProtocolClient('pitchr');
}

// Enforce a single instance. If the user clicks the web button while the
// app is already running, focus the existing window instead of opening a second.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

let mainWindow = null;
let overlayWindow = null;

function createOverlayWindow() {
  if (overlayWindow) {
    overlayWindow.focus();
    return;
  }

  const { width } = screen.getPrimaryDisplay().workAreaSize;
  const overlayWidth = 500;

  overlayWindow = new BrowserWindow({
    width: overlayWidth,
    height: 200,
    x: Math.floor((width - overlayWidth) / 2),
    y: 16,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const overlayURL = isDev
    ? 'http://localhost:5173/#overlay'
    : `file://${path.join(__dirname, '../dist/index.html')}#overlay`;

  overlayWindow.loadURL(overlayURL);
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');

  overlayWindow.on('closed', () => {
    overlayWindow = null;
    if (mainWindow) mainWindow.webContents.send('overlay-closed');
  });
}

ipcMain.on('open-external', (_, url) => {
  // Validate it's a supabase OAuth URL before opening
  if (typeof url === 'string' && url.startsWith('https://')) {
    shell.openExternal(url);
  }
});

ipcMain.on('launch-overlay', () => createOverlayWindow());

ipcMain.on('close-overlay', () => {
  if (overlayWindow) overlayWindow.close();
});

ipcMain.on('push-overlay-data', (_, data) => {
  if (overlayWindow) overlayWindow.webContents.send('overlay-data', data);
});

ipcMain.on('minimize-main', () => {
  if (mainWindow) mainWindow.minimize();
});

// Overlay → restore main window (user clicked Restore, no end call)
ipcMain.on('restore-main', () => {
  if (overlayWindow) overlayWindow.close();
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// Overlay → end the call and restore main window
ipcMain.on('end-call-from-overlay', () => {
  if (overlayWindow) overlayWindow.close();
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    mainWindow.webContents.send('trigger-end-call');
  }
});

function focusOrCreateWindow() {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  } else {
    createMainWindow();
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true, // enables <webview> for embedded meeting panels
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false,
  });

  // Restrict what the renderer can load/execute.
  const { session: electronSession } = require('electron');
  electronSession.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' https://*.supabase.co https://api.fontshare.com https://cdn.fontshare.com;" +
          "script-src 'self' 'unsafe-inline';" +
          "style-src 'self' 'unsafe-inline' https://api.fontshare.com https://cdn.fontshare.com;" +
          "font-src 'self' https://api.fontshare.com https://cdn.fontshare.com;" +
          "img-src 'self' data: blob: https:;" +
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.deepgram.com wss://api.deepgram.com https://sentry.io https://o*.ingest.sentry.io;" +
          "media-src 'self' blob:;" +
          "worker-src blob:;"
        ],
      },
    });
  });

  mainWindow.loadURL(BASE_URL);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Extracts auth payload from a pitchr:// deep-link URL and forwards it to
// the renderer. Handles both PKCE (code in query string) and legacy implicit
// flow (access_token in hash fragment).
function handleDeepLink(url) {
  if (!mainWindow || !url.startsWith('pitchr://')) return;
  try {
    // Reconstruct as a parseable URL by swapping the custom scheme for https
    const parsed = new URL(url.replace(/^pitchr:\/\//, 'https://pitchr.app/'));
    const code = parsed.searchParams.get('code');
    if (code) {
      mainWindow.webContents.send('oauth-callback-code', code);
      return;
    }
  } catch { /* ignore parse errors */ }
  // Fallback: legacy implicit flow — access_token in hash
  const hashIndex = url.indexOf('#');
  const fragment = hashIndex !== -1 ? url.slice(hashIndex + 1) : '';
  if (fragment.includes('access_token')) {
    mainWindow.webContents.send('oauth-callback', fragment);
  }
}

// Windows: a second instance was launched via the protocol URL.
app.on('second-instance', (_event, argv) => {
  const url = argv.find(arg => arg.startsWith('pitchr://'));
  if (url) handleDeepLink(url);
  focusOrCreateWindow();
});

// macOS: protocol URL opens the app directly via 'open-url' event
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  // Grant microphone (and camera) permissions so getUserMedia and
  // webkitSpeechRecognition both work without a prompt.
  const { session } = require('electron');
  const ALLOWED_PERMISSIONS = ['media', 'microphone', 'camera', 'audioCapture', 'videoCapture', 'speech-recognition', 'speechRecognition', 'display-capture', 'notifications'];
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(ALLOWED_PERMISSIONS.includes(permission));
  });
  session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
    return ALLOWED_PERMISSIONS.includes(permission);
  });

  // Grant the same permissions to any webview session (meeting panels use their own session)
  app.on('web-contents-created', (_, contents) => {
    if (contents.getType() === 'webview') {
      contents.session.setPermissionRequestHandler((_wc, permission, callback) => {
        callback(ALLOWED_PERMISSIONS.includes(permission));
      });
      contents.session.setPermissionCheckHandler((_wc, permission) => {
        return ALLOWED_PERMISSIONS.includes(permission);
      });
    }
  });

  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
