const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  /** Send a message to the main process via channel 'reload-page' to reload the page. */
  reloadPage: (route) => ipcRenderer.send('reload-page', route),
});
