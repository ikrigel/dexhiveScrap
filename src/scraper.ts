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
      await page.goto(this.config.baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForSelector('table', { timeout: 10000 });

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

            // Wait for content to update
            await new Promise(resolve => setTimeout(resolve, 2000));
            await page.waitForSelector('table', { timeout: 10000 });
          }

          // Get the HTML content after JavaScript has executed
          const htmlContent = await page.content();
          const $ = cheerio.load(htmlContent);

          // Find the table
          const table = $('table').first();

          if (table.length === 0) {
            console.warn(`No table found on page ${pageNum}`);
            continue;
          }

          // Extract headers from the first page only
          if (headers.length === 0) {
            table.find('thead tr th, thead tr td, tbody tr:first th').each((_, element) => {
              const headerText = $(element).text().trim();
              if (headerText) {
                headers.push(headerText);
              }
            });

            // If no headers in thead, try first row of tbody
            if (headers.length === 0) {
              table.find('tbody tr:first td, tr:first td').each((_, element) => {
                headers.push($(element).text().trim() || `Column ${headers.length + 1}`);
              });
            }
          }

          // Extract data rows
          table.find('tbody tr, tr').each((index, row) => {
            // Skip header row if it's in tbody
            if (index === 0 && headers.length === 0) return;

            const rowData: TableRow = {};
            $(row).find('td').each((colIndex, cell) => {
              const headerKey = headers[colIndex] || `Column ${colIndex + 1}`;
              rowData[headerKey] = $(cell).text().trim();
            });

            // Only add row if it has data
            if (Object.keys(rowData).length > 0) {
              allData.push(rowData);
            }
          });

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
