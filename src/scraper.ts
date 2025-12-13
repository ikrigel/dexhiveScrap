import * as cheerio from 'cheerio';
import { createObjectCsvWriter } from 'csv-writer';
import puppeteer from 'puppeteer';

export interface ScraperConfig {
  baseUrl: string;
  startPage: number;
  endPage: number;
  outputPath: string;
}

export interface TableRow {
  [key: string]: string;
}

export class DexHiveScraper {
  private config: ScraperConfig;
  private progressCallback?: (current: number, total: number, message: string) => void;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  setProgressCallback(callback: (current: number, total: number, message: string) => void) {
    this.progressCallback = callback;
  }

  private updateProgress(current: number, total: number, message: string) {
    if (this.progressCallback) {
      this.progressCallback(current, total, message);
    }
  }

  async scrape(): Promise<void> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const allData: TableRow[] = [];
      let headers: string[] = [];
      const totalPages = this.config.endPage - this.config.startPage + 1;
      const page = await browser.newPage();

      // Set viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Navigate to the base page first
      await page.goto(this.config.baseUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      // Wait for the table to appear (might take time for JS to load)
      await page.waitForSelector('table', { timeout: 30000 });

      // Extra wait to ensure content is fully loaded
      await new Promise(resolve => setTimeout(resolve, 3000));

      for (let pageNum = this.config.startPage; pageNum <= this.config.endPage; pageNum++) {
        this.updateProgress(pageNum - this.config.startPage + 1, totalPages, `Scraping page ${pageNum}...`);

        try {
          // If not the first page, navigate to the specific page
          if (pageNum > this.config.startPage) {
            // Update the hash to trigger page change
            await page.evaluate((num: number) => {
              // @ts-ignore - window exists in browser context
              window.location.hash = `page=${num}`;
            }, pageNum);

            // Wait for content to update (increased wait time)
            await new Promise(resolve => setTimeout(resolve, 4000));
            await page.waitForSelector('table', { timeout: 30000 });
          }

          // Get the HTML content after JavaScript has executed
          const htmlContent = await page.content();
          const $ = cheerio.load(htmlContent);

          // The page structure is: each person/entry is displayed as a card with multiple table rows
          // Each row has 2 cells: [field name, field value]
          // We need to find all tables and extract data from each as a separate entry

          let rowsOnPage = 0;

          // Find all tables that contain entry data
          $('table.shrink').each((_, table) => {
            const entryData: TableRow = {};
            let hasData = false;

            // Each table represents one person/entry
            // Each row in the table has: <td>field label</td><td>field value</td>
            $(table).find('tbody tr').each((_, row) => {
              const cells = $(row).find('td');

              if (cells.length === 2) {
                // First cell is the field label, second is the value
                const fieldLabel = $(cells[0]).find('div').first().text().trim();
                const fieldValue = $(cells[1]).text().trim();

                if (fieldLabel && fieldValue) {
                  entryData[fieldLabel] = fieldValue;
                  hasData = true;

                  // Collect unique headers
                  if (!headers.includes(fieldLabel)) {
                    headers.push(fieldLabel);
                  }
                }
              }
            });

            // Add this entry if it has data
            if (hasData && Object.keys(entryData).length > 0) {
              allData.push(entryData);
              rowsOnPage++;
            }
          });

          console.log(`Page ${pageNum}: Found ${rowsOnPage} entries (Total: ${allData.length}, Headers: ${headers.length})`);

          // Add delay between requests to be respectful
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`Error scraping page ${pageNum}:`, error);
          this.updateProgress(pageNum - this.config.startPage + 1, totalPages, `Error on page ${pageNum}`);
        }
      }

      // Write to CSV
      if (allData.length === 0) {
        throw new Error('No data was scraped from the website');
      }

      this.updateProgress(totalPages, totalPages, 'Writing to CSV...');

      const csvWriter = createObjectCsvWriter({
        path: this.config.outputPath,
        header: headers.map(h => ({ id: h, title: h })),
        encoding: 'utf8',
        append: false,
        alwaysQuote: true
      });

      await csvWriter.writeRecords(allData);

      // Add UTF-8 BOM for Excel compatibility with Hebrew
      const fs = require('fs');
      const content = fs.readFileSync(this.config.outputPath);
      const BOM = '\uFEFF';
      fs.writeFileSync(this.config.outputPath, BOM + content.toString('utf8'));

      this.updateProgress(totalPages, totalPages, `Complete! Scraped ${allData.length} rows to ${this.config.outputPath}`);

    } catch (error) {
      throw new Error(`Scraping failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      await browser.close();
    }
  }
}
