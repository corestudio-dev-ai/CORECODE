const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    // We can add a custom title bar styling later!
    titleBarStyle: 'hiddenInset' 
  });

  // Load the local Next.js server in development
  // In production, we would load the dumped static HTML build
  mainWindow.loadURL('http://localhost:3000');
  
  // Optionally open devtools
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Legacy Buffer Handler
ipcMain.handle('execute-cli', async (event, args) => {
  const { command, prompt, modelStr } = args;
  
  return new Promise((resolve, reject) => {
    const safePrompt = prompt.replace(/"/g, '\\"');
    const fullCommand = modelStr ? `${command} "${safePrompt}" --model ${modelStr}` : `${command} "${safePrompt}"`;
    
    exec(fullCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`CLI execution error: ${error.message}`);
        resolve({ error: error.message, stderr });
        return;
      }
      resolve({ stdout });
    });
  });
});

// Native Streaming Handler
ipcMain.on('execute-cli-stream', (event, { id, command, prompt, modelStr }) => {
  const safePrompt = prompt.replace(/"/g, '\\"');
  let spawnArgs = [safePrompt];
  if (modelStr) {
    spawnArgs.push('--model');
    spawnArgs.push(modelStr);
  }
  
  // Use spawn securely mapped through shell to enable path resolution
  const child = spawn(command, spawnArgs, { shell: true });

  child.stdout.on('data', (data) => {
    event.sender.send('cli-stream-data', { id, chunk: data.toString() });
  });

  child.stderr.on('data', (data) => {
    // Treat stderr as standard output blocks internally for these CLIs since they often pipe debug there
    event.sender.send('cli-stream-data', { id, chunk: data.toString() });
  });

  child.on('close', (code) => {
    event.sender.send('cli-stream-done', { id, code });
  });

  child.on('error', (err) => {
    event.sender.send('cli-stream-data', { id, chunk: `[Process Error]: ${err.message}` });
    event.sender.send('cli-stream-done', { id, code: 1 });
  });
});
