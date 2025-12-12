# DexHive Table Scraper

A desktop application built with Electron and TypeScript that scrapes table data from the DexHive website and exports it to CSV format.

## Features

- GUI interface for easy operation
- Scrapes table data from multiple pages
- Exports data to CSV with headers
- Progress tracking during scraping
- File selection dialog for output location
- Built with TypeScript for type safety

## Prerequisites

Before running this application, you need to have installed:

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ikrigel/dexhiveScrap.git
cd dexhiveScrap
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

To run the application in development mode:

```bash
npm run dev
```

This will:
1. Compile the TypeScript files
2. Launch the Electron application

### Production Mode

To build and run:

```bash
npm run build
npm start
```

## How to Use the Application

1. **Launch the application** using one of the commands above

2. **Configure the scraping settings:**
   - **Website URL**: Pre-filled with the DexHive URL (you can modify if needed)
   - **Start Page**: Enter the starting page number (default: 1)
   - **End Page**: Enter the ending page number (default: 15)

3. **Select output location:**
   - Click the "Select File" button
   - Choose where to save the CSV file
   - Enter a filename (e.g., `dexhive_data.csv`)

4. **Start scraping:**
   - Click the "Start Scraping" button
   - Watch the progress bar as pages are scraped
   - Wait for completion message

5. **Access your data:**
   - Open the saved CSV file with Excel, Google Sheets, or any CSV viewer
   - The file will include all table headers and data from the specified pages

## Testing the Application

### Manual Testing Steps

1. **Test with default settings:**
   - Use default URL and pages 1-15
   - Save to a test location
   - Verify CSV is created with data

2. **Test with custom page range:**
   - Set Start Page: 1
   - Set End Page: 3
   - Save and verify only 3 pages of data

3. **Test error handling:**
   - Try without selecting a file (should show error)
   - Try with invalid page numbers (should show error)

4. **Verify CSV output:**
   - Open the generated CSV file
   - Check that headers are present in the first row
   - Verify data is properly formatted
   - Ensure all expected pages are included

## Building for Distribution

To create an executable for Windows:

```bash
npm run package
```

The built application will be in the `release` folder.

## Project Structure

```
dexhiveScrap/
├── src/
│   ├── main.ts              # Electron main process
│   ├── scraper.ts           # Web scraping logic
│   └── renderer/
│       ├── index.html       # GUI interface
│       ├── styles.css       # Styling
│       └── renderer.js      # Frontend logic
├── dist/                    # Compiled JavaScript (generated)
├── release/                 # Built application (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Technologies Used

- **Electron**: Desktop application framework
- **TypeScript**: Type-safe JavaScript
- **Axios**: HTTP requests
- **Cheerio**: HTML parsing and scraping
- **csv-writer**: CSV file generation

## Deploying to GitHub

The repository is already connected to GitHub. To push your changes:

```bash
git add .
git commit -m "Initial commit - DexHive scraper application"
git push origin main
```

If you need to set up the remote (first time):

```bash
git remote add origin https://github.com/ikrigel/dexhiveScrap.git
git branch -M main
git push -u origin main
```

## Note About Vercel Deployment

**Important**: This is a desktop Electron application, not a web application. It **cannot be deployed to Vercel** as Vercel is designed for web applications (Next.js, React, etc.).

Instead, you can:

1. **Distribute the desktop app**: Build the executable and share it directly
2. **Convert to web app**: If you want to deploy to Vercel, you would need to:
   - Create a separate web version using Next.js or React
   - Create a backend API (using Next.js API routes or a separate Node.js server)
   - The frontend would call the backend API to perform scraping
   - Note: Web scraping from a browser has CORS limitations

If you want a web-based version for Vercel, I can help you create that as a separate project.

## Troubleshooting

### "npm: command not found"
- Install Node.js from https://nodejs.org/

### Application won't start
- Make sure you ran `npm install` first
- Check that all dependencies installed correctly
- Try deleting `node_modules` and running `npm install` again

### No data scraped
- Check your internet connection
- Verify the website URL is correct
- The website structure may have changed (HTML selectors may need updating)

### CSV file is empty
- Ensure the website table structure matches expected format
- Check console for error messages

## License

ISC

## Author

Created for scraping DexHive table data
