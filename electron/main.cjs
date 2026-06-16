const { app, BrowserWindow, ipcMain, screen, shell, systemPreferences } = require('electron');
const path = require('path');
const http  = require('http');
const https = require('https');

// ── Google OAuth helpers ──────────────────────────────────────────────────────

const GOOGLE_REDIRECT_URI = 'http://127.0.0.1:3457';

function waitForGoogleCallback() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let code;
      try {
        const url = new URL(req.url, GOOGLE_REDIRECT_URI);
        code = url.searchParams.get('code');
      } catch { /* ignore */ }
      const html = '<html><body style="background:#0a0a0a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">' +
        (code
          ? '<p style="font-size:18px">✓ Signed in — you can close this window and return to Pitchr.</p>'
          : '<p style="font-size:18px">Sign in failed — please try again in Pitchr.</p>') +
        '</body></html>';
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      server.close();
      if (code) resolve(code); else reject(new Error('google_oauth_cancelled'));
    });
    server.listen(3457, '127.0.0.1');
    server.on('error', reject);
    setTimeout(() => { server.close(); reject(new Error('google_oauth_timeout')); }, 300_000);
  });
}

ipcMain.on('google-start-server', async () => {
  try {
    const code = await waitForGoogleCallback();
    if (mainWindow) mainWindow.webContents.send('oauth-callback-code', code);
  } catch {
    // Silently ignore cancellations; the renderer will just stay on the auth screen
  }
});

// ── Zoom OAuth helpers ────────────────────────────────────────────────────────

const ZOOM_REDIRECT_URI = 'http://127.0.0.1:3456';

// Spins up a one-shot local HTTP server that waits for Zoom to redirect back
// with ?code=XXX, then closes itself and resolves with the code.
function waitForZoomCallback() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const url = new URL(req.url, ZOOM_REDIRECT_URI);
        const code  = url.searchParams.get('code');
        const html  = '<html><body style="background:#0a0a0a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">' +
          (code
            ? '<p style="font-size:18px">✓ Connected to Zoom — you can close this window and return to Pitchr.</p>'
            : '<p style="font-size:18px">Authorization failed — please try again in Pitchr.</p>') +
          '</body></html>';
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      } catch { res.end(); }
      server.close();
      const code = new URL(req.url, ZOOM_REDIRECT_URI).searchParams.get('code');
      if (code) resolve(code); else reject(new Error('zoom_oauth_cancelled'));
    });
    server.listen(3456, '127.0.0.1');
    server.on('error', reject);
    // Auto-close after 5 minutes
    setTimeout(() => { server.close(); reject(new Error('zoom_oauth_timeout')); }, 300_000);
  });
}

function exchangeZoomCode(code, clientId, clientSecret) {
  return new Promise((resolve, reject) => {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const body = `grant_type=authorization_code&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(ZOOM_REDIRECT_URI)}`;
    const options = {
      hostname: 'zoom.us',
      path: '/oauth/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) resolve(parsed);
          else reject(new Error(parsed.reason || 'zoom_token_exchange_failed'));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Enable Chromium's speech recognition service inside Electron.
// Without these flags webkitSpeechRecognition fires a 'network' error
// because the renderer can't reach Google's speech endpoint.
app.commandLine.appendSwitch('enable-features', 'WebSpeechAPI');
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

  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const overlayWidth = 540;
  const overlayHeight = 310;

  overlayWindow = new BrowserWindow({
    width: overlayWidth,
    height: overlayHeight,
    x: Math.floor((width - overlayWidth) / 2),
    y: Math.floor((height - overlayHeight) / 2),
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
  if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://127.0.0.1'))) {
    shell.openExternal(url);
  }
});

// Zoom OAuth: start local server, open browser, exchange code for token
ipcMain.handle('zoom-start-oauth', async (_, { clientId, clientSecret }) => {
  try {
    const callbackPromise = waitForZoomCallback();
    const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(ZOOM_REDIRECT_URI)}`;
    shell.openExternal(authUrl);
    const code      = await callbackPromise;
    const tokenData = await exchangeZoomCode(code, clientId, clientSecret);
    return { success: true, tokenData };
  } catch (err) {
    return { success: false, error: err.message };
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
  // macOS: proactively request mic access so the system dialog fires before
  // the user hits the live call screen. On Windows/Linux this is a no-op.
  if (process.platform === 'darwin') {
    systemPreferences.askForMediaAccess('microphone').catch(() => {});
  }

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
