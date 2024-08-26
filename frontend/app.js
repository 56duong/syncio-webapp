const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');

var win;

const createWindow = () => {
  const preloadPath = path.join(app.getAppPath(), 'preload.js');
  const indexPath = path.join(app.getAppPath(), 'dist/frontend/index.html');

  win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true, // Ensure remote module is not enabled
      nodeIntegration: false,
      partition: 'nopersist' // Disable cache by using a non-persistent session
    },
    icon: path.join(app.getAppPath(), 'dist/frontend/assets/logo-256x256.ico'),
    autoHideMenuBar: true,
  })

  win.loadFile(indexPath);

  // When loading a page fails
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load URL:', errorDescription);
  });
}


// When Electron has finished initialization
app.whenReady().then(() => {
  createWindow(); // Create the main window

  // Listen for 'reload-page' event from the renderer process
  // Example: window.electronAPI.reloadPage('/some-route')
  // window.location.reload() or window.location.href = '/some-route' WILL NOT WORK in Electron
  ipcMain.on('reload-page', (event, route) => {
    if (win) {
      const url = route 
                  ? `file://${path.join(app.getAppPath(), 'dist/frontend/index.html')}#${route}` 
                  : `file://${path.join(app.getAppPath(), 'dist/frontend/index.html')}`;

      win.loadURL(url).catch((error) => {
        console.error('Error reloading URL:', error);
      });
    }
  });
  
})

