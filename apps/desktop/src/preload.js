const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('coreAPI', {
  executeCLI: (command, prompt, modelStr) => ipcRenderer.invoke('execute-cli', { command, prompt, modelStr }),
  
  // Real-time Streaming API
  triggerCLIStream: (id, command, prompt, modelStr) => {
    ipcRenderer.send('execute-cli-stream', { id, command, prompt, modelStr });
  },
  onCLIStreamData: (callback) => {
    ipcRenderer.on('cli-stream-data', (event, data) => callback(data));
  },
  onCLIStreamDone: (callback) => {
    ipcRenderer.on('cli-stream-done', (event, data) => callback(data));
  }
});
