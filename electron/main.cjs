const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

const isDev = !!process.defaultApp || process.env.NODE_ENV !== 'production';
const BASE_URL = isDev
  ? 'http://localhost:5173'
  : `file://${path.join(__dirname, '../dist/index.html')}`;

let mainWindow = null;
let overlayWindow = null;

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
    if (overlayWindow) {
      overlayWindow.close();
      overlayWindow = null;
    }
  });
}

function createOverlayWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  overlayWindow = new BrowserWindow({
    width: 320,
    height: 520,
    x: width - 340,
    y: Math.floor(height / 2) - 260,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // KEY FEATURE: exclude this window from screen capture
  // On Windows: uses SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE)
  // On macOS: sets NSWindowSharingNone
  overlayWindow.setContentProtection(true);

  // Keep overlay above full-screen apps (Zoom, Meet, Teams)
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  if (process.platform === 'darwin') {
    overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }

  const overlayUrl = isDev
    ? 'http://localhost:5173/?overlay=true'
    : `file://${path.join(__dirname, '../dist/index.html')}?overlay=true`;

  overlayWindow.loadURL(overlayUrl);

  overlayWindow.on('closed', () => {
    overlayWindow = null;
    // Notify main window that overlay was closed
    if (mainWindow) {
      mainWindow.webContents.send('overlay-closed');
    }
  });
}

// Toggle overlay on/off
ipcMain.handle('toggle-overlay', () => {
  if (overlayWindow) {
    overlayWindow.close();
    overlayWindow = null;
    return false;
  }
  createOverlayWindow();
  return true;
});

// Forward AI data from main window → overlay
ipcMain.on('suggestions-update', (_, data) => {
  if (overlayWindow) {
    overlayWindow.webContents.send('suggestions-update', data);
  }
});

// Overlay requests to close itself
ipcMain.on('close-overlay', () => {
  if (overlayWindow) {
    overlayWindow.close();
    overlayWindow = null;
  }
});

app.whenReady().then(() => {
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
