import axios from 'axios';
import * as cheerio from 'cheerio';
import { createObjectCsvWriter } from 'csv-writer';
import * as path from 'path';

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
    try {
      const allData: TableRow[] = [];
      let headers: string[] = [];
      const totalPages = this.config.endPage - this.config.startPage + 1;

      for (let page = this.config.startPage; page <= this.config.endPage; page++) {
        this.updateProgress(page - this.config.startPage + 1, totalPages, `Scraping page ${page}...`);

        const url = `${this.config.baseUrl}#page=${page}`;

        try {
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          });

          const $ = cheerio.load(response.data);

          // Find the table
          const table = $('table').first();

          if (table.length === 0) {
            console.warn(`No table found on page ${page}`);
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
          console.error(`Error scraping page ${page}:`, error);
          this.updateProgress(page - this.config.startPage + 1, totalPages, `Error on page ${page}`);
        }
      }

      // Write to CSV
      if (allData.length === 0) {
        throw new Error('No data was scraped from the website');
      }

      this.updateProgress(totalPages, totalPages, 'Writing to CSV...');

      const csvWriter = createObjectCsvWriter({
        path: this.config.outputPath,
        header: headers.map(h => ({ id: h, title: h }))
      });

      await csvWriter.writeRecords(allData);

      this.updateProgress(totalPages, totalPages, `Complete! Scraped ${allData.length} rows to ${this.config.outputPath}`);

    } catch (error) {
      throw new Error(`Scraping failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
