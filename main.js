const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let phpServer;

function startPHPServer() {
  // Iniciar el servidor PHP en el puerto 3000
  phpServer = spawn('php', ['-S', 'localhost:3000'], {
    cwd: __dirname
  });

  phpServer.stdout.on('data', (data) => {
    console.log(`PHP Server: ${data}`);
  });

  phpServer.stderr.on('data', (data) => {
    console.error(`PHP Server Error: ${data}`);
  });
}

function createWindow() {
  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Cargar la URL local
  mainWindow.loadURL('http://localhost:3000/index.php');

  // Abrir DevTools en modo desarrollo
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Manejar el cierre de la ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Cuando la aplicación está lista
app.whenReady().then(() => {
  startPHPServer();
  setTimeout(createWindow, 1000); // Dar tiempo al servidor PHP para iniciar

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Manejar el cierre de la aplicación
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (phpServer) {
      phpServer.kill();
    }
    app.quit();
  }
});

// Manejar la activación de la aplicación en macOS
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
}); 