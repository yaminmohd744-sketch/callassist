const { contextBridge, ipcRenderer } = require('electron');

function isValidOverlayData(data) {
  return (
    data !== null &&
    typeof data === 'object' &&
    Array.isArray(data.suggestions) &&
    typeof data.closeProbability === 'number' &&
    typeof data.callStage === 'string'
  );
}

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  launchOverlay:    () => ipcRenderer.send('launch-overlay'),
  closeOverlay:     () => ipcRenderer.send('close-overlay'),
  minimizeMain:     () => ipcRenderer.send('minimize-main'),
  pushOverlayData:  (data) => {
    if (!isValidOverlayData(data)) {
      console.error('[preload] pushOverlayData: invalid payload', data);
      return;
    }
    ipcRenderer.send('push-overlay-data', data);
  },
  restoreMain:      () => ipcRenderer.send('restore-main'),
  endCallFromOverlay: () => ipcRenderer.send('end-call-from-overlay'),
  onSuggestionsUpdate: (callback) => {
    const handler = (_, data) => {
      if (!isValidOverlayData(data)) {
        console.error('[preload] onSuggestionsUpdate: invalid payload', data);
        return;
      }
      callback(data);
    };
    ipcRenderer.on('overlay-data', handler);
    return () => ipcRenderer.removeListener('overlay-data', handler);
  },
  onOverlayClosed: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('overlay-closed', handler);
    return () => ipcRenderer.removeListener('overlay-closed', handler);
  },
  onTriggerEndCall: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('trigger-end-call', handler);
    return () => ipcRenderer.removeListener('trigger-end-call', handler);
  },
});
