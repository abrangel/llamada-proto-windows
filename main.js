const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fetch = require('node-fetch'); // You might need to install node-fetch: npm install node-fetch

let serverProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 600,
    x: 1200,
    y: 100,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Enable context isolation for security
      nodeIntegration: false // Disable Node.js integration in the renderer process
    }
  });

  win.loadFile('index.html');

  try {
    win.setContentProtection(true);
  } catch (e) {
    console.warn('setContentProtection not supported', e);
  }

  try {
    if (process.platform === 'win32') {
      const { setWindowAffinity } = require('./win32-display');
      const nativeHandle = win.getNativeWindowHandle();
      const result = setWindowAffinity(nativeHandle, 1);
      console.log('setWindowAffinity result:', result);
    }
  } catch (e) {
    console.warn('Error setting window affinity', e);
  }

  globalShortcut.register('CommandOrControl+Shift+H', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
  });
}

ipcMain.on('question', async (event, question) => {
  // IMPORTANT: Replace this with a secure way of getting the API key
  const apiKey = 'YOUR_GEMINI_API_KEY';

  try {
    const response = await fetch('http://localhost:3000/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question, apiKey })
    });

    const data = await response.json();
    event.sender.send('response', data.response);
  } catch (error) {
    console.error(error);
    event.sender.send('response', 'Error getting response from the server.');
  }
});

app.whenReady().then(() => {
  serverProcess = spawn('node', [path.join(__dirname, 'server.js')]);

  serverProcess.stdout.on('data', (data) => {
    console.log(`server: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`server error: ${data}`);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    serverProcess.kill();
    app.quit();
  }
});
