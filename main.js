const { app, ipcMain, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

const size = 600;
var mainWindow;

if (require("electron-squirrel-startup")) app.quit();

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: size,
    minWidth: size,
    maxWidth: size,
    height: size,
    minHeight: size,
    maxHeight: size,
    frame: false,
    transparent: true,
    icon: path.join(__dirname, "src/gui/assets/img/favicon.ico"),
    title: "Yoo-Bot",
    darkTheme: true,
    webPreferences: {
      devTools: false,
      nodeIntegration: true,
      contextIsolation: false,
      accessibleTitle: "Yoo-Bot"
    }
  });
  mainWindow.resizable = false
  mainWindow.loadFile(path.join(__dirname, "src/gui/index.html"));
  mainWindow.once("ready-to-show", () => autoUpdater.checkForUpdatesAndNotify());
};

app.on("ready", createWindow);
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

autoUpdater.on("update-available", () => mainWindow.webContents.send("update_available"));
autoUpdater.on("update-downloaded", () => mainWindow.webContents.send("update_downloaded"));

ipcMain.on("restart", () => { autoUpdater.quitAndInstall(); });
ipcMain.on("hide", () => { mainWindow.minimize(); });
ipcMain.on("close", () => { app.quit(); });

ipcMain.on("app-version", event => event.sender.send("app-version", { version: app.getVersion() }));