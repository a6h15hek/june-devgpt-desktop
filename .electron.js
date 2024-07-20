const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  const buildPath = path.join(__dirname, 'build');
  const indexPath = path.join(buildPath, 'index.html');

  // Check if the build folder and index.html file exist
  if (!fs.existsSync(buildPath) || !fs.existsSync(indexPath)) {
    console.error("config files not found. Exiting...");
    app.quit();
    return;
  }

  let win = new BrowserWindow({
    title: "Just Ultimate Neural Enhancer - Dynamic Enigma Vortex Generating Predictive Technology (June DevGPT++)",
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  // Load the index.html file from the build folder
  win.loadURL(`file://${indexPath}`);

  // Create a custom 'Reload' button
  let reloadButton = { label: "⟳ Reload", click: () => win.reload() };

  // Define the menu with just one option
  let menuTemplate = [ reloadButton ];

  // Create the menu from the template and set it as the window's menu
  let menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);
