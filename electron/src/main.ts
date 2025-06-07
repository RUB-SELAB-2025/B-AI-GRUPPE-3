import { app, BrowserWindow, ipcMain, shell, Menu, dialog} from 'electron';
import * as path from "path";
import * as fs from 'fs';
import { omnaiscopeBackendManager } from './omnaiBackend';
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow;

function getVersionPath(): string {
  const versionPath: string = app.isPackaged 
    ? path.join(process.resourcesPath, "version.json")
    : path.join(__dirname, "..", "src", "version.json")

    return versionPath; 
}

const versionInfo = JSON.parse(fs.readFileSync(getVersionPath(), 'utf-8'));

const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    icon: "./images/icon",
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });
  const indexPath: string = path.join(__dirname, "..", "res", "angular", "browser", "index.csr.html");
  mainWindow.loadFile(indexPath).catch(err => console.error("Fehler beim Laden der HTML-Datei:", err));
};

const menuScope = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Import',
        click: async () => {console.log("Clicked File:Import")}
      },
      {
        label: 'Export',
        click: async () => {console.log("Clicked File:Export")}
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  },

    {
  label: 'Analysis',
  submenu: [
    {
      label: 'Minimum',
      click: async () => {console.log("Clicked Analysis:Minimum")}
    },
    {
      label: 'Maximum',
      click: async () => {console.log("Clicked Analysis:Maximum")}
    },
    {
      label: 'Median',
      click: async () => {console.log("Clicked Analysis:Median")}
    },
    {
      label: 'PWM',
      click: async () => {console.log("Clicked Analysis:PWM")}
    }
  ]
},
  {
    label: 'Help',
    submenu: [{
      label: 'Information',
      click: async () => {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          title: 'Information',
          message: `electron-v.${versionInfo.electronVersion}\nangular-v.${versionInfo.angularVersion}\n${versionInfo.generatedAt}\n\nMIT © ${new Date().getFullYear()} AI-Gruppe`,
          buttons: ['OK']
        })
      }
    },
      {
        label: 'Support-Website',
        click: async () => {
          shell.openExternal("https://omnaiscope.auto-intern.de/support/")
        }
      },
      {
        label: 'Developer-Tools',
        accelerator: 'CmdOrCtrl+I',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.toggleDevTools();
          }
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(menuScope);
Menu.setApplicationMenu(menu);

omnaiscopeBackendManager.startBackend();

ipcMain.handle('get-omnaiscope-backend-port', async () => {
  return omnaiscopeBackendManager.getPort();
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {

  omnaiscopeBackendManager.stopBackend();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
