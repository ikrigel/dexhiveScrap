# Quick Start Guide

## How to Run the DexHive Scraper

### Step 1: Install Node.js

1. Download Node.js from https://nodejs.org/
2. Choose the LTS (Long Term Support) version
3. Run the installer and follow the prompts
4. Verify installation by opening a terminal and running:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Install Dependencies

Open a terminal in the project folder and run:

```bash
cd C:\Users\ikrig\dexhiveScrap
npm install
```

This will install all required packages (may take a few minutes).

### Step 3: Run the Application

```bash
npm run dev
```

A window will open with the DexHive Scraper interface.

### Step 4: Use the Application

1. **Website URL** is pre-filled with the DexHive URL
2. **Start Page**: Leave as 1 (or change if needed)
3. **End Page**: Leave as 15 (or change to scrape fewer pages)
4. Click **"Select File"** and choose where to save the CSV
5. Click **"Start Scraping"**
6. Wait for the progress bar to complete
7. Open your CSV file when done!

## Testing the Application

### Test 1: Small Range
- Set Start Page: 1
- Set End Page: 2
- This will scrape only 2 pages (faster for testing)

### Test 2: Full Range
- Set Start Page: 1
- Set End Page: 15
- This will scrape all pages (may take 1-2 minutes)

### Test 3: Verify CSV Output
- Open the generated CSV file in Excel or Google Sheets
- Check that:
  - First row contains headers (column names)
  - Data rows contain the table information
  - All pages are included

## Expected Results

The CSV file should contain:
- Table headers in the first row
- One row per table entry
- All data from pages 1-15 (or your specified range)

## Troubleshooting

**If npm install fails:**
- Make sure Node.js is installed
- Try running terminal as Administrator

**If the app doesn't open:**
- Check that `npm install` completed successfully
- Look for error messages in the terminal

**If no data is scraped:**
- Check your internet connection
- Verify the website is accessible in your browser

**If you get permission errors:**
- Make sure you have write permission to the selected folder
- Try saving to your Documents folder

## Need Help?

Check the full [README.md](README.md) for more detailed information.
