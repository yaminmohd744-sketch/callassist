const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,

  // Main window → toggle overlay on/off, returns new state (true = open)
  toggleOverlay: () => ipcRenderer.invoke('toggle-overlay'),

  // Main window → push live AI data to overlay
  sendSuggestionsToOverlay: (data) => ipcRenderer.send('suggestions-update', data),

  // Main window → listen for overlay being closed externally
  onOverlayClosed: (callback) => {
    ipcRenderer.on('overlay-closed', () => callback());
    return () => ipcRenderer.removeAllListeners('overlay-closed');
  },

  // Overlay → receive AI data from main window
  onSuggestionsUpdate: (callback) => {
    ipcRenderer.on('suggestions-update', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('suggestions-update');
  },

  // Overlay → close itself
  closeOverlay: () => ipcRenderer.send('close-overlay'),
});
