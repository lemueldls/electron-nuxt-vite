import path from "path";

import { app, BrowserWindow } from "electron";

const isProduction = process.env.NODE_ENV === "production";

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {},
  });

  if (isProduction)
    win.loadFile(path.resolve(process.cwd(), "renderer/dist/index.html"));
  else {
    win.loadURL("http://localhost:3000");

    win.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
