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
  openExternal:     (url) => ipcRenderer.send('open-external', url),
  launchOverlay:    () => ipcRenderer.send('launch-overlay'),
  closeOverlay:     () => ipcRenderer.send('close-overlay'),
  minimizeMain:     () => ipcRenderer.send('minimize-main'),
  pushOverlayData:  (data) => {
    if (!isValidOverlayData(data)) {
      console.error('[preload] pushOverlayData: invalid payload', data);
      return;
    }
    // Guard against oversized payloads that could hang the overlay process
    const size = JSON.stringify(data).length;
    if (size > 512_000) {
      console.error('[preload] pushOverlayData: payload too large', size);
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
  onOAuthCallback: (callback) => {
    const handler = (_, url) => callback(url);
    ipcRenderer.on('oauth-callback', handler);
    return () => ipcRenderer.removeListener('oauth-callback', handler);
  },
  onOAuthCode: (callback) => {
    const handler = (_, code) => callback(code);
    ipcRenderer.on('oauth-callback-code', handler);
    return () => ipcRenderer.removeListener('oauth-callback-code', handler);
  },
});
