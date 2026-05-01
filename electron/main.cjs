const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

const isDev = !!process.defaultApp || process.env.NODE_ENV !== 'production';
const BASE_URL = isDev
  ? 'http://localhost:5173'
  : `file://${path.join(__dirname, '../dist/index.html')}`;

// Register custom URL protocol so the web landing page can open the app.
// Web button fires: pitchbase://open  →  this app comes to the foreground.
// TODO: update 'pitchbase' to the new brand name once decided.
app.setAsDefaultProtocolClient('pitchbase');

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
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false,
  });

  mainWindow.loadURL(BASE_URL);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Windows: a second instance was launched via the protocol URL — bring existing window forward.
app.on('second-instance', () => {
  focusOrCreateWindow();
});

app.whenReady().then(() => {
  // Grant microphone (and camera) permissions so getUserMedia and
  // webkitSpeechRecognition both work without a prompt.
  const { session } = require('electron');
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    const allowed = ['media', 'microphone', 'camera', 'audioCapture', 'videoCapture'];
    callback(allowed.includes(permission));
  });
  session.defaultSession.setPermissionCheckHandler((_webContents, permission) => {
    const allowed = ['media', 'microphone', 'camera', 'audioCapture', 'videoCapture'];
    return allowed.includes(permission);
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
