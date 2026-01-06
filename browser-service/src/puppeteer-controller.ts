import puppeteer, { Browser, Page } from 'puppeteer';
import { EventEmitter } from 'events';
import { sessionManager, BrowserSession, SessionStep } from './session-manager';

interface BrowserInstance {
  browser: Browser;
  page: Page;
  session: BrowserSession;
  isPaused: boolean;
  shouldStop: boolean;
}

interface PageInfo {
  url: string;
  title: string;
  content: string;
}

class PuppeteerController extends EventEmitter {
  private instances: Map<string, BrowserInstance> = new Map();
  private isMac: boolean;

  constructor() {
    super();
    this.isMac = process.platform === 'darwin';
    this.setupSessionListeners();
  }

  private setupSessionListeners() {
    sessionManager.on('session:control_changed', ({ sessionId, controller }) => {
      const instance = this.instances.get(sessionId);
      if (instance) {
        if (controller === 'USER') {
          instance.isPaused = true;
          console.log(`[PuppeteerController] Pausing automation for session ${sessionId} - user took control`);
        } else {
          instance.isPaused = false;
          console.log(`[PuppeteerController] Resuming automation for session ${sessionId} - AI has control`);
          this.emit('resume', sessionId);
        }
      }
    });

    sessionManager.on('session:paused', ({ sessionId }) => {
      const instance = this.instances.get(sessionId);
      if (instance) {
        instance.isPaused = true;
      }
    });

    sessionManager.on('session:resumed', ({ sessionId }) => {
      const instance = this.instances.get(sessionId);
      if (instance) {
        instance.isPaused = false;
        this.emit('resume', sessionId);
      }
    });
  }

  async launchBrowser(session: BrowserSession): Promise<void> {
    console.log(`[PuppeteerController] Launching browser for session ${session.id} (platform: ${process.platform})`);

    try {
      // Mac-compatible launch options (no Xvfb needed)
      const launchOptions: any = {
        headless: false, // Show browser window for live viewing
        defaultViewport: {
          width: 1920,
          height: 1080,
        },
        args: [
          '--window-size=1920,1080',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
        ],
      };

      // Add Linux-specific args only when not on Mac
      if (!this.isMac) {
        const displayNum = session.displayNum || 99;
        launchOptions.args.push(
          `--display=:${displayNum}`,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        );
      }

      const browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();
      
      // Set timeouts
      page.setDefaultTimeout(30000);
      page.setDefaultNavigationTimeout(30000);

      // Enable request interception for better control
      await page.setRequestInterception(false);

      const instance: BrowserInstance = {
        browser,
        page,
        session,
        isPaused: false,
        shouldStop: false,
      };

      this.instances.set(session.id, instance);
      sessionManager.updateSessionState(session.id, 'AI_CONTROL');

      // Navigate to initial URL if provided
      if (session.url) {
        await this.navigateTo(session.id, session.url);
      }

      console.log(`[PuppeteerController] Browser launched successfully for session ${session.id}`);
      this.emit('browser:launched', { sessionId: session.id });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[PuppeteerController] Failed to launch browser: ${errorMessage}`);
      sessionManager.setError(session.id, `Failed to launch browser: ${errorMessage}`);
      throw error;
    }
  }

  async navigateTo(sessionId: string, url: string): Promise<void> {
    const instance = this.instances.get(sessionId);
    if (!instance) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      console.log(`[PuppeteerController] Navigating to ${url}`);
      await instance.page.goto(url, { waitUntil: 'networkidle2' });
      
      sessionManager.addStep(sessionId, {
        action: `Navigate to ${url}`,
        result: 'Successfully loaded page',
        status: 'completed',
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sessionManager.addStep(sessionId, {
        action: `Navigate to ${url}`,
        result: `Failed: ${errorMessage}`,
        status: 'failed',
      });
      throw error;
    }
  }

  async executeStep(sessionId: string, action: string, script?: string): Promise<SessionStep | undefined> {
    const instance = this.instances.get(sessionId);
    if (!instance) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Wait if paused (user has control)
    while (instance.isPaused && !instance.shouldStop) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (instance.shouldStop) {
      return undefined;
    }

    try {
      console.log(`[PuppeteerController] Executing step: ${action}`);
      
      let result = 'Step completed';
      
      if (script) {
        result = await instance.page.evaluate(script);
      }

      const screenshot = await instance.page.screenshot({ encoding: 'base64' });

      const step = sessionManager.addStep(sessionId, {
        action,
        result: typeof result === 'string' ? result : JSON.stringify(result),
        status: 'completed',
        screenshot: `data:image/png;base64,${screenshot}`,
      });

      return step;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const step = sessionManager.addStep(sessionId, {
        action,
        result: `Failed: ${errorMessage}`,
        status: 'failed',
      });

      return step;
    }
  }

  async click(sessionId: string, selector: string): Promise<void> {
    const instance = this.instances.get(sessionId);
    if (!instance) throw new Error(`Session ${sessionId} not found`);

    while (instance.isPaused && !instance.shouldStop) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      // Try multiple selector strategies
      await this.smartClick(instance.page, selector);
      
      sessionManager.addStep(sessionId, {
        action: `Click on ${selector}`,
        result: 'Clicked successfully',
        status: 'completed',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sessionManager.addStep(sessionId, {
        action: `Click on ${selector}`,
        result: `Failed: ${errorMessage}`,
        status: 'failed',
      });
      throw error;
    }
  }

  // Smart click that tries multiple selector strategies
  private async smartClick(page: Page, selector: string): Promise<void> {
    // Strategy 1: Direct CSS selector
    try {
      await page.click(selector);
      return;
    } catch (e) {}

    // Strategy 2: XPath
    try {
      const [element] = await page.$x(selector);
      if (element) {
        await element.click();
        return;
      }
    } catch (e) {}

    // Strategy 3: Text content match
    try {
      const textSelector = selector.replace(/^.*:contains\(['"](.+)['"]\).*$/, '$1');
      if (textSelector !== selector) {
        await page.evaluate((text) => {
          const elements = document.querySelectorAll('button, a, input[type="submit"], [role="button"]');
          for (const el of elements) {
            if (el.textContent?.toLowerCase().includes(text.toLowerCase())) {
              (el as HTMLElement).click();
              return;
            }
          }
          throw new Error(`No element found with text: ${text}`);
        }, textSelector);
        return;
      }
    } catch (e) {}

    // Strategy 4: Aria label
    try {
      await page.click(`[aria-label="${selector}"]`);
      return;
    } catch (e) {}

    throw new Error(`Could not find element: ${selector}`);
  }

  async type(sessionId: string, selector: string, text: string): Promise<void> {
    const instance = this.instances.get(sessionId);
    if (!instance) throw new Error(`Session ${sessionId} not found`);

    while (instance.isPaused && !instance.shouldStop) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      // Clear existing content first
      await instance.page.click(selector, { clickCount: 3 });
      await instance.page.type(selector, text);
      
      sessionManager.addStep(sessionId, {
        action: `Type into ${selector}`,
        result: 'Text entered successfully',
        status: 'completed',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      sessionManager.addStep(sessionId, {
        action: `Type into ${selector}`,
        result: `Failed: ${errorMessage}`,
        status: 'failed',
      });
      throw error;
    }
  }

  async scroll(sessionId: string, direction: 'up' | 'down'): Promise<void> {
    const instance = this.instances.get(sessionId);
    if (!instance) throw new Error(`Session ${sessionId} not found`);

    while (instance.isPaused && !instance.shouldStop) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const scrollAmount = direction === 'down' ? 500 : -500;
    await instance.page.evaluate((amount) => {
      window.scrollBy(0, amount);
    }, scrollAmount);

    sessionManager.addStep(sessionId, {
      action: `Scroll ${direction}`,
      result: `Scrolled ${direction} by 500px`,
      status: 'completed',
    });
  }

  async pressKey(sessionId: string, key: string): Promise<void> {
    const instance = this.instances.get(sessionId);
    if (!instance) throw new Error(`Session ${sessionId} not found`);

    await instance.page.keyboard.press(key as any);
    
    sessionManager.addStep(sessionId, {
      action: `Press key: ${key}`,
      result: 'Key pressed',
      status: 'completed',
    });
  }

  async waitForSelector(sessionId: string, selector: string, timeout: number = 30000): Promise<void> {
    const instance = this.instances.get(sessionId);
    if (!instance) throw new Error(`Session ${sessionId} not found`);

    await instance.page.waitForSelector(selector, { timeout });
  }

  async wait(sessionId: string, ms: number = 2000): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
    
    sessionManager.addStep(sessionId, {
      action: `Wait ${ms}ms`,
      result: 'Wait completed',
      status: 'completed',
    });
  }

  async getScreenshot(sessionId: string): Promise<string> {
    const instance = this.instances.get(sessionId);
    if (!instance) throw new Error(`Session ${sessionId} not found`);

    const screenshot = await instance.page.screenshot({ encoding: 'base64' });
    return `data:image/png;base64,${screenshot}`;
  }

  async getPageInfo(sessionId: string): Promise<PageInfo> {
    const instance = this.instances.get(sessionId);
    if (!instance) throw new Error(`Session ${sessionId} not found`);

    const url = instance.page.url();
    const title = await instance.page.title();
    
    // Get simplified page content for LLM
    const content = await instance.page.evaluate(() => {
      // Get all interactive elements
      const interactiveElements: string[] = [];
      
      // Buttons
      document.querySelectorAll('button').forEach((el, i) => {
        const text = el.textContent?.trim() || el.getAttribute('aria-label') || '';
        if (text) interactiveElements.push(`[Button ${i}]: ${text}`);
      });
      
      // Links
      document.querySelectorAll('a').forEach((el, i) => {
        const text = el.textContent?.trim() || '';
        const href = el.getAttribute('href') || '';
        if (text) interactiveElements.push(`[Link ${i}]: ${text} (${href})`);
      });
      
      // Inputs
      document.querySelectorAll('input, textarea').forEach((el, i) => {
        const type = el.getAttribute('type') || 'text';
        const placeholder = el.getAttribute('placeholder') || '';
        const name = el.getAttribute('name') || '';
        interactiveElements.push(`[Input ${i}]: ${type} - ${name || placeholder}`);
      });

      return interactiveElements.join('\n');
    });

    return { url, title, content };
  }

  async getPageContent(sessionId: string): Promise<string> {
    const instance = this.instances.get(sessionId);
    if (!instance) throw new Error(`Session ${sessionId} not found`);

    return await instance.page.content();
  }

  async getPageUrl(sessionId: string): Promise<string> {
    const instance = this.instances.get(sessionId);
    if (!instance) throw new Error(`Session ${sessionId} not found`);

    return instance.page.url();
  }

  getPage(sessionId: string): Page | undefined {
    return this.instances.get(sessionId)?.page;
  }

  isPaused(sessionId: string): boolean {
    return this.instances.get(sessionId)?.isPaused ?? false;
  }

  async closeBrowser(sessionId: string): Promise<void> {
    const instance = this.instances.get(sessionId);
    if (instance) {
      instance.shouldStop = true;
      
      try {
        await instance.browser.close();
        console.log(`[PuppeteerController] Browser closed for session ${sessionId}`);
      } catch (error) {
        console.error(`[PuppeteerController] Error closing browser: ${error}`);
      }

      this.instances.delete(sessionId);
      this.emit('browser:closed', { sessionId });
    }
  }

  async closeAllBrowsers(): Promise<void> {
    const sessionIds = Array.from(this.instances.keys());
    await Promise.all(sessionIds.map(id => this.closeBrowser(id)));
  }
}

// Singleton instance
export const puppeteerController = new PuppeteerController();
