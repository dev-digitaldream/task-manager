const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  onNewTask: (callback) => ipcRenderer.on('new-task', callback),
  removeNewTaskListener: (callback) => ipcRenderer.removeListener('new-task', callback)
})
