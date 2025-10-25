const { app, BrowserWindow, globalShortcut, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 460,
    height: 220,
    x: 1000,
    y: 80,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  try {
    win.setContentProtection(true);
  } catch (e) {
    console.warn('setContentProtection not supported', e);
  }

  win.loadFile(path.join(__dirname, 'index.html'));

  // Attempt to call Win32 API for display affinity (Windows only)
  try {
    if (process.platform === 'win32') {
      const { setWindowAffinity } = require('./win32-display');
      const nativeHandle = win.getNativeWindowHandle();
      // affinity = 1 (WDA_MONITOR) is broadly supported; experiment if needed.
      const result = setWindowAffinity(nativeHandle, 1);
      console.log('setWindowAffinity result:', result);
    }
  } catch (e) {
    console.warn('Error setting window affinity', e);
  }

  // Global shortcuts
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    if (!win) return;
    if (win.isVisible()) win.hide();
    else win.show();
  });

  globalShortcut.register('CommandOrControl+Shift+R', () => {
    if (!win) return;
    win.webContents.send('show-sample-response', { text: 'Sugerencia generada por IA (demo)' });
  });

  win.on('closed', () => {
    win = null;
  });
}

app.whenReady().then(createWindow);

ipcMain.handle('save-settings', async (event, settings) => {
  // settings: { provider, providerUrl, apiKey, model }
  const envPath = path.join(app.getPath('userData'), 'settings.json');
  try {
    fs.writeFileSync(envPath, JSON.stringify(settings, null, 2), 'utf-8');
    return { ok: true, path: envPath };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
});

ipcMain.handle('load-settings', async () => {
  const envPath = path.join(app.getPath('userData'), 'settings.json');
  try {
    if (!fs.existsSync(envPath)) return { ok: true, settings: null };
    const content = fs.readFileSync(envPath, 'utf-8');
    return { ok: true, settings: JSON.parse(content) };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
