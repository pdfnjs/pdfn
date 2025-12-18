import puppeteer, { Browser, Page } from "puppeteer";

export interface BrowserManagerOptions {
  /** Max concurrent pages (default: env.PDFX_MAX_CONCURRENT || 5) */
  maxConcurrent?: number;
  /** Request timeout in ms (default: env.PDFX_TIMEOUT || 30000) */
  timeout?: number;
}

/**
 * Manages a single Puppeteer browser instance with multiple concurrent pages
 *
 * Architecture: Single browser + multiple pages (industry standard pattern)
 * - Lower memory footprint (~150MB browser + ~30MB/page)
 * - Fast page creation (~50ms vs ~1-2s for new browser)
 * - Auto-restart on browser crash/disconnect
 */
export class BrowserManager {
  private browser: Browser | null = null;
  private launching: Promise<Browser> | null = null;
  private activePages = 0;
  private maxConcurrent: number;
  private timeout: number;

  constructor(options: BrowserManagerOptions = {}) {
    this.maxConcurrent =
      options.maxConcurrent ??
      parseInt(process.env.PDFX_MAX_CONCURRENT ?? "5", 10);
    this.timeout =
      options.timeout ?? parseInt(process.env.PDFX_TIMEOUT ?? "30000", 10);
  }

  /**
   * Get or create the browser instance
   */
  async getBrowser(): Promise<Browser> {
    if (this.browser?.connected) {
      return this.browser;
    }

    // If already launching, wait for that
    if (this.launching) {
      return this.launching;
    }

    // Launch new browser
    this.launching = puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    try {
      this.browser = await this.launching;
      this.setupBrowserListeners(this.browser);
      return this.browser;
    } finally {
      this.launching = null;
    }
  }

  /**
   * Setup browser event listeners for auto-restart on crash
   */
  private setupBrowserListeners(browser: Browser): void {
    browser.on("disconnected", () => {
      this.browser = null;
      // activePages will naturally drain as withPage catches errors
    });
  }

  /**
   * Create a new page for PDF generation
   */
  async createPage(): Promise<Page> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    page.setDefaultTimeout(this.timeout);
    return page;
  }

  /**
   * Execute a function with a managed page
   *
   * This pattern ensures:
   * - Concurrency limits are respected
   * - Pages are always closed after use
   * - Active page count is accurate
   *
   * @throws Error if max concurrent pages reached
   */
  async withPage<T>(fn: (page: Page) => Promise<T>): Promise<T> {
    if (this.activePages >= this.maxConcurrent) {
      throw new Error("Server busy - max concurrent requests reached");
    }

    this.activePages++;
    let page: Page | null = null;

    try {
      page = await this.createPage();
      return await fn(page);
    } finally {
      this.activePages--;
      if (page) {
        await page.close().catch(() => {
          // Ignore close errors (browser may have disconnected)
        });
      }
    }
  }

  /**
   * Check if browser is connected
   */
  isConnected(): boolean {
    return this.browser?.connected ?? false;
  }

  /**
   * Get current number of active pages
   */
  getActivePages(): number {
    return this.activePages;
  }

  /**
   * Get max concurrent pages limit
   */
  getMaxConcurrent(): number {
    return this.maxConcurrent;
  }

  /**
   * Get configured timeout
   */
  getTimeout(): number {
    return this.timeout;
  }

  /**
   * Close the browser and clean up
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
