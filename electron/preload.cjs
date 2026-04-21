const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  launchOverlay:    () => ipcRenderer.send('launch-overlay'),
  closeOverlay:     () => ipcRenderer.send('close-overlay'),
  minimizeMain:     () => ipcRenderer.send('minimize-main'),
  pushOverlayData:  (data) => ipcRenderer.send('push-overlay-data', data),
  onSuggestionsUpdate: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('overlay-data', handler);
    return () => ipcRenderer.removeListener('overlay-data', handler);
  },
  onOverlayClosed: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('overlay-closed', handler);
    return () => ipcRenderer.removeListener('overlay-closed', handler);
  },
});
