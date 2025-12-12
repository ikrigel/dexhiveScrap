import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { DexHiveScraper, ScraperConfig } from './scraper';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../src/renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle file save dialog
ipcMain.handle('select-file', async () => {
  if (!mainWindow) return null;

  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save CSV File',
    defaultPath: 'dexhive_data.csv',
    filters: [
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled) {
    return null;
  }

  return result.filePath;
});

// Handle scraping
ipcMain.handle('start-scraping', async (event, config: ScraperConfig) => {
  try {
    const scraper = new DexHiveScraper(config);

    // Set up progress callback
    scraper.setProgressCallback((current, total, message) => {
      if (mainWindow) {
        mainWindow.webContents.send('scraping-progress', { current, total, message });
      }
    });

    await scraper.scrape();

    return { success: true };
  } catch (error) {
    console.error('Scraping error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
});
