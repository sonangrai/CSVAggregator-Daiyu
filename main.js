const { app, BrowserWindow } = require("electron");
const { ipcMain } = require("electron");
const { shell } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 1300,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile("src/index.html");
  win.webContents.openDevTools();
  //win.removeMenu();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("variable-request", function (event, arg) {
  event.sender.send("variable-reply", result);
});
