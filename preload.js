const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendQuestion: (question) => ipcRenderer.send('question', question),
  onResponse: (callback) => ipcRenderer.on('response', callback)
});
