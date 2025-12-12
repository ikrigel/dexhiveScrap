const { ipcRenderer } = require('electron');

// DOM elements
const urlInput = document.getElementById('url');
const startPageInput = document.getElementById('startPage');
const endPageInput = document.getElementById('endPage');
const filePathInput = document.getElementById('filePath');
const selectFileBtn = document.getElementById('selectFileBtn');
const startBtn = document.getElementById('startBtn');
const cancelBtn = document.getElementById('cancelBtn');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const statusMessage = document.getElementById('statusMessage');

let isScrapingInProgress = false;

// Select file button handler
selectFileBtn.addEventListener('click', async () => {
  const filePath = await ipcRenderer.invoke('select-file');
  if (filePath) {
    filePathInput.value = filePath;
  }
});

// Start scraping button handler
startBtn.addEventListener('click', async () => {
  // Validate inputs
  const url = urlInput.value.trim();
  const startPage = parseInt(startPageInput.value);
  const endPage = parseInt(endPageInput.value);
  const filePath = filePathInput.value.trim();

  if (!url) {
    showStatus('Please enter a website URL', 'error');
    return;
  }

  if (startPage < 1 || endPage < 1 || startPage > endPage) {
    showStatus('Please enter valid page numbers', 'error');
    return;
  }

  if (!filePath) {
    showStatus('Please select an output file location', 'error');
    return;
  }

  // Start scraping
  isScrapingInProgress = true;
  startBtn.disabled = true;
  progressContainer.style.display = 'block';
  statusMessage.style.display = 'none';
  progressFill.style.width = '0%';
  progressText.textContent = 'Starting...';

  const config = {
    baseUrl: url,
    startPage: startPage,
    endPage: endPage,
    outputPath: filePath
  };

  const result = await ipcRenderer.invoke('start-scraping', config);

  if (result.success) {
    showStatus('Scraping completed successfully!', 'success');
  } else {
    showStatus(`Error: ${result.error}`, 'error');
  }

  isScrapingInProgress = false;
  startBtn.disabled = false;
  progressContainer.style.display = 'none';
});

// Listen for progress updates
ipcRenderer.on('scraping-progress', (event, data) => {
  const { current, total, message } = data;
  const percentage = (current / total) * 100;

  progressFill.style.width = `${percentage}%`;
  progressText.textContent = message;
});

// Show status message
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.style.display = 'block';

  if (type === 'success') {
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 5000);
  }
}
